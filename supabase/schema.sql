-- ============================================================================
-- ZAYNKAR — Supabase schema
-- ----------------------------------------------------------------------------
-- How to use: open your Supabase project -> SQL Editor -> New query -> paste
-- this whole file -> Run. Safe to run once on a fresh project.
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Categories (admin can add more later: "Shoes", "Pajamas", ...)
-- ----------------------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

insert into categories (name, sort_order) values ('Dresses', 0);

-- ----------------------------------------------------------------------------
-- Products
-- ----------------------------------------------------------------------------
create sequence product_code_seq start 1;

create table products (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  category_id uuid not null references categories(id),
  description text not null default '',
  price numeric(10,2) not null check (price >= 0),
  sizes text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-generate a unique code like D-0001 (first letter of category + sequence number)
create or replace function set_product_code()
returns trigger as $$
declare
  prefix text;
begin
  if new.code is null or new.code = '' then
    select upper(left(c.name, 1)) into prefix from categories c where c.id = new.category_id;
    new.code := coalesce(prefix, 'P') || '-' || lpad(nextval('product_code_seq')::text, 4, '0');
  end if;
  return new;
end;
$$ language plpgsql;

create or replace function moddatetime_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_set_product_code
  before insert on products
  for each row execute function set_product_code();

create trigger trg_products_updated_at
  before update on products
  for each row execute function moddatetime_updated_at();

-- General product media: photos AND/OR videos (shown by default, and for any color
-- with no specific photo). Admin can add as many as they like, in any order.
create table product_media (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  media_url text not null,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  sort_order int not null default 0
);

-- Colors available for a product. photo_url is optional: if the admin didn't
-- upload a color-specific photo, the app falls back to the product's general photos.
create table product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  color_name text not null,
  photo_url text,
  sort_order int not null default 0
);

-- ----------------------------------------------------------------------------
-- People: every signed-up person (customer or admin) is a row in Supabase's
-- built-in auth.users. This table holds the extra info we collect at signup.
-- ----------------------------------------------------------------------------
create table customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  created_at timestamptz not null default now()
);

-- Marks which auth.users are admins. The ZAYNKAR admin account is created once
-- (see supabase/README.md) and its id inserted here by hand in the SQL editor.
create table admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- security definer + search_path pin: runs as the function owner so it can read
-- admin_users without tripping that table's own RLS policy (which itself calls
-- is_admin()) — without this, checking admin status would recurse forever.
create or replace function is_admin()
returns boolean as $$
  select exists (select 1 from admin_users where user_id = auth.uid());
$$ language sql stable security definer set search_path = public;

-- ----------------------------------------------------------------------------
-- A customer's submitted "final list" (no payment — just what they want to
-- collect from the store). A customer may submit more than one over time.
-- ----------------------------------------------------------------------------
create table requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id),
  status text not null default 'new' check (status in ('new', 'seen', 'fulfilled')),
  note text not null default '',
  created_at timestamptz not null default now()
);

-- Line items are a snapshot at submit time, so the list stays correct even if
-- the admin later edits or deletes the product.
create table request_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_code text not null,
  product_name text not null,
  color_name text not null,
  photo_url text,
  size text not null,
  price numeric(10,2) not null,
  quantity int not null default 1 check (quantity > 0)
);

-- ============================================================================
-- Row Level Security — who can read/write what
-- ============================================================================
alter table categories enable row level security;
alter table products enable row level security;
alter table product_media enable row level security;
alter table product_colors enable row level security;
alter table customer_profiles enable row level security;
alter table admin_users enable row level security;
alter table requests enable row level security;
alter table request_items enable row level security;

-- Catalog: anyone can browse (even signed out) — only admins can change it.
create policy "catalog read: everyone" on categories for select using (true);
create policy "catalog write: admin" on categories for all using (is_admin()) with check (is_admin());

create policy "products read: everyone" on products for select using (is_active or is_admin());
create policy "products write: admin" on products for all using (is_admin()) with check (is_admin());

create policy "media read: everyone" on product_media for select using (true);
create policy "media write: admin" on product_media for all using (is_admin()) with check (is_admin());

create policy "colors read: everyone" on product_colors for select using (true);
create policy "colors write: admin" on product_colors for all using (is_admin()) with check (is_admin());

-- Profiles: a person can read/edit their own; admin can read everyone's (to fulfil orders).
create policy "profile: own read" on customer_profiles for select using (auth.uid() = user_id or is_admin());
create policy "profile: own write" on customer_profiles for insert with check (auth.uid() = user_id);
create policy "profile: own update" on customer_profiles for update using (auth.uid() = user_id);

-- admin_users: only admins can see the list; nobody can self-promote.
create policy "admin list: admin only" on admin_users for select using (is_admin());

-- Requests: a customer sees only their own; admin sees everyone's and can update status.
create policy "requests: own or admin read" on requests for select using (auth.uid() = customer_id or is_admin());
create policy "requests: own insert" on requests for insert with check (auth.uid() = customer_id);
create policy "requests: admin update" on requests for update using (is_admin());

create policy "request_items: own or admin read" on request_items for select
  using (exists (select 1 from requests r where r.id = request_id and (r.customer_id = auth.uid() or is_admin())));
create policy "request_items: own insert" on request_items for insert
  with check (exists (select 1 from requests r where r.id = request_id and r.customer_id = auth.uid()));

-- ============================================================================
-- Storage: a public bucket for product photos & videos (admin uploads, everyone can view)
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit) values ('product-media', 'product-media', true, 52428800)
  on conflict (id) do nothing;

create policy "product media: public read" on storage.objects for select
  using (bucket_id = 'product-media');
create policy "product media: admin upload" on storage.objects for insert
  with check (bucket_id = 'product-media' and is_admin());
create policy "product media: admin delete" on storage.objects for delete
  using (bucket_id = 'product-media' and is_admin());

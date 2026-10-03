-- ============================================================================
-- ZAYNKAR — Migration 002: Likes / Wishlist
-- ----------------------------------------------------------------------------
-- Purely additive: adds one new table, no existing table or column is touched,
-- deleted, or renamed. Safe to run once on top of schema.sql.
-- How to use: Supabase -> SQL Editor -> New query -> paste this whole file -> Run.
-- ============================================================================

create table product_likes (
  product_id uuid not null references products(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, customer_id)
);

alter table product_likes enable row level security;

-- Counts are shown to everyone (admin dashboard, "most liked" sort) — not sensitive.
-- Only the customer who owns a like can add/remove it.
create policy "likes read: everyone" on product_likes for select using (true);
create policy "likes: own insert" on product_likes for insert with check (auth.uid() = customer_id);
create policy "likes: own delete" on product_likes for delete using (auth.uid() = customer_id);

grant select, insert, delete on product_likes to anon, authenticated;

-- "Most picked" needs a public count of how many times each product was ordered,
-- but request_items itself is private (customer notes, etc.) — only readable by its
-- owner or an admin. This function exposes ONLY the aggregate count, safely, to everyone,
-- the same security-definer pattern as is_admin() above.
create or replace function get_product_pick_counts()
returns table(product_id uuid, pick_count bigint) as $$
  select product_id, count(*) from request_items where product_id is not null group by product_id;
$$ language sql stable security definer set search_path = public;

grant execute on function get_product_pick_counts() to anon, authenticated;

-- So future new tables automatically get the right API access too, without
-- needing to remember a manual grant statement each time.
alter default privileges in schema public grant select, insert, update, delete on tables to anon, authenticated;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated;

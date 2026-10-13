-- "Your dress for someone else" — customers can submit a used dress of their own for sale.
-- Nothing a customer submits is ever shown anywhere until the admin reviews and approves it
-- (at which point the admin creates the real product from it, same as any other product).
-- Purely additive: one new table, one new storage bucket, one new column, nothing existing
-- is touched or changes meaning.

-- Marks whichever single category is "فستانك لغيرك" so the storefront knows where to show the
-- "sell your own dress" banner, without hard-coding a name/id anywhere.
alter table categories add column if not exists is_resale boolean not null default false;

insert into storage.buckets (id, name, public, file_size_limit) values ('resale-submissions', 'resale-submissions', true, 8388608)
on conflict (id) do nothing;

create policy "resale photos: public read" on storage.objects for select
  using (bucket_id = 'resale-submissions');
create policy "resale photos: anyone can submit" on storage.objects for insert
  with check (bucket_id = 'resale-submissions');
create policy "resale photos: admin delete" on storage.objects for delete
  using (bucket_id = 'resale-submissions' and is_admin());

create table resale_submissions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id) on delete set null,
  seller_name text not null,
  seller_phone text,
  seller_instagram text,
  seller_city text,
  dress_name text not null,
  description text,
  price numeric not null,
  size text,
  photo_urls text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  product_id uuid references products(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table resale_submissions enable row level security;

-- Anyone (signed in or a guest) can submit — the admin is the only one who can ever read the
-- queue back, so a submission's seller phone/Instagram/city never becomes visible to other
-- customers before (or after) it's reviewed.
create policy "resale submissions: anyone can submit" on resale_submissions for insert with check (true);
create policy "resale submissions: admin read" on resale_submissions for select using (is_admin());
create policy "resale submissions: admin update" on resale_submissions for update using (is_admin()) with check (is_admin());
create policy "resale submissions: admin delete" on resale_submissions for delete using (is_admin());

grant insert on resale_submissions to anon, authenticated;
grant select, update, delete on resale_submissions to authenticated;

-- Lets a visitor like a product without creating an account — a guest gets a random id
-- (stored in their browser only) used instead of a customer_id. Existing likes by signed-in
-- customers are completely untouched; this only adds a second way to like something.

alter table product_likes drop constraint product_likes_pkey;
alter table product_likes add column if not exists id uuid not null default gen_random_uuid();
alter table product_likes add primary key (id);

alter table product_likes alter column customer_id drop not null;
alter table product_likes add column if not exists guest_id text;

-- Exactly one of customer_id/guest_id must be set — never both, never neither.
alter table product_likes add constraint product_likes_one_owner
  check ((customer_id is not null) <> (guest_id is not null));

-- A signed-in customer can only like a product once; a guest (by their own browser-generated id)
-- can only like a product once — replaces the old (product_id, customer_id) primary key's job.
create unique index if not exists product_likes_customer_unique on product_likes(product_id, customer_id) where customer_id is not null;
create unique index if not exists product_likes_guest_unique on product_likes(product_id, guest_id) where guest_id is not null;

drop policy if exists "likes: own insert" on product_likes;
drop policy if exists "likes: own delete" on product_likes;

create policy "likes: own insert" on product_likes for insert
  with check ((customer_id is null and guest_id is not null) or auth.uid() = customer_id);
create policy "likes: own delete" on product_likes for delete
  using ((customer_id is null and guest_id is not null) or auth.uid() = customer_id);

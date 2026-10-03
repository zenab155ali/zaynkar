-- Order-stage tracking, admin -> customer messages per order, and guest checkout.
-- Additive only: no existing table, column, or row is dropped or renamed.
-- The only constraint change is loosening requests.customer_id from NOT NULL to nullable,
-- so a guest (no account) can submit an order using name/country/phone instead.

alter table requests add column if not exists stage text not null default 'products_selected'
  check (stage in ('products_selected', 'confirmed', 'shipped', 'arrived_country', 'at_delivery_company', 'delivered'));

alter table requests alter column customer_id drop not null;

alter table requests add column if not exists guest_full_name text;
alter table requests add column if not exists guest_country text;
alter table requests add column if not exists guest_phone text;
alter table requests add column if not exists guest_instagram text;

alter table requests drop constraint if exists requests_customer_or_guest_check;
alter table requests add constraint requests_customer_or_guest_check
  check (customer_id is not null or (guest_full_name is not null and guest_country is not null and guest_phone is not null));

-- Replace the two policies that assumed customer_id was always set, so guest (anon) submissions work too.
drop policy if exists "requests: own insert" on requests;
create policy "requests: own or guest insert" on requests for insert
  with check (
    (auth.uid() is not null and auth.uid() = customer_id)
    or (customer_id is null and guest_full_name is not null and guest_country is not null and guest_phone is not null)
  );

drop policy if exists "requests: own or admin read" on requests;
create policy "requests: own or admin read" on requests for select
  using ((customer_id is not null and auth.uid() = customer_id) or is_admin());

drop policy if exists "request_items: own insert" on request_items;
create policy "request_items: own or guest insert" on request_items for insert
  with check (exists (select 1 from requests r where r.id = request_id and (r.customer_id = auth.uid() or r.customer_id is null)));

-- Admin -> customer messages, one thread per order.
create table if not exists request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references requests(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
alter table request_messages enable row level security;

drop policy if exists "request_messages: own or admin read" on request_messages;
create policy "request_messages: own or admin read" on request_messages for select
  using (exists (select 1 from requests r where r.id = request_id and ((r.customer_id is not null and r.customer_id = auth.uid()) or is_admin())));

drop policy if exists "request_messages: admin insert" on request_messages;
create policy "request_messages: admin insert" on request_messages for insert with check (is_admin());

grant select, insert on request_messages to anon, authenticated;

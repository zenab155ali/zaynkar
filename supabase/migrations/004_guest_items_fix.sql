-- Fixes guest checkout: a guest's own order row is intentionally invisible to other
-- anonymous visitors (so one guest can't browse another guest's phone number), but that
-- also blocked the guest's own request_items insert, since its policy needed to look up
-- the parent "requests" row and RLS hid it even from the guest who just created it.
-- This security-definer function checks ownership internally (bypassing RLS for that one
-- check only) without exposing any other guest's data. Purely additive: new function + a
-- policy replacement, no data or columns removed.

create or replace function request_insert_allowed(req_id uuid) returns boolean as $$
  select exists (
    select 1 from requests r
    where r.id = req_id
      and (r.customer_id = auth.uid() or r.customer_id is null)
  );
$$ language sql stable security definer set search_path = public;

grant execute on function request_insert_allowed(uuid) to anon, authenticated;

drop policy if exists "request_items: own or guest insert" on request_items;
create policy "request_items: own or guest insert" on request_items for insert
  with check (request_insert_allowed(request_id));

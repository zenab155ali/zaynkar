-- Lets a guest (no account) read back the order_number of the request they just
-- created. Guest rows are intentionally invisible via a normal SELECT (so one guest
-- can't browse another guest's phone number) — this function exposes only the single,
-- non-sensitive order_number field for a given request id, the same narrow
-- security-definer pattern used by request_insert_allowed() and get_product_pick_counts().
-- A request id is a random UUID, not guessable, so this doesn't expose anything.
-- Purely additive: one new function, nothing existing is touched.

create or replace function get_order_number(req_id uuid) returns text as $$
  select order_number from requests where id = req_id;
$$ language sql stable security definer set search_path = public;

grant execute on function get_order_number(uuid) to anon, authenticated;

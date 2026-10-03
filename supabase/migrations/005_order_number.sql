-- Gives every order a short, human-friendly reference number (like "ORD-00001")
-- instead of only the long internal id, so it's easy to say/write/search in
-- conversation with a customer. Purely additive: new sequence + new column +
-- a trigger that fills it in automatically, plus a one-time backfill for any
-- existing orders that don't have one yet. Nothing existing is touched.

create sequence if not exists order_number_seq start 1;

alter table requests add column if not exists order_number text;

create or replace function set_order_number()
returns trigger as $$
begin
  if new.order_number is null then
    new.order_number := 'ORD-' || lpad(nextval('order_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_order_number on requests;
create trigger trg_set_order_number
  before insert on requests
  for each row execute function set_order_number();

-- Backfill any orders created before this migration, numbered by creation time.
with numbered as (
  select id, row_number() over (order by created_at) as rn
  from requests
  where order_number is null
)
update requests r
set order_number = 'ORD-' || lpad(numbered.rn::text, 5, '0')
from numbered
where r.id = numbered.id;

alter table requests alter column order_number set not null;
create unique index if not exists requests_order_number_idx on requests(order_number);

grant usage, select on sequence order_number_seq to anon, authenticated;

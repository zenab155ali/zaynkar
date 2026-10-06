insert into categories (name, sort_order)
select v.name, (select coalesce(max(sort_order), -1) from categories) + row_number() over ()
from (values
  ('فساتين للمناسبات بتصميم خاص'),
  ('بلايز'),
  ('بجامات'),
  ('حقائب')
) as v(name);

-- The backfill in 005 assigned order numbers directly (ORD-00001, ORD-00002, ...)
-- without ever calling nextval() on order_number_seq, so the sequence was still
-- sitting at its starting point. The next new order then got ORD-00001 again and
-- collided with the unique index. This advances the sequence past whatever the
-- backfill already used, so new orders get fresh numbers going forward.

select setval('order_number_seq', (select coalesce(max(substring(order_number from 5)::int), 0) from requests));

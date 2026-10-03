-- Removes fake/test orders and accounts created while testing the new features.
-- Scoped tightly: only auto-generated @example.com test emails and the exact
-- fake guest names/phone numbers used during testing. Real customers (like
-- "زينب") and real guest orders are not matched by any of these patterns.

delete from requests
where customer_id in (
  select u.id from auth.users u
  left join customer_profiles cp on cp.user_id = u.id
  where u.email like 'test-%@example.com'
     or u.email like 'debug-%@example.com'
     or cp.full_name like 'عميلة تجريبية%'
     or cp.full_name like 'عميلة تتبع%'
     or cp.full_name like 'عميلة رقم طلب%'
     or cp.full_name like 'تحقق دخول%'
     or cp.full_name like 'ديبج%'
     or cp.full_name = 'E2E Test Customer'
)
or guest_full_name like 'زائرة تجريبية%'
or guest_full_name like 'زائرة رقم طلب%'
or guest_phone in ('0790000111', '0790000000', '0790000002', '0790000003', '0790001234');

delete from customer_profiles
where user_id in (
  select id from auth.users where email like 'test-%@example.com' or email like 'debug-%@example.com'
);

delete from auth.users
where email like 'test-%@example.com' or email like 'debug-%@example.com';

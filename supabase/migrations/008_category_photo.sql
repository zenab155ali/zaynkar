-- Lets each category have its own photo, shown as a clickable tile on the homepage
-- (e.g. Dresses, Skirts, Bags...). Purely additive: one new nullable column.

alter table categories add column if not exists photo_url text;

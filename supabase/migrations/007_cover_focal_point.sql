-- Lets the admin control which part of the cover photo shows in the product
-- grid (the thumbnail crop sometimes cut off the wrong part of the photo).
-- Purely additive: two new columns, both defaulting to dead-center (50/50)
-- so every existing product keeps behaving exactly as it did before.

alter table products add column if not exists cover_focal_x numeric not null default 50 check (cover_focal_x between 0 and 100);
alter table products add column if not exists cover_focal_y numeric not null default 50 check (cover_focal_y between 0 and 100);

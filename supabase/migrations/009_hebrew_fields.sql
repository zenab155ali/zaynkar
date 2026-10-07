-- Adds Hebrew fields alongside the existing Arabic ones, for the new language switch.
-- Purely additive: every new column is nullable, so nothing existing changes. When a
-- Hebrew field is empty, the site falls back to showing the Arabic text instead.

alter table products add column if not exists name_he text;
alter table products add column if not exists description_he text;

alter table product_colors add column if not exists color_name_he text;

alter table categories add column if not exists name_he text;

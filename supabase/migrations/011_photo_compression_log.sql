-- Records what the "Compress existing photos" admin tool changes, so a customer-facing
-- revert is possible later if ever wanted: the original (uncompressed) photo is never
-- deleted from storage, and this table remembers which row's url was switched to which
-- new (compressed) url. Purely additive: one new table, nothing existing is touched.

create table if not exists photo_compression_log (
  id uuid primary key default gen_random_uuid(),
  table_name text not null,
  row_id uuid not null,
  column_name text not null,
  old_url text not null,
  new_url text not null,
  created_at timestamptz not null default now()
);

alter table photo_compression_log enable row level security;
create policy "photo log: admin only" on photo_compression_log for all using (is_admin()) with check (is_admin());

grant select, insert, update, delete on photo_compression_log to authenticated;

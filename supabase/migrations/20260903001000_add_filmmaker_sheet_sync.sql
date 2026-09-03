alter table public.filmmaker_materials_submissions
  add column if not exists google_sheets_sync_status text not null default 'pending',
  add column if not exists google_sheets_synced_at timestamptz,
  add column if not exists google_sheets_sync_attempts integer not null default 0,
  add column if not exists google_sheets_last_error text;

alter table public.filmmaker_materials_submissions
  drop constraint if exists filmmaker_materials_google_sheets_sync_status_check;

alter table public.filmmaker_materials_submissions
  add constraint filmmaker_materials_google_sheets_sync_status_check
  check (google_sheets_sync_status in ('pending', 'synced', 'failed'));

create index if not exists filmmaker_materials_sheet_sync_queue_idx
  on public.filmmaker_materials_submissions
  (google_sheets_sync_status, created_at asc);

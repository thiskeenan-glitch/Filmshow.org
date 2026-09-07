create table if not exists public.ticket_giveaway_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  idempotency_key uuid not null unique,
  name text not null check (char_length(name) between 1 and 120),
  email text not null check (char_length(email) between 3 and 254),
  source text not null default 'poster_qr' check (source = 'poster_qr'),
  google_sheets_sync_status text not null default 'pending'
    check (google_sheets_sync_status in ('pending', 'synced', 'failed')),
  google_sheets_synced_at timestamptz,
  google_sheets_sync_attempts integer not null default 0,
  google_sheets_last_error text
);

alter table public.ticket_giveaway_entries
  add column if not exists google_sheets_sync_status text not null default 'pending',
  add column if not exists google_sheets_synced_at timestamptz,
  add column if not exists google_sheets_sync_attempts integer not null default 0,
  add column if not exists google_sheets_last_error text;

alter table public.ticket_giveaway_entries
  drop constraint if exists ticket_giveaway_entries_google_sheets_sync_status_check;

alter table public.ticket_giveaway_entries
  add constraint ticket_giveaway_entries_google_sheets_sync_status_check
  check (google_sheets_sync_status in ('pending', 'synced', 'failed'));

alter table public.ticket_giveaway_entries enable row level security;

revoke all on table public.ticket_giveaway_entries from anon, authenticated;
grant select, insert, update, delete on table public.ticket_giveaway_entries to service_role;

create index if not exists ticket_giveaway_entries_created_at_idx
  on public.ticket_giveaway_entries (created_at desc);

create index if not exists ticket_giveaway_entries_email_idx
  on public.ticket_giveaway_entries (lower(email));

create index if not exists ticket_giveaway_entries_sheet_sync_queue_idx
  on public.ticket_giveaway_entries (google_sheets_sync_status, created_at asc);

create extension if not exists pgcrypto;

create table if not exists public.audience_contacts (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 3 and 254),
  email_normalized text not null unique,
  name text,
  marketing_status text not null default 'not_subscribed'
    check (marketing_status in ('not_subscribed', 'subscribed', 'unsubscribed')),
  marketing_consent_at timestamptz,
  marketing_consent_source text,
  marketing_provider text not null default 'brevo',
  marketing_provider_contact_id text,
  marketing_sync_status text not null default 'not_applicable'
    check (marketing_sync_status in ('not_applicable', 'pending', 'synced', 'failed')),
  marketing_synced_at timestamptz,
  marketing_last_error text,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint audience_contacts_email_normalized_check
    check (email_normalized = lower(btrim(email)))
);

create table if not exists public.audience_contact_tags (
  contact_id uuid not null references public.audience_contacts(id) on delete cascade,
  tag text not null check (char_length(tag) between 1 and 80),
  created_at timestamptz not null default now(),
  primary key (contact_id, tag)
);

create table if not exists public.audience_events (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.audience_contacts(id) on delete cascade,
  event_type text not null check (char_length(event_type) between 1 and 100),
  source text not null check (char_length(source) between 1 and 100),
  source_record_id text,
  campaign text,
  occurred_at timestamptz not null default now(),
  dedupe_key text unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.ticket_giveaway_entries
  add column if not exists marketing_opt_in boolean not null default false,
  add column if not exists marketing_opt_in_at timestamptz;

create or replace function public.set_audience_contact_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_audience_contact_updated_at on public.audience_contacts;
create trigger set_audience_contact_updated_at
before update on public.audience_contacts
for each row execute function public.set_audience_contact_updated_at();

alter table public.audience_contacts enable row level security;
alter table public.audience_contact_tags enable row level security;
alter table public.audience_events enable row level security;

revoke all on table public.audience_contacts from anon, authenticated;
revoke all on table public.audience_contact_tags from anon, authenticated;
revoke all on table public.audience_events from anon, authenticated;
grant select, insert, update, delete on table public.audience_contacts to service_role;
grant select, insert, update, delete on table public.audience_contact_tags to service_role;
grant select, insert, update, delete on table public.audience_events to service_role;

create index if not exists audience_contacts_last_seen_idx
  on public.audience_contacts (last_seen_at desc);
create index if not exists audience_contacts_marketing_status_idx
  on public.audience_contacts (marketing_status, last_seen_at desc);
create index if not exists audience_contact_tags_tag_idx
  on public.audience_contact_tags (tag, contact_id);
create index if not exists audience_events_contact_occurred_idx
  on public.audience_events (contact_id, occurred_at desc);
create index if not exists audience_events_source_occurred_idx
  on public.audience_events (source, occurred_at desc);

insert into public.audience_contacts (
  email, email_normalized, name, marketing_status, first_seen_at, last_seen_at, metadata
)
select
  btrim(email), lower(btrim(email)), nullif(btrim(director_names), ''),
  'not_subscribed', created_at, created_at,
  jsonb_build_object('backfilled_from', 'filmmaker_materials_submissions')
from public.filmmaker_materials_submissions
where nullif(btrim(email), '') is not null
on conflict (email_normalized) do update set
  name = coalesce(public.audience_contacts.name, excluded.name),
  first_seen_at = least(public.audience_contacts.first_seen_at, excluded.first_seen_at),
  last_seen_at = greatest(public.audience_contacts.last_seen_at, excluded.last_seen_at),
  metadata = public.audience_contacts.metadata || excluded.metadata;

insert into public.audience_contacts (
  email, email_normalized, name, marketing_status, first_seen_at, last_seen_at, metadata
)
select
  btrim(email), lower(btrim(email)), nullif(btrim(name), ''),
  'not_subscribed', created_at, created_at,
  jsonb_build_object('backfilled_from', 'ticket_giveaway_entries')
from public.ticket_giveaway_entries
where nullif(btrim(email), '') is not null
on conflict (email_normalized) do update set
  name = coalesce(public.audience_contacts.name, excluded.name),
  first_seen_at = least(public.audience_contacts.first_seen_at, excluded.first_seen_at),
  last_seen_at = greatest(public.audience_contacts.last_seen_at, excluded.last_seen_at),
  metadata = public.audience_contacts.metadata || excluded.metadata;

insert into public.audience_contact_tags (contact_id, tag)
select c.id, tags.tag
from public.filmmaker_materials_submissions f
join public.audience_contacts c on c.email_normalized = lower(btrim(f.email))
cross join lateral (values ('filmmaker'), ('selected_filmmaker'), ('filmshow_vol_1')) tags(tag)
on conflict do nothing;

insert into public.audience_contact_tags (contact_id, tag)
select c.id, tags.tag
from public.ticket_giveaway_entries g
join public.audience_contacts c on c.email_normalized = lower(btrim(g.email))
cross join lateral (values ('giveaway'), ('filmshow_vol_1')) tags(tag)
on conflict do nothing;

insert into public.audience_events (
  contact_id, event_type, source, source_record_id, occurred_at, dedupe_key, metadata
)
select
  c.id, 'filmmaker_materials_submitted', 'filmmaker_materials_form', f.id::text,
  f.created_at, 'filmmaker-materials:' || f.id::text,
  jsonb_build_object('film_title', f.film_title, 'attendance', f.attendance)
from public.filmmaker_materials_submissions f
join public.audience_contacts c on c.email_normalized = lower(btrim(f.email))
on conflict (dedupe_key) do nothing;

insert into public.audience_events (
  contact_id, event_type, source, source_record_id, occurred_at, dedupe_key, metadata
)
select
  c.id, 'ticket_giveaway_entered', 'ticket_giveaway', g.id::text,
  g.created_at, 'ticket-giveaway:' || g.id::text,
  jsonb_build_object('heard_about_us', g.heard_about_us)
from public.ticket_giveaway_entries g
join public.audience_contacts c on c.email_normalized = lower(btrim(g.email))
on conflict (dedupe_key) do nothing;

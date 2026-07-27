create extension if not exists pgcrypto;

create table if not exists public.originals_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  full_name text not null,
  email text not null,
  film_title text not null,
  premise text not null,
  production_approach text not null,
  previous_work_url text not null,
  website_or_instagram text,
  pitch_file_path text,
  status text not null default 'draft'
    check (status in ('draft', 'payment_pending', 'paid', 'payment_failed', 'withdrawn')),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount_paid integer,
  currency text,
  paid_at timestamptz,
  terms_accepted boolean not null default false,
  terms_version text not null,
  notification_email_sent_at timestamptz,
  confirmation_email_sent_at timestamptz,
  email_error text,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.originals_submissions enable row level security;

alter table public.originals_submissions
  add column if not exists confirmation_email_sent_at timestamptz;

create index if not exists originals_submissions_status_idx
  on public.originals_submissions (status);

create index if not exists originals_submissions_created_at_idx
  on public.originals_submissions (created_at desc);

create index if not exists originals_submissions_email_idx
  on public.originals_submissions (email);

create or replace function public.set_originals_submissions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_originals_submissions_updated_at
  on public.originals_submissions;

create trigger set_originals_submissions_updated_at
before update on public.originals_submissions
for each row
execute function public.set_originals_submissions_updated_at();

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'filmshow-originals-pitches',
  'filmshow-originals-pitches',
  false,
  10485760,
  array['application/pdf']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

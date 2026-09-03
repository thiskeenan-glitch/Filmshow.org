create extension if not exists pgcrypto;

create table if not exists public.filmmaker_materials_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  idempotency_key uuid not null unique,
  film_title text not null,
  director_names text not null,
  email text not null,
  runtime text not null,
  synopsis text not null,
  master_link text not null,
  subtitle_status text not null
    check (subtitle_status in ('no_subtitles', 'burned_in_master', 'separate_subtitle_file')),
  subtitle_link text,
  materials_link text not null,
  social_handles text not null,
  attendance text not null
    check (attendance in ('hell_yes', 'no', 'trying_to_figure_it_out')),
  additional_attendees text,
  filmmaker_video_url text,
  show_day_contact text not null,
  notes text,
  metadata jsonb not null default '{"event":"Filmshow Vol. 1","event_date":"2026-10-03","venue":"Rollin Studios","city":"Brooklyn"}'::jsonb
);

alter table public.filmmaker_materials_submissions enable row level security;

create index if not exists filmmaker_materials_created_at_idx
  on public.filmmaker_materials_submissions (created_at desc);

create index if not exists filmmaker_materials_email_idx
  on public.filmmaker_materials_submissions (email);

create index if not exists filmmaker_materials_film_title_idx
  on public.filmmaker_materials_submissions (film_title);

create or replace function public.set_filmmaker_materials_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_filmmaker_materials_updated_at
  on public.filmmaker_materials_submissions;

create trigger set_filmmaker_materials_updated_at
before update on public.filmmaker_materials_submissions
for each row
execute function public.set_filmmaker_materials_updated_at();

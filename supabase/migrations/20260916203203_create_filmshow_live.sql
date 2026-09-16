create extension if not exists pgcrypto;

alter table public.audience_contacts
  add column if not exists auth_user_id uuid unique references auth.users(id) on delete set null;

create table public.live_events (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null,
  subtitle text not null,
  venue text,
  city text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  entitlement_key text not null unique,
  price_cents integer not null default 800 check (price_cents >= 0),
  currency text not null default 'usd' check (currency ~ '^[a-z]{3}$'),
  is_enabled boolean not null default false,
  ticket_sales_enabled boolean not null default false,
  stream_provider text not null default 'none'
    check (stream_provider in ('none', 'hls', 'mux')),
  stream_config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.live_program_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.live_events(id) on delete cascade,
  title text not null,
  item_type text not null default 'film'
    check (item_type in ('stage', 'film', 'intermission', 'voting', 'other')),
  sort_order integer not null,
  vote_eligible boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, id),
  unique (event_id, sort_order),
  unique (event_id, title)
);

create table public.live_event_state (
  event_id uuid primary key references public.live_events(id) on delete cascade,
  status text not null default 'preshow'
    check (status in ('preshow', 'live', 'voting', 'results', 'ended')),
  current_program_item_id uuid,
  voting_is_open boolean not null default false,
  voting_opened_at timestamptz,
  voting_closed_at timestamptz,
  results_revealed boolean not null default false,
  winner_program_item_id uuid,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  foreign key (event_id, current_program_item_id)
    references public.live_program_items(event_id, id)
    on delete set null (current_program_item_id),
  foreign key (event_id, winner_program_item_id)
    references public.live_program_items(event_id, id)
    on delete set null (winner_program_item_id)
);

create table public.live_entitlements (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.live_events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  email_normalized text not null check (email_normalized = lower(btrim(email_normalized))),
  source text not null check (source in ('stripe', 'comp', 'other')),
  status text not null default 'active' check (status in ('active', 'revoked', 'refunded')),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  amount_paid integer,
  currency text,
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, email_normalized)
);

create unique index live_entitlements_event_user_unique
  on public.live_entitlements (event_id, user_id)
  where user_id is not null;

create table public.live_online_votes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.live_events(id) on delete cascade,
  program_item_id uuid not null,
  user_id uuid not null references auth.users(id) on delete restrict,
  source text not null default 'online' check (source = 'online'),
  cast_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (event_id, user_id),
  foreign key (event_id, program_item_id)
    references public.live_program_items(event_id, id) on delete restrict
);

create index live_program_items_event_order_idx
  on public.live_program_items (event_id, sort_order);
create index live_entitlements_event_status_idx
  on public.live_entitlements (event_id, status, source);
create index live_entitlements_email_idx
  on public.live_entitlements (email_normalized);
create index live_online_votes_event_item_idx
  on public.live_online_votes (event_id, program_item_id);

create or replace function public.set_live_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_live_events_updated_at
before update on public.live_events
for each row execute function public.set_live_updated_at();
create trigger set_live_program_items_updated_at
before update on public.live_program_items
for each row execute function public.set_live_updated_at();
create trigger set_live_event_state_updated_at
before update on public.live_event_state
for each row execute function public.set_live_updated_at();
create trigger set_live_entitlements_updated_at
before update on public.live_entitlements
for each row execute function public.set_live_updated_at();

alter table public.live_events enable row level security;
alter table public.live_program_items enable row level security;
alter table public.live_event_state enable row level security;
alter table public.live_entitlements enable row level security;
alter table public.live_online_votes enable row level security;

revoke all on table public.live_events from anon, authenticated;
revoke all on table public.live_program_items from anon, authenticated;
revoke all on table public.live_event_state from anon, authenticated;
revoke all on table public.live_entitlements from anon, authenticated;
revoke all on table public.live_online_votes from anon, authenticated;

grant select on table public.live_program_items to authenticated;
grant select on table public.live_event_state to authenticated;
grant select on table public.live_entitlements to authenticated;
grant select, insert on table public.live_online_votes to authenticated;
grant select, insert, update, delete on table public.live_events to service_role;
grant select, insert, update, delete on table public.live_program_items to service_role;
grant select, insert, update, delete on table public.live_event_state to service_role;
grant select, insert, update, delete on table public.live_entitlements to service_role;
grant select, insert, update, delete on table public.live_online_votes to service_role;

create policy "Entitled viewers can read program items"
on public.live_program_items for select
to authenticated
using (
  exists (
    select 1
    from public.live_entitlements e
    where e.event_id = live_program_items.event_id
      and e.status = 'active'
      and (
        e.user_id = (select auth.uid())
        or e.email_normalized = lower(coalesce((select auth.jwt() ->> 'email'), ''))
      )
  )
);

create policy "Entitled viewers can read event state"
on public.live_event_state for select
to authenticated
using (
  exists (
    select 1
    from public.live_entitlements e
    where e.event_id = live_event_state.event_id
      and e.status = 'active'
      and (
        e.user_id = (select auth.uid())
        or e.email_normalized = lower(coalesce((select auth.jwt() ->> 'email'), ''))
      )
  )
);

create policy "Viewers can read their own entitlements"
on public.live_entitlements for select
to authenticated
using (
  user_id = (select auth.uid())
  or email_normalized = lower(coalesce((select auth.jwt() ->> 'email'), ''))
);

create policy "Viewers can read their own vote"
on public.live_online_votes for select
to authenticated
using (user_id = (select auth.uid()));

create policy "Entitled viewers can cast one valid vote"
on public.live_online_votes for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and source = 'online'
  and exists (
    select 1
    from public.live_entitlements e
    where e.event_id = live_online_votes.event_id
      and e.status = 'active'
      and (
        e.user_id = (select auth.uid())
        or e.email_normalized = lower(coalesce((select auth.jwt() ->> 'email'), ''))
      )
  )
  and exists (
    select 1
    from public.live_event_state s
    where s.event_id = live_online_votes.event_id
      and s.status = 'voting'
      and s.voting_is_open
  )
  and exists (
    select 1
    from public.live_program_items p
    where p.id = live_online_votes.program_item_id
      and p.event_id = live_online_votes.event_id
      and p.vote_eligible
  )
);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'live_event_state'
  ) then
    alter publication supabase_realtime add table public.live_event_state;
  end if;
end $$;

with inserted_event as (
  insert into public.live_events (
    slug, title, subtitle, venue, city, starts_at, ends_at,
    entitlement_key, price_cents, currency, is_enabled, ticket_sales_enabled
  ) values (
    'vol-1', 'FILMSHOW VOL. 1', 'LIVE FROM BROOKLYN', 'Rollin Studios',
    'Brooklyn', '2026-10-03 19:00:00-04', '2026-10-03 23:00:00-04',
    'filmshow_vol_1_live', 800, 'usd', false, false
  )
  returning id
), inserted_items as (
  insert into public.live_program_items (event_id, title, item_type, sort_order, vote_eligible)
  select inserted_event.id, item.title, item.item_type, item.sort_order, item.vote_eligible
  from inserted_event
  cross join (values
    ('Stage', 'stage', 10, false),
    ('Guzzle Buddies', 'film', 20, true),
    ('Vultures', 'film', 30, true),
    ('Intimité', 'film', 40, true),
    ('Violet and Marlow', 'film', 50, true),
    ('Intermission', 'intermission', 60, false),
    ('Voting', 'voting', 70, false)
  ) as item(title, item_type, sort_order, vote_eligible)
  returning event_id, id, title
)
insert into public.live_event_state (event_id, status, current_program_item_id)
select event_id, 'preshow', id
from inserted_items
where title = 'Stage';

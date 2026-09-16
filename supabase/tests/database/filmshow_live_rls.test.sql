begin;

create extension if not exists pgtap with schema extensions;
select plan(14);

select has_table('public', 'live_events', 'live events table exists');
select has_table('public', 'live_program_items', 'live program table exists');
select has_table('public', 'live_event_state', 'live state table exists');
select has_table('public', 'live_entitlements', 'live entitlements table exists');
select has_table('public', 'live_online_votes', 'live online votes table exists');

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'viewer-one@example.com'),
  ('22222222-2222-4222-8222-222222222222', 'viewer-two@example.com');

insert into public.live_entitlements (
  event_id, user_id, email_normalized, source, status
)
select id, '11111111-1111-4111-8111-111111111111', 'viewer-one@example.com', 'comp', 'active'
from public.live_events where slug = 'vol-1';

set local role anon;
select throws_ok(
  $$select * from public.live_program_items$$,
  '42501',
  'permission denied for table live_program_items',
  'signed-out visitors cannot read the program'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","email":"viewer-one@example.com","role":"authenticated"}',
  true
);

select ok(
  (select count(*) > 0 from public.live_program_items),
  'entitled viewer can read the program'
);

select throws_ok(
  $$
    insert into public.live_online_votes (event_id, program_item_id, user_id)
    select e.id, p.id, '11111111-1111-4111-8111-111111111111'
    from public.live_events e
    join public.live_program_items p on p.event_id = e.id and p.vote_eligible
    where e.slug = 'vol-1'
    limit 1
  $$,
  '42501',
  'new row violates row-level security policy for table "live_online_votes"',
  'vote is rejected while voting is closed'
);

reset role;
update public.live_event_state
set status = 'voting', voting_is_open = true
where event_id = (select id from public.live_events where slug = 'vol-1');

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"11111111-1111-4111-8111-111111111111","email":"viewer-one@example.com","role":"authenticated"}',
  true
);

select lives_ok(
  $$
    insert into public.live_online_votes (event_id, program_item_id, user_id)
    select e.id, p.id, '11111111-1111-4111-8111-111111111111'
    from public.live_events e
    join public.live_program_items p on p.event_id = e.id and p.vote_eligible
    where e.slug = 'vol-1'
    order by p.sort_order
    limit 1
  $$,
  'entitled viewer can cast one eligible vote while voting is open'
);

select throws_ok(
  $$
    insert into public.live_online_votes (event_id, program_item_id, user_id)
    select e.id, p.id, '11111111-1111-4111-8111-111111111111'
    from public.live_events e
    join public.live_program_items p on p.event_id = e.id and p.vote_eligible
    where e.slug = 'vol-1'
    order by p.sort_order desc
    limit 1
  $$,
  '23505',
  'duplicate key value violates unique constraint "live_online_votes_event_id_user_id_key"',
  'database uniqueness prevents a second vote'
);

reset role;
insert into public.live_entitlements (
  event_id, user_id, email_normalized, source, status
)
select id, '22222222-2222-4222-8222-222222222222', 'viewer-two@example.com', 'comp', 'active'
from public.live_events where slug = 'vol-1';

set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"22222222-2222-4222-8222-222222222222","email":"viewer-two@example.com","role":"authenticated"}',
  true
);

select throws_ok(
  $$
    insert into public.live_online_votes (event_id, program_item_id, user_id)
    select e.id, p.id, '22222222-2222-4222-8222-222222222222'
    from public.live_events e
    join public.live_program_items p on p.event_id = e.id and not p.vote_eligible
    where e.slug = 'vol-1'
    order by p.sort_order
    limit 1
  $$,
  '42501',
  'new row violates row-level security policy for table "live_online_votes"',
  'viewer cannot vote for an ineligible program item'
);

select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);
select set_config(
  'request.jwt.claims',
  '{"sub":"33333333-3333-4333-8333-333333333333","email":"no-access@example.com","role":"authenticated"}',
  true
);
select is(
  (select count(*) from public.live_program_items),
  0::bigint,
  'viewer without an entitlement cannot read the program'
);

select is(
  (select count(*) from public.live_event_state),
  0::bigint,
  'viewer without an entitlement cannot read event state'
);

select is(
  (select count(*) from public.live_entitlements),
  0::bigint,
  'viewer cannot read another viewer entitlement'
);

select * from finish();
rollback;

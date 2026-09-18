create or replace function public.backfill_luma_audience(p_entries jsonb)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  r record;
  v_contact_id uuid;
  v_count integer := 0;
begin
  if jsonb_typeof(p_entries) <> 'array' then
    raise exception 'p_entries must be a JSON array';
  end if;

  for r in
    select *
    from jsonb_to_recordset(p_entries) as x(
      email text,
      name text,
      guest_id text,
      registered_at timestamptz,
      checked_in_at timestamptz,
      utm_source text,
      ticket_count integer,
      ticket_names jsonb
    )
  loop
    if nullif(btrim(r.email), '') is null or nullif(btrim(r.guest_id), '') is null then
      continue;
    end if;

    v_contact_id := public.upsert_audience_contact(
      r.email,
      r.name,
      false,
      null
    );

    update public.audience_contacts
    set
      first_seen_at = case
        when r.registered_at is null then first_seen_at
        else least(first_seen_at, r.registered_at)
      end,
      last_seen_at = greatest(last_seen_at, coalesce(r.registered_at, last_seen_at)),
      metadata = metadata || jsonb_strip_nulls(jsonb_build_object(
        'luma_guest_id', r.guest_id,
        'luma_utm_source', r.utm_source
      ))
    where id = v_contact_id;

    insert into public.audience_contact_tags (contact_id, tag)
    values
      (v_contact_id, 'luma_registrant'),
      (v_contact_id, 'ticket_holder'),
      (v_contact_id, 'filmshow_vol_1')
    on conflict do nothing;

    if r.checked_in_at is not null then
      insert into public.audience_contact_tags (contact_id, tag)
      values (v_contact_id, 'attendee')
      on conflict do nothing;
    end if;

    insert into public.audience_events (
      contact_id,
      event_type,
      source,
      source_record_id,
      campaign,
      occurred_at,
      dedupe_key,
      metadata
    ) values (
      v_contact_id,
      'ticket_registered',
      'luma',
      r.guest_id,
      'filmshow_vol_1',
      coalesce(r.registered_at, now()),
      'luma-guest:' || r.guest_id,
      jsonb_strip_nulls(jsonb_build_object(
        'utm_source', r.utm_source,
        'ticket_count', coalesce(r.ticket_count, 0),
        'ticket_names', coalesce(r.ticket_names, '[]'::jsonb),
        'checked_in_at', r.checked_in_at
      ))
    )
    on conflict (dedupe_key) do update set
      metadata = excluded.metadata,
      occurred_at = excluded.occurred_at;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.backfill_luma_audience(jsonb) from public, anon, authenticated;
grant execute on function public.backfill_luma_audience(jsonb) to service_role;

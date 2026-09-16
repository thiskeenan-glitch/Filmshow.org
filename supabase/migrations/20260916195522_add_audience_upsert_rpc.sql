create or replace function public.upsert_audience_contact(
  p_email text,
  p_name text default null,
  p_marketing_opt_in boolean default false,
  p_consent_source text default null
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_email text := lower(btrim(p_email));
  v_contact_id uuid;
begin
  if v_email is null or v_email = '' or char_length(v_email) > 254 then
    raise exception 'invalid email';
  end if;

  insert into public.audience_contacts (
    email, email_normalized, name, marketing_status, marketing_consent_at,
    marketing_consent_source, marketing_sync_status, first_seen_at, last_seen_at
  ) values (
    v_email, v_email, nullif(btrim(p_name), ''),
    case when p_marketing_opt_in then 'subscribed' else 'not_subscribed' end,
    case when p_marketing_opt_in then now() else null end,
    case when p_marketing_opt_in then nullif(btrim(p_consent_source), '') else null end,
    case when p_marketing_opt_in then 'pending' else 'not_applicable' end,
    now(), now()
  )
  on conflict (email_normalized) do update set
    email = excluded.email,
    name = coalesce(excluded.name, public.audience_contacts.name),
    marketing_status = case when p_marketing_opt_in then 'subscribed' else public.audience_contacts.marketing_status end,
    marketing_consent_at = case when p_marketing_opt_in then now() else public.audience_contacts.marketing_consent_at end,
    marketing_consent_source = case when p_marketing_opt_in then nullif(btrim(p_consent_source), '') else public.audience_contacts.marketing_consent_source end,
    marketing_sync_status = case when p_marketing_opt_in then 'pending' else public.audience_contacts.marketing_sync_status end,
    marketing_last_error = case when p_marketing_opt_in then null else public.audience_contacts.marketing_last_error end,
    last_seen_at = now()
  returning id into v_contact_id;

  return v_contact_id;
end;
$$;

revoke all on function public.upsert_audience_contact(text, text, boolean, text) from public, anon, authenticated;
grant execute on function public.upsert_audience_contact(text, text, boolean, text) to service_role;

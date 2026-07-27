alter table public.originals_submissions
  add column if not exists confirmation_email_sent_at timestamptz;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'originals_submissions'
      and column_name = 'applicant_confirmation_email_sent_at'
  ) then
    update public.originals_submissions
    set confirmation_email_sent_at = coalesce(
      confirmation_email_sent_at,
      applicant_confirmation_email_sent_at
    )
    where applicant_confirmation_email_sent_at is not null;
  end if;
end $$;

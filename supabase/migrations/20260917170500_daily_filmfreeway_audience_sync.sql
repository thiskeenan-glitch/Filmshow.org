do $$
declare
  v_job_id bigint;
begin
  select jobid
    into v_job_id
  from cron.job
  where command = 'select public.sync_filmfreeway_audience();'
  limit 1;

  if v_job_id is not null then
    perform cron.alter_job(
      job_id := v_job_id,
      schedule := '17 13 * * *'
    );
  end if;
end;
$$;

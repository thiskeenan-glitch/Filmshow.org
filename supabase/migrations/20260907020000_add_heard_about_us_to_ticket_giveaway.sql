alter table public.ticket_giveaway_entries
  add column if not exists heard_about_us text;

alter table public.ticket_giveaway_entries
  drop constraint if exists ticket_giveaway_entries_heard_about_us_check;

alter table public.ticket_giveaway_entries
  add constraint ticket_giveaway_entries_heard_about_us_check
  check (
    heard_about_us is null
    or char_length(heard_about_us) between 1 and 200
  );

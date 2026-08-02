alter table public.originals_submissions
  add column if not exists application_status text not null default 'new'
    check (
      application_status in (
        'new',
        'under_review',
        'shortlisted',
        'accepted',
        'not_accepted',
        'final_recipient'
      )
    ),
  add column if not exists internal_notes text,
  add column if not exists accepted_email_sent_at timestamptz,
  add column if not exists rejection_email_sent_at timestamptz,
  add column if not exists last_email_type text,
  add column if not exists last_email_sent_at timestamptz,
  add column if not exists application_reference text,
  add column if not exists last_reviewed_by text,
  add column if not exists last_reviewed_at timestamptz;

update public.originals_submissions
set application_reference = 'FSG-' || upper(substr(replace(id::text, '-', ''), 1, 8))
where application_reference is null;

alter table public.originals_submissions
  alter column application_reference set default (
    'FSG-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))
  );

create unique index if not exists originals_submissions_application_reference_idx
  on public.originals_submissions (application_reference);

create index if not exists originals_submissions_application_status_idx
  on public.originals_submissions (application_status);

create table if not exists public.originals_email_templates (
  id text primary key,
  subject text not null,
  body text not null,
  updated_at timestamptz not null default now(),
  updated_by text
);

alter table public.originals_email_templates enable row level security;

insert into public.originals_email_templates (id, subject, body)
values
  (
    'not_accepted',
    'An update on your Filmshow Grant application',
    'Hi {{first_name}},

Thank you for submitting "{{project_title}}" to the Filmshow Grant.

We received a strong group of applications and unfortunately won''t be moving forward with this project in the current round.

We''re grateful that you trusted us with your work, and we hope you''ll stay connected with Filmshow.

Filmshow
This is not a festival.'
  ),
  (
    'accepted',
    'Filmshow Grant - we''d like to speak with you',
    'Hi {{first_name}},

We''re excited to let you know that "{{project_title}}" has been selected to move forward in the Filmshow Grant process.

This is not yet a final funding agreement. We''d like to schedule a conversation to learn more about the project and discuss the next steps.

Please reply to this email with your availability.

Filmshow
This is not a festival.'
  ),
  (
    'confirmation',
    'We received your Filmshow Grant application',
    'Hi {{first_name}},

Your Filmshow Grant application for "{{project_title}}" has been received.

Your submission is complete, and no further action is required right now. We''ll contact you at this email address when decisions are announced.

Project title: {{project_title}}
Submission date: {{submission_date}}
Payment confirmation: {{payment_confirmation}}
Application reference: {{application_reference}}

Thank you for sharing your work with us.

Filmshow
This is not a festival.'
  )
on conflict (id) do nothing;

create table if not exists public.originals_email_logs (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid references public.originals_submissions(id) on delete cascade,
  recipient text not null,
  email_type text not null
    check (
      email_type in (
        'admin_notification',
        'confirmation',
        'acceptance',
        'not_accepted'
      )
    ),
  subject text not null,
  delivery_provider_id text,
  sent_at timestamptz not null default now(),
  delivery_status text not null default 'sent'
    check (delivery_status in ('queued', 'sent', 'failed', 'skipped')),
  error_message text,
  initiating_admin_user text,
  idempotency_key text unique,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.originals_email_logs enable row level security;

create index if not exists originals_email_logs_submission_id_idx
  on public.originals_email_logs (submission_id, sent_at desc);

create index if not exists originals_email_logs_type_idx
  on public.originals_email_logs (email_type, sent_at desc);

create table if not exists public.originals_application_activity (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.originals_submissions(id) on delete cascade,
  action text not null,
  from_status text,
  to_status text,
  notes text,
  admin_email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.originals_application_activity enable row level security;

create index if not exists originals_application_activity_submission_id_idx
  on public.originals_application_activity (submission_id, created_at desc);

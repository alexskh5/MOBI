alter table public.activities
  add column if not exists submitted_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists reviewed_by_center_admin_id uuid,
  add column if not exists review_feedback text,
  add column if not exists decline_reason text;

alter table public.activities
  drop constraint if exists activities_status_check;

alter table public.activities
  add constraint activities_status_check
  check (
    status in (
      'draft',
      'pending_review',
      'declined',
      'published',
      'archived'
    )
  );

create index if not exists idx_activities_center_review_status
  on public.activities(center_id, status, submitted_at desc)
  where archived_at is null;

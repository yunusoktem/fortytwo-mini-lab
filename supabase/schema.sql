create table if not exists public.prey_guest_memory (
  device_id uuid primary key,
  memory_summary text not null default '',
  recent_messages jsonb not null default '[]'::jsonb,
  turn_count integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.prey_guest_memory enable row level security;
revoke all on table public.prey_guest_memory from anon, authenticated;

create table if not exists public.prey_user_memory (
  user_id uuid primary key references auth.users(id) on delete cascade,
  memory_summary text not null default '',
  recent_messages jsonb not null default '[]'::jsonb,
  turn_count integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.prey_user_memory enable row level security;
revoke all on table public.prey_user_memory from anon, authenticated;

-- Server-side access only: the app validates the signed-in owner before
-- using the service-role key. Never expose that key to the browser.

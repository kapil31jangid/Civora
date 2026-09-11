create extension if not exists pgcrypto;

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  client_id text not null,
  title text not null default 'New Chat',
  mode text not null default 'auto' check (mode in ('auto', 'mobility', 'waste', 'pollution', 'spaces', 'water')),
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists conversations_client_id_idx on conversations(client_id);
create index if not exists conversations_updated_at_idx on conversations(updated_at desc);
create index if not exists messages_conversation_id_idx on messages(conversation_id);
create index if not exists messages_created_at_idx on messages(created_at);

alter table conversations enable row level security;
alter table messages enable row level security;

-- No browser policy is intentionally created. Civora accesses these tables only
-- through its backend with the service role after checking the browser client ID.

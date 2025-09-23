-- Extensions
create extension if not exists pgcrypto;
create extension if not exists vector;

-- Profiles
create table if not exists profiles (
  id uuid primary key default auth.uid(),
  email text unique,
  display_name text,
  avatar_url text,
  pronouns text,
  tz text default 'UTC',
  created_at timestamptz default now()
);

-- Pairs
create table if not exists pairs (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references profiles(id) on delete cascade,
  user_b uuid references profiles(id) on delete cascade,
  status text check (status in ('pending','active')) default 'pending',
  created_at timestamptz default now()
);

-- Pair invites (short‑lived)
create table if not exists pair_invites (
  code text primary key,
  created_by uuid not null references profiles(id) on delete cascade,
  pair_id uuid not null references pairs(id) on delete cascade,
  expires_at timestamptz not null
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references pairs(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  type text not null check (type in ('text','image','video','voice','reaction','system')),
  body jsonb,
  media_url text,
  created_at timestamptz default now(),
  edited_at timestamptz,
  deleted_at timestamptz
);
create index on messages(pair_id, created_at);

-- Message summaries
create table if not exists message_summaries (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references pairs(id) on delete cascade,
  window_start timestamptz not null,
  window_end timestamptz not null,
  summary_text text,
  created_at timestamptz default now()
);

-- Rituals & streaks
create table if not exists rituals (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references pairs(id) on delete cascade,
  pack text not null,
  due_at timestamptz not null,
  status text check (status in ('due','done','missed')) default 'due',
  responses jsonb,
  created_at timestamptz default now()
);
create table if not exists streaks (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references pairs(id) on delete cascade,
  streak_type text not null check (streak_type in ('daily_prompt','touch')),
  count int default 0,
  updated_at timestamptz default now()
);

-- Events & checklists
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references pairs(id) on delete cascade,
  kind text not null check (kind in ('anniversary','trip','visit','custom')),
  title text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  all_day boolean default false,
  meta jsonb
);
create table if not exists checklists (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references pairs(id) on delete cascade,
  title text not null,
  created_at timestamptz default now()
);
create table if not exists checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references checklists(id) on delete cascade,
  title text not null,
  done boolean default false,
  assignee uuid references profiles(id) on delete set null,
  due_at timestamptz
);

-- Goalboard (kanban)
create table if not exists goalboard (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references pairs(id) on delete cascade,
  target_date date,
  description text
);
create table if not exists goal_tasks (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references pairs(id) on delete cascade,
  status_column text not null check (status_column in ('todo','doing','done')) default 'todo',
  title text not null,
  notes text,
  due_at timestamptz
);

-- Embeddings (pgvector 1536 dims for text-embedding-3-small)
create table if not exists embeddings (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references pairs(id) on delete cascade,
  source_type text not null check (source_type in ('message','journal','note')),
  source_id uuid,
  content text not null,
  embedding vector(1536)
);
create index on embeddings using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Moderation logs
create table if not exists moderation_logs (
  id uuid primary key default gen_random_uuid(),
  pair_id uuid not null references pairs(id) on delete cascade,
  item_type text not null check (item_type in ('message','image','voice')),
  item_id uuid,
  result jsonb,
  flagged boolean default false,
  created_at timestamptz default now()
);

-- Subscriptions
create table if not exists subscriptions (
  pair_id uuid primary key references pairs(id) on delete cascade,
  plan text not null check (plan in ('free','pro')) default 'free',
  renews_on date,
  store text check (store in ('app_store','play','stripe')),
  receipt_json jsonb
);

-- Presence (last seen snapshot; realtime channel in client)
create table if not exists presence (
  pair_id uuid not null references pairs(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  state text check (state in ('awake','busy','commuting','sleeping')),
  device text,
  last_seen timestamptz default now(),
  primary key (pair_id, user_id)
);

-- RLS
alter table profiles enable row level security;
alter table pairs enable row level security;
alter table pair_invites enable row level security;
alter table messages enable row level security;
alter table message_summaries enable row level security;
alter table rituals enable row level security;
alter table streaks enable row level security;
alter table events enable row level security;
alter table checklists enable row level security;
alter table checklist_items enable row level security;
alter table goalboard enable row level security;
alter table goal_tasks enable row level security;
alter table embeddings enable row level security;
alter table moderation_logs enable row level security;
alter table subscriptions enable row level security;
alter table presence enable row level security;

-- Policies
create policy "profiles self access" on profiles
  for select using (auth.uid() = id);
create policy "profiles update self" on profiles
  for update using (auth.uid() = id);

create policy "pairs member read" on pairs
  for select using (auth.uid() in (user_a, user_b));
create policy "pairs member update" on pairs
  for update using (auth.uid() in (user_a, user_b));

create policy "invites owner read" on pair_invites
  for select using (auth.uid() = created_by);
create policy "invites owner insert" on pair_invites
  for insert with check (auth.uid() = created_by);

create policy "messages in pair" on messages
  for select using (exists (select 1 from pairs p where p.id = pair_id and auth.uid() in (p.user_a, p.user_b)));
create policy "messages insert by member" on messages
  for insert with check (exists (select 1 from pairs p where p.id = pair_id and auth.uid() in (p.user_a, p.user_b)) and sender_id = auth.uid());

create policy "summaries in pair" on message_summaries
  for select using (exists (select 1 from pairs p where p.id = pair_id and auth.uid() in (p.user_a, p.user_b)));

create policy "rituals in pair" on rituals
  for select using (exists (select 1 from pairs p where p.id = pair_id and auth.uid() in (p.user_a, p.user_b)));
create policy "streaks in pair" on streaks
  for select using (exists (select 1 from pairs p where p.id = pair_id and auth.uid() in (p.user_a, p.user_b)));

create policy "events in pair" on events
  for select using (exists (select 1 from pairs p where p.id = pair_id and auth.uid() in (p.user_a, p.user_b)));

create policy "checklists in pair" on checklists
  for select using (exists (select 1 from pairs p where p.id = pair_id and auth.uid() in (p.user_a, p.user_b)));
create policy "checklist_items in pair" on checklist_items
  for select using (exists (select 1 from checklists c join pairs p on p.id = c.pair_id where c.id = checklist_id and auth.uid() in (p.user_a, p.user_b)));

create policy "goalboard in pair" on goalboard
  for select using (exists (select 1 from pairs p where p.id = pair_id and auth.uid() in (p.user_a, p.user_b)));
create policy "goal_tasks in pair" on goal_tasks
  for select using (exists (select 1 from pairs p where p.id = pair_id and auth.uid() in (p.user_a, p.user_b)));

create policy "embeddings in pair" on embeddings
  for select using (exists (select 1 from pairs p where p.id = pair_id and auth.uid() in (p.user_a, p.user_b)));

create policy "presence in pair" on presence
  for select using (exists (select 1 from pairs p where p.id = pair_id and auth.uid() in (p.user_a, p.user_b)));

-- Storage buckets
insert into storage.buckets (id, name, public) values ('media', 'media', false);
insert into storage.buckets (id, name, public) values ('docs', 'docs', false);

-- Storage policies for media bucket
create policy "Users can view their pair's media" 
on storage.objects 
for select 
using (
  bucket_id = 'media' 
  and exists (
    select 1 from pairs p 
    where auth.uid() in (p.user_a, p.user_b)
    and (storage.foldername(name))[1] = p.id::text
  )
);

create policy "Users can upload to their pair's media folder" 
on storage.objects 
for insert 
with check (
  bucket_id = 'media' 
  and exists (
    select 1 from pairs p 
    where auth.uid() in (p.user_a, p.user_b)
    and (storage.foldername(name))[1] = p.id::text
  )
);

-- Storage policies for docs bucket
create policy "Users can view their pair's docs" 
on storage.objects 
for select 
using (
  bucket_id = 'docs' 
  and exists (
    select 1 from pairs p 
    where auth.uid() in (p.user_a, p.user_b)
    and (storage.foldername(name))[1] = p.id::text
  )
);

create policy "Users can upload to their pair's docs folder" 
on storage.objects 
for insert 
with check (
  bucket_id = 'docs' 
  and exists (
    select 1 from pairs p 
    where auth.uid() in (p.user_a, p.user_b)
    and (storage.foldername(name))[1] = p.id::text
  )
);
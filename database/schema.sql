-- Medha AI - Supabase Database Schema
-- Run this in your Supabase SQL editor

-- Create tables
create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null,
  file_path text not null,
  status text not null default 'processing' check (status in ('processing', 'ready', 'error')),
  created_at timestamptz not null default now()
);

create table if not exists flashcards (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  front text not null,
  back text not null,
  topic text not null default 'General',
  created_at timestamptz not null default now()
);

create table if not exists quizzes (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references documents(id) on delete cascade,
  question text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer int not null,
  explanation text not null default '',
  topic text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references documents(id) on delete cascade,
  score int not null default 0,
  total int not null default 0,
  answers jsonb not null default '[]'::jsonb,
  completed_at timestamptz not null default now()
);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New Chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists documents_user_id_idx on documents(user_id);
create index if not exists flashcards_document_id_idx on flashcards(document_id);
create index if not exists quizzes_document_id_idx on quizzes(document_id);
create index if not exists quiz_attempts_user_id_idx on quiz_attempts(user_id);
create index if not exists quiz_attempts_document_id_idx on quiz_attempts(document_id);
create index if not exists conversations_user_id_idx on conversations(user_id);
create index if not exists chat_messages_conversation_id_idx on chat_messages(conversation_id);

-- Enable Row Level Security
alter table documents enable row level security;
alter table flashcards enable row level security;
alter table quizzes enable row level security;
alter table quiz_attempts enable row level security;
alter table conversations enable row level security;
alter table chat_messages enable row level security;

-- RLS policies: users can only access their own data
create policy "Users can CRUD their own documents"
  on documents for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can read flashcards for their documents"
  on flashcards for all using (
    exists (select 1 from documents where documents.id = flashcards.document_id and documents.user_id = auth.uid())
  );

create policy "Users can read quizzes for their documents"
  on quizzes for all using (
    exists (select 1 from documents where documents.id = quizzes.document_id and documents.user_id = auth.uid())
  );

create policy "Users can CRUD their own quiz attempts"
  on quiz_attempts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can CRUD their own conversations"
  on conversations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can CRUD messages in their conversations"
  on chat_messages for all using (
    exists (select 1 from conversations where conversations.id = chat_messages.conversation_id and conversations.user_id = auth.uid())
  );

-- Storage bucket for PDF uploads
insert into storage.buckets (id, name, public) values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "Users can upload their own documents"
  on storage.objects for insert with check (
    bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their own documents"
  on storage.objects for select using (
    bucket_id = 'documents' and auth.uid()::text = (storage.foldername(name))[1]
  );

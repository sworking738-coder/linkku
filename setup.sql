create table links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  url text not null,
  platform text,
  title text,
  description text,
  image text,
  label text,
  note text,
  created_at timestamptz default now()
);
alter table links enable row level security;
create policy "hanya milik sendiri" on links for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

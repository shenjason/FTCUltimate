-- supabase/quickstart.sql
-- Consolidated schema for a clean Supabase project.
-- Run this in the Supabase SQL Editor to set up all tables, RLS policies,
-- and indexes from scratch. Do NOT run on an existing DB with data —
-- use the incremental migrations in supabase/migrations/ instead.

-- ─── Extensions ──────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── profiles ────────────────────────────────────────────────────────
create table if not exists profiles (
  id           uuid references auth.users on delete cascade primary key,
  team_number  text,
  team_name    text,
  program      text check (program in ('FTC', 'FRC')),
  created_at   timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- ─── practice_matches ────────────────────────────────────────────────
-- NOTE: id is text (not uuid) because WatermelonDB generates string IDs.
create table if not exists practice_matches (
  id                text primary key,
  user_id           uuid references profiles(id) on delete cascade not null,
  season_id         text not null,
  played_at         timestamptz default now(),
  total_score       integer not null default 0,
  auto_score        integer not null default 0,
  teleop_score      integer not null default 0,
  scores            jsonb not null default '{}',
  notes             text,
  tags              jsonb default '[]',
  match_number      integer,
  alliance          text check (alliance in ('red', 'blue')),
  match_type        text,
  duration_seconds  integer,
  match_name        text,
  start_mode        text
);

alter table practice_matches enable row level security;

create policy "Users can view own matches"
  on practice_matches for select
  using (auth.uid() = user_id);

create policy "Users can insert own matches"
  on practice_matches for insert
  with check (auth.uid() = user_id);

create policy "Users can update own matches"
  on practice_matches for update
  using (auth.uid() = user_id);

create policy "Users can delete own matches"
  on practice_matches for delete
  using (auth.uid() = user_id);

create index if not exists practice_matches_user_season_idx
  on practice_matches(user_id, season_id);

-- ─── scouting_entries (stub) ─────────────────────────────────────────
create table if not exists scouting_entries (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references profiles(id) on delete cascade not null,
  season_id     text not null,
  team_number   text,
  event_code    text,
  match_number  integer,
  scores        jsonb not null default '{}',
  created_at    timestamptz default now()
);

alter table scouting_entries enable row level security;

create policy "Users can view own scouting entries"
  on scouting_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own scouting entries"
  on scouting_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own scouting entries"
  on scouting_entries for update
  using (auth.uid() = user_id);

create policy "Users can delete own scouting entries"
  on scouting_entries for delete
  using (auth.uid() = user_id);

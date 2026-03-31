ALTER TABLE practice_matches
  ADD COLUMN IF NOT EXISTS match_name text,
  ADD COLUMN IF NOT EXISTS start_mode text;

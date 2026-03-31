-- Fix ID type: WatermelonDB generates string IDs, not UUIDs
ALTER TABLE practice_matches ALTER COLUMN id TYPE text;

-- Add missing columns that exist in local schema but not remote
ALTER TABLE practice_matches
  ADD COLUMN IF NOT EXISTS match_type text,
  ADD COLUMN IF NOT EXISTS duration_seconds integer;

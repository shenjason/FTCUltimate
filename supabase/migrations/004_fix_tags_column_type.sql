-- Fix tags column: WatermelonDB stores tags as a JSON string array,
-- which is pushed as a parsed JS array. Using jsonb is a safer match
-- than text[] for the PostgREST auto-coercion from JSON payloads.
ALTER TABLE practice_matches
  ALTER COLUMN tags TYPE jsonb USING to_jsonb(tags);

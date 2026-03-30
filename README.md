# ScoutOps

Cross-season FTC/FRC scouting and practice match logging app.

## Setup

1. `npm install`
2. `cp .env.example .env` and fill in your Supabase credentials
3. `npx expo start`

## Important Notes

- WatermelonDB uses JSI (`jsi: true`), which requires native compilation.
  You **cannot** use Expo Go for development. Use `npx expo run:ios` or
  `npx expo run:android` instead of `npx expo start`.
- If you need Expo Go compatibility during early development, set `jsi: false`
  in `lib/watermelon/database.ts` (slower but compatible).

## Adding a New Season

Drop a new JSON file in `/seasons/` following the schema in `/types/season.ts`. No code changes required.

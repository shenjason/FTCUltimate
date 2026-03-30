// lib/watermelon/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 3,
  tables: [
    tableSchema({
      name: 'practice_matches',
      columns: [
        { name: 'season_id', type: 'string' },
        { name: 'timestamp', type: 'number' },
        { name: 'duration_seconds', type: 'number' },
        { name: 'all_scores', type: 'string' },   // JSON stringified ScoreMap or DualScoreMap
        { name: 'total_score', type: 'number' },
        { name: 'auto_score', type: 'number' },
        { name: 'teleop_score', type: 'number' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'tags', type: 'string', isOptional: true },  // JSON stringified string[]
        { name: 'synced', type: 'boolean' },
        { name: 'match_number', type: 'number', isOptional: true },
        { name: 'alliance', type: 'string', isOptional: true },
        { name: 'match_type', type: 'string', isOptional: true },
      ],
    }),
  ],
});

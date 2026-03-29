// lib/watermelon/schema.ts
import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'practice_matches',
      columns: [
        { name: 'season_id', type: 'string' },
        { name: 'timestamp', type: 'number' },
        { name: 'duration_seconds', type: 'number' },
        { name: 'all_scores', type: 'string' },   // JSON stringified ScoreMap
        { name: 'total_score', type: 'number' },
        { name: 'auto_score', type: 'number' },
        { name: 'teleop_score', type: 'number' },
        { name: 'notes', type: 'string', isOptional: true },
        { name: 'tags', type: 'string', isOptional: true },  // JSON stringified string[]
        { name: 'synced', type: 'boolean' },
      ],
    }),
  ],
});

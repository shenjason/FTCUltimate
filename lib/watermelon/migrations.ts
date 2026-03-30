// lib/watermelon/migrations.ts
import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 3,
      steps: [
        addColumns({
          table: 'practice_matches',
          columns: [
            { name: 'match_type', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
  ],
});

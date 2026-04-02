// lib/watermelon/migrations.ts
import { schemaMigrations, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export const migrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        addColumns({
          table: 'practice_matches',
          columns: [
            { name: 'match_number', type: 'number', isOptional: true },
            { name: 'alliance', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
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
    {
      toVersion: 4,
      steps: [
        addColumns({
          table: 'practice_matches',
          columns: [
            { name: 'match_name', type: 'string', isOptional: true },
            { name: 'start_mode', type: 'string', isOptional: true },
          ],
        }),
      ],
    },
  ],
});

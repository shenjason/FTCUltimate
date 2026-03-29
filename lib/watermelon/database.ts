// lib/watermelon/database.ts
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema';
import { PracticeMatch } from './models/PracticeMatch';

const adapter = new SQLiteAdapter({
  schema,
  dbName: 'scoutops',
  jsi: true,
  onSetUpError: (error) => {
    console.error('WatermelonDB setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [PracticeMatch],
});

// lib/watermelon/database.ts
import { Database } from "@nozbe/watermelondb";
import SQLiteAdapter from "@nozbe/watermelondb/adapters/sqlite";
import { schema } from "./schema";
import { migrations } from "./migrations";
import { PracticeMatch } from "./models/PracticeMatch";

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  dbName: "scoutops",
  jsi: true, // <--- Change this from false to true when not using with Expo Go
  onSetUpError: (error) => {
    console.error("WatermelonDB setup error:", error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [PracticeMatch],
});

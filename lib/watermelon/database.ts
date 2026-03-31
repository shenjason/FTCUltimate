import { Platform } from "react-native";
import { Database } from "@nozbe/watermelondb";
import { schema } from "./schema";
import { migrations } from "./migrations";
import { PracticeMatch } from "./models/PracticeMatch";

function createAdapter() {
  if (Platform.OS === "web") {
    const LokiJSAdapter =
      require("@nozbe/watermelondb/adapters/lokijs").default;
    return new LokiJSAdapter({
      schema,
      migrations,
      useWebWorker: false,
      useIncrementalIndexedDB: true,
    });
  }

  const SQLiteAdapter =
    require("@nozbe/watermelondb/adapters/sqlite").default;
  return new SQLiteAdapter({
    schema,
    migrations,
    dbName: "scoutops",
    jsi: true,
    onSetUpError: (error: any) => {
      console.error("WatermelonDB setup error:", error);
    },
  });
}

export const database = new Database({
  adapter: createAdapter(),
  modelClasses: [PracticeMatch],
});

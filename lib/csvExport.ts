// lib/csvExport.ts
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import type { SavedMatch } from "../types/match";
import { getSeasonById } from "./seasonLoader";

export async function exportMatchesCSV(matches: SavedMatch[]): Promise<void> {
  if (matches.length === 0) return;

  const headers = [
    "Match ID",
    "Season",
    "Date",
    "Time",
    "Match #",
    "Alliance",
    "Auto Score",
    "Teleop Score",
    "Total Score",
    "Notes",
    "Tags",
  ];

  const rows = matches.map((m) => {
    const date = new Date(m.timestamp);
    const season = (() => {
      try {
        return getSeasonById(m.seasonId);
      } catch {
        return null;
      }
    })();

    return [
      m.id,
      season?.name ?? m.seasonId,
      date.toLocaleDateString(),
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      m.matchName ?? "",
      m.alliance ?? "",
      m.autoScore.toString(),
      m.teleopScore.toString(),
      m.totalScore.toString(),
      (m.notes ?? "").replace(/,/g, ";").replace(/\n/g, " "),
      (m.tags ?? []).join("; "),
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const filename = `ftcultimate_export_${Date.now()}.csv`;

  if (Platform.OS === "web") {
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  const filepath = `${FileSystem.documentDirectory}${filename}`;

  await FileSystem.writeAsStringAsync(filepath, csv, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(filepath, {
      mimeType: "text/csv",
      dialogTitle: "Export Match History",
    });
  }
}

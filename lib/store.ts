// lib/store.ts
import { create } from "zustand";
import { getSeasons } from "./seasonLoader";
import { database } from "./watermelon/database";
import { PracticeMatch } from "./watermelon/models/PracticeMatch";
import type { SeasonConfig } from "../types/season";
import type {
  MatchPhase,
  MatchType,
  SavedMatch,
  ScoreMap,
  ScoreValue,
  StartMode,
} from "../types/match";
import { supabase } from "./supabase";
import { computeScore } from "./scoreEngine";
export { computeScore };

// ─── Season Store ──────────────────────────────────────────────────

interface SeasonState {
  seasons: SeasonConfig[];
  selectedSeasonId: string;
  setSelectedSeason: (id: string) => void;
}

export const useSeasonStore = create<SeasonState>((set) => {
  const seasons = getSeasons();
  return {
    seasons,
    selectedSeasonId: seasons[0]?.id ?? "",
    setSelectedSeason: (id) => set({ selectedSeasonId: id }),
  };
});

// ─── Match Store ───────────────────────────────────────────────────

interface MatchState {
  phase: MatchPhase;
  matchType: MatchType;
  matchStarted: boolean;
  scores: ScoreMap;
  redScores: ScoreMap;
  elapsedSeconds: number;
  strictMode: boolean;
  undoStack: ScoreMap[];
  redoStack: ScoreMap[];
  redUndoStack: ScoreMap[];
  redRedoStack: ScoreMap[];
  startMode: StartMode;
  matchName: string;
  selectedModuleId: string | null;
  fouls: {
    redMinor: number;
    redMajor: number;
    blueMinor: number;
    blueMajor: number;
  };
  setPhase: (phase: MatchPhase) => void;
  setMatchType: (matchType: MatchType) => void;
  setMatchStarted: (started: boolean) => void;
  setScore: (moduleId: string, value: ScoreValue) => void;
  setRedScore: (moduleId: string, value: ScoreValue) => void;
  setElapsed: (seconds: number) => void;
  setStrictMode: (v: boolean) => void;
  undo: () => void;
  redo: () => void;
  undoRed: () => void;
  redoRed: () => void;
  resetMatch: () => void;
  setStartMode: (mode: StartMode) => void;
  setMatchName: (name: string) => void;
  setSelectedModuleId: (id: string | null) => void;
  incrementFoul: (
    alliance: "red" | "blue",
    severity: "minor" | "major",
  ) => void;
  decrementFoul: (
    alliance: "red" | "blue",
    severity: "minor" | "major",
  ) => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  phase: "idle",
  matchType: "solo",
  matchStarted: false,
  scores: {},
  redScores: {},
  elapsedSeconds: 0,
  strictMode: true,
  undoStack: [],
  redoStack: [],
  redUndoStack: [],
  redRedoStack: [],
  startMode: "auto_teleop",
  matchName: "",
  selectedModuleId: null,
  fouls: { redMinor: 0, redMajor: 0, blueMinor: 0, blueMajor: 0 },

  setPhase: (phase) => set({ phase }),
  setMatchType: (matchType) => set({ matchType }),
  setMatchStarted: (matchStarted) => set({ matchStarted }),

  setScore: (moduleId, value) =>
    set((state) => ({
      undoStack: [...state.undoStack.slice(-30), { ...state.scores }], // Keep max 30
      redoStack: [],
      scores: { ...state.scores, [moduleId]: value },
    })),

  setRedScore: (moduleId, value) =>
    set((state) => ({
      redUndoStack: [...state.redUndoStack.slice(-30), { ...state.redScores }],
      redRedoStack: [],
      redScores: { ...state.redScores, [moduleId]: value },
    })),

  setElapsed: (elapsedSeconds) => set({ elapsedSeconds }),
  setStrictMode: (strictMode) => set({ strictMode }),

  undo: () =>
    set((state) => {
      if (state.undoStack.length === 0) return state;
      const prev = state.undoStack[state.undoStack.length - 1];
      return {
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, { ...state.scores }],
        scores: prev,
      };
    }),

  redo: () =>
    set((state) => {
      if (state.redoStack.length === 0) return state;
      const next = state.redoStack[state.redoStack.length - 1];
      return {
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, { ...state.scores }],
        scores: next,
      };
    }),

  undoRed: () =>
    set((state) => {
      if (state.redUndoStack.length === 0) return state;
      const prev = state.redUndoStack[state.redUndoStack.length - 1];
      return {
        redUndoStack: state.redUndoStack.slice(0, -1),
        redRedoStack: [...state.redRedoStack, { ...state.redScores }],
        redScores: prev,
      };
    }),

  redoRed: () =>
    set((state) => {
      if (state.redRedoStack.length === 0) return state;
      const next = state.redRedoStack[state.redRedoStack.length - 1];
      return {
        redRedoStack: state.redRedoStack.slice(0, -1),
        redUndoStack: [...state.redUndoStack, { ...state.redScores }],
        redScores: next,
      };
    }),

  resetMatch: () =>
    set((state) => ({
      phase: "idle",
      scores: {},
      redScores: {},
      elapsedSeconds: 0,
      strictMode: true,
      undoStack: [],
      redoStack: [],
      redUndoStack: [],
      redRedoStack: [],
      matchType: state.matchType, // preserve matchType
      selectedModuleId: null,
      fouls: { redMinor: 0, redMajor: 0, blueMinor: 0, blueMajor: 0 },
    })),

  setStartMode: (mode) => set({ startMode: mode }),
  setMatchName: (name) => set({ matchName: name }),
  setSelectedModuleId: (id) => set({ selectedModuleId: id }),

  incrementFoul: (alliance, severity) =>
    set((state) => {
      const key =
        `${alliance}${severity.charAt(0).toUpperCase() + severity.slice(1)}` as keyof typeof state.fouls;
      return { fouls: { ...state.fouls, [key]: state.fouls[key] + 1 } };
    }),

  decrementFoul: (alliance, severity) =>
    set((state) => {
      const key =
        `${alliance}${severity.charAt(0).toUpperCase() + severity.slice(1)}` as keyof typeof state.fouls;
      return {
        fouls: {
          ...state.fouls,
          [key]: Math.max(0, state.fouls[key] - 1),
        },
      };
    }),
}));

// ─── History Store ─────────────────────────────────────────────────

interface HistoryState {
  matches: SavedMatch[];
  loadMatches: () => Promise<void>;
  saveMatch: (match: Omit<SavedMatch, "id">) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  matches: [],

  loadMatches: async () => {
    const collection = database.get<PracticeMatch>("practice_matches");
    const records = await collection.query().fetch();
    const matches: SavedMatch[] = records
      .map((r) => ({
        id: r.id,
        seasonId: r.seasonId,
        timestamp: r.timestamp,
        durationSeconds: r.durationSeconds,
        allScores: r.allScores,
        totalScore: r.totalScore,
        autoScore: r.autoScore,
        teleopScore: r.teleopScore,
        notes: r.notes || undefined,
        tags: r.tags,
        matchName: r.matchName ?? undefined,
        alliance: (r.alliance as "red" | "blue" | null) ?? undefined,
        matchType: (r.matchType as MatchType | null) ?? undefined,
        startMode: r.startMode as StartMode | undefined,
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
    set({ matches });
  },

  saveMatch: async (match) => {
    const collection = database.get<PracticeMatch>("practice_matches");
    await database.write(async () => {
      await collection.create((record) => {
        record.seasonId = match.seasonId;
        record.timestamp = match.timestamp;
        record.durationSeconds = match.durationSeconds;
        record.allScoresRaw = JSON.stringify(match.allScores);
        record.totalScore = match.totalScore;
        record.autoScore = match.autoScore;
        record.teleopScore = match.teleopScore;
        record.notes = match.notes ?? "";
        record.tagsRaw = JSON.stringify(match.tags ?? []);
        record.synced = false;
        record.matchNumber = null;
        record.alliance = match.alliance ?? null;
        record.matchType = match.matchType ?? null;
        record.matchName = match.matchName ?? "";
        record.startMode = match.startMode ?? "auto_teleop";
      });
    });
    // reload
    const records = await collection.query().fetch();
    const matches: SavedMatch[] = records
      .map((r) => ({
        id: r.id,
        seasonId: r.seasonId,
        timestamp: r.timestamp,
        durationSeconds: r.durationSeconds,
        allScores: r.allScores,
        totalScore: r.totalScore,
        autoScore: r.autoScore,
        teleopScore: r.teleopScore,
        notes: r.notes || undefined,
        tags: r.tags,
        matchName: r.matchName ?? undefined,
        alliance: (r.alliance as "red" | "blue" | null) ?? undefined,
        matchType: (r.matchType as MatchType | null) ?? undefined,
        startMode: r.startMode as StartMode | undefined,
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
    set({ matches });
  },

  deleteMatch: async (id) => {
    const collection = database.get<PracticeMatch>("practice_matches");
    const record = await collection.find(id);
    await database.write(async () => {
      await record.destroyPermanently();
    });
    set((state) => ({ matches: state.matches.filter((m) => m.id !== id) }));

    // Best-effort remote delete — don't block on failure
    supabase
      .from("practice_matches")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) console.warn("Remote delete failed:", error.message);
      });
  },
}));

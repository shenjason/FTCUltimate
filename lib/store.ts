// lib/store.ts
import { create } from 'zustand';
import { getSeasons } from './seasonLoader';
import { database } from './watermelon/database';
import { PracticeMatch } from './watermelon/models/PracticeMatch';
import type { SeasonConfig } from '../types/season';
import type { MatchPhase, SavedMatch, ScoreMap, ScoreValue } from '../types/match';
import { computeScore } from './scoreEngine';
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
    selectedSeasonId: seasons[0]?.id ?? '',
    setSelectedSeason: (id) => set({ selectedSeasonId: id }),
  };
});

// ─── Match Store ───────────────────────────────────────────────────

interface MatchState {
  phase: MatchPhase;
  scores: ScoreMap;
  elapsedSeconds: number;
  setPhase: (phase: MatchPhase) => void;
  setScore: (moduleId: string, value: ScoreValue) => void;
  setElapsed: (seconds: number) => void;
  resetMatch: () => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  phase: 'idle',
  scores: {},
  elapsedSeconds: 0,
  setPhase: (phase) => set({ phase }),
  setScore: (moduleId, value) =>
    set((state) => ({ scores: { ...state.scores, [moduleId]: value } })),
  setElapsed: (elapsedSeconds) => set({ elapsedSeconds }),
  resetMatch: () => set({ phase: 'idle', scores: {}, elapsedSeconds: 0 }),
}));

// ─── History Store ─────────────────────────────────────────────────

interface HistoryState {
  matches: SavedMatch[];
  loadMatches: () => Promise<void>;
  saveMatch: (match: Omit<SavedMatch, 'id'>) => Promise<void>;
  deleteMatch: (id: string) => Promise<void>;
}

export const useHistoryStore = create<HistoryState>((set) => ({
  matches: [],

  loadMatches: async () => {
    const collection = database.get<PracticeMatch>('practice_matches');
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
        matchNumber: r.matchNumber ?? undefined,
        alliance: (r.alliance as 'red' | 'blue' | null) ?? undefined,
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
    set({ matches });
  },

  saveMatch: async (match) => {
    const collection = database.get<PracticeMatch>('practice_matches');
    await database.write(async () => {
      await collection.create((record) => {
        record.seasonId = match.seasonId;
        record.timestamp = match.timestamp;
        record.durationSeconds = match.durationSeconds;
        record.allScoresRaw = JSON.stringify(match.allScores);
        record.totalScore = match.totalScore;
        record.autoScore = match.autoScore;
        record.teleopScore = match.teleopScore;
        record.notes = match.notes ?? '';
        record.tagsRaw = JSON.stringify(match.tags ?? []);
        record.synced = false;
        record.matchNumber = match.matchNumber ?? null;
        record.alliance = match.alliance ?? null;
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
        matchNumber: r.matchNumber ?? undefined,
        alliance: (r.alliance as 'red' | 'blue' | null) ?? undefined,
      }))
      .sort((a, b) => b.timestamp - a.timestamp);
    set({ matches });
  },

  deleteMatch: async (id) => {
    const collection = database.get<PracticeMatch>('practice_matches');
    const record = await collection.find(id);
    await database.write(async () => {
      await record.destroyPermanently();
    });
    set((state) => ({ matches: state.matches.filter((m) => m.id !== id) }));
  },
}));

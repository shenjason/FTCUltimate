// lib/store.ts
import { create } from 'zustand';
import { getSeasons } from './seasonLoader';
import { database } from './watermelon/database';
import { PracticeMatch } from './watermelon/models/PracticeMatch';
import type { SeasonConfig, ModuleConfig } from '../types/season';
import type { MatchPhase, SavedMatch, ScoreMap, ScoreValue } from '../types/match';

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

// ─── Score computation ─────────────────────────────────────────────

function evaluateExpression(expression: string, scores: ScoreMap): number {
  // Supports: if(condition, trueVal, falseVal), field references, >= comparisons
  const ifMatch = expression.match(/^if\((.+),\s*(\d+),\s*(\d+)\)$/);
  if (ifMatch) {
    const [, condition, trueVal, falseVal] = ifMatch;
    const condResult = evaluateCondition(condition, scores);
    return condResult ? Number(trueVal) : Number(falseVal);
  }
  // Sum of field references for calculated ownership
  return evaluateValue(expression, scores);
}

function evaluateCondition(condition: string, scores: ScoreMap): boolean {
  const gteMatch = condition.match(/^(.+)\s*>=\s*(\d+)$/);
  if (gteMatch) {
    const [, field, threshold] = gteMatch;
    return evaluateValue(field.trim(), scores) >= Number(threshold);
  }
  return false;
}

function evaluateValue(expr: string, scores: ScoreMap): number {
  // Dot notation for tiered counters: "field.tier"
  if (expr.includes('+')) {
    return expr
      .split('+')
      .map((part) => evaluateValue(part.trim(), scores))
      .reduce((a, b) => a + b, 0);
  }
  if (expr.includes('.')) {
    const [moduleId, tierId] = expr.split('.');
    const val = scores[moduleId];
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      const tierVal = (val as Record<string, number>)[tierId];
      return typeof tierVal === 'number' ? tierVal : 0;
    }
    return 0;
  }
  const val = scores[expr];
  if (typeof val === 'number') return val;
  if (typeof val === 'boolean') return val ? 1 : 0;
  return 0;
}

function moduleScore(module: ModuleConfig, scores: ScoreMap): number {
  const val = scores[module.id];
  switch (module.type) {
    case 'boolean':
      return val === true ? module.points : 0;
    case 'counter': {
      const n = typeof val === 'number' ? val : 0;
      return n * module.points;
    }
    case 'tiered_counter': {
      const tiers = (typeof val === 'object' && val !== null ? val : {}) as Record<string, number>;
      return module.tiers.reduce((sum, tier) => {
        const count = typeof tiers[tier.id] === 'number' ? (tiers[tier.id] as number) : 0;
        return sum + count * tier.points;
      }, 0);
    }
    case 'selector': {
      if (typeof val !== 'string') return 0;
      const option = module.options.find((o) => o.id === val);
      return option?.points ?? 0;
    }
    case 'multi_boolean': {
      const itemVals = (typeof val === 'object' && val !== null ? val : {}) as Record<string, boolean>;
      return module.items.reduce((sum, item) => {
        return sum + (itemVals[item.id] === true ? item.points : 0);
      }, 0);
    }
    case 'grid': {
      const cells = (typeof val === 'object' && val !== null ? val : {}) as Record<string, boolean>;
      const cellCount = Object.values(cells).filter(Boolean).length;
      let bonus = 0;
      if (module.bonuses) {
        bonus = module.bonuses.reduce((sum, b) => {
          const bVal = scores[`${module.id}_bonus_${b.id}`];
          return sum + (bVal === true ? b.points : 0);
        }, 0);
      }
      return cellCount * module.pointsPerCell + bonus;
    }
    case 'calculated':
      return evaluateExpression(module.expression, scores) * module.points;
    default:
      return 0;
  }
}

export function computeScore(
  season: SeasonConfig,
  scores: ScoreMap
): { auto: number; teleop: number; total: number } {
  const auto = season.autonomous.reduce((sum, mod) => sum + moduleScore(mod, scores), 0);
  const teleop = season.teleop.reduce((sum, mod) => sum + moduleScore(mod, scores), 0);
  return { auto, teleop, total: auto + teleop };
}

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

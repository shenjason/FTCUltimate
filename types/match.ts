// types/match.ts

export type MatchPhase = 'idle' | 'pre_auto' | 'auto' | 'transition' | 'pre_teleop' | 'teleop' | 'complete';
export type MatchType = 'timer_only' | 'solo' | 'full';
export type StartMode = "auto_teleop" | "teleop_only";

// ScoreMap keys are moduleId strings.
// Values: number for counter/selector/tiered, boolean for boolean/multi_boolean,
// Record<string,number> for grid cells, Record<string,number> for tiered_counter tiers.
export type ScoreValue = number | boolean | string | null | Record<string, number | boolean>;
export type ScoreMap = Record<string, ScoreValue>;

// DualScoreMap is used in 'full' mode for alliance-based scoring
export type DualScoreMap = {
  blue: ScoreMap;
  red: ScoreMap;
};

// Type guard to distinguish DualScoreMap from ScoreMap
export function isDualScoreMap(value: unknown): value is DualScoreMap {
  return typeof value === 'object' && value !== null && 'blue' in value && 'red' in value;
}

export interface SavedMatch {
  id: string;
  seasonId: string;
  timestamp: number;        // Unix ms
  durationSeconds: number;
  allScores: ScoreMap | DualScoreMap;
  totalScore: number;
  autoScore: number;
  teleopScore: number;
  notes?: string;
  tags?: string[];
  matchName?: string;
  startMode?: StartMode;
  alliance?: 'red' | 'blue';
  matchType?: MatchType;
}

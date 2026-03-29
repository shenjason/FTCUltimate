// types/match.ts

export type MatchPhase = 'idle' | 'auto' | 'transition' | 'teleop' | 'complete';

// ScoreMap keys are moduleId strings.
// Values: number for counter/selector/tiered, boolean for boolean/multi_boolean,
// Record<string,number> for grid cells, Record<string,number> for tiered_counter tiers.
export type ScoreValue = number | boolean | Record<string, number | boolean>;
export type ScoreMap = Record<string, ScoreValue>;

export interface SavedMatch {
  id: string;
  seasonId: string;
  timestamp: number;        // Unix ms
  durationSeconds: number;
  allScores: ScoreMap;
  totalScore: number;
  autoScore: number;
  teleopScore: number;
  notes?: string;
  tags?: string[];
}

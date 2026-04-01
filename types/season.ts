// types/season.ts

export interface TimerDuration {
  autonomous: number;   // seconds
  transition: number;   // seconds
  teleop: number;       // seconds
}

// ─── Module configs ───────────────────────────────────────────────

export interface BooleanModule {
  id: string;
  label: string;
  type: 'boolean';
  points: number;
  period?: 'auto' | 'teleop';
  description?: string;
  showPreview?: boolean;
  icon?: string;
}

export interface CounterModule {
  id: string;
  label: string;
  type: 'counter';
  points: number;
  min: number;
  max?: number;
  step?: number;
  period?: 'auto' | 'teleop';
  description?: string;
  showPreview?: boolean;
  icon?: string;
}

export interface TierConfig {
  id: string;
  label: string;
  points: number;
}

export interface TieredCounterModule {
  id: string;
  label: string;
  type: 'tiered_counter';
  tiers: TierConfig[];
  period?: 'auto' | 'teleop';
  description?: string;
  icon?: string;
}

export interface OptionConfig {
  id: string;
  label: string;
  points: number;
}

export interface SelectorModule {
  id: string;
  label: string;
  type: 'selector';
  options: OptionConfig[];
  period?: 'auto' | 'teleop';
  description?: string;
  showPreview?: boolean;
  icon?: string;
  defaultValue?: string;
}

export interface MultiBooleanItem {
  id: string;
  label: string;
  points: number;
}

export interface MultiBooleanModule {
  id: string;
  label: string;
  type: 'multi_boolean';
  items: MultiBooleanItem[];
  period?: 'auto' | 'teleop';
  description?: string;
  icon?: string;
}

export interface GridBonusConfig {
  id: string;
  label: string;
  description?: string;
  type: 'manual_boolean';
  points: number;
}

export interface GridModule {
  id: string;
  label: string;
  type: 'grid';
  rows: number;
  cols: number;
  pointsPerCell: number;
  bonuses?: GridBonusConfig[];
  period?: 'auto' | 'teleop';
  description?: string;
  icon?: string;
}

export interface CalculatedModule {
  id: string;
  label: string;
  type: 'calculated';
  points: number;
  scoreFn: string;          // references a named function in the registry
  period?: 'auto' | 'teleop';
  description?: string;
  icon?: string;
}

export type ModuleConfig =
  | BooleanModule
  | CounterModule
  | TieredCounterModule
  | SelectorModule
  | MultiBooleanModule
  | GridModule
  | CalculatedModule;

// ─── Season config ────────────────────────────────────────────────

export interface SeasonConfig {
  id: string;
  name: string;
  program: 'FTC' | 'FRC';
  year: number;
  provisional?: boolean;   // ADD THIS LINE
  timerDuration: TimerDuration;
  autonomous: ModuleConfig[];
  teleop: ModuleConfig[];
  foulPoints?: {
    minor: number;
    major: number;
  };
}

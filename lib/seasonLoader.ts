// lib/seasonLoader.ts
import type { SeasonConfig, ModuleConfig } from '../types/season';

// Static import map — add new seasons here when a new JSON file is created.
// This is the only file that needs updating when a season is added.
import DECODE_2025 from '../seasons/FTC_2025_DECODE.json';
import INTO_THE_DEEP_2024 from '../seasons/FTC_2024_INTO_THE_DEEP.json';
import CENTERSTAGE_2023 from '../seasons/FTC_2023_CENTERSTAGE.json';
import POWERPLAY_2022 from '../seasons/FTC_2022_POWERPLAY.json';

const RAW_SEASONS: unknown[] = [
  DECODE_2025,
  INTO_THE_DEEP_2024,
  CENTERSTAGE_2023,
  POWERPLAY_2022,
];

const VALID_MODULE_TYPES = [
  'boolean',
  'counter',
  'tiered_counter',
  'selector',
  'multi_boolean',
  'grid',
  'calculated',
] as const;

function validateModule(mod: unknown, seasonId: string, index: number): ModuleConfig {
  if (typeof mod !== 'object' || mod === null) {
    throw new Error(`Season ${seasonId}: module[${index}] is not an object`);
  }
  const m = mod as Record<string, unknown>;
  if (typeof m.id !== 'string' || m.id.trim() === '') {
    throw new Error(`Season ${seasonId}: module[${index}] missing string "id"`);
  }
  if (typeof m.label !== 'string' || m.label.trim() === '') {
    throw new Error(`Season ${seasonId}: module "${m.id}" missing string "label"`);
  }
  if (!VALID_MODULE_TYPES.includes(m.type as typeof VALID_MODULE_TYPES[number])) {
    throw new Error(
      `Season ${seasonId}: module "${m.id}" has invalid type "${String(m.type)}". ` +
        `Valid types: ${VALID_MODULE_TYPES.join(', ')}`
    );
  }
  return mod as ModuleConfig;
}

function validateSeason(raw: unknown): SeasonConfig {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Season config must be a JSON object');
  }
  const s = raw as Record<string, unknown>;

  if (typeof s.id !== 'string' || s.id.trim() === '') {
    throw new Error('Season config missing string "id"');
  }
  if (typeof s.name !== 'string') throw new Error(`Season "${s.id}" missing "name"`);
  if (s.program !== 'FTC' && s.program !== 'FRC') {
    throw new Error(`Season "${s.id}" program must be "FTC" or "FRC"`);
  }
  if (typeof s.year !== 'number') throw new Error(`Season "${s.id}" missing numeric "year"`);

  const td = s.timerDuration as Record<string, unknown>;
  if (
    typeof td?.autonomous !== 'number' ||
    typeof td?.transition !== 'number' ||
    typeof td?.teleop !== 'number'
  ) {
    throw new Error(`Season "${s.id}" timerDuration must have numeric autonomous/transition/teleop`);
  }

  if (!Array.isArray(s.autonomous)) throw new Error(`Season "${s.id}" missing "autonomous" array`);
  if (!Array.isArray(s.teleop)) throw new Error(`Season "${s.id}" missing "teleop" array`);

  const autonomous = (s.autonomous as unknown[]).map((m, i) =>
    validateModule(m, s.id as string, i)
  );
  const teleop = (s.teleop as unknown[]).map((m, i) =>
    validateModule(m, s.id as string, i)
  );

  return {
    id: s.id as string,
    name: s.name as string,
    program: s.program as 'FTC' | 'FRC',
    year: s.year as number,
    provisional: s.provisional === true ? true : undefined,
    timerDuration: td as unknown as SeasonConfig['timerDuration'],
    autonomous,
    teleop,
  };
}

let _seasons: SeasonConfig[] | null = null;

export function getSeasons(): SeasonConfig[] {
  if (_seasons) return _seasons;
  _seasons = RAW_SEASONS.map(validateSeason);
  return _seasons;
}

export function getSeasonById(id: string): SeasonConfig {
  const season = getSeasons().find((s) => s.id === id);
  if (!season) throw new Error(`Season "${id}" not found`);
  return season;
}

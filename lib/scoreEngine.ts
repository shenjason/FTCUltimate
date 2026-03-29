// lib/scoreEngine.ts
import type { SeasonConfig, ModuleConfig } from '../types/season';
import type { ScoreMap } from '../types/match';

// ─── Per-module score computation ──────────────────────────────────

export function moduleScore(module: ModuleConfig, scores: ScoreMap): number {
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
      if (typeof val !== 'string' || val === '') return 0;
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

    case 'calculated': {
      const fn = SCORE_FN_REGISTRY[module.scoreFn];
      if (!fn) {
        console.warn(`No score function registered for "${module.scoreFn}"`);
        return 0;
      }
      return fn(scores, module.points);
    }

    default:
      return 0;
  }
}

// ─── Totals ────────────────────────────────────────────────────────

export function computeScore(
  season: SeasonConfig,
  scores: ScoreMap
): { auto: number; teleop: number; total: number } {
  const auto = season.autonomous.reduce((sum, mod) => sum + moduleScore(mod, scores), 0);
  const teleop = season.teleop.reduce((sum, mod) => sum + moduleScore(mod, scores), 0);
  return { auto, teleop, total: auto + teleop };
}

// ─── Named score function registry ────────────────────────────────
//
// Each function receives the full ScoreMap and the module's base points value.
// Returns the computed score for that module.

type ScoreFn = (scores: ScoreMap, basePoints: number) => number;

function getTieredCount(scores: ScoreMap, moduleId: string, tierId: string): number {
  const val = scores[moduleId];
  if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
    const n = (val as Record<string, number>)[tierId];
    return typeof n === 'number' ? n : 0;
  }
  return 0;
}

function getCounter(scores: ScoreMap, moduleId: string): number {
  const val = scores[moduleId];
  return typeof val === 'number' ? val : 0;
}

const SCORE_FN_REGISTRY: Record<string, ScoreFn> = {

  // POWERPLAY — Circuit Bonus
  // 20 pts if alliance owns ≥1 of each junction type (ground, low, medium, high)
  // AND both terminals have ≥1 cone.
  'powerplay_circuit_bonus': (scores, basePoints) => {
    const ground = getTieredCount(scores, 'junction_cones', 'ground');
    const low = getTieredCount(scores, 'junction_cones', 'low');
    const medium = getTieredCount(scores, 'junction_cones', 'medium');
    const high = getTieredCount(scores, 'junction_cones', 'high');
    const terminals = getCounter(scores, 'terminal_cones');
    // Simplified: requires ≥1 cone on each tier + ≥1 terminal cone
    if (ground >= 1 && low >= 1 && medium >= 1 && high >= 1 && terminals >= 1) {
      return basePoints;
    }
    return 0;
  },

  // POWERPLAY — Junction Ownership Bonus
  // 3 pts per junction where alliance placed the last cone (approximated as total junctions scored).
  'powerplay_ownership_bonus': (scores, basePoints) => {
    const ground = getTieredCount(scores, 'junction_cones', 'ground');
    const low = getTieredCount(scores, 'junction_cones', 'low');
    const medium = getTieredCount(scores, 'junction_cones', 'medium');
    const high = getTieredCount(scores, 'junction_cones', 'high');
    // Each junction with ≥1 cone counts as "owned" (simplified single-alliance model)
    let owned = 0;
    if (ground >= 1) owned++;
    if (low >= 1) owned++;
    if (medium >= 1) owned++;
    if (high >= 1) owned++;
    return owned * basePoints;
  },
};

// Export for testing
export { SCORE_FN_REGISTRY };

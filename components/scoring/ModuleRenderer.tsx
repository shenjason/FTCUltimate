// components/scoring/ModuleRenderer.tsx
import React from 'react';
import type { ModuleConfig } from '../../types/season';
import type { ScoreMap, ScoreValue } from '../../types/match';
import { BooleanModule } from './BooleanModule';
import { CounterModule } from './CounterModule';
import { TieredCounterModule } from './TieredCounterModule';
import { SelectorModule } from './SelectorModule';
import { MultiBooleanModule } from './MultiBooleanModule';
import { GridModule } from './GridModule';
import { CalculatedModule } from './CalculatedModule';
import { moduleScore } from '../../lib/scoreEngine';

interface Props {
  module: ModuleConfig;
  scores: ScoreMap;
  onChangeScore: (moduleId: string, value: ScoreValue) => void;
  disabled: boolean;
  period: 'auto' | 'transition' | 'teleop';
}

export function ModuleRenderer({ module, scores, onChangeScore, disabled, period }: Props) {
  const value = scores[module.id];

  switch (module.type) {
    case 'boolean':
      return (
        <BooleanModule
          module={module}
          value={value === true}
          onChange={(v) => onChangeScore(module.id, v)}
          disabled={disabled}
        />
      );
    case 'counter':
      return (
        <CounterModule
          module={module}
          value={typeof value === 'number' ? value : 0}
          onChange={(v) => onChangeScore(module.id, v)}
          disabled={disabled}
        />
      );
    case 'tiered_counter':
      return (
        <TieredCounterModule
          module={module}
          value={(value as Record<string, number>) ?? {}}
          onChange={(v) => onChangeScore(module.id, v)}
          disabled={disabled}
        />
      );
    case 'selector':
      return (
        <SelectorModule
          module={module}
          value={typeof value === 'string' ? value : null}
          onChange={(v) => onChangeScore(module.id, v ?? '')}
          disabled={disabled}
        />
      );
    case 'multi_boolean':
      return (
        <MultiBooleanModule
          module={module}
          value={(value as Record<string, boolean>) ?? {}}
          onChange={(v) => onChangeScore(module.id, v)}
          disabled={disabled}
        />
      );
    case 'grid':
      return (
        <GridModule
          module={module}
          value={(value as Record<string, boolean>) ?? {}}
          bonusValues={
            module.bonuses
              ? Object.fromEntries(
                  module.bonuses.map((b) => [
                    b.id,
                    scores[`${module.id}_bonus_${b.id}`] === true,
                  ])
                )
              : {}
          }
          onChange={(v) => onChangeScore(module.id, v)}
          onBonusChange={(bonusId, v) =>
            onChangeScore(`${module.id}_bonus_${bonusId}`, v)
          }
          disabled={disabled}
        />
      );
    case 'calculated': {
      const computedValue = moduleScore(module, scores);
      return <CalculatedModule module={module} computedValue={computedValue} disabled={disabled} />;
    }
    default:
      return null;
  }
}

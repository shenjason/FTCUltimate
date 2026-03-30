// hooks/useMatchTimer.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useMatchStore } from '../lib/store';
import type { MatchPhase } from '../types/match';
import type { SeasonConfig } from '../types/season';

const TICK_INTERVAL_MS = 200; // Update 5x/sec for smooth display, drift-proof

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export interface UseMatchTimerResult {
  displayTime: string;
  phase: MatchPhase;
  isPaused: boolean;
  /** SharedValue<number> from react-native-reanimated; 1.0 = full, 0.0 = empty */
  progress: ReturnType<typeof useSharedValue<number>>;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

export function useMatchTimer(season: SeasonConfig): UseMatchTimerResult {
  const { phase, setPhase, setElapsed, resetMatch } = useMatchStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseStartRef = useRef<number>(0);   // Date.now() when current phase started
  const pauseOffsetRef = useRef<number>(0);  // accumulated paused time in ms
  const pauseStartRef = useRef<number>(0);   // Date.now() when pause began

  // Keep phaseRef in sync so interval callback never closes over a stale phase
  const phaseRef = useRef<MatchPhase>(phase);

  const progress = useSharedValue(1);

  const { autonomous, transition, teleop } = season.timerDuration;

  const [displayTime, setDisplayTime] = useState<string>('');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const getElapsedSeconds = useCallback((): number => {
    if (phaseStartRef.current === 0) return 0;
    const now = Date.now();
    const rawElapsed = now - phaseStartRef.current - pauseOffsetRef.current;
    return Math.floor(Math.max(0, rawElapsed) / 1000);
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPhaseTimer = useCallback(
    (phaseDuration: number) => {
      phaseStartRef.current = Date.now();
      pauseOffsetRef.current = 0;
      setDisplayTime(
        phaseDuration <= 10 ? phaseDuration.toString() : formatTime(phaseDuration),
      );
      progress.value = 1;
    },
    [progress],
  );

  // Single consolidated tick effect — only re-runs when phase changes
  useEffect(() => {
    if (phase !== 'auto' && phase !== 'transition' && phase !== 'teleop') {
      clearTimer();
      return;
    }

    const duration =
      phase === 'auto' ? autonomous : phase === 'transition' ? transition : teleop;

    startPhaseTimer(duration);

    intervalRef.current = setInterval(() => {
      // Skip tick if paused
      if (pauseStartRef.current > 0) return;

      const elapsed = getElapsedSeconds();
      const remaining = duration - elapsed;

      setElapsed(elapsed);

      if (remaining <= 0) {
        clearTimer();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        progress.value = 0;

        // Use phaseRef.current to avoid stale closure
        if (phaseRef.current === 'auto') {
          setPhase('transition');
        } else if (phaseRef.current === 'transition') {
          setPhase('teleop');
        } else if (phaseRef.current === 'teleop') {
          setPhase('complete');
        }
        return;
      }

      // Update display; use phaseRef.current for accuracy
      if (phaseRef.current === 'transition') {
        setDisplayTime(remaining.toString());
      } else {
        setDisplayTime(formatTime(remaining));
      }

      progress.value = withTiming(remaining / duration, { duration: TICK_INTERVAL_MS });
    }, TICK_INTERVAL_MS);

    return () => clearTimer();
  }, [phase]); // Only re-run when phase changes

  // ─── Public actions ────────────────────────────────────────────────

  const start = useCallback(() => {
    if (phase !== 'idle' && phase !== 'complete') return;
    setPhase('auto');
  }, [phase, setPhase]);

  const pause = useCallback(() => {
    if (pauseStartRef.current > 0) {
      // Resume: add paused duration to offset
      pauseOffsetRef.current += Date.now() - pauseStartRef.current;
      pauseStartRef.current = 0;
      setIsPaused(false);
    } else {
      // Pause
      pauseStartRef.current = Date.now();
      setIsPaused(true);
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    // cancelAnimation is imported in MatchTimer for the progress SharedValue;
    // we reset the value directly here — the component owns the animation cancel.
    progress.value = 1;
    phaseStartRef.current = 0;
    pauseOffsetRef.current = 0;
    pauseStartRef.current = 0;
    setIsPaused(false);
    resetMatch();
    setDisplayTime('');
  }, [clearTimer, progress, resetMatch]);

  return {
    displayTime,
    phase,
    isPaused,
    progress,
    start,
    pause,
    reset,
  };
}

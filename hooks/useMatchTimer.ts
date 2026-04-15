// hooks/useMatchTimer.ts
import { useState, useEffect, useCallback, useRef } from "react";
import * as Haptics from "expo-haptics";
import { useMatchStore } from "../lib/store";
import type { MatchPhase } from "../types/match";
import type { SeasonConfig } from "../types/season";

const TICK_INTERVAL_MS = 200; // 5 ticks/sec — polling frequency only; timing is wall-clock
const COUNTDOWN_DURATION = 3;

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export interface UseMatchTimerResult {
  displayTime: string;
  phase: MatchPhase;
  isPaused: boolean;
  /** Plain JS number 0.0–1.0; 1.0 = full, 0.0 = empty. Drive a SharedValue from this in the component. */
  progressFraction: number;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export function useMatchTimer(season: SeasonConfig): UseMatchTimerResult {
  const { phase, setPhase, setElapsed, resetMatch } = useMatchStore();

  const intervalRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseStartTimeRef = useRef<number>(0);  // Date.now() when current phase started
  const pausedMsRef       = useRef<number>(0);  // accumulated paused milliseconds
  const pauseStartRef     = useRef<number>(0);  // Date.now() when paused; 0 = not paused

  // Keep phaseRef in sync so interval callbacks never close over a stale phase
  const phaseRef = useRef<MatchPhase>(phase);

  const { autonomous, transition, teleop } = season.timerDuration;

  const [displayTime, setDisplayTime]           = useState<string>("");
  const [isPaused, setIsPaused]                 = useState<boolean>(false);
  const [progressFraction, setProgressFraction] = useState<number>(1);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Returns wall-clock elapsed seconds since phase start, excluding paused time.
  // Returns null when currently paused — callers should bail out immediately.
  const getElapsed = useCallback((): number | null => {
    if (pauseStartRef.current > 0) return null;
    return (Date.now() - phaseStartTimeRef.current - pausedMsRef.current) / 1000;
  }, []);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPhaseTimer = useCallback((phaseDuration: number) => {
    phaseStartTimeRef.current = Date.now();
    pausedMsRef.current = 0;
    pauseStartRef.current = 0;
    setDisplayTime(formatTime(phaseDuration));
    setProgressFraction(1);
  }, []);

  // Single consolidated tick effect — only re-runs when phase changes
  useEffect(() => {
    if (
      phase !== "pre_auto" &&
      phase !== "pre_teleop" &&
      phase !== "auto" &&
      phase !== "transition" &&
      phase !== "teleop"
    ) {
      clearTimer();
      return;
    }

    // Countdown phases
    if (phase === "pre_auto" || phase === "pre_teleop") {
      const duration = COUNTDOWN_DURATION;
      startPhaseTimer(duration);

      intervalRef.current = setInterval(() => {
        const elapsedSec = getElapsed();
        if (elapsedSec === null) return;

        const remaining = duration - elapsedSec;

        if (remaining <= 0) {
          clearTimer();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          setProgressFraction(0);
          setPhase(phaseRef.current === "pre_auto" ? "auto" : "teleop");
          return;
        }

        setDisplayTime(formatTime(Math.ceil(remaining)));
        setProgressFraction(remaining / duration);
      }, TICK_INTERVAL_MS);

      return () => clearTimer();
    }

    // Active match phases
    const duration =
      phase === "auto" ? autonomous : phase === "transition" ? transition : teleop;

    startPhaseTimer(duration);

    intervalRef.current = setInterval(() => {
      const elapsedSec = getElapsed();
      if (elapsedSec === null) return;

      const remaining = duration - elapsedSec;

      setElapsed(Math.floor(elapsedSec));

      if (remaining <= 0) {
        clearTimer();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setProgressFraction(0);

        if (phaseRef.current === "auto") {
          setPhase("transition");
        } else if (phaseRef.current === "transition") {
          setPhase("teleop");
        } else if (phaseRef.current === "teleop") {
          setPhase("complete");
        }
        return;
      }

      setDisplayTime(formatTime(Math.ceil(remaining)));
      setProgressFraction(remaining / duration);
    }, TICK_INTERVAL_MS);

    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, autonomous, transition, teleop]);

  // Show initial time in idle based on startMode
  useEffect(() => {
    if (phase === "idle") {
      const startMode = useMatchStore.getState().startMode;
      const idleDuration = startMode === "teleop_only" ? teleop : autonomous;
      setDisplayTime(formatTime(idleDuration));
      setProgressFraction(1);
    }
  }, [phase, autonomous, teleop]);

  // ─── Public actions ────────────────────────────────────────────────

  const start = useCallback(() => {
    if (phase !== "idle" && phase !== "complete") return;
    const startMode = useMatchStore.getState().startMode;
    setDisplayTime(formatTime(COUNTDOWN_DURATION));
    setProgressFraction(1);
    setPhase(startMode === "teleop_only" ? "pre_teleop" : "pre_auto");
  }, [phase, setPhase]);

  const pause = useCallback(() => {
    if (phaseRef.current === "pre_auto" || phaseRef.current === "pre_teleop") return;
    if (pauseStartRef.current > 0) return; // already paused
    pauseStartRef.current = Date.now();
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    if (pauseStartRef.current === 0) return; // not paused
    pausedMsRef.current += Date.now() - pauseStartRef.current;
    pauseStartRef.current = 0;
    setIsPaused(false);
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    phaseStartTimeRef.current = 0;
    pausedMsRef.current = 0;
    pauseStartRef.current = 0;
    setIsPaused(false);
    setProgressFraction(1);
    resetMatch();
    // idle effect will set display time
  }, [clearTimer, resetMatch]);

  return {
    displayTime,
    phase,
    isPaused,
    progressFraction,
    start,
    pause,
    resume,
    reset,
  };
}

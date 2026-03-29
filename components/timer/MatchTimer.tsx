// components/timer/MatchTimer.tsx
import React, { useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useMatchStore } from '../../lib/store';
import type { MatchPhase } from '../../types/match';
import type { SeasonConfig } from '../../types/season';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 90;
const STROKE_WIDTH = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = (RADIUS + STROKE_WIDTH) * 2;
const TICK_INTERVAL_MS = 200; // Update 5x/sec for smooth display, drift-proof

interface MatchTimerProps {
  season: SeasonConfig;
}

const PHASE_COLORS: Record<MatchPhase, string> = {
  idle: '#3B82F6',
  auto: '#EF4444',
  transition: '#F59E0B',
  teleop: '#22C55E',
  complete: '#3B82F6',
};

export function MatchTimer({ season }: MatchTimerProps) {
  const { phase, setPhase, setElapsed, resetMatch } = useMatchStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseStartRef = useRef<number>(0);    // Date.now() when current phase started
  const pauseOffsetRef = useRef<number>(0);   // accumulated paused time in ms
  const pauseStartRef = useRef<number>(0);    // Date.now() when pause began

  const progress = useSharedValue(1);
  const pulseOpacity = useSharedValue(1);

  const { autonomous, transition, teleop } = season.timerDuration;

  const [displayTime, setDisplayTime] = React.useState('');
  const [isPaused, setIsPaused] = React.useState(false);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getElapsedSeconds = useCallback((): number => {
    if (phaseStartRef.current === 0) return 0;
    const now = Date.now();
    const rawElapsed = now - phaseStartRef.current - pauseOffsetRef.current;
    return Math.floor(Math.max(0, rawElapsed) / 1000);
  }, []);

  const getPhaseDuration = useCallback((): number => {
    if (phase === 'auto') return autonomous;
    if (phase === 'transition') return transition;
    if (phase === 'teleop') return teleop;
    return 0;
  }, [phase, autonomous, transition, teleop]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startPhaseTimer = useCallback((phaseDuration: number) => {
    phaseStartRef.current = Date.now();
    pauseOffsetRef.current = 0;
    setDisplayTime(phaseDuration <= 10 ? phaseDuration.toString() : formatTime(phaseDuration));
    progress.value = 1;
  }, [progress]);

  // ─── Single consolidated tick effect ──────────────────────────────
  useEffect(() => {
    if (phase !== 'auto' && phase !== 'transition' && phase !== 'teleop') {
      clearTimer();
      return;
    }

    const duration = phase === 'auto' ? autonomous : phase === 'transition' ? transition : teleop;
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

        if (phase === 'auto') {
          setPhase('transition');
        } else if (phase === 'transition') {
          setPhase('teleop');
        } else if (phase === 'teleop') {
          setPhase('complete');
        }
        return;
      }

      // Update display
      if (phase === 'transition') {
        setDisplayTime(remaining.toString());
        pulseOpacity.value = withRepeat(
          withSequence(
            withTiming(0.3, { duration: 300 }),
            withTiming(1, { duration: 300 }),
          ),
          1,
          false,
        );
      } else {
        setDisplayTime(formatTime(remaining));
      }
      progress.value = withTiming(remaining / duration, { duration: TICK_INTERVAL_MS });
    }, TICK_INTERVAL_MS);

    return () => clearTimer();
  }, [phase]); // Only re-run when phase changes — no advanceTimer dependency

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const strokeColor = PHASE_COLORS[phase];

  const handleStart = () => {
    if (phase !== 'idle' && phase !== 'complete') return;
    setPhase('auto');
  };

  const handlePause = () => {
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
  };

  const handleReset = () => {
    clearTimer();
    cancelAnimation(progress);
    progress.value = 1;
    phaseStartRef.current = 0;
    pauseOffsetRef.current = 0;
    pauseStartRef.current = 0;
    setIsPaused(false);
    resetMatch();
    setDisplayTime('');
  };

  const renderCenterContent = () => {
    if (phase === 'idle') {
      return (
        <TouchableOpacity onPress={handleStart} className="bg-[#3B82F6] px-6 py-3 rounded-2xl">
          <Text className="text-white font-bold text-lg">START</Text>
        </TouchableOpacity>
      );
    }
    if (phase === 'complete') {
      return (
        <View className="items-center">
          <Text className="text-[#22C55E] font-bold text-sm">MATCH</Text>
          <Text className="text-[#22C55E] font-bold text-sm">COMPLETE</Text>
        </View>
      );
    }
    if (phase === 'transition') {
      return (
        <Animated.View style={{ opacity: pulseOpacity }} className="items-center">
          <Text className="text-[#F59E0B] font-bold text-xs">TRANSITION</Text>
          <Text className="text-[#F59E0B] font-bold text-4xl">{displayTime}</Text>
        </Animated.View>
      );
    }
    return (
      <View className="items-center">
        <Text className={`font-bold text-xs ${phase === 'auto' ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}>
          {phase === 'auto' ? 'AUTONOMOUS' : 'TELEOP'}
        </Text>
        <Text className="text-[#F5F5F5] font-bold text-4xl">{displayTime}</Text>
      </View>
    );
  };

  return (
    <View className="items-center">
      <View style={{ width: SIZE, height: SIZE }} className="items-center justify-center">
        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
          <Circle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            stroke="#2A2A2A" strokeWidth={STROKE_WIDTH} fill="none"
          />
          <AnimatedCircle
            cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
            stroke={strokeColor} strokeWidth={STROKE_WIDTH} fill="none"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            animatedProps={ringProps} strokeLinecap="round"
            rotation="-90" origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        {renderCenterContent()}
      </View>

      {phase !== 'idle' && phase !== 'complete' && (
        <View className="flex-row gap-3 mt-3">
          <TouchableOpacity onPress={handlePause} className="bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-2 rounded-xl">
            <Text className="text-[#F5F5F5] text-sm">{isPaused ? 'RESUME' : 'PAUSE'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleReset} className="bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-2 rounded-xl">
            <Text className="text-[#9CA3AF] text-sm">RESET</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

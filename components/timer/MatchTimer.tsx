// components/timer/MatchTimer.tsx
import React, { useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation,
  runOnJS,
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
  const secondsRef = useRef(0);
  const pausedRef = useRef(false);

  const progress = useSharedValue(1); // 1 = full ring, 0 = empty
  const pulseOpacity = useSharedValue(1);

  const { autonomous, transition, teleop } = season.timerDuration;

  const [displayTime, setDisplayTime] = React.useState('');
  const [isPaused, setIsPaused] = React.useState(false);

  const triggerHaptic = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  const animateTransitionPulse = useCallback(() => {
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 300 }),
        withTiming(1, { duration: 300 }),
      ),
      6,
      false,
    );
  }, [pulseOpacity]);

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const advanceTimer = useCallback(() => {
    if (pausedRef.current) return;

    secondsRef.current += 1;
    const elapsed = secondsRef.current;
    setElapsed(elapsed);

    if (phase === 'auto') {
      const remaining = autonomous - elapsed;
      setDisplayTime(formatTime(Math.max(0, remaining)));
      progress.value = withTiming(remaining / autonomous, { duration: 800 });

      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        secondsRef.current = 0;
        runOnJS(triggerHaptic)();
        runOnJS(animateTransitionPulse)();
        setPhase('transition');
      }
    } else if (phase === 'transition') {
      const remaining = transition - elapsed;
      setDisplayTime(remaining > 0 ? remaining.toString() : '0');
      progress.value = withTiming(remaining / transition, { duration: 800 });

      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        secondsRef.current = 0;
        runOnJS(triggerHaptic)();
        setPhase('teleop');
      }
    } else if (phase === 'teleop') {
      const remaining = teleop - elapsed;
      setDisplayTime(formatTime(Math.max(0, remaining)));
      progress.value = withTiming(remaining / teleop, { duration: 800 });

      if (remaining <= 0) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        runOnJS(triggerHaptic)();
        setPhase('complete');
      }
    }
  }, [phase, autonomous, transition, teleop, progress, setElapsed, setPhase, triggerHaptic, animateTransitionPulse]);

  useEffect(() => {
    if (phase === 'auto' || phase === 'transition' || phase === 'teleop') {
      secondsRef.current = 0;

      if (phase === 'auto') {
        setDisplayTime(formatTime(autonomous));
        progress.value = 1;
      } else if (phase === 'transition') {
        setDisplayTime(transition.toString());
        progress.value = 1;
      } else if (phase === 'teleop') {
        setDisplayTime(formatTime(teleop));
        progress.value = 1;
      }

      intervalRef.current = setInterval(advanceTimer, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  // Re-register interval when advanceTimer changes (phase-based dependency)
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(advanceTimer, 1000);
    }
  }, [advanceTimer]);

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const strokeColor = PHASE_COLORS[phase];

  const handleStart = () => {
    if (phase !== 'idle' && phase !== 'complete') return;
    secondsRef.current = 0;
    setDisplayTime(formatTime(autonomous));
    progress.value = 1;
    setPhase('auto');
  };

  const handlePause = () => {
    pausedRef.current = !pausedRef.current;
    setIsPaused(pausedRef.current);
  };

  const handleReset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    cancelAnimation(progress);
    progress.value = 1;
    secondsRef.current = 0;
    pausedRef.current = false;
    setIsPaused(false);
    resetMatch();
    setDisplayTime('');
  };

  const renderCenterContent = () => {
    if (phase === 'idle') {
      return (
        <TouchableOpacity
          onPress={handleStart}
          className="bg-[#3B82F6] px-6 py-3 rounded-2xl"
        >
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
          {/* Background ring */}
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#2A2A2A"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
          {/* Animated progress ring */}
          <AnimatedCircle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={strokeColor}
            strokeWidth={STROKE_WIDTH}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            animatedProps={ringProps}
            strokeLinecap="round"
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        {renderCenterContent()}
      </View>

      {/* Phase label */}
      {phase !== 'idle' && phase !== 'complete' && (
        <View className="flex-row gap-3 mt-3">
          <TouchableOpacity
            onPress={handlePause}
            className="bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-2 rounded-xl"
          >
            <Text className="text-[#F5F5F5] text-sm">{isPaused ? 'RESUME' : 'PAUSE'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleReset}
            className="bg-[#1A1A1A] border border-[#2A2A2A] px-4 py-2 rounded-xl"
          >
            <Text className="text-[#9CA3AF] text-sm">RESET</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

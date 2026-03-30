// components/timer/MatchTimer.tsx
import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { useMatchTimer } from '../../hooks/useMatchTimer';
import type { SeasonConfig } from '../../types/season';
import type { MatchPhase } from '../../types/match';

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
  const { displayTime, phase, isPaused, progressFraction, start, pause, resume, reset } =
    useMatchTimer(season);

  // This component owns the SharedValue so Reanimated can drive the ring on the UI thread.
  const progress: SharedValue<number> = useSharedValue(1);

  // Sync progressFraction (plain JS number from hook) into the SharedValue via withTiming
  // so the ring animates smoothly between ticks.
  useEffect(() => {
    progress.value = withTiming(progressFraction, { duration: 200 });
  }, [progressFraction]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pulse opacity animation — lives in the component because it drives SVG/Animated.View
  const pulseOpacity = useSharedValue(1);

  useEffect(() => {
    if (phase === 'transition') {
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 400 }),
          withTiming(1, { duration: 400 }),
        ),
        -1, // infinite repeat
        false,
      );
      return () => cancelAnimation(pulseOpacity);
    }
    cancelAnimation(pulseOpacity);
    pulseOpacity.value = 1;
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cancel any in-flight progress animation before reset to avoid stale animation frames.
  const handleReset = () => {
    cancelAnimation(progress);
    reset();
  };

  const ringProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const strokeColor = PHASE_COLORS[phase];

  const renderCenterContent = () => {
    if (phase === 'idle') {
      return (
        <TouchableOpacity onPress={start} className="bg-[#3B82F6] px-6 py-3 rounded-2xl">
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
        <Text
          className={`font-bold text-xs ${phase === 'auto' ? 'text-[#EF4444]' : 'text-[#22C55E]'}`}
        >
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
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="#2A2A2A"
            strokeWidth={STROKE_WIDTH}
            fill="none"
          />
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

      {phase !== 'idle' && phase !== 'complete' && (
        <View className="flex-row gap-3 mt-3">
          <TouchableOpacity
            onPress={isPaused ? resume : pause}
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

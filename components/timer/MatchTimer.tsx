// components/timer/MatchTimer.tsx
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { BounceButton } from "../ui/AnimatedPressable";
import Animated, {
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  cancelAnimation,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useMatchTimer } from "../../hooks/useMatchTimer";
import type { SeasonConfig } from "../../types/season";
import type { MatchPhase } from "../../types/match";
import { FlipTimeDisplay } from "./FlipDigit";
import THEME from "../../lib/theme";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 90;
const STROKE_WIDTH = 8;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const SIZE = (RADIUS + STROKE_WIDTH) * 2;

interface MatchTimerProps {
  season: SeasonConfig;
}

const PHASE_COLORS: Record<MatchPhase, string> = {
  idle: THEME.colors.phaseIdle,
  pre_auto: THEME.colors.phasePreAuto,
  auto: THEME.colors.phaseAuto,
  transition: THEME.colors.phaseTransition,
  pre_teleop: THEME.colors.phasePreTeleop,
  teleop: THEME.colors.phaseTeleop,
  complete: THEME.colors.phaseComplete,
};

export function MatchTimer({ season }: MatchTimerProps) {
  const {
    displayTime,
    phase,
    isPaused,
    progressFraction,
    start,
    pause,
    resume,
    reset,
  } = useMatchTimer(season);

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
    if (phase === "transition") {
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
    if (phase === "idle") {
      return (
        <BounceButton
          onPress={start}
          className="px-6 py-3 rounded-2xl"
          style={{ backgroundColor: THEME.colors.phaseIdle }}
        >
          <Text className="text-on-surface font-bold text-[18px]">START</Text>
        </BounceButton>
      );
    }
    if (phase === "complete") {
      return (
        <View className="items-center">
          <Text
            style={{
              color: THEME.colors.phaseTeleop,
              fontWeight: "700",
              fontSize: 12,
            }}
          >
            MATCH
          </Text>
          <Text
            style={{
              color: THEME.colors.phaseTeleop,
              fontWeight: "700",
              fontSize: 12,
            }}
          >
            COMPLETE
          </Text>
        </View>
      );
    }
    if (phase === "transition") {
      return (
        <Animated.View
          style={{ opacity: pulseOpacity }}
          className="items-center"
        >
          <Text
            style={{
              color: THEME.colors.phaseTransition,
              fontWeight: "700",
              fontSize: 12,
            }}
          >
            TRANSITION
          </Text>
          <FlipTimeDisplay
            displayTime={displayTime}
            fontSize={36}
            color={THEME.colors.phaseTransition}
          />
        </Animated.View>
      );
    }
    // pre_auto, pre_teleop, auto, teleop — all share the same label/time layout
    const isAuto = phase === "pre_auto" || phase === "auto";
    return (
      <View className="items-center">
        <Text
          style={{
            fontWeight: "700",
            fontSize: 12,
            color: isAuto ? THEME.colors.phaseAuto : THEME.colors.phaseTeleop,
          }}
        >
          {isAuto ? "AUTONOMOUS" : "TELEOP"}
        </Text>
        <FlipTimeDisplay
          displayTime={displayTime}
          fontSize={36}
          color={THEME.colors.currentValue}
        />
      </View>
    );
  };

  return (
    <View className="items-center">
      <View
        style={{ width: SIZE, height: SIZE }}
        className="items-center justify-center"
      >
        <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={THEME.colors.border}
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

      {phase !== "idle" && phase !== "complete" && (
        <View className="flex-row gap-3 mt-3">
          {phase !== "pre_auto" && phase !== "pre_teleop" && (
            <BounceButton
              onPress={isPaused ? resume : pause}
              className="bg-surface border border-outline-variant px-4 py-2 rounded-xl"
            >
              <Text className="text-on-surface text-sm">
                {isPaused ? "RESUME" : "PAUSE"}
              </Text>
            </BounceButton>
          )}
          <BounceButton
            onPress={handleReset}
            className="bg-surface border border-outline-variant px-4 py-2 rounded-xl"
          >
            <Text className="text-on-surface-variant text-sm">RESET</Text>
          </BounceButton>
        </View>
      )}
    </View>
  );
}

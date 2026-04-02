import React, { useCallback, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface VerticalDialProps {
  value: number;
  min: number;
  max?: number;
  step: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  height?: number;
  width?: number;
  label?: string;
  labelColor?: string;
}

const STEP_PX = 30; // pixels of drag per step change

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 200,
  mass: 0.5,
};

export function VerticalDial({
  value,
  min,
  max,
  step,
  onChange,
  disabled = false,
  height = 100,
  width = 80,
  label,
  labelColor,
}: VerticalDialProps) {
  const accumulatedY = useSharedValue(0);
  const slideY = useSharedValue(0);
  const lastSteppedValue = useRef(value);

  // Keep ref in sync when value changes externally
  if (lastSteppedValue.current !== value) {
    lastSteppedValue.current = value;
  }

  const fireChange = useCallback(
    (newVal: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(newVal);
    },
    [onChange],
  );

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((e) => {
      const delta = e.translationY - accumulatedY.value;
      // Negative translationY = drag up = increment
      const stepsToFire = Math.floor(Math.abs(delta) / STEP_PX);
      if (stepsToFire > 0) {
        const direction = delta < 0 ? 1 : -1; // up = +, down = -
        const currentVal = lastSteppedValue.current;
        let newVal = currentVal + direction * step * stepsToFire;

        // Clamp
        newVal = Math.max(min, newVal);
        if (max !== undefined) newVal = Math.min(max, newVal);

        if (newVal !== currentVal) {
          lastSteppedValue.current = newVal;
          runOnJS(fireChange)(newVal);
        }

        accumulatedY.value += direction < 0 ? -stepsToFire * STEP_PX : stepsToFire * STEP_PX;
      }

      // Visual slide (clamped for feel)
      slideY.value = e.translationY * 0.3;
    })
    .onEnd(() => {
      accumulatedY.value = 0;
      slideY.value = withSpring(0, SPRING_CONFIG);
    });

  const animatedNumbers = useAnimatedStyle(() => ({
    transform: [{ translateY: slideY.value }],
  }));

  const prevValue = value - step;
  const nextValue = value + step;
  const showPrev = prevValue >= min;
  const showNext = max === undefined || nextValue <= max;

  const cellH = height / 3;

  return (
    <View style={[styles.container, { height, width }]}>
      {label && (
        <Text
          style={[styles.label, labelColor ? { color: labelColor } : undefined]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
      <GestureDetector gesture={pan}>
        <Animated.View style={[styles.track, { height, width, borderRadius: width * 0.2 }]}>
          <Animated.View style={[styles.numbersContainer, animatedNumbers]}>
            {/* Previous value */}
            <View style={[styles.cell, { height: cellH }]}>
              {showPrev && (
                <Text style={styles.fadedValue}>
                  {String(prevValue).padStart(2, '0')}
                </Text>
              )}
            </View>

            {/* Current value */}
            <View style={[styles.cell, { height: cellH }]}>
              <Text style={styles.currentValue}>
                {String(value).padStart(2, '0')}
              </Text>
            </View>

            {/* Next value */}
            <View style={[styles.cell, { height: cellH }]}>
              {showNext && (
                <Text style={styles.fadedValue}>
                  {String(nextValue).padStart(2, '0')}
                </Text>
              )}
            </View>
          </Animated.View>

          {/* Top/bottom gradient overlays for depth effect */}
          <View style={[styles.gradientTop, { borderTopLeftRadius: width * 0.2, borderTopRightRadius: width * 0.2 }]} pointerEvents="none" />
          <View style={[styles.gradientBottom, { borderBottomLeftRadius: width * 0.2, borderBottomRightRadius: width * 0.2 }]} pointerEvents="none" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 9,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#9CA3AF',
    marginBottom: 4,
    textAlign: 'center',
  },
  track: {
    backgroundColor: 'rgba(42, 42, 42, 0.6)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numbersContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fadedValue: {
    fontSize: 22,
    fontWeight: '900',
    color: 'rgba(245, 245, 245, 0.2)',
    textAlign: 'center',
  },
  currentValue: {
    fontSize: 36,
    fontWeight: '900',
    color: '#F5F5F5',
    textAlign: 'center',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(10, 14, 22, 0.5)',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'rgba(10, 14, 22, 0.5)',
  },
});

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';

interface FlipDigitProps {
  digit: string;
  fontSize: number;
  color: string;
}

const ANIM_DURATION = 150;

function FlipDigitCell({ digit, fontSize, color }: FlipDigitProps) {
  const prevDigit = useRef(digit);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const height = fontSize * 1.2;

  useEffect(() => {
    if (prevDigit.current !== digit) {
      prevDigit.current = digit;
      // Old digit slides up and fades; new digit slides in from below
      translateY.value = withSequence(
        withTiming(-height * 0.4, { duration: ANIM_DURATION, easing: Easing.out(Easing.quad) }),
        withTiming(height * 0.4, { duration: 0 }),
        withTiming(0, { duration: ANIM_DURATION, easing: Easing.out(Easing.quad) }),
      );
      opacity.value = withSequence(
        withTiming(0, { duration: ANIM_DURATION, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 0 }),
        withTiming(1, { duration: ANIM_DURATION, easing: Easing.out(Easing.quad) }),
      );
    }
  }, [digit]); // eslint-disable-line react-hooks/exhaustive-deps

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.digitContainer, { width: fontSize * 0.65, height }]}>
      <Animated.Text
        style={[
          {
            fontSize,
            color,
            fontWeight: '900',
            fontVariant: ['tabular-nums'],
            textAlign: 'center',
            lineHeight: height,
          },
          animatedStyle,
        ]}
      >
        {digit}
      </Animated.Text>
    </View>
  );
}

interface FlipTimeDisplayProps {
  displayTime: string;
  fontSize: number;
  color: string;
}

export function FlipTimeDisplay({ displayTime, fontSize, color }: FlipTimeDisplayProps) {
  const chars = displayTime.split('');

  return (
    <View style={styles.row}>
      {chars.map((char, index) => {
        if (char === ':') {
          return (
            <Animated.Text
              key={`colon-${index}`}
              style={{
                fontSize,
                color,
                fontWeight: '900',
                lineHeight: fontSize * 1.2,
                textAlign: 'center',
              }}
            >
              :
            </Animated.Text>
          );
        }
        return (
          <FlipDigitCell
            key={`digit-${index}`}
            digit={char}
            fontSize={fontSize}
            color={color}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitContainer: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

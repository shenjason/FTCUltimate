import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";

interface FlipDigitProps {
  digit: string;
  fontSize: number;
  color: string;
}

const ANIM_DURATION = 150;

function FlipDigitCell({ digit, fontSize, color }: FlipDigitProps) {
  const [currentDigit, setCurrentDigit] = useState(digit);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const height = fontSize * 1.2;

  useEffect(() => {
    if (currentDigit === digit) return;
    // capture the primitive target to avoid referencing mutable refs inside the worklet
    const targetDigit = digit;

    // animate old digit out
    translateY.value = withTiming(
      -height * 0.4,
      { duration: ANIM_DURATION, easing: Easing.out(Easing.quad) },
      (finished) => {
        if (!finished) return;
        // swap to new digit on JS thread using the captured primitive
        runOnJS(setCurrentDigit)(targetDigit);
        // jump new digit in from below then animate into place
        translateY.value = height * 0.4;
        translateY.value = withTiming(0, {
          duration: ANIM_DURATION,
          easing: Easing.out(Easing.quad),
        });
      },
    );

    // fade sequence
    opacity.value = withTiming(
      0,
      { duration: ANIM_DURATION, easing: Easing.out(Easing.quad) },
      (finished) => {
        if (!finished) return;
        opacity.value = withTiming(1, {
          duration: ANIM_DURATION,
          easing: Easing.out(Easing.quad),
        });
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digit]);

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
            fontWeight: "900",
            fontVariant: ["tabular-nums"],
            textAlign: "center",
            lineHeight: height,
          },
          animatedStyle,
        ]}
      >
        {currentDigit}
      </Animated.Text>
    </View>
  );
}

interface FlipTimeDisplayProps {
  displayTime: string;
  fontSize: number;
  color: string;
}

export function FlipTimeDisplay({
  displayTime,
  fontSize,
  color,
}: FlipTimeDisplayProps) {
  const chars = displayTime.split("");

  return (
    <View style={styles.row}>
      {chars.map((char, index) => {
        if (char === ":") {
          return (
            <Animated.Text
              key={`colon-${index}`}
              style={{
                fontSize,
                color,
                fontWeight: "900",
                lineHeight: fontSize * 1.2,
                textAlign: "center",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  digitContainer: {
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
});

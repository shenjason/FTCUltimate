import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { View, Text, StyleSheet } from "react-native";
import THEME from "../../lib/theme";
import { WheelPicker } from "react-native-infinite-wheel-picker";
import * as Haptics from "expo-haptics";

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

export function VerticalDial({
  value,
  min,
  max,
  step,
  onChange,
  disabled = false,
  height = 100,
  width = 160,
  label,
  labelColor,
}: VerticalDialProps) {
  const safeStep = step > 0 ? step : 1;

  // Build finite data array (WheelPicker needs a finite list)
  const effectiveMax = typeof max === "number" ? max : min + safeStep * 20;
  const data: number[] = [];
  for (let v = min; v <= effectiveMax; v += safeStep) {
    data.push(v);
    // safety guard to avoid accidental infinite loops
    if (data.length > 1000) break;
  }

  // compute initial selected index from provided value
  const clampIndex = (val: number) => {
    if (typeof val !== "number" || Number.isNaN(val)) return 0;
    if (val <= data[0]) return 0;
    if (val >= data[data.length - 1]) return data.length - 1;
    return Math.round((val - min) / safeStep);
  };

  const initialIndex = clampIndex(value);
  const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex);
  const prevIndexRef = useRef<number>(initialIndex);
  const wheelRef = useRef<any>(null);
  const animTimerRef = useRef<any>(null);
  const suppressOnChangeRef = useRef(false);
  const suppressClearTimerRef = useRef<any>(null);
  const ANIMATION_DURATION = 200; // ms, chosen by user

  // Immediately clamp selected index when the dial's range changes (synchronous
  // to avoid rendering the wheel with an out-of-range index when switching
  // modules). useLayoutEffect runs before paint.
  useLayoutEffect(() => {
    const idx = clampIndex(value);
    if (!Number.isNaN(idx) && idx !== selectedIndex) {
      prevIndexRef.current = idx;
      setSelectedIndex(idx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max, step, value]);

  // Animate when the external value changes (only dependent on `value`). This
  // runs after paint and attempts to scroll the wheel programmatically.
  useEffect(() => {
    const idx = clampIndex(value);
    if (Number.isNaN(idx) || idx === selectedIndex) return;

    // clear any existing animation timer
    if (animTimerRef.current) {
      clearInterval(animTimerRef.current);
      animTimerRef.current = null;
    }

    // Try to use the wheel picker's programmatic API if available
    const picker = wheelRef.current as any;
    let handled = false;
    try {
      if (picker) {
        if (typeof picker.scrollToIndex === "function") {
          // Suppress parent `onChange` while we programmatically move the
          // wheel. The WheelPicker implementation calls `onChangeValue` from
          // its `scrollToIndex` imperative method, so without suppression the
          // parent would receive a duplicate update when the +/- buttons
          // already updated the store.
          suppressOnChangeRef.current = true;
          // clear any previous clear timers
          if (suppressClearTimerRef.current) {
            clearTimeout(suppressClearTimerRef.current);
            suppressClearTimerRef.current = null;
          }

          try {
            picker.scrollToIndex(idx);
          } catch (e) {
            try {
              picker.scrollToIndex(idx, true);
            } catch (e2) {
              // ignore
            }
          }

          // Clear suppression after animation completes (with small buffer)
          suppressClearTimerRef.current = setTimeout(() => {
            suppressOnChangeRef.current = false;
            suppressClearTimerRef.current = null;
          }, ANIMATION_DURATION + 80);

          handled = true;
        }
      }
    } catch (e) {
      // ignore and fallback
    }

    if (handled) {
      prevIndexRef.current = idx;
      setSelectedIndex(idx);
      return;
    }

    // Fallback: step the index in small increments to simulate a scroll animation
    const diff = idx - prevIndexRef.current;
    const steps = Math.abs(diff);
    if (steps === 0) {
      prevIndexRef.current = idx;
      setSelectedIndex(idx);
      return;
    }

    const minInterval = 16; // ms per step (approx one frame)
    const interval = Math.max(
      minInterval,
      Math.floor(ANIMATION_DURATION / steps),
    );
    let current = prevIndexRef.current;
    const dir = diff > 0 ? 1 : -1;

    // Suppress onChange while we perform the fallback stepping animation
    suppressOnChangeRef.current = true;
    animTimerRef.current = setInterval(() => {
      current += dir;
      prevIndexRef.current = current;
      setSelectedIndex(current);
      if (current === idx && animTimerRef.current) {
        clearInterval(animTimerRef.current);
        animTimerRef.current = null;
        // clear suppression after fallback animation
        suppressOnChangeRef.current = false;
      }
    }, interval);

    // cleanup if dependencies change
    return () => {
      if (animTimerRef.current) {
        clearInterval(animTimerRef.current);
        animTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const fireChange = useCallback(
    (newVal: number) => {
      // gentle haptic feedback on wheel change
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onChange(newVal);
    },
    [onChange],
  );

  const elementHeight = Math.max(26, Math.floor(height / 3));
  const restElements = 1; // show smaller preview

  // Ensure any running timers are cleared on unmount
  useEffect(() => {
    return () => {
      if (animTimerRef.current) {
        clearInterval(animTimerRef.current);
        animTimerRef.current = null;
      }
      if (suppressClearTimerRef.current) {
        clearTimeout(suppressClearTimerRef.current);
        suppressClearTimerRef.current = null;
      }
      suppressOnChangeRef.current = false;
    };
  }, []);

  // Debug: warn if selected index resolves to undefined data on mount/update
  useEffect(() => {
    const current = data[selectedIndex];
    if (typeof current === "undefined") {
      // eslint-disable-next-line no-console
      console.warn("VerticalDial: selectedIndex has no corresponding data", {
        selectedIndex,
        dataLength: data.length,
        value,
        min,
        max,
        step,
      });
    }
  }, [selectedIndex, data, value, min, max, step]);

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

      <View
        style={[styles.track, { height, width, borderRadius: width * 0.2 }]}
      >
        <WheelPicker
          ref={wheelRef}
          initialSelectedIndex={selectedIndex}
          selectedIndex={selectedIndex}
          data={data}
          restElements={restElements}
          elementHeight={elementHeight}
          infiniteScroll={false}
          containerStyle={[styles.containerStyle, { width }]}
          selectedLayoutStyle={styles.selectedLayoutStyle}
          elementTextStyle={[
            styles.currentValue,
            { lineHeight: elementHeight },
          ]}
          onChangeValue={(index: number, val: string) => {
            const last = data.length - 1;
            const prev = prevIndexRef.current;

            // Prevent wrap-around: if we were at last and got 0 → clamp to last
            if (prev === last && index === 0) {
              if (prev !== last) {
                prevIndexRef.current = last;
                if (selectedIndex !== last) setSelectedIndex(last);
              }
              return;
            }

            // Prevent backward wrap: if we were at 0 and got last → clamp to 0
            if (prev === 0 && index === last) {
              if (prev !== 0) {
                prevIndexRef.current = 0;
                if (selectedIndex !== 0) setSelectedIndex(0);
              }
              return;
            }

            const numeric = Number(val);
            if (Number.isNaN(numeric)) return;

            // Only update internal index if it changed
            if (index !== prev) {
              prevIndexRef.current = index;
              setSelectedIndex(index);
            }

            // Only notify parent when the numeric value actually differs.
            // If we're in a programmatic scroll (suppressOnChangeRef), skip
            // notifying the parent because the parent already triggered the
            // scroll (e.g. via +/- buttons) and would otherwise receive a
            // duplicate update.
            if (!suppressOnChangeRef.current && numeric !== value) {
              fireChange(numeric);
            }
          }}
        />

        {/* Debug overlay when wheel picker doesn't render a value */}
        {typeof data[selectedIndex] === "undefined" && (
          <View
            style={{
              position: "absolute",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              width: "100%",
            }}
            pointerEvents="none"
          >
            <Text style={{ color: THEME.colors.gold, fontWeight: "900" }}>
              —
            </Text>
            <Text style={{ color: THEME.colors.gold, fontSize: 10 }}>
              {`idx:${selectedIndex} len:${data.length}`}
            </Text>
          </View>
        )}

        <View
          style={[
            styles.gradientTop,
            {
              borderTopLeftRadius: width * 0.2,
              borderTopRightRadius: width * 0.2,
            },
          ]}
          pointerEvents="none"
        />
        <View
          style={[
            styles.gradientBottom,
            {
              borderBottomLeftRadius: width * 0.2,
              borderBottomRightRadius: width * 0.2,
            },
          ]}
          pointerEvents="none"
        />
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 9,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: THEME.colors.labelMuted,
    marginBottom: 4,
    textAlign: "center",
  },
  track: {
    backgroundColor: THEME.colors.trackBg,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  numbersContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  cell: {
    justifyContent: "center",
    alignItems: "center",
  },
  fadedValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "rgba(245, 245, 245, 0.2)",
    textAlign: "center",
  },
  currentValue: {
    fontSize: 36,
    fontWeight: "900",
    color: THEME.colors.currentValue,
    textAlign: "center",
  },
  gradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: THEME.colors.gradientOverlay,
  },
  gradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: THEME.colors.gradientOverlay,
  },
  selectedLayoutStyle: {
    backgroundColor: THEME.colors.selectedLayoutBg,
    borderRadius: 2,
  },
  containerStyle: {
    backgroundColor: THEME.colors.containerBg,
    width: 160,
  },
});

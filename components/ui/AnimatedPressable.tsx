import React, { useCallback } from 'react';
import { Pressable, type ViewStyle, type StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 300,
  mass: 0.6,
};

interface Props {
  onPress?: () => void;
  onLongPress?: () => void;
  disabled?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  hitSlop?: { top?: number; bottom?: number; left?: number; right?: number } | number;
  children: React.ReactNode;
}

export function BounceButton({
  onPress,
  onLongPress,
  disabled,
  className,
  style,
  hitSlop,
  children,
}: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.93, SPRING_CONFIG);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING_CONFIG);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      className={className}
      style={[animatedStyle, style]}
      hitSlop={hitSlop}
    >
      {children}
    </AnimatedPressable>
  );
}

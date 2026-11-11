import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, interpolate, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

const PARTICLES = [
  { x: -90, delay: 0, size: 26 },
  { x: -52, delay: 120, size: 34 },
  { x: -14, delay: 40, size: 28 },
  { x: 24, delay: 180, size: 36 },
  { x: 62, delay: 80, size: 26 },
  { x: 96, delay: 220, size: 30 },
];

function Particle({ emoji, x, delay, size, trigger }: { emoji: string; x: number; delay: number; size: number; trigger: number }) {
  const t = useSharedValue(0);
  useEffect(() => {
    if (trigger === 0) return;
    t.value = 0;
    t.value = withDelay(delay, withTiming(1, { duration: 1300, easing: Easing.out(Easing.quad) }));
  }, [trigger, delay, t]);
  const style = useAnimatedStyle(() => ({
    opacity: interpolate(t.value, [0, 0.1, 0.75, 1], [0, 1, 1, 0]),
    transform: [
      { translateX: x + interpolate(t.value, [0, 1], [0, x * 0.25]) },
      { translateY: interpolate(t.value, [0, 1], [40, -150]) },
      { scale: interpolate(t.value, [0, 0.2, 1], [0.4, 1.1, 0.9]) },
    ],
  }));
  return <Animated.Text style={[styles.particle, { fontSize: size }, style]}>{emoji}</Animated.Text>;
}

/** Emoji that float up and fade: a gift arriving, a reveal, a small celebration. */
export function Burst({ emoji, trigger }: { emoji: string; trigger: number }) {
  return (
    <View style={styles.layer} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {PARTICLES.map((p, i) => (
        <Particle key={i} emoji={emoji} trigger={trigger} {...p} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute' },
});

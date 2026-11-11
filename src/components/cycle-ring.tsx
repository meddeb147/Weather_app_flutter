import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { phaseSegments, type Prediction } from '@/lib/cycle/engine';
import { PHASE_COLORS } from '@/lib/mascots';

import { colors } from './theme';

const STROKE = 14;
const GAP = 7;

/** Her whole cycle as a ring of four phase arcs, with a marker for today. */
export function CycleRing({ prediction, size = 280, children }: { prediction: Prediction | null; size?: number; children: ReactNode }) {
  const r = (size - STROKE - 10) / 2;
  const c = 2 * Math.PI * r;
  const segments = prediction ? phaseSegments(prediction) : [];
  const total = segments.reduce((sum, s) => sum + s.days, 0) || 1;
  const day = prediction ? Math.min(prediction.cycleDay, total) : 0;
  const targetAngle = ((day - 0.5) / total) * 360;

  const angle = useSharedValue(0);
  useEffect(() => {
    angle.value = withDelay(250, withSpring(targetAngle, { damping: 16, stiffness: 60 }));
  }, [angle, targetAngle]);
  const markerStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${angle.value}deg` }] }));

  let offset = 0;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', direction: 'ltr' }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={STROKE} fill="none" />
        {segments.map((s) => {
          const length = (s.days / total) * c;
          const start = offset;
          offset += length;
          return (
            <Circle
              key={s.phase}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={PHASE_COLORS[s.phase]}
              strokeWidth={STROKE}
              strokeLinecap="round"
              fill="none"
              opacity={prediction?.phase === s.phase ? 1 : 0.45}
              strokeDasharray={`${Math.max(1, length - GAP - STROKE)} ${c}`}
              strokeDashoffset={-(start + (GAP + STROKE) / 2)}
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          );
        })}
      </Svg>
      {prediction && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.markerLayer, markerStyle]} pointerEvents="none">
          <View style={[styles.marker, { borderColor: PHASE_COLORS[prediction.phase], marginTop: 5 + STROKE / 2 - 13 }]} />
        </Animated.View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  markerLayer: { alignItems: 'center' },
  marker: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.white, borderWidth: 6 },
});

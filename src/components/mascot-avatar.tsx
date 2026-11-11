import { StyleSheet, Text, View } from 'react-native';

import type { Phase } from '@/lib/cycle/engine';
import { MASCOTS, MOON_CHARM, type MascotId } from '@/lib/mascots';

/**
 * Placeholder mascot drawn with plain shapes. It will be replaced by the Rive
 * animations once the 3D renders described in docs/mascots exist.
 */
export function MascotAvatar({ mascot, phase, size = 180 }: { mascot: MascotId; phase?: Phase | null; size?: number }) {
  const look = MASCOTS[mascot];
  const u = size / 100;
  const sleepy = phase === 'menstrual' || phase === 'luteal';
  const earStyle =
    look.ears === 'pointed'
      ? { width: 30 * u, height: 30 * u, borderRadius: 6 * u, transform: [{ rotate: '45deg' }], top: 6 * u }
      : look.ears === 'big'
        ? { width: 38 * u, height: 38 * u, borderRadius: 19 * u, top: 2 * u }
        : { width: 26 * u, height: 26 * u, borderRadius: 13 * u, top: 4 * u };

  return (
    <View style={{ width: size, height: size }} accessible accessibilityRole="image" accessibilityLabel={mascot}>
      {look.ears !== 'none' && (
        <>
          <View style={[styles.abs, earStyle, { left: (look.ears === 'big' ? 0 : 12) * u, backgroundColor: look.ears === 'pointed' ? look.secondary : look.main }]} />
          <View style={[styles.abs, earStyle, { right: (look.ears === 'big' ? 0 : 12) * u, backgroundColor: look.ears === 'pointed' ? look.secondary : look.main }]} />
        </>
      )}
      <View style={[styles.abs, { left: 10 * u, top: 14 * u, width: 80 * u, height: 80 * u, borderRadius: 40 * u, backgroundColor: look.main, borderWidth: 1, borderColor: 'rgba(59,42,38,0.08)' }]} />
      <View style={[styles.abs, { left: 22 * u, top: 48 * u, width: 56 * u, height: 42 * u, borderRadius: 24 * u, backgroundColor: look.secondary, opacity: mascot === 'cat' ? 0 : 0.95 }]} />
      {[32, 60].map((left) => (
        <View key={left} style={[styles.abs, { left: left * u, top: (sleepy ? 54 : 50) * u, width: 9 * u, height: (sleepy ? 5 : 11) * u, borderRadius: 5 * u, backgroundColor: '#2B1D1A' }]} />
      ))}
      {[22, 68].map((left) => (
        <View key={left} style={[styles.abs, { left: left * u, top: 62 * u, width: 11 * u, height: 7 * u, borderRadius: 4 * u, backgroundColor: '#FF9FA8', opacity: 0.7 }]} />
      ))}
      <View style={[styles.abs, { left: 46 * u, top: 64 * u, width: 9 * u, height: 5 * u, borderBottomLeftRadius: 5 * u, borderBottomRightRadius: 5 * u, backgroundColor: mascot === 'duck' ? look.secondary : mascot === 'pufferfish' ? look.accent : '#2B1D1A' }]} />
      {phase && (
        <Text style={[styles.abs, { right: 6 * u, bottom: 2 * u, fontSize: 20 * u }]} accessibilityElementsHidden>
          {MOON_CHARM[phase]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({ abs: { position: 'absolute' } });

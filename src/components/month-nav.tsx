import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { isRTL } from '@/i18n';

import { colors, space } from './theme';
import { Heading } from './ui';

/** "‹ March 2026 ›" header. `onStep(-1)` goes back in time in every language. */
export function StepNav({ title, onStep, canGoForward = true }: { title: string; onStep: (delta: number) => void; canGoForward?: boolean }) {
  const { i18n } = useTranslation();
  const rtl = isRTL(i18n.language);
  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel="previous" hitSlop={8} style={styles.arrow} onPress={() => onStep(-1)}>
        <Text style={styles.glyph}>{rtl ? '›' : '‹'}</Text>
      </Pressable>
      <Heading style={styles.title}>{title}</Heading>
      <Pressable accessibilityRole="button" accessibilityLabel="next" hitSlop={8} style={styles.arrow} disabled={!canGoForward} onPress={() => onStep(1)}>
        <Text style={[styles.glyph, !canGoForward && styles.off]}>{rtl ? '‹' : '›'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  title: { flex: 1, textAlign: 'center' },
  arrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontSize: 30, color: colors.brandDark, lineHeight: 34 },
  off: { opacity: 0.25 },
});

import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { isRTL } from '@/i18n';

import { colors, space } from './theme';
import { Heading, Squish } from './ui';

/** "‹ March 2026 ›" header. `onStep(-1)` goes back in time in every language. */
export function StepNav({ title, onStep, canGoForward = true }: { title: string; onStep: (delta: number) => void; canGoForward?: boolean }) {
  const { i18n } = useTranslation();
  const rtl = isRTL(i18n.language);
  return (
    <View style={styles.row}>
      <Squish label="previous" style={styles.arrow} onPress={() => onStep(-1)}>
        <Text style={styles.glyph}>{rtl ? '›' : '‹'}</Text>
      </Squish>
      <Heading style={styles.title}>{title}</Heading>
      <Squish label="next" style={styles.arrow} disabled={!canGoForward} onPress={() => onStep(1)}>
        <Text style={styles.glyph}>{rtl ? '‹' : '›'}</Text>
      </Squish>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.md },
  title: { flex: 1, textAlign: 'center' },
  arrow: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontSize: 28, color: colors.brandDark, lineHeight: 32, marginTop: -3 },
});

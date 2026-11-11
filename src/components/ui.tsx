import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, space } from './theme';

export function Screen({ children, background, scroll = true }: { children: ReactNode; background?: string; scroll?: boolean }) {
  const bg = background ?? colors.background;
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.fill]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

export function Title(props: TextProps) {
  return <Text accessibilityRole="header" {...props} style={[styles.title, props.style]} />;
}

export function Heading(props: TextProps) {
  return <Text accessibilityRole="header" {...props} style={[styles.heading, props.style]} />;
}

export function Body(props: TextProps & { soft?: boolean }) {
  return <Text {...props} style={[styles.body, props.soft && styles.soft, props.style]} />;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonKind = 'primary' | 'secondary' | 'danger';

export function Button({ label, onPress, kind = 'primary', disabled }: { label: string; onPress: () => void; kind?: ButtonKind; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        kind === 'primary' && styles.buttonPrimary,
        kind === 'secondary' && styles.buttonSecondary,
        kind === 'danger' && styles.buttonDanger,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}>
      <Text style={[styles.buttonLabel, kind === 'primary' ? styles.labelOnBrand : kind === 'danger' ? styles.labelDanger : styles.labelBrand]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, color = colors.brand }: { label: string; selected: boolean; onPress: () => void; color?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && { backgroundColor: color, borderColor: color }, pressed && styles.pressed]}>
      <Text style={[styles.chipLabel, selected && styles.labelOnBrand]}>{label}</Text>
    </Pressable>
  );
}

export function ChipRow({ children }: { children: ReactNode }) {
  return <View style={styles.chipRow}>{children}</View>;
}

/** Large tappable answer row, used by the quiz and the settings lists. */
export function Option({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.option, selected && styles.optionSelected, pressed && styles.pressed]}>
      <Text style={[styles.body, selected && styles.optionLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  fill: { flex: 1 },
  content: { padding: space.xl, gap: space.lg, width: '100%', maxWidth: 520, alignSelf: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.text, lineHeight: 34 },
  heading: { fontSize: 18, fontWeight: '700', color: colors.text },
  body: { fontSize: 16, lineHeight: 23, color: colors.text },
  soft: { color: colors.textSoft, fontSize: 14, lineHeight: 20 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg, gap: space.sm, borderWidth: 1, borderColor: colors.border },
  button: { minHeight: 52, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  buttonPrimary: { backgroundColor: colors.brand },
  buttonSecondary: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.brand },
  buttonDanger: { backgroundColor: colors.card, borderWidth: 1.5, borderColor: colors.danger },
  buttonLabel: { fontSize: 17, fontWeight: '700' },
  labelOnBrand: { color: colors.white },
  labelBrand: { color: colors.brandDark },
  labelDanger: { color: colors.danger },
  pressed: { opacity: 0.75 },
  disabled: { opacity: 0.4 },
  chip: { minHeight: 44, paddingHorizontal: space.lg, borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, justifyContent: 'center' },
  chipLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  option: { minHeight: 56, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: space.lg, paddingVertical: space.md, justifyContent: 'center' },
  optionSelected: { borderColor: colors.brand, backgroundColor: '#FFEDE4' },
  optionLabelSelected: { fontWeight: '700' },
});

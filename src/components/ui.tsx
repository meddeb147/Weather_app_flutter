import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { tap, tick } from '@/lib/haptics';

import { colors, font, radius, shadow, space } from './theme';

const SPRING = { damping: 14, stiffness: 320, mass: 0.6 };

/** Page wrapper with a soft gradient that fades from `tint` into the cream background. */
export function Screen({ children, tint, scroll = true }: { children: ReactNode; tint?: string; scroll?: boolean }) {
  return (
    <View style={styles.fill}>
      <LinearGradient colors={[tint ?? colors.brandSoft, colors.background]} locations={[0, 0.55]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        {scroll ? (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, styles.fill]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

export function Title(props: TextProps) {
  return <Text accessibilityRole="header" {...props} style={[styles.title, props.style]} />;
}

export function Heading(props: TextProps) {
  return <Text accessibilityRole="header" {...props} style={[styles.heading, props.style]} />;
}

export function Body(props: TextProps & { soft?: boolean }) {
  const { soft, ...rest } = props;
  return <Text {...rest} style={[styles.body, soft && styles.soft, props.style]} />;
}

/** Small uppercase-free label above a group of cards. */
export function Label(props: TextProps) {
  return <Text {...props} style={[styles.label, props.style]} />;
}

/** Card that slides up softly when it appears. `index` staggers a list of cards. */
export function Card({ children, style, index = 0 }: { children: ReactNode; style?: StyleProp<ViewStyle>; index?: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(60 * index).duration(420)} style={[styles.card, shadow, style]}>
      {children}
    </Animated.View>
  );
}

/** Pressable that squishes like a plush toy. */
export function Squish({
  children,
  onPress,
  style,
  disabled,
  label,
  selected,
  haptic = 'tick',
}: {
  children: ReactNode;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  label?: string;
  selected?: boolean;
  haptic?: 'tick' | 'tap' | 'none';
}) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, selected }}
      disabled={disabled}
      onPressIn={() => {
        scale.value = withSpring(0.94, SPRING);
      }}
      onPressOut={() => {
        scale.value = withSpring(1, SPRING);
      }}
      onPress={() => {
        if (haptic === 'tick') tick();
        else if (haptic === 'tap') tap();
        onPress();
      }}>
      <Animated.View style={[style, animated, disabled && styles.disabled]}>{children}</Animated.View>
    </Pressable>
  );
}

type ButtonKind = 'primary' | 'secondary' | 'danger' | 'ghost';

export function Button({ label, onPress, kind = 'primary', disabled }: { label: string; onPress: () => void; kind?: ButtonKind; disabled?: boolean }) {
  return (
    <Squish
      onPress={onPress}
      disabled={disabled}
      haptic="tap"
      style={[
        styles.button,
        kind === 'primary' && [styles.buttonPrimary, shadow],
        kind === 'secondary' && styles.buttonSecondary,
        kind === 'danger' && styles.buttonDanger,
      ]}>
      <Text style={[styles.buttonLabel, kind === 'primary' ? styles.onBrand : kind === 'danger' ? styles.dangerText : styles.brandText]}>{label}</Text>
    </Squish>
  );
}

export function Chip({ label, selected, onPress, color = colors.brand, emoji }: { label: string; selected: boolean; onPress: () => void; color?: string; emoji?: string }) {
  return (
    <Squish onPress={onPress} selected={selected} style={[styles.chip, selected && { backgroundColor: color, borderColor: color }]}>
      {emoji !== undefined && <Text style={styles.chipEmoji}>{emoji}</Text>}
      <Text style={[styles.chipLabel, selected && styles.onBrand]}>{label}</Text>
    </Squish>
  );
}

export function ChipRow({ children, center }: { children: ReactNode; center?: boolean }) {
  return <View style={[styles.chipRow, center && styles.centerRow]}>{children}</View>;
}

/** Large tappable answer row, used by the quiz and the settings lists. */
export function Option({ label, selected, onPress, left }: { label: string; selected: boolean; onPress: () => void; left?: ReactNode }) {
  return (
    <Squish onPress={onPress} selected={selected} style={[styles.option, selected && styles.optionSelected]}>
      {left}
      <Text style={[styles.body, styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
      <View style={[styles.radio, selected && styles.radioOn]}>{selected && <View style={styles.radioDot} />}</View>
    </Squish>
  );
}

export function ToggleRow({ label, hint, value, onChange }: { label: string; hint?: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleText}>
        <Text style={[styles.body, styles.optionLabelSelected]}>{label}</Text>
        {hint !== undefined && <Body soft>{hint}</Body>}
      </View>
      <Switch
        value={value}
        onValueChange={(v) => {
          tick();
          onChange(v);
        }}
        trackColor={{ true: colors.brand, false: colors.border }}
        thumbColor={colors.white}
        accessibilityLabel={label}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { padding: space.xl, paddingBottom: space.xxl, gap: space.lg, width: '100%', maxWidth: 520, alignSelf: 'center' },
  title: { fontFamily: font.extra, fontSize: 30, color: colors.text, lineHeight: 38 },
  heading: { fontFamily: font.bold, fontSize: 19, color: colors.text, lineHeight: 26 },
  body: { fontFamily: font.medium, fontSize: 16, lineHeight: 24, color: colors.text },
  soft: { fontFamily: font.regular, color: colors.textSoft, fontSize: 14, lineHeight: 21 },
  label: { fontFamily: font.bold, fontSize: 14, lineHeight: 20, color: colors.textSoft, marginBottom: -space.sm, paddingHorizontal: space.xs },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, padding: space.lg + 2, gap: space.sm },
  button: { minHeight: 56, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xl },
  buttonPrimary: { backgroundColor: colors.brand },
  buttonSecondary: { backgroundColor: colors.card, borderWidth: 2, borderColor: colors.brandSoft },
  buttonDanger: { backgroundColor: colors.card, borderWidth: 2, borderColor: '#F6D2CC' },
  buttonLabel: { fontFamily: font.bold, fontSize: 17, lineHeight: 24 },
  onBrand: { color: colors.white },
  brandText: { color: colors.brandDark },
  dangerText: { color: colors.danger },
  disabled: { opacity: 0.4 },
  chip: { minHeight: 44, paddingHorizontal: space.lg, borderRadius: radius.pill, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 6 },
  chipEmoji: { fontSize: 17 },
  chipLabel: { fontFamily: font.semi, fontSize: 15, lineHeight: 22, color: colors.text },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  centerRow: { justifyContent: 'center' },
  option: { minHeight: 60, borderRadius: radius.md + 4, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.card, paddingHorizontal: space.lg, paddingVertical: space.md, flexDirection: 'row', alignItems: 'center', gap: space.md },
  optionSelected: { borderColor: colors.brand, backgroundColor: '#FFF1EA' },
  optionLabel: { flex: 1 },
  optionLabelSelected: { fontFamily: font.bold },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.brand },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 48 },
  toggleText: { flex: 1 },
});

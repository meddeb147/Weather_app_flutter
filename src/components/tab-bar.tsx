import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { tick } from '@/lib/haptics';

import { colors, font, shadow } from './theme';

const ICONS: Record<string, (color: string) => React.ReactNode> = {
  index: (c) => <Path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" stroke={c} strokeWidth={2} strokeLinejoin="round" fill="none" />,
  calendar: (c) => (
    <>
      <Rect x={3} y={5} width={18} height={16} rx={4} stroke={c} strokeWidth={2} fill="none" />
      <Path d="M3 10h18M8 3v4M16 3v4" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </>
  ),
  together: (c) => <Path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" stroke={c} strokeWidth={2} strokeLinejoin="round" fill="none" />,
  insights: (c) => <Path d="M5 20v-8M12 20V5M19 20v-5" stroke={c} strokeWidth={2.6} strokeLinecap="round" />,
  settings: (c) => (
    <>
      <Circle cx={12} cy={8} r={4} stroke={c} strokeWidth={2} fill="none" />
      <Path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" stroke={c} strokeWidth={2} strokeLinecap="round" fill="none" />
    </>
  ),
};

function TabItem({ name, label, focused, onPress }: { name: string; label: string; focused: boolean; onPress: () => void }) {
  const pill = useAnimatedStyle(() => ({
    opacity: withSpring(focused ? 1 : 0),
    transform: [{ scale: withSpring(focused ? 1 : 0.6, { damping: 13, stiffness: 240 }) }],
  }));
  const lift = useAnimatedStyle(() => ({ transform: [{ translateY: withSpring(focused ? -2 : 0, { damping: 12, stiffness: 240 }) }] }));
  const color = focused ? colors.brandDark : colors.textSoft;
  return (
    <Pressable accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={label} onPress={onPress} style={styles.item}>
      <Animated.View style={[styles.iconWrap, lift]}>
        <Animated.View style={[styles.pill, pill]} />
        <View>
          <Svg width={24} height={24} viewBox="0 0 24 24">
            {ICONS[name]?.(color)}
          </Svg>
        </View>
      </Animated.View>
      <Text numberOfLines={1} style={[styles.label, { color, fontFamily: focused ? font.bold : font.medium }]}>
        {label}
      </Text>
    </Pressable>
  );
}

interface TabBarProps {
  state: { index: number; routes: { key: string; name: string }[] };
  descriptors: Record<string, { options: { title?: string } }>;
  navigateToTab: (routeKey: string) => void;
}

export function TabBar({ state, descriptors, navigateToTab }: TabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, shadow, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, i) => (
        <TabItem
          key={route.key}
          name={route.name}
          label={descriptors[route.key].options.title ?? route.name}
          focused={state.index === i}
          onPress={() => {
            if (state.index !== i) {
              tick();
              navigateToTab(route.key);
            }
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.card, paddingTop: 8, borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  item: { flex: 1, alignItems: 'center', gap: 2, minHeight: 52 },
  iconWrap: { width: 56, height: 32, alignItems: 'center', justifyContent: 'center' },
  pill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 16, backgroundColor: colors.brandSoft },
  label: { fontSize: 11.5, lineHeight: 16 },
});

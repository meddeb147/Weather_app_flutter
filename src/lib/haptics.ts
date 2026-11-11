import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const on = Platform.OS === 'ios' || Platform.OS === 'android';

/** Light tick for chips and options. */
export function tick(): void {
  if (on) Haptics.selectionAsync().catch(() => {});
}

/** Soft thump for main buttons. */
export function tap(): void {
  if (on) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

/** For moments worth celebrating: a gift, a reveal, a logged period. */
export function celebrate(): void {
  if (on) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

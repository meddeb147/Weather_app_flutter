import type { Phase } from './cycle/engine';

/** V1 launch lineup. The other five friends arrive in V3. */
export const MASCOT_IDS = ['momo', 'cat', 'duck', 'koala', 'pufferfish'] as const;
export type MascotId = (typeof MASCOT_IDS)[number];

export interface MascotLook {
  main: string;
  secondary: string;
  accent: string;
  /** Soft tint used for her home screen background. */
  tint: string;
  ears: 'round' | 'pointed' | 'big' | 'none';
}

/** Colours from docs/mascots. Shapes are placeholders until the 3D renders exist. */
export const MASCOTS: Record<MascotId, MascotLook> = {
  momo: { main: '#F26B4E', secondary: '#FFF1E0', accent: '#6B3A2E', tint: '#FFEDE4', ears: 'round' },
  cat: { main: '#FBF4EC', secondary: '#B9A9D6', accent: '#F28CA5', tint: '#F3EEFB', ears: 'pointed' },
  duck: { main: '#FFE08A', secondary: '#FFA860', accent: '#A9DDF0', tint: '#FFF8DC', ears: 'none' },
  koala: { main: '#C9CED8', secondary: '#FAFAFC', accent: '#A8D5BA', tint: '#EEF1F6', ears: 'big' },
  pufferfish: { main: '#9EDFD6', secondary: '#FFF6E5', accent: '#FF9E8A', tint: '#E6F7F4', ears: 'none' },
};

/** Moon charm per phase: dim crescent, growing moon, full moon, waning moon. */
export const MOON_CHARM: Record<Phase, string> = {
  menstrual: '🌒',
  follicular: '🌓',
  ovulation: '🌕',
  luteal: '🌘',
};

export const PHASE_COLORS: Record<Phase, string> = {
  menstrual: '#F28CA5',
  follicular: '#8CCBA5',
  ovulation: '#F2C230',
  luteal: '#A99FDB',
};

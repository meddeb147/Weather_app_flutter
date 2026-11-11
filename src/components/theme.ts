import { Platform } from 'react-native';

export const colors = {
  brand: '#F26B4E',
  brandDark: '#D9543A',
  brandSoft: '#FFE3D8',
  background: '#FFF7EF',
  card: '#FFFFFF',
  text: '#3B2A26',
  textSoft: '#8A726B',
  border: '#F3E4D9',
  danger: '#C8402F',
  white: '#FFFFFF',
  ink: '#2B1D1A',
};

/** Baloo Bhaijaan 2: one rounded family that covers Latin and Arabic. */
export const font = {
  regular: 'BalooBhaijaan2_400Regular',
  medium: 'BalooBhaijaan2_500Medium',
  semi: 'BalooBhaijaan2_600SemiBold',
  bold: 'BalooBhaijaan2_700Bold',
  extra: 'BalooBhaijaan2_800ExtraBold',
};

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const radius = { md: 16, lg: 26, pill: 999 };

export const shadow = Platform.select({
  web: { boxShadow: '0 6px 18px rgba(120, 72, 48, 0.10)' },
  default: { shadowColor: '#784830', shadowOpacity: 0.1, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 3 },
}) as object;

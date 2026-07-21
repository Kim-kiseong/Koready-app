export const Palette = {
  primary: '#4FAE98',
  primaryLight: '#79CEB2',
  primaryDark: '#399589',
  secondary: '#F4FFF8',
  text: '#1C1C1A',
  grey100: '#F6F9FB',
  grey150: '#F0F3F5',
  grey200: '#E8EEF2',
  grey300: '#D7DEE5',
  grey400: '#8B95A1',
  grey600: '#4E5968',
  grey900: '#1A1F26',
  appleBlack: '#242625',
} as const;

export type PaletteColor = keyof typeof Palette;

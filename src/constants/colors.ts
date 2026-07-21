export const Palette = {
  primary: '#4FAE98',
  secondary: '#F4FFF8',
  text: '#1C1C1A',
  grey200: '#E8EEF2',
  grey300: '#D7DEE5',
  grey400: '#8B95A1',
  grey600: '#4E5968',
  grey900: '#1A1F26',
  appleBlack: '#242625',
} as const;

export type PaletteColor = keyof typeof Palette;

import Svg, { Path } from 'react-native-svg';

export type HeartIconProps = {
  filled: boolean;
  color: string;
  size?: number;
};

// Custom SVG heart instead of SymbolView's Material Symbols glyph — the
// Android/web font (@expo-google-fonts/material-symbols) is a static
// FILL=0 instance, so 'favorite' renders as an outline there no matter
// which name is passed. Drawing the fill ourselves keeps iOS and
// Android/web pixel-consistent.
export default function HeartIcon({ filled, color, size = 22 }: HeartIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 19.6 17.6" fill="none">
      <Path
        d="M9.8 3.96182C7.8 -0.743972 0.8 -0.242716 0.8 5.77235C0.8 11.7874 9.8 16.8 9.8 16.8C9.8 16.8 18.8 11.7874 18.8 5.77235C18.8 -0.242716 11.8 -0.743972 9.8 3.96182Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

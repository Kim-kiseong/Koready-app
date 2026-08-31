import Svg, { Path } from 'react-native-svg';

type SortCheckIconProps = {
  color?: string;
};

export default function SortCheckIcon({ color = '#1C1C1A' }: SortCheckIconProps) {
  return (
    <Svg width={15} height={11} viewBox="0 0 15 11" fill="none">
      <Path
        d="M14 1L5.0625 10L1 5.90909"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

import Svg, { Path } from 'react-native-svg';

type ArrowForwardIosIconProps = {
  color?: string;
};

export default function ArrowForwardIosIcon({ color = '#6B7684' }: ArrowForwardIosIconProps) {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20" fill="none">
      <Path
        d="M9 14L13 10L9 6"
        stroke={color}
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

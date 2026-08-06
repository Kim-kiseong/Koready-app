import { Path, Svg } from 'react-native-svg';

type SendPlaneIconProps = {
  color?: string;
  size?: number;
};

export default function SendPlaneIcon({
  color = '#FFFFFF',
  size = 20,
}: SendPlaneIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        d="M14.7912 6.16235L9.97484 15.5583C9.86793 15.7576 9.70347 15.872 9.48146 15.9015C9.25937 15.9309 9.07481 15.858 8.92777 15.6827L3.64586 9.38801C3.49883 9.21277 3.45906 9.01836 3.52657 8.80475C3.59415 8.59123 3.73538 8.44913 3.95028 8.37846L14.0398 5.26688C14.3119 5.18794 14.5364 5.25388 14.7133 5.46471C14.8902 5.67554 14.9162 5.90809 14.7912 6.16235ZM9.32806 14.5332L13.4154 6.55382L4.8475 9.19343L6.50183 11.165L9.98351 9.43348L7.67372 12.5616L9.32806 14.5332Z"
        fill={color}
      />
    </Svg>
  );
}

import type { StyleProp, TextStyle } from 'react-native';

import CustomText from '@/components/CustomText';

export type RichTextProps = {
  text: string;
  style?: StyleProp<TextStyle>;
  /** Style applied to `**bold**`-marked segments, merged on top of `style`. */
  emphasisStyle?: StyleProp<TextStyle>;
};

// Renders `text` with `**bold**` segments swapped to a semibold/emphasis span.
// Lets guide content mark inline emphasis (matching the Figma design's mixed
// regular/semibold copy) without every caller building its own Text tree.
export default function RichText({ text, style, emphasisStyle }: RichTextProps) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);

  if (parts.length === 1 && !parts[0].startsWith('**')) {
    return <CustomText style={style}>{text}</CustomText>;
  }

  return (
    <CustomText style={style}>
      {parts.map((part, index) => {
        const isBold = part.startsWith('**') && part.endsWith('**');
        return (
          <CustomText key={index} style={isBold ? emphasisStyle : undefined}>
            {isBold ? part.slice(2, -2) : part}
          </CustomText>
        );
      })}
    </CustomText>
  );
}

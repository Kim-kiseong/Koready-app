import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import StepProgressIndicator, {
  type StepProgressIndicatorProps,
} from '@/components/StepProgressIndicator';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

export type OnboardingHeaderProps = {
  onBack: () => void;
  title?: string;
  progress?: StepProgressIndicatorProps;
};

export default function OnboardingHeader({ onBack, title, progress }: OnboardingHeaderProps) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={8} style={styles.iconSlot}>
        <SymbolView
          name={{ ios: 'chevron.left', android: 'arrow_back_ios', web: 'arrow_back_ios' }}
          size={18}
          weight="semibold"
          tintColor={Palette.text}
        />
      </Pressable>

      <View style={styles.center}>
        {progress ? (
          <StepProgressIndicator {...progress} />
        ) : (
          <CustomText style={styles.title}>{title}</CustomText>
        )}
      </View>

      {/* TODO: wire up settings navigation once that screen exists */}
      <View style={styles.iconSlot}>
        <SymbolView
          name={{ ios: 'gearshape', android: 'settings', web: 'settings' }}
          size={18}
          weight="regular"
          tintColor={Palette.text}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  iconSlot: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    color: Palette.text,
  },
});

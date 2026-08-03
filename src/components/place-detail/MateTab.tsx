import { Image } from 'expo-image';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useAuthStore } from '@/store/auth-store';

export default function MateTab() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const buddyProfileExists = useAuthStore((state) => state.buddyProfileExists);

  if (!hasHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={Palette.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {buddyProfileExists ? <AfterProfileView /> : <BeforeProfileView />}
    </View>
  );
}

function BeforeProfileView() {
  return (
    <View style={styles.previewBlock}>
      <Image
        source={require('@/assets/images/mate-preview-before.png')}
        style={styles.beforeIllustration}
        contentFit="contain"
      />

      <CustomText style={styles.previewTitle}>
        여행 메이트를 찾기 위한{`\n`}준비가 필요해요
      </CustomText>

      <CustomText style={styles.previewDescription}>
        프로필을 완성하고 취향이 맞는 친구들을 만나보세요.
      </CustomText>
    </View>
  );
}

function AfterProfileView() {
  return (
    <View style={styles.previewBlock}>
      <Image
        source={require('@/assets/images/mate-preview-after.png')}
        style={styles.afterIllustration}
        contentFit="contain"
      />

      <CustomText style={styles.previewTitle}>
        함께할 여행 메이트를{`\n`}찾고 있어요
      </CustomText>

      <CustomText style={styles.previewDescription}>
        나와 취향이 맞는 메이트가 나타나면 알려드릴게요.
      </CustomText>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    minHeight: 360,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  previewBlock: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  beforeIllustration: {
    width: 133,
    height: 142,
    marginTop: 14,
    marginBottom: 12,
  },
  afterIllustration: {
    width: 180,
    height: 170,
    marginTop: 14,
    marginBottom: 0,
  },
  previewTitle: {
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 27,
    color: Palette.text,
  },
  previewDescription: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
});

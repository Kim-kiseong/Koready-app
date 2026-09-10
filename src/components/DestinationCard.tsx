import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import type { OnboardingCandidateItem } from '@/api/onboarding';
import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useLanguageStore } from '@/store/language-store';
import { toDisplayText, toStableListKey } from '@/utils/list-item';
import { formatPlaceTag } from '@/utils/place-i18n';

export type DestinationCardProps = {
  item: OnboardingCandidateItem;
  selected: boolean;
  onPress: () => void;
};

export default function DestinationCard({ item, selected, onPress }: DestinationCardProps) {
  const language = useLanguageStore((state) => state.language);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      ) : (
        <View style={[StyleSheet.absoluteFill, styles.imageFallback]} />
      )}
      {selected && <View style={[StyleSheet.absoluteFill, styles.selectedOverlay]} />}
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.65)']}
        start={{ x: 0.5, y: 0.12 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {selected && (
        <View style={styles.checkBadge}>
          <SymbolView
            name={{ ios: 'checkmark', android: 'check', web: 'check' }}
            size={16}
            weight="bold"
            tintColor={Palette.text}
          />
        </View>
      )}

      <View style={styles.content}>
        <CustomText style={styles.title}>{item.title}</CustomText>
        <View style={styles.tagRow}>
          {item.tags.slice(0, 2).map((tag, index) => (
            <View key={toStableListKey(tag, index)} style={styles.tag}>
              <CustomText style={styles.tagText}>{formatPlaceTag(toDisplayText(tag), language)}</CustomText>
            </View>
          ))}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    aspectRatio: 165 / 204,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 12,
  },
  imageFallback: {
    backgroundColor: Palette.grey200,
  },
  selectedOverlay: {
    backgroundColor: Palette.selectionOverlay,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    gap: 8,
  },
  title: {
    fontFamily: FontFamily.pretendard.bold,
    fontSize: 15,
    color: '#ffffff',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    fontSize: 12,
    lineHeight: 16.8,
    fontFamily: FontFamily.pretendard.medium,
    color: '#ffffff',
  },
});

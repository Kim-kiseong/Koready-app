import { Image } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import DetailTag from '@/components/place-detail/DetailTag';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

type PlaceInfoProps = {
  title: string;
  address: string;
  tags: string[];
  isSaved: boolean;
  onToggleSave: () => void;
};

export default function PlaceInfo({ title, address, tags, isSaved, onToggleSave }: PlaceInfoProps) {
  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <CustomText style={styles.title}>{title}</CustomText>
        <Pressable hitSlop={12} style={styles.saveButton} onPress={onToggleSave}>
          <SymbolView
            name={{ ios: isSaved ? 'heart.fill' : 'heart', android: isSaved ? 'favorite' : 'favorite_border', web: isSaved ? 'favorite' : 'favorite_border' }}
            size={24}
            weight="regular"
            tintColor={isSaved ? Palette.primary : Palette.grey400}
          />
        </Pressable>
      </View>
      <View style={styles.addressRow}>
        <View style={styles.locationIconFrame}>
          <Image source={require('@/assets/images/location-pin-detail.svg')} style={styles.locationIcon} contentFit="contain" />
        </View>
        <CustomText style={styles.address}>{address}</CustomText>
      </View>
      <View style={styles.tagRow}>{tags.map((tag) => <DetailTag key={tag} label={tag} />)}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title: { flex: 1, fontFamily: FontFamily.pretendard.semiBold, fontSize: 20, lineHeight: 28, color: Palette.text },
  saveButton: { padding: 3 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16 },
  locationIconFrame: { width: 18, height: 18, paddingHorizontal: 3, paddingVertical: 2 },
  locationIcon: { width: 12, height: 14 },
  address: { flex: 1, fontFamily: FontFamily.pretendard.regular, fontSize: 14, lineHeight: 19.6, color: Palette.grey600 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});

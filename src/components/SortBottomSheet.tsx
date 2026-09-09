import { useEffect, useState } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { EventSortOrder } from '@/api/home';
import CustomText from '@/components/CustomText';
import SortCheckIcon from '@/components/icons/SortCheckIcon';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';

export type SortBottomSheetProps = {
  visible: boolean;
  value: EventSortOrder;
  onSelect: (value: EventSortOrder) => void;
  onClose: () => void;
};

const OPTIONS: EventSortOrder[] = ['RECOMMENDED', 'DEADLINE'];
const SHEET_HEIGHT = 190;
const ANIMATION_DURATION = 220;

export default function SortBottomSheet({ visible, value, onSelect, onClose }: SortBottomSheetProps) {
  const t = useTranslation();
  const [translateY] = useState(() => new Animated.Value(SHEET_HEIGHT));
  const [overlayOpacity] = useState(() => new Animated.Value(0));
  // The parent toggles `visible` directly (no close handshake), so the exit
  // animation has to be kept alive across the render where `visible` flips
  // to false — deriving `isClosing` here (React's documented "adjust state
  // during render" escape hatch) instead of in an effect keeps this in sync
  // on the very same render, before the sheet would otherwise unmount.
  const [prevVisible, setPrevVisible] = useState(visible);
  const [isClosing, setIsClosing] = useState(false);

  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (!visible) setIsClosing(true);
  }

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    if (!isClosing) return;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SHEET_HEIGHT,
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) setIsClosing(false);
    });
  }, [visible, isClosing, translateY, overlayOpacity]);

  if (!visible && !isClosing) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlayContainer}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.overlayBackground, { opacity: overlayOpacity }]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
          <View style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          <CustomText style={styles.title}>{t.eventList.sortTitle}</CustomText>

          <View style={styles.optionGroup}>
            {OPTIONS.map((option) => {
              const selected = option === value;
              const label = option === 'RECOMMENDED' ? t.eventList.sortRecommended : t.eventList.sortDeadline;
              return (
                <Pressable key={option} style={styles.optionRow} onPress={() => onSelect(option)}>
                  <CustomText style={selected ? styles.optionLabelSelected : styles.optionLabel}>
                    {label}
                  </CustomText>
                  {selected && (
                    <SortCheckIcon />
                  )}
                </Pressable>
              );
            })}
          </View>

          <SafeAreaView edges={['bottom']} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlayBackground: {
    backgroundColor: 'rgba(28,28,26,0.7)',
  },
  sheet: {
    height:190,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  handleArea: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E8EB',
  },
  title: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#4E5968',
  },
  optionGroup: {
    gap: 24,
    alignSelf: 'stretch',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLabel: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: '#1C1C1A',
  },
  optionLabelSelected: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 16,
    lineHeight: 22.4,
    color: '#1C1C1A',
  },
});

import { Image, type ImageSource } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

export type Card = {
  icon?: SymbolName;
  image?: ImageSource;
  emoji?: string;
  color?: string;
  title: string;
  description: string;
  /** 'stacked' (default) — icon on top, text below. 'row' — icon on the left,
   * title/description stacked to its right (taxi's payment-method cards, bus's
   * ticket-type cards). */
  orientation?: 'stacked' | 'row';
  /** Overrides for the icon circle — call-center style cards use a red circle
   * instead of the default mint one. */
  iconBackground?: string;
  iconTintColor?: string;
  iconBorderless?: boolean;
};

export type CardListProps = {
  layout: 'row' | 'column';
  cards: Card[];
};

// Bordered card(s) with an optional icon/image, a title, and a description —
// covers taxi's app-comparison cards, payment-method cards, and 2-up info
// cards ("빈차 / 예약") alike.
export default function CardList({ layout, cards }: CardListProps) {
  return (
    <View style={[styles.wrap, layout === 'row' ? styles.row : styles.column]}>
      {cards.map((card) => {
        const isRow = card.orientation === 'row';

        const icon = card.image ? (
          <Image source={card.image} style={styles.iconImage} contentFit="cover" />
        ) : card.icon ? (
          <View
            style={[
              styles.iconCircle,
              card.iconBackground ? { backgroundColor: card.iconBackground } : null,
              card.iconBorderless ? styles.iconCircleBorderless : null,
            ]}>
            <SymbolView name={card.icon} size={18} weight="regular" tintColor={card.iconTintColor ?? Palette.primary} />
          </View>
        ) : null;

        const text = (
          <View style={isRow ? styles.textGroupRow : styles.textGroupStacked}>
            <CustomText style={[styles.title, card.color && styles.titleOnColor]}>
              {card.emoji ? `${card.emoji} ` : ''}
              {card.title}
            </CustomText>
            {card.description ? (
              <CustomText style={[styles.description, card.color && styles.descriptionOnColor]}>
                {card.description}
              </CustomText>
            ) : null}
          </View>
        );

        return (
          <View
            key={card.title}
            style={[
              styles.card,
              layout === 'row' && styles.cardFlex,
              card.color ? { backgroundColor: card.color, borderWidth: 0 } : null,
            ]}>
            {isRow ? (
              <View style={styles.iconTextRow}>
                {icon}
                {text}
              </View>
            ) : (
              <>
                {icon}
                {text}
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
  },
  column: {
    flexDirection: 'column',
    gap: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: Palette.grey200,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 8,
  },
  cardFlex: {
    flex: 1,
  },
  iconImage: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Palette.tipBorder,
    backgroundColor: Palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleBorderless: {
    borderWidth: 0,
  },
  iconTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textGroupStacked: {
    gap: 8,
  },
  textGroupRow: {
    gap: 4,
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.text,
  },
  titleOnColor: {
    color: '#ffffff',
  },
  description: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: Palette.grey600,
  },
  descriptionOnColor: {
    color: Palette.grey100,
  },
});

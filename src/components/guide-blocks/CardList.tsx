import { Image, type ImageSource } from 'expo-image';
import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import type { CardIconKey } from '@/constants/guide-content';
import { FontFamily } from '@/constants/typography';

type SymbolName = ComponentProps<typeof SymbolView>['name'];
type CardIconName = SymbolName | CardIconKey;

export type Card = {
  icon?: CardIconName;
  image?: ImageSource;
  emoji?: string;
  badge?: string;
  chips?: string[];
  chipsPlacement?: 'inline' | 'stacked';
  chipsStackedGap?: number;
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
        const hasBadge = Boolean(card.badge);
        const hasChips = Boolean(card.chips?.length);
        const chipsPlacement = card.chipsPlacement ?? 'inline';
        const chipsStackedGap = card.chipsStackedGap ?? 18;
        const isStackedChips = chipsPlacement === 'stacked';

        const icon = card.image ? (
          <Image source={card.image} style={styles.iconImage} contentFit="cover" />
        ) : card.icon ? (
          <View
            style={[
              styles.iconCircle,
              card.iconBackground ? { backgroundColor: card.iconBackground } : null,
              card.iconBorderless ? styles.iconCircleBorderless : null,
            ]}>
            {renderIcon(card.icon, card.iconTintColor ?? Palette.primary)}
          </View>
        ) : null;

        const badge = card.badge ? (
          <View style={styles.badge}>
            <CustomText style={styles.badgeText}>
              {card.badge}
            </CustomText>
          </View>
        ) : null;

        const chipRow = hasChips ? (
          <View style={[styles.chipRow, isStackedChips ? styles.chipRowStacked : styles.chipRowInline]}>
            {card.chips?.map((chipLabel) => (
              <View key={chipLabel} style={styles.chip}>
                <CustomText style={styles.chipText} numberOfLines={1}>
                  {chipLabel}
                </CustomText>
              </View>
            ))}
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
              hasBadge ? styles.cardWithBadge : null,
              layout === 'row' && styles.cardFlex,
              card.color ? { backgroundColor: card.color, borderWidth: 0 } : null,
            ]}>
            {hasChips ? (
              isStackedChips ? (
                <View style={[styles.chipsStackedGroup, { gap: chipsStackedGap }]}>
                  <CustomText style={styles.title}>{card.title}</CustomText>
                  {chipRow}
                </View>
              ) : (
                <View style={styles.chipsHeaderRow}>
                  <CustomText style={styles.title}>{card.title}</CustomText>
                  {chipRow}
                </View>
              )
            ) : isRow && !hasBadge ? (
              <View style={styles.iconTextRow}>
                {icon}
                {text}
              </View>
            ) : (
              <>
                {icon || badge ? (
                  <View style={styles.cardHeaderRow}>
                    {icon}
                    {badge}
                  </View>
                ) : null}
                {text}
              </>
            )}
          </View>
        );
      })}
    </View>
  );
}

function renderIcon(icon: CardIconName, color: string) {
  switch (icon) {
    case 'taxi-credit-card':
      return <TaxiCreditCardIcon color={color} />;
    case 'taxi-cash':
      return <TaxiCashIcon color={color} />;
    case 'taxi-transit-card':
      return <TaxiTransitCardIcon color={color} />;
    case 'taxi-call-center':
      return <TaxiCallCenterIcon color={color} />;
    case 'bus-mobile-ticket':
      return <BusMobileTicketIcon color={color} />;
    case 'bus-paper-ticket':
      return <BusPaperTicketIcon color={color} />;
    case 'zap':
      return <ZapIcon color={color} />;
    default:
      return <SymbolView name={icon} size={18} weight="regular" tintColor={color} />;
  }
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
  cardWithBadge: {
    gap: 14,
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
  chipsHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 6,
    flexShrink: 1,
  },
  chipRowInline: {
    justifyContent: 'flex-end',
  },
  chipRowStacked: {
    justifyContent: 'flex-start',
  },
  chip: {
    borderRadius: 100,
    borderWidth: 1,
    borderColor: Palette.tipBorder,
    backgroundColor: Palette.secondary,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  chipText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.primary,
  },
  cardHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F0F3F5',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    lineHeight: 16.8,
    color: '#4E5968',
    textAlign: 'left',
  },
  chipsStackedGroup: {
    width: '100%',
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

function TaxiCreditCardIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M1.5 7.5H16.5M3 3.75H15C15.8284 3.75 16.5 4.42157 16.5 5.25V12.75C16.5 13.5784 15.8284 14.25 15 14.25H3C2.17157 14.25 1.5 13.5784 1.5 12.75V5.25C1.5 4.42157 2.17157 3.75 3 3.75Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TaxiCashIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M15.4 4.43164H2.6C1.71634 4.43164 1 5.17783 1 6.09831V12.765C1 13.6854 1.71634 14.4316 2.6 14.4316H15.4C16.2837 14.4316 17 13.6854 17 12.765V6.09831C17 5.17783 16.2837 4.43164 15.4 4.43164Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 11.4316C10.1046 11.4316 11 10.5362 11 9.43164C11 8.32707 10.1046 7.43164 9 7.43164C7.89543 7.43164 7 8.32707 7 9.43164C7 10.5362 7.89543 11.4316 9 11.4316Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.5 9.43164H4.5075M13.5 9.43164H13.5075"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TaxiTransitCardIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M3 4.5L1.5 5.25M7.5 4.5H10.5M16.5 5.25L15 4.5M13.5 14.25C14.3284 14.25 15 13.5784 15 12.75V3.75C15 2.92157 14.3284 2.25 13.5 2.25H4.5C3.67157 2.25 3 2.92157 3 3.75V12.75C3 13.5784 3.67157 14.25 4.5 14.25M13.5 14.25H4.5M13.5 14.25V15.75M4.5 14.25V15.75M3 8.25H15M6 11.25H6.0075M12 11.25H12.0075"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TaxiCallCenterIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M10.374 12.426C10.5289 12.4971 10.7034 12.5134 10.8688 12.4721C11.0341 12.4308 11.1805 12.3344 11.2838 12.1987L11.55 11.85C11.6897 11.6637 11.8709 11.5125 12.0792 11.4084C12.2875 11.3042 12.5171 11.25 12.75 11.25H15C15.3978 11.25 15.7794 11.408 16.0607 11.6893C16.342 11.9706 16.5 12.3522 16.5 12.75V15C16.5 15.3978 16.342 15.7794 16.0607 16.0607C15.7794 16.342 15.3978 16.5 15 16.5C11.4196 16.5 7.9858 15.0777 5.45406 12.5459C2.92232 10.0142 1.5 6.58042 1.5 3C1.5 2.60218 1.65804 2.22064 1.93934 1.93934C2.22064 1.65804 2.60218 1.5 3 1.5H5.25C5.64782 1.5 6.02936 1.65804 6.31066 1.93934C6.59196 2.22064 6.75 2.60218 6.75 3V5.25C6.75 5.48287 6.69578 5.71254 6.59164 5.92082C6.4875 6.1291 6.33629 6.31028 6.15 6.45L5.799 6.71325C5.66131 6.81838 5.56426 6.96794 5.52434 7.13651C5.48442 7.30509 5.50409 7.48228 5.58 7.638C6.60501 9.7199 8.29082 11.4036 10.374 12.426Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BusMobileTicketIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9 14.0264H9.00714M5.42857 2.02637H12.5714C13.3604 2.02637 14 2.69794 14 3.52637V15.5264C14 16.3548 13.3604 17.0264 12.5714 17.0264H5.42857C4.63959 17.0264 4 16.3548 4 15.5264V3.52637C4 2.69794 4.63959 2.02637 5.42857 2.02637Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BusPaperTicketIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9.75 4V5.42857M9.75 12.5714V14M9.75 8.28571V9.71429M1.5 6.85714C2.09674 6.85714 2.66903 7.08291 3.09099 7.48477C3.51295 7.88663 3.75 8.43168 3.75 9C3.75 9.56832 3.51295 10.1134 3.09099 10.5152C2.66903 10.9171 2.09674 11.1429 1.5 11.1429V12.5714C1.5 12.9503 1.65804 13.3137 1.93934 13.5816C2.22064 13.8495 2.60218 14 3 14H15C15.3978 14 15.7794 13.8495 16.0607 13.5816C16.342 13.3137 16.5 12.9503 16.5 12.5714V11.1429C15.9033 11.1429 15.331 10.9171 14.909 10.5152C14.4871 10.1134 14.25 9.56832 14.25 9C14.25 8.43168 14.4871 7.88663 14.909 7.48477C15.331 7.08291 15.9033 6.85714 16.5 6.85714V5.42857C16.5 5.04969 16.342 4.68633 16.0607 4.41842C15.7794 4.15051 15.3978 4 15 4H3C2.60218 4 2.22064 4.15051 1.93934 4.41842C1.65804 4.68633 1.5 5.04969 1.5 5.42857V6.85714Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ZapIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M3.22441 10.4996C3.08779 10.5001 2.95385 10.4603 2.83813 10.3849C2.72242 10.3094 2.62969 10.2015 2.57072 10.0735C2.51175 9.94547 2.48896 9.80273 2.50499 9.66182C2.52102 9.52091 2.57522 9.38762 2.66129 9.27743L9.80858 1.62942C9.8622 1.56515 9.93526 1.52171 10.0158 1.50625C10.0963 1.49079 10.1795 1.50421 10.2517 1.54432C10.3239 1.58443 10.3808 1.64884 10.4131 1.72698C10.4454 1.80511 10.4512 1.89234 10.4295 1.97433L9.04332 6.48815C9.00244 6.60177 8.98872 6.72398 9.00331 6.84432C9.01791 6.96465 9.0604 7.07951 9.12713 7.17904C9.19386 7.27858 9.28284 7.35981 9.38644 7.41578C9.49004 7.47175 9.60517 7.50079 9.72195 7.50039H14.7756C14.9122 7.49991 15.0462 7.53969 15.1619 7.61513C15.2776 7.69056 15.3703 7.79855 15.4293 7.92654C15.4883 8.05453 15.511 8.19727 15.495 8.33818C15.479 8.47909 15.4248 8.61238 15.3387 8.72257L8.19142 16.3706C8.1378 16.4349 8.06475 16.4783 7.98423 16.4937C7.90372 16.5092 7.82054 16.4958 7.74834 16.4557C7.67614 16.4156 7.61921 16.3512 7.5869 16.273C7.5546 16.1949 7.54883 16.1077 7.57054 16.0257L8.95668 11.5118C8.99756 11.3982 9.01128 11.276 8.99669 11.1557C8.98209 11.0354 8.9396 10.9205 8.87287 10.821C8.80614 10.7214 8.71716 10.6402 8.61356 10.5842C8.50996 10.5282 8.39483 10.4992 8.27805 10.4996H3.22441Z"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

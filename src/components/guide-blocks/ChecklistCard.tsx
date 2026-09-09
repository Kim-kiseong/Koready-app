import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import type { ChecklistCardIconKey } from '@/constants/guide-content';
import { FontFamily } from '@/constants/typography';

export type ChecklistCardProps = {
  title: string;
  description?: string;
  items?: string[];
  flowItems?: {
    title: string;
    description: string;
  }[];
  itemIcons?: ChecklistCardIconKey[];
};

// Plain white bordered card: title + optional description + a checkmark list.
// Same idea as HoriTipCard's checklist but without the mascot (bus's "미리
// 예약하고 싶다면" box).
export default function ChecklistCard({ title, description, items, flowItems, itemIcons }: ChecklistCardProps) {
  const hasFlowItems = Boolean(flowItems?.length);
  const resolvedFlowItems = flowItems ?? [];

  if (hasFlowItems) {
    return (
      <View style={styles.card}>
        <View style={styles.flowRow}>
          {resolvedFlowItems.map((item, index) => (
            <Fragment key={`${item.title}-${index}`}>
              <View style={styles.flowCell}>
                <CustomText style={styles.flowTitle}>{item.title}</CustomText>
                <CustomText style={styles.flowDescription}>{item.description}</CustomText>
              </View>
              {index < resolvedFlowItems.length - 1 ? (
                <View style={styles.flowArrow}>
                  <FlowArrowIcon />
                </View>
              ) : null}
            </Fragment>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <CustomText style={styles.title}>{title}</CustomText>
        {description ? <CustomText style={styles.description}>{description}</CustomText> : null}
      </View>
      <View style={styles.items}>
        {(items ?? []).map((item, index) => (
          <View key={item} style={styles.itemRow}>
            {renderItemIcon(itemIcons?.[index])}
            <CustomText style={styles.itemText}>{item}</CustomText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: Palette.grey200,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.text,
  },
  description: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: Palette.grey600,
  },
  items: {
    gap: 10,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  flowCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minWidth: 0,
  },
  flowArrow: {
    width: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  flowTitle: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    lineHeight: 16.8,
    color: '#1C1C1A',
    textAlign: 'center',
  },
  flowDescription: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 18.2,
    color: '#4E5968',
    textAlign: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    color: Palette.grey700,
  },
});

function CheckIcon() {
  return (
    <Svg width={17} height={17} viewBox="0 0 17 17" fill="none">
      <Path
        d="M11 5.5L5.5 11.5L3 8.77273"
        stroke={Palette.grey700}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FlowArrowIcon() {
  return (
    <Svg width={19} height={19} viewBox="0 0 19 19" fill="none">
      <Path
        d="M5 9.5H14M9.5 14L14 9.5L9.5 5"
        stroke="#B2BCC6"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function renderItemIcon(icon?: ChecklistCardIconKey) {
  switch (icon) {
    case 'bus-online-reservation':
      return <BusOnlineReservationIcon />;
    case 'bus-overseas-card':
      return <BusOverseasCardIcon />;
    case 'bus-mobile-ticket':
      return <BusMobileTicketIcon />;
    default:
      return <CheckIcon />;
  }
}

function BusOnlineReservationIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M7.00033 12.8337C10.222 12.8337 12.8337 10.222 12.8337 7.00033C12.8337 3.77866 10.222 1.16699 7.00033 1.16699C3.77866 1.16699 1.16699 3.77866 1.16699 7.00033C1.16699 10.222 3.77866 12.8337 7.00033 12.8337Z"
        stroke="#4FAE98"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.66699 7.00033C4.66699 4.82842 5.50246 2.73975 7.00033 1.16699C8.49819 2.73975 9.33366 4.82842 9.33366 7.00033C9.33366 9.17223 8.49819 11.2609 7.00033 12.8337C5.50246 11.2609 4.66699 9.17223 4.66699 7.00033Z"
        stroke="#4FAE98"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M1.16699 7H12.8337" stroke="#4FAE98" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BusOverseasCardIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M11.667 2.91699H2.33366C1.68933 2.91699 1.16699 3.43933 1.16699 4.08366V9.91699C1.16699 10.5613 1.68933 11.0837 2.33366 11.0837H11.667C12.3113 11.0837 12.8337 10.5613 12.8337 9.91699V4.08366C12.8337 3.43933 12.3113 2.91699 11.667 2.91699Z"
        stroke="#4FAE98"
        strokeWidth={1.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M1.16699 5.83301H12.8337" stroke="#4FAE98" strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BusMobileTicketIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M9.91699 1.16699H4.08366C3.43933 1.16699 2.91699 1.68933 2.91699 2.33366V11.667C2.91699 12.3113 3.43933 12.8337 4.08366 12.8337H9.91699C10.5613 12.8337 11.0837 12.3113 11.0837 11.667V2.33366C11.0837 1.68933 10.5613 1.16699 9.91699 1.16699Z"
        stroke="#4FAE98"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M7 10.5H7.005" stroke="#4FAE98" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

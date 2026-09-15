import { SymbolView } from 'expo-symbols';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import type { IconFlowIcon } from '@/constants/guide-content';
import { FontFamily } from '@/constants/typography';

type IconName = IconFlowIcon;

export type IconFlowStep = {
  icon: IconName;
  label: string;
};

export type IconFlowProps = {
  title?: string;
  description?: string;
  steps: IconFlowStep[];
};

// Horizontal "출발지 선택 → 목적지 입력 → ..." icon flow inside a bordered card.
// Optionally headed by a title + description (bus's "터미널에서 구매하기" card).
export default function IconFlow({ title, description, steps }: IconFlowProps) {
  return (
    <View style={styles.card}>
      {title && (
        <View style={styles.header}>
          <CustomText style={styles.headerTitle}>{title}</CustomText>
          {description ? <CustomText style={styles.headerDescription}>{description}</CustomText> : null}
        </View>
      )}
      <View style={styles.row}>
        {steps.map((step, index) => (
          <Fragment key={step.label}>
            <View style={styles.step}>
              <View style={[styles.iconCircle, typeof step.icon === 'number' && styles.numberCircle]}>
                {renderIcon(step.icon)}
              </View>
              <CustomText style={styles.label}>{step.label}</CustomText>
            </View>
            {index < steps.length - 1 && (
              <SymbolView
                name={{ ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' }}
                size={16}
                weight="regular"
                tintColor={Palette.grey350}
                style={styles.arrow}
              />
            )}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

function renderIcon(icon: IconName) {
  if (typeof icon === 'number') {
    return <CustomText style={styles.numberText}>{icon}</CustomText>;
  }

  switch (icon) {
    case 'taxi-origin':
    case 'bus-origin':
      return <TaxiOriginIcon />;
    case 'taxi-destination':
    case 'bus-destination':
      return <TaxiDestinationIcon />;
    case 'taxi-car':
      return <TaxiCarIcon />;
    case 'taxi-phone':
      return <TaxiPhoneIcon />;
    case 'bus-clock':
      return <BusClockIcon />;
    case 'bus-seat':
      return <BusSeatIcon />;
    case 'passport-square-dashed':
      return <PassportSquareDashedIcon color={Palette.primary} />;
    case 'siren':
      return <SirenIcon color={Palette.primary} />;
    case 'account-balance':
      return <AccountBalanceIcon color={Palette.primary} />;
    default:
      return <SymbolView name={icon} size={18} weight="regular" tintColor={Palette.primary} />;
  }
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: Palette.grey200,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 16,
    gap: 14,
  },
  header: {
    gap: 4,
  },
  headerTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    color: Palette.text,
  },
  headerDescription: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 19.5,
    color: Palette.grey600,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  step: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 8,
  },
  arrow: {
    marginTop: 12,
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
  numberCircle: {
    backgroundColor: '#F4FFF8',
    borderColor: '#D4F7E4',
  },
  numberText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.primary,
    textAlign: 'center',
  },
  label: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    color: Palette.text,
    textAlign: 'center',
  },
});

function TaxiOriginIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9.45075 16.3492C10.8457 15.1447 15 11.2447 15 7.5C15 5.9087 14.3679 4.38258 13.2426 3.25736C12.1174 2.13214 10.5913 1.5 9 1.5C7.4087 1.5 5.88258 2.13214 4.75736 3.25736C3.63214 4.38258 3 5.9087 3 7.5C3 11.2447 7.15425 15.1447 8.54925 16.3492C8.67921 16.447 8.8374 16.4998 9 16.4998C9.1626 16.4998 9.32079 16.447 9.45075 16.3492Z"
        stroke="#4FAE98"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 9.75C10.2426 9.75 11.25 8.74264 11.25 7.5C11.25 6.25736 10.2426 5.25 9 5.25C7.75736 5.25 6.75 6.25736 6.75 7.5C6.75 8.74264 7.75736 9.75 9 9.75Z"
        stroke="#4FAE98"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TaxiDestinationIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M3 8.68421L15 3L9.31579 15L8.05263 9.94737L3 8.68421Z"
        stroke="#4FAE98"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TaxiCarIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M13.9 12H15.3C15.72 12 16 11.7 16 11.25V9C16 8.325 15.51 7.725 14.95 7.575C13.69 7.2 11.8 6.75 11.8 6.75C11.8 6.75 10.89 5.7 10.26 5.025C9.91 4.725 9.49 4.5 9 4.5H4.1C3.68 4.5 3.33 4.8 3.12 5.175L2.14 7.35C2.04731 7.63967 2 7.94378 2 8.25V11.25C2 11.7 2.28 12 2.7 12H4.1M13.9 12C13.9 12.8284 13.2732 13.5 12.5 13.5C11.7268 13.5 11.1 12.8284 11.1 12M13.9 12C13.9 11.1716 13.2732 10.5 12.5 10.5C11.7268 10.5 11.1 11.1716 11.1 12M4.1 12C4.1 12.8284 4.7268 13.5 5.5 13.5C6.2732 13.5 6.9 12.8284 6.9 12M4.1 12C4.1 11.1716 4.7268 10.5 5.5 10.5C6.2732 10.5 6.9 11.1716 6.9 12M6.9 12H11.1"
        stroke="#4FAE98"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function TaxiPhoneIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9 13.2H9.00714M5.42857 2H12.5714C13.3604 2 14 2.6268 14 3.4V14.6C14 15.3732 13.3604 16 12.5714 16H5.42857C4.63959 16 4 15.3732 4 14.6V3.4C4 2.6268 4.63959 2 5.42857 2Z"
        stroke="#4FAE98"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BusClockIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M9 4.8V9H11.8M16 9C16 12.866 12.866 16 9 16C5.13401 16 2 12.866 2 9C2 5.13401 5.13401 2 9 2C12.866 2 16 5.13401 16 9Z"
        stroke="#4FAE98"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function BusSeatIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M14.8333 6.5625V4.125C14.8333 3.69402 14.6577 3.2807 14.3452 2.97595C14.0326 2.6712 13.6087 2.5 13.1667 2.5H4.83333C4.39131 2.5 3.96738 2.6712 3.65482 2.97595C3.34226 3.2807 3.16667 3.69402 3.16667 4.125V6.5625M14.8333 6.5625C15.2754 6.5625 15.6993 6.73371 16.0118 7.03845C16.3244 7.3432 16.5 7.75652 16.5 8.1875V12.25C16.5 12.681 16.3244 13.0943 16.0118 13.399C15.6993 13.7038 15.2754 13.875 14.8333 13.875M14.8333 6.5625C14.3913 6.5625 13.9674 6.73371 13.6548 7.03845C13.3423 7.3432 13.1667 7.75652 13.1667 8.1875V9.40625C13.1667 9.51399 13.1228 9.61733 13.0446 9.69351C12.9665 9.7697 12.8605 9.8125 12.75 9.8125H5.25C5.13949 9.8125 5.03351 9.7697 4.95537 9.69351C4.87723 9.61733 4.83333 9.51399 4.83333 9.40625V8.1875C4.83333 7.75652 4.65774 7.3432 4.34518 7.03845C4.03262 6.73371 3.60869 6.5625 3.16667 6.5625M3.16667 6.5625C2.72464 6.5625 2.30072 6.73371 1.98816 7.03845C1.67559 7.3432 1.5 7.75652 1.5 8.1875V12.25C1.5 12.681 1.67559 13.0943 1.98816 13.399C2.30072 13.7038 2.72464 13.875 3.16667 13.875M3.16667 13.875H14.8333M3.16667 13.875V15.5M14.8333 13.875V15.5"
        stroke="#4FAE98"
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PassportSquareDashedIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M3.55556 2C3.143 2 2.74733 2.16389 2.45561 2.45561C2.16389 2.74733 2 3.143 2 3.55556M14.4444 2C14.857 2 15.2527 2.16389 15.5444 2.45561C15.8361 2.74733 16 3.143 16 3.55556M16 14.4444C16 14.857 15.8361 15.2527 15.5444 15.5444C15.2527 15.8361 14.857 16 14.4444 16M3.55556 16C3.143 16 2.74733 15.8361 2.45561 15.5444C2.16389 15.2527 2 14.857 2 14.4444M6.66667 2H7.44444M6.66667 16H7.44444M10.5556 2H11.3333M10.5556 16H11.3333M2 6.66667V7.44444M16 6.66667V7.44444M2 10.5556V11.3333M16 10.5556V11.3333"
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SirenIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M3 14.4444H15V12.8889H3V14.4444ZM7.5 7.44444C7.5 7.01667 7.64688 6.65046 7.94063 6.34583C8.23438 6.0412 8.5875 5.88889 9 5.88889C9.2125 5.88889 9.39063 5.81435 9.53438 5.66528C9.67813 5.5162 9.75 5.33148 9.75 5.11111C9.75 4.89074 9.67813 4.70602 9.53438 4.55694C9.39063 4.40787 9.2125 4.33333 9 4.33333C8.175 4.33333 7.46875 4.63796 6.88125 5.24722C6.29375 5.85648 6 6.58889 6 7.44444V9C6 9.22037 6.07188 9.40509 6.21562 9.55417C6.35938 9.70324 6.5375 9.77778 6.75 9.77778C6.9625 9.77778 7.14062 9.70324 7.28438 9.55417C7.42812 9.40509 7.5 9.22037 7.5 9V7.44444ZM5.25 11.3333H12.75V7.44444C12.75 6.36852 12.3844 5.45139 11.6531 4.69306C10.9219 3.93472 10.0375 3.55556 9 3.55556C7.9625 3.55556 7.07812 3.93472 6.34688 4.69306C5.61562 5.45139 5.25 6.36852 5.25 7.44444V11.3333ZM3 16C2.5875 16 2.23438 15.8477 1.94063 15.5431C1.64688 15.2384 1.5 14.8722 1.5 14.4444V12.8889C1.5 12.4611 1.64688 12.0949 1.94063 11.7903C2.23438 11.4856 2.5875 11.3333 3 11.3333H3.75V7.44444C3.75 5.92778 4.25937 4.6412 5.27812 3.58472C6.29688 2.52824 7.5375 2 9 2C10.4625 2 11.7031 2.52824 12.7219 3.58472C13.7406 4.6412 14.25 5.92778 14.25 7.44444V11.3333H15C15.4125 11.3333 15.7656 11.4856 16.0594 11.7903C16.3531 12.0949 16.5 12.4611 16.5 12.8889V14.4444C16.5 14.8722 16.3531 15.2384 16.0594 15.5431C15.7656 15.8477 15.4125 16 15 16H3Z"
        fill={color}
      />
    </Svg>
  );
}

function AccountBalanceIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18" fill="none">
      <Path
        d="M4.1 12.4557V8.91139C4.1 8.71055 4.16708 8.54219 4.30125 8.40633C4.43542 8.27046 4.60167 8.20253 4.8 8.20253C4.99833 8.20253 5.16458 8.27046 5.29875 8.40633C5.43292 8.54219 5.5 8.71055 5.5 8.91139V12.4557C5.5 12.6565 5.43292 12.8249 5.29875 12.9608C5.16458 13.0966 4.99833 13.1646 4.8 13.1646C4.60167 13.1646 4.43542 13.0966 4.30125 12.9608C4.16708 12.8249 4.1 12.6565 4.1 12.4557ZM8.3 12.4557V8.91139C8.3 8.71055 8.36708 8.54219 8.50125 8.40633C8.63542 8.27046 8.80167 8.20253 9 8.20253C9.19833 8.20253 9.36458 8.27046 9.49875 8.40633C9.63292 8.54219 9.7 8.71055 9.7 8.91139V12.4557C9.7 12.6565 9.63292 12.8249 9.49875 12.9608C9.36458 13.0966 9.19833 13.1646 9 13.1646C8.80167 13.1646 8.63542 13.0966 8.50125 12.9608C8.36708 12.8249 8.3 12.6565 8.3 12.4557ZM2.7 16C2.50167 16 2.33542 15.9321 2.20125 15.7962C2.06708 15.6603 2 15.492 2 15.2911C2 15.0903 2.06708 14.9219 2.20125 14.7861C2.33542 14.6502 2.50167 14.5823 2.7 14.5823H15.3C15.4983 14.5823 15.6646 14.6502 15.7987 14.7861C15.9329 14.9219 16 15.0903 16 15.2911C16 15.492 15.9329 15.6603 15.7987 15.7962C15.6646 15.9321 15.4983 16 15.3 16H2.7ZM12.5 12.4557V8.91139C12.5 8.71055 12.5671 8.54219 12.7013 8.40633C12.8354 8.27046 13.0017 8.20253 13.2 8.20253C13.3983 8.20253 13.5646 8.27046 13.6987 8.40633C13.8329 8.54219 13.9 8.71055 13.9 8.91139V12.4557C13.9 12.6565 13.8329 12.8249 13.6987 12.9608C13.5646 13.0966 13.3983 13.1646 13.2 13.1646C13.0017 13.1646 12.8354 13.0966 12.7013 12.9608C12.5671 12.8249 12.5 12.6565 12.5 12.4557ZM15.3 6.78481H2.63C2.455 6.78481 2.30625 6.72278 2.18375 6.59873C2.06125 6.47468 2 6.32405 2 6.14684V5.75696C2 5.627 2.03208 5.51477 2.09625 5.42025C2.16042 5.32574 2.245 5.24895 2.35 5.18987L8.37 2.14177C8.56833 2.04726 8.77833 2 9 2C9.22167 2 9.43167 2.04726 9.63 2.14177L15.615 5.17215C15.7433 5.23122 15.8396 5.31983 15.9038 5.43797C15.9679 5.55612 16 5.68017 16 5.81013V6.07595C16 6.27679 15.9329 6.44515 15.7987 6.58101C15.6646 6.71688 15.4983 6.78481 15.3 6.78481ZM5.115 5.36709H12.885L9 3.41772L5.115 5.36709Z"
        fill={color}
      />
    </Svg>
  );
}

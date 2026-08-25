import { SymbolView } from 'expo-symbols';
import type { ComponentProps } from 'react';
import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import CustomText from '@/components/CustomText';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';

type SymbolName = ComponentProps<typeof SymbolView>['name'];

export type IconFlowStep = {
  icon: SymbolName;
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
              <View style={styles.iconCircle}>
                <SymbolView name={step.icon} size={18} weight="regular" tintColor={Palette.primary} />
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
  label: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    color: Palette.text,
    textAlign: 'center',
  },
});

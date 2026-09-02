import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/CustomText';
import BulletList from '@/components/guide-blocks/BulletList';
import CardList from '@/components/guide-blocks/CardList';
import ChecklistCard from '@/components/guide-blocks/ChecklistCard';
import GuideDetailHero from '@/components/guide-blocks/GuideDetailHero';
import HikingPreviewCard from '@/components/guide-blocks/HikingPreviewCard';
import IconFlow from '@/components/guide-blocks/IconFlow';
import NotificationCard from '@/components/guide-blocks/NotificationCard';
import PhraseCards from '@/components/guide-blocks/PhraseCards';
import PhraseTable from '@/components/guide-blocks/PhraseTable';
import ReservationPreviewCard from '@/components/guide-blocks/ReservationPreviewCard';
import RouteStops from '@/components/guide-blocks/RouteStops';
import SignCard from '@/components/guide-blocks/SignCard';
import StatusTracker from '@/components/guide-blocks/StatusTracker';
import StepBlock from '@/components/guide-blocks/StepBlock';
import WarningBox from '@/components/guide-blocks/WarningBox';
import HoriTipCard from '@/components/HoriTipCard';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { GUIDE_CONTENT, GUIDE_CONTENT_EN, type GuideBlock } from '@/constants/guide-content';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useLanguageStore } from '@/store/language-store';

function GuideBlockView({ block, index }: { block: GuideBlock; index: number }) {
  switch (block.type) {
    case 'step':
      return (
        <View style={[styles.stepWrap, index === 0 ? styles.firstStepWrap : null]}>
          <StepBlock number={block.number} title={block.title} description={block.description} />
        </View>
      );
    case 'reservationPreviewCard':
      return (
        <View style={styles.reservationPreviewWrap}>
          <ReservationPreviewCard
            title={block.title}
            subtitle={block.subtitle}
            rows={block.rows}
            buttonLabel={block.buttonLabel}
          />
        </View>
      );
    case 'mountainPreviewCard':
      return <HikingPreviewCard title={block.title} rows={block.rows} />;
    case 'image':
      if (block.frameHeight || block.frameBackgroundColor || block.frameBorderColor || block.frameBorderRadius) {
        return (
          <View
            style={[
              styles.framedImageWrap,
              block.frameHeight ? { height: block.frameHeight } : null,
              block.frameBackgroundColor ? { backgroundColor: block.frameBackgroundColor } : null,
              block.frameBorderColor ? { borderColor: block.frameBorderColor } : null,
              block.frameBorderRadius ? { borderRadius: block.frameBorderRadius } : null,
            ]}
          >
            <Image
              source={block.source}
              style={styles.framedImage}
              contentFit={block.contentFit ?? 'contain'}
            />
          </View>
        );
      }

      return (
        <Image
          source={block.source}
          style={[styles.image, block.aspectRatio ? { aspectRatio: block.aspectRatio, height: undefined } : null]}
          contentFit={block.contentFit ?? 'cover'}
        />
      );
    case 'warning':
      return <WarningBox text={block.text} />;
    case 'phraseTable':
      return <PhraseTable title={block.title} phrases={block.phrases} />;
    case 'phraseCards':
      return <PhraseCards title={block.title} phrases={block.phrases} />;
    case 'bulletList':
      return <BulletList columns={block.columns} />;
    case 'cardList':
      return (
        <View style={block.blockSpacingTop ? { marginTop: block.blockSpacingTop } : null}>
          <CardList layout={block.layout} cards={block.cards} />
        </View>
      );
    case 'iconFlow':
      return <IconFlow steps={block.steps} />;
    case 'iconFlowCard':
      return <IconFlow title={block.title} description={block.description} steps={block.steps} />;
    case 'checklistCard':
      return (
        <ChecklistCard
          title={block.title}
          description={block.description}
          items={block.items}
          flowItems={block.flowItems}
          itemIcons={block.itemIcons}
        />
      );
    case 'routeStops':
      return <RouteStops caption={block.caption} stops={block.stops} />;
    case 'horiTipInline':
      return <HoriTipCard variant="inline" title={block.title} body={block.body} />;
    case 'notificationCard':
      return (
        <NotificationCard
          emoji={block.emoji}
          title={block.title}
          timestamp={block.timestamp}
          body={block.body}
          bodySub={block.bodySub}
        />
      );
    case 'statusTracker':
      return <StatusTracker steps={block.steps} activeIndex={block.activeIndex} />;
    case 'signCard':
      return (
        <SignCard icon={block.icon} title={block.title} translations={block.translations} caption={block.caption} />
      );
    default:
      return null;
  }
}

export default function GuideDetailScreen() {
  const router = useRouter();
  const t = useTranslation();
  const { guideId } = useLocalSearchParams<{ guideId: string }>();
  const language = useLanguageStore((state) => state.language);
  const content = guideId ? (language === 'EN' ? GUIDE_CONTENT_EN : GUIDE_CONTENT)[guideId] : undefined;

  if (!content) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <OnboardingHeader onBack={() => goBackOrRoot(router)} title="" rightIcon={null} />
        <View style={styles.emptyState}>
          <CustomText style={styles.emptyTitle}>{t.guideDetail.stepComingSoonTitle}</CustomText>
          <CustomText style={styles.emptyBody}>{t.guideDetail.stepComingSoonBody}</CustomText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => goBackOrRoot(router)} title="" rightIcon={null} />
      <ScrollView contentContainerStyle={styles.content}>
        <GuideDetailHero
          image={content.hero}
          categoryBadge={t.guideDetail.categoryBadge[content.category]}
          title={content.title}
          description={content.description}
        />

        <View style={styles.blocks}>
          {content.blocks.map((block, index) => (
            <GuideBlockView key={index} block={block} index={index} />
          ))}
        </View>

        <HoriTipCard title={content.tip.title} body={content.tip.body} checklist={content.tip.checklist} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },
  blocks: {
    marginTop: 32,
    gap: 16,
  },
  stepWrap: {
    marginTop: 16,
  },
  firstStepWrap: {
    marginTop: 0,
  },
  reservationPreviewWrap: {
    marginVertical: -8,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  framedImageWrap: {
    width: '100%',
    borderWidth: 1,
    overflow: 'hidden',
  },
  framedImage: {
    ...StyleSheet.absoluteFill,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    color: Palette.text,
  },
  emptyBody: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    color: Palette.grey600,
    textAlign: 'center',
  },
});

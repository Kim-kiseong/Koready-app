import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CustomText from '@/components/CustomText';
import GuideDetailHero from '@/components/guide-blocks/GuideDetailHero';
import StepBlock from '@/components/guide-blocks/StepBlock';
import WarningBox from '@/components/guide-blocks/WarningBox';
import PhraseTable from '@/components/guide-blocks/PhraseTable';
import PhraseCards from '@/components/guide-blocks/PhraseCards';
import BulletList from '@/components/guide-blocks/BulletList';
import CardList from '@/components/guide-blocks/CardList';
import IconFlow from '@/components/guide-blocks/IconFlow';
import ChecklistCard from '@/components/guide-blocks/ChecklistCard';
import RouteStops from '@/components/guide-blocks/RouteStops';
import NotificationCard from '@/components/guide-blocks/NotificationCard';
import StatusTracker from '@/components/guide-blocks/StatusTracker';
import SignCard from '@/components/guide-blocks/SignCard';
import HoriTipCard from '@/components/HoriTipCard';
import OnboardingHeader from '@/components/OnboardingHeader';
import { GUIDE_CONTENT, type GuideBlock } from '@/constants/guide-content';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';

function GuideBlockView({ block }: { block: GuideBlock }) {
  switch (block.type) {
    case 'step':
      return <StepBlock number={block.number} title={block.title} description={block.description} />;
    case 'image':
      return (
        <Image
          source={block.source}
          style={[styles.image, block.aspectRatio ? { aspectRatio: block.aspectRatio, height: undefined } : null]}
          contentFit="cover"
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
      return <CardList layout={block.layout} cards={block.cards} />;
    case 'iconFlow':
      return <IconFlow steps={block.steps} />;
    case 'iconFlowCard':
      return <IconFlow title={block.title} description={block.description} steps={block.steps} />;
    case 'checklistCard':
      return <ChecklistCard title={block.title} description={block.description} items={block.items} />;
    case 'routeStops':
      return <RouteStops caption={block.caption} stops={block.stops} />;
    case 'horiTipInline':
      return <HoriTipCard title={block.title} body={block.body} />;
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
  const content = guideId ? GUIDE_CONTENT[guideId] : undefined;

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
            <GuideBlockView key={index} block={block} />
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
    gap: 24,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 16,
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

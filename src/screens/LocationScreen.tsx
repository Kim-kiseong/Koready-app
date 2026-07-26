import { SymbolView } from 'expo-symbols';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { searchLocations, type LocationSearchResult } from '@/api/onboarding';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { useOnboardingStore } from '@/store/onboarding-store';

export default function LocationScreen() {
  const router = useRouter();
  const t = useTranslation();
  const location = useOnboardingStore((state) => state.location);
  const setLocation = useOnboardingStore((state) => state.setLocation);

  const [query, setQuery] = useState(location?.displayAddress ?? '');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<LocationSearchResult[]>([]);

  useEffect(() => {
    let cancelled = false;
    searchLocations(query).then((found) => {
      if (!cancelled) setResults(found);
    });
    return () => {
      cancelled = true;
    };
  }, [query]);

  const handleSelectResult = (result: LocationSearchResult) => {
    setLocation({ displayAddress: result.roadAddr, latitude: null, longitude: null, source: 'search' });
    setQuery(result.roadAddr);
    setResults([]);
  };

  const handleUseCurrentLocation = () => {
    setLocation({
      displayAddress: t.location.currentLocationValue,
      latitude: null,
      longitude: null,
      source: 'current',
    });
    setQuery(t.location.currentLocationValue);
    setResults([]);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
  };

  const handleNext = () => {
    if (!location) return;
    router.push('/travel-style');
  };

  const showResults = query.length > 0 && results.length > 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => router.back()} title={t.location.title} />

      <View style={styles.content}>
        <View
          style={[
            styles.searchBar,
            isFocused ? styles.searchBarFocused : styles.searchBarDefault,
          ]}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={18}
            weight="regular"
            tintColor={Palette.grey400}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t.location.searchPlaceholder}
            placeholderTextColor={Palette.grey400}
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <Pressable onPress={handleClear} hitSlop={8}>
              <SymbolView
                name={{ ios: 'xmark.circle.fill', android: 'close', web: 'close' }}
                size={18}
                weight="regular"
                tintColor={Palette.grey400}
              />
            </Pressable>
          )}
        </View>

        {showResults ? (
          <View style={styles.resultList}>
            {results.map((result) => (
              <View key={`${result.zipNo}-${result.roadAddr}`} style={styles.resultGroup}>
                <CustomText style={styles.zipText}>{result.zipNo}</CustomText>
                <Pressable style={styles.resultRow} onPress={() => handleSelectResult(result)}>
                  <View style={[styles.badge, styles.badgeRoad]}>
                    <CustomText style={styles.badgeTextRoad}>{t.location.roadAddressBadge}</CustomText>
                  </View>
                  <CustomText style={styles.addressText}>{result.roadAddr}</CustomText>
                </Pressable>
                <Pressable style={styles.resultRow} onPress={() => handleSelectResult(result)}>
                  <View style={[styles.badge, styles.badgeLot]}>
                    <CustomText style={styles.badgeTextLot}>{t.location.lotNumberBadge}</CustomText>
                  </View>
                  <CustomText style={styles.addressText}>{result.jibunAddr}</CustomText>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <Pressable style={styles.currentLocationButton} onPress={handleUseCurrentLocation}>
            <SymbolView
              name={{ ios: 'location.fill', android: 'my_location', web: 'my_location' }}
              size={18}
              weight="regular"
              tintColor={Palette.text}
            />
            <CustomText style={styles.currentLocationText}>
              {t.location.currentLocationButton}
            </CustomText>
          </Pressable>
        )}
      </View>

      <View style={styles.footer}>
        <PrimaryButton title={t.location.next} disabled={!location} onPress={handleNext} />
      </View>
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
    gap: 12,
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  searchBarDefault: {
    backgroundColor: Palette.grey100,
    borderColor: Palette.grey200,
  },
  searchBarFocused: {
    backgroundColor: Palette.secondary,
    borderColor: Palette.primaryLight,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    color: Palette.text,
    padding: 0,
  },
  currentLocationButton: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  currentLocationText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    color: Palette.text,
  },
  resultList: {
    gap: 8,
  },
  resultGroup: {
    borderTopWidth: 1,
    borderTopColor: Palette.grey150,
    paddingVertical: 4,
    paddingHorizontal: 4,
    gap: 8,
  },
  zipText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    color: Palette.text,
    marginTop: 8,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeRoad: {
    backgroundColor: Palette.secondary,
  },
  badgeLot: {
    backgroundColor: Palette.grey100,
  },
  badgeTextRoad: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    color: Palette.primaryDark,
  },
  badgeTextLot: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 12,
    color: Palette.grey600,
  },
  addressText: {
    flex: 1,
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    color: Palette.text,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 14,
  },
});

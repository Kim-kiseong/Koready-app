import { isAxiosError } from 'axios';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createMyLocation } from '@/api/address';
import { searchLocations, type LocationSearchItem } from '@/api/onboarding';
import CustomText from '@/components/CustomText';
import OnboardingHeader from '@/components/OnboardingHeader';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useAddressStore } from '@/store/address-store';
import { useLanguageStore } from '@/store/language-store';
import { useOnboardingStore } from '@/store/onboarding-store';

const SEARCH_DEBOUNCE_MS = 400;

export default function AddressSearchScreen() {
  const router = useRouter();
  const t = useTranslation();
  const addressSearchAlerts = t.addressSearch.alerts;
  const language = useLanguageStore((state) => state.language);
  const setLocation = useOnboardingStore((state) => state.setLocation);
  const setCurrentLocationId = useOnboardingStore((state) => state.setCurrentLocationId);
  const addSavedAddress = useAddressStore((state) => state.addSavedAddress);

  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<LocationSearchItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const trimmedQuery = query.trim();

  useEffect(() => {
    // The API accepts 1 char, but 2+ keeps result quality reasonable.
    if (trimmedQuery.length < 2) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchLocations(trimmedQuery, language, 10, controller.signal)
        .then((items) => setResults(items))
        .catch((error) => {
          if (isAxiosError(error) && error.code === 'ERR_CANCELED') return;
          if (isAxiosError(error) && error.response?.status === 503) {
            Alert.alert(addressSearchAlerts.errorTitle, addressSearchAlerts.mapServiceError);
          }
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [addressSearchAlerts, trimmedQuery, language]);

  const handleSelectResult = async (item: LocationSearchItem) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const saved = await createMyLocation({
        searchResultToken: item.searchResultToken,
        customLabel: null,
        setDefault: false,
      });
      setLocation({
        displayAddress: saved.customLabel ?? saved.displayName,
        latitude: saved.latitude,
        longitude: saved.longitude,
        source: 'search',
      });
      setCurrentLocationId(saved.locationId);
      addSavedAddress(saved);
      goBackOrRoot(router);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 410) {
        Alert.alert(addressSearchAlerts.errorTitle, addressSearchAlerts.searchResultExpired);
      } else {
        Alert.alert(addressSearchAlerts.errorTitle, addressSearchAlerts.saveFailed);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const showResults = trimmedQuery.length >= 2 && results.length > 0;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <OnboardingHeader onBack={() => goBackOrRoot(router)} title={t.addressSearch.title} rightIcon={null} />

      <View style={styles.content}>
        <View
          style={[styles.searchBar, isFocused ? styles.searchBarFocused : styles.searchBarDefault]}>
          <SymbolView
            name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
            size={18}
            weight="regular"
            tintColor={Palette.grey400}
          />
          <TextInput
            autoFocus
            value={query}
            onChangeText={setQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t.address.searchPlaceholder}
            placeholderTextColor={Palette.grey400}
            style={styles.searchInput}
          />
        </View>

        {showResults && (
          <View style={styles.resultList}>
            {results.map((result) => (
              // One Pressable for the whole group, not just the address
              // sub-rows — result.name (the prominent top label) used to sit
              // outside any Pressable, so it looked tappable but wasn't; only
              // the road/lot-number rows underneath actually selected anything.
              <Pressable
                key={result.searchResultToken}
                style={styles.resultGroup}
                onPress={() => handleSelectResult(result)}>
                <CustomText style={styles.zipText}>{result.name}</CustomText>
                {result.roadAddress && (
                  <View style={styles.resultRow}>
                    <View style={[styles.badge, styles.badgeRoad]}>
                      <CustomText style={styles.badgeTextRoad}>{t.location.roadAddressBadge}</CustomText>
                    </View>
                    <CustomText style={styles.addressText}>{result.roadAddress}</CustomText>
                  </View>
                )}
                {result.address && (
                  <View style={styles.resultRow}>
                    <View style={[styles.badge, styles.badgeLot]}>
                      <CustomText style={styles.badgeTextLot}>{t.location.lotNumberBadge}</CustomText>
                    </View>
                    <CustomText style={styles.addressText}>{result.address}</CustomText>
                  </View>
                )}
                {!result.roadAddress && !result.address && (
                  <View style={styles.resultRow}>
                    <CustomText style={styles.addressText}>{result.sido} {result.sigungu}</CustomText>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        )}
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
    // Without this a flex item's min-width defaults to its content's
    // intrinsic width, so a long placeholder/value refuses to shrink and
    // pushes the input past the search bar's edge instead of clipping.
    minWidth: 0,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    color: Palette.text,
    padding: 0,
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
});

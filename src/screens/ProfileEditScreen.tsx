import { isAxiosError } from 'axios';
import { Asset } from 'expo-asset';
import { File as ExpoFile } from 'expo-file-system';
import { Image, type ImageSource } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRouter } from 'expo-router';
import { usePreventRemove } from 'expo-router/build/react-navigation/core';
import { SymbolView } from 'expo-symbols';
import { fetch as expoFetch } from 'expo/fetch';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, SvgUri } from 'react-native-svg';

import {
  completeProfileImageUpload,
  fetchMyBuddyProfile,
  fetchProfileOptions,
  requestProfileImageUploadUrl,
  updateMyBuddyProfile,
} from '@/api/buddy-profile';
import { fetchOnboardingProgress } from '@/api/onboarding';
import type {
  BuddyProfileResponse,
  BuddyProfileSocialLinkInput,
  BuddyProfileSocialLinkRequest,
  ProfileImageUploadUrlRequest,
  ProfileOptionItem,
  ProfileOptionsResponse,
} from '@/api/types';
import ConfirmationModal from '@/components/ConfirmationModal';
import CustomText from '@/components/CustomText';
import BackIcon from '@/components/icons/BackIcon';
import PrimaryButton from '@/components/PrimaryButton';
import { Palette } from '@/constants/colors';
import { FontFamily } from '@/constants/typography';
import { useTranslation } from '@/i18n/useTranslation';
import { goBackOrRoot } from '@/navigation/safe-back';
import { useAuthStore } from '@/store/auth-store';
import { useLanguageStore } from '@/store/language-store';
import { useOnboardingStore } from '@/store/onboarding-store';
import { getCountryDisplayName } from '@/utils/country';
import { normalizeLanguageCode } from '@/utils/language-display';
import {
  buildProfileImagePath,
  resolveProfileImageSource,
  toProfileImagePath,
} from '@/utils/profile-image';

type BuddyProfileFormState = {
  profileImageUrl: string | null;
  nickname: string;
  nationality: string;
  availableLanguages: string[];
  koreanLevel: string;
  bio: string;
  travelStyles: string[];
  socialLinks: BuddyProfileSocialLinkInput[];
  profilePublic: boolean;
  snsPublic: boolean;
  allowsMessages: boolean;
};

type SelectionModalProps = {
  visible: boolean;
  title: string;
  subtitle?: string;
  language: string;
  options: ProfileOptionItem[];
  selectedCodes: string[];
  multiSelect: boolean;
  presentation?: 'grid' | 'list';
  confirmLabel: string;
  searchPlaceholder: string;
  optionLabelFormatter?: (option: ProfileOptionItem) => string;
  onCancel: () => void;
  onConfirm: (selectedCodes: string[]) => void;
};

type SnsEditorOverlayProps = {
  visible: boolean;
  language: string;
  options: ProfileOptionItem[];
  value: BuddyProfileSocialLinkInput[];
  onCancel: () => void;
  onSave: (nextLinks: BuddyProfileSocialLinkInput[]) => void;
};

const EMPTY_FORM: BuddyProfileFormState = {
  profileImageUrl: null,
  nickname: '',
  nationality: '',
  availableLanguages: [],
  koreanLevel: '',
  bio: '',
  travelStyles: [],
  socialLinks: [],
  profilePublic: true,
  snsPublic: true,
  allowsMessages: true,
};

const MAX_SNS_LINKS = 2;
const MAX_TRAVEL_STYLES = 4;
const MAX_PROFILE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const SHEET_ANIMATION_DURATION = 220;
const shouldUseNativeDriver = Platform.OS !== 'web';
const WEB_IMMEDIATE_PRESS_PROPS =
  Platform.OS === 'web' ? ({ delayPressIn: 0 } as Record<string, unknown>) : {};
const WEB_TAP_TARGET_STYLE =
  Platform.OS === 'web' ? ({ touchAction: 'manipulation' } as object) : null;

type ProfileImageContentType = ProfileImageUploadUrlRequest['contentType'];

const ALLOWED_PROFILE_IMAGE_MIME_TYPES = new Set<ProfileImageContentType>([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

const SOCIAL_PLATFORM_ICON_URIS = {
  INSTAGRAM: Asset.fromModule(require('../assets/images/social/instagram.svg')).uri,
  TIKTOK: Asset.fromModule(require('../assets/images/social/tiktok.svg')).uri,
  WECHAT: Asset.fromModule(require('../assets/images/social/wechat.svg')).uri,
  XIAOHONGSHU: Asset.fromModule(require('../assets/images/social/xiaohongshu.svg')).uri,
  LINE: Asset.fromModule(require('../assets/images/social/line.svg')).uri,
  KAKAOTALK: Asset.fromModule(require('../assets/images/social/kakaotalk.svg')).uri,
} as const;

const SNS_EDITOR_BOTTOM_SPACE = 120;

export default function ProfileEditScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const language = useLanguageStore((state) => state.language);
  const t = useTranslation();
  const copy = t.profileEdit;
  const authProfileImageUrl = useAuthStore((state) => state.user?.profileImageUrl ?? null);
  const onboardingHasHydrated = useOnboardingStore((state) => state.hasHydrated);
  const isMountedRef = useRef(true);

  const [options, setOptions] = useState<ProfileOptionsResponse | null>(null);
  const [form, setForm] = useState<BuddyProfileFormState>(EMPTY_FORM);
  const [initialForm, setInitialForm] = useState<BuddyProfileFormState>(EMPTY_FORM);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isNicknameFocused, setIsNicknameFocused] = useState(false);
  const [isBioFocused, setIsBioFocused] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [profileImagePreviewUri, setProfileImagePreviewUri] = useState<string | null>(null);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [avatarActionSheetOpen, setAvatarActionSheetOpen] = useState(false);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [languagePickerOpen, setLanguagePickerOpen] = useState(false);
  const [snsEditorOpen, setSnsEditorOpen] = useState(false);
  const [unsavedChangesModalOpen, setUnsavedChangesModalOpen] = useState(false);
  const [isBypassingUnsavedChangesGuard, setIsBypassingUnsavedChangesGuard] = useState(false);
  const pendingNavigationActionRef = useRef<any>(null);
  const shouldNavigateAfterSaveRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!onboardingHasHydrated) {
        setIsLoading(true);
        return;
      }

      try {
        setLoadError(null);
        setIsLoading(true);
        setProfileExists(false);

        const [optionsResult, profileResult] = await Promise.allSettled([
          fetchProfileOptions(),
          fetchMyBuddyProfile(),
        ]);

        if (cancelled) return;

        if (optionsResult.status === 'rejected') {
          setLoadError(
            optionsResult.reason instanceof Error
              ? optionsResult.reason.message
              : copy.errors.loadOptions,
          );
          return;
        }

        if (profileResult.status === 'rejected') {
          setLoadError(extractErrorMessage(profileResult.reason));
          return;
        }

        const loadedOptions = optionsResult.value;
        const loadedProfile = profileResult.value;

        let defaultTravelStyles = useOnboardingStore.getState().travelStyles;

        if (!loadedProfile.exists) {
          try {
            const onboardingProgress = await fetchOnboardingProgress();
            if (cancelled) return;

            useOnboardingStore.getState().applyProgress(onboardingProgress);
            defaultTravelStyles = onboardingProgress.travelStyles;
          } catch {
            // Profile editing should remain available even if onboarding
            // progress cannot be fetched for a completed user.
          }
        }

        if (cancelled) return;
        setOptions(loadedOptions);
        setProfileExists(loadedProfile.exists);
        const nextForm = buildInitialForm(
          loadedProfile,
          loadedOptions,
          defaultTravelStyles,
          authProfileImageUrl,
        );
        setForm(nextForm);
        setInitialForm(nextForm);
      } catch (error) {
        if (!cancelled) {
          setLoadError(extractErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authProfileImageUrl, copy.errors.loadOptions, reloadKey, onboardingHasHydrated]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const normalizedLanguageOptions = useMemo(() => {
    const seen = new Set<string>();
    const normalizedOptions: ProfileOptionItem[] = [];

    for (const option of options?.languages ?? []) {
      const normalizedCode = normalizeLanguageCode(option.code);
      if (!normalizedCode || seen.has(normalizedCode)) {
        continue;
      }

      seen.add(normalizedCode);
      normalizedOptions.push({
        ...option,
        code: normalizedCode,
      });
    }

    return normalizedOptions;
  }, [options?.languages]);

  const sortedLanguageCodes = useMemo(
    () => sortLanguageCodesByOptionOrder(form.availableLanguages, normalizedLanguageOptions),
    [form.availableLanguages, normalizedLanguageOptions],
  );

  const sortedTravelStyles = useMemo(
    () => sortCodesByOptionOrder(form.travelStyles, options?.travelStyles ?? []),
    [form.travelStyles, options],
  );
  const travelStyleColumnCount = language === 'EN' ? 2 : 3;
  const travelStyleRows = useMemo(
    () => chunkItems(options?.travelStyles ?? [], travelStyleColumnCount),
    [options, travelStyleColumnCount],
  );

  const sortedSocialLinks = useMemo(
    () => sortSocialLinks(form.socialLinks, options?.socialPlatforms ?? []),
    [form.socialLinks, options],
  );
  const profileImageSource = profileImagePreviewUri
    ? { uri: profileImagePreviewUri }
    : resolveProfileImageSource(form.profileImageUrl);
  const hasUnsavedChanges = useMemo(
    () =>
      !areBuddyProfileFormsEqual(form, initialForm) ||
      profileImagePreviewUri !== null ||
      isUploadingProfileImage,
    [form, initialForm, profileImagePreviewUri, isUploadingProfileImage],
  );

  const currentCountryLabel = form.nationality
    ? getCountryDisplayName(form.nationality, options?.countries, language)
    : '';
  const headerTitle = profileExists ? copy.titleEdit : copy.titleSetup;
  const hasProfileImage = profileImageSource !== null;

  const canSave = isFormComplete(form) && !isUploadingProfileImage;
  const shouldPreventRemove = hasUnsavedChanges && !isBypassingUnsavedChangesGuard;

  usePreventRemove(shouldPreventRemove, ({ data }) => {
    pendingNavigationActionRef.current = data.action;
    setUnsavedChangesModalOpen(true);
  });

  useEffect(() => {
    if (!isBypassingUnsavedChangesGuard || !shouldNavigateAfterSaveRef.current) return;

    shouldNavigateAfterSaveRef.current = false;
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    goBackOrRoot(router);
  }, [isBypassingUnsavedChangesGuard, navigation, router]);

  const handleUpdateField = <K extends keyof BuddyProfileFormState>(
    key: K,
    value: BuddyProfileFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const requestLeaveScreen = () => {
    if (hasUnsavedChanges) {
      setUnsavedChangesModalOpen(true);
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    goBackOrRoot(router);
  };

  const confirmLeaveScreen = async () => {
    setIsBypassingUnsavedChangesGuard(true);
    setUnsavedChangesModalOpen(false);
    const pendingAction = pendingNavigationActionRef.current;
    pendingNavigationActionRef.current = null;

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    if (pendingAction) {
      navigation.dispatch(pendingAction);
      return;
    }

    goBackOrRoot(router);
  };

  const cancelLeaveScreen = () => {
    pendingNavigationActionRef.current = null;
    setIsBypassingUnsavedChangesGuard(false);
    setUnsavedChangesModalOpen(false);
  };

  const handleSave = async () => {
    if (!options || !canSave || isSaving) return;

    setIsSaving(true);
    try {
      const apiNationalityCode = resolveCountryCode(form.nationality, options.countries);
      const normalizedSocialLinks = normalizeSocialLinks(sortedSocialLinks);
      const socialLinkRequests = toSocialLinkRequests(normalizedSocialLinks);
      const nextSnsPublic = normalizedSocialLinks.length > 0 ? form.snsPublic : false;
      const nextForm: BuddyProfileFormState = {
        profileImageUrl: toProfileImagePath(form.profileImageUrl),
        nickname: form.nickname.trim(),
        nationality: form.nationality.trim(),
        availableLanguages: sortedLanguageCodes.map(normalizeLanguageCode),
        koreanLevel: form.koreanLevel,
        bio: form.bio.trim(),
        travelStyles: sortedTravelStyles,
        socialLinks: normalizedSocialLinks,
        profilePublic: form.profilePublic,
        snsPublic: nextSnsPublic,
        allowsMessages: form.allowsMessages,
      };

      await updateMyBuddyProfile({
        profileImageUrl: nextForm.profileImageUrl,
        nickname: nextForm.nickname,
        nationalityCode: apiNationalityCode || form.nationality.trim(),
        availableLanguages: nextForm.availableLanguages.map(normalizeLanguageCode),
        koreanLevel: nextForm.koreanLevel,
        bio: nextForm.bio,
        travelStyles: nextForm.travelStyles,
        socialLinks: socialLinkRequests,
        profilePublic: nextForm.profilePublic,
        snsPublic: nextForm.snsPublic,
        allowsMessages: nextForm.allowsMessages,
      });
      if (!isMountedRef.current) return;

      shouldNavigateAfterSaveRef.current = true;
      setIsBypassingUnsavedChangesGuard(true);
      setForm(nextForm);
      setInitialForm(nextForm);
      setProfileImagePreviewUri(null);
      setUnsavedChangesModalOpen(false);
      pendingNavigationActionRef.current = null;

      useAuthStore.getState().setBuddyProfileExists(true);
      useAuthStore.getState().setUserProfileImageUrl(nextForm.profileImageUrl);
    } catch (error) {
      if (!isMountedRef.current) return;
      Alert.alert(copy.alerts.errorTitle, extractErrorMessage(error, copy.errors.generic));
    } finally {
      if (isMountedRef.current) {
        setIsSaving(false);
      }
    }
  };

  const handleRemoveLanguage = (code: string) => {
    const normalizedCode = normalizeLanguageCode(code);
    setForm((prev) => ({
      ...prev,
      availableLanguages: prev.availableLanguages.filter(
        (item) => normalizeLanguageCode(item) !== normalizedCode,
      ),
    }));
  };

  const handlePressProfileImageAdd = () => {
    if (isUploadingProfileImage) {
      return;
    }

    if (hasProfileImage) {
      setAvatarActionSheetOpen(true);
      return;
    }

    void handlePickProfileImage();
  };

  const handleSelectProfileImageFromSheet = async () => {
    setAvatarActionSheetOpen(false);
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await handlePickProfileImage();
  };

  const handleDeleteProfileImage = () => {
    setAvatarActionSheetOpen(false);
    setForm((prev) => ({ ...prev, profileImageUrl: null }));
    setProfileImagePreviewUri(null);
  };

  const handleToggleTravelStyle = (code: string) => {
    const currentTravelStyles = form.travelStyles;
    const exists = currentTravelStyles.includes(code);

    if (exists && currentTravelStyles.length <= 1) {
      Alert.alert(copy.alerts.infoTitle, copy.alerts.travelStyleMin);
      return;
    }

    if (!exists && currentTravelStyles.length >= MAX_TRAVEL_STYLES) {
      Alert.alert(copy.alerts.infoTitle, copy.alerts.travelStyleMax);
      return;
    }

    setForm((prev) => {
      const current = prev.travelStyles;
      const nextValues = exists ? current.filter((item) => item !== code) : [...current, code];
      return { ...prev, travelStyles: nextValues };
    });
  };

  const handlePickProfileImage = async () => {
    if (isUploadingProfileImage) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      if (!isMountedRef.current) return;
      Alert.alert(copy.alerts.photoPermissionTitle, copy.alerts.photoPermissionBody);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
      selectionLimit: 1,
    });

    if (result.canceled || !result.assets?.length) {
      return;
    }

    const asset = result.assets[0];
    const mimeType = normalizeProfileImageMimeType(asset.mimeType, asset.fileName, asset.uri);

    if (!mimeType) {
      if (!isMountedRef.current) return;
      Alert.alert(copy.alerts.unsupportedTypeTitle, copy.alerts.unsupportedTypeBody);
      return;
    }

    const uploadFile = await createProfileImageUploadFile(asset);
    const fileSize = asset.fileSize ?? uploadFile.size;

    if (!Number.isFinite(fileSize) || fileSize <= 0) {
      if (!isMountedRef.current) return;
      Alert.alert(copy.alerts.unreadableFileTitle, copy.alerts.unreadableFileBody);
      return;
    }

    if (fileSize > MAX_PROFILE_IMAGE_SIZE_BYTES) {
      if (!isMountedRef.current) return;
      Alert.alert(copy.alerts.fileTooLargeTitle, copy.alerts.fileTooLargeBody);
      return;
    }

    if (!isMountedRef.current) return;
    setProfileImagePreviewUri(asset.uri);
    setIsUploadingProfileImage(true);

    try {
      const uploadInfo = await requestProfileImageUploadUrl({
        contentType: mimeType,
        size: fileSize,
      });
      const uploadUrl = uploadInfo.uploadUrl?.trim();
      const imageId = uploadInfo.imageId?.trim();

      if (!uploadUrl) {
        throw new Error(copy.errors.uploadUrl);
      }

      if (!imageId) {
        throw new Error(copy.errors.imageId);
      }

      const uploadResponse = await expoFetch(uploadUrl, {
        method: 'PUT',
        headers: normalizeUploadHeaders(uploadInfo.requiredHeaders, mimeType),
        body: uploadFile.body,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text().catch(() => '');
        throw new Error(
          `${copy.errors.uploadFailed}${errorText ? ` (${errorText.slice(0, 120)})` : ''}`,
        );
      }

      const completed = await completeProfileImageUpload({ imageId });
      if (!isMountedRef.current) return;
      const nextProfileImageUrl =
        firstNonEmptyString(
          toProfileImagePath(completed.profileImageUrl),
          toProfileImagePath(completed.profile?.profileImageUrl),
          completed.imageId ? buildProfileImagePath(completed.imageId) : null,
        ) ?? buildProfileImagePath(imageId);

      setForm((prev) => ({ ...prev, profileImageUrl: nextProfileImageUrl }));
      setProfileImagePreviewUri(null);
    } catch (error) {
      if (!isMountedRef.current) return;
      setProfileImagePreviewUri(null);
      Alert.alert(copy.alerts.errorTitle, extractErrorMessage(error, copy.errors.generic));
    } finally {
      if (isMountedRef.current) {
        setIsUploadingProfileImage(false);
      }
    }
  };

  if (loadError) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.errorState}>
          <CustomText style={styles.errorTitle}>{copy.loadErrorTitle}</CustomText>
          <CustomText style={styles.errorDescription}>{loadError}</CustomText>
          <PrimaryButton
            title={copy.retry}
            onPress={() => {
              setLoadError(null);
              setReloadKey((prev) => prev + 1);
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading || !options) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
        <View style={styles.loadingState}>
          <ActivityIndicator color={Palette.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <View style={styles.header}>
          <Pressable hitSlop={10} style={styles.headerButton} onPress={requestLeaveScreen}>
            <BackIcon />
          </Pressable>

          <CustomText style={styles.headerTitle}>{headerTitle}</CustomText>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom - 10, 0) }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={[styles.section, styles.sectionAvatar]}>
            <SectionHeading title={copy.sections.profilePhoto} />
            <View style={styles.avatarRow}>
              <ProfileAvatarButton
                source={profileImageSource}
                loading={isUploadingProfileImage}
                onPressAdd={handlePressProfileImageAdd}
              />
            </View>
          </View>

          <View style={[styles.section, styles.sectionNickname]}>
            <FieldLabel label={copy.sections.nickname} />
            <View style={[styles.inputFrame, isNicknameFocused && styles.inputFrameFocused]}>
              <TextInput
                value={form.nickname}
                onChangeText={(text) => handleUpdateField('nickname', text)}
                placeholder={copy.placeholders.nickname}
                placeholderTextColor="#8B95A1"
                cursorColor="#4FAE98"
                selectionColor="#4FAE98"
                textAlignVertical="center"
                style={styles.textInput}
                onFocus={() => setIsNicknameFocused(true)}
                onBlur={() => setIsNicknameFocused(false)}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              {form.nickname.length > 0 && isNicknameFocused ? (
                <Pressable
                  hitSlop={8}
                  onPress={() => handleUpdateField('nickname', '')}
                  style={styles.fieldTrailingAction}>
                  <SymbolView
                    name={{ ios: 'xmark.circle.fill', android: 'close', web: 'close' }}
                    size={20}
                    weight="semibold"
                    tintColor={Palette.grey350}
                  />
                </Pressable>
              ) : (
                <View style={[styles.fieldTrailingAction, styles.fieldTrailingPlaceholder, styles.pointerEventsNone]} />
              )}
            </View>
          </View>

          <View style={[styles.section, styles.sectionCountry]}>
            <FieldLabel label={copy.sections.nationality} />
            <Pressable
              style={styles.selectFrame}
              onPress={() => setCountryPickerOpen(true)}>
              <CustomText
                style={[
                  styles.selectText,
                  form.nationality ? styles.selectTextValue : styles.selectTextPlaceholder,
                ]}>
                {currentCountryLabel || form.nationality || copy.placeholders.nationality}
              </CustomText>
              <View style={[styles.fieldTrailingAction, styles.pointerEventsNone]}>
                <DropdownArrowIcon />
              </View>
            </Pressable>
          </View>

          <View style={[styles.section, styles.sectionLanguage]}>
            <FieldLabel label={copy.sections.languages} />
            <View style={styles.chipWrap}>
              {sortedLanguageCodes.map((code) => {
                const option = normalizedLanguageOptions.find((item) => item.code === code);
                if (!option) return null;
                return (
                  <RemovableLanguageChip
                    key={code}
                    label={getOptionLabel(option, language)}
                    onRemove={() => handleRemoveLanguage(code)}
                  />
                );
              })}
              <Pressable
                style={styles.languageAddButton}
                onPress={() => setLanguagePickerOpen(true)}>
                <LanguageAddIcon />
              </Pressable>
            </View>
          </View>

          <View style={[styles.section, styles.sectionKorean]}>
            <FieldLabel label={copy.sections.koreanLevel} />
            <View style={styles.levelRow}>
              {options.koreanLevels.map((option) => {
                const selected = form.koreanLevel === option.code;
                return (
                  <ChoiceChip
                    key={option.code}
                    label={getOptionLabel(option, language)}
                    selected={selected}
                    onPress={() => handleUpdateField('koreanLevel', option.code)}
                  />
                );
              })}
            </View>
          </View>

          <View style={[styles.section, styles.sectionBio]}>
            <FieldLabel label={copy.sections.bio} />
            <View style={[styles.bioFrame, isBioFocused && styles.bioFrameFocused]}>
              <TextInput
                value={form.bio}
                onChangeText={(text) => handleUpdateField('bio', text.slice(0, 500))}
                placeholder={copy.placeholders.bio}
                placeholderTextColor="#8B95A1"
                cursorColor="#4FAE98"
                selectionColor="#4FAE98"
                textAlignVertical="center"
                style={styles.bioInput}
                onFocus={() => setIsBioFocused(true)}
                onBlur={() => setIsBioFocused(false)}
                maxLength={500}
                autoCorrect={false}
                returnKeyType="done"
                numberOfLines={1}
              />
              <View style={[styles.bioIconSpacer, styles.pointerEventsNone]} />
            </View>
            <View style={styles.counterRow}>
              <CustomText style={styles.counterValue}>{form.bio.length}</CustomText>
              <CustomText style={styles.counterSuffix}> / 500</CustomText>
            </View>
          </View>

          <View style={styles.sectionDivider} />

          <View style={[styles.section, styles.sectionTravel]}>
            <SectionHeading
              title={copy.sections.travelStyles.title}
              subtitle={copy.sections.travelStyles.subtitle}
            />
            <View style={styles.travelStyleRows}>
              {travelStyleRows.map((row, rowIndex) => (
                <View key={`travel-row-${rowIndex}`} style={styles.travelStyleRow}>
                  {row.map((option) => (
                    <ChoiceChip
                      key={option.code}
                      label={getOptionLabel(option, language)}
                      selected={form.travelStyles.includes(option.code)}
                      onPress={() => handleToggleTravelStyle(option.code)}
                      variant="travelStyle"
                    />
                  ))}
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.section, styles.sectionPublicSns]}>
            <SectionHeading
              title={copy.sections.socialAccounts.title}
              subtitle={copy.sections.socialAccounts.subtitle}
            />
            {sortedSocialLinks.length === 0 ? (
              <Pressable style={styles.addSnsButton} onPress={() => setSnsEditorOpen(true)}>
                <CustomText style={styles.addSnsButtonText}>{copy.buttons.addSocialAccount}</CustomText>
              </Pressable>
            ) : (
              <View style={styles.snsList}>
                {sortedSocialLinks.map((link) => {
                  const option = options.socialPlatforms.find((item) => item.code === link.type);
                  return (
                    <SocialLinkRow
                      key={link.type}
                      code={link.type}
                      label={option ? getOptionLabel(option, language) : link.type}
                      value={link.displayValue}
                      onPress={() => setSnsEditorOpen(true)}
                    />
                  );
                })}
                {sortedSocialLinks.length < MAX_SNS_LINKS ? (
                  <Pressable style={styles.smallAddSnsButton} onPress={() => setSnsEditorOpen(true)}>
                    <CustomText style={styles.smallAddSnsButtonText}>
                      {copy.buttons.addSocialAccount}
                    </CustomText>
                  </Pressable>
                ) : null}
              </View>
            )}
          </View>

          <View style={[styles.section, styles.sectionContact]}>
            <SectionHeading title={copy.sections.contactSettings} />
            <View style={styles.toggleGroup}>
              <ToggleRow
                label={copy.toggles.profilePublic}
                value={form.profilePublic}
                onValueChange={(value) => handleUpdateField('profilePublic', value)}
              />
              <ToggleRow
                label={copy.toggles.snsPublic}
                value={form.snsPublic}
                onValueChange={(value) => handleUpdateField('snsPublic', value)}
              />
              <ToggleRow
                label={copy.toggles.allowsMessages}
                value={form.allowsMessages}
                onValueChange={(value) => handleUpdateField('allowsMessages', value)}
              />
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom - 40, 0) }]}>
          <PrimaryButton
            title={copy.buttons.done}
            onPress={handleSave}
            disabled={!canSave || isSaving}
          />
        </View>
      </KeyboardAvoidingView>

      <SelectionModal
        visible={countryPickerOpen}
        title={copy.modals.country.title}
        subtitle={copy.modals.country.subtitle}
        language={language}
        options={options.countries}
        selectedCodes={form.nationality ? [form.nationality] : []}
        multiSelect={false}
        presentation="list"
        confirmLabel={copy.modals.country.confirm}
        searchPlaceholder={copy.modals.country.searchPlaceholder}
        optionLabelFormatter={(option) =>
          getCountryDisplayName(option.code, options.countries, language)
        }
        onCancel={() => setCountryPickerOpen(false)}
        onConfirm={(selectedCodes) => {
          setForm((prev) => ({ ...prev, nationality: selectedCodes[0] ?? '' }));
          setCountryPickerOpen(false);
        }}
      />

      <SelectionModal
        visible={languagePickerOpen}
        title={copy.modals.language.title}
        subtitle={copy.modals.language.subtitle}
        language={language}
        options={normalizedLanguageOptions}
        selectedCodes={form.availableLanguages}
        multiSelect
        presentation="list"
        confirmLabel={copy.modals.language.confirm}
        searchPlaceholder={copy.modals.language.searchPlaceholder}
        onCancel={() => setLanguagePickerOpen(false)}
        onConfirm={(selectedCodes) => {
          const normalizedSelectedCodes = selectedCodes.map(normalizeLanguageCode).filter(Boolean);
          setForm((prev) => ({
            ...prev,
            availableLanguages: sortLanguageCodesByOptionOrder(
              normalizedSelectedCodes,
              normalizedLanguageOptions,
            ),
          }));
          setLanguagePickerOpen(false);
        }}
      />

      <SnsEditorOverlay
        visible={snsEditorOpen}
        language={language}
        options={options.socialPlatforms}
        value={form.socialLinks}
        onCancel={() => setSnsEditorOpen(false)}
        onSave={(nextLinks) => {
          setForm((prev) => ({ ...prev, socialLinks: nextLinks }));
          setSnsEditorOpen(false);
        }}
      />

      <AvatarActionSheet
        visible={avatarActionSheetOpen}
        hasExistingImage={hasProfileImage}
        onCancel={() => setAvatarActionSheetOpen(false)}
        onSelectPhoto={handleSelectProfileImageFromSheet}
        onDeletePhoto={handleDeleteProfileImage}
      />

      <ConfirmationModal
        visible={unsavedChangesModalOpen}
        message={copy.modals.unsavedChanges.message}
        cancelLabel={copy.modals.unsavedChanges.cancel}
        confirmLabel={copy.modals.unsavedChanges.confirm}
        onCancel={cancelLeaveScreen}
        onConfirm={confirmLeaveScreen}
      />
    </SafeAreaView>
  );
}

function buildInitialForm(
  profileResponse: BuddyProfileResponse,
  options: ProfileOptionsResponse,
  defaultTravelStyles: string[],
  fallbackProfileImageUrl: string | null,
): BuddyProfileFormState {
  const profile = profileResponse.profile;
  if (!profile) {
    return {
      ...EMPTY_FORM,
      travelStyles: sortCodesByOptionOrder(defaultTravelStyles, options.travelStyles),
    };
  }

  const initialTravelStyles =
    !profileResponse.exists && defaultTravelStyles.length > 0
      ? defaultTravelStyles
      : profile.travelStyles;

  return {
    profileImageUrl: profile.profileImageUrl ?? fallbackProfileImageUrl,
    nickname: profile.nickname ?? '',
    nationality: resolveCountryCode(profile.nationalityCode ?? profile.nationality, options.countries),
    availableLanguages: sortLanguageCodesByOptionOrder(
      profile.availableLanguages.map(normalizeLanguageCode),
      options.languages,
    ),
    koreanLevel: resolveProfileOptionCode(profile.koreanLevel, options.koreanLevels),
    bio: profile.bio ?? '',
    // A first-time buddy profile should inherit the user's onboarding choices.
    travelStyles: sortCodesByOptionOrder(initialTravelStyles, options.travelStyles),
    socialLinks: profile.socialLinks
      .map((link) => ({
        type: resolveProfileOptionCode(link.type, options.socialPlatforms),
        displayValue: link.displayValue ?? '',
        url: link.url ?? normalizeSocialLinkUrl(link.type, link.displayValue ?? ''),
      }))
      .filter((link) => !!link.type && link.displayValue.trim().length > 0),
    profilePublic: profile.profilePublic,
    snsPublic: profile.snsPublic,
    allowsMessages: profile.allowsMessages,
  };
}

function resolveProfileOptionCode(value: string, options: ProfileOptionItem[]) {
  return options.find(
    (option) =>
      option.code === value ||
      option.labelKo === value ||
      option.labelEn === value,
  )?.code ?? value;
}

function resolveCountryCode(value: string, options: ProfileOptionItem[]) {
  return resolveProfileOptionCode(value, options);
}

function areBuddyProfileFormsEqual(
  left: BuddyProfileFormState,
  right: BuddyProfileFormState,
) {
  return (
    left.profileImageUrl === right.profileImageUrl &&
    left.nickname === right.nickname &&
    left.nationality === right.nationality &&
    arraysEqual(left.availableLanguages, right.availableLanguages) &&
    left.koreanLevel === right.koreanLevel &&
    left.bio === right.bio &&
    arraysEqual(left.travelStyles, right.travelStyles) &&
    socialLinksEqual(left.socialLinks, right.socialLinks) &&
    left.profilePublic === right.profilePublic &&
    left.snsPublic === right.snsPublic &&
    left.allowsMessages === right.allowsMessages
  );
}

function arraysEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function socialLinksEqual(
  left: BuddyProfileSocialLinkInput[],
  right: BuddyProfileSocialLinkInput[],
) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((link, index) => {
    const other = right[index];
    return (
      link.type === other.type &&
      link.displayValue === other.displayValue &&
      (link.url ?? null) === (other.url ?? null)
    );
  });
}

function sortCodesByOptionOrder(
  values: string[],
  options: ProfileOptionItem[],
  aliases: Record<string, string> = {},
) {
  const order = new Map(options.map((option, index) => [option.code, index] as const));
  const normalized = values
    .map((value) => aliases[value] ?? value)
    .filter((value) => order.has(value));
  const unique = Array.from(new Set(normalized));
  return unique.sort((left, right) => {
    const leftOrder = order.get(left) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = order.get(right) ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder;
  });
}

function sortLanguageCodesByOptionOrder(values: string[], options: ProfileOptionItem[]) {
  const order = new Map(
    options.map((option, index) => [normalizeLanguageCode(option.code), index] as const),
  );
  const normalized = values
    .map(normalizeLanguageCode)
    .filter((value): value is string => typeof value === 'string' && value.length > 0);
  const unique = Array.from(new Set(normalized));

  return unique.sort((left, right) => {
    const leftOrder = order.get(left);
    const rightOrder = order.get(right);

    if (leftOrder == null && rightOrder == null) {
      return left.localeCompare(right);
    }

    if (leftOrder == null) {
      return 1;
    }

    if (rightOrder == null) {
      return -1;
    }

    return leftOrder - rightOrder;
  });
}

function sortSocialLinks(values: BuddyProfileSocialLinkInput[], options: ProfileOptionItem[]) {
  const order = new Map(options.map((option, index) => [option.code, index] as const));
  const unique = values.filter(
    (link, index, array) => array.findIndex((item) => item.type === link.type) === index,
  );
  const normalized = unique.filter((link) => order.has(link.type));
  return normalized.sort((left, right) => {
    const leftOrder = order.get(left.type) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = order.get(right.type) ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder;
  });
}

function chunkItems<T>(items: T[], size: number) {
  if (size <= 0) return [];

  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function isFormComplete(form: BuddyProfileFormState) {
  return (
    form.nickname.trim().length > 0 &&
    form.nationality.trim().length > 0 &&
    form.availableLanguages.length > 0 &&
    form.koreanLevel.trim().length > 0 &&
    form.bio.trim().length > 0 &&
    form.travelStyles.length >= 1 &&
    form.travelStyles.length <= MAX_TRAVEL_STYLES
  );
}

function getOptionLabel(option: ProfileOptionItem | undefined, language: string) {
  if (!option) return '';
  return language === 'EN' ? option.labelEn : option.labelKo;
}

function extractErrorMessage(error: unknown, fallbackMessage = 'An unknown error occurred.') {
  if (isAxiosError(error)) {
    const responseData = error.response?.data;
    if (responseData && typeof responseData === 'object') {
      const message = (responseData as { message?: unknown }).message;
      if (typeof message === 'string' && message.trim().length > 0) {
        return message;
      }
    }

    if (error.response?.status === 400) {
      return 'Invalid profile data. Please check the selected values and try again.';
    }
  }

  if (error instanceof Error) return error.message;
  return fallbackMessage;
}

async function createProfileImageUploadFile(asset: ImagePicker.ImagePickerAsset) {
  if (Platform.OS === 'web') {
    const browserFile = (asset as ImagePicker.ImagePickerAsset & { file?: Blob }).file;
    if (browserFile) {
      return {
        body: browserFile,
        size: browserFile.size,
      };
    }

    const response = await fetch(asset.uri);
    const blob = await response.blob();
    return {
      body: blob,
      size: blob.size,
    };
  }

  const localFile = new ExpoFile(asset.uri);
  return {
    body: localFile,
    size: localFile.size,
  };
}

function normalizeUploadHeaders(
  headers: Record<string, string | undefined | null> | string | null | undefined,
  contentType: ProfileImageContentType,
) {
  const parsedHeaders = parseUploadHeaders(headers);
  const normalizedHeaders = Object.fromEntries(
    Object.entries(parsedHeaders).filter(([, value]) => typeof value === 'string' && value.length > 0),
  ) as Record<string, string>;

  if (!hasHeader(normalizedHeaders, 'content-type')) {
    normalizedHeaders['Content-Type'] = contentType;
  }

  return normalizedHeaders;
}

function parseUploadHeaders(
  headers: Record<string, string | undefined | null> | string | null | undefined,
) {
  if (!headers) {
    return {};
  }

  if (typeof headers !== 'string') {
    return headers;
  }

  try {
    const parsed = JSON.parse(headers);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, string | undefined | null>;
    }
  } catch {
    return {};
  }

  return {};
}

function hasHeader(headers: Record<string, string>, headerName: string) {
  const normalizedHeaderName = headerName.toLowerCase();
  return Object.keys(headers).some((key) => key.toLowerCase() === normalizedHeaderName);
}

function normalizeProfileImageMimeType(
  mimeType?: string | null,
  fileName?: string | null,
  uri?: string | null,
): ProfileImageContentType | null {
  const normalizedMimeType = mimeType?.toLowerCase().trim();
  if (normalizedMimeType === 'image/jpg') {
    return 'image/jpeg';
  }

  if (normalizedMimeType) {
    const normalizedContentType = normalizedMimeType as ProfileImageContentType;
    if (ALLOWED_PROFILE_IMAGE_MIME_TYPES.has(normalizedContentType)) {
      return normalizedContentType;
    }
  }

  const candidate = fileName ?? uri ?? '';
  const extension = candidate.split('?')[0].split('.').pop()?.toLowerCase() ?? '';

  if (extension === 'jpg' || extension === 'jpeg') {
    return 'image/jpeg';
  }

  if (extension === 'png') {
    return 'image/png';
  }

  if (extension === 'webp') {
    return 'image/webp';
  }

  return null;
}

function firstNonEmptyString(...values: (string | null | undefined)[]) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return null;
}

function normalizeSocialLinks(values: BuddyProfileSocialLinkInput[]) {
  const normalized: BuddyProfileSocialLinkInput[] = [];

  for (const link of values) {
    const type = link.type.trim();
    const displayValue = link.displayValue.trim();
    if (!type || !displayValue) {
      continue;
    }

    const existingUrl = link.url?.trim();
    const url =
      existingUrl && existingUrl.length > 0
        ? existingUrl
        : normalizeSocialLinkUrl(type, displayValue);

    normalized.push({
      type,
      displayValue,
      url: url ?? null,
    });
  }

  return normalized;
}

function toSocialLinkRequests(
  values: BuddyProfileSocialLinkInput[],
): BuddyProfileSocialLinkRequest[] {
  return values
    .map((link) => ({
      type: link.type.trim(),
      value: link.displayValue.trim(),
    }))
    .filter((link) => link.type.length > 0 && link.value.length > 0);
}

function normalizeSocialLinkUrl(type: string, displayValue: string) {
  const normalizedValue = displayValue.trim();
  if (!normalizedValue) {
    return null;
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue;
  }

  const handle = normalizedValue.replace(/^@+/, '').trim();
  if (!handle) {
    return null;
  }

  const encodedHandle = encodeURIComponent(handle);
  switch (type) {
    case 'INSTAGRAM':
      return `https://instagram.com/${encodedHandle}`;
    case 'TIKTOK':
      return `https://tiktok.com/@${encodedHandle}`;
    case 'WECHAT':
      return `https://wechat.com/${encodedHandle}`;
    case 'XIAOHONGSHU':
      return `https://xiaohongshu.com/${encodedHandle}`;
    case 'LINE':
      return `https://line.me/ti/p/${encodedHandle}`;
    case 'KAKAOTALK':
      return `https://open.kakao.com/o/${encodedHandle}`;
    default:
      return `https://${type.toLowerCase()}.com/${encodedHandle}`;
  }
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeading}>
      <CustomText style={styles.sectionTitle}>{title}</CustomText>
      {subtitle ? <CustomText style={styles.sectionSubtitle}>{subtitle}</CustomText> : null}
    </View>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <CustomText style={styles.fieldLabel}>{label}</CustomText>;
}

function AvatarActionSheet({
  visible,
  hasExistingImage,
  onCancel,
  onSelectPhoto,
  onDeletePhoto,
}: {
  visible: boolean;
  hasExistingImage: boolean;
  onCancel: () => void;
  onSelectPhoto: () => void;
  onDeletePhoto: () => void;
}) {
  const t = useTranslation();
  const copy = t.profileEdit.modals.avatar;
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <Pressable style={styles.avatarSheetOverlay} onPress={onCancel}>
        <Pressable
          style={[styles.avatarSheet, { paddingBottom: Math.max(insets.bottom - 10, 0) }]}
          onPress={() => {}}>
          <View style={styles.avatarSheetHandleArea}>
            <View style={styles.avatarSheetHandle} />
          </View>

          <View style={styles.avatarSheetRows}>
            <Pressable
              style={({ pressed }) => [styles.avatarSheetRow, pressed && styles.pressed]}
              onPress={onSelectPhoto}>
              <CustomText style={styles.avatarSheetRowText}>{copy.selectPhoto}</CustomText>
            </Pressable>

            {hasExistingImage ? (
              <Pressable
                style={({ pressed }) => [styles.avatarSheetRow, pressed && styles.pressed]}
                onPress={onDeletePhoto}>
                <CustomText style={styles.avatarSheetDeleteText}>{copy.deletePhoto}</CustomText>
              </Pressable>
            ) : null}

            <Pressable
              style={({ pressed }) => [
                styles.avatarSheetRow,
                styles.avatarSheetCancelRow,
                pressed && styles.pressed,
              ]} 
              onPress={onCancel}>
              <CustomText style={styles.avatarSheetCancelText}>{copy.cancel}</CustomText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ProfileAvatarButton({
  source,
  loading,
  onPressAdd,
}: {
  source: ImageSource | null;
  loading?: boolean;
  onPressAdd: () => void;
}) {
  return (
    <View style={[styles.avatarButton, loading && styles.avatarButtonDisabled]}>
      <View style={styles.avatarFrame}>
        {source ? (
          <Image source={source} style={styles.avatarImage} contentFit="cover" />
        ) : (
          <AvatarPlaceholderIcon />
        )}
        {loading && !source ? (
          <View style={styles.avatarLoadingOverlay}>
            <ActivityIndicator color={Palette.primary} />
          </View>
        ) : null}
      </View>
      <Pressable
        hitSlop={8}
        style={styles.avatarAddBadge}
        onPress={onPressAdd}
        disabled={loading}>
        <AvatarAddBadgeIcon />
      </Pressable>
    </View>
  );
}

function AvatarPlaceholderIcon() {
  return (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
      <Path
        d="M16.0002 13.6C18.6512 13.6 20.8002 11.451 20.8002 8.79999C20.8002 6.14903 18.6512 4 16.0002 4C13.3492 4 11.2002 6.14903 11.2002 8.79999C11.2002 11.451 13.3492 13.6 16.0002 13.6Z"
        fill="#8B95A1"
        stroke="#8B95A1"
        strokeWidth={1.8}
      />
      <Path
        d="M25.6004 22.6002C25.6004 25.5822 25.6004 28.0002 16.0004 28.0002C6.40039 28.0002 6.40039 25.5822 6.40039 22.6002C6.40039 19.6182 10.6988 17.2002 16.0004 17.2002C21.302 17.2002 25.6004 19.6182 25.6004 22.6002Z"
        fill="#8B95A1"
        stroke="#8B95A1"
        strokeWidth={1.8}
      />
    </Svg>
  );
}

function AvatarAddBadgeIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Rect x={0.5} y={0.5} width={23} height={23} rx={11.5} fill="#8B95A1" />
      <Rect x={0.5} y={0.5} width={23} height={23} rx={11.5} stroke="#FFFFFF" />
      <Path
        d="M11.2857 12.7143H7.71429C7.5119 12.7143 7.34226 12.6458 7.20536 12.5089C7.06845 12.372 7 12.2024 7 12C7 11.7976 7.06845 11.628 7.20536 11.4911C7.34226 11.3542 7.5119 11.2857 7.71429 11.2857H11.2857V7.71429C11.2857 7.5119 11.3542 7.34226 11.4911 7.20536C11.628 7.06845 11.7976 7 12 7C12.2024 7 12.372 7.06845 12.5089 7.20536C12.6458 7.34226 12.7143 7.5119 12.7143 7.71429V11.2857H16.2857C16.4881 11.2857 16.6577 11.3542 16.7946 11.4911C16.9315 11.628 17 11.7976 17 12C17 12.2024 16.9315 12.372 16.7946 12.5089C16.6577 12.6458 16.4881 12.7143 16.2857 12.7143H12.7143V16.2857C12.7143 16.4881 12.6458 16.6577 12.5089 16.7946C12.372 16.9315 12.2024 17 12 17C11.7976 17 11.628 16.9315 11.4911 16.7946C11.3542 16.6577 11.2857 16.4881 11.2857 16.2857V12.7143Z"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function RemovableLanguageChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <View style={styles.languageChip}>
      <CustomText style={styles.languageChipText}>{label}</CustomText>
      <Pressable hitSlop={8} onPress={onRemove} style={styles.languageChipRemoveButton}>
        <LanguageRemoveIcon />
      </Pressable>
    </View>
  );
}

function DropdownArrowIcon() {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12.0015 13.7312L16.4952 9.17785C16.6083 9.06327 16.7475 9.00498 16.9127 9.00299C17.078 9.001 17.2172 9.05729 17.3304 9.17186C17.4435 9.28644 17.5 9.42746 17.5 9.59492C17.5 9.76237 17.4435 9.90344 17.3304 10.0181L12.704 14.7118C12.602 14.8151 12.4917 14.8889 12.373 14.9333C12.2544 14.9778 12.1305 15 12.0015 15C11.8725 15 11.7486 14.9778 11.63 14.9333C11.5113 14.8889 11.401 14.8151 11.299 14.7118L6.67262 10.0241C6.55954 9.90953 6.50202 9.76752 6.50005 9.59806C6.49808 9.42851 6.55364 9.28644 6.66671 9.17186C6.77979 9.05729 6.91896 9 7.08423 9C7.24949 9 7.38872 9.05729 7.50189 9.17186L12.0015 13.7312Z"
        fill="#6B7684"
      />
    </Svg>
  );
}

function LanguageRemoveIcon() {
  return (
    <Svg width={8} height={8} viewBox="0 0 8 8" fill="none">
      <Path
        d="M3.66426 4.42958L0.940094 7.13458C0.818149 7.25542 0.692038 7.31445 0.56176 7.31167C0.431343 7.30903 0.305788 7.24736 0.185094 7.12667C0.0643993 7.00597 0.00405202 6.8791 0.00405202 6.74604C0.00405202 6.61299 0.0643993 6.48556 0.185094 6.36375L2.88218 3.6475L0.177177 0.944167C0.0563436 0.822222 -0.00268415 0.694723 9.3633e-05 0.561667C0.00273252 0.42875 0.0643993 0.301945 0.185094 0.18125C0.305788 0.0604169 0.432663 0 0.565719 0C0.698774 0 0.826205 0.0604169 0.94801 0.18125L3.66426 2.88625L6.36759 0.18125C6.48954 0.0604169 6.61565 0 6.74593 0C6.87634 0 7.0019 0.0604169 7.12259 0.18125C7.23801 0.296528 7.29572 0.422014 7.29572 0.557709C7.29572 0.693403 7.23801 0.822222 7.12259 0.944167L4.42551 3.6475L7.13051 6.37167C7.25134 6.49361 7.31176 6.61972 7.31176 6.75C7.31176 6.88042 7.25134 7.00597 7.13051 7.12667C7.01523 7.24208 6.88975 7.29979 6.75405 7.29979C6.61836 7.29979 6.48954 7.24208 6.36759 7.12667L3.66426 4.42958Z"
        fill="#4FAE98"
      />
    </Svg>
  );
}

function LanguageAddIcon() {
  return (
    <Svg width={36} height={36} viewBox="0 0 36 36" fill="none">
      <Rect width={36} height={36} rx={18} fill="#F6F9FB" />
      <Path
        d="M17.2909 18.7091H12.7091C12.5082 18.7091 12.3398 18.6416 12.204 18.5067C12.068 18.3718 12 18.2047 12 18.0055C12 17.806 12.068 17.6371 12.204 17.4987C12.3398 17.3602 12.5082 17.2909 12.7091 17.2909H17.2909V12.7091C17.2909 12.5082 17.3584 12.3398 17.4933 12.204C17.6282 12.068 17.7953 12 17.9945 12C18.194 12 18.3629 12.068 18.5013 12.204C18.6398 12.3398 18.7091 12.5082 18.7091 12.7091V17.2909H23.2909C23.4918 17.2909 23.6602 17.3584 23.796 17.4933C23.932 17.6282 24 17.7953 24 17.9945C24 18.194 23.932 18.3629 23.796 18.5013C23.6602 18.6398 23.4918 18.7091 23.2909 18.7091H18.7091V23.2909C18.7091 23.4918 18.6416 23.6602 18.5067 23.796C18.3718 23.932 18.2047 24 18.0055 24C17.806 24 17.6371 23.932 17.4987 23.796C17.3602 23.6602 17.2909 23.4918 17.2909 23.2909V18.7091Z"
        fill="#8B95A1"
      />
    </Svg>
  );
}

function ChoiceChip({
  label,
  selected,
  onPress,
  variant = 'default',
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  variant?: 'default' | 'travelStyle';
}) {
  const isTravelStyle = variant === 'travelStyle';
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choiceChip,
        isTravelStyle ? styles.choiceChipTravel : styles.choiceChipDefault,
        isTravelStyle
          ? selected
            ? styles.choiceChipTravelSelected
            : styles.choiceChipTravelUnselected
          : selected
            ? styles.choiceChipSelected
            : styles.choiceChipUnselected,
      ]}>
      <CustomText
        style={[
          styles.choiceChipText,
          isTravelStyle
            ? selected
              ? styles.choiceChipTextTravelSelected
              : styles.choiceChipTextTravelUnselected
            : selected
              ? styles.choiceChipTextSelected
              : styles.choiceChipTextUnselected,
        ]}>
        {label}
      </CustomText>
    </Pressable>
  );
}

function ToggleRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <CustomText style={styles.toggleLabel}>{label}</CustomText>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: value }}
        hitSlop={8}
        onPress={() => onValueChange(!value)}
        style={({ pressed }) => [
          styles.toggleTrack,
          value ? styles.toggleTrackOn : styles.toggleTrackOff,
          pressed && styles.pressed,
        ]}>
        <View style={styles.toggleThumb} />
      </Pressable>
    </View>
  );
}

function SocialLinkRow({
  code,
  label,
  value,
  onPress,
}: {
  code: string;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.socialLinkRow} onPress={onPress}>
      <View style={styles.socialLinkLeft}>
        <SocialPlatformIcon code={code} size={44} />
        <View style={styles.socialLinkTextGroup}>
          <CustomText style={styles.socialLinkLabel}>{label}</CustomText>
          <CustomText style={styles.socialLinkValue}>{value}</CustomText>
        </View>
      </View>
      <SocialLinkChevronIcon />
    </Pressable>
  );
}

function SocialLinkChevronIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 20 20" fill="none">
      <Path
        d="M7.5 4.16667L12.5 10L7.5 15.8333"
        stroke={Palette.grey400}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function SocialPlatformIcon({ code, size = 40 }: { code: string; size?: number }) {
  const uri = SOCIAL_PLATFORM_ICON_URIS[code as keyof typeof SOCIAL_PLATFORM_ICON_URIS];

  if (uri) {
    return <SvgUri uri={uri} width={size} height={size} />;
  }

  switch (code) {
    default:
      return (
        <View style={[styles.fallbackIcon, { width: size, height: size, borderRadius: size * 0.2 }]}>
          <CustomText style={styles.fallbackGlyph}>{code.slice(0, 2)}</CustomText>
        </View>
      );
  }
}

function SelectionModal({
  visible,
  title,
  subtitle,
  language,
  options,
  selectedCodes,
  multiSelect,
  presentation = 'grid',
  confirmLabel,
  searchPlaceholder,
  optionLabelFormatter,
  onCancel,
  onConfirm,
}: SelectionModalProps) {
  const t = useTranslation();
  const copy = t.profileEdit.buttons;
  const modalCopy = t.profileEdit.modals;
  const [draft, setDraft] = useState<string[]>(selectedCodes);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [sheetTranslateY] = useState(() => new Animated.Value(windowHeight));
  const [overlayOpacity] = useState(() => new Animated.Value(0));
  const [prevVisible, setPrevVisible] = useState(visible);
  const [isClosing, setIsClosing] = useState(false);
  const isListPresentation = presentation === 'list';
  const renderOptionLabel = useCallback(
    (option: ProfileOptionItem) => optionLabelFormatter
      ? optionLabelFormatter(option)
      : getOptionLabel(option, language),
    [optionLabelFormatter, language],
  );

  const [draftSource, setDraftSource] = useState({ selectedCodes, visible });
  if (draftSource.selectedCodes !== selectedCodes || draftSource.visible !== visible) {
    setDraftSource({ selectedCodes, visible });
    if (visible) {
      setDraft(selectedCodes);
      setSearchQuery('');
      setIsSearchFocused(false);
    }
  }

  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (!visible) setIsClosing(true);
  }

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: SHEET_ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: shouldUseNativeDriver,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: SHEET_ANIMATION_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: shouldUseNativeDriver,
        }),
      ]).start();
      return;
    }

    if (!isClosing) return;

    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: windowHeight,
        duration: SHEET_ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: shouldUseNativeDriver,
      }),
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: SHEET_ANIMATION_DURATION,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: shouldUseNativeDriver,
      }),
    ]).start(({ finished }) => {
      if (finished) setIsClosing(false);
    });
  }, [isClosing, overlayOpacity, sheetTranslateY, visible, windowHeight]);

  const filteredOptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!isListPresentation || normalizedQuery.length === 0) {
      return options;
    }

    return options.filter((option) => {
      const labels = [
        option.code,
        option.labelKo,
        option.labelEn,
        renderOptionLabel(option),
      ]
        .filter((value): value is string => typeof value === 'string' && value.length > 0)
        .map((value) => value.toLowerCase());

      return labels.some((value) => value.includes(normalizedQuery));
    });
  }, [isListPresentation, options, renderOptionLabel, searchQuery]);

  const toggleOption = (code: string) => {
    setDraft((prev) => {
      if (multiSelect) {
        return prev.includes(code) ? prev.filter((item) => item !== code) : [...prev, code];
      }
      return prev[0] === code ? [] : [code];
    });
  };

  if (!visible && !isClosing) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onCancel}>
      <View style={styles.sheetOverlay}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.sheetOverlayBackground, { opacity: overlayOpacity }]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />

        <Animated.View
          style={[
            styles.sheet,
            {
              maxHeight: Math.max(320, windowHeight * 0.82),
              transform: [{ translateY: sheetTranslateY }],
            },
          ]}>
          <View style={styles.sheetHandleArea}>
            <View style={styles.sheetHandle} />
          </View>

          <View style={styles.sheetHeader}>
            <CustomText style={styles.sheetTitle}>{title}</CustomText>
            {subtitle ? <CustomText style={styles.sheetSubtitle}>{subtitle}</CustomText> : null}
          </View>

          {isListPresentation ? (
            <View
              style={[
                styles.sheetSearchFrame,
                isSearchFocused && styles.sheetSearchFrameFocused,
              ]}>
              <SymbolView
                name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }}
                size={18}
                weight="regular"
                tintColor={Palette.grey400}
              />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={searchPlaceholder}
                placeholderTextColor={Palette.grey400}
                style={styles.sheetSearchInput}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {searchQuery.length > 0 ? (
                <Pressable
                  hitSlop={8}
                  onPress={() => setSearchQuery('')}
                  style={styles.sheetSearchClearButton}>
                  <SymbolView
                    name={{ ios: 'xmark.circle.fill', android: 'close', web: 'close' }}
                    size={18}
                    weight="semibold"
                    tintColor={Palette.grey350}
                  />
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <ScrollView
            contentContainerStyle={styles.sheetBody}
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}>
            {isListPresentation ? (
              filteredOptions.length > 0 ? (
                <View style={styles.optionList}>
                  {filteredOptions.map((option) => {
                    const selected = draft.includes(option.code);
                    return (
                      <Pressable
                        key={option.code}
                        {...WEB_IMMEDIATE_PRESS_PROPS}
                        pressRetentionOffset={12}
                        onPress={() => toggleOption(option.code)}
                        style={({ pressed }) => [
                          styles.optionRow,
                          WEB_TAP_TARGET_STYLE,
                          selected && styles.optionRowSelected,
                          pressed && styles.pressed,
                        ]}>
                        <CustomText
                          style={[
                            styles.optionRowText,
                            selected ? styles.optionRowTextSelected : styles.optionRowTextUnselected,
                          ]}>
                          {renderOptionLabel(option)}
                        </CustomText>
                        <View
                          style={[
                            styles.optionRowToggle,
                            selected
                              ? styles.optionRowToggleSelected
                              : styles.optionRowToggleUnselected,
                          ]}>
                          {selected ? (
                            <SymbolView
                              name={{ ios: 'checkmark', android: 'check', web: 'check' }}
                              size={12}
                              weight="semibold"
                              tintColor={Palette.white}
                            />
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.optionEmptyState}>
                  <CustomText style={styles.optionEmptyText}>{modalCopy.searchNoResults}</CustomText>
                </View>
              )
            ) : (
              <View style={styles.optionGrid}>
                {filteredOptions.map((option) => {
                  const selected = draft.includes(option.code);
                  return (
                    <ChoiceChip
                      key={option.code}
                      label={renderOptionLabel(option)}
                      selected={selected}
                      onPress={() => toggleOption(option.code)}
                    />
                  );
                })}
              </View>
            )}
          </ScrollView>

          <View style={[styles.sheetFooter, { paddingBottom: insets.bottom + 12 }]}>
            <Pressable style={styles.sheetCancelButton} onPress={onCancel}>
              <CustomText style={styles.sheetCancelText}>{copy.cancel}</CustomText>
            </Pressable>
            <Pressable
              style={[
                styles.sheetConfirmButton,
                draft.length === 0 && styles.sheetConfirmButtonDisabled,
              ]}
              disabled={draft.length === 0}
              onPress={() => onConfirm(sortCodesByOptionOrder(draft, options))}>
              <CustomText
                style={[
                  styles.sheetConfirmText,
                  draft.length === 0 && styles.sheetConfirmTextDisabled,
                ]}>
                {confirmLabel}
              </CustomText>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function SnsEditorOverlay({
  visible,
  language,
  options,
  value,
  onCancel,
  onSave,
}: SnsEditorOverlayProps) {
  const t = useTranslation();
  const copy = t.profileEdit.modals.sns;
  const insets = useSafeAreaInsets();
  const [draftLinks, setDraftLinks] = useState<BuddyProfileSocialLinkInput[]>(
    () => sortSocialLinks(value, options),
  );
  const [focusedSnsCode, setFocusedSnsCode] = useState<string | null>(null);
  const { width: windowWidth } = useWindowDimensions();
  const platformCardWidth = Math.max(0, Math.floor((windowWidth - 16 * 2 - 8) / 2));

  const [draftSource, setDraftSource] = useState({ options, value, visible });
  if (draftSource.options !== options || draftSource.value !== value || draftSource.visible !== visible) {
    setDraftSource({ options, value, visible });
    if (visible) {
      setDraftLinks(sortSocialLinks(value, options));
      setFocusedSnsCode(null);
    }
  }

  if (!visible) return null;

  const selectedCodes = draftLinks.map((item) => item.type);
  const saveDisabled =
    draftLinks.length === 0 || draftLinks.some((item) => item.displayValue.trim().length === 0);

  const togglePlatform = (code: string) => {
    setDraftLinks((prev) => {
      const exists = prev.find((item) => item.type === code);
      if (exists) {
        return sortSocialLinks(
          prev.filter((item) => item.type !== code),
          options,
        );
      }
      if (prev.length >= MAX_SNS_LINKS) return prev;
      return sortSocialLinks(
        [...prev, { type: code, displayValue: '', url: null }],
        options,
      );
    });
  };

  const updateValue = (code: string, displayValue: string) => {
    setDraftLinks((prev) =>
      sortSocialLinks(
        prev.map((item) => (item.type === code ? { ...item, displayValue } : item)),
        options,
      ),
    );
  };

  const close = () => onCancel();

  return (
    <View style={[styles.overlayScreen, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable hitSlop={10} style={styles.headerButton} onPress={close}>
            <BackIcon />
          </Pressable>
          <CustomText style={styles.headerTitle}>{copy.title}</CustomText>
          <View style={styles.headerButton} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.snsContent,
            { paddingBottom: Math.max(insets.bottom + SNS_EDITOR_BOTTOM_SPACE, SNS_EDITOR_BOTTOM_SPACE) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <SectionHeading title={copy.platformsTitle} subtitle={copy.platformsSubtitle} />
            <View style={styles.platformGrid}>
              {options.map((option) => {
                const selected = selectedCodes.includes(option.code);
                const disabled = !selected && selectedCodes.length >= MAX_SNS_LINKS;
                return (
                  <Pressable
                    key={option.code}
                    onPress={() => togglePlatform(option.code)}
                    disabled={disabled}
                    style={({ pressed }) => [
                      styles.platformCard,
                      { width: platformCardWidth },
                      selected ? styles.platformCardSelected : styles.platformCardUnselected,
                      pressed && !disabled ? styles.pressed : null,
                    ]}>
                    <View style={styles.platformCardRow}>
                      <SocialPlatformIcon code={option.code} size={30} />
                      <CustomText style={styles.platformCardLabel}>
                        {getOptionLabel(option, language)}
                      </CustomText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {draftLinks.length > 0 ? (
            <View style={styles.section}>
              <SectionHeading title={copy.idsTitle} subtitle={copy.idsSubtitle} />
              <View style={styles.snsInputList}>
                {draftLinks.map((link) => {
                  const option = options.find((item) => item.code === link.type);
                  const isFocused = focusedSnsCode === link.type;
                  return (
                    <View key={link.type} style={styles.snsInputCard}>
                      <View style={styles.snsInputCardHeader}>
                        <SocialPlatformIcon code={link.type} size={30} />
                        <CustomText style={styles.snsInputCardTitle}>
                          {option ? getOptionLabel(option, language) : link.type}
                        </CustomText>
                      </View>

                      <View
                        style={[
                          styles.snsInputFrame,
                          isFocused && styles.inputFrameFocused,
                          isFocused && styles.snsInputFrameFocused,
                        ]}>
                        <TextInput
                          value={link.displayValue}
                          onChangeText={(text) => updateValue(link.type, text)}
                          placeholder={copy.inputPlaceholder}
                          placeholderTextColor="#8B95A1"
                          cursorColor="#4FAE98"
                          selectionColor="#4FAE98"
                          textAlignVertical="center"
                          style={styles.snsInput}
                          autoCapitalize="none"
                          autoCorrect={false}
                          onFocus={() => setFocusedSnsCode(link.type)}
                          onBlur={() =>
                            setFocusedSnsCode((current) => (current === link.type ? null : current))
                          }
                          returnKeyType="done"
                          numberOfLines={1}
                        />
                        <View style={[styles.snsInputTrailingSpacer, styles.pointerEventsNone]} />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={[styles.sheetFooterWrap, { paddingBottom: insets.bottom }]}>
          <Pressable style={styles.sheetCancelButtonLarge} onPress={close}>
            <CustomText style={styles.sheetCancelText}>{copy.cancel}</CustomText>
          </Pressable>
          <Pressable
            style={[
              styles.sheetConfirmButtonLarge,
              saveDisabled && styles.sheetConfirmButtonDisabled,
            ]}
            disabled={saveDisabled}
            onPress={() => onSave(normalizeSocialLinks(sortSocialLinks(draftLinks, options)))}>
            <CustomText
              style={[
                styles.sheetConfirmTextLarge,
                saveDisabled && styles.sheetConfirmTextDisabled,
              ]}>
              {copy.save}
            </CustomText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.white,
  },
  flex: {
    flex: 1,
  },
  header: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerButton: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Palette.text,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 0,
  },
  section: {
    gap: 16,
  },
  sectionAvatar: {
    marginBottom: 24,
  },
  sectionNickname: {
    gap: 8,
    marginBottom: 16,
  },
  sectionCountry: {
    gap: 8,
    marginBottom: 32,
  },
  sectionLanguage: {
    gap: 12,
    marginBottom: 32,
  },
  sectionKorean: {
    gap: 12,
    marginBottom: 32,
  },
  sectionBio: {
    gap: 8,
    marginBottom: 16,
  },
  sectionTravel: {
    gap: 12,
    marginTop: 24,
    marginBottom: 32,
  },
  sectionBuddyStyles: {
    gap: 12,
    marginBottom: 32,
  },
  sectionPublicSns: {
    gap: 12,
    marginBottom: 32,
  },
  sectionContact: {
    gap: 12,
  },
  sectionDivider: {
    height: 8,
    marginHorizontal: -16,
    backgroundColor: Palette.grey150,
  },
  sectionHeading: {
    gap: 4,
  },
  sectionTitle: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.text,
  },
  sectionSubtitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 13,
    lineHeight: 18.2,
    color: Palette.grey400,
  },
  fieldLabel: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.text,
  },
  avatarRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    paddingBottom: 8,
  },
  avatarButton: {
    width: 80,
    height: 80,
    position: 'relative',
    overflow: 'visible',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarButtonDisabled: {
    opacity: 0.85,
  },
  avatarFrame: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F6F9FB',
    borderWidth: 1,
    borderColor: '#E8EEF2',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 20,
  },
  avatarLoadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 40,
  },
  avatarImage: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 40,
  },
  avatarAddBadge: {
    position: 'absolute',
    top: 0,
    right: -0.5,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  avatarSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 26, 0.7)',
    justifyContent: 'flex-end',
  },
  avatarSheet: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
  },
  avatarSheetHandleArea: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  avatarSheetHandle: {
    width: 48,
    height: 4,
    borderRadius: 40,
    backgroundColor: '#E5E8EB',
  },
  avatarSheetRows: {
    backgroundColor: Palette.white,
  },
  avatarSheetRow: {
    minHeight: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Palette.grey150,
  },
  avatarSheetRowText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
    textAlign: 'center',
    flex: 1,
  },
  avatarSheetDeleteText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.red300,
    textAlign: 'center',
    flex: 1,
  },
  avatarSheetCancelRow: {
    marginTop: 8,
    borderBottomWidth: 0,
  },
  avatarSheetCancelText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.grey400,
  },
  inputFrame: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E8EEF2',
    borderRadius: 12,
    backgroundColor: '#F6F9FB',
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  inputFrameFocused: {
    borderColor: Palette.primaryLight,
    backgroundColor: Palette.secondary,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    height: 24,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
    paddingTop: 1,
    paddingBottom: 1,
    includeFontPadding: false,
  },
  selectFrame: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E8EEF2',
    borderRadius: 12,
    backgroundColor: '#F6F9FB',
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  selectText: {
    flex: 1,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
  },
  selectTextPlaceholder: {
    color: '#8B95A1',
  },
  selectTextValue: {
    color: Palette.text,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  travelStyleRows: {
    gap: 8,
  },
  travelStyleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  languageChip: {
    height: 36,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 16,
    paddingRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#4FAE98',
    backgroundColor: Palette.white,
  },
  languageChipText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#4FAE98',
  },
  languageChipRemoveButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageAddButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceChip: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceChipDefault: {
    flex: 1,
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8EEF2',
    backgroundColor: Palette.white,
  },
  choiceChipSelected: {
    backgroundColor: Palette.primary,
    borderWidth: 1,
    borderColor: Palette.primary,
  },
  choiceChipUnselected: {
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: '#E8EEF2',
  },
  choiceChipText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#4E5968',
  },
  choiceChipTextSelected: {
    color: Palette.white,
    fontFamily: FontFamily.pretendard.semiBold,
  },
  choiceChipTextUnselected: {
    color: '#4E5968',
    fontFamily: FontFamily.pretendard.medium,
  },
  choiceChipTravel: {
    height: 36,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  choiceChipTravelSelected: {
    backgroundColor: Palette.primary,
    borderWidth: 1,
    borderColor: Palette.primary,
  },
  choiceChipTravelUnselected: {
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.grey200,
  },
  choiceChipTextTravelSelected: {
    color: Palette.white,
    fontFamily: FontFamily.pretendard.medium,
  },
  choiceChipTextTravelUnselected: {
    color: Palette.grey600,
    fontFamily: FontFamily.pretendard.medium,
  },
  bioFrame: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E8EEF2',
    borderRadius: 12,
    backgroundColor: '#F6F9FB',
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  bioFrameFocused: {
    borderColor: Palette.primaryLight,
    backgroundColor: Palette.secondary,
  },
  bioInput: {
    flex: 1,
    minWidth: 0,
    height: 24,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
    paddingTop: 1,
    paddingBottom: 1,
    includeFontPadding: false,
  },
  bioIconSpacer: {
    width: 24,
    height: 24,
    padding: 2,
    opacity: 0,
  },
  fieldTrailingAction: {
    width: 24,
    height: 24,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldTrailingPlaceholder: {
    opacity: 0,
  },
  unsavedChangesOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 28, 26, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  unsavedChangesSheet: {
    width: '100%',
    maxWidth: 350,
    padding: 20,
    backgroundColor: Palette.white,
    borderRadius: 24,
    gap: 24,
  },
  unsavedChangesMessage: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: '#1C1C1A',
    textAlign: 'center',
  },
  unsavedChangesButtonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  unsavedChangesCancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7DEE5',
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unsavedChangesCancelText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 18,
    lineHeight: 22.4,
    color: Palette.grey400,
  },
  unsavedChangesConfirmButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unsavedChangesConfirmText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 22.4,
    color: Palette.white,
  },
  counterRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  counterValue: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 13,
    lineHeight: 18.2,
    letterSpacing: -0.26,
    color: '#4E5968',
  },
  counterSuffix: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 13,
    lineHeight: 18.2,
    letterSpacing: -0.26,
    color: '#8B95A1',
  },
  addSnsButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Palette.grey300,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSnsButtonText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.grey600,
  },
  smallAddSnsButton: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Palette.grey300,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallAddSnsButtonText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 15,
    color: Palette.grey600,
  },
  snsList: {
    gap: 10,
  },
  socialLinkRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialLinkLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  socialLinkTextGroup: {
    flex: 1,
    gap: 4,
  },
  socialLinkLabel: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 12,
    lineHeight: 16.8,
    color: Palette.grey400,
  },
  socialLinkValue: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.text,
  },
  toggleGroup: {
    gap: 16,
  },
  toggleRow: {
    minHeight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleLabel: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  toggleTrack: {
    width: 50,
    height: 28,
    padding: 3,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  toggleTrackOn: {
    backgroundColor: Palette.primary,
    justifyContent: 'flex-end',
  },
  toggleTrackOff: {
    backgroundColor: Palette.grey300,
    justifyContent: 'flex-start',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Palette.white,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorState: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  errorTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Palette.text,
    textAlign: 'center',
  },
  errorDescription: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey500,
    textAlign: 'center',
  },
  overlayScreen: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Palette.white,
    zIndex: 20,
    elevation: 20,
  },
  snsContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    gap: 24,
  },
  platformGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformCard: {
    minHeight: 68,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: 'center',
  },
  platformCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  platformCardLabel: {
    flex: 1,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey600,
  },
  platformCardSelected: {
    borderWidth: 1.2,
    borderColor: Palette.primary,
    backgroundColor: Palette.secondary,
  },
  platformCardUnselected: {
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.white,
  },
  pressed: {
    opacity: 0.8,
  },
  snsInputList: {
    gap: 16,
  },
  snsInputCard: {
    borderWidth: 1,
    borderColor: '#E8EEF2',
    borderRadius: 16,
    backgroundColor: Palette.white,
    padding: 16,
    gap: 14,
  },
  snsInputCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  snsInputCardTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 14,
    lineHeight: 19.6,
    color: '#353D4A',
  },
  snsInputFrame: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E8EEF2',
    borderRadius: 12,
    backgroundColor: '#F6F9FB',
    paddingHorizontal: 16,
    paddingVertical: 0,
  },
  snsInputFrameFocused: {
    borderColor: Palette.primaryLight,
    backgroundColor: Palette.secondary,
  },
  snsInput: {
    flex: 1,
    minWidth: 0,
    height: 24,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
    color: Palette.text,
    paddingTop: 1,
    paddingBottom: 1,
    includeFontPadding: false,
  },
  snsInputTrailingSpacer: {
    width: 24,
    height: 24,
    padding: 2,
    opacity: 0,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetOverlayBackground: {
    backgroundColor: 'rgba(28,28,26,0.7)',
  },
  sheet: {
    backgroundColor: Palette.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 16,
  },
  sheetHandleArea: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sheetHandle: {
    width: 48,
    height: 4,
    borderRadius: 40,
    backgroundColor: '#E5E8EB',
  },
  sheetHeader: {
    gap: 6,
  },
  sheetTitle: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    lineHeight: 25.2,
    color: Palette.text,
  },
  sheetSubtitle: {
    fontFamily: FontFamily.pretendard.regular,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey500,
  },
  sheetSearchFrame: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E8EEF2',
    borderRadius: 12,
    backgroundColor: '#F6F9FB',
    paddingHorizontal: 14,
  },
  sheetSearchFrameFocused: {
    borderColor: Palette.primaryLight,
    backgroundColor: Palette.secondary,
  },
  sheetSearchInput: {
    flex: 1,
    minWidth: 0,
    height: 22,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22,
    color: Palette.text,
    paddingVertical: 0,
    includeFontPadding: false,
  },
  sheetSearchClearButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetBody: {
    paddingBottom: 0,
    gap: 16,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionList: {
    gap: 8,
  },
  optionEmptyState: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionEmptyText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 14,
    lineHeight: 19.6,
    color: Palette.grey500,
    textAlign: 'center',
  },
  optionRow: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.grey200,
    backgroundColor: Palette.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionRowSelected: {
    borderColor: Palette.primary,
    backgroundColor: Palette.secondary,
  },
  optionRowText: {
    flex: 1,
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 16,
    lineHeight: 22.4,
  },
  optionRowTextSelected: {
    color: Palette.text,
  },
  optionRowTextUnselected: {
    color: Palette.grey600,
  },
  optionRowToggle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRowToggleSelected: {
    backgroundColor: Palette.primary,
  },
  optionRowToggleUnselected: {
    borderWidth: 1,
    borderColor: Palette.grey300,
    backgroundColor: Palette.white,
  },
  sheetFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 4,
  },
  sheetCancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.grey300,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancelText: {
    fontFamily: FontFamily.pretendard.medium,
    fontSize: 18,
    color: Palette.grey400,
  },
  sheetConfirmButton: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetConfirmButtonDisabled: {
    backgroundColor: Palette.grey200,
  },
  sheetConfirmText: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    color: Palette.white,
  },
  sheetConfirmTextDisabled: {
    color: Palette.grey400,
  },
  sheetFooterWrap: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sheetCancelButtonLarge: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Palette.grey300,
    backgroundColor: Palette.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetConfirmButtonLarge: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetConfirmTextLarge: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 18,
    color: Palette.white,
  },
  instagramIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F56040',
  },
  instagramRing: {
    borderWidth: 3,
    borderColor: Palette.white,
  },
  instagramDot: {
    position: 'absolute',
    backgroundColor: Palette.white,
  },
  tiktokIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  tiktokGlyph: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 22,
    color: Palette.white,
    transform: [{ rotate: '-12deg' }],
  },
  wechatIcon: {
    backgroundColor: '#1AAD19',
    overflow: 'hidden',
  },
  wechatBubble: {
    position: 'absolute',
    backgroundColor: Palette.white,
  },
  xhsIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF2D55',
  },
  xhsGlyph: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 10,
    lineHeight: 13,
    color: Palette.white,
  },
  lineIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#06C755',
  },
  lineGlyph: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 10,
    lineHeight: 13,
    color: Palette.white,
  },
  kakaoIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE500',
  },
  kakaoGlyph: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 10,
    lineHeight: 13,
    color: Palette.text,
  },
  fallbackIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.grey200,
  },
  fallbackGlyph: {
    fontFamily: FontFamily.pretendard.semiBold,
    fontSize: 10,
    lineHeight: 13,
    color: Palette.grey700,
  },
  pointerEventsNone: {
    pointerEvents: 'none',
  },
});

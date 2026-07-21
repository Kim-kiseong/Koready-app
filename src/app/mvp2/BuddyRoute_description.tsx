import Description from "@/components/mvp2_BuddyRoute_description/Description";
import EnjoySection from "@/components/mvp2_BuddyRoute_description/EnjoySection";
import Header from "@/components/mvp2_BuddyRoute_description/Header";
import Info from "@/components/mvp2_BuddyRoute_description/Info";
import NearbyPlaceCard from "@/components/mvp2_BuddyRoute_description/NearbyPlaceCard";
import Tab, {
  TabType,
} from "@/components/mvp2_BuddyRoute_description/Tab";
import { Theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { mockData } from "./mock";

const TABS: TabType[] = [
  "DESCRIPTION",
  "ROUTE",
  "MATE",
];

export default function BuddyRouteDescription() {
  const router = useRouter();

  const [activeTab, setActiveTab] =
    useState<TabType>(TABS[0]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={30}
            color={Theme.colors.textPrimary}
          />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* 상단 이미지 */}
        <Header images={mockData.images} />

        {/* 기본 정보 */}
        <Info
          placeId={mockData.placeId}
          title={mockData.title}
          address={mockData.address}
          tags={mockData.tags}
          isSaved={mockData.isSaved}
        />

        {/* 탭 */}
        <Tab
          availableTabs={TABS}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />

        {/* 설명 */}
        {activeTab === "DESCRIPTION" && (
          <>
            <Description
              data={mockData.description}
              images={mockData.images}
            />

            <EnjoySection
              enjoyPoints={
                mockData.description.enjoyPoints
              }
            />

            <View style={styles.placeSection}>
              <Text style={styles.sectionTitle}>
                같이 가보면 좋은 명소
              </Text>

              {mockData.relatedPlaces.map((place) => (
                <NearbyPlaceCard
                  key={place.placeId}
                  place={place}
                />
              ))}
            </View>
          </>
        )}

        {/* 이동 */}
        {activeTab === "ROUTE" && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Buddy Route / Hori Tip
            </Text>
          </View>
        )}

        {/* 메이트 */}
        {activeTab === "MATE" && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Buddy Connect
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },

  topBar: {
    paddingHorizontal: Theme.spacing.xsl,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.xl,
  },

  content: {
    paddingBottom: Theme.spacing.xxxxxl,
  },

  placeSection: {
    paddingHorizontal: Theme.spacing.xl,
    marginTop: Theme.spacing.xxxxl, // 40 또는 피그마 값에 맞게 수정
  },

  sectionTitle: {
    ...Theme.typography.text20SemiBold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xl,
  },

  placeholder: {
    paddingVertical: Theme.spacing.xxxxxxl, // 48
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    ...Theme.typography.text16Medium,
    color: Theme.colors.textTertiary,
  },
});
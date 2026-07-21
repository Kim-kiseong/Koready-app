import Description from "@/components/mvp2_BuddyRoute_description/Description";
import EnjoySection from "@/components/mvp2_BuddyRoute_description/EnjoySection";
import Header from "@/components/mvp2_BuddyRoute_description/Header";
import Info from "@/components/mvp2_BuddyRoute_description/Info";
import NearbyPlaceCard from "@/components/mvp2_BuddyRoute_description/NearbyPlaceCard";
import Tab, { TabType, } from "@/components/mvp2_BuddyRoute_description/Tab";
import { Theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, } from "react-native";

import { mockData } from "./mock";

export default function BuddyRouteDescription() {
  const router = useRouter();
  const [activeTab, setActiveTab] =
    useState<TabType>("DESCRIPTION");

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
          availableTabs={mockData.availableTabs}
          activeTab={activeTab}
          onChangeTab={setActiveTab}
        />

        {/* 설명 탭 */}
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

        {/* 이동 탭 */}
        {activeTab === "ROUTE" && (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Buddy Route / Hori Tip
            </Text>
          </View>
        )}

        {/* 메이트 탭 */}
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
    paddingHorizontal: Theme.spacing.xsl, //20
    paddingTop: Theme.spacing.md,          // 12
    paddingBottom: Theme.spacing.xl,       // 16
  },

  content: {
    paddingBottom: Theme.spacing.xxxxxl, //42
  },

  placeSection: {
    paddingHorizontal: Theme.spacing.xl,   // 16
    marginTop: 26,
  },

  sectionTitle: {
    ...Theme.typography.text20SemiBold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xl,        // 16
  },

  placeholder: {
    paddingVertical: 80,
    justifyContent: "center",
    alignItems: "center",
  },

  placeholderText: {
    ...Theme.typography.text16Medium,
    color: Theme.colors.grey500,
  },
});
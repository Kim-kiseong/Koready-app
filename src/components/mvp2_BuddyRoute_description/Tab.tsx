import { Theme } from "@/constants/theme";
import { Pressable, StyleSheet, Text, View } from "react-native";

export type TabType = "DESCRIPTION" | "ROUTE" | "MATE";

interface Props {
  availableTabs: TabType[];
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

const TAB_LABEL: Record<TabType, string> = {
  DESCRIPTION: "설명",
  ROUTE: "이동",
  MATE: "메이트",
};

export default function Tab({
  availableTabs,
  activeTab,
  onChangeTab,
}: Props) {
  return (
    <View style={styles.wrapper}>
      {availableTabs.map((tab) => {
        const isActive = activeTab === tab;

        return (
          <Pressable
            key={tab}
            style={styles.tab}
            onPress={() => onChangeTab(tab)}
          >
            <Text
              style={[
                styles.text,
                isActive
                  ? styles.activeText
                  : styles.inactiveText,
              ]}
            >
              {TAB_LABEL[tab]}
            </Text>

            <View
              style={[
                styles.line,
                isActive
                  ? styles.activeLine
                  : styles.inactiveLine,
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    marginTop: Theme.spacing.xxl,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },

  tab: {
    flex: 1,
    alignItems: "center",
  },

  text: {
    marginBottom: 10,
  },

  activeText: {
    ...Theme.typography.text14Bold,
    color: Theme.colors.grey900,
  },

  inactiveText: {
    ...Theme.typography.text14Medium,
    color: Theme.colors.grey500,
  },

  line: {
    width: "100%",
    height: 2,
  },

  activeLine: {
    backgroundColor: Theme.colors.textPrimary,
  },

  inactiveLine: {
    backgroundColor: Theme.colors.transparent,
  },
});
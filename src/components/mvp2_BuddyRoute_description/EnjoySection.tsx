import { Theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

interface Props {
  enjoyPoints: string[];
}

export default function EnjoySection({
  enjoyPoints,
}: Props) {
  if (enjoyPoints.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        이렇게 즐겨보세요
      </Text>

      {enjoyPoints.map((point, index) => (
  <View
    key={point}
    style={[
      styles.item,
      index === enjoyPoints.length - 1 && styles.lastItem,
    ]}
  >
          <Ionicons
            name="checkmark"
            size={22}
            color={Theme.colors.textPrimary}
          />

          <Text style={styles.text}>
            {point}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.spacing.xl, //16
  },

  title: {
    ...Theme.typography.text20SemiBold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xl, // 16
  },

  item: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.md, // 12
  },

  lastItem: {
  marginBottom: Theme.spacing.xxxxs, //0
},

  text: {
    ...Theme.typography.text14Medium,
    color: Theme.colors.grey900,
    marginLeft: Theme.spacing.sm, // 8
    flex: 1,
  },
});
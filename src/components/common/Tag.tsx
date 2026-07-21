import { Theme } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

interface TagProps {
  text: string;
}

export default function Tag({ text }: TagProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.spacing.md, // 12
    paddingVertical: Theme.spacing.xs,   // 6

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: Theme.colors.tagBackground,
    borderRadius: Theme.radius.sm, //8
  },

  text: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 17,
    letterSpacing: -0.24,
    color: Theme.colors.grey700,
  },
});
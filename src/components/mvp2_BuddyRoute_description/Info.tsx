import Tag from '@/components/common/Tag';
import { Theme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface InfoProps {
  placeId: number;
  title: string;
  address: string;
  tags: string[];
  isSaved: boolean;
}

export default function Info({
  placeId,
  title,
  address,
  tags,
  isSaved,
}: InfoProps) {

  const handleSavePress = () => {
    // TODO
    // POST /places/{placeId}/save
    // DELETE /places/{placeId}/save
    console.log(placeId);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>
          {title}
        </Text>

        <Pressable
          hitSlop={Theme.spacing.md} //12
          style={styles.heartButton}
          onPress={handleSavePress}
        >
          <Ionicons
            name={isSaved ? 'heart' : 'heart-outline'}
            size={24}
            color={
              isSaved
                ? Theme.colors.point500
                : Theme.colors.grey400
            }
          />
        </Pressable>
      </View>

      <View style={styles.addressRow}>
        <Ionicons
          name="location-outline"
          size={14}
          color={Theme.colors.grey700}
        />

        <Text style={styles.address}>
          {address}
        </Text>
      </View>


      <View style={styles.tagRow}>
        {tags.map((tag) => (
          <Tag
            key={tag}
            text={tag}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Theme.spacing.xl, //16
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm, //8
  },

  title: {
    ...Theme.typography.text20SemiBold,
    color: Theme.colors.textPrimary,
    flex: 1,
  },

  heartButton: {
    padding:3,
  },

  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl, //16
  },

  address: {
    ...Theme.typography.text14Regular,
    color: Theme.colors.grey700,
    marginLeft: Theme.spacing.xxs, //4
    flex: 1,
  },


  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs, //6
  },
});
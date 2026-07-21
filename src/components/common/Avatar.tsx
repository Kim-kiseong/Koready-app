import { Theme } from '@/constants/theme';
import { Image, StyleSheet, View } from 'react-native';

interface AvatarProps {
  imageUrl: string;
  size?: number;
}

export default function Avatar({ imageUrl, size = 48 }: AvatarProps) {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <Image 
        source={{ uri: imageUrl }} 
        style={styles.image} 
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Theme.colors.border, // #E8EEF2
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BottomNavBar from '@/components/BottomNavBar';
import CustomText from '@/components/CustomText';

export default function SavedScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.content}>
        <CustomText style={styles.title}>저장 화면 (준비 중)</CustomText>
      </View>
      <BottomNavBar active="saved" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
  },
});

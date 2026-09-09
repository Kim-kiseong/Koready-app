import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { RoutePlace, RouteSegment } from '@/api/route';

type KakaoMapProps = {
  origin: RoutePlace;
  destination: RoutePlace;
  segments?: RouteSegment[];
  style?: StyleProp<ViewStyle>;
};

export default function KakaoRouteMap(_props: KakaoMapProps) {
  return <View style={[styles.container, _props.style]} />;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EAF1F7',
  },
});

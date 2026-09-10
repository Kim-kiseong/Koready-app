import { Platform } from 'react-native';

import KakaoRouteMapNative from './KakaoRouteMap.native';
import KakaoRouteMapWeb from './KakaoRouteMap.web';

const KakaoRouteMap = Platform.OS === 'web' ? KakaoRouteMapWeb : KakaoRouteMapNative;

export default KakaoRouteMap;

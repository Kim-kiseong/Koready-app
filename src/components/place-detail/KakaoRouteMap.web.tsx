import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import type { RoutePlace } from '@/api/route';

// TODO: Kakao JavaScript 키를 직접 넣고 싶다면 아래 줄에 키를 붙여넣으세요.
// const KAKAO_MAP_JS_KEY = '여기에 Kakao JavaScript 키를 붙여넣으세요';
const KAKAO_MAP_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_MAP_JS_KEY ?? '';

type KakaoMapProps = {
  origin: RoutePlace;
  destination: RoutePlace;
  style?: StyleProp<ViewStyle>;
};

type KakaoPoint = {
  lat: number;
  lng: number;
};

type KakaoWindow = Window & {
  kakao?: {
    maps: any;
  };
};

let kakaoScriptPromise: Promise<void> | null = null;

function getWindow() {
  return window as KakaoWindow;
}

function loadKakaoSdk(appKey: string) {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('KAKAO_MAP_UNAVAILABLE'));
  }

  const kakao = getWindow().kakao;
  if (kakao?.maps) {
    return Promise.resolve();
  }

  if (!appKey) {
    return Promise.reject(new Error('KAKAO_MAP_JS_KEY_REQUIRED'));
  }

  if (!kakaoScriptPromise) {
    kakaoScriptPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.getElementById('kakao-map-js-sdk') as HTMLScriptElement | null;
      const onScriptReady = () => {
        const currentKakao = getWindow().kakao;
        if (!currentKakao?.maps) {
          reject(new Error('KAKAO_MAP_SDK_NOT_READY'));
          return;
        }

        currentKakao.maps.load(() => resolve());
      };

      if (existingScript) {
        if (existingScript.getAttribute('data-loaded') === 'true') {
          onScriptReady();
          return;
        }

        existingScript.addEventListener('load', onScriptReady, { once: true });
        existingScript.addEventListener('error', () => reject(new Error('KAKAO_MAP_SCRIPT_FAILED')), { once: true });
        return;
      }

      const script = document.createElement('script');
      script.id = 'kakao-map-js-sdk';
      script.async = true;
      script.defer = true;
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false&libraries=services`;
      script.onload = () => {
        script.setAttribute('data-loaded', 'true');
        onScriptReady();
      };
      script.onerror = () => reject(new Error('KAKAO_MAP_SCRIPT_FAILED'));
      document.head.appendChild(script);
    }).finally(() => {
      kakaoScriptPromise = null;
    });
  }

  return kakaoScriptPromise;
}

function normalizeSearchText(place: RoutePlace) {
  return (place.address?.trim() || place.name.trim()).trim();
}

function createPinDataUri(color: string) {
  const svg = `
    <svg width="40" height="52" viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 50C20 50 35 34.8 35 21.4C35 12 28.2843 5 20 5C11.7157 5 5 12 5 21.4C5 34.8 20 50 20 50Z" fill="${color}"/>
      <circle cx="20" cy="20" r="7.5" fill="white"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function calculateMidpoint(a: KakaoPoint, b: KakaoPoint): KakaoPoint {
  return {
    lat: (a.lat + b.lat) / 2,
    lng: (a.lng + b.lng) / 2,
  };
}

function resolveDistance(a: KakaoPoint, b: KakaoPoint) {
  const latDistance = Math.abs(a.lat - b.lat);
  const lngDistance = Math.abs(a.lng - b.lng);
  return latDistance + lngDistance;
}

export default function KakaoRouteMap({ origin, destination, style }: KakaoMapProps) {
  const mapContainerRef = useRef<View | null>(null);
  const mapRef = useRef<any>(null);
  const originMarkerRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const searchKey = useMemo(
    () => `${normalizeSearchText(origin)}::${normalizeSearchText(destination)}`,
    [destination, origin],
  );

  useEffect(() => {
    let cancelled = false;

    /* eslint-disable react-hooks/set-state-in-effect */
    setMapReady(false);
    /* eslint-enable react-hooks/set-state-in-effect */

    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }
    if (originMarkerRef.current) {
      originMarkerRef.current.setMap(null);
      originMarkerRef.current = null;
    }
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null);
      destinationMarkerRef.current = null;
    }
    if (mapRef.current) {
      mapRef.current = null;
    }

    const initMap = async () => {
      try {
        const currentWindow = getWindow();
        if (!currentWindow.kakao?.maps) {
          await loadKakaoSdk(KAKAO_MAP_JS_KEY);
        }

        if (cancelled) {
          return;
        }

        const kakao = getWindow().kakao?.maps;
        const container = mapContainerRef.current;
        if (!kakao || !container) {
          return;
        }

        const geocoder = new kakao.services.Geocoder();
        const markerImageStart = new kakao.MarkerImage(
          createPinDataUri('#4FAE98'),
          new kakao.Size(40, 52),
          { offset: new kakao.Point(20, 50) },
        );
        const markerImageEnd = new kakao.MarkerImage(
          createPinDataUri('#FF4D4F'),
          new kakao.Size(40, 52),
          { offset: new kakao.Point(20, 50) },
        );

        const searchPoint = (query: string) =>
          new Promise<KakaoPoint | null>((resolve) => {
            const handleResults = (results: Array<{ x: string; y: string }>, status: string) => {
              if (status === kakao.services.Status.OK && results.length > 0) {
                const [firstResult] = results;
                const lat = Number(firstResult.y);
                const lng = Number(firstResult.x);
                if (Number.isFinite(lat) && Number.isFinite(lng)) {
                  resolve({ lat, lng });
                  return;
                }
              }

              resolve(null);
            };

            geocoder.addressSearch(query, handleResults);
          }).then(async (result) => {
            if (result) return result;

            return new Promise<KakaoPoint | null>((resolve) => {
              const places = new kakao.services.Places();
              places.keywordSearch(query, (results: Array<{ x: string; y: string }>, status: string) => {
                if (status === kakao.services.Status.OK && results.length > 0) {
                  const [firstResult] = results;
                  const lat = Number(firstResult.y);
                  const lng = Number(firstResult.x);
                  if (Number.isFinite(lat) && Number.isFinite(lng)) {
                    resolve({ lat, lng });
                    return;
                  }
                }

                resolve(null);
              });
            });
          });

        const [originPoint, destinationPoint] = await Promise.all([
          searchPoint(normalizeSearchText(origin)),
          searchPoint(normalizeSearchText(destination)),
        ]);

        if (cancelled) {
          return;
        }

        const initialCenter =
          originPoint && destinationPoint
            ? calculateMidpoint(originPoint, destinationPoint)
            : originPoint ?? destinationPoint ?? { lat: 37.5665, lng: 126.978 };

        const map = new kakao.Map(container, {
          center: new kakao.LatLng(initialCenter.lat, initialCenter.lng),
          level: originPoint && destinationPoint ? 9 : 6,
          draggable: false,
          disableDoubleClickZoom: true,
          scrollwheel: false,
        });

        mapRef.current = map;

        if (originPoint) {
          originMarkerRef.current = new kakao.Marker({
            map,
            position: new kakao.LatLng(originPoint.lat, originPoint.lng),
            image: markerImageStart,
          });
        }

        if (destinationPoint) {
          destinationMarkerRef.current = new kakao.Marker({
            map,
            position: new kakao.LatLng(destinationPoint.lat, destinationPoint.lng),
            image: markerImageEnd,
          });
        }

        if (originPoint && destinationPoint) {
          const line = new kakao.Polyline({
            map,
            path: [
              new kakao.LatLng(originPoint.lat, originPoint.lng),
              new kakao.LatLng(destinationPoint.lat, destinationPoint.lng),
            ],
            strokeWeight: 4,
            strokeColor: '#4FAE98',
            strokeOpacity: 0.9,
            strokeStyle: 'solid',
          });

          polylineRef.current = line;

          const bounds = new kakao.LatLngBounds();
          bounds.extend(new kakao.LatLng(originPoint.lat, originPoint.lng));
          bounds.extend(new kakao.LatLng(destinationPoint.lat, destinationPoint.lng));
          map.setBounds(bounds);

          const distance = resolveDistance(originPoint, destinationPoint);
          if (distance < 0.05) {
            map.setLevel(7);
            map.setCenter(new kakao.LatLng(initialCenter.lat, initialCenter.lng));
          }
        } else if (originPoint || destinationPoint) {
          const singlePoint = originPoint ?? destinationPoint;
          if (singlePoint) {
            map.setCenter(new kakao.LatLng(singlePoint.lat, singlePoint.lng));
            map.setLevel(6);
          }
        }

        setMapReady(true);
      } catch {
        if (!cancelled) {
          setMapReady(false);
        }
      }
    };

    void initMap();

    return () => {
      cancelled = true;
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      if (originMarkerRef.current) {
        originMarkerRef.current.setMap(null);
        originMarkerRef.current = null;
      }
      if (destinationMarkerRef.current) {
        destinationMarkerRef.current.setMap(null);
        destinationMarkerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current = null;
      }
    };
  }, [searchKey]);

  return (
    <View ref={mapContainerRef} style={[styles.container, style]}>
      <View style={styles.mapSurface} />
      {!mapReady ? <View style={styles.overlay} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#EAF1F7',
    position: 'relative',
  },
  mapSurface: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#EAF1F7',
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(234, 241, 247, 0.35)',
  },
});

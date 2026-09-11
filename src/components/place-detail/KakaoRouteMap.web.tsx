import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import CustomText from '@/components/CustomText';

import type { RouteCoordinate, RoutePlace, RouteSegment } from '@/api/route';

// Set this in .env.local and Vercel Environment Variables.
// EXPO_PUBLIC_KAKAO_MAP_JS_KEY=your-kakao-javascript-key
const KAKAO_MAP_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_MAP_JS_KEY ?? '';
const KAKAO_MAP_INTERACTION_STYLE = {
  cursor: 'grab',
  touchAction: 'none',
  userSelect: 'none',
} as unknown as ViewStyle;

type KakaoMapProps = {
  origin: RoutePlace;
  destination: RoutePlace;
  segments?: RouteSegment[];
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
  const address = place.address?.trim() ?? '';
  const name = place.name.trim();

  return isUsableSearchText(address) ? address : name;
}

function createPlaceSearchQueries(place: RoutePlace) {
  const queries: string[] = [];
  const address = place.address?.trim() ?? '';
  const name = place.name.trim();

  pushUniqueQuery(queries, address);
  if (isUsableSearchText(address) && isUsableSearchText(name) && address !== name) {
    pushUniqueQuery(queries, `${address} ${name}`);
  }
  pushUniqueQuery(queries, name);

  return queries;
}

function isUsableSearchText(value: string) {
  const normalized = value.trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  return !['string', 'null', 'undefined', '-', 'n/a'].includes(normalized);
}

function toNumber(value: number | string | null | undefined) {
  if (value == null) {
    return null;
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function createPoint(latitude: number | string | null | undefined, longitude: number | string | null | undefined) {
  const lat = toNumber(latitude);
  const lng = toNumber(longitude);

  if (lat == null || lng == null) {
    return null;
  }

  return { lat, lng };
}

function resolveCoordinatePoint(coordinate: RouteCoordinate | null | undefined) {
  if (!coordinate) {
    return null;
  }

  return (
    createPoint(coordinate.latitude, coordinate.longitude)
    ?? createPoint(coordinate.lat, coordinate.lng)
    // Kakao and many map APIs expose x as longitude and y as latitude.
    ?? createPoint(coordinate.y, coordinate.x)
  );
}

function resolvePlacePoint(place: RoutePlace) {
  return resolveCoordinatePoint(place);
}

function resolveSegmentStartPoint(segment: RouteSegment) {
  return (
    createPoint(segment.startLatitude, segment.startLongitude)
    ?? createPoint(segment.startLat, segment.startLng)
    ?? createPoint(segment.startY, segment.startX)
  );
}

function resolveSegmentEndPoint(segment: RouteSegment) {
  return (
    createPoint(segment.endLatitude, segment.endLongitude)
    ?? createPoint(segment.endLat, segment.endLng)
    ?? createPoint(segment.endY, segment.endX)
  );
}

function resolveCoordinateListPoint(value: RouteCoordinate | [number | string, number | string]) {
  if (Array.isArray(value)) {
    const [first, second] = value;
    const firstNumber = toNumber(first);
    const secondNumber = toNumber(second);

    if (firstNumber == null || secondNumber == null) {
      return null;
    }

    // Most backend path arrays use [latitude, longitude]. If the first value
    // cannot be latitude, treat the pair as [longitude, latitude].
    return Math.abs(firstNumber) <= 90
      ? { lat: firstNumber, lng: secondNumber }
      : { lat: secondNumber, lng: firstNumber };
  }

  return resolveCoordinatePoint(value);
}

function resolveSegmentPathPoints(segment: RouteSegment) {
  const path = Array.isArray(segment.path)
    ? segment.path
    : Array.isArray(segment.polyline)
      ? segment.polyline
      : [];

  return path
    .map(resolveCoordinateListPoint)
    .filter((point): point is KakaoPoint => point !== null);
}

function createPinDataUri(color: string) {
  const svg = `
    <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 35C14 35 24.5 24.4 24.5 15C24.5 8.4 19.8 3.5 14 3.5C8.2 3.5 3.5 8.4 3.5 15C3.5 24.4 14 35 14 35Z" fill="${color}"/>
      <circle cx="14" cy="14" r="5" fill="white"/>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function normalizeSegmentSearchText(value: string) {
  return value.trim();
}

function pushUniqueQuery(queries: string[], query: string) {
  if (!isUsableSearchText(query)) {
    return;
  }

  if (queries.at(-1) === query) {
    return;
  }

  queries.push(query);
}

function createRouteSearchQueries(origin: RoutePlace, destination: RoutePlace, segments: RouteSegment[] = []) {
  const sortedSegments = [...segments].sort((left, right) => left.order - right.order);
  const queries: string[] = [];

  pushUniqueQuery(queries, normalizeSearchText(origin));

  sortedSegments.forEach((segment) => {
    pushUniqueQuery(queries, normalizeSegmentSearchText(segment.startName));
    pushUniqueQuery(queries, normalizeSegmentSearchText(segment.endName));
  });

  pushUniqueQuery(queries, normalizeSearchText(destination));

  return queries;
}

function createWaypointSearchQueries(segments: RouteSegment[] = []) {
  const sortedSegments = [...segments].sort((left, right) => left.order - right.order);
  const queries: string[] = [];

  sortedSegments.forEach((segment) => {
    if (!['BUS', 'TRAIN', 'EXPRESS_BUS', 'AIRPLANE', 'FERRY'].includes(segment.mode)) {
      return;
    }

    pushUniqueQuery(queries, normalizeSegmentSearchText(segment.startName));
    pushUniqueQuery(queries, normalizeSegmentSearchText(segment.endName));
  });

  return queries;
}

function createSegmentCoordinatePoints(segments: RouteSegment[] = []) {
  const points: KakaoPoint[] = [];
  let hasPathCoordinates = false;

  [...segments].sort((left, right) => left.order - right.order).forEach((segment) => {
    const pathPoints = resolveSegmentPathPoints(segment);
    if (pathPoints.length > 0) {
      hasPathCoordinates = true;
      points.push(...pathPoints);
      return;
    }

    const startPoint = resolveSegmentStartPoint(segment);
    const endPoint = resolveSegmentEndPoint(segment);
    if (startPoint) {
      points.push(startPoint);
    }
    if (endPoint) {
      points.push(endPoint);
    }
  });

  return {
    points: removeConsecutiveDuplicatePoints(points),
    hasPathCoordinates,
  };
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

function resolveEuclideanDistance(a: KakaoPoint, b: KakaoPoint) {
  return Math.hypot(a.lat - b.lat, a.lng - b.lng);
}

function resolvePointProjectionRatio(point: KakaoPoint, start: KakaoPoint, end: KakaoPoint) {
  const dx = end.lng - start.lng;
  const dy = end.lat - start.lat;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared <= 0) {
    return 0;
  }

  return ((point.lng - start.lng) * dx + (point.lat - start.lat) * dy) / lengthSquared;
}

function resolvePointDistanceToLine(point: KakaoPoint, start: KakaoPoint, end: KakaoPoint) {
  const dx = end.lng - start.lng;
  const dy = end.lat - start.lat;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared <= 0) {
    return resolveEuclideanDistance(point, start);
  }

  const ratio = Math.max(0, Math.min(1, resolvePointProjectionRatio(point, start, end)));
  const projection = {
    lat: start.lat + ratio * dy,
    lng: start.lng + ratio * dx,
  };

  return resolveEuclideanDistance(point, projection);
}

function removeConsecutiveDuplicatePoints(points: KakaoPoint[]) {
  return points.filter((point, index) => {
    const previousPoint = points[index - 1];
    if (!previousPoint) {
      return true;
    }

    return resolveDistance(previousPoint, point) > 0.002;
  });
}

function filterRoutePoints(originPoint: KakaoPoint | null, destinationPoint: KakaoPoint | null, middlePoints: KakaoPoint[]) {
  if (!originPoint && !destinationPoint) {
    return [];
  }

  if (!originPoint) {
    return destinationPoint ? [destinationPoint] : [];
  }

  if (!destinationPoint) {
    return [originPoint, ...removeConsecutiveDuplicatePoints(middlePoints)];
  }

  const dedupedMiddlePoints = removeConsecutiveDuplicatePoints(middlePoints);

  if (dedupedMiddlePoints.length === 0) {
    return [originPoint, destinationPoint];
  }

  const endpointDistance = resolveEuclideanDistance(originPoint, destinationPoint);

  const maxDetourDistance = Math.min(Math.max(endpointDistance * 0.18, 0.006), 0.06);
  const filteredMiddlePoints = dedupedMiddlePoints
    .map((point, index) => ({
      index,
      point,
      projectionRatio: resolvePointProjectionRatio(point, originPoint, destinationPoint),
      detourDistance: resolvePointDistanceToLine(point, originPoint, destinationPoint),
    }))
    .filter(({ projectionRatio, detourDistance }) => {
      return projectionRatio >= -0.08 && projectionRatio <= 1.08 && detourDistance <= maxDetourDistance;
    })
    .sort((left, right) => {
      if (Math.abs(left.projectionRatio - right.projectionRatio) > 0.03) {
        return left.projectionRatio - right.projectionRatio;
      }

      return left.index - right.index;
    })
    .map(({ point }) => point);

  return [originPoint, ...removeConsecutiveDuplicatePoints(filteredMiddlePoints), destinationPoint];
}

export default function KakaoRouteMap({ origin, destination, segments = [], style }: KakaoMapProps) {
  const mapContainerRef = useRef<View | null>(null);
  const mapRef = useRef<any>(null);
  const originMarkerRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);
  const polylineRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const searchKey = useMemo(
    () => createRouteSearchQueries(origin, destination, segments).join('::'),
    [destination, origin, segments],
  );
  const handleZoomIn = () => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    map.setLevel(Math.max(1, map.getLevel() - 1));
  };
  const handleZoomOut = () => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    map.setLevel(Math.min(14, map.getLevel() + 1));
  };

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
          new kakao.Size(28, 36),
          { offset: new kakao.Point(14, 35) },
        );
        const markerImageEnd = new kakao.MarkerImage(
          createPinDataUri('#FF4D4F'),
          new kakao.Size(28, 36),
          { offset: new kakao.Point(14, 35) },
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

        const searchFirstPoint = async (queries: string[]) => {
          for (const query of queries) {
            const point = await searchPoint(query);
            if (point) {
              return point;
            }
          }

          return null;
        };

        const originPoint = resolvePlacePoint(origin) ?? await searchFirstPoint(createPlaceSearchQueries(origin));
        const destinationPoint = resolvePlacePoint(destination) ?? await searchFirstPoint(createPlaceSearchQueries(destination));
        const coordinateWaypoints = createSegmentCoordinatePoints(segments);
        const coordinateWaypointPoints = coordinateWaypoints.points;
        const waypointQueries = coordinateWaypointPoints.length > 0 ? [] : createWaypointSearchQueries(segments);
        const searchedWaypointPoints = await Promise.all(waypointQueries.map((query) => searchPoint(query)));
        const routePoints = coordinateWaypoints.hasPathCoordinates
          ? removeConsecutiveDuplicatePoints([
              ...(originPoint ? [originPoint] : []),
              ...coordinateWaypointPoints,
              ...(destinationPoint ? [destinationPoint] : []),
            ])
          : filterRoutePoints(
              originPoint,
              destinationPoint,
              coordinateWaypointPoints.length > 0
                ? coordinateWaypointPoints
                : searchedWaypointPoints.filter((point): point is KakaoPoint => point !== null),
            );
        const routeStartPoint = originPoint ?? routePoints[0];
        const routeEndPoint = destinationPoint ?? routePoints.at(-1);

        if (cancelled) {
          return;
        }

        const initialCenter =
          routeStartPoint && routeEndPoint
            ? calculateMidpoint(routeStartPoint, routeEndPoint)
            : routeStartPoint ?? routeEndPoint ?? { lat: 37.5665, lng: 126.978 };

        const map = new kakao.Map(container, {
          center: new kakao.LatLng(initialCenter.lat, initialCenter.lng),
          level: routeStartPoint && routeEndPoint ? 9 : 6,
          draggable: true,
          disableDoubleClickZoom: false,
          scrollwheel: true,
        });

        mapRef.current = map;
        map.setDraggable(true);
        map.setZoomable(true);

        if (routeStartPoint) {
          originMarkerRef.current = new kakao.Marker({
            map,
            position: new kakao.LatLng(routeStartPoint.lat, routeStartPoint.lng),
            image: markerImageStart,
          });
        }

        if (routeEndPoint) {
          destinationMarkerRef.current = new kakao.Marker({
            map,
            position: new kakao.LatLng(routeEndPoint.lat, routeEndPoint.lng),
            image: markerImageEnd,
          });
        }

        if (routePoints.length >= 2) {
          const line = new kakao.Polyline({
            map,
            path: routePoints.map((point) => new kakao.LatLng(point.lat, point.lng)),
            strokeWeight: 4,
            strokeColor: '#4FAE98',
            strokeOpacity: 0.9,
            strokeStyle: 'solid',
          });

          polylineRef.current = line;

          const bounds = new kakao.LatLngBounds();
          routePoints.forEach((point) => {
            bounds.extend(new kakao.LatLng(point.lat, point.lng));
          });
          map.setBounds(bounds);

          const distance = resolveDistance(routePoints[0], routePoints[routePoints.length - 1]);
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
    <View ref={mapContainerRef} style={[styles.container, KAKAO_MAP_INTERACTION_STYLE, style]}>
      {mapReady ? (
        <View style={styles.zoomControls}>
          <Pressable
            accessibilityLabel="지도 확대"
            accessibilityRole="button"
            onPress={handleZoomIn}
            style={({ pressed }) => [styles.zoomButton, pressed && styles.zoomButtonPressed]}
          >
            <CustomText style={styles.zoomButtonText}>+</CustomText>
          </Pressable>
          <View style={styles.zoomDivider} />
          <Pressable
            accessibilityLabel="지도 축소"
            accessibilityRole="button"
            onPress={handleZoomOut}
            style={({ pressed }) => [styles.zoomButton, pressed && styles.zoomButtonPressed]}
          >
            <CustomText style={styles.zoomButtonText}>-</CustomText>
          </Pressable>
        </View>
      ) : null}
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
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(234, 241, 247, 0.35)',
  },
  zoomButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  zoomButtonPressed: {
    backgroundColor: '#F1F4F7',
  },
  zoomButtonText: {
    color: '#1F2428',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
  },
  zoomControls: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E1E7EC',
    borderRadius: 10,
    borderWidth: 1,
    boxShadow: '0 4px 10px rgba(15, 23, 42, 0.14)',
    overflow: 'hidden',
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 20,
  },
  zoomDivider: {
    backgroundColor: '#E1E7EC',
    height: 1,
    width: '100%',
  },
});

@AGENTS.md

# Koready-app 프로젝트 가이드 (for Claude Code)

이 문서는 Claude Code가 이 프로젝트의 기술 스택, 폴더 구조, 코딩 가이드 및 맥북 개발 환경을 정확하게 이해하고 준수할 수 있도록 돕는 전용 가이드라인입니다.

## 1. 프로젝트 개요 및 기술 스택
- 종류: React Native 크로스플랫폼 여행 애플리케이션
- 환경: Expo SDK (macOS 개발 환경)
- 주요 라이브러리:
  - 내비게이션: Expo Router
  - 상태 관리: Zustand
  - 서버 통신: Axios

## 2. 개발 및 빌드 명령어
패키지 버전 충돌을 방지하기 위해 일반 `npm` 대신 항상 `npx expo` 관련 명령어를 우선적으로 사용해야 합니다.

- 의존성 설치: `npx expo install <package-name>`
- 로컬 개발 서버 구동: `npx expo start`
- iOS 시뮬레이터 실행: `npm run ios` 또는 `npx expo run:ios`
- 안드로이드 에뮬레이터 실행: `npm run android` 또는 `npx expo run:android`
- Metro 번들러만 열어 둘 때: `npx expo start`
- 우회 터널 구동 (연결 오류 발생 시): `npx expo start --tunnel`
- 빌드 시스템: Expo EAS Build 활용

## 3. 폴더 구조 가이드
주요 소스코드는 `src/` 폴더 내부에 격리하여 관리합니다. 코드를 새로 생성하거나 참조할 때 이 구조를 철저히 따르세요.

```text
src/
├── api/          # Axios 인스턴스 및 API 요청 함수
├── components/   # 공통 재사용 컴포넌트 (버튼, 인풋 등)
├── navigation/   # React Navigation 설정 (AppNavigator, Stacks)
├── screens/      # 각 화면 컴포넌트 (Login, Onboarding, Home 등)
└── store/        # Zustand 전역 상태 관리 스토어

## 4. 코딩 규칙 및 스타일 가이드
언어 및 컴포넌트: TypeScript 기반의 함수형 컴포넌트 (export default function)를 필수 사용합니다.
스타일링: StyleSheet.create를 활용한 인라인 스타일 분리 방식을 사용합니다.
네비게이션 개발 프로세스:
피그마 UI 페이지 디자인이 완전히 반영되기 전에, src/screens에 텍스트와 이동 버튼만 있는 단순 깡통 화면을 먼저 만듭니다.
src/navigation에서 전체적인 라우팅 및 스택 뼈대를 먼저 구축하고 정상 작동 여부를 확인한 후 세부 UI 작업을 착수합니다.
상태 관리 규칙: 온보딩(3~4개 화면)을 거치며 누적되는 여행 성향 데이터는 Zustand 전역 스토어(src/store)에서 손실 없이 안전하게 관리합니다.

앱 내 모든 스타일(배경색, 텍스트 색상, 컴포넌트 색상 등)을 지정할 때는 색상 값을 하드코딩하지 마십시오.
반드시 src/constants/colors.ts에 정의된 Palette 상수 객체를 가져와서 참조하고, 만약 색상이 없다면 Palette에서 새로운 상수를 만들어서 참조하시오. (예: backgroundColor: Palette.primary, color: Palette.text)

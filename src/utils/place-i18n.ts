import type { LanguageCode } from '@/api/types';

const REGION_LABELS: Record<LanguageCode, Record<string, string>> = {
  KO: {
    SEOUL: '서울',
    GYEONGGI: '경기도',
    GANGWON: '강원도',
    CHUNGCHEONG: '충청도',
    JEOLLA: '전라도',
    GYEONGSANG: '경상도',
    JEJU: '제주도',
  },
  EN: {
    SEOUL: 'Seoul',
    GYEONGGI: 'Gyeonggi',
    GANGWON: 'Gangwon',
    CHUNGCHEONG: 'Chungcheong',
    JEOLLA: 'Jeolla',
    GYEONGSANG: 'Gyeongsang',
    JEJU: 'Jeju',
  },
};

const TRAVEL_STYLE_LABELS: Record<LanguageCode, Record<string, string>> = {
  KO: {
    LOCAL_FOOD: '로컬 맛집',
    LOCAL_FESTIVAL: '지역 축제',
    TRADITIONAL_MARKET: '전통시장',
    CULTURE_EXPERIENCE: '문화체험',
    NATURE: '자연 명소',
    EXHIBITION_MUSEUM: '전시/미술관',
    DRAMA_LOCATION: '드라마 촬영지',
  },
  EN: {
    LOCAL_FOOD: 'Local Food',
    LOCAL_FESTIVAL: 'Local Festival',
    TRADITIONAL_MARKET: 'Traditional Market',
    CULTURE_EXPERIENCE: 'Cultural Experience',
    NATURE: 'Nature',
    EXHIBITION_MUSEUM: 'Exhibitions & Museums',
    DRAMA_LOCATION: 'Drama Filming Sites',
  },
};

const PLACE_TITLE_TRANSLATIONS_EN: Record<string, string> = {
  '서울 봄꽃축제': 'Seoul Spring Flower Festival',
  경복궁: 'Gyeongbokgung Palace',
  국립중앙박물관: 'National Museum of Korea',
  서울식물원: 'Seoul Botanic Park',
  '성수동 서울숲': 'Seongsu-dong Seoul Forest',
  '예술의 전당': 'Seoul Arts Center',
  'N서울타워(남산타워)': 'N Seoul Tower (Namsan Tower)',
  '홍이네떡볶이': 'Hongi Tteokbokki',
  '원조민속순대타운': 'Wonjo Sundae Town',
  '수락 휴': 'Surak Hyu',
  수원화성: 'Suwon Hwaseong Fortress',
  '양평 두물머리': 'Yangpyeong Dumulmeori',
  광명동굴: 'Gwangmyeong Cave',
  한국민속촌: 'Korean Folk Village',
  '국립현대미술관 과천': 'National Museum of Modern and Contemporary Art, Gwacheon',
  '파주 임진각': 'Imjingak',
  '연천 오일장': 'Yeoncheon Oil Market',
  '빵과당신': 'Bread and You',
  루덴시아: 'Ludensia',
  벗골도토리막국수: 'Beotgol Acorn Makguksu',
  '남양주 봉선사': 'Bongseonsa Temple',
  '공주 공산성': 'Gongju Gongsanseong Fortress',
  '안면도 꽃지해변': 'Anmyeondo Kkotji Beach',
  '천안 독립기념관': 'Cheonan Independence Hall',
  '부여 궁남지': 'Buyeo Gungnamji Pond',
  온양온천: 'Onyang Hot Springs',
  '영동 와인터널': 'Yeongdong Wine Tunnel',
  '옥천 강대박': 'Okcheon Gangdaebak',
  '충주 아쿠아리움': 'Chungju Aquarium',
  '전주 한옥마을': 'Jeonju Hanok Village',
  '목포 해상케이블카': 'Mokpo Marine Cable Car',
  '담양 죽녹원': 'Damyang Bamboo Garden',
  '광주 국립아시아문화전당': 'Gwangju Asia Culture Center',
  '순천만 국가정원': 'Suncheon Bay National Garden',
  '광양 매화마을': 'Gwangyang Plum Village',
  '보성 녹차밭': 'Boseong Green Tea Fields',
  '고창 고인돌 유적': 'Gochang Dolmen Site',
  '무주 구천동계곡': 'Muju Gucheon-dong Valley',
  '영광 법성포 굴비거리': 'Yeonggwang Beopseongpo Gulbi Street',
  '남원 명문 제과': 'Namwon Myeongmun Bakery',
  '설악산 국립공원': 'Seoraksan National Park',
  '강릉 경포해변': 'Gangneung Gyeongpo Beach',
  '안목해변 커피거리': 'Anmok Beach Coffee Street',
  '속초 관광수산시장': 'Sokcho Tourist & Fish Market',
  '정동심곡 바다부채길': 'Jeongdong-Simgok Sea Trail',
  '화천 산천어 축제': 'Hwacheon Sancheoneo Festival',
  '대관령 양떼 목장': 'Daegwallyeong Sheep Ranch',
  '영월 청령포': 'Yeongwol Cheongnyeongpo',
  '춘천 유포리 막국수': 'Chuncheon Yupori Makguksu',
  '원주 반계리 은행나무': 'Wonju Bangye-ri Ginkgo Tree',
  '경주 첨성대': 'Cheomseongdae',
  '경주 석굴암': 'Seokguram',
  '부산 광안대교': 'Gwangandaegyo Bridge',
  '대구 서문시장': 'Daegu Seomun Market',
  '울산 태화강 국가정원': 'Taehwa River National Garden',
  '안동 하회마을': 'Hahoe Village',
  '통영 동피랑 벽화마을': 'Tongyeong Dongpirang Mural Village',
  '김천 김밥축제': 'Gimcheon Gimbap Festival',
  '영양 자작나무숲': 'Yeongyang Birch Forest',
  '하동 술상 전어마을': 'Hadong Sulsang Jeoneo Village',
  '함양 대봉스카이랜드': 'Hamyang Daebong Sky Land',
  '상주 카페 골감': 'Sangju Cafe Golgam',
  한라산: 'Hallasan',
  성산일출봉: 'Seongsan Ilchulbong',
  우도: 'Udo',
  '숙성도 제주본점': 'Suksungdo Jeju Main Branch',
  '아베베베이커리': 'Abebe Bakery',
  '협재 해수욕장': 'Hyeopjae Beach',
  카멜리아힐: 'Camellia Hill',
  제주올레길: 'Jeju Olle Trail',
  천지연폭포: 'Cheonjiyeon Waterfall',
  '장인의 집': 'House of Artisans',
  직지사: 'Jikjisa Temple',
  사명대사공원: 'Samyeongdaesa Park',
  김천시립박물관: 'Gimcheon Municipal Museum',
};

export function formatPlaceRegionName(serviceRegionCode: string, language: LanguageCode) {
  return REGION_LABELS[language][serviceRegionCode] ?? serviceRegionCode;
}

export function formatPlaceTravelStyle(travelStyle: string, language: LanguageCode) {
  return TRAVEL_STYLE_LABELS[language][travelStyle] ?? travelStyle;
}

export function formatPlaceTitle(title: string, language: LanguageCode) {
  if (language === 'EN') {
    return PLACE_TITLE_TRANSLATIONS_EN[title] ?? title;
  }

  return title;
}

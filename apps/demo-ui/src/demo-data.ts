export type SourceStatus = "ok" | "cached" | "fallback";

export type PublicDataSource = {
  id: string;
  provider: string;
  dataset: string;
  serviceType: "REST" | "SOAP" | "RSS" | "FILE";
  format: "JSON" | "XML" | "CSV";
  status: SourceStatus;
  lastUpdated: string;
  rows: number;
};

export type Metric = {
  label: string;
  value: string;
  delta: string;
  tone: "blue" | "green" | "orange";
};

export type DataColumn = {
  key: string;
  label: string;
};

export type GenUITable = {
  title: string;
  columns: DataColumn[];
  rows: Record<string, string>[];
};

export type ToolTrace = {
  tool: string;
  label: string;
  status: SourceStatus;
  durationMs: number;
};

export type ServiceAction = {
  id: string;
  title: string;
  description: string;
  category: "민원서비스" | "혜택알리미" | "생활" | "정책정보";
  actionLabel: string;
  status: SourceStatus;
};

export type SearchSuggestion = {
  label: string;
  query: string;
};

export type GatewayContract = {
  input: string[];
  blocks: string[];
  guarantees: string[];
};

export type DemoScenario = {
  id: string;
  label: string;
  query: string;
  intent: string;
  answer: string;
  suggestions: SearchSuggestion[];
  services: ServiceAction[];
  metrics: Metric[];
  table: GenUITable;
  sources: PublicDataSource[];
  toolTrace: ToolTrace[];
  caveats: string[];
  contract: GatewayContract;
};

export const demoScenarios: DemoScenario[] = [
  {
    id: "life-safety-briefing",
    label: "생활·안전 브리핑",
    query: "오늘 서울에서 외출 전에 확인해야 할 공공 정보를 한 화면으로 보여줘",
    intent: "지역 생활 안전 상태 요약",
    answer:
      "서울 외출 전 확인할 항목은 대기 상태, 생활안전 안내, 가까운 공공 편의시설입니다. 실시간성 API는 실패 가능성이 있어 캐시와 출처 상태를 함께 표시합니다.",
    suggestions: [
      { label: "생활안전", query: "우리 동네 생활안전 공지와 대피 정보를 알려줘" },
      { label: "대기정보", query: "오늘 미세먼지와 야외활동 주의사항을 요약해줘" },
      { label: "시설찾기", query: "가까운 공공시설과 운영 정보를 보여줘" }
    ],
    services: [
      {
        id: "safety-news",
        title: "생활안전 안내",
        description: "재난 RSS와 생활안전 공지를 묶어 현재 주의할 정보를 보여줍니다.",
        category: "생활",
        actionLabel: "안전정보 보기",
        status: "cached"
      },
      {
        id: "air-quality-service",
        title: "대기정보 조회",
        description: "측정소 기반 대기오염 API를 정규화해 외출 전 확인 카드로 만듭니다.",
        category: "민원서비스",
        actionLabel: "조회하기",
        status: "ok"
      },
      {
        id: "nearby-public-facility",
        title: "공공시설 찾기",
        description: "표준데이터 위치 정보를 이용해 주변 시설 후보를 안내합니다.",
        category: "정책정보",
        actionLabel: "후보 보기",
        status: "ok"
      }
    ],
    metrics: [
      { label: "연결된 API", value: "4개", delta: "REST 3 · RSS 1", tone: "blue" },
      { label: "정상 응답", value: "3개", delta: "1개 cached", tone: "green" },
      { label: "출처 갱신", value: "오늘", delta: "2개 데이터셋", tone: "orange" }
    ],
    table: {
      title: "외출 전 확인 항목",
      columns: [
        { key: "area", label: "분야" },
        { key: "summary", label: "요약" },
        { key: "action", label: "권장 행동" }
      ],
      rows: [
        { area: "대기", summary: "미세먼지·초미세먼지 상태 확인 필요", action: "야외 활동 전 최신 측정값 재확인" },
        { area: "안전", summary: "생활안전 공지와 재난 RSS를 함께 조회", action: "경보 발생 시 공식 안내 우선" },
        { area: "시설", summary: "공공시설 위치 API로 가까운 이용 가능 지점 후보화", action: "운영시간과 휴무일 확인" }
      ]
    },
    sources: [
      {
        id: "air-quality",
        provider: "한국환경공단",
        dataset: "대기오염정보 조회 서비스",
        serviceType: "REST",
        format: "JSON",
        status: "ok",
        lastUpdated: "2026-05-26",
        rows: 25
      },
      {
        id: "safety-rss",
        provider: "행정안전부",
        dataset: "국민재난안전포털 RSS",
        serviceType: "RSS",
        format: "XML",
        status: "cached",
        lastUpdated: "2026-05-26",
        rows: 8
      },
      {
        id: "health-center",
        provider: "공공데이터포털",
        dataset: "전국건강증진센터표준데이터",
        serviceType: "FILE",
        format: "CSV",
        status: "ok",
        lastUpdated: "2026-05-22",
        rows: 12
      }
    ],
    toolTrace: [
      { tool: "search_openapi", label: "생활안전 후보 API 검색", status: "ok", durationMs: 184 },
      { tool: "fetch_public_api", label: "대기·안전·시설 데이터 호출", status: "cached", durationMs: 712 },
      { tool: "compose_genui", label: "요약 카드와 표 schema 생성", status: "ok", durationMs: 96 }
    ],
    caveats: ["실시간 경보는 공식 포털 최종 확인 필요", "인증키 미발급 API는 mock 응답으로 대체"],
    contract: {
      input: ["query", "region", "timeWindow", "sourcePolicy"],
      blocks: ["summary", "metricCards", "serviceActions", "dataTable", "sources", "toolTrace"],
      guarantees: ["출처 상태 표시", "실패 API fallback", "민감정보 미수집"]
    }
  },
  {
    id: "welfare-finder",
    label: "복지·서비스 탐색",
    query: "부산에 사는 65세 이상 장애인 관련 공공서비스와 시설 후보를 정리해줘",
    intent: "지역 복지 서비스 후보 탐색",
    answer:
      "부산 지역의 고령 장애인 현황 데이터와 공공시설 표준데이터를 조합해 서비스 후보를 정리했습니다. 개인 자격 판정이 아니라, 확인해야 할 공식 창구를 좁히는 화면입니다.",
    suggestions: [
      { label: "간편찾기", query: "나이와 지역으로 가능한 복지 서비스를 좁혀줘" },
      { label: "시설찾기", query: "가까운 복지시설과 상담 창구를 보여줘" },
      { label: "확인서류", query: "신청 전 확인해야 할 조건과 서류를 알려줘" }
    ],
    services: [
      {
        id: "activity-support",
        title: "장애인 활동지원",
        description: "지역·연령·장애 등록 현황을 기반으로 확인해야 할 신청 경로를 제시합니다.",
        category: "혜택알리미",
        actionLabel: "조건 확인",
        status: "ok"
      },
      {
        id: "health-counseling",
        title: "건강증진센터 상담",
        description: "공공시설 표준데이터를 이용해 가까운 상담 가능 지점을 안내합니다.",
        category: "생활",
        actionLabel: "시설 보기",
        status: "ok"
      },
      {
        id: "local-care",
        title: "지역 돌봄 서비스",
        description: "복지시설 API 실패 시에도 mock fallback으로 후보 화면을 유지합니다.",
        category: "민원서비스",
        actionLabel: "대체 결과",
        status: "fallback"
      }
    ],
    metrics: [
      { label: "지역 필터", value: "부산", delta: "행정동 단위 후보", tone: "blue" },
      { label: "복지 데이터", value: "2종", delta: "현황 + 시설", tone: "green" },
      { label: "확인 필요", value: "3개", delta: "소득·등급·거주", tone: "orange" }
    ],
    table: {
      title: "서비스 후보와 확인 지점",
      columns: [
        { key: "program", label: "후보" },
        { key: "basis", label: "근거 데이터" },
        { key: "next", label: "다음 확인" }
      ],
      rows: [
        { program: "장애인 활동지원", basis: "연령·지역·장애 등록 현황", next: "주민센터 또는 복지로 신청 조건" },
        { program: "건강증진센터 상담", basis: "전국건강증진센터표준데이터", next: "가까운 센터 운영시간" },
        { program: "지역 돌봄 서비스", basis: "부산 지역 사회복지 데이터", next: "대상자 세부 기준" }
      ]
    },
    sources: [
      {
        id: "busan-disabled-senior",
        provider: "부산광역시",
        dataset: "만 65세이상 장애인 등록현황",
        serviceType: "FILE",
        format: "CSV",
        status: "ok",
        lastUpdated: "2026-05-22",
        rows: 16
      },
      {
        id: "welfare-facility",
        provider: "공공데이터포털",
        dataset: "사회복지시설 표준데이터",
        serviceType: "REST",
        format: "JSON",
        status: "fallback",
        lastUpdated: "2026-05-22",
        rows: 0
      }
    ],
    toolTrace: [
      { tool: "normalize_rows", label: "부산 현황 CSV 정규화", status: "ok", durationMs: 221 },
      { tool: "fetch_public_api", label: "복지시설 API 호출", status: "fallback", durationMs: 1000 },
      { tool: "compose_genui", label: "후보·확인 지점 화면 생성", status: "ok", durationMs: 118 }
    ],
    caveats: ["민감한 개인 식별정보는 입력하지 않음", "자격 확정은 공식 기관 확인 필요"],
    contract: {
      input: ["query", "region", "ageRange", "interestCategory"],
      blocks: ["summary", "serviceActions", "eligibilityTable", "sources", "safetyNotice"],
      guarantees: ["자격 확정 표현 금지", "공식 신청 경로 분리", "누락 조건 표시"]
    }
  },
  {
    id: "trade-insight",
    label: "무역 데이터 분석",
    query: "관세청 수출입 API를 묶어서 국가별·품목별 변화가 보이게 정리해줘",
    intent: "관세청 멀티 API 분석",
    answer:
      "품목별, 국가별, 시도별 수출입 실적 API를 같은 단위로 정규화해 비교 가능한 표와 지표를 만들었습니다. GenUI는 분석 질문에 맞춰 차트 또는 테이블을 선택합니다.",
    suggestions: [
      { label: "품목분석", query: "HS Code 기준 수출입 변화가 큰 품목을 찾아줘" },
      { label: "국가비교", query: "국가별 수출입 실적을 비교해줘" },
      { label: "지역랭킹", query: "시도별 수출입 상위 품목을 보여줘" }
    ],
    services: [
      {
        id: "customs-item-service",
        title: "품목별 수출입실적",
        description: "HS Code 단위의 수출입 데이터를 분석 카드와 표로 렌더링합니다.",
        category: "정책정보",
        actionLabel: "품목 보기",
        status: "ok"
      },
      {
        id: "customs-country-service",
        title: "국가별 수출입 비교",
        description: "국가·품목 축을 결합해 비교 가능한 정부 통계 화면을 생성합니다.",
        category: "정책정보",
        actionLabel: "비교하기",
        status: "ok"
      },
      {
        id: "customs-region-service",
        title: "시도별 무역 현황",
        description: "지역 단위 표준 필드로 랭킹형 GenUI를 구성할 수 있습니다.",
        category: "민원서비스",
        actionLabel: "지역 보기",
        status: "ok"
      }
    ],
    metrics: [
      { label: "관세청 API", value: "3개", delta: "품목·국가·지역", tone: "blue" },
      { label: "정규화 단위", value: "USD", delta: "수출 FOB · 수입 CIF", tone: "green" },
      { label: "공표 주기", value: "월간", delta: "매월 15일경", tone: "orange" }
    ],
    table: {
      title: "관세청 API 조합 결과",
      columns: [
        { key: "api", label: "API" },
        { key: "dimension", label: "분석 축" },
        { key: "output", label: "GenUI 출력" }
      ],
      rows: [
        { api: "품목별 수출입실적", dimension: "HS Code", output: "품목별 증감 카드" },
        { api: "품목별 국가별 수출입실적", dimension: "국가 + HS Code", output: "국가 비교 표" },
        { api: "시도별 품목별 수출입실적", dimension: "지역 + 품목", output: "지역 랭킹 차트" }
      ]
    },
    sources: [
      {
        id: "customs-item-country",
        provider: "관세청",
        dataset: "품목별 국가별 수출입실적(GW)",
        serviceType: "REST",
        format: "XML",
        status: "ok",
        lastUpdated: "2026-05-22",
        rows: 30
      },
      {
        id: "customs-region-item",
        provider: "관세청",
        dataset: "시도별 품목별 수출입실적(GW)",
        serviceType: "REST",
        format: "XML",
        status: "ok",
        lastUpdated: "2026-05-22",
        rows: 17
      },
      {
        id: "customs-item",
        provider: "관세청",
        dataset: "품목별 수출입실적(GW)",
        serviceType: "REST",
        format: "XML",
        status: "ok",
        lastUpdated: "2026-05-22",
        rows: 24
      }
    ],
    toolTrace: [
      { tool: "fetch_public_api", label: "관세청 XML API 3종 호출", status: "ok", durationMs: 843 },
      { tool: "normalize_rows", label: "HS Code·국가·지역 필드 정렬", status: "ok", durationMs: 177 },
      { tool: "compose_genui", label: "분석형 테이블 schema 생성", status: "ok", durationMs: 103 }
    ],
    caveats: ["실제 통계 해석에는 기간 파라미터 고정 필요", "금액·중량 단위를 UI에 명시해야 함"],
    contract: {
      input: ["query", "period", "dimension", "unit"],
      blocks: ["summary", "metricCards", "analysisTable", "sourceList", "toolTrace"],
      guarantees: ["단위 명시", "기간 파라미터 표시", "원본 API 출처 유지"]
    }
  }
];

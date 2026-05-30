export type SourceStatus = "ok" | "cached" | "fallback";

export type PublicDataSource = {
  id: string;
  provider: string;
  dataset: string;
  href?: string;
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

export type ServiceResult = {
  id: string;
  title: string;
  description: string;
  agency: string;
  methods: string[];
  fee: string;
  ctaLabel: string;
  href?: string;
  icon?: string;
  status: SourceStatus;
};

export type ApplicationStep = {
  title: string;
  description: string;
  action?: string;
};

export type ApplicationGuide = {
  title: string;
  category: string;
  eligibility: string;
  period: string;
  requiredDocuments: string[];
  steps: ApplicationStep[];
  relatedLinks: string[];
};

export type ToolTrace = {
  tool: string;
  label: string;
  note?: string;
  status: SourceStatus;
  durationMs: number;
};

export type ServiceAction = {
  id: string;
  title: string;
  description: string;
  icon?: string;
  category: "민원서비스" | "혜택알리미" | "생활" | "정책정보";
  actionLabel: string;
  href?: string;
  status: SourceStatus;
};

export type SearchSuggestion = {
  label: string;
  query: string;
  icon?: string;
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
  serviceResults: ServiceResult[];
  applicationGuide: ApplicationGuide;
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
        icon: "safety",
        category: "생활",
        actionLabel: "안전정보 보기",
        status: "cached"
      },
      {
        id: "air-quality-service",
        title: "대기정보 조회",
        description: "측정소 기반 대기오염 API를 정규화해 외출 전 확인 카드로 만듭니다.",
        icon: "air",
        category: "민원서비스",
        actionLabel: "조회하기",
        status: "ok"
      },
      {
        id: "nearby-public-facility",
        title: "공공시설 찾기",
        description: "표준데이터 위치 정보를 이용해 주변 시설 후보를 안내합니다.",
        icon: "facility",
        category: "정책정보",
        actionLabel: "후보 보기",
        status: "ok"
      }
    ],
    serviceResults: [
      {
        id: "outdoor-safety-brief",
        title: "생활안전 맞춤 안내",
        description: "재난 RSS, 생활안전 공지, 지역 시설 정보를 한 번에 확인하는 외출 전 안내입니다.",
        agency: "행정안전부",
        methods: ["인터넷", "모바일"],
        fee: "무료",
        ctaLabel: "안내 보기",
        icon: "safety",
        status: "cached"
      },
      {
        id: "air-quality-check",
        title: "대기오염정보 조회",
        description: "측정소 기준 미세먼지·초미세먼지 상태를 조회하고 활동 전 확인 항목을 제안합니다.",
        agency: "한국환경공단",
        methods: ["인터넷", "OpenAPI"],
        fee: "무료",
        ctaLabel: "조회하기",
        icon: "air",
        status: "ok"
      },
      {
        id: "public-facility-nearby",
        title: "공공시설 위치 찾기",
        description: "공공데이터 표준 위치 정보를 이용해 가까운 공공 편의시설 후보를 보여줍니다.",
        agency: "공공데이터포털",
        methods: ["인터넷", "지도"],
        fee: "무료",
        ctaLabel: "시설 찾기",
        icon: "facility",
        status: "ok"
      }
    ],
    applicationGuide: {
      title: "외출 전 공공 정보 확인 절차",
      category: "생활 > 생활안전",
      eligibility: "누구나 이용 가능",
      period: "즉시",
      requiredDocuments: ["없음"],
      steps: [
        { title: "지역과 시간대 확인", description: "사용자 질의에서 지역, 이동 시간, 관심 분야를 추출합니다.", action: "조건 확인" },
        { title: "공공 API 호출", description: "대기, 안전, 시설 API를 병렬 호출하고 실패한 API는 캐시로 대체합니다.", action: "출처 상태 표시" },
        { title: "GenUI 블록 생성", description: "요약, 민원 결과, 신청 안내, 출처 로그를 정부24형 컴포넌트로 변환합니다.", action: "화면 구성" }
      ],
      relatedLinks: ["생활안전", "대기정보", "공공시설"]
    },
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
        icon: "welfare",
        category: "혜택알리미",
        actionLabel: "조건 확인",
        status: "ok"
      },
      {
        id: "health-counseling",
        title: "건강증진센터 상담",
        description: "공공시설 표준데이터를 이용해 가까운 상담 가능 지점을 안내합니다.",
        icon: "health",
        category: "생활",
        actionLabel: "시설 보기",
        status: "ok"
      },
      {
        id: "local-care",
        title: "지역 돌봄 서비스",
        description: "복지시설 API 실패 시에도 mock fallback으로 후보 화면을 유지합니다.",
        icon: "benefit",
        category: "민원서비스",
        actionLabel: "대체 결과",
        status: "fallback"
      }
    ],
    serviceResults: [
      {
        id: "activity-support-result",
        title: "장애인 활동지원 신청 안내",
        description: "지역·연령 조건을 기준으로 신청 전 확인할 자격과 공식 창구를 정리합니다.",
        agency: "보건복지부",
        methods: ["인터넷", "방문"],
        fee: "무료",
        ctaLabel: "조건 확인",
        icon: "welfare",
        status: "ok"
      },
      {
        id: "health-center-result",
        title: "건강증진센터 상담",
        description: "전국건강증진센터 표준데이터에서 부산 지역 상담 가능 지점을 후보화합니다.",
        agency: "부산광역시",
        methods: ["전화", "방문"],
        fee: "기관별 상이",
        ctaLabel: "시설 보기",
        icon: "health",
        status: "ok"
      },
      {
        id: "local-care-result",
        title: "지역 돌봄 서비스",
        description: "복지시설 API 실패 시에도 fallback 후보를 유지하고 공식 확인 필요 상태를 표시합니다.",
        agency: "공공데이터포털",
        methods: ["인터넷", "방문"],
        fee: "대상별 상이",
        ctaLabel: "대체 결과",
        icon: "benefit",
        status: "fallback"
      }
    ],
    applicationGuide: {
      title: "복지 서비스 확인 절차",
      category: "혜택알리미 > 간편찾기",
      eligibility: "지역, 연령, 장애 등록 여부 등 조건 확인 필요",
      period: "기관 심사 기준에 따름",
      requiredDocuments: ["신분 확인 자료", "장애 등록 확인 자료", "소득·거주 조건 확인 자료"],
      steps: [
        { title: "비식별 조건 입력", description: "개인 식별정보 없이 지역, 연령대, 관심 분야만 사용합니다.", action: "조건 입력" },
        { title: "후보 서비스 매칭", description: "복지 현황과 시설 데이터를 결합해 공식 신청 경로를 좁힙니다.", action: "후보 확인" },
        { title: "기관 확인 분리", description: "자격 확정 표현은 피하고 주민센터·복지로 확인 항목을 안내합니다.", action: "공식 확인" }
      ],
      relatedLinks: ["복지로", "주민센터", "건강증진센터"]
    },
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
        icon: "policy",
        category: "정책정보",
        actionLabel: "품목 보기",
        status: "ok"
      },
      {
        id: "customs-country-service",
        title: "국가별 수출입 비교",
        description: "국가·품목 축을 결합해 비교 가능한 정부 통계 화면을 생성합니다.",
        icon: "search",
        category: "정책정보",
        actionLabel: "비교하기",
        status: "ok"
      },
      {
        id: "customs-region-service",
        title: "시도별 무역 현황",
        description: "지역 단위 표준 필드로 랭킹형 GenUI를 구성할 수 있습니다.",
        icon: "building",
        category: "민원서비스",
        actionLabel: "지역 보기",
        status: "ok"
      }
    ],
    serviceResults: [
      {
        id: "customs-item-result",
        title: "품목별 수출입실적(GW)",
        description: "HS Code 기준 수출입 금액과 중량을 조회해 품목별 증감 흐름을 보여줍니다.",
        agency: "관세청",
        methods: ["OpenAPI", "XML"],
        fee: "무료",
        ctaLabel: "품목 보기",
        icon: "policy",
        status: "ok"
      },
      {
        id: "customs-country-result",
        title: "품목별 국가별 수출입실적(GW)",
        description: "국가와 품목 축을 결합해 비교 가능한 표와 순위를 구성합니다.",
        agency: "관세청",
        methods: ["OpenAPI", "XML"],
        fee: "무료",
        ctaLabel: "비교하기",
        icon: "search",
        status: "ok"
      },
      {
        id: "customs-region-result",
        title: "시도별 품목별 수출입실적(GW)",
        description: "지역 단위 수출입 데이터를 랭킹형 GenUI 컴포넌트로 렌더링합니다.",
        agency: "관세청",
        methods: ["OpenAPI", "XML"],
        fee: "무료",
        ctaLabel: "지역 보기",
        icon: "building",
        status: "ok"
      }
    ],
    applicationGuide: {
      title: "관세청 멀티 API 분석 절차",
      category: "정책정보 > 무역 데이터 분석",
      eligibility: "공개 API 인증키 필요",
      period: "월간 공표 데이터 기준",
      requiredDocuments: ["공공데이터포털 활용신청 키", "분석 기간 파라미터"],
      steps: [
        { title: "분석 축 선택", description: "품목, 국가, 지역 중 비교 기준을 질의에서 추출합니다.", action: "축 선택" },
        { title: "API 응답 정규화", description: "관세청 XML 응답을 동일한 기간, 단위, HS Code 필드로 정렬합니다.", action: "정규화" },
        { title: "표·지표 생성", description: "기간과 단위를 명시한 분석 표, 지표 카드, 출처 로그를 생성합니다.", action: "결과 보기" }
      ],
      relatedLinks: ["공공데이터포털", "관세청", "HS Code"]
    },
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
  },
  {
    id: "newlywed-stability-surface",
    label: "신혼부부 안정성 브리핑",
    query:
      "[신혼부부] 대전 유성구로 이사 왔어요. 전입신고, 전세 계약 법적 체크, 우리 동네 생활 데이터를 한곳에서 확인하고 싶어요.",
    intent: "신혼부부 이사·전세·주거지원 안정성 확인",
    answer:
      "신혼부부 context는 정착 안정성을 우선합니다. 전입·확정일자, 임대차 법령 확인, 신혼·무주택 주거지원 후보, 보육·돌봄 생활권 데이터를 공식 handoff 중심으로 재배열합니다.",
    suggestions: [
      { label: "정착 안정성", query: "전입신고와 확정일자부터 안정화해줘", icon: "life" },
      { label: "전세 근거", query: "전세 계약 법적 체크와 실거래 근거를 보여줘", icon: "safety" },
      { label: "생활권", query: "보육·돌봄과 유성구 생활 데이터를 묶어줘", icon: "family" }
    ],
    services: [
      {
        id: "newlywed-move",
        title: "전입·확정일자 안정화",
        description: "전입신고와 임대차 안정성 확인 동선을 정부24와 법령정보로 분리합니다.",
        icon: "life",
        category: "민원서비스",
        actionLabel: "전입 확인",
        href: "https://www.gov.kr/portal/onestopSvc/happyMove",
        status: "ok"
      },
      {
        id: "newlywed-lease-law",
        title: "전세 대항력 체크",
        description: "대항력, 확정일자, 임대차보호법 확인은 법령정보 handoff로만 제공합니다.",
        icon: "safety",
        category: "생활",
        actionLabel: "법령 확인",
        href: "https://www.law.go.kr/",
        status: "ok"
      },
      {
        id: "newlywed-housing-data",
        title: "주거지원·생활권 후보",
        description: "신혼·무주택 주거지원과 유성구 생활 데이터 후보를 공공데이터 근거로 노출합니다.",
        icon: "family",
        category: "혜택알리미",
        actionLabel: "후보 보기",
        href: "https://www.data.go.kr/",
        status: "cached"
      }
    ],
    serviceResults: [
      {
        id: "newlywed-resident-move-result",
        title: "전입신고·확정일자 확인",
        description: "이사 직후 주소 이전과 임대차 안정성을 확인하는 정부24 중심 handoff입니다.",
        agency: "정부24",
        methods: ["인터넷", "방문"],
        fee: "무료",
        ctaLabel: "정부24로 이동",
        href: "https://www.gov.kr/portal/onestopSvc/happyMove",
        icon: "life",
        status: "ok"
      },
      {
        id: "newlywed-lease-law-result",
        title: "주택임대차 법령 체크",
        description: "전세 계약 관련 법령은 요약하지 않고 법령정보 공식 확인 경로로 분리합니다.",
        agency: "법령정보",
        methods: ["인터넷"],
        fee: "무료",
        ctaLabel: "법령정보 확인",
        href: "https://www.law.go.kr/",
        icon: "safety",
        status: "ok"
      },
      {
        id: "newlywed-housing-support-result",
        title: "신혼·무주택 주거지원 후보",
        description: "신혼부부 특별공급, 전세자금, 보육·돌봄 후보를 자격 확정 없이 확인 후보로 보여줍니다.",
        agency: "정부24·공공데이터포털",
        methods: ["인터넷", "공공데이터"],
        fee: "대상별 상이",
        ctaLabel: "후보 확인",
        href: "https://www.gov.kr/portal/main",
        icon: "family",
        status: "cached"
      }
    ],
    applicationGuide: {
      title: "신혼부부 정착 안정성 확인 절차",
      category: "생활 > 이사·주거 안정",
      eligibility: "신혼, 무주택, 거주지, 소득 등 공식 조건 확인 필요",
      period: "이사 직후 14일 이내 우선 확인",
      requiredDocuments: ["주민등록 관련 자료", "임대차 계약서", "혼인 및 세대 관련 확인 자료"],
      steps: [
        { title: "전입·확정일자 우선", description: "주소 이전과 임대차 안정성 관련 절차를 먼저 확인합니다.", action: "정부24 handoff" },
        { title: "임대차 법령 분리", description: "법적 체크는 law.go.kr 외부 링크로만 넘기고 inline 해석은 하지 않습니다.", action: "법령정보 handoff" },
        { title: "주거·돌봄 후보 확인", description: "주거지원과 생활권 데이터는 후보로만 보여주고 자격 확정 표현을 피합니다.", action: "후보 확인" }
      ],
      relatedLinks: ["정부24 전입신고", "법령정보", "공공데이터포털"]
    },
    metrics: [
      { label: "안정화 축", value: "4개", delta: "전입·임대차·주거·돌봄", tone: "blue" },
      { label: "공식 handoff", value: "3종", delta: "gov.kr · law.go.kr · data.go.kr", tone: "green" },
      { label: "자격 확정", value: "금지", delta: "candidate only", tone: "orange" }
    ],
    table: {
      title: "신혼부부 stability-first handoff map",
      columns: [
        { key: "priority", label: "우선순위" },
        { key: "check", label: "확인 항목" },
        { key: "handoff", label: "공식 handoff" }
      ],
      rows: [
        { priority: "정착 안정성", check: "전입신고, 확정일자, 전입세대 열람", handoff: "gov.kr / law.go.kr" },
        { priority: "주거 후보", check: "신혼부부 주거지원, 전세자금 후보", handoff: "gov.kr / data.go.kr" },
        { priority: "생활권", check: "보육·돌봄, 주변 생활 인프라", handoff: "gov.kr / data.go.kr" }
      ]
    },
    sources: [
      {
        id: "newlywed-gov24",
        provider: "정부24",
        dataset: "전입 및 이사 원스톱 서비스",
        href: "https://www.gov.kr/portal/onestopSvc/happyMove",
        serviceType: "REST",
        format: "JSON",
        status: "ok",
        lastUpdated: "2026-05-30",
        rows: 4
      },
      {
        id: "newlywed-law",
        provider: "법령정보",
        dataset: "주택임대차 관련 법령",
        href: "https://www.law.go.kr/",
        serviceType: "REST",
        format: "XML",
        status: "ok",
        lastUpdated: "2026-05-30",
        rows: 3
      },
      {
        id: "newlywed-data",
        provider: "공공데이터포털",
        dataset: "유성구 생활·주거 데이터 후보",
        href: "https://www.data.go.kr/",
        serviceType: "FILE",
        format: "CSV",
        status: "cached",
        lastUpdated: "2026-05-30",
        rows: 18
      }
    ],
    toolTrace: [
      {
        tool: "normalize_context",
        label: "신혼부부 라벨을 tenant + marriage + relocation으로 백킹",
        note: "신혼부부는 표현 라벨이며 persona enum 값이 아님",
        status: "ok",
        durationMs: 52
      },
      {
        tool: "rank_portal_entries",
        label: "stability-first card 순서 정적 연출",
        note: "실제 ranker 구현이 아니라 pretotype용 정적 trace",
        status: "ok",
        durationMs: 83
      },
      { tool: "compose_genui_artifact", label: "newlywed.html surface 선택", status: "ok", durationMs: 77 }
    ],
    caveats: ["추천은 후보이며 자격 확정이 아님", "법령정보는 외부 링크만 제공하고 inline 법령 해석은 하지 않음"],
    contract: {
      input: ["utterance", "contextLabel", "region", "lifeEvent", "sourcePolicy"],
      blocks: ["summary", "stabilityCards", "handoffLinks", "sourceTrace", "safetyNotice"],
      guarantees: ["공식 handoff 우선", "enum gap 공개", "자격 확정 표현 금지"]
    }
  },
  {
    id: "freelancer-deadline-surface",
    label: "프리랜서 마감 브리핑",
    query:
      "[프리랜서] 대전 유성구로 이사 왔어요. 5월 종합소득세와 사업장 주소 변경, 전입신고, 임대차 비용 증빙을 한 화면에서 확인하고 싶어요.",
    intent: "프리랜서 5월 세무·주소·증빙 deadline-first 확인",
    answer:
      "프리랜서 context는 5월 마감과 주소 변경을 우선합니다. 종합소득세, 사업장 주소, 전입신고, 임대차 비용·증빙을 홈택스와 정부24 handoff 중심으로 정리합니다.",
    suggestions: [
      { label: "세금 일정", query: "5월 종합소득세 마감부터 보여줘", icon: "tax" },
      { label: "주소 변경", query: "사업자 주소와 전입신고를 같이 확인해줘", icon: "building" },
      { label: "비용 증빙", query: "임대차 비용 처리와 증빙 리스크를 정리해줘", icon: "document" }
    ],
    services: [
      {
        id: "freelancer-tax",
        title: "5월 종합소득세 액션",
        description: "신고·납부 마감과 신고 항목을 홈택스 handoff로 우선 배치합니다.",
        icon: "tax",
        category: "민원서비스",
        actionLabel: "홈택스 확인",
        href: "https://www.hometax.go.kr/",
        status: "ok"
      },
      {
        id: "freelancer-address",
        title: "사업장 주소 변경",
        description: "사업자등록 주소 정정과 전입신고를 홈택스/정부24 handoff로 분리합니다.",
        icon: "building",
        category: "정책정보",
        actionLabel: "주소 확인",
        href: "https://www.gov.kr/portal/onestopSvc/happyMove",
        status: "ok"
      },
      {
        id: "freelancer-expense",
        title: "임대차 비용·증빙",
        description: "임대차 계약서, 계좌이체, 경비 처리 가능성은 법령정보와 홈택스에서 확인합니다.",
        icon: "document",
        category: "생활",
        actionLabel: "증빙 체크",
        href: "https://www.law.go.kr/",
        status: "cached"
      }
    ],
    serviceResults: [
      {
        id: "freelancer-tax-result",
        title: "종합소득세 신고·납부",
        description: "5월 신고 시즌에 가장 먼저 확인해야 할 홈택스 handoff입니다.",
        agency: "국세청 홈택스",
        methods: ["인터넷", "모바일"],
        fee: "무료",
        ctaLabel: "홈택스 이동",
        href: "https://www.hometax.go.kr/",
        icon: "tax",
        status: "ok"
      },
      {
        id: "freelancer-business-address-result",
        title: "사업장 주소 변경 확인",
        description: "사업자등록 주소와 거주지 이전 행정 처리를 분리해 확인합니다.",
        agency: "홈택스·정부24",
        methods: ["인터넷"],
        fee: "무료",
        ctaLabel: "주소 변경 확인",
        href: "https://www.gov.kr/portal/onestopSvc/happyMove",
        icon: "building",
        status: "ok"
      },
      {
        id: "freelancer-life-data-result",
        title: "업무 생활 인프라 데이터",
        description: "통신, 우편, 공공시설, 생활 인프라를 이사 후 업무 연속성 관점으로 확인합니다.",
        agency: "공공데이터포털",
        methods: ["인터넷", "공공데이터"],
        fee: "무료",
        ctaLabel: "데이터 확인",
        href: "https://www.data.go.kr/",
        icon: "facility",
        status: "cached"
      }
    ],
    applicationGuide: {
      title: "프리랜서 5월 마감 확인 절차",
      category: "민원서비스 > 세무·주소 변경",
      eligibility: "프리랜서 사업소득, 사업자등록 여부, 임대차 비용 처리 조건 확인 필요",
      period: "5월 종합소득세 신고 시즌 우선",
      requiredDocuments: ["사업소득 자료", "사업자등록 주소 자료", "임대차 계약서", "비용 증빙"],
      steps: [
        { title: "세무 마감 먼저", description: "5월 종합소득세 신고·납부 항목을 홈택스로 확인합니다.", action: "홈택스 handoff" },
        { title: "주소 변경 분리", description: "사업장 주소 변경과 거주지 전입신고를 별도 공식 경로로 확인합니다.", action: "주소 확인" },
        { title: "비용·증빙 점검", description: "임대차 비용과 증빙은 법령정보와 홈택스 확인 대상으로 분리합니다.", action: "증빙 체크" }
      ],
      relatedLinks: ["홈택스", "정부24", "법령정보", "공공데이터포털"]
    },
    metrics: [
      { label: "마감 기준", value: "5월", delta: "종소세 우선", tone: "orange" },
      { label: "공식 handoff", value: "4종", delta: "hometax · gov · law · data", tone: "blue" },
      { label: "제출 자동화", value: "없음", delta: "외부 이동만", tone: "green" }
    ],
    table: {
      title: "프리랜서 deadline-first handoff map",
      columns: [
        { key: "deadline", label: "마감/시점" },
        { key: "check", label: "확인 항목" },
        { key: "handoff", label: "공식 handoff" }
      ],
      rows: [
        { deadline: "5월", check: "종합소득세 신고·납부", handoff: "hometax.go.kr" },
        { deadline: "이사 직후", check: "사업장 주소 정정, 전입신고", handoff: "hometax.go.kr / gov.kr" },
        { deadline: "상시", check: "임대차 비용, 계약서, 계좌이체 증빙", handoff: "law.go.kr / data.go.kr" }
      ]
    },
    sources: [
      {
        id: "freelancer-hometax",
        provider: "국세청 홈택스",
        dataset: "종합소득세 신고 및 사업자 정보",
        href: "https://www.hometax.go.kr/",
        serviceType: "REST",
        format: "JSON",
        status: "ok",
        lastUpdated: "2026-05-30",
        rows: 5
      },
      {
        id: "freelancer-gov24",
        provider: "정부24",
        dataset: "전입 및 주소 변경 서비스",
        href: "https://www.gov.kr/portal/onestopSvc/happyMove",
        serviceType: "REST",
        format: "JSON",
        status: "ok",
        lastUpdated: "2026-05-30",
        rows: 4
      },
      {
        id: "freelancer-data",
        provider: "공공데이터포털",
        dataset: "유성구 생활 인프라 데이터 후보",
        href: "https://www.data.go.kr/",
        serviceType: "FILE",
        format: "CSV",
        status: "cached",
        lastUpdated: "2026-05-30",
        rows: 14
      }
    ],
    toolTrace: [
      {
        tool: "normalize_context",
        label: "프리랜서 context를 freelancer + relocation + tax_season으로 백킹",
        status: "ok",
        durationMs: 48
      },
      {
        tool: "rank_portal_entries",
        label: "deadline-first card 순서 정적 연출",
        note: "실제 ranker 구현이 아니라 pretotype용 정적 trace",
        status: "ok",
        durationMs: 75
      },
      { tool: "compose_genui_artifact", label: "freelancer.html surface 선택", status: "ok", durationMs: 71 }
    ],
    caveats: ["세무 판단과 비용 인정 여부는 홈택스와 전문가 확인 필요", "artifact 내부에서 신고·납부·제출을 수행하지 않음"],
    contract: {
      input: ["utterance", "contextLabel", "region", "season", "sourcePolicy"],
      blocks: ["summary", "deadlineCards", "handoffLinks", "sourceTrace", "safetyNotice"],
      guarantees: ["마감 우선 정렬", "공식 handoff 우선", "제출 자동화 금지"]
    }
  },
  {
    id: "postdoc-research-briefing",
    label: "박사후연구원 연구 브리핑",
    query:
      "[박사후연구원] 대전 유성구로 이사 왔어요. 전입신고와 전세 계약 법적 체크는 놓치지 않되, 대덕특구 연구기관·R&D 데이터·연구 착수 동선을 한곳에서 확인하고 싶어요.",
    intent: "대덕특구 연구 착수와 정착 데이터 브리핑",
    answer:
      "대전 유성구 정착 정보를 연구 착수 관점으로 재배열했습니다. 전입·임대차·세금은 보조 체크로 두고, 대덕연구개발특구의 연구기관 현황, 국가R&D 공개 데이터, 연구 인프라 탐색을 먼저 보여줍니다.",
    suggestions: [
      { label: "대덕특구", query: "대덕특구 연구기관과 연구개발비 흐름을 요약해줘", icon: "policy" },
      { label: "R&D 데이터", query: "국가R&D 과제·성과 공개 데이터를 연구 주제별로 찾아줘", icon: "search" },
      { label: "연구 정착", query: "연구실 출근 전에 전입·세금·전세 체크를 같이 정리해줘", icon: "education" }
    ],
    services: [
      {
        id: "daedeok-research-map",
        title: "대덕특구 연구기관 맵",
        description: "입주기관, 연구개발비, 연구인력 통계를 연구 주제 탐색용 표로 정리합니다.",
        icon: "education",
        category: "정책정보",
        actionLabel: "연구기관 보기",
        href: "https://www.innopolis.or.kr/",
        status: "cached"
      },
      {
        id: "ntis-rnd-data",
        title: "국가R&D 데이터 탐색",
        description: "NTIS 공개·개방 정책과 데이터 신청 흐름을 기준으로 과제·성과 확인 동선을 안내합니다.",
        icon: "search",
        category: "정책정보",
        actionLabel: "R&D 데이터 보기",
        href: "https://www.ntis.go.kr/",
        status: "ok"
      },
      {
        id: "researcher-settlement",
        title: "연구자 정착 체크",
        description: "전입신고, 연말정산 준비, 전세 계약 법적 체크를 연구 일정에 방해되지 않게 묶습니다.",
        icon: "life",
        category: "생활",
        actionLabel: "정착 체크",
        href: "https://www.gov.kr/portal/onestopSvc/happyMove",
        status: "ok"
      }
    ],
    serviceResults: [
      {
        id: "daedeok-research-zone-result",
        title: "대덕연구개발특구 연구 환경 브리핑",
        description: "연구개발특구진흥재단 통계자료를 기반으로 유성구 주변 연구기관·연구개발비·연구인력 흐름을 확인합니다.",
        agency: "연구개발특구진흥재단",
        methods: ["인터넷", "공개자료"],
        fee: "무료",
        ctaLabel: "연구 환경 보기",
        href: "https://www.innopolis.or.kr/",
        icon: "education",
        status: "cached"
      },
      {
        id: "ntis-open-data-result",
        title: "국가R&D 과제·성과 공개 데이터",
        description: "NTIS의 R&D 데이터 신청과 공개·개방 정책을 기준으로 과제, 성과, 시설·장비 데이터 확인 경로를 좁힙니다.",
        agency: "NTIS",
        methods: ["인터넷", "데이터 신청"],
        fee: "무료",
        ctaLabel: "R&D 데이터 확인",
        href: "https://www.ntis.go.kr/",
        icon: "search",
        status: "ok"
      },
      {
        id: "researcher-admin-result",
        title: "박사후연구원 정착 행정 체크",
        description: "전입신고, 임대차 법령 확인, 연말정산 준비를 연구 착수 일정 뒤에 숨기지 않고 보조 체크리스트로 유지합니다.",
        agency: "정부24·홈택스·법령정보",
        methods: ["인터넷", "공식 포털"],
        fee: "무료",
        ctaLabel: "행정 체크",
        href: "https://www.gov.kr/portal/onestopSvc/happyMove",
        icon: "life",
        status: "ok"
      }
    ],
    applicationGuide: {
      title: "대덕특구 연구 착수 체크 절차",
      category: "정책정보 > 연구개발특구·국가R&D",
      eligibility: "박사후연구원, 연구교원, 계약 연구자 등 소속기관 확인 필요",
      period: "입주·계약 직후 2주 이내 초기 확인",
      requiredDocuments: ["소속기관 계약 또는 재직 확인", "공공데이터포털·NTIS 계정", "전입 및 임대차 확인 자료"],
      steps: [
        {
          title: "연구 축 먼저 고정",
          description: "질의의 중심을 이사 행정이 아니라 연구 분야, 소속기관, 대덕특구 주변 연구 인프라로 잡습니다.",
          action: "연구 조건 확인"
        },
        {
          title: "R&D 공개 데이터 확인",
          description: "NTIS 과제·성과·시설 장비 공개 데이터에서 관심 연구 주제와 유사 과제를 탐색합니다.",
          action: "데이터 경로 보기"
        },
        {
          title: "정착 행정은 보조 체크",
          description: "전입신고, 연말정산, 전세 계약 법적 체크는 공식 포털 확인 대상으로 분리해 연구 브리핑을 흐리지 않게 합니다.",
          action: "행정 체크"
        }
      ],
      relatedLinks: ["대덕특구", "NTIS", "공공데이터포털", "정부24", "홈택스", "법령정보"]
    },
    metrics: [
      { label: "연구 초점", value: "3축", delta: "기관·과제·인프라", tone: "blue" },
      { label: "지역 범위", value: "유성구", delta: "대덕특구 중심", tone: "green" },
      { label: "행정 체크", value: "보조", delta: "전입·세금·임대차", tone: "orange" }
    ],
    table: {
      title: "박사후연구원용 연구 정착 데이터맵",
      columns: [
        { key: "researchAxis", label: "연구 축" },
        { key: "dataSignal", label: "확인 데이터" },
        { key: "nextAction", label: "다음 행동" }
      ],
      rows: [
        {
          researchAxis: "대덕특구 연구기관",
          dataSignal: "입주기관, 연구개발비, 연구인력, 특허·기술이전 통계",
          nextAction: "소속기관 주변 연구 네트워크와 협력 가능 기관 후보 확인"
        },
        {
          researchAxis: "국가R&D 과제·성과",
          dataSignal: "NTIS 과제, 성과물, 시설·장비 공개·개방 데이터",
          nextAction: "연구 주제 키워드로 유사 과제와 성과 흐름 탐색"
        },
        {
          researchAxis: "연구자 생활 기반",
          dataSignal: "유성구 교통·주거·생활 인프라 후보 데이터",
          nextAction: "출퇴근, 실험실 접근성, 임대차 확인 항목을 보조 체크"
        }
      ]
    },
    sources: [
      {
        id: "daedeok-innopolis-stats",
        provider: "연구개발특구진흥재단",
        dataset: "대덕연구개발특구 통계자료",
        href: "https://www.innopolis.or.kr/",
        serviceType: "FILE",
        format: "CSV",
        status: "cached",
        lastUpdated: "2026-05-30",
        rows: 9
      },
      {
        id: "ntis-rnd-open-data",
        provider: "NTIS",
        dataset: "R&D 데이터 신청 및 공개·개방 정책",
        href: "https://www.ntis.go.kr/",
        serviceType: "REST",
        format: "JSON",
        status: "ok",
        lastUpdated: "2026-05-30",
        rows: 12
      },
      {
        id: "yuseong-research-life-data",
        provider: "공공데이터포털",
        dataset: "대전 유성구 생활·교통·주거 표준데이터 후보",
        href: "https://www.data.go.kr/",
        serviceType: "FILE",
        format: "CSV",
        status: "cached",
        lastUpdated: "2026-05-30",
        rows: 18
      }
    ],
    toolTrace: [
      {
        tool: "normalize_context",
        label: "박사후연구원 라벨을 persona=salary_worker/data_user gap으로 백킹",
        note: "박사후연구원은 표현 라벨이며 persona enum 값이 아님",
        status: "ok",
        durationMs: 64
      },
      {
        tool: "fetch_public_api",
        label: "대덕특구·NTIS·유성구 생활 데이터 후보 조회",
        note: "pretotype에서는 live fetch 없이 정적 후보와 공식 handoff만 제공",
        status: "cached",
        durationMs: 690
      },
      {
        tool: "compose_genui",
        label: "연구기관·R&D 데이터 중심 data-table surface 생성",
        note: "rank_portal_entries는 실제 엔진이 아니라 정적 trace 연출",
        status: "ok",
        durationMs: 109
      }
    ],
    caveats: [
      "박사후연구원은 표현 라벨이며 persona enum 값이 아니므로 salary_worker/data_user 근사 백킹으로만 다룸",
      "연구비, 과제 참여, 장비 이용 자격은 소속기관과 전문기관 확인 필요",
      "전세 계약 법적 체크는 law.go.kr 외부 확인 대상으로만 두고 inline 법령 해석은 제공하지 않음"
    ],
    contract: {
      input: ["query", "contextLabel", "region", "researchArea", "sourcePolicy"],
      blocks: ["summary", "researchMetrics", "serviceActions", "researchDataTable", "sources", "toolTrace", "safetyNotice"],
      guarantees: ["연구 초점 우선", "enum gap 공개", "공식 출처 상태 표시", "자격 확정 표현 금지"]
    }
  }
];

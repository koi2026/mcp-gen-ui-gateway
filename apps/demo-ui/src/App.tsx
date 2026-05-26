import { useMemo, useState } from "react";
import { scenarioToGenUIResponse, type A2UIBlock } from "./a2ui";
import { demoScenarios, type SourceStatus } from "./demo-data";
import { Gov24Icon, type Gov24IconName } from "./gov24-components";
import "./styles.css";

const primaryNav = [
  {
    label: "민원서비스",
    active: true,
    menu: [
      ["민원 찾기", "필요한 민원과 발급 서비스를 검색하고 신청 화면으로 이동합니다"],
      ["주제별 보기", "주택, 복지, 세금 등 주제별로 민원을 탐색합니다"],
      ["행정서식 간편이름", "서식 명칭을 쉬운 이름으로 찾아볼 수 있습니다"],
      ["사실/진위확인", "증명서와 발급 문서의 진위 여부를 확인합니다"],
      ["원스톱서비스", "여러 민원을 한 번에 묶어 신청하는 흐름을 안내합니다"],
      ["기업/단체 서비스", "사업자와 기관 대상 민원 경로를 분리해 제공합니다"],
      ["돌봄시설 등 위치 찾기", "지역 기반 시설 후보를 지도형 UI로 연결합니다"],
      ["다운로드파일 진본확인", "정부24 다운로드 문서의 원본 여부를 확인합니다"]
    ]
  },
  {
    label: "혜택알리미",
    menu: [
      ["혜택알리미 홈", "몰라서 놓쳤던 혜택, 이제는 정부가 먼저 챙겨드립니다"],
      ["나의 혜택", "내가 받을 수 있는 혜택을 한 눈에 확인하세요"],
      ["관심", "내 상황과 연관된 혜택을 확인해보세요"],
      ["발견", "아직 몰랐던 숨은 혜택을 찾아드려요"],
      ["간편찾기", "선택한 상황 조건으로 빠르게 원하는 혜택을 찾아요"],
      ["전체 혜택", "분야별로 제공되는 모든 혜택을 한곳에서 확인해요"],
      ["설정", "가족등록, 맞춤안내 조건 등 서비스 이용 환경을 관리해요"]
    ]
  },
  {
    label: "생활",
    menu: [
      ["생활가이드", "이사, 출산, 사망 등 생애 이벤트별 필요한 서비스를 묶습니다"],
      ["생활안전", "재난, 대기, 안전 공지 등 생활 전 확인할 공공 정보를 모읍니다"]
    ]
  },
  {
    label: "정책정보",
    menu: [
      ["분야별 정책정보", "분야별 정책과 공공 데이터를 한 화면에서 탐색합니다"],
      ["정부/지자체 조직도", "기관과 부서 정보를 조직도 기준으로 확인합니다"],
      ["정부/지자체 누리집", "관련 기관 누리집으로 이동할 수 있는 목록을 제공합니다"]
    ]
  },
  {
    label: "고객센터",
    menu: [
      ["공지사항", "서비스 중단, 보안 안내, 주요 공지를 확인합니다"],
      ["이용안내", "전자정부 서비스 이용 절차와 도움말을 제공합니다"],
      ["자주 묻는 질문", "반복 문의를 빠르게 확인할 수 있습니다"],
      ["자료실", "서식과 안내 자료를 탐색합니다"],
      ["상담예약", "공식 상담 예약 경로로 연결합니다"],
      ["개선의견", "서비스 개선 의견을 남길 수 있습니다"],
      ["정부24 소개", "서비스 개요와 운영 정보를 확인합니다"],
      ["인증센터", "인증서 등록과 복합인증 관리를 안내합니다"],
      ["보안센터", "보안 프로그램과 개인정보 보호 정책을 제공합니다"]
    ]
  }
];
const topLinks = [
  { label: "For Foreigners", items: ["한국어", "English", "中文", "Guide"] },
  { label: "어린이", href: "#home" },
  { label: "시니어", href: "#home" },
  { label: "지원", items: ["인증등록/관리", "복합인증관리", "보안센터", "누리집 안내지도"] },
  { label: "화면크기", items: ["작게", "보통", "조금 크게", "크게", "초기화"] }
];
const quickServices: { label: string; icon: Gov24IconName; tone: "blue" | "green" | "orange" | "purple" }[] = [
  { label: "토지(임야)대장", icon: "document", tone: "orange" },
  { label: "주민등록등본(초본)", icon: "certificate", tone: "orange" },
  { label: "자동차등록원부", icon: "car", tone: "orange" },
  { label: "건축물대장", icon: "building", tone: "orange" },
  { label: "가족관계증명서", icon: "family", tone: "purple" },
  { label: "여권 재발급", icon: "passport", tone: "green" },
  { label: "지방세 납세증명", icon: "tax", tone: "orange" },
  { label: "납세증명", icon: "tax", tone: "orange" }
];
const guideItems: { label: string; icon: Gov24IconName; tone: "blue" | "green" | "pink" | "purple" | "gray" }[] = [
  { label: "이사", icon: "life", tone: "blue" },
  { label: "보건·복지", icon: "health", tone: "pink" },
  { label: "육아", icon: "family", tone: "green" },
  { label: "사망", icon: "welfare", tone: "gray" },
  { label: "입소", icon: "facility", tone: "purple" }
];
const loginServices: { label: string; icon: Gov24IconName }[] = [
  { label: "민원신청", icon: "civil" },
  { label: "전자증명", icon: "certificate" },
  { label: "혜택알리미", icon: "benefit" },
  { label: "생활정보", icon: "life" }
];
const notices = [
  "고유가 피해지원금 안내 · 1670-2626",
  "피싱 문자 및 공공기관 위장 사이트, 웹 주의 안내",
  "매크로 및 유사 프로그램 사용자 이용 제한 안내",
  "[국토교통부] 차세대 부동산종합공부시스템 전환에 따른..."
];
const footerShortcuts = [
  { title: "국민소통채널", items: ["국민비서 구삐", "상담예약", "개선의견"] },
  { title: "디지털증명", items: ["전자증명서", "공공 마이데이터", "다운로드파일 진본확인"] },
  { title: "부가서비스", items: ["무인민원발급", "어디서나민원", "돌봄시설 위치 찾기"] }
];

export function App() {
  const [activeScenarioId, setActiveScenarioId] = useState(demoScenarios[0].id);
  const [activeUtility, setActiveUtility] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"search" | "quick" | "login" | null>(null);
  const activeScenario = demoScenarios.find((scenario) => scenario.id === activeScenarioId) ?? demoScenarios[0];
  const response = useMemo(() => scenarioToGenUIResponse(activeScenario), [activeScenario]);

  const summary = response.blocks.find((block) => block.type === "hero-summary");
  const suggestions = response.blocks.find((block) => block.type === "search-suggestions");
  const services = response.blocks.find((block) => block.type === "service-actions");
  const metrics = response.blocks.find((block) => block.type === "metric-strip");
  const results = response.blocks.find((block) => block.type === "service-results");
  const applicationGuide = response.blocks.find((block) => block.type === "application-guide");
  const table = response.blocks.find((block) => block.type === "data-table");
  const sources = response.blocks.find((block) => block.type === "source-list");
  const diagnostics = response.blocks.find((block) => block.type === "tool-trace");
  const contract = response.blocks.find((block) => block.type === "gateway-contract");
  const notice = response.blocks.find((block) => block.type === "notice");

  return (
    <main className="g24-shell">
      <section className="g24-official" aria-label="공식 전자정부 안내">
        <div className="g24-container">
          <span className="korea-mark" aria-hidden="true" />
          <span>이 누리집은 대한민국 공식 전자정부 누리집입니다.</span>
          <em>GenUI mock</em>
        </div>
      </section>

      <header className="g24-header">
        <div className="g24-container header-main">
          <a className="g24-logo" href="#home" aria-label="정부24 홈">
            <span className="logo-swirl" aria-hidden="true" />
            <strong>정부24</strong>
            <i aria-hidden="true">+</i>
          </a>
          <div className="header-tools" aria-label="상단 부가 메뉴">
            <div className="top-links">
              {topLinks.map((link) => (
                link.items ? (
                  <div className="utility-menu" key={link.label}>
                    <button
                      aria-expanded={activeUtility === link.label}
                      onClick={() => setActiveUtility(activeUtility === link.label ? null : link.label)}
                      type="button"
                    >
                      {link.label}
                      <span aria-hidden="true">⌄</span>
                    </button>
                    {activeUtility === link.label && (
                      <div className="utility-popover" role="menu">
                        {link.items.map((item) => (
                          <button key={item} role="menuitem" type="button">{item}</button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <a href={link.href} key={link.label}>{link.label}</a>
                )
              ))}
            </div>
            <div className="account-links">
              <button type="button">정부24 AI</button>
              <button onClick={() => setActiveModal("search")} type="button">통합검색</button>
              <button onClick={() => setActiveModal("login")} type="button">로그인</button>
              <button onClick={() => setActiveModal("login")} type="button">회원가입</button>
            </div>
          </div>
        </div>
        <nav className="g24-nav" aria-label="주요 서비스">
          <div className="g24-container nav-inner">
            {primaryNav.map((item) => (
              <div className={`nav-item has-mega ${activeNav === item.label ? "open" : ""}`} key={item.label}>
                <button
                  aria-expanded={activeNav === item.label}
                  className={item.active ? "active" : ""}
                  onClick={() => setActiveNav(activeNav === item.label ? null : item.label)}
                  type="button"
                >
                  {item.label}
                  <span aria-hidden="true">{activeNav === item.label ? "⌃" : "⌄"}</span>
                </button>
                <MegaMenu columns={item.menu} label={item.label} />
              </div>
            ))}
          </div>
        </nav>
      </header>

      <section className="g24-main" id="home">
        <div className="g24-container home-grid">
          <section className="home-left">
            <SearchHero query={activeScenario.query} />
            <QuickServicePanel onOpenAll={() => setActiveModal("quick")} />
            <section className="lower-grid">
              <LifeGuidePanel suggestions={suggestions} />
              <OneStopPanel
                activeScenarioId={activeScenarioId}
                metrics={metrics}
                onScenarioChange={setActiveScenarioId}
                services={services}
              />
              <BenefitPanel services={services} />
            </section>
          </section>

          <aside className="home-right">
            <LoginPanel onLogin={() => setActiveModal("login")} />
            <RecentServicePanel />
            <NoticePanel />
            <CampaignPanel />
          </aside>
        </div>

        <div className="g24-container detail-grid" id="genui-result">
          <section className="detail-main">
            {summary && <BlockRenderer block={summary} />}
            {results && <BlockRenderer block={results} />}
            {applicationGuide && <BlockRenderer block={applicationGuide} />}
            {table && <BlockRenderer block={table} />}
            {sources && <BlockRenderer block={sources} />}
            {notice && <BlockRenderer block={notice} />}
          </section>
          <aside className="detail-side">
            {contract && <BlockRenderer block={contract} />}
            {diagnostics && <BlockRenderer block={diagnostics} />}
          </aside>
        </div>
        <FooterAccordion />
      </section>
      {activeModal && (
        <Gov24Modal modal={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </main>
  );
}

function MegaMenu({ columns, label }: { columns: string[][]; label: string }) {
  return (
    <section className="mega-menu" aria-label={`${label} 메뉴`}>
      <div className="g24-container mega-grid">
        {columns.map(([title, body]) => (
          <a href="#genui-result" key={title}>
            <strong>{title}</strong>
            <span>{body}</span>
          </a>
        ))}
      </div>
    </section>
  );
}

function SearchHero({ query }: { query: string }) {
  return (
    <section className="g24-search" aria-label="통합검색">
      <label className="search-pill">
        <span className="assistant-badge" aria-hidden="true">AI</span>
        <input value={query} readOnly aria-label="검색어" />
        <button type="button" aria-label="검색">⌕</button>
      </label>
    </section>
  );
}

function QuickServicePanel({ onOpenAll }: { onOpenAll: () => void }) {
  return (
    <section className="quick-panel" aria-label="자주 찾는 서비스">
      <div className="panel-title-row">
        <h2>자주 찾는 서비스</h2>
        <div className="panel-arrows" aria-label="자주 찾는 서비스 목록 제어">
          <button aria-label="자주 찾는 서비스 이전 목록" disabled type="button">‹</button>
          <button aria-label="자주 찾는 서비스 다음 목록" type="button">›</button>
          <button className="expand-control" onClick={onOpenAll} type="button">펼쳐보기 ⊞</button>
        </div>
      </div>
      <div className="quick-grid">
        {quickServices.map((service) => (
          <button key={service.label} type="button">
            <strong>{service.label}</strong>
            <Gov24Icon label={service.label} name={service.icon} size="sm" tone={service.tone} />
          </button>
        ))}
      </div>
    </section>
  );
}

function RecentServicePanel() {
  return (
    <section className="side-panel empty-state-panel" aria-label="최근에 본 서비스">
      <div className="panel-title-row">
        <h2>최근에 본 서비스</h2>
        <span aria-hidden="true">비회원</span>
      </div>
      <div className="empty-state-box">
        <Gov24Icon label="최근에 본 서비스" name="document" size="md" tone="gray" variant="circle" />
        <strong>최근에 본 서비스가 없습니다.</strong>
        <p>로그인하면 신청 내역과 관심 서비스를 이어서 확인할 수 있습니다.</p>
      </div>
    </section>
  );
}

function LoginPanel({ onLogin }: { onLogin: () => void }) {
  return (
    <section className="login-panel" aria-label="로그인 안내">
      <h2><strong>회원가입</strong>하고 아래 서비스를 편리하게 이용하세요.</h2>
      <div className="login-icons">
        {loginServices.map((item) => (
          <span key={item.label}>
            <Gov24Icon label={item.label} name={item.icon} size="md" variant="circle" />
            {item.label}
          </span>
        ))}
      </div>
      <button onClick={onLogin} type="button">로그인</button>
    </section>
  );
}

function Gov24Modal({
  modal,
  onClose
}: {
  modal: "search" | "quick" | "login";
  onClose: () => void;
}) {
  const titles = {
    search: "통합검색",
    quick: "자주 찾는 서비스 모아보기",
    login: "안내"
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section aria-labelledby="g24-modal-title" aria-modal="true" className="g24-modal" role="dialog">
        <div className="modal-title-row">
          <h2 id="g24-modal-title">{titles[modal]}</h2>
          <button aria-label="닫기" onClick={onClose} type="button">×</button>
        </div>
        {modal === "search" && <SearchModalContent />}
        {modal === "quick" && <QuickServiceModalContent />}
        {modal === "login" && <LoginRequiredModalContent onClose={onClose} />}
      </section>
    </div>
  );
}

function SearchModalContent() {
  return (
    <div className="search-modal-content">
      <label className="modal-search-box">
        <input aria-label="통합검색어" placeholder="검색어를 입력해 주세요." />
        <button type="button">검색</button>
      </label>
      <section>
        <h3>자주 찾는 서비스</h3>
        <div className="modal-chip-grid">
          {quickServices.slice(0, 6).map((service, index) => (
            <button key={service.label} type="button">{index + 1}. {service.label}</button>
          ))}
        </div>
      </section>
      <section className="modal-empty">
        <h3>최근 검색어</h3>
        <p>최근 검색어가 없습니다.</p>
      </section>
    </div>
  );
}

function QuickServiceModalContent() {
  return (
    <div className="quick-modal-grid">
      {quickServices.concat([
        { label: "인감증명서", icon: "certificate", tone: "orange" as const },
        { label: "지적도(임야도)", icon: "document", tone: "orange" as const },
        { label: "소득금액 증명", icon: "tax", tone: "green" as const },
        { label: "건강보험 자격득실 확인", icon: "health", tone: "green" as const }
      ]).map((service) => (
        <button key={service.label} type="button">
          <Gov24Icon label={service.label} name={service.icon} size="sm" tone={service.tone} />
          <span>{service.label}</span>
        </button>
      ))}
    </div>
  );
}

function LoginRequiredModalContent({ onClose }: { onClose: () => void }) {
  return (
    <div className="login-required-content">
      <strong>로그인이 필요한 메뉴입니다.</strong>
      <p>로그인 페이지로 이동하시겠습니까?</p>
      <div className="modal-actions">
        <button onClick={onClose} type="button">취소</button>
        <button onClick={onClose} type="button">확인</button>
      </div>
    </div>
  );
}

function NoticePanel() {
  return (
    <section className="side-panel notice-panel" aria-label="공지사항">
      <div className="panel-title-row">
        <h2>공지사항</h2>
        <button type="button">더 보기 →</button>
      </div>
      <ul>
        {notices.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function CampaignPanel() {
  return (
    <section className="campaign-panel" aria-label="홍보 배너">
      <p>새롭게 만나는 똑똑한 정부서비스</p>
      <strong>어떤 공공 API도<br />한 화면으로</strong>
      <div className="campaign-controls" aria-label="홍보 배너 제어">
        <span>1 / 3</span>
        <button aria-label="일시정지" type="button">Ⅱ</button>
        <button aria-label="이전 배너" disabled type="button">‹</button>
        <button aria-label="다음 배너" type="button">›</button>
      </div>
    </section>
  );
}

function LifeGuidePanel({ suggestions }: { suggestions: A2UIBlock | undefined }) {
  const suggestionBlock = suggestions?.type === "search-suggestions" ? suggestions : undefined;

  return (
    <section className="home-card life-guide">
      <div className="panel-title-row">
        <h2>생활가이드</h2>
        <span aria-hidden="true">›</span>
      </div>
      <div className="guide-icons">
        {guideItems.map((item, index) => (
          <button className={index === 0 ? "active" : ""} key={item.label} type="button">
            <Gov24Icon label={item.label} name={item.icon} size="lg" tone={item.tone} variant="circle" />
            {item.label}
          </button>
        ))}
      </div>
      <div className="guide-list">
        {(suggestionBlock?.suggestions ?? []).slice(0, 2).map((suggestion) => (
          <button key={suggestion.label} type="button">
            <span>{suggestion.label}</span>
            <strong>›</strong>
          </button>
        ))}
      </div>
    </section>
  );
}

function OneStopPanel({
  activeScenarioId,
  metrics,
  onScenarioChange,
  services
}: {
  activeScenarioId: string;
  metrics: A2UIBlock | undefined;
  onScenarioChange: (id: string) => void;
  services: A2UIBlock | undefined;
}) {
  const metricBlock = metrics?.type === "metric-strip" ? metrics : undefined;
  const serviceBlock = services?.type === "service-actions" ? services : undefined;

  return (
    <section className="home-card onestop-panel">
      <div className="panel-title-row">
        <h2>원스톱 서비스</h2>
        <span aria-hidden="true">›</span>
      </div>
      <div className="scenario-chip-row" aria-label="시연 시나리오">
        {demoScenarios.map((scenario) => (
          <button
            className={scenario.id === activeScenarioId ? "active" : ""}
            key={scenario.id}
            onClick={() => onScenarioChange(scenario.id)}
            type="button"
          >
            {scenario.label}
          </button>
        ))}
      </div>
      <div className="onestop-service-grid">
        {(serviceBlock?.services ?? []).map((service) => (
          <article key={service.id}>
            <Gov24Icon label={service.title} name={service.icon ?? iconForServiceCategory(service.category)} size="sm" tone={toneForServiceStatus(service.status)} />
            <div>
              <strong>{service.title}</strong>
              <span>{service.description}</span>
            </div>
          </article>
        ))}
      </div>
      <div className="mini-metrics">
        {(metricBlock?.metrics ?? []).slice(0, 2).map((metric) => (
          <span key={metric.label}>
            <strong>{metric.value}</strong>
            {metric.label}
          </span>
        ))}
      </div>
    </section>
  );
}

function iconForServiceCategory(category: string): Gov24IconName {
  if (category === "혜택알리미") return "benefit";
  if (category === "생활") return "life";
  if (category === "정책정보") return "policy";
  return "civil";
}

function toneForServiceStatus(status: SourceStatus): "blue" | "green" | "orange" {
  if (status === "fallback") return "orange";
  if (status === "cached") return "green";
  return "blue";
}

function BenefitPanel({ services }: { services: A2UIBlock | undefined }) {
  const serviceBlock = services?.type === "service-actions" ? services : undefined;

  return (
    <section className="home-card benefit-panel">
      <div className="panel-title-row">
        <h2>혜택알리미</h2>
        <span aria-hidden="true">›</span>
      </div>
      <div className="benefit-list">
        {(serviceBlock?.services ?? []).slice(0, 4).map((service) => (
          <button key={service.id} type="button">{service.title}</button>
        ))}
      </div>
    </section>
  );
}

function BlockRenderer({ block }: { block: A2UIBlock }) {
  if (block.type === "hero-summary") {
    return (
      <article className="detail-section result-summary">
        <p className="breadcrumb">홈 › 민원서비스 › GenUI Gateway</p>
        <div className="detail-heading-row">
          <h1>{block.intent}</h1>
          <div className="share-actions" aria-label="공유 및 보조 기능">
            <button type="button" aria-label="페이스북 공유">f</button>
            <button type="button" aria-label="X 공유">X</button>
            <button type="button" aria-label="링크복사">⌁</button>
            <button type="button" aria-label="프린트 하기">⎙</button>
          </div>
        </div>
        <h2>서비스 개요</h2>
        <dl className="overview-list">
          <div>
            <dt>검색 질의</dt>
            <dd>{block.query}</dd>
          </div>
          <div>
            <dt>서비스 내용</dt>
            <dd>{block.answer}</dd>
          </div>
          <div>
            <dt>처리 방식</dt>
            <dd>공공 API와 MCP Tool 응답을 GenUI block으로 변환하여 안내합니다.</dd>
          </div>
        </dl>
      </article>
    );
  }

  if (block.type === "service-results") {
    return (
      <article className="detail-section service-results-section">
        <div className="section-toolbar">
          <h2>{block.title}</h2>
          <div className="result-controls" aria-label="검색 결과 표시 제어">
            <label>
              <span>표시</span>
              <select defaultValue="10" aria-label="페이지당 결과 수">
                <option value="10">10개</option>
                <option value="30">30개</option>
                <option value="50">50개</option>
              </select>
            </label>
            <div className="sort-buttons" role="group" aria-label="정렬">
              <button className="active" type="button">인기순</button>
              <button type="button">가나다순</button>
            </div>
          </div>
        </div>
        <div className="service-result-list">
          {block.results.map((result) => (
            <article className="service-result-card" key={result.id}>
              <Gov24Icon label={result.title} name={result.icon} size="md" tone={toneForServiceStatus(result.status)} />
              <div>
                <strong>{result.title}</strong>
                <p>{result.description}</p>
                <dl>
                  <div>
                    <dt>제공기관</dt>
                    <dd>{result.agency}</dd>
                  </div>
                  <div>
                    <dt>신청방법</dt>
                    <dd>{result.methods.join(", ")}</dd>
                  </div>
                  <div>
                    <dt>수수료</dt>
                    <dd>{result.fee}</dd>
                  </div>
                </dl>
              </div>
              <button type="button">{result.ctaLabel}</button>
            </article>
          ))}
        </div>
        <div className="pagination-row" aria-label="페이지 이동">
          <button type="button" disabled>처음</button>
          <button className="active" type="button">1</button>
          <button type="button">2</button>
          <button type="button">다음</button>
        </div>
      </article>
    );
  }

  if (block.type === "application-guide") {
    return (
      <article className="detail-section application-guide-section">
        <h2>신청 방법 및 절차</h2>
        <dl className="overview-list compact">
          <div>
            <dt>분류</dt>
            <dd>{block.guide.category}</dd>
          </div>
          <div>
            <dt>신청 자격</dt>
            <dd>{block.guide.eligibility}</dd>
          </div>
          <div>
            <dt>처리 기간</dt>
            <dd>{block.guide.period}</dd>
          </div>
          <div>
            <dt>구비 서류</dt>
            <dd>{block.guide.requiredDocuments.join(", ")}</dd>
          </div>
        </dl>
        <ol className="application-steps">
          {block.guide.steps.map((step, index) => (
            <li key={step.title}>
              <span>{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </div>
              {step.action && <button type="button">{step.action}</button>}
            </li>
          ))}
        </ol>
        <div className="related-link-row">
          {block.guide.relatedLinks.map((link) => (
            <button key={link} type="button">{link}</button>
          ))}
        </div>
      </article>
    );
  }

  if (block.type === "data-table") {
    return (
      <article className="detail-section">
        <h2>{block.title}</h2>
        <div className="g24-table-wrap">
          <table>
            <thead>
              <tr>
                {block.columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, index) => (
                <tr key={`${block.id}-${index}`}>
                  {block.columns.map((column) => (
                    <td key={column.key}>{row[column.key]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    );
  }

  if (block.type === "source-list") {
    return (
      <article className="detail-section source-section">
        <h2>출처 및 응답 상태</h2>
        <div className="source-list">
          {block.sources.map((source) => (
            <article className="source-item" key={source.id}>
              <div>
                <p>{source.provider}</p>
                <strong>{source.dataset}</strong>
                <span>{source.serviceType} · {source.format} · {source.rows.toLocaleString()} rows · 갱신일 {source.lastUpdated}</span>
              </div>
              <StatusBadge status={source.status} />
            </article>
          ))}
        </div>
      </article>
    );
  }

  if (block.type === "tool-trace") {
    return (
      <details className="side-detail diagnostics-card">
        <summary>
          <span>MCP Tool 호출 로그</span>
          <strong>개발자 진단</strong>
        </summary>
        <ol className="trace-list">
          {block.traces.map((trace) => (
            <li key={trace.tool}>
              <div>
                <strong>{trace.tool}</strong>
                <span>{trace.label}</span>
              </div>
              <span>{trace.durationMs}ms</span>
              <StatusBadge status={trace.status} />
            </li>
          ))}
        </ol>
      </details>
    );
  }

  if (block.type === "gateway-contract") {
    return (
      <aside className="side-detail contract-card">
        <p>이 페이지의 구성</p>
        <h2>Gateway 응답 계약</h2>
        <nav>
          {block.contract.blocks.map((item) => (
            <a href="#genui-result" key={item}>{item}</a>
          ))}
        </nav>
        <button type="button">발급하기</button>
      </aside>
    );
  }

  if (block.type === "notice") {
    return (
      <aside className="detail-section notice-card">
        <h2>{block.title}</h2>
        <ul>
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </aside>
    );
  }

  return null;
}

function FooterAccordion() {
  return (
    <footer className="g24-container footer-accordion" aria-label="정부24 하단 바로가기">
      {footerShortcuts.map((group, index) => (
        <details key={group.title} open={index === 0}>
          <summary>{group.title}<span aria-hidden="true">+</span></summary>
          <div>
            {group.items.map((item) => (
              <a href="#genui-result" key={item}>{item}</a>
            ))}
          </div>
        </details>
      ))}
      <section className="page-feedback" aria-label="페이지 만족도">
        <p>이 페이지에 만족하시나요?</p>
        <div role="group" aria-label="만족도 선택">
          {["매우만족", "만족", "보통", "불만족"].map((label) => (
            <button key={label} type="button">{label}</button>
          ))}
        </div>
        <button type="button">평가완료</button>
      </section>
    </footer>
  );
}

function StatusBadge({ status }: { status: SourceStatus }) {
  const labels: Record<SourceStatus, string> = {
    ok: "정상",
    cached: "캐시",
    fallback: "대체"
  };

  return <span className={`status-badge ${status}`}>{labels[status]}</span>;
}

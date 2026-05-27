import { useMemo, useState, type CSSProperties } from "react";
import { scenarioToGenUIResponse, type A2UIBlock } from "./a2ui";
import { demoScenarios, type SourceStatus } from "./demo-data";
import { Gov24Icon, type Gov24IconName } from "./gov24-components";
import "./styles.css";

const primaryNav = [
  {
    label: "민원서비스",
    menu: [
      ["민원 찾기", "신청 · 조회 · 발급 기능 서비스 이용 및 정보를 확인할 수 있어요"],
      ["주제별 보기", "서비스를 주제별로 분류하여 쉽게 찾을 수 있어요"],
      ["행정서식 간편이름", "행정서식 명칭 중 혼동되는 명칭에 대하여 간편이름(약칭·약호)을 확인할 수 있어요"],
      ["사실/진위확인", "서비스 이용 사실관계 확인 및 발급한 증명서의 진위를 확인할 수 있어요"],
      ["원스톱서비스", "서비스를 통합하여 한 번에 신청하거나 유사 서비스를 확인할 수 있어요"],
      ["기업/단체 서비스", "정부24에서 직접 이용 가능한 모든 서비스를 확인할 수 있어요"],
      ["돌봄시설 등 위치 찾기", "영·유아/초등 돌봄 및 청소년 지원센터 등 시설의 위치를 찾을 수 있어요"],
      ["다운로드파일 진본확인", "정부24의 발급증명서 뷰어를 통해 다운로드한 파일의 진본을 검증합니다"]
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
  { label: "지원", items: ["인증등록/관리", "복합인증관리", "보안센터", "누리집 안내지도"] }
];
const screenSizeOptions = [
  { label: "작게", value: 0.94 },
  { label: "보통", value: 1 },
  { label: "조금 크게", value: 1.06 },
  { label: "크게", value: 1.12 },
  { label: "가장 크게", value: 1.18 },
  { label: "초기화", value: 1 }
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
const extraQuickServices: typeof quickServices = [
  { label: "인감증명서", icon: "certificate", tone: "orange" },
  { label: "지적도(임야도)", icon: "document", tone: "orange" },
  { label: "소득금액 증명", icon: "tax", tone: "green" },
  { label: "건강보험 자격득실 확인", icon: "health", tone: "green" },
  { label: "농업경영체 등록 확인서 교부", icon: "document", tone: "green" },
  { label: "운전경력 증명", icon: "car", tone: "orange" },
  { label: "사업자등록 증명", icon: "certificate", tone: "orange" },
  { label: "대학교 졸업 증명", icon: "education", tone: "blue" }
];
const allQuickServices = quickServices.concat(extraQuickServices);
const mobileShortcutServices = ["국민비서 구삐", "주민등록증 모바일 확인 서비스", "전자증명서·공공마이데이터", "기업 공공 마이데이터"];
const guideItems: { label: string; icon: Gov24IconName; tone: "blue" | "green" | "pink" | "purple" | "gray" }[] = [
  { label: "결혼", icon: "benefit", tone: "pink" },
  { label: "임신•출산", icon: "family", tone: "green" },
  { label: "이사", icon: "life", tone: "blue" },
  { label: "육아", icon: "family", tone: "purple" },
  { label: "사망", icon: "welfare", tone: "gray" },
  { label: "보건•복지", icon: "health", tone: "pink" }
];
const guideSituations: Record<string, string[]> = {
  "결혼": ["누군가와 결혼할 때", "외국인과 결혼할 때"],
  "임신•출산": ["아이를 갖고자 할 때", "임신에 어려움을 겪을 때", "아이가 태어났을 때"],
  "이사": ["이사를 할 때", "셀프등기를 하려고 할 때"],
  "육아": ["아이를 양육할 때", "아이를 어린이집에 보내려고 할 때", "육아휴직을 하려고 할 때"],
  "사망": ["누군가가 돌아가셨을 때(유족이 있는 경우)", "상속을 할 때"],
  "보건•복지": ["치매가 의심될 때", "돌봄이 필요할 때(노인)", "암 진단을 받았을 때"]
};
const campaignSlides = [
  { kicker: "새롭게 만나는 똑똑한 정부서비스", title: "어떤 공공 API도\n한 화면으로" },
  { kicker: "실시간 MCP 응답을 정부24처럼", title: "데이터 출처와 상태까지\n투명하게" },
  { kicker: "시연 가능한 GenUI Gateway", title: "서비스 검색부터 상세까지\n한 흐름으로" }
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
  { title: "디지털증명", items: ["전자증명서", "공공 마이데이터", "모바일 신분증"] },
  { title: "부가서비스", items: ["무인민원발급", "어디서나민원", "돌봄시설 위치 찾기"] }
];
const footerPolicies = ["개인정보처리방침", "이용약관", "보안센터", "웹 접근성 품질인증"];
const socialLinks = ["인스타그램", "엑스", "카카오스토리", "블로그"];

export function App() {
  const [activeScenarioId, setActiveScenarioId] = useState(demoScenarios[0].id);
  const [activePage, setActivePage] = useState<"home" | "detail">("home");
  const [selectedServiceTitle, setSelectedServiceTitle] = useState("지역 생활 안전 상태 요약");
  const [activeUtility, setActiveUtility] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<"search" | "quick" | "login" | "mobileMenu" | null>(null);
  const [fontScale, setFontScale] = useState(1);
  const [activeScreenSize, setActiveScreenSize] = useState("보통");
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

  const openDetailPage = (title: string) => {
    setSelectedServiceTitle(title);
    setActivePage("detail");
    setActiveModal(null);
    setActiveNav(null);
    setActiveUtility(null);
  };

  return (
    <main className="g24-shell" style={{ "--g24-font-scale": fontScale } as CSSProperties}>
      <section className="g24-official" aria-label="공식 전자정부 안내">
        <div className="g24-container">
          <span className="korea-mark" aria-hidden="true" />
          <span>이 누리집은 대한민국 공식 전자정부 누리집입니다.</span>
          <em>GenUI mock</em>
        </div>
      </section>

      <header className="g24-header">
        <div className="g24-container header-main">
          <a className="g24-logo" href="#home" aria-label="정부24 홈" onClick={() => setActivePage("home")}>
            <span className="logo-swirl" aria-hidden="true" />
            <strong>정부24</strong>
            <i aria-hidden="true">+</i>
          </a>
          <button className="mobile-menu-button" onClick={() => setActiveModal("mobileMenu")} type="button">
            전체메뉴
          </button>
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
              <div className="utility-menu screen-size-menu">
                <button
                  aria-expanded={activeUtility === "화면크기"}
                  onClick={() => setActiveUtility(activeUtility === "화면크기" ? null : "화면크기")}
                  type="button"
                >
                  화면크기
                  <span aria-hidden="true">⌄</span>
                </button>
                {activeUtility === "화면크기" && (
                  <div className="utility-popover screen-size-popover" role="menu">
                    {screenSizeOptions.map((item) => (
                      <button
                        aria-pressed={activeScreenSize === item.label}
                        className={activeScreenSize === item.label ? "active" : ""}
                        key={item.label}
                        onClick={() => {
                          setFontScale(item.value);
                          setActiveScreenSize(item.label === "초기화" ? "보통" : item.label);
                        }}
                        role="menuitem"
                        type="button"
                      >
                        <span aria-hidden="true">가</span>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                  onClick={() => setActiveNav(activeNav === item.label ? null : item.label)}
                  type="button"
                >
                  {item.label}
                  <span aria-hidden="true">{activeNav === item.label ? "⌃" : "⌄"}</span>
                </button>
                <MegaMenu columns={item.menu} label={item.label} onOpenDetail={openDetailPage} />
              </div>
            ))}
          </div>
        </nav>
      </header>

      <section className="g24-main" id="home">
        {activePage === "home" ? (
          <div className="g24-container home-grid">
            <section className="home-left">
              <SearchHero onOpenSearch={() => setActiveModal("search")} query={activeScenario.query} />
              <QuickServicePanel onOpenAll={() => setActiveModal("quick")} onOpenDetail={openDetailPage} />
              <section className="lower-grid">
                <LifeGuidePanel onOpenDetail={openDetailPage} suggestions={suggestions} />
                <OneStopPanel
                  activeScenarioId={activeScenarioId}
                  metrics={metrics}
                  onOpenDetail={openDetailPage}
                  onScenarioChange={setActiveScenarioId}
                  services={services}
                />
                <BenefitPanel onOpenDetail={openDetailPage} services={services} />
              </section>
            </section>

            <aside className="home-right">
              <LoginPanel onLogin={() => setActiveModal("login")} />
              <RecentServicePanel />
              <NoticePanel />
              <CampaignPanel />
            </aside>
          </div>
        ) : (
          <>
            <div className="g24-container detail-entry-bar">
              <button onClick={() => setActivePage("home")} type="button">← 목록으로</button>
              <span>선택한 서비스</span>
              <strong>{selectedServiceTitle}</strong>
            </div>
            <div className="g24-container detail-grid" id="genui-result">
              <section className="detail-main">
                {summary && <BlockRenderer block={summary} onOpenDetail={openDetailPage} selectedServiceTitle={selectedServiceTitle} />}
                {results && <BlockRenderer block={results} onOpenDetail={openDetailPage} selectedServiceTitle={selectedServiceTitle} />}
                {applicationGuide && <BlockRenderer block={applicationGuide} onOpenDetail={openDetailPage} selectedServiceTitle={selectedServiceTitle} />}
                {table && <BlockRenderer block={table} onOpenDetail={openDetailPage} selectedServiceTitle={selectedServiceTitle} />}
                {sources && <BlockRenderer block={sources} onOpenDetail={openDetailPage} selectedServiceTitle={selectedServiceTitle} />}
                {notice && <BlockRenderer block={notice} onOpenDetail={openDetailPage} selectedServiceTitle={selectedServiceTitle} />}
              </section>
              <aside className="detail-side">
                {contract && <BlockRenderer block={contract} onOpenDetail={openDetailPage} selectedServiceTitle={selectedServiceTitle} />}
                {diagnostics && <BlockRenderer block={diagnostics} onOpenDetail={openDetailPage} selectedServiceTitle={selectedServiceTitle} />}
              </aside>
            </div>
          </>
        )}
        <FooterAccordion onOpenDetail={openDetailPage} />
      </section>
      {activeModal && (
        <Gov24Modal modal={activeModal} onClose={() => setActiveModal(null)} onOpenDetail={openDetailPage} />
      )}
    </main>
  );
}

function MegaMenu({ columns, label, onOpenDetail }: { columns: string[][]; label: string; onOpenDetail: (title: string) => void }) {
  return (
    <section className="mega-menu" aria-label={`${label} 메뉴`}>
      <div className="g24-container mega-grid">
        {columns.map(([title, body]) => (
          <button aria-label={title} key={title} onClick={() => onOpenDetail(title)} type="button">
            <strong>{title}</strong>
            <span>{body}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function SearchHero({ onOpenSearch, query }: { onOpenSearch: () => void; query: string }) {
  return (
    <section className="g24-search" aria-label="통합검색">
      <label className="search-pill">
        <span className="assistant-badge" aria-hidden="true">AI</span>
        <input value={query} readOnly aria-label="검색어" />
        <button onClick={onOpenSearch} type="button" aria-label="검색">⌕</button>
      </label>
    </section>
  );
}

function QuickServicePanel({ onOpenAll, onOpenDetail }: { onOpenAll: () => void; onOpenDetail: (title: string) => void }) {
  const pageSize = 8;
  const [page, setPage] = useState(0);
  const maxPage = Math.ceil(allQuickServices.length / pageSize) - 1;
  const visibleServices = allQuickServices.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <section className="quick-panel" aria-label="자주 찾는 서비스">
      <div className="panel-title-row">
        <h2>자주 찾는 서비스</h2>
        <div className="panel-arrows" aria-label="자주 찾는 서비스 목록 제어">
          <button aria-label="자주 찾는 서비스 이전 목록" disabled={page === 0} onClick={() => setPage(Math.max(0, page - 1))} type="button">‹</button>
          <button aria-label="자주 찾는 서비스 다음 목록" disabled={page === maxPage} onClick={() => setPage(Math.min(maxPage, page + 1))} type="button">›</button>
          <button className="expand-control" onClick={onOpenAll} type="button">펼쳐보기 ⊞</button>
        </div>
      </div>
      <div className="quick-grid">
        {visibleServices.map((service) => (
          <button key={service.label} onClick={() => onOpenDetail(service.label)} type="button">
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
  onClose,
  onOpenDetail
}: {
  modal: "search" | "quick" | "login" | "mobileMenu";
  onClose: () => void;
  onOpenDetail: (title: string) => void;
}) {
  const titles = {
    search: "통합검색",
    quick: "자주 찾는 서비스 모아보기",
    login: "안내",
    mobileMenu: "전체메뉴"
  };

  return (
    <div className="modal-backdrop" role="presentation">
      <section aria-labelledby="g24-modal-title" aria-modal="true" className={`g24-modal ${modal}-modal`} role="dialog">
        <div className="modal-title-row">
          <h2 id="g24-modal-title">{titles[modal]}</h2>
          <button aria-label="닫기" onClick={onClose} type="button">×</button>
        </div>
        {modal === "search" && <SearchModalContent onOpenDetail={onOpenDetail} />}
        {modal === "quick" && <QuickServiceModalContent onOpenDetail={onOpenDetail} />}
        {modal === "login" && <LoginRequiredModalContent onClose={onClose} />}
        {modal === "mobileMenu" && <MobileMenuContent onClose={onClose} onOpenDetail={onOpenDetail} />}
      </section>
    </div>
  );
}

function MobileMenuContent({ onClose, onOpenDetail }: { onClose: () => void; onOpenDetail: (title: string) => void }) {
  return (
    <div className="mobile-menu-content">
      <div className="mobile-menu-actions">
        <button type="button">정부24 AI</button>
        <button type="button">로그인</button>
      </div>
      <nav className="mobile-menu-section-grid" aria-label="전체메뉴 주요 서비스">
        {primaryNav.map((item) => (
          <section className="mobile-menu-section" key={item.label}>
            <h3>{item.label}</h3>
            <div className="mobile-menu-link-grid">
              {item.menu.map(([title, body]) => (
                <button
                  aria-label={title}
                  key={title}
                  onClick={() => {
                    onOpenDetail(title);
                    onClose();
                  }}
                  type="button"
                >
                  <strong>{title}</strong>
                  <span>{body}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </nav>
      <section className="mobile-shortcut-section" aria-label="서비스 바로가기">
        <h3>서비스 바로가기</h3>
        <div className="mobile-menu-link-grid compact">
          {mobileShortcutServices.map((service) => (
            <button
              key={service}
              onClick={() => {
                onOpenDetail(service);
                onClose();
              }}
              type="button"
            >
              <strong>{service}</strong>
            </button>
          ))}
        </div>
      </section>
      <div className="mobile-utility-row">
        {topLinks.map((link) => (
          <button key={link.label} type="button">{link.label}</button>
        ))}
      </div>
    </div>
  );
}

function SearchModalContent({ onOpenDetail }: { onOpenDetail: (title: string) => void }) {
  return (
    <div className="search-modal-content">
      <p className="search-modal-lede">모든 정부 서비스, 이제 한 곳에서 찾아보세요</p>
      <label className="modal-search-box">
        <input aria-label="통합검색어" placeholder="검색어를 입력해 주세요." />
        <button type="button">검색</button>
      </label>
      <div className="search-modal-columns">
        <section>
          <h3>자주 찾는 서비스</h3>
          <div className="modal-ranked-list">
            {allQuickServices.slice(0, 10).map((service, index) => (
              <button key={service.label} onClick={() => onOpenDetail(service.label)} type="button">
                <span>{index + 1}</span>
                <strong>{service.label}</strong>
              </button>
            ))}
          </div>
        </section>
        <section className="modal-empty">
          <h3>최근 검색어</h3>
          <p>최근 검색어가 없습니다.</p>
        </section>
      </div>
    </div>
  );
}

function QuickServiceModalContent({ onOpenDetail }: { onOpenDetail: (title: string) => void }) {
  return (
    <div className="quick-modal-grid">
      {allQuickServices.map((service) => (
        <button key={service.label} onClick={() => onOpenDetail(service.label)} type="button">
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
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const activeSlide = campaignSlides[slide];

  return (
    <section className="campaign-panel" aria-label="홍보 배너">
      <p>{activeSlide.kicker}</p>
      <strong>{activeSlide.title.split("\n").map((line) => <span key={line}>{line}</span>)}</strong>
      <div className="campaign-controls" aria-label="홍보 배너 제어">
        <span>{slide + 1} / {campaignSlides.length}</span>
        <button aria-label={paused ? "재생" : "일시정지"} onClick={() => setPaused(!paused)} type="button">{paused ? "▶" : "Ⅱ"}</button>
        <button aria-label="이전 배너" disabled={slide === 0} onClick={() => setSlide(Math.max(0, slide - 1))} type="button">‹</button>
        <button aria-label="다음 배너" disabled={slide === campaignSlides.length - 1} onClick={() => setSlide(Math.min(campaignSlides.length - 1, slide + 1))} type="button">›</button>
      </div>
    </section>
  );
}

function LifeGuidePanel({ onOpenDetail, suggestions: _suggestions }: { onOpenDetail: (title: string) => void; suggestions: A2UIBlock | undefined }) {
  const [activeGuide, setActiveGuide] = useState(guideItems[0].label);
  const activeSuggestions = guideSituations[activeGuide] ?? [];

  return (
    <section className="home-card life-guide">
      <div className="panel-title-row">
        <h2>생활가이드</h2>
        <span aria-hidden="true">›</span>
      </div>
      <div className="guide-icons">
        {guideItems.map((item) => (
          <button className={item.label === activeGuide ? "active" : ""} key={item.label} onClick={() => setActiveGuide(item.label)} type="button">
            <Gov24Icon label={item.label} name={item.icon} size="lg" tone={item.tone} variant="circle" />
            {item.label}
          </button>
        ))}
      </div>
      <div className="guide-list">
        {activeSuggestions.map((label) => (
          <button key={label} onClick={() => onOpenDetail(label)} type="button">
            <span>{label}</span>
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
  onOpenDetail,
  onScenarioChange,
  services
}: {
  activeScenarioId: string;
  metrics: A2UIBlock | undefined;
  onOpenDetail: (title: string) => void;
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
          <button key={service.id} onClick={() => onOpenDetail(service.title)} type="button">
            <Gov24Icon label={service.title} name={service.icon ?? iconForServiceCategory(service.category)} size="sm" tone={toneForServiceStatus(service.status)} />
            <div>
              <strong>{service.title}</strong>
              <span>{service.description}</span>
            </div>
          </button>
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

function BenefitPanel({ onOpenDetail, services }: { onOpenDetail: (title: string) => void; services: A2UIBlock | undefined }) {
  const serviceBlock = services?.type === "service-actions" ? services : undefined;

  return (
    <section className="home-card benefit-panel">
      <div className="panel-title-row">
        <h2>혜택알리미</h2>
        <span aria-hidden="true">›</span>
      </div>
      <div className="benefit-list">
        {(serviceBlock?.services ?? []).slice(0, 4).map((service) => (
          <button key={service.id} onClick={() => onOpenDetail(service.title)} type="button">{service.title}</button>
        ))}
      </div>
    </section>
  );
}

function BlockRenderer({
  block,
  onOpenDetail,
  selectedServiceTitle
}: {
  block: A2UIBlock;
  onOpenDetail?: (title: string) => void;
  selectedServiceTitle?: string;
}) {
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  if (block.type === "hero-summary") {
    const shareActions = [
      { label: "페이스북 공유", short: "f", feedback: "공유 준비됨" },
      { label: "X 공유", short: "X", feedback: "공유 준비됨" },
      { label: "링크복사", short: "⌁", feedback: "링크가 복사되었습니다." },
      { label: "프린트 하기", short: "⎙", feedback: "인쇄 화면을 준비합니다." }
    ];

    return (
      <article className="detail-section result-summary">
        <p className="breadcrumb">홈 › 민원서비스 › GenUI Gateway</p>
        <div className="detail-heading-row">
          <h1>{selectedServiceTitle ?? block.intent}</h1>
          <div className="share-actions" aria-label="공유 및 보조 기능">
            {shareActions.map((action) => (
              <button
                aria-label={action.label}
                key={action.label}
                onClick={() => setShareFeedback(action.feedback)}
                type="button"
              >
                {action.short}
              </button>
            ))}
          </div>
        </div>
        {shareFeedback && <p className="share-feedback" role="status">{shareFeedback}</p>}
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
              <button onClick={() => onOpenDetail?.(result.title)} type="button">{result.ctaLabel}</button>
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
          {block.contract.blocks.map((item, index) => (
            <a className={index === 0 ? "active" : ""} href="#genui-result" key={item}>{item}</a>
          ))}
        </nav>
        <button onClick={() => onOpenDetail?.(selectedServiceTitle ?? "Gateway 응답 계약")} type="button">발급하기</button>
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

function FooterAccordion({ onOpenDetail }: { onOpenDetail: (title: string) => void }) {
  const [infoOpen, setInfoOpen] = useState(false);
  const [activeFooter, setActiveFooter] = useState<string | null>(null);
  const activeFooterGroup = footerShortcuts.find((group) => group.title === activeFooter);

  return (
    <footer className="g24-site-footer" aria-label="정부24 하단">
      <a className="top-button" href="#home">위로 이동<br />Top</a>
      <div className="g24-container footer-accordion" aria-label="정부24 하단 바로가기">
        {footerShortcuts.map((group) => (
          <button
            aria-expanded={activeFooter === group.title}
            className={activeFooter === group.title ? "active" : ""}
            key={group.title}
            onClick={() => setActiveFooter(activeFooter === group.title ? null : group.title)}
            type="button"
          >
            {group.title}
          </button>
        ))}
        {activeFooterGroup && (
          <section className="footer-shortcut-dialog" role="dialog" aria-label={activeFooterGroup.title}>
            <div className="footer-dialog-title-row">
              <h2>{activeFooterGroup.title}</h2>
              <button aria-label="닫기" onClick={() => setActiveFooter(null)} type="button">×</button>
            </div>
            <div className="footer-dialog-links">
              {activeFooterGroup.items.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    onOpenDetail(item);
                    setActiveFooter(null);
                  }}
                  type="button"
                >
                  <strong>{item}</strong>
                  <span>{footerShortcutDescription(item)}</span>
                </button>
              ))}
            </div>
          </section>
        )}
        <section className="page-feedback" aria-label="페이지 만족도">
          <p>이 페이지에 만족하시나요?</p>
          <div role="group" aria-label="만족도 선택">
            {["매우만족", "만족", "보통", "불만족"].map((label) => (
              <button key={label} type="button">{label}</button>
            ))}
          </div>
          <button type="button">평가완료</button>
        </section>
      </div>
      <div className="g24-container footer-info">
        <div className="footer-brand-row">
          <a className="footer-logo" href="#home" aria-label="정부24 홈">
            <span className="logo-swirl" aria-hidden="true" />
            <strong>정부24</strong>
          </a>
          <button
            aria-expanded={infoOpen}
            className="footer-info-toggle"
            onClick={() => setInfoOpen(!infoOpen)}
            type="button"
          >
            정부24 안내{infoOpen ? "닫기" : "열기"}
          </button>
          <div className="footer-social" aria-label="소셜 바로가기">
            {socialLinks.map((label) => (
              <a href="#home" key={label}>{label.slice(0, 2)}</a>
            ))}
          </div>
        </div>
        {infoOpen && (
          <section className="footer-agency-info" aria-label="정부24 안내">
            <p>정부24 GenUI Gateway는 여러 공공 API와 MCP 응답을 정부24형 화면 구성으로 변환하는 오픈소스 데모입니다.</p>
            <dl>
              <div>
                <dt>운영</dt>
                <dd>공공서비스 Gateway 시연 환경</dd>
              </div>
              <div>
                <dt>문의</dt>
                <dd>프로젝트 README와 MCP Tool 진단 로그를 확인해 주세요.</dd>
              </div>
            </dl>
          </section>
        )}
        <div className="footer-policy-row">
          {footerPolicies.map((policy) => (
            <a href="#home" key={policy}>{policy}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function footerShortcutDescription(label: string) {
  const descriptions: Record<string, string> = {
    "국민비서 구삐": "생활 알림과 민원 안내",
    "상담예약": "상담 일정 예약",
    "개선의견": "서비스 개선 의견 접수",
    "전자증명서": "모든 정부 전자증명서를 발급",
    "공공 마이데이터": "행정/공공기관에 있는 내 정보",
    "모바일 신분증": "스마트폰에 안전하게 저장·이용",
    "무인민원발급": "무인 발급기 위치와 이용 안내",
    "어디서나민원": "방문 수령 민원 신청",
    "돌봄시설 위치 찾기": "주변 돌봄시설 위치 검색"
  };

  return descriptions[label] ?? "관련 서비스 바로가기";
}

function StatusBadge({ status }: { status: SourceStatus }) {
  const labels: Record<SourceStatus, string> = {
    ok: "정상",
    cached: "캐시",
    fallback: "대체"
  };

  return <span className={`status-badge ${status}`}>{labels[status]}</span>;
}

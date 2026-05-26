import { useMemo, useState } from "react";
import { scenarioToGenUIResponse, type A2UIBlock } from "./a2ui";
import { demoScenarios, type SourceStatus } from "./demo-data";
import { Gov24Icon, type Gov24IconName } from "./gov24-components";
import "./styles.css";

const primaryNav = ["민원서비스", "혜택알리미", "생활", "정책정보", "고객센터"];
const topLinks = ["For Foreigners", "어린이", "시니어", "지원", "화면크기"];
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

export function App() {
  const [activeScenarioId, setActiveScenarioId] = useState(demoScenarios[0].id);
  const activeScenario = demoScenarios.find((scenario) => scenario.id === activeScenarioId) ?? demoScenarios[0];
  const response = useMemo(() => scenarioToGenUIResponse(activeScenario), [activeScenario]);

  const summary = response.blocks.find((block) => block.type === "hero-summary");
  const suggestions = response.blocks.find((block) => block.type === "search-suggestions");
  const services = response.blocks.find((block) => block.type === "service-actions");
  const metrics = response.blocks.find((block) => block.type === "metric-strip");
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
                <button key={link} type="button">{link}</button>
              ))}
            </div>
            <div className="account-links">
              <button type="button">정부24 AI</button>
              <button type="button">통합검색</button>
              <button type="button">로그인</button>
              <button type="button">회원가입</button>
            </div>
          </div>
        </div>
        <nav className="g24-nav" aria-label="주요 서비스">
          <div className="g24-container nav-inner">
            {primaryNav.map((item, index) => {
              if (item === "혜택알리미") {
                return (
                  <div className="nav-item has-mega" key={item}>
                    <button type="button">
                      {item}
                      <span aria-hidden="true">⌃</span>
                    </button>
                    <MegaMenu />
                  </div>
                );
              }

              return (
                <div className="nav-item" key={item}>
                  <button className={index === 0 ? "active" : ""} type="button">
                    {item}
                    <span aria-hidden="true">⌄</span>
                  </button>
                </div>
              );
            })}
          </div>
        </nav>
      </header>

      <section className="g24-main" id="home">
        <div className="g24-container home-grid">
          <section className="home-left">
            <SearchHero query={activeScenario.query} />
            <QuickServicePanel />
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
            <LoginPanel />
            <NoticePanel />
            <CampaignPanel />
          </aside>
        </div>

        <div className="g24-container detail-grid" id="genui-result">
          <section className="detail-main">
            {summary && <BlockRenderer block={summary} />}
            {table && <BlockRenderer block={table} />}
            {sources && <BlockRenderer block={sources} />}
            {notice && <BlockRenderer block={notice} />}
          </section>
          <aside className="detail-side">
            {contract && <BlockRenderer block={contract} />}
            {diagnostics && <BlockRenderer block={diagnostics} />}
          </aside>
        </div>
      </section>
    </main>
  );
}

function MegaMenu() {
  const columns = [
    ["혜택알리미 홈", "몰라서 놓쳤던 혜택, 이제는 정부가 먼저 챙겨드립니다"],
    ["나의 혜택", "내가 받을 수 있는 혜택을 한 눈에 확인하세요"],
    ["관심", "내 상황과 연관된 혜택을 확인해보세요"],
    ["발견", "아직 몰랐던 숨은 혜택을 찾아드려요"],
    ["간편찾기", "선택한 상황 조건으로 빠르게 원하는 혜택을 찾아요"],
    ["전체 혜택", "분야별로 제공되는 모든 혜택을 한곳에서 확인해요"],
    ["설정", "가족등록, 맞춤안내 조건 등 서비스 이용 환경을 관리해요"]
  ];

  return (
    <section className="mega-menu" aria-label="혜택알리미 메뉴">
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

function QuickServicePanel() {
  return (
    <section className="quick-panel" aria-label="자주 찾는 서비스">
      <div className="panel-title-row">
        <h2>자주 찾는 서비스</h2>
        <div className="panel-arrows" aria-hidden="true">
          <span>‹</span>
          <span>›</span>
          <b>펼쳐보기 ⊞</b>
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

function LoginPanel() {
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
      <button type="button">로그인</button>
    </section>
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
      <span aria-hidden="true">● ● ●</span>
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
        <h1>{block.intent}</h1>
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

function StatusBadge({ status }: { status: SourceStatus }) {
  const labels: Record<SourceStatus, string> = {
    ok: "정상",
    cached: "캐시",
    fallback: "대체"
  };

  return <span className={`status-badge ${status}`}>{labels[status]}</span>;
}

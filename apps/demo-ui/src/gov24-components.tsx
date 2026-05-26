import type { ReactNode } from "react";
import type { SourceStatus } from "./demo-data";

export type Gov24IconName =
  | "air"
  | "benefit"
  | "building"
  | "car"
  | "certificate"
  | "civil"
  | "document"
  | "education"
  | "external"
  | "facility"
  | "family"
  | "health"
  | "life"
  | "passport"
  | "policy"
  | "safety"
  | "search"
  | "tax"
  | "welfare"
  | (string & {});

export type Gov24NavItem = {
  label: string;
  active?: boolean;
  hasMenu?: boolean;
};

export type Gov24QuickService = {
  label: string;
  href?: string;
  icon?: string;
};

export type Gov24Notice = {
  title: string;
  href?: string;
  pinned?: boolean;
};

export type Gov24Source = {
  id: string;
  provider: string;
  dataset: string;
  meta: string;
  status: SourceStatus;
};

export type Gov24TocItem = {
  id: string;
  label: string;
};

export function Gov24OfficialBanner({ children = "이 누리집은 대한민국 공식 전자정부 누리집입니다." }: { children?: ReactNode }) {
  return (
    <section className="g24-official" aria-label="공식 전자정부 안내">
      <div className="g24-container">
        <span className="korea-mark" aria-hidden="true" />
        <span>{children}</span>
      </div>
    </section>
  );
}

export function Gov24Logo() {
  return (
    <a className="g24-logo" href="#home" aria-label="정부24 홈">
      <span className="logo-swirl" aria-hidden="true" />
      <strong>정부24</strong>
      <i aria-hidden="true">+</i>
    </a>
  );
}

const iconPaths: Record<string, ReactNode> = {
  air: (
    <>
      <path d="M6.5 9.2h8.8a2.1 2.1 0 1 0-1.8-3.2" />
      <path d="M4.5 13h12.2a2.3 2.3 0 1 1-2 3.4" />
      <path d="M7.2 17.2h4.4" />
    </>
  ),
  benefit: (
    <>
      <path d="M12 18.2s-6.4-3.7-6.4-8a3.4 3.4 0 0 1 6.4-1.7 3.4 3.4 0 0 1 6.4 1.7c0 4.3-6.4 8-6.4 8Z" />
      <path d="M12 8.6v4.8" />
      <path d="M9.6 11h4.8" />
    </>
  ),
  building: (
    <>
      <path d="M6.8 18.5V6.1h10.4v12.4" />
      <path d="M9 8.6h1.6M13.4 8.6H15M9 12h1.6M13.4 12H15" />
      <path d="M10.2 18.5v-3.4h3.6v3.4" />
    </>
  ),
  car: (
    <>
      <path d="M5.8 13.4 7.2 8.8h9.6l1.4 4.6" />
      <path d="M5.5 13.4h13v3.7h-13z" />
      <path d="M8.2 17.1v1.2M15.8 17.1v1.2M8.8 11.1h6.4" />
    </>
  ),
  certificate: (
    <>
      <path d="M7.2 5.5h7.4l2.2 2.2v10.8H7.2z" />
      <path d="M14.6 5.5v2.2h2.2" />
      <path d="M9.4 10.8h5.2M9.4 13.2h5.2" />
      <path d="m13.1 16.4 1.2 1.1 2-2.5" />
    </>
  ),
  civil: (
    <>
      <path d="M7.5 6.6h9v11.8h-9z" />
      <path d="M9.8 9.1h4.4M9.8 11.7h4.4M9.8 14.3h2.4" />
      <path d="M16.5 8.2h1.8v8.6h-1.8" />
    </>
  ),
  document: (
    <>
      <path d="M7.3 5.4h7.2l2.2 2.2v10.9H7.3z" />
      <path d="M14.5 5.4v2.2h2.2" />
      <path d="M9.5 10.5h5M9.5 13h5M9.5 15.5h3.2" />
    </>
  ),
  education: (
    <>
      <path d="m4.8 9 7.2-3.2L19.2 9 12 12.3z" />
      <path d="M7.8 10.4v4.2c1.4 1.4 7 1.4 8.4 0v-4.2" />
      <path d="M18 10v4" />
    </>
  ),
  external: (
    <>
      <path d="M7.2 7.2h5.2" />
      <path d="M10.8 5.8h5.4v5.4" />
      <path d="m16.2 5.8-7 7" />
      <path d="M16.8 13.2v4.4H6.4V7.2h4.4" />
    </>
  ),
  facility: (
    <>
      <path d="M12 19s5.2-4.7 5.2-8.7a5.2 5.2 0 1 0-10.4 0C6.8 14.3 12 19 12 19Z" />
      <path d="M9.8 10.3h4.4M12 8.1v4.4" />
    </>
  ),
  family: (
    <>
      <path d="M9.2 10.1a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4Z" />
      <path d="M15.2 10.4a1.9 1.9 0 1 0 0-3.8 1.9 1.9 0 0 0 0 3.8Z" />
      <path d="M5.8 18.1v-1.5a3.4 3.4 0 0 1 6.8 0v1.5" />
      <path d="M13.2 18.1v-1.2a2.8 2.8 0 0 1 4.9-1.8" />
    </>
  ),
  health: (
    <>
      <path d="M12 18.2s-6.4-3.7-6.4-8a3.4 3.4 0 0 1 6.4-1.7 3.4 3.4 0 0 1 6.4 1.7c0 4.3-6.4 8-6.4 8Z" />
      <path d="M12 9.4v4.2M9.9 11.5h4.2" />
    </>
  ),
  life: (
    <>
      <path d="M6.6 18V8.4l5.4-3.2 5.4 3.2V18" />
      <path d="M9.4 18v-5h5.2v5" />
      <path d="M8.6 10.1h6.8" />
    </>
  ),
  passport: (
    <>
      <path d="M7.4 5.6h9.2v12.8H7.4z" />
      <path d="M12 9.2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
      <path d="M9.2 12.2h5.6M12 9.4c.9.8 1.2 4.8 0 5.6M12 9.4c-.9.8-1.2 4.8 0 5.6" />
    </>
  ),
  policy: (
    <>
      <path d="M6.8 18.3V6.4h10.4v11.9" />
      <path d="M9.4 9.2h5.2M9.4 12h5.2M9.4 14.8h3.1" />
      <path d="M5.4 18.3h13.2" />
    </>
  ),
  safety: (
    <>
      <path d="M12 5.2 18 7v4.5c0 3.4-2.3 5.6-6 7.3-3.7-1.7-6-3.9-6-7.3V7z" />
      <path d="m9.7 12 1.5 1.5 3.2-3.5" />
    </>
  ),
  search: (
    <>
      <path d="M10.8 16.1a5.3 5.3 0 1 0 0-10.6 5.3 5.3 0 0 0 0 10.6Z" />
      <path d="m14.7 14.7 3.8 3.8" />
    </>
  ),
  tax: (
    <>
      <path d="M7.2 5.5h9.6v13H7.2z" />
      <path d="M9.3 9.2h5.4M9.3 12h2.1M12.9 12h1.8M9.3 14.8h2.1M12.9 14.8h1.8" />
      <path d="M10 7.2h4" />
    </>
  ),
  welfare: (
    <>
      <path d="M12 18.6c4-2 6.2-4.6 6.2-8.2V7.2L12 5 5.8 7.2v3.2c0 3.6 2.2 6.2 6.2 8.2Z" />
      <path d="M9.3 11.4h5.4M12 8.7v5.4" />
    </>
  )
};

const iconFallbacks: Record<string, Gov24IconName> = {
  "건강": "health",
  "건축": "building",
  "공공시설": "facility",
  "교육": "education",
  "납세": "tax",
  "대기": "air",
  "등록": "document",
  "민원": "civil",
  "복지": "welfare",
  "생활": "life",
  "세금": "tax",
  "안전": "safety",
  "여권": "passport",
  "자동차": "car",
  "장애": "welfare",
  "정책": "policy",
  "주민": "certificate",
  "증명": "certificate",
  "출산": "family",
  "혜택": "benefit"
};

export function resolveGov24Icon(name: string | undefined, label = ""): Gov24IconName {
  if (name && iconPaths[name]) {
    return name;
  }

  const haystack = `${name ?? ""} ${label}`;
  const matched = Object.entries(iconFallbacks).find(([keyword]) => haystack.includes(keyword));

  return matched?.[1] ?? "document";
}

export function Gov24Icon({
  name,
  label,
  size = "md",
  tone = "blue",
  variant = "tile"
}: {
  name?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  tone?: "blue" | "green" | "orange" | "pink" | "purple" | "gray";
  variant?: "tile" | "circle" | "plain";
}) {
  const resolvedName = resolveGov24Icon(name, label);

  return (
    <span className={`gov24-icon ${variant} ${size} ${tone}`} aria-hidden="true">
      <svg viewBox="0 0 24 24" role="img">
        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.9">
          {iconPaths[resolvedName] ?? iconPaths.document}
        </g>
      </svg>
    </span>
  );
}

export function Gov24PrimaryNav({ items }: { items: Gov24NavItem[] }) {
  return (
    <nav className="g24-nav" aria-label="주요 서비스">
      <div className="g24-container nav-inner">
        {items.map((item) => (
          <div className={item.hasMenu ? "nav-item has-mega" : "nav-item"} key={item.label}>
            <button className={item.active ? "active" : ""} type="button">
              {item.label}
              <span aria-hidden="true">{item.hasMenu ? "⌃" : "⌄"}</span>
            </button>
          </div>
        ))}
      </div>
    </nav>
  );
}

export function Gov24SearchBar({ query, label = "검색어" }: { query: string; label?: string }) {
  return (
    <label className="search-pill">
      <span className="assistant-badge" aria-hidden="true">AI</span>
      <input value={query} readOnly aria-label={label} />
      <button type="button" aria-label="검색">⌕</button>
    </label>
  );
}

export function Gov24QuickServicePanel({ services }: { services: Gov24QuickService[] }) {
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
        {services.map((service) => (
          <a href={service.href ?? "#genui-result"} key={service.label}>
            <strong>{service.label}</strong>
            <Gov24Icon label={service.label} name={service.icon} size="sm" tone={service.icon === "external" ? "purple" : "orange"} />
          </a>
        ))}
      </div>
    </section>
  );
}

export function Gov24LoginPrompt() {
  return (
    <section className="login-panel" aria-label="로그인 안내">
      <h2><strong>회원가입</strong>하고 아래 서비스를 편리하게 이용하세요.</h2>
      <div className="login-icons">
        {[
          { label: "민원신청", icon: "civil" },
          { label: "전자증명", icon: "certificate" },
          { label: "혜택알리미", icon: "benefit" },
          { label: "생활정보", icon: "life" }
        ].map((item) => (
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

export function Gov24NoticeList({ notices }: { notices: Gov24Notice[] }) {
  return (
    <section className="side-panel notice-panel" aria-label="공지사항">
      <div className="panel-title-row">
        <h2>공지사항</h2>
        <button type="button">더 보기 →</button>
      </div>
      <ul>
        {notices.map((notice) => (
          <li key={notice.title}>{notice.pinned ? "📌 " : ""}{notice.title}</li>
        ))}
      </ul>
    </section>
  );
}

export function Gov24CampaignBanner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="campaign-panel" aria-label="홍보 배너">
      <p>{subtitle}</p>
      <strong>{title}</strong>
      <span aria-hidden="true">● ● ●</span>
    </section>
  );
}

export function Gov24HomeCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="home-card">
      <div className="panel-title-row">
        <h2>{title}</h2>
        <span aria-hidden="true">›</span>
      </div>
      {children}
    </section>
  );
}

export function Gov24DetailLayout({ main, side }: { main: ReactNode; side: ReactNode }) {
  return (
    <div className="g24-container detail-grid" id="genui-result">
      <section className="detail-main">{main}</section>
      <aside className="detail-side">{side}</aside>
    </div>
  );
}

export function Gov24Breadcrumb({ items }: { items: string[] }) {
  return <p className="breadcrumb">{items.join(" › ")}</p>;
}

export function Gov24SideToc({ items, ctaLabel = "발급하기" }: { items: Gov24TocItem[]; ctaLabel?: string }) {
  return (
    <aside className="side-detail contract-card">
      <p>이 페이지의 구성</p>
      <h2>{items[0]?.label ?? "서비스 안내"}</h2>
      <nav>
        {items.map((item) => (
          <a href={`#${item.id}`} key={item.id}>{item.label}</a>
        ))}
      </nav>
      <button type="button">{ctaLabel}</button>
    </aside>
  );
}

export function Gov24SourceList({ sources }: { sources: Gov24Source[] }) {
  return (
    <div className="source-list">
      {sources.map((source) => (
        <article className="source-item" key={source.id}>
          <div>
            <p>{source.provider}</p>
            <strong>{source.dataset}</strong>
            <span>{source.meta}</span>
          </div>
          <Gov24StatusBadge status={source.status} />
        </article>
      ))}
    </div>
  );
}

export function Gov24StatusBadge({ status }: { status: SourceStatus }) {
  const labels: Record<SourceStatus, string> = {
    ok: "정상",
    cached: "캐시",
    fallback: "대체"
  };

  return <span className={`status-badge ${status}`}>{labels[status]}</span>;
}

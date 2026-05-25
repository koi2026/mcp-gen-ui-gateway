import type { ReactNode } from "react";
import type { SourceStatus } from "./demo-data";

export type Gov24NavItem = {
  label: string;
  active?: boolean;
  hasMenu?: boolean;
};

export type Gov24QuickService = {
  label: string;
  href?: string;
  icon?: "document" | "external";
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
            <span className={service.icon === "external" ? "link-icon" : "doc-icon"} aria-hidden="true" />
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
        {["민원신청", "전자증명", "혜택알리미", "생활정보"].map((item) => (
          <span key={item}>
            <i aria-hidden="true" />
            {item}
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

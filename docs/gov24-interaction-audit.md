# Government24 Interaction Audit

This document records the Government24 interaction patterns inspected with Playwright and how the demo UI maps them into reusable GenUI components.

## Observed Pages

- `https://plus.gov.kr/`
- `https://plus.gov.kr/minwon`
- `https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=13100000026&tp_seq=01`

## Interaction Coverage

| Government24 pattern | Observed behavior | Demo UI component |
| --- | --- | --- |
| Official site banner | Static electronic-government notice above header | `g24-official` |
| Header utility menus | For Foreigners, support, and screen-size controls open dropdown lists | `utility-menu`, `utility-popover` |
| Primary navigation | All main nav items expose submenu groups | `nav-item has-mega`, `MegaMenu` |
| Mobile full menu | Mobile header exposes 전체메뉴 drawer with login and full section navigation | `mobile-menu-button`, `MobileMenuContent` |
| Global search | Search pill with assistant visual and search action | `SearchHero` |
| Integrated search overlay | Search button opens modal with frequent services and empty recent-search state | `Gov24Modal`, `SearchModalContent` |
| Quick services | Frequent services shown as tiled action buttons | `QuickServicePanel` |
| Quick service expand modal | Frequent-service expand control opens a full service list | `QuickServiceModalContent` |
| Disabled carousel controls | First slide disables previous controls with muted visual state | `button:disabled` in `panel-arrows`, `campaign-controls` |
| Empty recent state | Recent searches or recently viewed services show an empty-state message | `RecentServicePanel`, `empty-state-box` |
| Login-required state | Protected services prompt login or membership before continuation | `LoginPanel`, `LoginRequiredModalContent` |
| Login prompt | Four shortcut service icons and login CTA | `LoginPanel` |
| Notice panel | Notice list with more-link action | `NoticePanel` |
| Banner carousel controls | Pause, previous, next, and page indicator | `CampaignPanel` baseline banner slot |
| Life guide categories | Icon tabs plus situation links | `LifeGuidePanel` |
| One-stop service tabs | Scenario chips switch generated API scenario | `OneStopPanel` |
| Search result list | Result cards, sort buttons, page-size select, pagination, CTA | `service-results` block |
| Service detail overview | Breadcrumb, title, share/print actions, overview definition list | `hero-summary` block renderer |
| Page table of contents | Side TOC with CTA button | `gateway-contract` block |
| Application procedure | Category, eligibility, period, documents, ordered steps | `application-guide` block |
| Source transparency | Provider, dataset, format, rows, status badge | `source-list` block |
| Developer trace | Tool-call details in expandable diagnostics | `tool-trace` block |
| Footer accordion | Shortcut groups with expandable content | `FooterAccordion` |
| Footer information toggle | Government24 guide button expands site/operator information | `footer-info-toggle`, `footer-agency-info` |
| Footer policy/social links | Policy links, social shortcuts, and top navigation action | `footer-policy-row`, `footer-social`, `top-button` |
| Satisfaction feedback | Rating buttons and completion CTA | `page-feedback` |

## Verification Evidence

Latest local verification used the Vite dev server at `http://127.0.0.1:5173/`.

- Desktop Playwright clicked all five primary nav menus and confirmed visible menu links.
- Desktop Playwright clicked `For Foreigners`, `지원`, and `화면크기` utility controls and confirmed menu items.
- Desktop Playwright confirmed disabled labels: `자주 찾는 서비스 이전 목록`, `이전 배너`, `처음`.
- Desktop Playwright confirmed empty/login-required copy: `최근에 본 서비스가 없습니다.` and `로그인하면 신청 내역과 관심 서비스를 이어서 확인할 수 있습니다.`
- Playwright opened the `통합검색`, `펼쳐보기`, and `로그인` controls and confirmed dialog content for search, full quick-service list, and login-required guidance.
- Mobile Playwright at `390x900` confirmed `documentElement.scrollWidth === body.scrollWidth === 375` and zero overflowing elements while a primary menu and utility menu were open.
- Mobile Playwright confirmed modal dialogs remain within the viewport with zero overflowing elements.
- Mobile Playwright opened `전체메뉴`, confirmed full menu dialog content, and confirmed zero overflowing elements.
- Desktop Playwright identified footer related links, `정부24 안내열기`, social links, policy links, and top navigation action; the demo footer mirrors these as reusable shell controls.
- Desktop Playwright compared core shell states after tuning: nav `19px/700`, logo `34px/800`, panel title `20px/800`, unselected nav backgrounds remain transparent, hover receives the Government24-like `#eef2f7`, and only the open nav receives `#d6e0eb`.
- Desktop Playwright verified action-card states: quick service cards stay white by default and receive `#f8fafc` plus inset border on hover; inactive scenario chips receive `#eef2f7` only on hover; selected chips remain dark blue.
- Mobile Playwright confirmed card interaction changes preserve `documentElement.scrollWidth === body.scrollWidth === 375` and zero overflowing elements.
- `pnpm --filter @mcp-gen-ui-gateway/demo-ui typecheck`
- `pnpm --filter @mcp-gen-ui-gateway/demo-ui test`
- `pnpm --filter @mcp-gen-ui-gateway/demo-ui build`

## Current Boundaries

- Login, certificate, identity verification, and form submission are represented as safe mock controls only.
- External Government24 links are not automated.
- Carousel media is represented as a stable banner slot because the GenUI gateway needs a reusable layout target rather than hosted campaign assets.

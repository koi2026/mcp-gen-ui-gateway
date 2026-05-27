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
| Screen-size control | Screen-size menu exposes small, normal, larger, largest, and reset states and applies a page-scale variable | `screen-size-menu`, `--g24-font-scale` |
| Primary navigation | All main nav items expose submenu groups | `nav-item has-mega`, `MegaMenu` |
| Mobile full menu | Mobile header exposes 전체메뉴 drawer with login, expanded two-column section navigation, shortcut services, and utility links | `mobile-menu-button`, `MobileMenuContent` |
| Global search | Search pill with assistant visual and search action | `SearchHero` |
| Integrated search overlay | Search button opens modal with a headline, ranked frequent services, and empty recent-search state | `Gov24Modal`, `SearchModalContent` |
| Quick services | Frequent services shown as tiled action buttons; labels stay on one line and long names are ellipsized like Government24 | `QuickServicePanel` |
| Quick service carousel | Previous/next controls page through frequent service sets with disabled boundary buttons | `QuickServicePanel` |
| Quick service expand modal | Frequent-service expand control opens a full service list | `QuickServiceModalContent` |
| Disabled carousel controls | First slide disables previous controls with muted visual state | `button:disabled` in `panel-arrows`, `campaign-controls` |
| Footer shortcut dialogs | Footer shortcut groups open a floating dialog above the footer with title, links, and close control | `footer-shortcut-dialog` |
| Empty recent state | Recent searches or recently viewed services show an empty-state message | `RecentServicePanel`, `empty-state-box` |
| Login-required state | Protected services prompt login or membership before continuation | `LoginPanel`, `LoginRequiredModalContent` |
| Login prompt | Four shortcut service icons and login CTA | `LoginPanel` |
| Notice panel | Notice list with more-link action | `NoticePanel` |
| Banner carousel controls | Pause/play, previous, next, and page indicator update visible banner copy | `CampaignPanel` |
| Life guide categories | Icon tabs switch situation links while preserving selected/non-selected states | `LifeGuidePanel` |
| One-stop service tabs | Scenario chips switch generated API scenario | `OneStopPanel` |
| Home to detail navigation | Service cards, search modal chips, expanded quick-service items, life-guide links, mobile menu items, footer shortcuts, and result CTAs open the generated service detail page with a back-to-list control | `openDetailPage`, `activePage`, `detail-entry-bar` |
| Search result list | Result cards, sort buttons, page-size select, pagination, CTA | `service-results` block |
| Service detail overview | Breadcrumb, title, share/print actions, overview definition list | `hero-summary` block renderer |
| Page table of contents | Side TOC with active item, hover state, and CTA button | `gateway-contract` block |
| Application procedure | Category, eligibility, period, documents, ordered steps | `application-guide` block |
| Source transparency | Provider, dataset, format, rows, status badge | `source-list` block |
| Developer trace | Tool-call details in expandable diagnostics | `tool-trace` block |
| Footer accordion | Shortcut groups with expandable content | `FooterAccordion` |
| Footer information toggle | Government24 guide button expands site/operator information | `footer-info-toggle`, `footer-agency-info` |
| Footer policy/social links | Policy links, social shortcuts, and top navigation action | `footer-policy-row`, `footer-social`, `top-button` |
| Satisfaction feedback | Rating buttons expose inactive, selected, disabled-submit, and completed states | `page-feedback` |

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
- Desktop Playwright compared core shell states after tuning: nav `19px/700`, logo `34px/760`, panel title `20px/720`, unselected nav backgrounds remain transparent, hover receives the Government24-like `#eef2f7`, and only the open nav receives `#d6e0eb`.
- Desktop Playwright verified action-card states: quick service cards stay white by default and receive `#f8fafc` plus inset border on hover; inactive scenario chips receive `#eef2f7` only on hover; selected chips remain dark blue.
- Mobile Playwright confirmed card interaction changes preserve `documentElement.scrollWidth === body.scrollWidth === 375` and zero overflowing elements.
- Desktop Playwright verified the main search pill opens the integrated search modal, modal backdrop uses `rgba(0, 0, 0, 0.5)`, modal chips hover to `#eef2f7`, and disabled carousel controls keep opacity `1` with muted gray styling.
- Desktop Playwright verified service-card detail entry, `목록으로` return, active TOC styling, side CTA presence, and share feedback text `링크가 복사되었습니다.`
- Desktop Playwright verified common detail entry from the integrated search modal, primary mega menu, quick-service expand modal, mobile full menu, and footer shortcut controls.
- Desktop and mobile Playwright verified typography after tuning: no `font-weight: 900/1000` or `overflow-wrap: anywhere` remains, desktop detail title resolves to `font-weight: 760`, common card text resolves to `680-720`, and 390px mobile has no horizontal overflow.
- Desktop Playwright verified quick-service next paging, enabled previous state after paging, life-guide tab content switching, campaign next slide, and pause/play state.
- Mobile Playwright confirmed these interactive carousel/tab changes preserve zero overflowing elements.
- 2026-05-27 Playwright rechecked `https://plus.gov.kr/` search overlay: confirmed the current layer uses `모든 정부 서비스, 이제 한 곳에서 찾아보세요`, a 10-item ranked frequent-service list, and an empty recent-search column; the demo search modal now mirrors this structure.
- 2026-05-27 Playwright rechecked the mobile `전체메뉴`: confirmed the current menu keeps all primary sections expanded, uses compact two-column menu buttons at 390px, includes `서비스 바로가기`, and keeps utility controls below; the demo mobile menu now mirrors this state.
- 2026-05-27 Playwright rechecked Government24 screen-size and footer shortcut interactions: screen size opens a six-option menu with an active state, and footer shortcuts open a floating dialog above the footer. The demo now applies a `--g24-font-scale` state and uses matching footer shortcut dialogs.
- 2026-05-27 Playwright compared quick-service labels: `주민등록등본(초본)` stays on one line, while longer labels such as `농업경영체 등록 확인서 교부` render as a single-line ellipsis. The demo now uses the same no-wrap ellipsis treatment while preserving the full accessible label.
- 2026-05-27 Playwright compared the current Government24 primary mega menu: `민원서비스` uses four 270px columns at x=113/423/733/1043, a 134px first row, a 109px second row, and title/description copy aligned to the top of each item. The demo mega menu now mirrors those dimensions and text wrapping rules.
- 2026-05-27 Playwright rechecked the current Government24 life-guide carousel: desktop exposes six category buttons in order `결혼`, `임신•출산`, `이사`, `육아`, `사망`, `보건•복지`; selected category text is blue and inactive categories remain neutral. The demo now mirrors the six categories and category-specific situation links.
- 2026-05-27 Playwright captured the current Government24 footer structure: shortcut buttons, `정부24 안내열기`, social links, policy links, and top action remain distinct interactive targets. The demo now gives social links full accessible names and adds complete inactive/selected/submitted states to satisfaction feedback controls.
- `pnpm --filter @mcp-gen-ui-gateway/demo-ui typecheck`
- `pnpm --filter @mcp-gen-ui-gateway/demo-ui test`
- `pnpm --filter @mcp-gen-ui-gateway/demo-ui build`

## Current Boundaries

- Login, certificate, identity verification, and form submission are represented as safe mock controls only.
- External Government24 links are not automated.
- Carousel media is represented as a stable banner slot because the GenUI gateway needs a reusable layout target rather than hosted campaign assets.

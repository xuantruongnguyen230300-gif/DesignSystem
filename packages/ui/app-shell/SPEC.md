---
component: app-shell
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: "disclosure (navigation) + landmarks"
---

# App shell, Topbar & Sidenav: Spec

Entry `@nxt/ui/app-shell` gồm `nxt-app-shell` (khung ứng dụng), `nxt-topbar` (thanh trên), `nxt-sidenav` (điều hướng bên), service nội bộ `NxtShellState` (trạng thái dùng chung, cung cấp bởi shell) và type `NxtNavItem`.

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** mọi sản phẩm có cùng một khung: điều hướng chính ở bên trái, thanh trên chứa tìm kiếm và tài khoản, vùng nội dung cuộn riêng. Người dùng chuyển sản phẩm mà không phải học lại vị trí; trên màn hình nhỏ điều hướng thành drawer.
- **Khi nào dùng:** gốc của ứng dụng nghiệp vụ (register Operate), mỗi ứng dụng một shell; `scroll="page"` cho trang đọc dài (docs).
- **Khi nào KHÔNG dùng:**
  - Trang đăng nhập, onboarding (register Welcome): dùng layout riêng không có điều hướng.
  - Điều hướng cục bộ trong một trang (các phần của hồ sơ): dùng `nxt-tabs`.
  - Danh sách hành động: dùng `nxt-menu`; sidenav chỉ chứa link điều hướng.
  - Lồng shell trong shell: không dùng (preview trong docs là trường hợp duy nhất, xem §6).

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-app-shell` | ✓ | Lưới 2 cột (nav + frame), nền `canvas`; cung cấp `NxtShellState` |
| 2 | Skip link "Bỏ qua tới nội dung" | ✓ | Ẩn tới khi focus; không render khi shell nằm trong `main` khác |
| 3 | Vùng nav `.nxt-app-shell__nav` | ✓ | Chứa `nxt-sidenav`; dưới 1024px thành drawer trượt từ cạnh trái |
| 4 | Backdrop | — | Chỉ khi drawer mobile mở; `aria-hidden="true"`, bấm vào thì đóng |
| 5 | Frame | ✓ | `nxt-topbar` + vùng nội dung; `inert` khi drawer mobile mở |
| 6 | Vùng nội dung `.nxt-app-shell__main` | ✓ | `role="main"` (trừ khi lồng), `tabindex="-1"`, cuộn riêng ở `scroll="container"` |
| 7 | `nxt-topbar` | ✓ | `header`; nút mở menu (mobile) + 3 slot start / center / end |
| 8 | `nxt-sidenav` | ✓ | `nav` có tên; header (brand + nút thu gọn), slot top, cây điều hướng, slot footer |
| 9 | Item / nhóm / heading | ✓ | Link, nút disclosure của nhóm (chevron), tiêu đề section, badge |

## 3. API (Angular)
Selector: `nxt-app-shell`, `nxt-topbar`, `nxt-sidenav`. Export `NxtShellState`, type `NxtNavItem`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxt-app-shell` input | `scroll` | `'container' \| 'page'` | `'container'` | `container`: shell lấp đầy container, nội dung cuộn riêng (ứng dụng). `page`: tài liệu cuộn, nav và topbar dính (`sticky`) |
| `nxt-app-shell` content | `nxt-sidenav`, `nxt-topbar`, (default) | | | Điều hướng, thanh trên, nội dung trang |
| `nxt-topbar` content | `[nxtTopbarStart]` | bất kỳ | | Logo / tên sản phẩm (khi sidenav không có brand) |
| `nxt-topbar` content | `[nxtTopbarCenter]` | ô tìm kiếm | | Vùng giữa rộng tối đa 480px, co lại trước khi che hành động; ẩn khi rỗng |
| `nxt-topbar` content | `[nxtTopbarEnd]` | nút, avatar, menu | | Hành động toàn cục, không bao giờ bị che |
| `nxt-sidenav` input | `items` | `NxtNavItem[]` | (bắt buộc) | Cây điều hướng |
| `nxt-sidenav` model | `collapsed` | `boolean` | `false` | Chế độ icon rail, two-way `[(collapsed)]`; ứng dụng tự lưu lại. Bị bỏ qua khi shell đang ở mobile |
| `nxt-sidenav` input | `collapsible` | `boolean` | `true` | Hiện nút thu gọn / mở rộng |
| `nxt-sidenav` input | `label` | `string` | `'Điều hướng chính'` | Tên landmark `nav` |
| `nxt-sidenav` content | `[nxtSidenavHeader]`, `[nxtSidenavTop]`, `[nxtSidenavFooter]` | bất kỳ | | Brand; nội dung trên cây (chọn đơn vị); chân (tài khoản, phiên bản) |

`NxtNavItem`:

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `label` | `string` | Nhãn (bắt buộc) |
| `icon` | `NxtIconName` | Icon cấp 1; trong rail nhóm không có icon dùng `point` |
| `link` | `string` | Đường dẫn router; nhóm có `children` không nên có `link` |
| `exact` | `boolean` | So khớp route chính xác (cho "/" hoặc trang tổng quan) |
| `badge` | `string \| number` | Số đếm / chữ ngắn |
| `children` | `NxtNavItem[]` | Mục con (nhóm) |
| `heading` | `boolean` | Tiêu đề section, không tương tác |
| `disabled` | `boolean` | Hiện nhưng không dùng được (tắt tính năng, không có quyền) |
| `hint` | `string` | Tooltip giải thích mục disabled: "Cần quyền Quản trị nhân sự" |

`NxtShellState` (một instance mỗi shell): `mobile`, `mobileOpen` (signal), `open(trigger?)`, `close()`, `returnFocus`. Topbar và sidenav inject `optional`, nên dùng được ngoài shell.

## 4. Variants & sizes
| Chế độ | Khi nào | Hành vi |
|--------|---------|---------|
| Đầy đủ (≥ 1024px) | Mặc định | Sidenav rộng 256px (`layout.sidebar-width`) |
| Icon rail (≥ 1024px, `collapsed`) | Cần thêm chỗ cho bảng | Rộng 72px; nhãn ẩn (vẫn đọc được) + tooltip; nhóm cấp 1 thành menu bay ra (fly-out) liệt kê con một cấp; heading thành đường phân cách; badge thành chấm |
| Drawer mobile (< 1024px) | Màn hình hẹp | Sidenav đầy đủ trượt từ cạnh trái, backdrop, trang phía sau `inert`; `collapsed` bị bỏ qua |

| Phần tử | comfortable | compact | spacious |
|---------|-------------|---------|----------|
| Item cấp 1 (`size.control.lg`) | 40px | 32px | 48px |
| Item con, nút thu gọn (`size.control.md`) | 32px | 28px | 40px |
| Topbar (`layout.header-height`) | 56px | 56px | 56px |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ nền `surface-hover` | ✓ ring token (item, nút thu gọn) | — | ✓ trang hiện tại: nền `bg.selected`, `aria-current="page"`, item con có vạch chỉ báo; nhóm chứa trang hiện tại: chữ + icon nhấn | ✓ `role="link"` + `aria-disabled`, vẫn focus được, tooltip `hint` | — (nơi dùng đặt skeleton trong nội dung) | — | — | — (`items` bắt buộc) |

Nhóm tự mở khi chứa trang hiện tại, cho tới khi người dùng tự đóng / mở. Đổi route (NavigationEnd) và lên ≥ 1024px đều đóng drawer mobile. Chuyển rail / đầy đủ có chuyển động `motion.duration.normal`; motion `reduced` đưa về 0.

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/ (nhóm), https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/ (fly-out ở rail), landmarks: https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/

| Phím | Hành vi |
|------|---------|
| Tab (đầu trang) | Skip link hiện ra; Enter đưa focus vào vùng nội dung |
| Tab / Shift+Tab | Đi qua link, nút nhóm, mục disabled (vẫn focus được) theo thứ tự DOM |
| Enter / Space (nút nhóm) | Mở / đóng nhóm (`aria-expanded`) |
| Enter (link) | Điều hướng (native) |
| Enter / Space / ↓ (nhóm ở rail) | Mở fly-out menu; trong menu theo bàn phím của `nxt-menu` (↑/↓, Home/End, Escape trả focus) |
| Enter / Space (nút ☰ ở topbar, mobile) | Mở drawer, focus vào link / nút đầu tiên trong nav |
| Escape (trong drawer mobile) | Đóng drawer, trả focus về nút đã mở |

- Landmark: skip link → `nav` (`aria-label` = `label`) → `header` của topbar → vùng nội dung `role="main"`. Khi shell nằm trong một `main` / `[role="main"]` khác (preview trong docs), shell không thêm `main` thứ hai và không render skip link.
- Nhóm: `button` có `aria-expanded` + `aria-controls` trỏ tới `ul` con (`hidden` khi đóng). Danh sách dùng `ul role="list"`.
- Link: `aria-current="page"` khi khớp route (`routerLinkActive`). Mục disabled: `span role="link" aria-disabled="true" tabindex="0"`.
- Nút thu gọn: `aria-label` "Thu gọn menu" / "Mở rộng menu", `aria-expanded` = không ở rail, tooltip cùng nội dung. Nút ☰: `aria-label="Mở menu điều hướng"`, `aria-expanded`.
- Rail: nhãn ẩn bằng `clip-path` (vẫn là tên truy cập), tooltip trùng tên nên không thêm `aria-describedby`; badge vẫn nằm trong tên ("Phê duyệt 12").
- Drawer mobile: frame có `inert` (không Tab, không duyệt bằng screen reader); backdrop `aria-hidden`.
- Forced colors: item hiện tại có outline `Highlight`.
- Đã kiểm bằng Playwright e2e (2026-10-19): thu gọn / rail và lưu trạng thái; drawer mobile (focus vào nav, trang phía sau `inert`, Escape trả focus).

## 7. Tokens
`packages/tokens/src/component/app-shell.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `bg` | `color.bg.canvas` |
| `backdrop` | `color.bg.overlay` |

`packages/tokens/src/component/topbar.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `bg` | `color.bg.surface` |
| `border` | `color.border.default` |
| `height` | `layout.header-height` |
| `center-width` | `layout.header-search-width` |

`packages/tokens/src/component/sidenav.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `bg`, `border` | `color.bg.surface`, `color.border.default` |
| `width`, `width-collapsed` | `layout.sidebar-width`, `layout.sidebar-width-collapsed` |
| `item-height`, `subitem-height` | `size.control.lg`, `size.control.md` |
| `item-radius` | `radius.control` |
| `item-text`, `item-icon` | `color.text.default`, `color.icon.subtle` |
| `item-bg-hover` | `color.bg.surface-hover` |
| `item-active-bg / -text / -icon` | `color.bg.selected`, `color.text.strong`, `color.icon.primary` |
| `indicator` | `color.border.selected` |
| `guide` | `color.border.default` |
| `heading-text` | `color.text.subtle` |

Mượn token component khác: skip link dùng `--nxt-tooltip-bg/-text`, badge dùng `--nxt-badge-brand-bg/-text`, header sidenav dùng `--nxt-topbar-height`. Dùng thẳng semantic: `color.text.{default,disabled}`, `color.icon.disabled`, `size.icon.{sm,md}`, `space.inset.*`, `space.gap.*`, `space.section.sm`, `z.{tooltip,sticky,overlay}`, `elevation.modal`, `border-width.{default,strong}`, `radius.{control,pill}`, `typography.{label-md,label-sm,body-md}`, `focus.ring.*`, `motion.*`.

## 8. Density, responsive, i18n
- Chiều cao item theo density; bề rộng sidenav, rail và chiều cao topbar **không** đổi theo density (nhịp của khung).
- Breakpoint mobile: dưới 1024px (`(max-width: 1023.98px)`, theo `primitive.breakpoint.lg`) qua `BreakpointObserver`.
- Topbar: vùng giữa co lại trước, vùng end giữ `max-content` nên hành động không bị che.
- Nhãn item dài cắt "…" (không xuống dòng); tiêu đề section `label-sm` sentence case.
- Chuỗi giao diện viết sẵn bằng tiếng Việt: "Bỏ qua tới nội dung", "Mở menu điều hướng", "Thu gọn menu", "Mở rộng menu"; chỉ `label` của sidenav đổi được.

## 9. Content guidelines
- Nhãn item là danh từ ngắn, sentence case: "Nhân sự", "Chấm công", "Phê duyệt". Không dùng động từ ("Quản lý…") cho mọi mục.
- Tối đa 2 cấp con trong sidenav; nhiều hơn thì chia thành trang có tabs.
- Mục disabled luôn có `hint` nêu lý do: "Cần quyền Quản trị nhân sự", "Chưa bật trong gói của đơn vị".
- `badge` chỉ cho việc cần xử lý (đơn chờ duyệt), không cho số liệu thông tin.
- Tiêu đề section (`heading`) là danh từ nhóm: "Vận hành", "Báo cáo".

## 10. Acceptance (Definition of Done)
- [ ] Đầy đủ, rail có fly-out, drawer mobile, `scroll="page"`, mục disabled có `hint`, badge có trong docs example
- [x] Unit test (`sidenav.spec.ts`): landmark có tên + nút thu gọn, rail hai chiều `[(collapsed)]`, nhóm là disclosure điều khiển danh sách con, mở nhóm chứa trang hiện tại + `aria-current`, mục disabled vẫn focus được và báo không dùng được, badge + nhóm thành menu button ở rail
- [x] Playwright e2e: thu gọn / rail + lưu trạng thái; drawer mobile: focus vào nav, trang `inert`, Escape trả focus (2026-10-19)
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/app-shell.ts:47`: breakpoint mobile viết cứng trong TS thay vì lấy từ `@nxt/tokens/js` (component-conventions §3); `src/app-shell.ts:213`–`216` offset fly-out 8px viết cứng.
- `sidenav.html:61`–`62`: ở rail, mục con disabled trong fly-out không hiện `hint` (không có tooltip), nên mất lý do vì sao không dùng được.
- `src/app-shell.css:20`–`28`, `sidenav.css:168`–`169`: skip link và badge dùng component token của tooltip / badge; `sidenav.css:190`, `:196`, `:200` dùng thẳng `--nxt-color-*-disabled`; `:98`, `:205`, `:225`, `:265`–`269` dùng primitive `--nxt-space-*`.
- `src/app-shell.css:91`: drawer mobile trượt bằng `translateX(-100%)` (vật lý) trong khi vị trí dùng `inset-inline-start` (logic).
- `src/app-shell.ts:77`, `:162`, `:211`–`212`: chuỗi giao diện viết cứng, không đổi được.

### Đã xử lý (2026-10-19)
- Drawer mobile khi mở là `role="dialog"` + `aria-modal="true"` + tên "Menu điều hướng", phần trang phía sau `inert`; nút ở header của sidenav đổi thành "Đóng menu điều hướng" khi ở mobile. Có e2e.
- Ở mobile không còn nút "Thu gọn menu" (thay bằng nút đóng drawer).
- Skip link bị gỡ khỏi DOM khi drawer mobile đang mở. Có e2e.
- Ở rail, tiêu đề section thành `li aria-hidden="true"` (trước là `li role="separator"`, axe báo `aria-required-children`). Có unit test. Còn lại: tiêu đề vẫn không gom các mục thành nhóm có tên.
- Vùng nội dung (chế độ `scroll="container"`) là một cột flex, để trang dùng `nxtFill` lấp đầy màn hình và chỉ cuộn lưới; trang thường không đổi (phần tử con giữ chiều cao nội dung, vùng nội dung vẫn cuộn như trước). Chế độ `scroll="page"` giữ `display: block`.

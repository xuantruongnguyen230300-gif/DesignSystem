---
component: page-header
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: breadcrumb
---

# Page header & Breadcrumb: Spec

Entry `@nxt/ui/page-header` gồm `nxt-page-header` (vùng tiêu đề trang) và `nxt-breadcrumb` (vị trí trong cây trang).

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** biết mình đang ở trang nào, nằm ở đâu trong cây trang, trạng thái của đối tượng đang xem, và hành động chính của trang nằm ở đâu, cùng một vị trí trên mọi màn hình.
- **Khi nào dùng:** đầu mỗi trang trong `nxt-app-shell`; breadcrumb cho trang sâu từ hai cấp trở lên.
- **Khi nào KHÔNG dùng:**
  - Tiêu đề của một khối trong trang: dùng tiêu đề của `nxt-card` hoặc heading thường.
  - Tiêu đề drawer / dialog: `nxt-drawer` có header riêng.
  - Trang cấp một (danh sách gốc từ sidenav): bỏ breadcrumb, chỉ giữ tiêu đề.
  - Điều hướng giữa các phần cùng cấp: dùng `nxt-tabs` (đặt trong nội dung mặc định của page header).

## 2. Anatomy
**Page header**

| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-page-header` | ✓ | Cột dọc |
| 2 | Breadcrumb | — | Chỉ render khi `breadcrumb` không rỗng |
| 3 | Tiêu đề `h1` / `h2` | ✓ | Theo `headingLevel`; `tabindex="-1"` để nhận focus bằng code (`focusTitle()`), không nằm trong thứ tự Tab |
| 4 | Meta `[nxtPageMeta]` | — | Cùng dòng với tiêu đề, ví dụ `nxt-tag` trạng thái |
| 5 | Mô tả | — | Khi có `description`; tối đa 75ch |
| 6 | Hành động `[nxtPageActions]` | — | Bên phải, xuống dòng khi hẹp; ẩn khi rỗng |
| 7 | Nội dung mặc định | — | Dưới hàng tiêu đề, ví dụ `nxt-tabs` |

**Breadcrumb**

| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | `nav` | ✓ | `aria-label` = `label` |
| 2 | `ol` / `li` | ✓ | Danh sách có thứ tự |
| 3 | Link `a[routerLink]` | — | Mọi item có `link`, trừ item cuối |
| 3b | Nút `button.nxt-breadcrumb__link` | — | Item có `navigable` mà không có `link`, trừ item cuối: trông như link, bấm thì phát `navigate` (ứng dụng đổi màn hình không qua router) |
| 4 | Trang hiện tại `span` | ✓ | Item cuối, `aria-current="page"`, không bao giờ là link |
| 5 | Dấu phân cách | — | `chevron-right`, trang trí |

## 3. API (Angular)
Selector: `nxt-page-header`, `nxt-breadcrumb`. Export type `NxtBreadcrumbItem` = `{ label: string; link?: string; navigable?: boolean }`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxt-page-header` input | `title` | `string` | (bắt buộc) | Tiêu đề trang |
| `nxt-page-header` input | `description` | `string` | `undefined` | Một câu mô tả phạm vi trang |
| `nxt-page-header` input | `breadcrumb` | `NxtBreadcrumbItem[]` | `[]` | Rỗng thì không có breadcrumb |
| `nxt-page-header` input | `headingLevel` | `number` (`numberAttribute`) | `1` | `2` → `h2`; giá trị khác → `h1` |
| `nxt-page-header` content | `[nxtPageMeta]` | `nxt-tag`, text | | Trạng thái / meta cạnh tiêu đề |
| `nxt-page-header` content | `[nxtPageActions]` | nút, menu | | Hành động của trang, tối đa 1 nút primary |
| `nxt-page-header` content | (default) | bất kỳ | | Nội dung dưới tiêu đề (tabs) |
| `nxt-breadcrumb` input | `items` | `NxtBreadcrumbItem[]` | (bắt buộc) | `link` là đường dẫn router (`routerLink`) |
| `nxt-breadcrumb` input | `label` | `string` | `'Đường dẫn trang'` | Tên landmark |
| `nxt-breadcrumb` output | `navigate` | `NxtBreadcrumbItem` | | Người dùng kích hoạt một item `navigable` (không có `link`). Item có `link` do router xử lý, không phát |
| `nxt-page-header` output | `navigate` | `NxtBreadcrumbItem` | | Chuyển tiếp `navigate` của breadcrumb bên trong |
| `nxt-page-header` method | `focusTitle(options?: FocusOptions)` | `void` | | Đưa focus lên tiêu đề (`tabindex="-1"`). Dùng sau khi đổi màn hình không qua router (danh sách ↔ trình sửa); gọi trong `afterNextRender` để tiêu đề đã render |

`NxtBreadcrumbItem`:

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `label` | `string` | Tên trang |
| `link` | `string` (tuỳ chọn) | Đường dẫn router, render `a[routerLink]` |
| `navigable` | `boolean` (tuỳ chọn) | Không có router: render `button` trông như link, phát `navigate`. Bị bỏ qua khi có `link` |

Item cuối luôn là trang hiện tại: không bao giờ là link hay nút, dù có `link` / `navigable`. `nxt-page-header` không chuyển `label` cho breadcrumb bên trong.

## 4. Variants & sizes
Không có variant hay size. Tiêu đề dùng `typography.heading-lg` (24px).

| Cách dùng | Cấu hình |
|-----------|----------|
| Trang danh sách cấp một | `title` + `[nxtPageActions]` ("Thêm nhân viên") |
| Trang chi tiết | `breadcrumb` + `title` + `[nxtPageMeta]` (tag trạng thái) + `[nxtPageActions]` + tabs trong nội dung mặc định |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ link / nút breadcrumb: gạch chân, chữ đậm màu | ✓ ring token (rule `:focus-visible` chung của `@nxt/ui/styles`); tiêu đề nhận focus bằng code: ring ôm sát chữ, bo `radius.control`, chỉ hiện khi focus đến từ bàn phím | — | ✓ trang hiện tại `aria-current="page"` | — | — (nơi dùng đặt skeleton cho tiêu đề) | — | — | — (`title` bắt buộc) |

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Đi qua các link breadcrumb (trang hiện tại không nhận focus), rồi meta và hành động theo thứ tự DOM |
| Enter | Mở link (native); kích hoạt nút của item `navigable` (native), phát `navigate` |
| Space | Kích hoạt nút của item `navigable` (native) |

- Breadcrumb: `nav` có `aria-label`, `ol` / `li`, item cuối `aria-current="page"`; dấu phân cách là `nxt-icon` trang trí (`aria-hidden`).
- Tiêu đề là heading thật, mặc định `h1`: mỗi trang có đúng một `h1`. Dùng `headingLevel="2"` khi page header nằm trong một vùng đã có `h1`.
- Tiêu đề có `tabindex="-1"`: Tab không dừng ở đó, nhưng `focusTitle()` đưa focus lên được. Khi ứng dụng thay cả màn hình mà không đổi route (danh sách → trình sửa), focus đặt lên tiêu đề mới để screen reader đọc "Quy trình duyệt nghỉ phép, heading cấp 1" và Tab tiếp theo đi từ đầu màn hình mới (WCAG 2.4.3). Quay lại danh sách thì nơi dùng trả focus về đúng mục vừa mở, không về tiêu đề.
- Vòng focus của tiêu đề: dùng `:focus-visible` như mọi phần tử (conventions §4), nên chỉ hiện khi người dùng đang dùng bàn phím (trình duyệt kế thừa trạng thái focus-visible của phần tử trước đó); click chuột rồi chuyển màn hình thì không có vòng. Vòng ôm sát chữ (tiêu đề không giãn hết hàng) và bo `radius.control`, nên nhẹ hơn khung quanh cả hàng tiêu đề.
- Item `navigable` là `<button type="button">` trong `li`, không phải `<a>` không có `href` (không focus được). Ưu tiên `link` khi có router: link mở được tab mới và chia sẻ được.
- Không gắn `role` cho page header.

## 7. Tokens
`packages/tokens/src/component/page-header.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `title-text` | `color.text.strong` |
| `description-text` | `color.text.subtle` |
| `crumb-text` | `color.text.subtle` (link và dấu phân cách) |
| `crumb-current-text` | `color.text.default` (trang hiện tại, link khi hover) |

Dùng thẳng semantic: `space.gap.{xs,sm,md}`, `size.icon.{sm,lg}` (lg: chiều cao tối thiểu của link / nút breadcrumb), `radius.control` (hình vòng focus của link, nút và tiêu đề), `typography.{heading-lg,body-md,body-sm}`.

## 8. Density, responsive, i18n
- Khoảng cách theo density; cỡ chữ tiêu đề không đổi.
- Hàng tiêu đề và hành động xuống dòng khi hẹp (`flex-wrap`): hành động rơi xuống dưới tiêu đề. Breadcrumb dài cũng xuống dòng, không cắt.
- Tiêu đề tiếng Việt `heading-lg` (24 / 32px) đủ chỗ cho dấu chồng; tiêu đề dài tự xuống dòng.

## 9. Content guidelines
- Tiêu đề là danh từ cụ thể: "Danh sách nhân viên", "Hồ sơ Nguyễn Văn An". Trang chi tiết dùng tên đối tượng.
- Mô tả một câu, nói phạm vi: "Nhân viên đang làm việc tại tất cả chi nhánh."
- Breadcrumb dùng đúng tiêu đề của các trang cha, không viết tắt khác đi.
- Tối đa 1 nút primary trong `[nxtPageActions]`; hành động phụ gom vào menu.

## 10. Acceptance (Definition of Done)
- [ ] Trang danh sách, trang chi tiết có breadcrumb + meta + tabs, hành động xuống dòng khi hẹp có trong docs example
- [x] Unit test: breadcrumb (link, chữ thường, `navigable` → nút phát `navigate`, item cuối `aria-current` không bao giờ là link/nút), page header chuyển tiếp `navigate`, tiêu đề `tabindex="-1"` và `focusTitle()` với `headingLevel` 1 và 2
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/page-header.ts:52`: `nxt-page-header` chưa cho đổi nhãn landmark của breadcrumb bên trong (mặc định "Đường dẫn trang", đã đổi từ "Breadcrumb" ngày 2026-10-19).
- `src/page-header.ts`: `link` chỉ nhận `routerLink` dạng chuỗi, bắt buộc có Router; không truyền được `href` ngoài, query params. Ứng dụng không có router dùng `navigable` + `navigate`.
- `src/page-header.ts:57`: `headingLevel` ngoài 1/2 lặng lẽ thành `h1`.
- `src/page-header.css:6`, `:17`: gap dùng primitive `--nxt-space-1`.

### Bổ sung (2026-10-19)
- **Breadcrumb bấm được không qua router.** Trường `navigable` của `NxtBreadcrumbItem` và output `navigate` (trên `nxt-breadcrumb`, `nxt-page-header` chuyển tiếp). Phát hiện ở template Quy trình duyệt: danh sách và trình sửa là hai màn hình đổi bằng `@if`, không có route, nên item "Quy trình duyệt" trong breadcrumb của trình sửa không bấm được. Item có `link` vẫn là `a[routerLink]` như cũ; item cuối vẫn là `aria-current="page"`, không bao giờ bấm được. Chọn một cờ trên item (không phải input cấp breadcrumb) vì trong cùng breadcrumb có item là nhóm không có trang ("Thiết lập") đứng cạnh item bấm được.
- **Tiêu đề nhận focus.** Tiêu đề có `tabindex="-1"`; method `focusTitle(options?)`. Trước đây template tự `querySelector('.nxt-page-header__title')` và gắn `tabIndex`, phụ thuộc class nội bộ.
- Link và nút của breadcrumb cao tối thiểu `size.icon.lg` (24px) để đạt vùng chạm WCAG 2.5.8.

---
component: table
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: table
---

# Table & Sort: Spec

Entry `@nxt/ui/table` gồm `table[nxtTable]` (style cho bảng native), `[nxtSort]` (giữ trạng thái sắp xếp) và `th[nxtSortHeader]` (tiêu đề cột sắp xếp được).

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** đọc, so sánh và thao tác trên nhiều bản ghi cùng lúc: danh sách nhân viên, đơn chờ duyệt, bảng lương, với hàng theo density, số căn phải và sắp xếp theo cột.
- **Khi nào dùng:** dữ liệu dạng hàng × cột, người dùng cần so sánh giá trị giữa các hàng, chọn hàng để thao tác hàng loạt, sắp xếp.
- **Khi nào KHÔNG dùng:**
  - Bố cục trang hoặc form nhiều cột: dùng `nxt-grid` / `nxt-stack`.
  - Lưới chỉnh sửa trực tiếp trong ô, điều hướng ô bằng phím mũi tên: cần data grid (APG grid), chưa có.
  - Vài cặp nhãn – giá trị của một bản ghi: dùng danh sách mô tả (`dl`).
  - Dòng thời gian sự kiện: dùng `nxt-timeline`.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | `table[nxtTable]` | ✓ | Bảng native, rộng 100%, nền `table.bg` |
| 2 | `caption` hoặc `aria-label` | ✓ | Do nơi dùng đặt: tên của bảng |
| 3 | `thead th` | ✓ | Nền `header-bg`, chữ `label-sm`, không xuống dòng; dính đầu khi `stickyHeader` |
| 4 | `th[nxtSortHeader]` | — | Bọc nội dung trong `button.nxt-sort-header` + icon sắp xếp |
| 5 | `tbody tr` | ✓ | Cao `row-height`, nền hover; nền `row-bg-selected` khi `aria-selected="true"` |
| 6 | Ô chọn `.nxt-table__select` | — | Cột checkbox chọn hàng (`nxt-checkbox hideLabel`) |
| 7 | Ô số `.nxt-table__num` | — | Căn phải, `tabular-nums`; tiêu đề sắp xếp đảo icon sang trái |
| 8 | Ô hành động `.nxt-table__actions` | — | Co tối thiểu, căn phải, không xuống dòng |

## 3. API (Angular)
Selector: `table[nxtTable]`, `[nxtSort]`, `th[nxtSortHeader]`. Export type `NxtSortDirection` = `'asc' | 'desc' | ''`, `NxtSortState` = `{ active: string; direction: NxtSortDirection }`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxtTable` input | `stickyHeader` | `boolean` | `false` | Hàng tiêu đề dính đầu khi cuộn trong container; phản ánh ra `data-sticky` |
| `nxtTable` content | (default) | `caption`, `thead`, `tbody`, `tfoot` | | Cấu trúc bảng native |
| `nxtSort` model | `nxtSort` | `NxtSortState` | `{ active: '', direction: '' }` | Two-way `[(nxtSort)]="sort"` |
| `nxtSort` method | `toggle(key)` | `(key: string) => void` | | Không sắp xếp → tăng dần → giảm dần → không sắp xếp; đổi sang cột khác bắt đầu từ tăng dần |
| `nxtSortHeader` input | `nxtSortHeader` | `string` | (bắt buộc) | Khoá của cột |
| `nxtSortHeader` content | (default) | text | | Tên cột |

Output: `nxtSortChange` (từ `model`). `nxtSortHeader` phải nằm trong một phần tử có `[nxtSort]`. Component **không** tự sắp xếp hay phân trang dữ liệu: nơi dùng sắp xếp theo `NxtSortState` (chuỗi tiếng Việt dùng `Intl.Collator('vi')`) và ghép với `nxt-pagination`.

## 4. Variants & sizes
Không có variant thị giác. Chiều cao theo density:

| | comfortable | compact | spacious |
|-|-------------|---------|----------|
| Hàng (`size.row.md`) | 40px | 32px | 48px |
| Tiêu đề (`size.row.sm`) | 32px | 28px | 40px |

| Cách dùng | Cấu hình |
|-----------|----------|
| Bảng cơ bản | `table[nxtTable]` |
| Sắp xếp | `[(nxtSort)]` trên `table` + `th[nxtSortHeader]` |
| Tiêu đề dính | `stickyHeader`, đặt bảng trong container có chiều cao và `overflow: auto` |
| Chọn hàng | Cột `.nxt-table__select` với `nxt-checkbox`, `tr[aria-selected]` |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ nền hàng `surface-hover`; tiêu đề sắp xếp chữ đậm màu | ✓ ring token trên nút sắp xếp và control trong ô | — | ✓ hàng `aria-selected="true"`; cột đang sắp xếp: chữ `text.strong`, icon `icon.primary`, `aria-sort` | — | — (nơi dùng đặt skeleton hàng) | — (nơi dùng đặt alert) | — | — (nơi dùng đặt `nxt-empty-state` trong một hàng `colspan`) |

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/table/ (ví dụ sortable table)

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Đi qua các nút sắp xếp và control trong ô theo thứ tự DOM; bảng không phải grid nên không có điều hướng ô bằng mũi tên |
| Enter / Space | Trên nút sắp xếp: đổi chiều sắp xếp của cột (native `button`) |

- Ngữ nghĩa bảng native (`table`, `th`, `td`), không gắn `role`. Bảng cần tên qua `caption` hoặc `aria-label`.
- `th[nxtSortHeader]`: `aria-sort="ascending" | "descending"` **chỉ** trên cột đang sắp xếp; cột khác không có `aria-sort`. Tên nút là tên cột; icon sắp xếp là trang trí.
- Hàng được chọn: `aria-selected="true"` do nơi dùng đặt trên `tr`; trạng thái chọn đọc được qua checkbox trong hàng.

## 7. Tokens
`packages/tokens/src/component/table.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `bg` | `color.bg.surface` |
| `header-bg` | `color.bg.subtle` |
| `header-text` | `color.text.subtle` |
| `row-border` | `color.border.subtle` |
| `row-bg-hover` | `color.bg.surface-hover` |
| `row-bg-selected` | `color.bg.selected` |
| `row-height` | `size.row.md` |
| `header-height` | `size.row.sm` |
| `sort-icon` | `color.icon.subtle` |
| `sort-icon-active` | `color.icon.primary` |

Dùng thẳng semantic: `color.text.{default,strong}`, `space.inset.{xs,md}`, `size.control.md` (cột chọn), `size.icon.sm`, `border-width.default`, `radius.control`, `z.sticky`, `typography.{body-md,label-sm}`, `focus.ring.*`, `motion.duration.fast`. Cặp `text.default` / `bg.selected` và `text.subtle` / `surface-hover` có trong `contrastPairs`.

## 8. Density, responsive, i18n
- Chiều cao hàng và tiêu đề theo `size.row.*`; padding ô theo density.
- Bảng rộng 100% và không tự cuộn ngang: đặt trong container `overflow-x: auto` khi có nhiều cột. Tiêu đề không xuống dòng.
- Số liệu căn phải (`.nxt-table__num`), `tabular-nums`; tiền và ngày định dạng theo `vi`: "1.250.000 ₫", "15/10/2026".
- Sắp xếp chuỗi tiếng Việt theo collation `vi` (do nơi dùng).

## 9. Content guidelines
- Tiêu đề cột là danh từ ngắn: "Họ và tên", "Phòng ban", "Ngày vào làm". Đơn vị ghi trong tiêu đề: "Lương cơ bản (₫)".
- Ô trống ghi "—", không để trắng.
- Tên người dài: cắt "…" kèm tooltip; không để làm vỡ hàng.
- Hành động trong hàng tối đa 2 nút `ghost` / icon, còn lại gom vào menu "Thêm thao tác".

## 10. Acceptance (Definition of Done)
- [ ] Bảng cơ bản, sắp xếp, chọn hàng, tiêu đề dính, cột hành động có trong docs example
- [x] Unit test: giữ ngữ nghĩa bảng native và cờ sticky, nút sắp xếp nằm trong `th` + `aria-sort` chỉ trên cột đang sắp xếp, vòng none → asc → desc → none, đổi cột bắt đầu từ asc
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/table.css:27`–`31`: tiêu đề dính có thể che control đang focus trong hàng khi Tab cuộn bảng (WCAG 2.4.11); chưa có `scroll-padding-block-start` cho container.
- `src/table.css:50`: `aria-selected` trên `tr` của bảng native (không phải grid) thường không được screen reader đọc; trạng thái chọn thực tế chỉ đến từ checkbox trong hàng. Cần ghi rõ trong docs: luôn có checkbox có tên.
- Chưa có trạng thái loading / empty / error dựng sẵn và chưa có wrapper cuộn ngang; mỗi màn hình tự dựng.
- `src/table.ts:69`: `th[nxtSortHeader]` không có `[nxtSort]` ở tổ tiên sẽ lỗi DI lúc chạy, không có thông báo rõ.
- `src/table.css:7`, `:91`, `:103`: màu chữ dùng thẳng `--nxt-color-text-*`; `:79`–`81` dùng primitive `--nxt-space-1`, `--nxt-space-0-5`.

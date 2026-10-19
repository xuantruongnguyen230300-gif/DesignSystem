---
component: card
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: "none (presentational)"
---

# Card & Stat: Spec

Entry `@nxt/ui/card` gồm hai component: `nxt-card` (bề mặt gom nhóm nội dung) và `nxt-stat` (một chỉ số chính kèm xu hướng).

## 1. Mục đích
- **Vấn đề người dùng giải quyết:**
  - `nxt-card`: tách một khối nội dung liên quan (widget dashboard, section form, panel danh sách) khỏi nền trang, có tiêu đề và hành động riêng.
  - `nxt-stat`: đọc nhanh một chỉ số và biết nó tăng hay giảm so với kỳ trước, tốt hay xấu.
- **Khi nào dùng:** card đặt trực tiếp trên canvas của trang; stat đặt trong card hoặc trong một dải stat gọn phía trên bảng.
- **Khi nào KHÔNG dùng:**
  - Card trong card: cấm (principles §4). Bên trong card dùng section + divider / khoảng trắng (`nxt-stack`).
  - Bọc mọi thứ thành card cho "đẹp": chỉ dùng khi khối nội dung thật sự độc lập.
  - Card bấm được để điều hướng: chưa hỗ trợ; đặt link trong tiêu đề hoặc nút trong `[nxtCardActions]`.
  - Số liệu "hero" khổng lồ trên dashboard nghiệp vụ: dùng dải stat gọn + bảng/biểu đồ có ngữ cảnh.

## 2. Anatomy
**Card**

| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-card` | ✓ | Nền `surface`, viền, bo `radius.container`, `elevation.raised` |
| 2 | Header `.nxt-card__header` | — | Chỉ render khi có `title` |
| 3 | Tiêu đề `h2` / `h3` / `h4` | — | Theo `headingLevel` |
| 4 | Phụ đề `.nxt-card__subtitle` | — | Khi có `subtitle` |
| 5 | Hành động `[nxtCardActions]` | — | Nằm trong header, căn phải; ẩn khi rỗng |
| 6 | Thân `.nxt-card__body` | ✓ | Nội dung chiếu vào mặc định; padding theo `padding` |
| 7 | Footer `[nxtCardFooter]` | — | Chiếu vào sau thân, không có wrapper hay style riêng |

**Stat**

| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Icon `.nxt-stat__icon` | — | Vuông bo góc, `aria-hidden="true"` |
| 2 | Nhãn `.nxt-stat__label` | ✓ | |
| 3 | Giá trị `.nxt-stat__value` + đơn vị | ✓ | `tabular-nums`; đơn vị nhỏ hơn, màu phụ |
| 4 | Thay đổi `.nxt-stat__delta` | — | Icon xu hướng + chữ ẩn "Tăng/Giảm/Không đổi" + `delta` + `caption` |

## 3. API (Angular)
Selector: `nxt-card`, `nxt-stat`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxt-card` input | `title` | `string` | `undefined` | Không có `title` thì không có header |
| `nxt-card` input | `subtitle` | `string` | `undefined` | |
| `nxt-card` input | `headingLevel` | `number` (`numberAttribute`) | `2` | `3` → `h3`, `4` → `h4`, giá trị khác → `h2` |
| `nxt-card` input | `padding` | `'none' \| 'md' \| 'lg'` | `'md'` | `none` cho nội dung tràn mép như bảng; phản ánh ra `data-padding` |
| `nxt-card` content | (default) | bất kỳ | | Thân card |
| `nxt-card` content | `[nxtCardActions]` | nút, menu | | Chỉ hiện khi có `title` |
| `nxt-card` content | `[nxtCardFooter]` | bất kỳ | | Chiếu vào cuối card, tự lo style |
| `nxt-stat` input | `label` | `string` | (bắt buộc) | "Tổng nhân viên" |
| `nxt-stat` input | `value` | `string` | (bắt buộc) | Đã định dạng theo `vi-VN`: "1.284" |
| `nxt-stat` input | `unit` | `string` | `undefined` | "người", "₫" |
| `nxt-stat` input | `icon` | `NxtIconName` | `undefined` | |
| `nxt-stat` input | `delta` | `string` | `undefined` | Đã định dạng: "2,1%". Không có thì không hiện dòng thay đổi |
| `nxt-stat` input | `trend` | `'up' \| 'down' \| 'flat'` | `'flat'` | Chọn icon và chữ ẩn |
| `nxt-stat` input | `deltaTone` | `'positive' \| 'negative' \| 'neutral'` | `'neutral'` | Tốt/xấu khai báo riêng, vì "tăng" không phải lúc nào cũng tốt |
| `nxt-stat` input | `caption` | `string` | `undefined` | "so với tháng trước" |

Không có output.

## 4. Variants & sizes
| Padding (card) | comfortable | compact | spacious | Dùng khi |
|----------------|-------------|---------|----------|----------|
| `md` | 16px (`space.inset.lg`) | 12px | 20px | Mặc định |
| `lg` | 16px (`space.section.sm`) | 12px | 24px | Card nội dung đọc nhiều |
| `none` | 0 | 0 | 0 | Bảng, danh sách tràn mép |

| `trend` × `deltaTone` | Ví dụ |
|-----------------------|-------|
| `up` + `neutral` | Tổng nhân viên tăng |
| `up` + `negative` | Tỉ lệ nghỉ việc tăng |
| `down` + `positive` | Số ngày nghỉ không phép giảm |
| `flat` + `neutral` | Không đổi |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | — (card không tương tác) | — (theo control bên trong) | — | — | — | — (đặt skeleton trong thân) | — (đặt alert trong thân) | — | — (đặt `nxt-empty-state size="sm"` trong thân) |

## 6. Keyboard & ARIA
APG pattern: không áp dụng.

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Chỉ control trong header / thân / footer nhận focus; card không nhận focus |

- Card không có `role`. Tiêu đề là heading thật: chọn `headingLevel` cho đúng cấu trúc trang (`h1` là tiêu đề trang).
- Stat: icon chính và icon xu hướng đều `aria-hidden` (qua `nxt-icon` không `label`). Xu hướng được đọc bằng chữ ẩn "Tăng" / "Giảm" / "Không đổi" đặt trước `delta`, nên không chỉ truyền bằng màu hay icon.
- Màu tốt/xấu của `delta` luôn đi cùng chữ và icon (WCAG 1.4.1).

## 7. Tokens
`packages/tokens/src/component/card.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `bg` | `color.bg.surface` |
| `border` | `color.border.default` |
| `radius` | `radius.container` |
| `title-text` | `color.text.strong` |
| `subtitle-text` | `color.text.subtle` |

`packages/tokens/src/component/stat.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `label-text` | `color.text.subtle` |
| `value-text` | `color.text.strong` |
| `positive-text` / `negative-text` / `neutral-text` | `color.text.success` / `color.text.danger` / `color.text.subtle` |
| `icon-bg` / `icon-color` | `color.bg.primary-subtle` / `color.icon.primary` |
| `icon-radius` | `radius.container` |

Dùng thẳng semantic: `elevation.raised`, `border-width.default`, `space.inset.{md,lg}`, `space.section.sm`, `space.gap.{xs,md}`, `size.control.lg`, `size.icon.{sm,md}`, `typography.{heading-sm,heading-lg,body-sm,body-md,label-sm,caption}`.

## 8. Density, responsive, i18n
- Padding và gap theo density. Vòng icon stat theo `size.control.lg` (40 / 32 / 48px).
- Card `min-inline-size: 0`, nên co được trong `nxt-grid`; header xếp tiêu đề bên trái, hành động bên phải.
- Stat: `value`, `delta` nhận chuỗi **đã định dạng** theo `vi-VN` (dấu chấm hàng nghìn, dấu phẩy thập phân: "1.284", "2,1%"). Component không tự định dạng số.
- Chữ ẩn xu hướng là tiếng Việt cố định trong code.

## 9. Content guidelines
- Tiêu đề card là danh từ ngắn: "Nhân sự theo phòng ban", "Đơn chờ duyệt". Phụ đề bổ sung phạm vi: "Tháng 10/2026".
- Nhãn stat nêu đại lượng: "Tổng nhân viên", "Tỉ lệ nghỉ việc". `caption` nêu kỳ so sánh: "so với tháng trước".
- `deltaTone` phản ánh ý nghĩa nghiệp vụ, không phải hướng mũi tên.
- Tối đa 2–3 hành động trong `[nxtCardActions]`; nhiều hơn thì gom vào menu.

## 10. Acceptance (Definition of Done)
- [ ] Card có/không header, ba mức `padding`, có footer; stat với các tổ hợp `trend` × `deltaTone` có trong docs example
- [ ] Unit test (chưa có)
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/card.ts:29`: `[nxtCardActions]` nằm trong `@if (title())`, nên card không có `title` sẽ lặng lẽ bỏ mất hành động được chiếu vào.
- `src/card.ts:33`: `[nxtCardFooter]` không có wrapper, padding hay divider; nơi dùng phải tự style, dễ lệch nhau giữa các màn hình.
- `src/card.css:13`: `padding="lg"` (`space.section.sm`) bằng đúng `md` (`space.inset.lg`) ở comfortable và compact (16px, 12px); chỉ khác ở spacious.
- `src/card.ts:14`: `headingLevel` ngoài 2/3/4 lặng lẽ thành `h2`.
- `src/card.ts:104`: chữ ẩn xu hướng ("Tăng"/"Giảm"/"Không đổi") viết cứng, không đổi được khi sản phẩm cần thuật ngữ khác.
- `src/card.css:30`, `:91`, `:107`, `:117`: gap / margin dùng primitive `--nxt-space-0-5`, `--nxt-space-1` thay vì semantic `space.gap.*`, không theo density.

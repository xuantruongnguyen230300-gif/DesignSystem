---
component: icon
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: "none (presentational)"
---

# Icon: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** nhận ra hành động hoặc loại đối tượng nhanh hơn đọc chữ, với cùng một bộ icon ở mọi sản phẩm.
- **Khi nào dùng:** icon đi kèm nhãn trong nút, menu, nav, tag, trạng thái rỗng; icon đứng một mình chỉ khi nghĩa của nó đã hiển nhiên và có `label`.
- **Khi nào KHÔNG dùng:**
  - Nút chỉ có icon: dùng `button[nxtIconButton]` kèm `aria-label` (và tooltip); không đặt `nxt-icon` có `(click)`.
  - Ảnh minh hoạ, logo sản phẩm: dùng `img` / SVG riêng, không đưa vào bộ icon.
  - Emoji làm icon: cấm (xem principles §4).
  - Icon ngoài bộ đã chọn: thêm tên vào `packages/ui/icon/icons.json` rồi chạy `npm run icons:build`, không dán SVG tay.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-icon` | ✓ | `inline-flex`, kích thước vuông theo `--_size` |
| 2 | `svg` | ✓ | `viewBox="0 0 24 24"`, `stroke="currentColor"`, `focusable="false"` |
| 3 | `path` | ✓ | Sinh bằng `@for` từ `NXT_ICONS` (không dùng `innerHTML`, an toàn với CSP) |

## 3. API (Angular)
Selector: `nxt-icon`. Export kèm `NXT_ICONS`, type `NxtIconName`, `NxtIconPath`, `NxtIconSize`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `name` | `NxtIconName` | (bắt buộc) | Tên trong bộ đã chọn; gõ sai tên báo lỗi lúc compile |
| input | `size` | `'sm' \| 'md' \| 'lg'` | `undefined` | 16 / 20 / 24px. Bỏ trống thì nhận `--nxt-icon-size` từ component cha |
| input | `label` | `string` | `undefined` | Tên truy cập. Chỉ dùng khi icon mang nghĩa mà không có chữ đi kèm |

Bộ icon: 259 icon Tabler outline (v3.49.0, MIT), chia nhóm `navigation`, `actions`, `status`, `people`, `hr`, `design-system` trong `icons.json`. File `src/icons.generated.ts` là file sinh, không sửa tay.

## 4. Variants & sizes
Không có variant màu: icon dùng `currentColor`, nên màu theo chữ của phần tử cha.

| Size | Giá trị | Ghi chú |
|------|---------|---------|
| `sm` | 16px (`size.icon.sm`) | Trong nút, tag, ô bảng |
| `md` | 20px (`size.icon.md`) | Mặc định của `--nxt-icon-size` |
| `lg` | 24px (`size.icon.lg`) | Trạng thái rỗng, nav |
| (bỏ trống) | `--nxt-icon-size` | Component cha đặt biến này (ví dụ Button đặt bằng `--nxt-button-icon-size`) |

Kích thước icon không đổi theo density.

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | — (theo phần tử cha) | — (không nhận focus) | — | — | — (màu theo cha) | — | — | — | — |

## 6. Keyboard & ARIA
APG pattern: không áp dụng.

| Phím | Hành vi |
|------|---------|
| — | Không nhận focus: `svg` có `focusable="false"` và không nằm trong thứ tự Tab |

- Mặc định là trang trí: `aria-hidden="true"` trên `svg`, không có `role`.
- Có `label`: `svg` nhận `role="img"` và `aria-label="{label}"`, bỏ `aria-hidden`.
- Forced colors: nét vẽ chuyển sang `CanvasText`.

## 7. Tokens
`packages/tokens/src/component/icon.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `size` | `size.icon.md` |
| `stroke` | `size.icon.stroke` (1.75) |

Size `sm`/`md`/`lg` dùng thẳng `size.icon.{sm,md,lg}`.

## 8. Density, responsive, i18n
- Kích thước icon cố định qua mọi density; component cha quyết định cỡ qua `--nxt-icon-size`.
- Icon có hướng (mũi tên, chevron) chưa tự lật khi `dir="rtl"`. Tiếng Việt là LTR nên chưa cần.
- `label` là tiếng Việt, mô tả nghĩa chứ không mô tả hình: "Cảnh báo", không viết "Tam giác chấm than".

## 9. Content guidelines
- Một nghĩa một icon trên toàn hệ thống: `edit` cho sửa, `trash` cho xoá. Không dùng cùng một icon cho hai hành động khác nhau.
- Icon đứng cạnh chữ thì không truyền `label` (chữ đã là tên).
- Icon trạng thái luôn đi kèm text hoặc `label`, không truyền đạt trạng thái chỉ bằng màu.

## 10. Acceptance (Definition of Done)
- [ ] Mọi kích thước ở §4 và cách kế thừa `--nxt-icon-size` có trong docs example
- [x] Unit test: trang trí mặc định (ẩn, không focus), `label` → `role="img"`, render path không qua `innerHTML`, bộ icon không rỗng
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/icon.css:21`: trong `forced-colors`, nét bị ép về `CanvasText` kể cả khi icon nằm trong phần tử dùng `HighlightText`/`ButtonText` (item được chọn), có thể mất tương phản; `stroke="currentColor"` đã tự theo màu hệ thống.
- Icon có hướng chưa có cơ chế lật theo `dir="rtl"` (chưa cần cho tiếng Việt).

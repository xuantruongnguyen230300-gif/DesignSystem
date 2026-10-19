---
component: tooltip
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: tooltip
---

# Tooltip: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** xem gợi ý ngắn cho một control mà không làm chật giao diện: tên của nút chỉ có icon, lý do một nút đang bị vô hiệu, tên đầy đủ khi chữ bị cắt.
- **Khi nào dùng:** gắn lên phần tử **nhận focus được** (nút, link, control), nội dung một câu ngắn, không có tương tác.
- **Khi nào KHÔNG dùng:**
  - Nội dung có link, nút hoặc cần đọc lâu: dùng popover / drawer (chưa có popover; tạm dùng `nxt-drawer`).
  - Thông tin bắt buộc để hoàn thành việc (định dạng nhập, quy tắc mật khẩu): dùng helper text của `nxt-form-field`, luôn hiển thị.
  - Thông báo lỗi: dùng lỗi của `nxt-form-field` hoặc inline alert.
  - Phần tử không nhận focus (`span`, ô bảng thường): người dùng bàn phím không mở được tooltip.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `[nxtTooltip]` | ✓ | Phần tử gốc; nhận `aria-describedby` khi tooltip đang hiện (xem §6) |
| 2 | Overlay pane `.nxt-tooltip-pane` | ✓ | CDK Overlay, `pointer-events: auto` để rê chuột vào được |
| 3 | Panel `nxt-tooltip-panel` | ✓ | `role="tooltip"`, `id` duy nhất, chỉ chứa text |

## 3. API (Angular)
Selector: `[nxtTooltip]` (directive). Panel `NxtTooltipPanel` là nội bộ, export để overlay dùng. Export type `NxtTooltipPosition`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `nxtTooltip` | `string` | `''` | Nội dung. Chuỗi rỗng (sau `trim`) thì không hiện |
| input | `nxtTooltipPosition` | `'top' \| 'bottom' \| 'start' \| 'end'` | `'top'` | Vị trí ưu tiên; tự lật sang phía đối diện khi thiếu chỗ, `withPush` giữ trong viewport |
| input | `nxtTooltipDisabled` | `boolean` | `false` | Tắt tooltip |
| input | `nxtTooltipDelay` | `number` | `300` | Độ trễ khi hover (ms). Focus bàn phím hiện ngay |
| method | `show()` | `() => void` | | Mở bằng code |
| method | `hide()` | `() => void` | | Đóng bằng code |

Không có output. Khoảng cách tới host: 6px (trên/dưới), 8px (đầu/cuối).

## 4. Variants & sizes
Một biến thể: nền đảo (`bg.inverse`), chữ `caption`, rộng tối đa 320px, tự xuống dòng.

| Position | Phía ưu tiên | Lật sang |
|----------|--------------|----------|
| `top` | Trên, căn giữa | Dưới |
| `bottom` | Dưới, căn giữa | Trên |
| `start` | Đầu dòng (trái ở LTR) | Cuối |
| `end` | Cuối dòng | Đầu |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ ẩn | ✓ hiện sau `nxtTooltipDelay`; rê chuột vào tooltip vẫn giữ mở | ✓ hiện ngay khi focus | ✓ click vào host thì đóng | — | ✓ `nxtTooltipDisabled` không hiện | — | — | — | ✓ text rỗng không hiện |

Rời chuột khỏi host hoặc tooltip: đóng sau 100ms. Cuộn trang: đóng (`scrollStrategies.close`). Xuất hiện bằng fade `motion.duration.fast`; motion `reduced` đưa về 0.

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Focus vào host → hiện tooltip ngay; rời focus → đóng |
| Escape | Đóng tooltip (bắt ở host và ở `document`, capture phase), focus giữ nguyên |

- Panel: `role="tooltip"`, `id="nxt-tooltip-{n}"`.
- Host nhận `aria-describedby="{id}"` khi tooltip hiện, **chỉ khi** text khác tên truy cập của host (`aria-label` hoặc text content). Nút icon có `aria-label` = text tooltip thì không bị đọc lặp. Khi đóng, `id` được gỡ khỏi `aria-describedby`, giữ nguyên các id khác.
- WCAG 1.4.13: rê chuột vào được (hoverable), đóng được bằng Escape (dismissible), giữ nguyên tới khi rời hover/focus (persistent).
- Forced colors: panel có viền `CanvasText`.

## 7. Tokens
`packages/tokens/src/component/tooltip.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `bg` | `color.bg.inverse` |
| `text` | `color.text.inverse` |
| `radius` | `radius.control` |
| `max-width` | `layout.item-min-lg` (320px) |

Dùng thẳng semantic: `space.inset.{xs,sm}`, `typography.caption`, `elevation.overlay`, `motion.duration.fast`, `motion.ease.enter`. Cặp `text.inverse` / `bg.inverse` có trong `contrastPairs`.

## 8. Density, responsive, i18n
- Padding theo density; chữ `caption` 12px không nhỏ hơn.
- Vị trí `start`/`end` dùng toạ độ logic của CDK, theo `dir` của trang.
- Không có hành vi riêng cho màn hình cảm ứng (không long-press); trên thiết bị cảm ứng, thông tin trong tooltip có thể không xem được.

## 9. Content guidelines
- Một câu ngắn, không chấm câu nếu chỉ là cụm từ: "Xuất file Excel", "Sửa hồ sơ".
- Giải thích nút bị vô hiệu bằng lý do cụ thể: "Chỉ trưởng phòng mới duyệt được đơn này".
- Không lặp lại nhãn đã hiển thị. Không đặt thông tin bắt buộc chỉ trong tooltip.

## 10. Acceptance (Definition of Done)
- [ ] Bốn vị trí ở §4, tooltip trên nút icon, trên nút bị vô hiệu có trong docs example
- [x] Unit test: hiện khi focus kèm mô tả, không lặp tên, Escape chỉ đóng tooltip (`src/tooltip.spec.ts`)
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/tooltip.ts:23`–`36`: offset 6px / 8px viết cứng trong TS, không theo token.
- `src/tooltip.ts:134`: tên truy cập chỉ tính từ `aria-label` / text content, bỏ qua `aria-labelledby`; có thể gắn `aria-describedby` trùng nội dung tên.
- Không cảnh báo khi gắn lên phần tử không nhận focus (bàn phím không mở được).

### Đã xử lý (2026-10-19)
- Focus hiện tooltip đồng bộ; id và nội dung panel được render (`detectChanges`) trước khi gắn `aria-describedby`. Có unit test.
- Escape khi tooltip đang mở bị chặn lan truyền: chỉ đóng tooltip, không đóng drawer/menu bao quanh. Có unit test.
- Vị trí được áp lại mỗi lần hiện. Còn lại: đổi `nxtTooltip` khi đang hiện chưa cập nhật panel.

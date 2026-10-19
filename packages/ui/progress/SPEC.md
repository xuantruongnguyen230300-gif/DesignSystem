---
component: progress
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: "none (progressbar role, không có APG pattern riêng)"
---

# Progress: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** thấy nhanh mức hoàn thành của một đại lượng đã biết tổng: tỉ lệ hồ sơ đã nộp, hạn mức đã dùng, số bước đã duyệt.
- **Khi nào dùng:** giá trị xác định 0–100, đặt cạnh nhãn và số liệu dạng chữ (ví dụ trong stat, hàng bảng, thẻ).
- **Khi nào KHÔNG dùng:**
  - Đang tải mà chưa biết bao lâu: dùng skeleton hoặc `loading` của component (không có biến thể indeterminate).
  - Quy trình nhiều bước có tên bước: dùng `nxt-timeline` (hoặc stepper khi có).
  - So sánh nhiều giá trị với nhau: dùng biểu đồ cột.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-progress` (track) | ✓ | `role="progressbar"`, nền `track`, bo `radius.pill` |
| 2 | Fill `.nxt-progress__fill` | ✓ | `inline-size` = phần trăm, màu theo `tone` |
| 3 | Nhãn và số liệu hiển thị | — | Do nơi dùng đặt bên ngoài; component không tự hiện chữ |

## 3. API (Angular)
Selector: `nxt-progress`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `value` | `number` (`numberAttribute`) | `0` | 0–100; làm tròn và kẹp về khoảng 0–100 |
| input | `label` | `string` | (bắt buộc) | Tên truy cập (`aria-label`) |
| input | `valueText` | `string` | `undefined` | Giá trị đọc bằng lời: "92 trên 100 hồ sơ" (`aria-valuetext`) |
| input | `tone` | `'brand' \| 'success' \| 'warning' \| 'danger'` | `'brand'` | Màu phần đã đạt; phản ánh ra `data-tone` |

Không có output, không có content slot.

## 4. Variants & sizes
| Tone | Dùng khi | Không dùng khi |
|------|----------|----------------|
| `brand` | Mặc định: tiến độ trung tính | Giá trị có ngưỡng tốt/xấu rõ ràng |
| `success` | Đã đạt hoặc vượt ngưỡng mục tiêu | Chỉ để trang trí |
| `warning` | Gần chạm hạn mức, sắp trễ hạn | |
| `danger` | Vượt hạn mức, trễ hạn | |

Một kích thước duy nhất: dày 8px (`--nxt-space-2`), rộng theo phần tử cha. Không đổi theo density.

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | — (không tương tác) | — | — | — | — | — (không có indeterminate) | — (dùng `tone="danger"` + chữ) | — | ✓ `value=0`: chỉ còn track |

Thay đổi giá trị có chuyển động `motion.duration.slow`; motion `reduced` đưa về 0.

## 6. Keyboard & ARIA
Role: https://www.w3.org/TR/wai-aria-1.2/#progressbar (APG không có pattern riêng cho progressbar).

| Phím | Hành vi |
|------|---------|
| — | Không nhận focus, không nằm trong thứ tự Tab |

- Host: `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow` = phần trăm đã làm tròn, `aria-label` = `label`, `aria-valuetext` = `valueText` khi có.
- Tone không được là nguồn thông tin duy nhất: luôn có số liệu hoặc nhãn trạng thái dạng chữ bên cạnh (WCAG 1.4.1).
- Forced colors: track có viền `CanvasText`, fill dùng `Highlight`.

## 7. Tokens
`packages/tokens/src/component/progress.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `track` | `color.bg.muted` |
| `fill` | `color.bg.primary` |
| `fill-success` | `color.icon.success` |
| `fill-warning` | `color.icon.warning` |
| `fill-danger` | `color.icon.danger` |
| `radius` | `radius.pill` |

Dùng thẳng: `motion.duration.slow`, `motion.ease.standard`; độ dày dùng `--nxt-space-2`.

## 8. Density, responsive, i18n
- Độ dày không đổi theo density; bề rộng co giãn theo phần tử cha (`display: block`).
- Phần trăm hiển thị và `valueText` theo locale `vi`: "92%", "1.250 trên 2.000 hồ sơ" (dấu chấm phân cách hàng nghìn).

## 9. Content guidelines
- `label` nêu đại lượng đang đo: "Tỉ lệ nộp hồ sơ", "Hạn mức nghỉ phép đã dùng"; không viết "Tiến độ" chung chung.
- `valueText` đọc được như câu: "92 trên 100 hồ sơ", "12 trên 12 ngày phép".
- Số liệu hiển thị cạnh thanh luôn có, căn phải, `tabular-nums`.

## 10. Acceptance (Definition of Done)
- [ ] Mọi tone ở §4 và `value=0` / `value=100` có trong docs example
- [ ] Unit test (chưa có)
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/progress.css:5`: độ dày dùng `--nxt-space-2` (token khoảng cách primitive) cho kích thước; nên có component token `progress.height`.
- Tương phản fill so với track (`bg.primary`, `icon.*` trên `bg.muted`) chưa nằm trong `contrastPairs`; WCAG 1.4.11 cần ≥ 3:1 giữa phần đã đạt và rãnh.
- Không có biến thể indeterminate và không hỗ trợ `aria-labelledby` (chỉ nhận `label` dạng chuỗi), nên nhãn hiển thị bên ngoài phải lặp lại trong `label`.
- `src/progress.ts:23`: `value` chỉ hiểu thang 0–100, chưa có `max`; nơi dùng phải tự quy đổi phần trăm.

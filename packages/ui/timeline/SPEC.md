---
component: timeline
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: "none (list semantics)"
---

# Timeline: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** theo dõi một chuỗi sự kiện theo thời gian, ai làm gì lúc nào: lịch sử phê duyệt, lịch sử thay đổi hồ sơ, hoạt động gần đây.
- **Khi nào dùng:** danh sách sự kiện đã xảy ra (hoặc bước kế tiếp đang chờ), đọc từ trên xuống, mỗi mục có tiêu đề và thời gian.
- **Khi nào KHÔNG dùng:**
  - Dẫn người dùng qua các bước nhập liệu: dùng stepper / form nhiều bước (pattern `nxt-pattern`).
  - Dữ liệu cần lọc, sắp xếp, so sánh cột: dùng `nxt-table`.
  - Chỉ có một giá trị tiến độ: dùng `nxt-progress`.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-timeline` | ✓ | `role="list"`, cột dọc |
| 2 | Mục `nxt-timeline-item` | ✓ | `role="listitem"`, lưới 2 cột: marker + nội dung |
| 3 | Marker `.nxt-timeline__marker` | ✓ | Vòng tròn viền 2px theo `tone`, có thể chứa icon; `aria-hidden="true"`. Mốc `skipped`: viền nét đứt, icon mặc định `player-skip-forward` |
| 4 | Đường nối | ✓ | `::before`, nối tới mục kế; không có ở mục cuối |
| 5 | Tiêu đề `.nxt-timeline__title` | ✓ | Mốc `skipped`: chữ "Bỏ qua: " (`.nxt-timeline__skipped`, hiển thị) đứng trước tiêu đề |
| 6 | Thời gian `.nxt-timeline__time` | — | Khi có `time` |
| 7 | Thân `.nxt-timeline__body` | — | Nội dung chiếu vào (ghi chú, người thực hiện); ẩn khi rỗng |

## 3. API (Angular)
Selector: `nxt-timeline`, `nxt-timeline-item`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxt-timeline` content | (default) | `nxt-timeline-item` | | Các mục, theo thứ tự hiển thị |
| `nxt-timeline-item` input | `title` | `string` | (bắt buộc) | "Trưởng phòng đã duyệt" |
| `nxt-timeline-item` input | `time` | `string` | `undefined` | Đã định dạng: "14:32 · 15/10/2026" |
| `nxt-timeline-item` input | `icon` | `NxtIconName` | `undefined` | Icon trong marker |
| `nxt-timeline-item` input | `tone` | `'neutral' \| 'success' \| 'warning' \| 'danger' \| 'brand'` | `'neutral'` | Màu viền và icon của marker; phản ánh ra `data-tone`. Bị bỏ qua khi `skipped` |
| `nxt-timeline-item` input | `skipped` | `boolean` | `false` | Bước bị bỏ qua (không thoả điều kiện, không áp dụng): marker nét đứt + icon bỏ qua, chữ nhạt, chữ "Bỏ qua: " trước tiêu đề (mọi người đều đọc được); phản ánh ra `data-skipped` |
| `nxt-timeline-item` content | (default) | bất kỳ | | Thân mục |

Không có output.

## 4. Variants & sizes
| Tone | Dùng khi |
|------|----------|
| `neutral` | Sự kiện thông thường, bước chưa tới |
| `success` | Đã duyệt, hoàn tất |
| `warning` | Yêu cầu bổ sung, đang chờ |
| `danger` | Từ chối, huỷ |
| `brand` | Bước hiện tại |
| `skipped` (input riêng, không phải tone) | Bước bị bỏ qua: điều kiện không thoả, không áp dụng cho đơn này. Thắng `tone` |

Marker theo `size.control.sm` (28 / 24 / 32px), icon 16px. Không có input size.

`skipped` đổi **ba thứ không phải màu**: viền marker nét đứt, icon riêng (`player-skip-forward`, khi nơi dùng không truyền `icon`), và chữ "Bỏ qua: " hiển thị. Màu nhạt (`text.subtle`, `icon.subtle`) chỉ bổ trợ. Lý do bỏ qua do nơi dùng đặt vào `time` hoặc thân mục, **không** lặp lại chữ "Bỏ qua" (component đã ghi).

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | — (không tương tác) | — (theo link/nút trong thân) | — | — (dùng `tone="brand"` cho bước hiện tại) | — (bước không áp dụng dùng `skipped`, không phải disabled) | — (dùng skeleton) | — | — | — (nơi dùng hiện `nxt-empty-state size="sm"`) |

Trạng thái thêm: **Skipped** (`skipped`): marker nét đứt màu `marker-skipped`, icon bỏ qua, tiêu đề và thân màu `skipped-text`, chữ "Bỏ qua: " trước tiêu đề. Forced colors: nét đứt vẫn giữ nên vẫn phân biệt được.

## 6. Keyboard & ARIA
APG pattern: không áp dụng; dùng ngữ nghĩa danh sách.

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Chỉ link / nút trong thân mục nhận focus |

- `nxt-timeline`: `role="list"`; `nxt-timeline-item`: `role="listitem"`. Screen reader đọc được "danh sách, N mục".
- Marker (gồm icon) `aria-hidden="true"`: `tone` và `icon` **không** được đọc, nên `title` phải tự nói trạng thái ("Đã duyệt", "Từ chối"), không chỉ dựa vào màu (WCAG 1.4.1).
- Ngoại lệ là `skipped`: component tự thêm chữ "Bỏ qua: " (hiển thị) vào đầu tiêu đề (WCAG 1.1.1, 1.4.1; người nhìn cũng không phải đoán ý nghĩa của nét đứt), screen reader đọc "Bỏ qua: Bước 2 · Giám đốc khối, Chỉ áp dụng khi nghỉ trên 3 ngày". Tiêu đề giữ tên bước, không cần tự ghi "bỏ qua".
- Đã kiểm bằng Playwright e2e trong template phê duyệt (2026-10-19).

## 7. Tokens
`packages/tokens/src/component/timeline.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `line` | `color.border.default` |
| `marker-bg` | `color.bg.surface` |
| `marker-border` | `color.border.strong` (tone `neutral`) |
| `title-text` | `color.text.strong` |
| `time-text` | `color.text.subtle` |
| `marker-skipped` | `color.icon.subtle` (viền nét đứt và icon của mốc `skipped`; ≥ 3:1 trên `bg.surface` và `bg.canvas`) |
| `skipped-text` | `color.text.subtle` (tiêu đề và thân của mốc `skipped`; ≥ 4.5:1 trên `bg.surface` và `bg.canvas`) |

Tone `success` / `warning` / `danger` / `brand` mượn `--nxt-tag-{tone}-dot` (`color.icon.*`). Thân dùng thẳng `color.text.default`. Dùng thẳng semantic: `size.control.sm`, `size.icon.sm`, `border-width.{default,strong}`, `radius.pill`, `space.gap.{md,lg}`, `typography.{label-md,caption,body-sm}`.

## 8. Density, responsive, i18n
- Marker và khoảng cách giữa các mục theo density.
- Cột nội dung `minmax(0, 1fr)`: nội dung dài tự xuống dòng, không tràn; đặt được trong drawer hẹp.
- Thời gian truyền vào **đã định dạng** theo `vi`: "14:32 · 15/10/2026" (`HH:mm · dd/MM/yyyy`).

## 9. Content guidelines
- Tiêu đề = ai + làm gì: "Trần Thị Bình đã duyệt", "Phòng nhân sự yêu cầu bổ sung hồ sơ".
- Thứ tự nhất quán trong một sản phẩm (mới nhất ở trên cho hoạt động; theo thứ tự bước cho quy trình phê duyệt).
- Thân mục chứa ghi chú nguyên văn của người duyệt, không tóm tắt lại.

## 10. Acceptance (Definition of Done)
- [ ] Mọi tone ở §4, mục có icon, có thân, không có thời gian có trong docs example (mốc `skipped`: `timeline-skipped`)
- [x] Unit test: role list/listitem, `data-tone`, mốc `skipped` (data-skipped, icon mặc định, icon tuỳ chọn, chữ "Bỏ qua: ")
- [x] Playwright e2e: timeline trong template phê duyệt (2026-10-19)
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/timeline.css:17`–`20`: tone dùng component token của tag (`--nxt-tag-*-dot`), trái quy tắc "component chỉ dùng token của chính nó"; brand override tag sẽ kéo theo timeline. Nên có `timeline.marker-{tone}`.
- `src/timeline.ts:19`: marker (tone + icon) bị `aria-hidden`; trạng thái chỉ đến được screen reader nếu `title` tự nói ra. Cân nhắc chữ ẩn cho tone hoặc ghi rõ quy tắc này trong docs.
- `src/timeline.ts:27`: thời gian là `p`, không phải `<time datetime>`; không có giá trị máy đọc được.
- `src/timeline.css:64`: màu thân dùng thẳng `--nxt-color-text-default`, không qua component token.
- `src/timeline.css:45`–`46`: gap / padding dùng primitive `--nxt-space-0-5`.

### Bổ sung (2026-10-19)
- Input `skipped` (boolean, `data-skipped`): bước bị bỏ qua vì không thoả điều kiện, ví dụ "Chỉ áp dụng khi số ngày nghỉ > 3". Phát hiện khi dựng template Quy trình duyệt (mô phỏng đường đi của đơn): trước đây nơi dùng tự ghép `icon="minus"` + tone `neutral`, không phân biệt được với bước chưa tới và screen reader không biết bước đó bị bỏ qua.
- Thiết kế: không chỉ bằng màu. Viền marker nét đứt + icon `player-skip-forward` (thêm vào `icons.json`) + chữ "Bỏ qua: " trước tiêu đề (ban đầu chỉ cho screen reader, đổi thành hiển thị để người nhìn không phải đoán nét đứt); màu nhạt `icon.subtle` / `text.subtle` chỉ bổ trợ. Hai token component mới `marker-skipped`, `skipped-text`; cặp `icon.subtle` / `bg.canvas` (≥ 3:1) được thêm vào `contrastPairs`.
- `skipped` là input riêng, không phải giá trị `tone`: `tone` là màu, còn `skipped` mang thêm ngữ nghĩa (chữ ẩn) và đổi hình dạng marker. Khi có `skipped`, `tone` bị bỏ qua.
- Còn mở: chữ "Bỏ qua: " viết cứng tiếng Việt, giống chữ xu hướng của `nxt-stat`.

---
component: progress
status: beta
owner: "NXT core"
updated: 2026-11-16
apg-pattern: "none (progressbar role, không có APG pattern riêng)"
---

# Progress: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** thấy nhanh một tác vụ hoặc một đại lượng đang ở đâu. Có hai trường hợp:
  - **Xác định:** biết tổng, thấy mức hoàn thành: tỉ lệ hồ sơ đã nộp, hạn mức đã dùng, số bước đã duyệt.
  - **Không xác định (indeterminate):** biết là đang chạy nhưng không biết còn bao lâu: đồng bộ dữ liệu chấm công, tính lương, chờ máy chủ xử lý file.
- **Khi nào dùng:**
  - Giá trị xác định 0–100, đặt cạnh nhãn và số liệu dạng chữ (ví dụ trong stat, hàng bảng, thẻ).
  - Tác vụ nền kéo dài chưa đo được tiến độ: dùng `indeterminate`. Theo luật thời gian của chỉ báo chờ, chỉ hiện sau khi tác vụ chạy quá khoảng 1 giây (`nxtDeferredLoading` của skeleton).
  - Dạng vòng (`shape="circle"`) khi chỗ đặt hẹp hoặc vuông: thẻ thống kê, đầu một hàng, giữa một vùng đang chờ.
- **Khi nào KHÔNG dùng:**
  - Chờ **nội dung** của một khối hiện ra (bảng, thẻ, form): dùng skeleton đúng hình khối đó, không dùng thanh chạy.
  - Chờ kết quả của **một nút** vừa bấm: dùng `loading` của Button (spinner ngay trong nút).
  - Quy trình nhiều bước có tên bước: dùng `nxt-timeline` (hoặc stepper khi có).
  - So sánh nhiều giá trị với nhau: dùng biểu đồ cột.
  - Tác vụ dưới 1 giây: không hiện gì, tránh chớp.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-progress` | ✓ | `role="progressbar"`; `data-shape` là `bar` hoặc `circle` |
| 2 | **Bar**: track (chính host) | ✓ | Nền `track`, bo `radius.pill`, cao `--nxt-space-2` |
| 3 | **Bar**: fill `.nxt-progress__fill` | ✓ | Xác định: `inline-size` = phần trăm. Không xác định: đoạn rộng 40% chạy ngang rãnh |
| 4 | **Circle**: `svg.nxt-progress__ring` | ✓ | `aria-hidden`; hai `circle`: rãnh `.nxt-progress__ring-track` và cung `.nxt-progress__ring-fill` (đi từ vị trí 12 giờ, theo chiều kim đồng hồ) |
| 5 | **Circle**: nhãn giữa vòng `.nxt-progress__label` | — | Nội dung chiếu vào (slot mặc định), chỉ hiện ở `shape="circle"` |
| 6 | Nhãn và số liệu hiển thị cạnh thanh | — | Do nơi dùng đặt bên ngoài; riêng vòng có thể đặt số liệu ngắn vào slot |

## 3. API (Angular)
Selector: `nxt-progress`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `value` | `number` (`numberAttribute`) | `0` | 0–100; làm tròn và kẹp về khoảng 0–100. Bỏ qua khi `indeterminate` |
| input | `label` | `string` | (bắt buộc) | Tên truy cập (`aria-label`) |
| input | `valueText` | `string` | `undefined` | Giá trị đọc bằng lời: "92 trên 100 hồ sơ" (`aria-valuetext`). Với `indeterminate` dùng khi muốn đọc trạng thái, ví dụ "Đang xử lý" |
| input | `tone` | `'brand' \| 'success' \| 'warning' \| 'danger'` | `'brand'` | Màu phần đã đạt (hoặc đoạn đang chạy); phản ánh ra `data-tone` |
| input | `indeterminate` | `boolean` (`booleanAttribute`) | `false` | Chưa biết tiến độ: có chuyển động lặp, không có `aria-valuenow`, `value` bị bỏ qua. Phản ánh ra `data-indeterminate` |
| input | `shape` | `'bar' \| 'circle'` | `'bar'` | Dạng thanh ngang hoặc dạng vòng. Phản ánh ra `data-shape` |
| input | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Đường kính của vòng. **Chỉ có tác dụng với `shape="circle"`**; thanh ngang chỉ có một độ dày. Phản ánh ra `data-size` ở dạng vòng |
| content | (default) | text ngắn | | Nhãn giữa vòng (ví dụ "72%"). Chỉ hiện ở `shape="circle"`; thanh ngang không có slot |

Thêm mới (2026-11-16) đều là phụ thêm: `<nxt-progress label="…" [value]="50" />` giữ nguyên hành vi cũ. Không có output. Export thêm type `NxtProgressTone`, `NxtProgressShape`, `NxtProgressSize`.

## 4. Variants & sizes
| Tone | Dùng khi | Không dùng khi |
|------|----------|----------------|
| `brand` | Mặc định: tiến độ trung tính, mọi trạng thái không xác định | Giá trị có ngưỡng tốt/xấu rõ ràng |
| `success` | Đã đạt hoặc vượt ngưỡng mục tiêu | Chỉ để trang trí |
| `warning` | Gần chạm hạn mức, sắp trễ hạn | |
| `danger` | Vượt hạn mức, trễ hạn | |

| Shape | Dùng khi | Không dùng khi |
|-------|----------|----------------|
| `bar` (mặc định) | Có chỗ ngang: dưới tiêu đề, trong hàng thông tin, trong dialog nhập file | Chỗ vuông và hẹp |
| `circle` | Thẻ thống kê, đầu hàng, chỉ báo chờ nhỏ cạnh chữ (`sm`) hoặc giữa vùng chờ (`lg`) | Nhiều vòng đặt cạnh nhau để so sánh (khó so độ dài cung: dùng thanh) |

**Thanh ngang:** một độ dày duy nhất, 8px (`--nxt-space-2`), rộng theo phần tử cha, không đổi theo density.

**Vòng:** đường kính theo density, nét dày bằng 10% đường kính (tỉ lệ cố định trong `viewBox`).

| Size | comfortable | compact | spacious | Alias |
|------|-------------|---------|----------|-------|
| `sm` | 32px | 24px | 40px | `size.control.sm` |
| `md` | 40px | 32px | 54px | `size.control.lg` |
| `lg` | 48px | 40px | 64px | `size.row.lg` |

Nhãn giữa vòng dùng `typography.label-sm`: vừa với 2–4 ký tự ("72%") ở `md` và `lg`. `sm` chỉ nên để trống hoặc đặt icon rất nhỏ; chữ dài hơn thì đặt bên ngoài vòng.

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | — (không tương tác) | — | — | — | — | ✓ `indeterminate` | — (dùng `tone="danger"` + chữ) | — | ✓ `value=0`: chỉ còn rãnh |

Thay đổi giá trị có chuyển động `motion.duration.slow`; motion `reduced` đưa về 0.

**Chuyển động của `indeterminate`** (chỉ `transform` và `opacity`, không animate kích thước hay vị trí bố cục):
- Thanh: đoạn 40% chạy từ đầu đến cuối rãnh (`translateX`, theo hướng đọc: đúng cả ở RTL), một lượt `2 × motion.duration.loop`, easing `motion.ease.standard`.
- Vòng: cung 30% quay (`rotate`), một vòng mỗi `motion.duration.loop`, tuyến tính.
- Giảm chuyển động (`prefers-reduced-motion: reduce` hoặc `data-nxt-motion="reduced"`): **không dừng hẳn**, vì chỉ báo chờ phải còn thấy (cùng nguyên tắc spinner của Button; khác skeleton, vốn đã nói "đang tải" bằng hình khối). Thay chuyển động ngang/quay bằng nhịp mờ–sáng tại chỗ (`opacity`): đoạn chạy thành cả thanh/cả vòng, nhấp nháy chậm theo `motion.duration.loop` ở mức reduced (1600ms, dưới ngưỡng 3 lần/giây). Cùng bộ selector như skeleton: `@media (prefers-reduced-motion: reduce)` (khôi phục khi ép `data-nxt-motion="full"`) và `[data-nxt-motion='reduced']`.
- Ngoại lệ so với "token lo motion": phải viết selector reduced riêng vì phải **đổi kiểu** chuyển động, không chỉ đổi thời lượng.

## 6. Keyboard & ARIA
Role: https://www.w3.org/TR/wai-aria-1.2/#progressbar (APG không có pattern riêng cho progressbar).

| Phím | Hành vi |
|------|---------|
| — | Không nhận focus, không nằm trong thứ tự Tab |

- Host: `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-label` = `label`, `aria-valuetext` = `valueText` khi có.
- Xác định: `aria-valuenow` = phần trăm đã làm tròn.
- **Không xác định:** **không có** `aria-valuenow` (ARIA 1.2: thiếu `aria-valuenow` nghĩa là indeterminate). `aria-valuemin` và `aria-valuemax` vẫn giữ (trùng giá trị mặc định của role, không gây hại). Nhãn nên nói rõ việc đang làm ("Đang đồng bộ dữ liệu chấm công").
- Vòng: SVG là trang trí (`aria-hidden`, không focus được). Nội dung chiếu vào là con của `progressbar`, vốn là role "children presentational" nên không đọc lặp: mọi thứ cần đọc nằm ở `label` và `valueText`. Luôn đặt số liệu quan trọng ở `valueText` thay vì chỉ ở slot.
- Tone không được là nguồn thông tin duy nhất: luôn có số liệu hoặc nhãn trạng thái dạng chữ bên cạnh (WCAG 1.4.1).
- Chỉ thông báo lúc **bắt đầu và kết thúc** qua `role="status"` của nơi dùng; chính progressbar không phải live region.
- Forced colors: thanh có viền `CanvasText`, fill dùng `Highlight`; vòng: rãnh `GrayText`, cung `Highlight`.

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
| `circle-size-sm` / `-md` / `-lg` | `size.control.sm` / `size.control.lg` / `size.row.lg` |
| `label-text` | `color.text.default` (nhãn giữa vòng: không theo tone, giữ tương phản ≥ 4.5:1 trên `surface` / `canvas`) |

Dùng thẳng: `motion.duration.slow` (đổi giá trị), `motion.duration.loop` và `motion.ease.standard` (chạy lặp), `typography.label-sm` (nhãn giữa vòng); độ dày thanh dùng `--nxt-space-2`.

Hằng số hình học trong CSS (không phải token, như tỉ lệ dấu check của Checkbox): nét vòng 10 đơn vị trên `viewBox` 100, đoạn chạy của thanh 40% bề rộng, cung quay của vòng 30% chu vi.

## 8. Density, responsive, i18n
- Thanh: độ dày không đổi theo density; bề rộng co giãn theo phần tử cha (`display: block`).
- Vòng: `inline-grid`, đường kính theo `size` và density (bảng §4); không co giãn theo phần tử cha.
- Không phải control tương tác nên không có vùng chạm riêng (tiêu chí 44px của cảm ứng không áp dụng).
- Phần trăm hiển thị và `valueText` theo locale `vi`: "92%", "1.250 trên 2.000 hồ sơ" (dấu chấm phân cách hàng nghìn).
- Hướng đọc: fill của thanh đi từ phía bắt đầu (logical `inline-size`); đoạn chạy của thanh đảo hướng ở RTL; cung của vòng luôn đi theo chiều kim đồng hồ.

## 9. Content guidelines
- `label` nêu đại lượng đang đo: "Tỉ lệ nộp hồ sơ", "Hạn mức nghỉ phép đã dùng"; không viết "Tiến độ" chung chung.
- `indeterminate`: `label` nêu việc đang làm, dạng tiếp diễn: "Đang đồng bộ dữ liệu chấm công", "Đang tính lương tháng 10". Không hứa thời gian ("Chỉ mất vài giây").
- `valueText` đọc được như câu: "92 trên 100 hồ sơ", "12 trên 12 ngày phép".
- Số liệu hiển thị cạnh thanh luôn có, căn phải, `tabular-nums`. Nhãn giữa vòng ngắn: "72%", "9/12".
- Khi `indeterminate` kết thúc, đổi sang xác định (hoặc thông báo hoàn tất qua `role="status"`) thay vì để chạy mãi.

## 10. Acceptance (Definition of Done)
- [x] Mọi tone ở §4 và `value=0` / `value=100` có trong docs example (`progress-tones`, `progress-import`, `progress-breakdown`)
- [x] Docs example cho `indeterminate` và `shape="circle"` (`progress-indeterminate`, `progress-circle`)
- [x] Unit test (`src/progress.spec.ts`): role + `aria-*` của thanh xác định, làm tròn và kẹp, không có `aria-valuenow` khi `indeterminate`, `data-*` theo input, vòng có SVG `aria-hidden` và nét theo giá trị, slot chỉ hiện ở vòng
- [ ] axe: 0 vi phạm ở sáng/tối/gọn cho `progress-indeterminate` và `progress-circle`: cần `npm run build && npm run test:a11y` (phiên chính chạy); bản trước 2026-10-19, 341/341
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/progress.css`: độ dày thanh dùng `--nxt-space-2` (token khoảng cách primitive) cho kích thước; nên có component token `progress.height`.
- Tương phản fill so với track (`bg.primary`, `icon.*` trên `bg.muted`) chưa nằm trong `contrastPairs`; WCAG 1.4.11 cần ≥ 3:1 giữa phần đã đạt và rãnh. Cùng cặp quyết định độ đọc được của cung vòng trên nền trang.
- Không hỗ trợ `aria-labelledby` (chỉ nhận `label` dạng chuỗi), nên nhãn hiển thị bên ngoài phải lặp lại trong `label`.
- `value` chỉ hiểu thang 0–100, chưa có `max`; nơi dùng phải tự quy đổi phần trăm.
- Chuyển động reduced của `indeterminate` (nhịp mờ–sáng) chưa kiểm bằng người dùng thật bật "giảm chuyển động"; chỉ kiểm qua CSS và axe.
- Chưa có tự động hiện trễ: nơi dùng phải bọc bằng `nxtDeferredLoading` (skeleton) để đạt luật "sau 1 giây".

### Đã xử lý (2026-11-16)
- Thêm trạng thái `indeterminate` cho thanh (trước đây SPEC ghi là chưa có).
- Thêm dạng vòng `shape="circle"` với `size` sm / md / lg, xác định và không xác định, nhãn giữa vòng bằng slot.

---
component: slider
status: draft
owner: "NXT core"
updated: 2026-11-16
apg-pattern: slider
---

# Slider: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** chọn **một giá trị trong khoảng liên tục hoặc nhiều nấc** bằng cách kéo hoặc bấm lên thanh, thấy ngay vị trí của giá trị trong khoảng: ngưỡng cảnh báo quá hạn, tỉ trọng, độ sáng, mức ưu tiên.
- **Khi nào dùng:**
  - Giá trị nằm trong khoảng có **cận rõ ràng** (0–100%, 1–5) và việc **ước lượng, so vị trí** quan trọng hơn con số chính xác.
  - Thiết lập có hiệu lực ngay hoặc xem trước ngay kết quả khi kéo.
- **Khi nào KHÔNG dùng:**
  - Cần nhập con số chính xác (lương, số lượng, hệ số): dùng `nxt-stepper` hoặc `input[nxtInput]`.
  - Khoảng rất rộng hoặc không có cận (số nhân viên, số tiền): dùng ô nhập.
  - Chọn một trong vài giá trị có nhãn rõ: `nxt-radio-group` / `nxt-segmented`.
  - Chọn **khoảng** (từ … đến …): chưa có `range slider`; dùng hai `nxt-stepper` hoặc hai field.

Theo Apple HIG (Sliders): thanh ngang với tay kéo; giá trị nhỏ nhất bên trái, lớn nhất bên phải (đảo theo hướng đọc); tuỳ chọn **nhãn hoặc icon ở hai đầu** để nói nghĩa của hai cận; tuỳ chọn hiện **giá trị hiện tại** bằng chữ; kéo cho thay đổi liên tục, bấm lên thanh nhảy tới điểm đó; tay kéo đủ lớn để bắt trúng bằng ngón tay. Theo WAI-ARIA APG (slider): `role="slider"` trên phần tử lấy focus, bàn phím đổi giá trị.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-slider` | ✓ | `block`, `grid`: hàng đầu (nhãn + giá trị), hàng thanh, hàng gợi ý |
| 2 | Nhãn `.nxt-slider__label` | ✓ | `span#id`, tên truy cập qua `aria-labelledby`; bấm nhãn đưa focus vào thanh; ẩn bằng `.nxt-visually-hidden` khi `hideLabel` |
| 3 | Giá trị `.nxt-slider__value` | — | Khi `showValue`: chữ giá trị hiện tại ở cuối hàng nhãn, `tabular-nums`, `aria-hidden` (đã có ở `aria-valuetext`) |
| 4 | Đầu nhỏ `.nxt-slider__end[data-end=min]` | — | Khi có `minLabel` / `minIcon`: trước thanh |
| 5 | Vùng chạm `.nxt-slider__control` | ✓ | `div[role=slider][tabindex=0]`; **phần tử duy nhất nhận focus**; cao `size.control.md`, rộng hết thanh; nhận chuột, chạm, kéo |
| 6 | Rãnh `.nxt-slider__track` | ✓ | Thanh mảnh nằm giữa vùng chạm, bo `radius.pill`, trang trí (`aria-hidden`) |
| 7 | Phần đã tô `.nxt-slider__fill` | ✓ | Từ đầu rãnh tới tâm tay kéo |
| 8 | Tay kéo `.nxt-slider__thumb` | ✓ | Tròn, nền trắng, viền accent, đổ bóng mềm `elevation.raised` (tĩnh, không animate) |
| 9 | Đầu lớn `.nxt-slider__end[data-end=max]` | — | Khi có `maxLabel` / `maxIcon`: sau thanh |
| 10 | Gợi ý `p.nxt-slider__hint` | — | Khi có `hint`; dưới cùng, nối `aria-describedby` |

## 3. API (Angular)
Selector: `nxt-slider`. Implement `ControlValueAccessor` (`formControl`, `formControlName`, `ngModel`).

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| model | `value` | `number` | `0` | Giá trị, two-way `[(value)]`; luôn được hiện đã kẹp vào `[min, max]` |
| input | `label` | `string` | (bắt buộc) | Đại lượng đang chọn: "Ngưỡng cảnh báo quá hạn" |
| input | `hideLabel` | `boolean` | `false` | Ẩn nhãn khỏi màn hình (vẫn đọc được) khi một tiêu đề ngay trên đã nêu tên |
| input | `min` / `max` | `number` | `0` / `100` | Cận dưới / trên |
| input | `step` | `number` | `1` | Bước của phím mũi tên và nấc bám khi kéo; số `≤ 0` coi như `1` |
| input | `showValue` | `boolean` | `false` | Hiện giá trị hiện tại ở cuối hàng nhãn |
| input | `unit` | `string` | `undefined` | Đơn vị sau con số: "%", "ngày" |
| input | `fractionDigits` | `number` | theo `step` | Số chữ số thập phân khi hiện và làm tròn |
| input | `formatValue` | `(value: number) => string` | `undefined` | Đổi giá trị thành chữ cho phần hiện và `aria-valuetext` khi con số không đủ nghĩa (1–5 → "Rất thấp" … "Rất cao") |
| input | `locale` | `string` | `'vi-VN'` | Locale hiện số |
| input | `minLabel` / `maxLabel` | `string` | `undefined` | Nhãn chữ ở hai đầu thanh: "Ít", "Nhiều" |
| input | `minIcon` / `maxIcon` | `NxtIconName` | `undefined` | Icon ở hai đầu thanh (trang trí) |
| input | `hint` | `string` | `undefined` | Hệ quả hoặc cách đọc thang đo, nối `aria-describedby` |
| input | `disabled` | `boolean` | `false` | Gộp với disabled của form control; vẫn thấy vị trí |
| input | `readonly` | `boolean` | `false` | Thấy vị trí, focus được, không đổi được, `aria-readonly` |
| output | `valueChange` | `number` | | Từ `model`; chỉ phát khi giá trị thực sự đổi do người dùng hoặc nơi dùng đặt |

Không có content slot.

## 4. Variants & sizes
| Cấu hình | Dùng khi | Không dùng khi |
|----------|----------|----------------|
| Mặc định (thanh + nhãn) | Thang đo mà vị trí đã đủ nghĩa | Người dùng cần đọc con số |
| `showValue` (+ `unit`) | Cần biết con số cụ thể khi kéo | Khi đã hiện con số ở nơi khác ngay cạnh |
| `minLabel` + `maxLabel` | Hai cận có nghĩa riêng ("Ít" – "Nhiều") | Thang số tự giải thích |
| `minIcon` + `maxIcon` | Thang cảm tính có icon quen thuộc (tối – sáng) | Nghĩa của icon không rõ: dùng nhãn chữ |
| `formatValue` | Thang rời rạc 1–5 có tên từng mức | Thang số liên tục |

Một cỡ duy nhất: vùng chạm cao `size.control.md` theo mật độ (gọn 28 · vừa 36 · rộng 46px), tay kéo 24px, rãnh dày theo `space.inset.xs`.

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ rãnh `border.input-hover`, phần tô `bg.primary`, tay kéo nền trắng viền `border.selected` | ✓ tay kéo: viền `bg.primary-hover` | ✓ vòng `focus.ring.*` quanh tay kéo | ✓ đang kéo: giữ nguyên hình (không phóng to, không bóng đổi) | — (không có lựa chọn) | ✓ `disabled`: rãnh `border.default`, phần tô `icon.disabled`, tay kéo `bg.disabled`; vẫn thấy vị trí, không focus | — (đổi tức thời trong trình duyệt) | — (giá trị luôn nằm trong khoảng, không có giá trị sai; lỗi lưu báo ở cấp trang) | ✓ `readonly`: phần tô và viền tay kéo `icon.subtle`, tay kéo `bg.muted`, focus được, bấm / kéo không đổi | — (luôn có giá trị: không đặt thì là `min`) |

Giá trị phân biệt bằng **vị trí và chiều dài phần tô**, không chỉ bằng màu (WCAG 1.4.1).

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/slider/

| Phím (khi focus ở thanh) | Hành vi |
|------|---------|
| Tab / Shift+Tab | Vào / ra thanh; `disabled` bị bỏ qua, `readonly` vẫn nhận focus |
| → hoặc ↑ | Tăng một `step` |
| ← hoặc ↓ | Giảm một `step` |
| Page Up | Tăng `10 × step` |
| Page Down | Giảm `10 × step` |
| Home | Về `min` |
| End | Lên `max` |
| Mọi phím đổi giá trị khi `readonly` / `disabled` | Không đổi |

Với chữ viết từ phải sang trái (`dir="rtl"`), ← tăng và → giảm (theo hướng nhìn của thanh).

Chuột và cảm ứng:
- Nhấn lên thanh hoặc tay kéo: lấy focus, giá trị nhảy tới điểm nhấn (nhấn đúng lên tay kéo thì không nhảy, giữ khoảng lệch lúc nắm); kéo thì giá trị theo con trỏ, bám theo nấc `step`.
- Kéo bằng con trỏ có `pointer capture`: kéo ra ngoài thanh vẫn theo trục ngang. `touch-action: pan-y` để chạm dọc vẫn cuộn trang.
- Mọi thao tác kéo đều có đường bàn phím tương đương (WCAG 2.5.7).

- Role / thuộc tính: `div role="slider" tabindex="0"` + `aria-valuenow` (số đã kẹp), `aria-valuemin`, `aria-valuemax`, `aria-valuetext` (chữ giá trị: "40 %", hoặc kết quả `formatValue`), `aria-orientation="horizontal"`, `aria-labelledby` = id nhãn, `aria-describedby` = id gợi ý, `aria-readonly="true"` khi `readonly`, `aria-disabled="true"` khi `disabled` (đồng thời bỏ `tabindex`).
- Giá trị hiện bên cạnh nhãn và icon hai đầu là `aria-hidden`: trạng thái đã có ở `aria-valuetext`, đọc thêm sẽ bị lặp. Nhãn chữ hai đầu để đọc được (không `aria-hidden`) vì chúng giải nghĩa thang đo.
- Không có live region: giá trị mới đọc qua thuộc tính `aria-value*` của phần tử đang focus.
- Focus ring: `:focus-visible` trên vùng chạm, vòng vẽ quanh tay kéo (`focus.ring.*`, tách bằng `focus.ring.offset`). Forced colors: rãnh `ButtonText`, phần tô `Highlight`, tay kéo viền `Highlight`.

## 7. Tokens
`packages/tokens/src/component/slider.tokens.json`:

| Token | Alias semantic | Ghi chú |
|-------|----------------|---------|
| `hit-height` | `size.control.md` | Chiều cao vùng chạm theo mật độ (28 · 36 · 46px): đạt ≥ 44px ở density rộng |
| `track-height` | `space.inset.xs` | Độ dày rãnh (2 · 4 · 6px) |
| `thumb-size` | `size.icon.lg` | Đường kính tay kéo (24px) |
| `radius` | `radius.pill` | Rãnh, phần tô, tay kéo |
| `track-bg` | `color.border.input-hover` | Rãnh chưa tô: ≥ 3:1 với nền ở mọi mode |
| `fill-bg` | `color.bg.primary` | Phần đã tô |
| `thumb-bg` | `color.text.on-primary` | Tay kéo trắng ở mọi mode |
| `thumb-border` | `color.border.selected` | Viền tay kéo: ≥ 3:1 với nền (4,97 sáng · 6,80 tối trên `bg.surface`) |
| `thumb-border-hover` | `color.bg.primary-hover` | |
| `track-bg-disabled` | `color.border.default` | |
| `fill-bg-disabled` | `color.icon.disabled` | |
| `thumb-bg-disabled` | `color.bg.disabled` | |
| `thumb-border-disabled` | `color.icon.disabled` | |
| `fill-bg-readonly` | `color.icon.subtle` | Phần tô trung tính, không mời kéo |
| `thumb-bg-readonly` | `color.bg.muted` | |
| `thumb-border-readonly` | `color.icon.subtle` | |
| `label-text` | `color.text.default` | |
| `value-text` | `color.text.strong` | |
| `end-text` | `color.text.subtle` | Nhãn và icon hai đầu |
| `hint-text` | `color.text.subtle` | |

Dùng thẳng semantic: `space.gap.{xs,sm}`, `border-width.strong` (viền tay kéo), `typography.{body-md,label-md,caption}`, `focus.ring.*`, `elevation.raised`, `size.icon.{sm,md}`, `motion.duration.fast`, `motion.ease.standard`.

Tương phản (đo từ `dist/json` 2026-11-16, sáng / tối): `border.input-hover` / `bg.surface` 4,75 / 3,78, / `bg.surface-raised` 4,75 / 3,19, / `bg.canvas` 4,12 / 4,17; `bg.primary` / `bg.surface` 4,97 / 3,61, / `bg.canvas` 4,32 / 3,98; `border.selected` / `bg.surface` 4,97 / 6,80, / `bg.canvas` 4,32 / 7,50; `icon.subtle` / `bg.surface` 4,75 / 6,92. ❓ Cần thêm vào `contrastPairs` (chưa có): `border.input-hover` / `bg.surface`, `/ bg.surface-raised` (≥ 3, rãnh), `bg.primary` / `bg.surface` (≥ 3, phần tô; hiện dark 3,61 trên `bg.surface`, 3,05 trên `bg.surface-raised`), `border.selected` / `bg.canvas` (đã có, tay kéo trên nền trang).

## 8. Density, responsive, i18n
- Vùng chạm cao `size.control.md`: gọn 28px (≥ 24, WCAG 2.5.8), vừa 36px, **rộng 46px (≥ 44, cảm ứng)**. Tay kéo và độ dày rãnh đi theo density nhưng tay kéo luôn 24px.
- Thanh rộng hết khung chứa (host `block`); nơi dùng quyết định bề rộng. Hai đầu (`minLabel`…) giữ kích thước, thanh co giãn.
- Vị trí tay kéo tính bằng thuộc tính logic (`inset-inline-start`), nên tự đảo ở RTL; con trỏ và phím ← → xử lý theo hướng đọc.
- Không có chuyển động: tay kéo và phần tô đổi tức thời (thao tác trực tiếp). Hover chỉ đổi màu viền, `motion.duration.fast`, reduced motion đưa về 0. Không animate `box-shadow`.
- Số hiện theo `locale` (`vi-VN`: "12,5"); chuỗi mặc định (`aria-valuetext`) luôn lấy từ `formatValue` hoặc con số + `unit`.

## 9. Content guidelines
- Nhãn là **đại lượng** đang chọn, danh từ: "Ngưỡng cảnh báo quá hạn", "Tỉ trọng KPI". Không viết "Kéo để chọn …".
- `minLabel` / `maxLabel`: một hoặc hai từ, cặp đối nghĩa ("Ít" / "Nhiều", "Thấp" / "Cao"). Không viết lại con số cận.
- `unit` ngắn: "%", "ngày". Không lặp đơn vị trong nhãn.
- `hint` cho biết thang đo hoặc hệ quả: "Kéo sang phải để cảnh báo sớm hơn."
- Thang rời rạc có tên mức: dùng `formatValue`, tên mức ngắn ("Thấp", "Trung bình", "Cao").

## 10. Acceptance (Definition of Done)
- [ ] Mọi trạng thái ở §5 có trong docs example (`slider-basic`, `slider-ends`, `slider-states`) — chưa chạy `docs:generate` / xem bản render
- [x] Unit test phủ keyboard map §6: ← → ↑ ↓, Page Up, Page Down, Home, End, kẹp khoảng, RTL, nhấn / kéo bằng con trỏ (nhảy tới điểm nhấn, bám nấc, nắm đúng tay kéo), `aria-valuetext`, `formatValue`, `disabled`, `readonly`, Angular forms (giá trị, disabled, touched)
- [ ] axe: 0 vi phạm ở sáng/tối/gọn — chưa chạy
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `contrastPairs` chưa có các cặp ở §7 (❓), validator chưa tự kiểm.
- Chưa có thanh chọn **khoảng** (hai tay kéo), chưa có vạch chia (tick) và nhãn dưới vạch, chưa có thanh dọc.
- Chưa có output `valueCommit` (phát một lần khi thả tay kéo / hết phím): nơi cần lưu một lần cuối khi kéo xong tạm dùng `(pointerup)` hoặc debounce.
- Chưa có `NxtSliderHarness` (đợt B, xem component-conventions §5).
- Icon hai đầu bị giới hạn bộ icon đã chọn (`packages/ui/icon/icons.json`); thiếu icon âm lượng / thu nhỏ.

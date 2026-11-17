---
component: segmented
status: beta
owner: "NXT core"
updated: 2026-11-16
apg-pattern: radio-group
---

# Segmented control: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** chuyển nhanh giữa 2–5 lựa chọn loại trừ nhau mà vẫn thấy hết các lựa chọn: kiểu hiển thị (bảng / thẻ), kỳ báo cáo (tháng / quý / năm), lọc nhanh theo trạng thái.
- **Khi nào dùng:** lựa chọn có hiệu lực ngay trên vùng hiện tại, số lựa chọn ít và nhãn ngắn.
- **Khi nào KHÔNG dùng:**
  - Chuyển giữa các panel nội dung khác nhau: dùng `nxt-tabs`.
  - Hơn 5 lựa chọn hoặc nhãn dài: dùng select (chưa có) hoặc radio dọc.
  - Chọn nhiều giá trị cùng lúc: dùng checkbox.
  - Trường trong form cần báo lỗi, bắt buộc chọn hoặc chỉ đọc: dùng `nxt-radio-group`. Segmented dùng được với Angular forms (`ControlValueAccessor`) cho lựa chọn luôn có giá trị mặc định, nhưng không có trạng thái lỗi / chỉ đọc.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-segmented` | ✓ | `inline-flex` |
| 2 | `fieldset.nxt-segmented__group` | ✓ | Nhóm radio, không có style riêng (không viền, không padding) |
| 3 | `legend.nxt-segmented__label` | ✓ | Nhãn nhóm. Mặc định ẩn bằng `.nxt-visually-hidden`; `showLabel` thì hiện phía trên rãnh, cùng kiểu nhãn của `nxt-form-field` |
| 3b | Rãnh `.nxt-segmented__track` | ✓ | Nền `track-bg`, viền trong suốt, bo viên thuốc (`radius.pill`); chứa các option |
| 4 | Option `label.nxt-segmented__option` | ✓ | Bọc `input[type=radio]` trong suốt phủ kín option |
| 5 | Mặt option `.nxt-segmented__face` | ✓ | Icon (tuỳ chọn) + nhãn; option được chọn là thanh trượt viên thuốc nổi lên nền `surface` + `elevation.raised` |

## 3. API (Angular)
Selector: `nxt-segmented`. Generic `NxtSegmented<T extends string>`. Export type `NxtSegmentedOption<T>` = `{ value: T; label: string; icon?: NxtIconName; disabled?: boolean }`. Implement `ControlValueAccessor` (`formControl`, `formControlName`, `ngModel`).

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `label` | `string` | (bắt buộc) | Tên nhóm, đọc qua `legend` |
| input | `options` | `NxtSegmentedOption<T>[]` | (bắt buộc) | 2–5 lựa chọn |
| model | `value` | `T \| undefined` | `undefined` | Giá trị đang chọn, two-way `[(value)]` |
| input | `size` | `'sm' \| 'md'` | `'md'` | Phản ánh ra `data-size` |
| input | `iconOnly` | `boolean` | `false` | Chỉ hiện icon; nhãn ẩn khỏi màn hình (vẫn đọc được) và hiện thành tooltip |
| input | `disabled` | `boolean` | `false` | Khoá cả nhóm (`fieldset disabled`); gộp với disabled của form control; phản ánh ra `data-disabled`. Khoá từng lựa chọn bằng `NxtSegmentedOption.disabled` |
| input | `showLabel` | `boolean` | `false` | Hiện `label` phía trên rãnh như nhãn của form field (dùng trong form, cạnh các `nxt-form-field`). Vẫn là chính `legend`, nên tên nhóm chỉ được đọc một lần; phản ánh ra `data-show-label` |

Output: `valueChange` (từ `model`). Không có content slot.

Theo SAP Fiori (segmented button): được phép bắt đầu khi chưa chọn segment nào; được trộn segment bật và segment bị khoá trong cùng một nhóm.

## 4. Variants & sizes
| Variant | Dùng khi | Không dùng khi |
|---------|----------|----------------|
| Có nhãn (mặc định) | Hầu hết trường hợp | |
| `iconOnly` | Toolbar chật, icon quen thuộc (bảng / thẻ, sáng / tối) | Icon không tự giải thích được |
| `showLabel` | Đứng trong form cạnh các `nxt-form-field` có nhãn hiển thị ("Cách duyệt") | Toolbar, cạnh tiêu đề card: ngữ cảnh đã nói rõ nhóm chọn gì |

`iconOnly` chỉ ẩn nhãn của option **có** `icon`; option không có icon vẫn hiện chữ.

| Size | comfortable | compact | spacious |
|------|-------------|---------|----------|
| `sm` | 32px | 24px | 40px |
| `md` | 36px | 28px | 46px |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ chữ đậm màu hơn (không áp dụng cho lựa chọn bị khoá) | ✓ ring token trên mặt option | — (native) | ✓ nền `surface` + `elevation.raised` | ✓ cả nhóm (`disabled`, form control) hoặc từng lựa chọn (`option.disabled`): chữ `item-text-disabled`, con trỏ `not-allowed`; lựa chọn đang chọn mà bị khoá vẫn giữ nền nổi | — | — (dùng `nxt-radio-group` khi cần lỗi) | — (dùng `nxt-radio-group` khi cần chỉ đọc) | ✓ `value` rỗng: không option nào được chọn |

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/radio/

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Vào nhóm tại option đang chọn (hoặc option đầu nếu chưa chọn); ra khỏi nhóm. Nhóm `disabled` bị bỏ qua |
| ← / ↑ | Chọn option trước (native, vòng về cuối), bỏ qua option bị khoá |
| → / ↓ | Chọn option sau (native, vòng về đầu), bỏ qua option bị khoá |
| Space | Chọn option đang focus nếu chưa được chọn (native) |

- Cấu trúc native: `fieldset` + `legend` = radio group có tên; mỗi option là `input[type=radio]` dùng chung `name` duy nhất (`nxt-segmented-{n}`). Không gắn `role`.
- `showLabel` chỉ bỏ `.nxt-visually-hidden` khỏi chính `legend` (legend `float` để nằm trong luồng flex, phía trên rãnh), không thêm phần tử nhãn thứ hai: tên nhóm không bị đọc lặp và nơi dùng không cần nhãn `aria-hidden` tự chế.
- Tên option lấy từ nhãn trong `label`; ở `iconOnly` nhãn bị ẩn bằng `.nxt-visually-hidden` (không bị xoá) nên vẫn đọc được. Tooltip trùng tên nên không thêm `aria-describedby`.
- Icon trong option là trang trí.
- Khoá: cả nhóm bằng `disabled` native trên `fieldset`; từng lựa chọn bằng `disabled` native trên radio (trình duyệt bỏ qua khi Tab / mũi tên, screen reader đọc "unavailable").
- Mũi tên **chọn ngay** (hành vi radio native, APG): cố ý khác SAP Fiori (mũi tên chỉ chuyển focus, Space/Enter mới chọn), vì lựa chọn của segmented có hiệu lực ngay và rẻ để đổi lại.
- `ControlValueAccessor`: `writeValue` đặt `value`; người dùng chọn thì báo `onChange`; focus rời khỏi nhóm thì `onTouched`; `setDisabledState` khoá cả nhóm.
- Forced colors: option được chọn có outline `Highlight`.
- Đã kiểm bằng Playwright e2e trong template phê duyệt (2026-10-19).

## 7. Tokens
`packages/tokens/src/component/segmented.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `track-bg` | `color.bg.muted` |
| `track-border` | `color.border.transparent` |
| `item-text` | `color.text.subtle` |
| `item-text-hover` | `color.text.default` |
| `selected-bg` | `color.bg.surface` |
| `selected-text` | `color.text.strong` |
| `radius` | `radius.control` |
| `item-padding-inline` | `space.inset.lg` |
| `height`, `height-sm` | `size.control.md`, `size.control.sm` |
| `touch-target` | `size.row.md` (tạm, xem §8 Density / touch) |
| `label-text` | `color.text.default` (nhãn hiển thị khi `showLabel`, giống `form-field.label-text`) |
| `item-text-disabled` | `color.text.disabled` |

Dùng thẳng semantic: `size.icon.sm`, `space.gap.xs`, `border-width.default`, `elevation.raised`, `typography.label-sm`, `typography.label-md` (nhãn hiển thị), `focus.ring.*`, `motion.duration.fast`, `motion.ease.standard`.

## 8. Density, responsive, i18n
- Chiều cao theo `size.control.*`, đổi theo density. Ở compact `sm` (24px) vùng chạm vẫn đạt 24×24 vì input phủ kín option.
- **Density / touch (Apple HIG: vùng chạm ≥ 44×44pt).** Mỗi lựa chọn là một `label`. Trên thiết bị có `@media (pointer: coarse)`, một `::after` trong suốt của `label` nới vùng chạm theo chiều khối tới tối thiểu `touch-target`, vượt ra ngoài rãnh (rãnh giữ nguyên chiều cao) và vẫn kích hoạt radio bên trong. Chiều ngang không đổi: các lựa chọn nằm sát nhau (cách 2px) nên không nới được mà không chồng lên nhau; bề rộng mỗi lựa chọn là bề rộng chữ cộng đệm, còn ở `iconOnly` ô hẹp hơn 44px (xem §11). Không có rule nào cho `pointer: fine`. Token `touch-target` tạm alias `size.row.md` (44px ở comfortable, 56px ở spacious, 32px ở compact); cần token `semantic.size.touch-target` (44px, không đổi theo density), khi có chỉ việc đổi alias (xem Button §8).
- Nhãn không xuống dòng (`nowrap`). Nhóm không tự cuộn hay thu gọn khi hẹp: giữ số lựa chọn ít và nhãn ngắn.
- Tiếng Việt: `label-sm` (12 / 16px) đủ chỗ cho dấu chồng.

## 9. Content guidelines
- Nhãn 1–2 từ, cùng loại từ: "Tháng · Quý · Năm", "Bảng · Thẻ".
- `label` của nhóm nêu điều đang chọn: "Kỳ báo cáo", "Kiểu hiển thị".
- `iconOnly` vẫn bắt buộc `label` cho từng option; nhãn này thành tooltip và tên truy cập.

## 10. Acceptance (Definition of Done)
- [ ] Có nhãn, `iconOnly`, hai size, chưa chọn giá trị, khoá nhóm / từng lựa chọn, Angular forms có trong docs example (nhãn hiển thị: `segmented-label`; khoá + forms: `segmented-forms`) — chưa chạy `docs:generate` / xem bản render
- [x] Unit test: radio group có `legend`, phản ánh và cập nhật `value`, `iconOnly` giữ tên cho mọi option, `showLabel` hiện chính `legend` (không có nhãn thứ hai)
- [x] Unit test (2026-11-06): `disabled` cả nhóm và từng lựa chọn, `ControlValueAccessor` với `FormControl` (ghi, đọc, khoá, touched)
- [x] Playwright e2e: segmented trong template phê duyệt (2026-10-19)
- [ ] axe: 0 vi phạm ở sáng/tối/gọn — lần chạy gần nhất 2026-10-19 (341/341), trước khi thêm trạng thái khoá; cần chạy lại
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `writeValue` gọi `value.set`, làm phát `valueChange` cả khi giá trị đến từ form (như checkbox).
- Chưa có `equalWidth` (các lựa chọn bằng nhau theo nhãn dài nhất, Fiori mặc định) — P2.
- Chữ lựa chọn bị khoá (`text.disabled`) trên rãnh `bg.muted` không đạt 4.5:1 (WCAG miễn cho control bị khoá).
- `src/segmented.css:58`: option được chọn chỉ phân biệt bằng nền `bg.surface` trên track `bg.muted` + bóng + màu chữ; cặp này chưa nằm trong `contrastPairs`, chưa chắc đạt 3:1 cho chỉ báo trạng thái (WCAG 1.4.11).
- `src/segmented.css:14`, `:16`, `:40`, `:42`: khoảng đệm track dùng primitive `--nxt-space-0-5`, không theo density.
- Trên cảm ứng, `iconOnly` chỉ đạt 44px theo chiều khối: các ô icon (~30px ngang) nằm sát nhau nên chưa nới được chiều ngang. Cần quyết định: tăng `min-inline-size` của ô icon trên `pointer: coarse` (đổi hình khi chạm) hay chấp nhận.

### Bổ sung (2026-10-19)
- Input `showLabel`: hiện `label` như nhãn của form field, ngay trên rãnh. Phát hiện ở template Quy trình duyệt (form thiết lập bước): nơi dùng phải đặt một `span aria-hidden` "Cách duyệt" cạnh segmented để có nhãn nhìn thấy, vừa trùng nội dung vừa dễ lệch chữ với `label`. Giờ chỉ cần `<nxt-segmented label="Cách duyệt" showLabel …>`.
- DOM đổi: `fieldset.nxt-segmented__group` không còn là rãnh; rãnh là `div.nxt-segmented__track` bên trong, để `legend` hiện được phía trên rãnh. Hành vi, phím và tên truy cập không đổi.
- Token mới `segmented.label-text` (alias `color.text.default`, như `form-field.label-text`).

### Bổ sung (2026-11-06, theo SAP Fiori: segmented button)
- Input `disabled` (cả nhóm) và `NxtSegmentedOption.disabled` (từng lựa chọn); `ControlValueAccessor`. Host phản ánh `data-disabled`.
- Token mới `segmented.item-text-disabled` (alias `color.text.disabled`).
- Sửa: radio native được đặt lại theo giá trị sau mỗi lần giá trị đổi (`afterRenderEffect`). Trước đây, nếu người dùng bấm rồi form đặt lại giá trị cũ trước lần render kế tiếp, binding `[checked]` không ghi lại và ô hiển thị sai giá trị.

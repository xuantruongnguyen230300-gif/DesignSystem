---
component: switch
status: beta
owner: "NXT core"
updated: 2026-11-16
apg-pattern: switch
---

# Switch: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** bật/tắt **một** thiết lập và thấy ngay nó đang bật hay tắt; thay đổi **có hiệu lực ngay**, không cần bấm Lưu: nhận thông báo qua email, tự chuyển sang đơn kế tiếp sau khi duyệt, hiện cột đã ẩn.
- **Khi nào dùng:** thiết lập cá nhân / cấu hình áp dụng tức thì (trang cài đặt, panel tuỳ chọn, dialog cấu hình); trạng thái hiện tại phải nhìn thấy được.
- **Khi nào KHÔNG dùng:**
  - Lựa chọn trong form chỉ có hiệu lực khi bấm Lưu: dùng `nxt-checkbox`.
  - Không rõ switch đang thể hiện trạng thái hay hành động: dùng `nxt-checkbox` hoặc một nút.
  - Chọn một trong nhiều giá trị: `nxt-radio-group` / `nxt-segmented`. Chọn nhiều: `nxt-checkbox-group`.
  - Hành động phá huỷ hoặc tốn kém cần xác nhận (khoá tài khoản nhân viên): dùng nút + dialog xác nhận.

Theo SAP Fiori (switch): chỉ cho thiết lập có hiệu lực ngay; nhãn đặt **phía trên hoặc ngay trước** switch và nói rõ nó điều khiển gì; **không đặt chữ trong rãnh** (khó bản địa hoá); chữ trạng thái ngắn ("Bật"/"Tắt") đặt **sau** switch khi nhãn chưa đủ rõ; trạng thái read-only (thấy giá trị trong chế độ sửa nhưng không đổi được). Rãnh bật màu xanh lá (`bg.success`) theo skin iOS là màu cố định của component, không phải biến thể: không có `tone` hay `variant` để đổi màu rãnh theo ngữ cảnh (đỏ cho "nguy hiểm") và không đổi theo brand (luật cứng 5: không đổi màu status theo sản phẩm).

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-switch` | ✓ | `inline-grid` (vùng nhãn · nút · chữ trạng thái · gợi ý); `labelPosition` quyết định hàng (nhãn trước) hay cột (nhãn trên) |
| 2 | Nhãn `label.nxt-switch__label` | ✓ | `for` = id của nút; bấm vào nhãn cũng đổi; ẩn bằng `.nxt-visually-hidden` khi `hideLabel` |
| 3 | Nút `button.nxt-switch__control[role=switch]` | ✓ | Vùng chạm ≥ 24×24 (trên cảm ứng ≥ `touch-target` theo chiều khối); chứa rãnh |
| 4 | Rãnh `.nxt-switch__track` | ✓ | Bo `radius.pill`; **không chứa chữ**; tắt: `border.input`, bật: xanh lá `bg.success` |
| 5 | Tay gạt `.nxt-switch__thumb` | ✓ | Tròn, trắng, đổ bóng mềm `elevation.raised`; trượt về cuối khi bật |
| 6 | Chữ trạng thái `.nxt-switch__state` | — | Khi `showState`: "Bật"/"Tắt" sau switch, `aria-hidden` (trạng thái đã có ở `aria-checked`) |
| 7 | Gợi ý `p.nxt-switch__hint` | — | Khi có `hint`; dưới hàng nhãn/switch, nối `aria-describedby` |

## 3. API (Angular)
Selector: `nxt-switch`. Implement `ControlValueAccessor` (`formControl`, `ngModel`).

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| model | `checked` | `boolean` | `false` | Bật/tắt, two-way `[(checked)]` |
| input | `label` | `string` | (bắt buộc) | Thiết lập được điều khiển: "Nhận thông báo qua email" |
| input | `labelPosition` | `'start' \| 'top'` | `'start'` | `start`: nhãn trước switch cùng hàng (danh sách cài đặt); `top`: nhãn trên như nhãn `nxt-form-field` (đứng cạnh các field) |
| input | `hideLabel` | `boolean` | `false` | Ẩn nhãn khỏi màn hình (vẫn đọc được), ví dụ switch trong ô bảng có tiêu đề cột. Khi dùng, đặt tooltip trùng nhãn ở nơi dùng |
| input | `hint` | `string` | `undefined` | Hệ quả của thiết lập, nối bằng `aria-describedby` |
| input | `showState` | `boolean` | `false` | Hiện chữ trạng thái sau switch khi nhãn chưa đủ rõ bật/tắt nghĩa là gì |
| input | `onText` / `offText` | `string` | `'Bật'` / `'Tắt'` | Chữ trạng thái (i18n), một từ |
| input | `disabled` | `boolean` | `false` | Gộp với disabled của form control; vẫn thấy giá trị |
| input | `readonly` | `boolean` | `false` | Thấy giá trị, focus được, không đổi được, `aria-readonly` |
| output | `checkedChange` | `boolean` | | Từ `model`; chỉ phát khi người dùng đổi hoặc nơi dùng đặt `checked` |

Không có content slot.

## 4. Variants & sizes
| Variant | Dùng khi | Không dùng khi |
|---------|----------|----------------|
| `labelPosition="start"` (mặc định) | Danh sách thiết lập: nhãn bên trái, switch ngay sau nhãn | Đứng trong lưới form cạnh các field có nhãn trên |
| `labelPosition="top"` | Trong lưới form / dialog cấu hình, cạnh `nxt-form-field` | Danh sách thiết lập dài |
| `showState` | Nhãn là danh từ chưa nói rõ bật nghĩa là gì ("Chế độ duyệt nhanh") | Nhãn đã là câu khẳng định rõ ("Tự chuyển sang đơn kế tiếp") |

Không có size: rãnh cao `size.control.sm` theo mật độ (gọn 24 · vừa 32 · rộng 40px), rộng = 51/31 × chiều cao (tỉ lệ iOS 51×31); nút có vùng chạm tối thiểu `size.icon.lg` (24px), và `touch-target` theo chiều khối trên cảm ứng (§8).

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ rãnh `border.input` (tắt) | ✓ bật: rãnh `bg.success-hover` (vẫn xanh lá, đậm hơn); tắt: không đổi màu (giữ tương phản với tay gạt ở mọi mode) | ✓ ring token quanh rãnh | — (đổi ngay khi thả) | ✓ `checked`: rãnh `bg.success` (xanh lá), tay gạt trắng ở cuối | ✓ `disabled` native: rãnh `bg.disabled`, tay gạt `text.disabled`, vẫn thấy vị trí bật/tắt | — (thiết lập lưu nền: nơi dùng báo kết quả bằng `nxt-alert` / live region, hoàn tác khi lỗi) | — (switch có hiệu lực ngay, không có giá trị sai; lỗi lưu báo ở cấp trang) | ✓ `readonly`: rãnh `bg.muted` + viền `border.input`, tay gạt `icon.subtle`, focus được, `aria-readonly`, bấm không đổi | — (luôn có giá trị bật hoặc tắt) |

Bật / tắt phân biệt bằng **vị trí** tay gạt và màu rãnh, không chỉ bằng màu (WCAG 1.4.1).

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/switch/

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Focus vào / ra nút; `disabled` bị bỏ qua (native); `readonly` vẫn nhận focus |
| Space | Đổi trạng thái (native `button` → `click`) |
| Enter | Đổi trạng thái (native `button`; APG cho phép, SAP Fiori yêu cầu) |
| Space / Enter khi `readonly` | Không đổi |

- `button type="button" role="switch"` + `aria-checked="true|false"`. Tên truy cập từ `label[for]` (button là phần tử gắn nhãn được), nên bấm vào nhãn cũng đổi trạng thái.
- `aria-describedby` = id của gợi ý khi có `hint`.
- `aria-readonly="true"` khi `readonly` (ARIA 1.2: `switch` kế thừa từ `checkbox`).
- Chữ trạng thái "Bật"/"Tắt" có `aria-hidden="true"`: screen reader đã đọc "bật/tắt" từ `aria-checked`, đọc thêm sẽ bị lặp.
- Rãnh và tay gạt là trang trí (`aria-hidden`).
- Không tự viết xử lý phím: Space / Enter là hành vi native của `button`.
- Focus ring: `:focus-visible` trên nút, vẽ quanh rãnh với `focus.ring.*`. Forced colors: rãnh có viền `ButtonText`, tay gạt màu `ButtonText`, rãnh bật tô `Highlight`.

## 7. Tokens
`packages/tokens/src/component/switch.tokens.json`:

| Token | Alias semantic | Ghi chú |
|-------|----------------|---------|
| `track-bg` | `color.border.input` | Rãnh tắt: viền mềm kiểu iOS (ADR-012), chỉ còn nhìn thấy (xem tương phản bên dưới) |
| `track-bg-checked` / `-hover` | `color.bg.success` / `color.bg.success-hover` | Rãnh bật: xanh lá (skin iOS), giữ xanh lá khi hover |
| `track-bg-disabled` | `color.bg.disabled` | |
| `track-bg-readonly` | `color.bg.muted` | |
| `track-border-readonly` | `color.border.input` | |
| `thumb-bg` | `color.text.on-primary` | Tay gạt trắng (sáng ở cả hai mode), phân biệt với rãnh bật ≥ 3:1 |
| `thumb-bg-disabled` | `color.text.disabled` | |
| `thumb-bg-readonly` | `color.icon.subtle` | ≥ 3:1 với `bg.muted` |
| `track-height` | `size.control.sm` | Chiều cao rãnh theo mật độ (24 · 32 · 40px); rộng = 51/31 × chiều cao |
| `touch-target` | `size.row.md` (tạm) | Chiều cao tối thiểu của nút trên `pointer: coarse` (§8) |
| `radius` | `radius.pill` | |
| `label-text` | `color.text.default` | |
| `hint-text`, `state-text` | `color.text.subtle` | |

Dùng thẳng semantic: `space.gap.{xs,sm}`, `size.icon.lg` (vùng chạm), `border-width.{default,strong}` (khoảng hở tay gạt), `typography.{body-md,label-md,caption}`, `focus.ring.*`, `motion.duration.fast`, `motion.ease.standard`.

Kiểu iOS (2026-11-16): rãnh tỉ lệ 51×31 theo `size.control.sm`, tay gạt trắng đổ bóng mềm `elevation.raised` (token, không animate), rãnh bật **xanh lá** `bg.success` (hover `bg.success-hover`), thay cho `bg.primary` trước đó. Màu rãnh bật không theo brand.

Tương phản (`npm run ds:tokens`, 2026-11-16): tay gạt `text.on-primary` trên rãnh bật `bg.success` **4,61** (sáng và tối), trên `bg.success-hover` **5,94**; cả hai cặp có trong `contrastPairs` (min 3, WCAG 1.4.11). Rãnh tắt `border.input` trên `surface` chỉ **1,58** (sáng) / **1,72** (tối), và tay gạt trên rãnh tắt 1,58 / 10,39: ngưỡng trong `contrastPairs` là 1,3 theo ADR-012 (viền mềm kiểu iOS, "còn nhìn thấy" chứ không còn là ranh giới 3:1), nên trạng thái tắt/bật được báo bằng **vị trí tay gạt và màu rãnh bật**, không dựa vào viền rãnh tắt (WCAG 1.4.1). `icon.subtle` / `bg.muted` (tay gạt chỉ đọc) 4,11 / 5,83. ❓ Chưa có trong `contrastPairs`: `bg.success` / `bg.surface` (rãnh bật trên nền; ở sáng cùng màu với `icon.success`, 4,61, ở tối `bg.success` là green.600 còn `icon.success` là green.400 nên chưa đo).

## 8. Density, responsive, i18n
- Rãnh cao `size.control.sm` nên đổi theo density (gọn 24 · vừa 32 · rộng 40px), rộng = 51/31 × chiều cao, tay gạt co theo; nút bao quanh rãnh có vùng chạm tối thiểu `size.icon.lg` (24px, không đổi theo density); khoảng cách tới nhãn theo density.
- **Density / touch (Apple HIG: vùng chạm ≥ 44×44pt).** Nút `.nxt-switch__control` là lớp bọc vô hình quanh rãnh, nên trên thiết bị có `@media (pointer: coarse)` nó có `min-block-size` và `min-inline-size` bằng `touch-target`, rãnh vẫn nằm giữa và giữ nguyên cỡ nhìn thấy (rãnh rộng khoảng 53px ở comfortable đã đủ chiều ngang; hàng cao thêm tới `touch-target`). Không có rule nào cho `pointer: fine`. Token `touch-target` tạm alias `size.row.md` (44px ở comfortable, 56px ở spacious, 32px ở compact); cần token `semantic.size.touch-target` (44px, không đổi theo density), khi có chỉ việc đổi alias (xem Button §8).
- Nhãn dài tự xuống dòng; ở `labelPosition="start"` switch giữ kích thước (không co) và đứng ngay sau nhãn. Khi không đủ chỗ cho cả hai trên một hàng, dùng `labelPosition="top"`.
- Tay gạt trượt theo hướng đọc (logical `inset-inline-start`), tự đúng ở RTL.
- Chuyển động dùng `motion.duration.fast`; chế độ reduced motion đưa về 0.
- Mọi chữ mặc định (`onText`, `offText`) override được qua input.

## 9. Content guidelines
- Nhãn nói thiết lập được điều khiển, dạng khẳng định: "Nhận thông báo qua email", "Tự chuyển sang đơn kế tiếp sau khi duyệt". Không viết "Bật/tắt thông báo" (chữ "bật/tắt" thừa) và không viết câu phủ định.
- Không đổi nhãn theo trạng thái (không "Đang bật" / "Đang tắt" trong nhãn).
- `hint` nói hệ quả ngay lập tức: "Áp dụng ngay cho mọi đơn đang chờ bạn duyệt."
- Thiết lập lưu lên máy chủ: thông báo kết quả ngắn qua live region ("Đã bật thông báo qua email.") và trả switch về trạng thái cũ nếu lưu thất bại.

## 10. Acceptance (Definition of Done)
- [ ] Mọi trạng thái ở §5 có trong docs example (`switch-basic`, `switch-states`) — chưa chạy `docs:generate` / xem bản render
- [x] Unit test: `role=switch` + `aria-checked`, tên từ nhãn, bấm nút / bấm nhãn đổi trạng thái, Space / Enter (qua `click` của `button` native), `readonly` không đổi và vẫn focus được, `disabled`, `hint` → `aria-describedby`, chữ trạng thái `aria-hidden` và override được, Angular forms (giá trị, disabled, touched)
- [ ] axe: 0 vi phạm ở sáng/tối/gọn — chưa chạy
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- Kéo tay gạt bằng chuột / chạm (Fiori) chưa làm: bấm là đủ và đạt WCAG 2.5.7 (không bắt buộc kéo).
- Chưa có trạng thái `loading` khi thiết lập lưu lên máy chủ (nơi dùng tự khoá bằng `disabled` và báo bằng live region).
- Disabled dùng `disabled` native (không focus được), như checkbox; lý do ghi trong `hint`.
- `contrastPairs` còn thiếu cặp `bg.success` / `bg.surface` (❓ ở §7), validator chưa tự kiểm rãnh bật trên nền.

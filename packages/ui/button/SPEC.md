---
component: button
status: beta
owner: "NXT core"
updated: 2026-11-16
apg-pattern: button (toggle button khi có `pressed`)
---

# Button: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** kích hoạt một hành động ngay trên trang hiện tại, ví dụ lưu, gửi duyệt, xoá hay mở dialog.
- **Khi nào dùng:** hành động thay đổi dữ liệu hoặc trạng thái giao diện.
- **Khi nào KHÔNG dùng:**
  - Điều hướng sang trang khác: dùng link (`a`). Nếu link cần trông như nút thì dùng `a[nxtButton]`, vẫn giữ ngữ nghĩa link.
  - Chọn giữa các giá trị: dùng segmented / radio.
  - Bật/tắt một **cài đặt** có hiệu lực ngay (thông báo email, chế độ tối): dùng switch. Bật/tắt một **chế độ hiển thị** trong toolbar ("Chỉ xem của tôi", hiện khung chi tiết): dùng toggle button (`pressed`, §4). Lựa chọn cần bấm Lưu mới có hiệu lực: dùng checkbox.
  - Chọn một trong nhiều chế độ loại trừ nhau (Bảng / Thẻ): dùng segmented.
  - Hành động chỉ có icon: dùng `nxtIconButton` kèm `aria-label` và `nxtTooltip` cùng nội dung.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Container (`button` / `a` native) | ✓ | Mang role và trạng thái |
| 2 | Icon đầu | — | `svg` được chiếu vào, `aria-hidden="true"` |
| 3 | Nhãn | ✓ | Động từ + đối tượng: "Lưu hồ sơ" |
| 4 | Icon cuối | — | Ví dụ mũi tên mở menu |
| 5 | Spinner | — | Chỉ hiện khi `loading`; giữ nguyên kích thước nút |

## 3. API (Angular)
Selector: `button[nxtButton]`, `a[nxtButton]`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'danger'` | `'secondary'` | Mức nhấn mạnh |
| input | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Chiều cao lấy từ density hiện hành |
| input | `disabled` | `boolean` | `false` | Dùng `aria-disabled`: nút vẫn focus được để tooltip giải thích lý do |
| input | `loading` | `boolean` | `false` | Hiện spinner, `aria-busy="true"`, chặn kích hoạt |
| input | `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | Chỉ áp dụng cho `<button>`. Mặc định `button` để tránh submit form ngoài ý muốn |
| model | `pressed` | `boolean \| undefined` | `undefined` | Toggle button: `true`/`false` biến nút thành nút bật/tắt (`aria-pressed`), bấm thì đảo giá trị và phát `pressedChange` (`[(pressed)]`). `undefined` = nút thường, không có `aria-pressed`. Chỉ cho `secondary` / `ghost` và chỉ trên `<button>` |
| content | (default) | text, `svg` | | Nhãn và icon |

Không có output riêng: dùng `(click)` native. Khi `disabled` hoặc `loading`, click bị chặn trước mọi listener của người dùng.

## 4. Variants & sizes
| Variant | Dùng khi | Không dùng khi |
|---------|----------|----------------|
| `primary` | Hành động chính của vùng: "Lưu", "Gửi duyệt". **Tối đa 1 nút primary mỗi vùng** | Có nhiều hành động ngang hàng |
| `secondary` | Hành động phụ: "Huỷ", "Xuất file" | Đây là hành động chính |
| `ghost` | Hành động ít quan trọng, trong toolbar hoặc trong hàng bảng | Đứng một mình, dễ bị nhầm là text |
| `danger` | Hành động phá huỷ: "Xoá 3 nhân viên" | Cảnh báo không phá huỷ (dùng secondary + dialog) |

**Toggle button** (`pressed` khác `undefined`). Theo SAP Fiori (Toggle button): chỉ có mức thường và trong suốt, không có toggle nhấn mạnh.

| Variant | Toggle được | Ghi chú |
|---------|-------------|---------|
| `secondary` | ✓ | Toggle có chữ trong toolbar: "Chỉ xem của tôi" |
| `ghost` | ✓ | Toggle icon trong toolbar/hàng: hiện/ẩn khung chi tiết (bắt buộc `aria-label` + tooltip) |
| `primary`, `danger` | ✗ | Dev mode cảnh báo; `aria-pressed` vẫn đặt nhưng không có kiểu "đang bật" |

Trạng thái "đang bật": nền `bg.selected`, viền `border.selected` dày gấp đôi (viền + `box-shadow` inset cùng màu) để không chỉ khác ở màu.

Chiều cao (`min-block-size`) lấy từ `size.control.{sm,md,lg}` nên đổi theo density. Mức mặc định là **comfortable**:

| Size | compact | comfortable | spacious |
|------|---------|-------------|----------|
| `sm` | 24px | 32px | 40px |
| `md` | 28px | 36px | 46px |
| `lg` | 32px | 40px | 54px |

Nút là **viên thuốc** (`radius.pill`), không viền (viền trong suốt, giữ độ dày để bật/tắt toggle không nhảy layout). Theo skin iOS:
- `primary`: nền đặc `bg.primary`, chữ `text.on-primary`, **không có bóng** (`elevation.none`). `danger` cũng phẳng, nền `bg.danger`.
- `secondary` là kiểu **"tinted"**: nền accent nhạt (`bg.primary-subtle`), chữ accent (`text.link`); hover `bg.selected`, nhấn `bg.selected-hover`.
- `ghost` là kiểu **"plain"**: nền trong suốt, chữ accent (`text.link`); hover `bg.surface-hover`, nhấn `bg.muted`.
- Nút chỉ có icon thành hình tròn (rộng bằng chiều cao). Không animate `box-shadow`.

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ (chỉ trên thiết bị có hover) | ✓ ring token | ✓ | ✓ toggle: `pressed` → `aria-pressed="true"`, `data-pressed` | ✓ `aria-disabled` (toggle cũng không đổi trạng thái) | ✓ | — (lỗi hiển thị ở form/alert) | — | — (luôn có nhãn) |

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/button/

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Focus vào hoặc ra khỏi nút, kể cả khi `disabled` (để đọc được lý do) |
| Enter | Kích hoạt (native); bị chặn khi `disabled` / `loading` |
| Space | Kích hoạt (native `<button>`); bị chặn khi `disabled` / `loading` |
| Enter / Space trên toggle button | Đảo `pressed` (và chạy `(click)`); bị chặn khi `disabled` / `loading` |

- Role: native `button` hoặc `link`, không gắn thêm `role`.
- Toggle button: `aria-pressed="true|false"` (APG button, biến thể toggle). Nhãn **không đổi** khi bật/tắt ("Chỉ xem của tôi" giữ nguyên), vì screen reader đã đọc trạng thái nhấn.
- `aria-disabled="true"` khi disabled. `aria-busy="true"` khi loading. Nhãn vẫn nằm trong accessibility tree khi loading (chỉ ẩn bằng opacity).
- Icon trong nút phải có `aria-hidden="true"`. Nút chỉ có icon thì dùng `nxtIconButton` kèm `aria-label`.

## 7. Tokens
`packages/tokens/src/component/button.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `height-{sm,md,lg}` | `size.control.{sm,md,lg}` |
| `padding-inline-{sm,md,lg}` | `space.inset.md`, `space.inset.lg`, `space.inset.lg` |
| `gap` | `space.gap.sm` |
| `radius` | `radius.pill` |
| `touch-target` | `size.row.md` (tạm; xem §8 Density / touch) |
| `shadow` | `elevation.none` (primary và danger phẳng, không bóng; token giữ lại để sản phẩm bật bóng nếu cần) |
| `font`, `font-sm` | `typography.label-md`, `typography.label-sm` |
| `icon-size` | `size.icon.sm` |
| `{variant}-bg / -bg-hover / -bg-pressed / -text / -border` | `color.bg.*`, `color.text.*`, `color.border.*` (mọi viền variant là `border.transparent`; secondary "tinted": `bg.primary-subtle` → hover `bg.selected` → nhấn `bg.selected-hover`, chữ `text.link`; ghost "plain": `bg.transparent` → hover `bg.surface-hover` → nhấn `bg.muted`, chữ `text.link`) |
| `disabled-bg / -text / -border` | `color.bg.disabled`, `color.text.disabled`, `color.border.transparent` |
| `pressed-bg / -bg-hover / -text / -border` | `color.bg.selected`, `color.bg.selected-hover`, `color.text.default`, `color.border.selected` |

Spinner quay một vòng trong `motion.duration.loop` (700ms; motion `reduced` chậm lại 1600ms, không dừng hẳn vì đây là chỉ báo đang chờ).

## 8. Density, responsive, i18n
- Chiều cao theo `size.control.*`, nên đổi theo density (bảng §4). Vùng chạm nhỏ nhất là 24×24 (compact `sm`), đạt WCAG 2.5.8.
- **Density / touch (Apple HIG: vùng chạm ≥ 44×44pt).** Trên thiết bị có `@media (pointer: coarse)` (điện thoại, tablet), vùng nhận chạm của mọi nút, kể cả `nxtIconButton`, được nới tới tối thiểu `touch-target` theo chiều khối, còn **phần nhìn thấy giữ nguyên** (cỡ `sm` 32px vẫn trông như 32px). Nút icon vuông được nới cả chiều ngang. Cách làm: một `::after` trong suốt, thuộc chính nút (chạm vào nó là bấm nút), đặt `inset` âm bằng một nửa phần thiếu; nút đã đủ cao thì `::after` co lại bên trong, không có tác dụng. Không có rule nào cho `pointer: fine`, nên bố cục và vùng bấm trên máy tính không đổi. Token `touch-target` tạm alias `size.row.md` (44px ở comfortable, 56px ở spacious, 32px ở compact), nên: trên cảm ứng hãy đặt density `spacious` hoặc `comfortable` (xem Foundations → Spacing), và cần token `semantic.size.touch-target` (44px, không đổi theo density) để vùng chạm luôn đúng 44px; khi có, chỉ việc đổi alias của `touch-target`. Vùng nới của hai nút kề nhau chỉ chồng nhau trong khoảng trống giữa chúng (nút sau trong DOM thắng); với khoảng cách theo `space.gap.*` thì vùng nới không chạm tới phần nhìn thấy của nút kề.
- Nhãn không xuống dòng (`white-space: nowrap`). Nhãn quá dài là lỗi nội dung, không phải lỗi layout: rút gọn nhãn.
- Tiếng Việt: line-height của label-md (20px / 14px) đủ chỗ cho dấu chồng.

## 9. Content guidelines
- Động từ + đối tượng, sentence case: "Thêm nhân viên", "Gửi duyệt". Không dùng "OK" hay "Xác nhận" chung chung.
- Nút danger ghi rõ phạm vi: "Xoá 3 nhân viên", không chỉ "Xoá".
- Tối đa khoảng 3 từ cho nút trong toolbar và hàng bảng.
- Toggle button: nhãn là tên chế độ ("Chỉ xem của tôi", "Hiện cột đã ẩn"), không phải động từ đảo theo trạng thái ("Bật…/Tắt…").

## 10. Acceptance (Definition of Done)
- [x] Mọi trạng thái ở §5 có trong docs example
- [x] Unit test phủ keyboard map §6 và chặn kích hoạt khi disabled/loading
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-16)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)
- [x] Toggle button (2026-11-06): unit test `aria-pressed`/`data-pressed`, bấm đảo và phát `pressedChange`, nút thường không có `aria-pressed`, disabled không đảo; example `button-toggle`
- [ ] axe cho `button-toggle`: cần `npm run build && npm run test:a11y` (phiên chính chạy)

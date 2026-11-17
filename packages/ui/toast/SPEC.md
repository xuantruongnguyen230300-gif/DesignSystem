---
component: toast
status: beta
owner: "NXT core"
updated: 2026-11-06
apg-pattern: không có pattern APG riêng; dùng live region `polite` (status) + nút native
---

# Toast: Spec

Entry `@nxt/ui/toast` gồm service `NxtToast` (`show()`, `dismiss()`, `clear()`) và `nxt-toast-host` (component hiển thị toast, service tự gắn vào CDK Overlay; trang không phải đặt gì).

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** biết ngay một thao tác vừa **thành công** ("Đã lưu hồ sơ Nguyễn Văn An.") mà không bị ngắt, kể cả khi chỗ thao tác vừa biến mất (drawer đã đóng, hàng đã rời khỏi danh sách).
- **Khi nào dùng:**
  - xác nhận ngắn sau thao tác thành công: lưu, gửi duyệt, sao chép, xuất file xong;
  - thao tác trong drawer/dialog vừa đóng, không còn chỗ trong trang để đặt alert;
  - kèm **một** hành động tiện lợi như "Hoàn tác" khi thao tác hoàn tác được ở nơi khác nữa.
- **Khi nào KHÔNG dùng:**
  - Lỗi, cảnh báo, thành công một phần: dùng [Alert](../alert/SPEC.md) trong trang, gần chỗ lỗi (anti-pattern "Toast cho lỗi cần xử lý", principles §4).
  - Người dùng phải đọc, sao chép hoặc xác nhận (mã quyết định, số chứng từ): dùng `NxtDialog.notify()` ([Dialog](../dialog/SPEC.md)).
  - "Hoàn tác" là **cách duy nhất** để lấy lại dữ liệu: dùng `nxt-alert` có nút "Hoàn tác" trong `[nxtLiveRegion]`, vì alert không tự biến mất (WCAG 2.2.1).
  - Lỗi trường form, tóm tắt lỗi khi lưu: dùng `nxt-form-field` + [Action bar](../action-bar/SPEC.md).
  - Thông báo hệ thống bất đồng bộ cần xem lại sau: dùng chuông thông báo trên topbar (của sản phẩm).

Theo SAP Fiori (Message Toast): chỉ một kiểu (thành công), không cho lỗi/cảnh báo, không ngắt người dùng, tự biến mất, không cho nội dung cần sao chép. NXT khác Fiori ở một điểm có chủ đích: cho **tối đa một** hành động ("Hoàn tác"), với điều kiện ở §9.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Pane `.nxt-toast-pane` | ✓ | Overlay CDK; rộng bằng vùng nội dung (`main`), dính đáy vùng đó, phía trên `nxt-action-bar` nếu có; không chặn chuột ngoài toast |
| 2 | Toast `.nxt-toast` | ✓ | Nền đảo `bg.inverse` (kiểu C), không viền, `elevation.overlay`, bo `radius.container`; căn giữa |
| 3 | Icon | ✓ | `circle-check` màu `icon.success`, trang trí (`aria-hidden`) |
| 4 | Thông điệp | ✓ | Một câu, tối đa 2 dòng |
| 5 | Hành động | — | Một nút `ghost` `sm`, ví dụ "Hoàn tác" |

## 3. API (Angular)
Service `NxtToast` (`providedIn: 'root'`). Export type `NxtToastOptions`, `NxtToastRef`, `NxtToastDismissReason`; hàm `nxtToastDuration()`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| method | `show(message, options?)` | `(string, NxtToastOptions) => NxtToastRef` | | Đưa toast vào hàng đợi; hiện ngay nếu không có toast nào đang hiện |
| method | `dismiss()` | `() => void` | | Ẩn toast đang hiện (toast kế trong hàng đợi hiện tiếp) |
| method | `clear()` | `() => void` | | Ẩn toast đang hiện và bỏ cả hàng đợi (ví dụ khi rời trang) |
| option | `action` | `string` | `undefined` | Nhãn của **một** hành động, ví dụ "Hoàn tác" |
| option | `duration` | `number` (ms) | theo độ dài chữ | Thời gian hiện; tối thiểu 3000 ms (đặt thấp hơn vẫn hiện 3000 ms) |
| option | `announcement` | `string` | = `message` | Câu đọc cho screen reader nếu cần khác chữ hiển thị (ví dụ nói thêm nơi hoàn tác) |
| ref | `afterDismissed` | `Observable<'timeout' \| 'action' \| 'dismiss'>` | | Phát một lần khi toast ẩn (hoặc bị bỏ khỏi hàng đợi: `'dismiss'`) |
| ref | `onAction` | `Observable<void>` | | Phát khi bấm hành động |
| ref | `dismiss()` | `() => void` | | Ẩn toast này (hoặc bỏ khỏi hàng đợi nếu chưa hiện) |

**Thời gian hiện mặc định** (`nxtToastDuration(message, hasAction)`): `1000 ms + 60 ms × số ký tự`, kẹp trong **3000–5000 ms** (khoảng 3–5 giây theo độ dài câu). Có hành động: **10000 ms**, để kịp đọc và bấm.

## 4. Variants & sizes
Không có variant (chỉ thành công). Không có size; bề rộng theo nội dung, tối đa `toast-width` (400px), không vượt vùng nội dung trừ gutter.

| Có hành động | Dùng khi | Không dùng khi |
|--------------|----------|----------------|
| Không | Xác nhận thuần: "Đã lưu hồ sơ." | |
| Có ("Hoàn tác") | Thao tác hoàn tác được, và còn đường khác để hoàn tác (thùng rác, lịch sử, "Dùng lại") | Hoàn tác chỉ có ở đây: dùng alert có "Hoàn tác" |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ hiện rồi tự ẩn | ✓ dừng đếm giờ khi chuột ở trên toast | ✓ dừng đếm giờ khi focus ở trong toast (nút hành động có ring) | — (theo nút) | — | — | — | — (toast không báo lỗi) | — | — (không hiện toast rỗng) |

- Hàng đợi: một toast một lúc; toast mới chờ toast đang hiện ẩn đi.
- Ẩn khi focus đang ở trong toast: focus về phần tử có focus trước khi vào toast; không có thì về `main`.

## 6. Keyboard & ARIA
Không có pattern APG riêng; dựa trên live region (WAI-ARIA `status`) và nút native.

| Phím | Hành vi |
|------|---------|
| (khi hiện) | Không lấy focus. Thông điệp được đọc qua live region `polite` (CDK `LiveAnnouncer`) |
| <kbd>Tab</kbd> | Nút hành động (nếu có) nằm trong thứ tự Tab ở cuối trang (overlay); focus vào thì dừng đếm giờ |
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên nút hành động | Chạy hành động (`onAction`), ẩn toast, focus về chỗ cũ |
| <kbd>Esc</kbd> khi focus trong toast | Ẩn toast, focus về chỗ cũ |

- Toast không có `role` riêng: câu thông báo đi qua `LiveAnnouncer` (vùng `aria-live="polite"` có sẵn trong `body`, CDK giữ nó không bị ẩn khi dialog mở). Nhờ vậy không đọc hai lần.
- Không tự focus, không ngắt (WCAG 3.2, 2.2.1): toast thuần chỉ xác nhận, thông tin đã có trên trang (dữ liệu đã đổi).
- Có hành động: thời gian dài hơn (10 giây), dừng khi hover/focus, và hành động phải có đường khác (§9), nên toast không phải là giới hạn thời gian cho việc của người dùng.
- Chuyển động: hiện bằng `motion.duration.normal`; motion `reduced` (theo `prefers-reduced-motion`) đưa về 0, toast hiện ngay.

## 7. Tokens
`packages/tokens/src/component/toast.tokens.json`:

| Token | Alias semantic | Ghi chú |
|-------|----------------|---------|
| `bg` | `color.bg.inverse` | Nền toast (bề mặt đảo) |
| `border` | `color.border.transparent` | Không viền; chỉ hiện ở forced-colors |
| `text` | `color.text.inverse` | Chữ thông điệp (cặp `text.inverse`/`bg.inverse` đã có trong `contrastPairs`) |
| `icon` | `color.icon.inverse` | Icon thành công (màu đảo để đạt tương phản ở mọi brand) |
| `action-text` | `color.text.inverse` | Chữ nút hành động; hover/nhấn gạch chân (không có token nền hover đảo) |
| `focus-ring` | `color.text.inverse` | Vòng focus của nút hành động, ≥ 3:1 với `bg.inverse` ở mọi mode × brand |
| `radius` | `radius.container` | 28px; toast xuống dòng nên không dùng pill |
| `width` | `size.popover.md` | Bề rộng tối đa |

Dùng thẳng semantic: `elevation.overlay`, `border-width.default`, `space.inset.{sm,md}`, `space.gap.sm`, `space.section.sm`, `layout.gutter-md`, `typography.body-md`, `size.icon.md`, `motion.duration.normal`, `motion.ease.enter`, `z.toast` (qua CDK overlay).

## 8. Density, responsive, i18n
- Padding theo density; bề rộng tối đa không đổi.
- Vị trí: **đáy giữa vùng nội dung** (`main` / `[role="main"]`, tức vùng nội dung của `nxt-app-shell`), không phải giữa cả màn hình, để không đè lên sidenav. Có `nxt-action-bar` đang hiện thì toast nằm ngay trên nó. Không tìm thấy `main` thì dùng đáy giữa màn hình.
- Câu dài xuống dòng (tối đa khoảng 2 dòng); nút hành động xuống dòng dưới khi hẹp.

## 9. Content guidelines
- Một câu, thì quá khứ, nói đúng đối tượng: "Đã lưu hồ sơ Nguyễn Văn An.", "Đã ngừng sử dụng 3 chức danh.", "Đã sao chép mã nhân viên NV-0241.".
- Không viết "Thành công!", "Thao tác thành công".
- Hành động: một động từ, tối đa 2 từ: "Hoàn tác", "Xem". Hành động trong toast **luôn phải có đường khác** (nút "Dùng lại", thùng rác, lịch sử).
- Không đưa mã/số người dùng cần chép lại vào toast; dùng `notify()`.

## 10. Acceptance (Definition of Done)
- [x] Unit test: đọc qua `LiveAnnouncer` `polite`; tự ẩn theo thời gian; thời gian theo độ dài chữ (3–5 s, có hành động 10 s, tối thiểu 3 s); một toast một lúc (hàng đợi); dừng khi hover và khi focus; hành động phát `onAction` và ẩn; Esc ẩn và trả focus; `clear()` bỏ hàng đợi (`src/toast.spec.ts`)
- [x] Example: thành công thuần và có "Hoàn tác" (`apps/docs/src/examples/toast/`)
- [ ] axe: 0 vi phạm ở sáng/tối/gọn (cần `npm run build && npm run test:a11y`; phiên chính chạy)
- [x] `npm run ds:check` sạch (tokens + hardcoded) cho file của toast
- [x] Docs page đủ mục (`apps/docs/src/content/components/toast.md`)

## 11. Việc còn mở
- Phím tắt đưa focus vào toast (Fiori dùng Ctrl+Shift+M) chưa làm: tổ hợp này trùng phím đổi hồ sơ của Chrome; cần chọn phím chung với lệnh "mở danh sách thông báo" của action bar.
- Dừng đếm giờ khi tab trình duyệt bị ẩn (`visibilitychange`) chưa làm.
- Vùng nội dung tìm theo landmark `main`; nếu sản phẩm có nhiều `main` (không hợp lệ) thì lấy cái đầu tiên.

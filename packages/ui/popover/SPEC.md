---
component: popover
status: beta
owner: "NXT core"
updated: 2026-11-16
apg-pattern: dialog (không modal; focus vòng trong panel, xem §6)
---

# Popover: Spec

Entry `@nxt/ui/popover` gồm:
- `nxt-popover`: nội dung của panel (tiêu đề, thân, footer tuỳ chọn), khai báo ngay trong template;
- `[nxtPopoverTriggerFor]`: gắn lên một `button` để mở/đóng panel cạnh nó (CDK Overlay).

Popover là **nền chung** cho panel nổi neo vào một nút: thẻ nhanh (quick view nhân viên), danh sách thông báo của [Action bar](../action-bar/SPEC.md), xác nhận nhanh ngay cạnh nút ("Bỏ bản nháp này?").

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** xem hoặc làm một việc nhỏ gắn với **một phần tử cụ thể** (tên nhân viên, nút thông báo, nút bỏ nháp) mà không rời ngữ cảnh và không chặn cả trang.
- **Khi nào dùng:**
  - thẻ nhanh: tóm tắt một đối tượng (avatar, chức danh, liên hệ) khi bấm tên trong bảng, đơn phê duyệt, timeline;
  - danh sách thông báo của form (do `nxt-action-bar` dựng sẵn);
  - xác nhận nhanh ngay cạnh nút cho thao tác ít rủi ro, ví dụ "Bỏ bản nháp này?".
- **Khi nào KHÔNG dùng:**
  - Gợi ý một câu, không tương tác: dùng [Tooltip](../tooltip/SPEC.md).
  - Danh sách hành động: dùng [Menu](../menu/SPEC.md) (bàn phím mũi tên, type-ahead).
  - Bộ lọc của danh sách: dùng [Filter](../filter/SPEC.md) (đã có panel riêng với "Áp dụng").
  - Buộc người dùng quyết định, hoặc thao tác không hoàn tác được: dùng `NxtDialog.confirm()` ([Dialog](../dialog/SPEC.md)).
  - Form tạo/sửa, nội dung dài phải cuộn nhiều: dùng [Drawer](../drawer/SPEC.md).
  - Thông tin không gắn với phần tử nào: đặt thẳng trên trang (alert, descriptions).

Theo SAP Fiori (Popover, Quick view): đặt cạnh trigger, trigger vẫn nhìn thấy; mở bằng click, không bằng hover; focus phần tử đầu; Tab vòng trong popover; Escape, bấm ngoài, bấm lại trigger đều đóng và trả focus; không dùng khi cần nền phía sau bị khoá.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Trigger | ✓ | `button` native có `[nxtPopoverTriggerFor]`; thường là `nxtButton` / `nxtIconButton` |
| 2 | Pane `.nxt-popover-pane` | ✓ | Overlay CDK neo vào trigger, tự lật khi thiếu chỗ (`--below`, `--above`, `--start`, `--end`) |
| 3 | Panel `.nxt-popover` | ✓ | `role="dialog"` có tên; nền `surface-raised`, viền mảnh, bo `radius.overlay` (20px, cùng họ với dialog và menu), `elevation.overlay` |
| 4 | Header | — | Tiêu đề `h2` (là tên của dialog). Không có tiêu đề thì bắt buộc `label` |
| 5 | Thân `.nxt-popover__body` | ✓ | Nội dung chiếu vào; cuộn riêng khi cao quá |
| 6 | Footer `[nxtPopoverFooter]` | — | Nút hành động, căn phải, nút chính hoặc nút phá huỷ **cuối cùng**; ẩn khi rỗng. Xác nhận nhanh: "Huỷ" đứng trước và nhận focus ban đầu (`cdkFocusInitial`), nút phá huỷ đứng sau |

Không có nút "Đóng" trong header: Escape, bấm ngoài và bấm lại trigger đã đủ; footer **luôn có nút "Huỷ"** khi popover chứa xác nhận (xem §9).

## 3. API (Angular)
Selector: `nxt-popover` (exportAs `nxtPopover`), `[nxtPopoverTriggerFor]` (exportAs `nxtPopoverTrigger`), marker `[nxtPopoverFooter]`. Export type `NxtPopoverPosition`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxt-popover` input | `title` | `string` | `undefined` | Tiêu đề hiển thị (`h2`), cũng là tên truy cập (`aria-labelledby`) |
| `nxt-popover` input | `label` | `string` | `undefined` | Tên truy cập khi không có tiêu đề (`aria-label`); bắt buộc trong trường hợp đó |
| `nxt-popover` output | `opened` | `void` | | Panel vừa mở |
| `nxt-popover` output | `closed` | `void` | | Panel vừa đóng (mọi cách) |
| `nxt-popover` method | `close(options?)` | `({ restoreFocus?: boolean }) => void` | `restoreFocus: true` | Đóng từ bên trong (ví dụ sau khi chọn một mục) |
| `nxt-popover` content | (default) | bất kỳ | | Thân |
| `nxt-popover` content | `[nxtPopoverFooter]` | nút | | Footer |
| trigger input | `nxtPopoverTriggerFor` | `NxtPopover` | (bắt buộc) | Popover cần mở |
| trigger input | `nxtPopoverPosition` | `'bottom' \| 'top' \| 'start' \| 'end'` | `'bottom'` | Phía ưu tiên; thiếu chỗ thì lật sang phía đối diện |
| trigger method | `open()`, `close(options?)`, `toggle()` | | | Mở/đóng bằng code (ví dụ action bar tự mở danh sách thông báo khi lưu có lỗi) |
| trigger signal | `isOpen` | `Signal<boolean>` | `false` | |

Cấu hình overlay cố định: `flexibleConnectedTo(trigger)`, `withPush(true)`, scroll `reposition()`, không backdrop (trang phía sau vẫn bấm được; bấm ra ngoài thì đóng). Bề rộng co theo nội dung, tối đa `size.popover.md` và không vượt màn hình.

## 4. Variants & sizes
Không có variant. Bề rộng theo nội dung, tối đa `popover-width` (400px); cao tối đa 70% màn hình, thân cuộn.

| Vị trí (`nxtPopoverPosition`) | Dùng khi | Lật sang |
|------|----------|----------|
| `bottom` (mặc định) | Trigger trong trang, toolbar, ô bảng | `top` |
| `top` | Trigger ở đáy màn hình: nút thông báo của action bar | `bottom` |
| `start` / `end` | Trigger ở mép, cần giữ cột bên cạnh nhìn thấy | phía đối diện |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ đóng / mở (`aria-expanded`) | — (theo trigger) | ✓ panel không có phần tử focus được thì focus chính panel (viền focus) | — | — | ✓ trigger `disabled` (`aria-disabled`) không mở | — (nội dung tự hiện skeleton) | — | — | — (trang không mở popover rỗng) |

## 6. Keyboard & ARIA
APG: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (áp dụng cho dialog không modal: không `aria-modal`, trang không bị ẩn khỏi screen reader).

| Phím | Hành vi |
|------|---------|
| <kbd>Enter</kbd> / <kbd>Space</kbd> / click trên trigger | Mở; focus phần tử nhận focus đầu tiên (hoặc phần tử có `cdkFocusInitial`); không có thì focus panel. Với xác nhận phá huỷ, `cdkFocusInitial` đặt trên "Huỷ" để <kbd>Enter</kbd> / <kbd>Space</kbd> bấm tiếp ngay sau khi mở không xoá nhầm |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Đi vòng trong popover (từ cuối về đầu và ngược lại) |
| <kbd>Esc</kbd> | Đóng, focus về trigger |
| Bấm lại trigger | Đóng, focus ở trigger |
| Bấm ra ngoài | Đóng; nếu focus vẫn ở trong popover (bấm vào chỗ không focus được) thì focus về trigger, còn bấm vào một control khác thì focus ở control đó |
| Hành động bên trong gọi `close()` | Đóng, focus về trigger (hoặc nơi khác khi `restoreFocus: false`) |

**Vì sao Tab vòng trong popover (không để Tab đi ra ngoài):** panel nằm trong overlay container ở cuối `body`. Nếu Tab được đi tiếp, focus sẽ nhảy tới cuối trang chứ không về cạnh trigger, trong khi popover vẫn mở. Vòng trong panel (như Fiori) giữ một vòng lặp dễ đoán; Esc luôn là đường ra và trả về đúng trigger. Popover vẫn **không modal**: không backdrop, không `aria-modal`, chuột bấm được trang phía sau (và bấm như vậy là đóng popover).

- Trigger: `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` = id panel (chỉ khi mở).
- Panel: `role="dialog"`, `aria-labelledby` → `h2` tiêu đề hoặc `aria-label` = `label`; `tabindex="-1"` để nhận focus khi không có phần tử focus được.
- Escape đi qua bộ phân phối phím của CDK Overlay: popover mở trong drawer/dialog thì Esc chỉ đóng popover, không đóng drawer. Tooltip bên trong popover nhận Esc trước (WCAG 1.4.13).
- Không có thông báo LiveAnnouncer: focus đi vào panel nên screen reader đọc tên dialog.

## 7. Tokens
`packages/tokens/src/component/popover.tokens.json`:

| Token | Alias semantic | Ghi chú |
|-------|----------------|---------|
| `bg` | `color.bg.surface-raised` | Nền panel |
| `border` | `color.border.default` | Viền panel và vạch ngăn header/footer |
| `text` | `color.text.default` | Chữ thân |
| `title` | `color.text.strong` | Chữ tiêu đề |
| `radius` | `radius.overlay` | |
| `width` | `size.popover.md` | Bề rộng tối đa |

Dùng thẳng semantic: `elevation.overlay`, `border-width.default`, `space.inset.{sm,md}`, `space.gap.{xs,sm}`, `typography.{heading-sm,body-md}`, `motion.duration.fast`, `motion.ease.enter`, `focus.ring.*`, `layout.gutter-md`.

## 8. Density, responsive, i18n
- Padding và gap theo density; bề rộng tối đa không đổi.
- Màn hẹp: bề rộng không vượt màn hình trừ gutter; panel bị đẩy vào trong màn hình (`withPush`).
- Nội dung dài (tên "Phòng Quản trị Nguồn nhân lực & Phát triển Tổ chức") xuống dòng; không cắt chữ. Cao quá 70% màn hình thì thân cuộn, header/footer đứng yên.
- Vị trí `start`/`end` theo chiều đọc (CDK xử lý `dir`).
- Animation hiện dần `motion.duration.fast`; motion `reduced` đưa về 0.

## 9. Content guidelines
- Tiêu đề ngắn, danh từ hoặc câu hỏi: "Nguyễn Thị Ngọc Diệp", "Thông báo (3)", "Bỏ bản nháp này?".
- Không nhồi form dài; tối đa một hai control (ví dụ một ô ghi chú ngắn).
- Xác nhận nhanh: nút hành động lặp động từ ("Bỏ bản nháp"), không "OK". **Luôn có nút "Huỷ"** (ghost, đứng trước, `cdkFocusInitial` để nhận focus ban đầu) và nút phá huỷ (`danger`) đứng sau; bấm ra ngoài hay Esc cũng là huỷ, nhưng nút "Huỷ" rõ ràng cho người dùng bàn phím và cảm ứng. Xem `apps/docs/src/examples/popover/popover-confirm.example.ts`.

## 10. Acceptance (Definition of Done)
- [x] Unit test: aria trên trigger (`aria-haspopup`, `aria-expanded`, `aria-controls`), panel `role="dialog"` có tên từ tiêu đề / `label`, focus phần tử đầu / panel, Tab vòng, Esc trả focus, bấm lại trigger đóng, bấm ra ngoài đóng, `close()` từ bên trong, trigger `disabled` không mở (`src/popover.spec.ts`)
- [x] Example: thẻ nhanh nhân viên, xác nhận nhanh có footer (`apps/docs/src/examples/popover/`)
- [ ] axe: 0 vi phạm ở sáng/tối/gọn (cần `npm run build && npm run test:a11y`; phiên chính chạy)
- [x] `npm run ds:check` sạch (tokens + hardcoded) cho file của popover
- [x] Docs page đủ mục (`apps/docs/src/content/components/popover.md`)

## 11. Việc còn mở
- Điều hướng lồng trong popover (danh sách → chi tiết có nút quay lại) chưa có; Fiori có nhưng NXT chưa cần.
- Popover toàn màn hình trên điện thoại chưa làm (NXT ưu tiên desktop).
- `nxt-filter` vẫn có panel riêng; có thể chuyển sang dùng popover khi cần thống nhất code.
- E2E bàn phím (mở, Tab vòng, Esc trả focus) chưa có trong `apps/docs/e2e/a11y.spec.ts`.

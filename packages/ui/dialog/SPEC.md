---
component: dialog
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: dialog-modal, alertdialog
---

# Dialog: Spec

Entry `@nxt/ui/dialog` gồm:
- service `NxtDialog`: `open()` mở dialog tuỳ ý ở giữa màn hình; `confirm()` mở dialog xác nhận dựng sẵn. Cả hai dựa trên CDK Dialog.
- `nxt-dialog-layout`: khung tiêu đề, mô tả, nút đóng, thân cuộn, footer.

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** dừng lại một nhịp trước quyết định không lấy lại được hoặc dễ mất dữ liệu: rời trang khi còn thay đổi chưa lưu, xoá vĩnh viễn, áp dụng cho nhiều người. Người dùng đọc hậu quả và chọn rõ ràng.
- **Khi nào dùng:**
  - xác nhận hành động có hậu quả và **không hoàn tác được** ("Xoá vĩnh viễn 3 hồ sơ?");
  - cảnh báo rời trang khi còn thay đổi chưa lưu;
  - một form rất ngắn (1–3 trường) cần trả lời ngay, ví dụ nhập lý do từ chối.
- **Khi nào KHÔNG dùng:**
  - Hành động hoàn tác được (xoá có thùng rác, ngừng sử dụng): làm ngay, rồi hiện `nxt-alert` có nút "Hoàn tác" (principles §2.5). Hỏi xác nhận cho việc hoàn tác được chỉ làm chậm người dùng.
  - Form tạo / sửa bản ghi, xem chi tiết: dùng [Drawer](../drawer/SPEC.md) để giữ ngữ cảnh danh sách.
  - Thông báo kết quả ("Đã lưu"): dùng `nxt-alert` trong vùng `nxtLiveRegion`, không chặn màn hình.
  - Mở dialog chồng dialog, hoặc dialog từ trong drawer: cấm (principles §4).

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Backdrop `.nxt-dialog-backdrop` | ✓ | Nền `bg.overlay`; bấm vào thì đóng (trừ `disableClose`; dialog xác nhận không đóng bằng backdrop) |
| 2 | Pane `.nxt-dialog-pane--{size}` | ✓ | Overlay CDK ở giữa màn hình; rộng `min(100vw − 2 × lề, size)`; cao tối đa `100dvh − 2 × lề` |
| 3 | Container CDK `.cdk-dialog-container` | ✓ | `role="dialog"` hoặc `"alertdialog"`, `aria-modal="true"`, `aria-labelledby` → tiêu đề |
| 4 | Host `nxt-dialog-layout` | ✓ | Lưới 3 hàng: header / thân / footer |
| 5 | Header | ✓ | Tiêu đề `h2` (id = `<dialog id>-title`), mô tả (id = `<dialog id>-description`), nút "Đóng" (ẩn khi `closable` = false) |
| 6 | Thân `.nxt-dialog__body` | — | Nội dung chiếu vào, cuộn riêng; ẩn khi rỗng |
| 7 | Footer `[nxtDialogFooter]` | ✓ | Căn phải, primary ở cuối; phần tử `[nxtDialogStart]` dạt sang trái |

## 3. API (Angular)
Service: `NxtDialog` (`providedIn: 'root'`). Selector: `nxt-dialog-layout`. Directive: `[nxtDialogFooter]`, `[nxtDialogStart]` (chỉ là marker). Export type `NxtDialogConfig<D>`, `NxtConfirmConfig`, `NxtConfirmResult`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| method | `NxtDialog.open(content, config?)` | `(ComponentType<C> \| TemplateRef<C>, NxtDialogConfig<D>) => DialogRef<R, C>` | | Mở dialog. Nội dung phải dùng `nxt-dialog-layout` (tên dialog lấy từ tiêu đề của layout) |
| method | `NxtDialog.confirm(config)` | `(NxtConfirmConfig) => Observable<NxtConfirmResult>` | | Dialog xác nhận dựng sẵn; phát một lần rồi hoàn tất |
| `open` config | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 400 / 560 / 720px |
| `open` config | `data` | `D` | `undefined` | Lấy trong nội dung bằng `inject(DIALOG_DATA)` |
| `open` config | `disableClose` | `boolean` | `false` | Chặn đóng bằng Escape / backdrop / nút "Đóng" (ví dụ khi đang lưu) |
| `open` config | `role` | `'dialog' \| 'alertdialog'` | `'dialog'` | `alertdialog` khi nội dung là cảnh báo cần trả lời |
| `confirm` config | `title` | `string` | (bắt buộc) | Câu hỏi: "Xoá vĩnh viễn 3 hồ sơ?" |
| `confirm` config | `message` | `string` | (bắt buộc) | Hậu quả và cách tránh; là `aria-describedby` của dialog |
| `confirm` config | `confirmLabel` | `string` | (bắt buộc) | Động từ + đối tượng: "Xoá 3 hồ sơ", "Lưu nháp" |
| `confirm` config | `cancelLabel` | `string` | `'Huỷ'` | Lựa chọn an toàn: "Huỷ", "Ở lại" |
| `confirm` config | `alternateLabel` | `string` | `undefined` | Lựa chọn thứ ba, đặt bên trái: "Bỏ thay đổi" |
| `confirm` config | `tone` | `'default' \| 'danger'` | `'default'` | `danger`: nút xác nhận đỏ và focus ban đầu vào nút huỷ |
| result | `NxtConfirmResult` | `'confirm' \| 'alternate' \| 'cancel'` | | Escape và nút huỷ đều là `'cancel'` |
| `nxt-dialog-layout` input | `title` | `string` | (bắt buộc) | Tiêu đề hiển thị (`h2`), cũng là tên truy cập của dialog |
| `nxt-dialog-layout` input | `description` | `string` | `undefined` | Mô tả dưới tiêu đề |
| `nxt-dialog-layout` input | `closable` | `boolean` | `true` | Hiện nút "Đóng" ở header |
| `nxt-dialog-layout` content | (default) | bất kỳ | | Thân |
| `nxt-dialog-layout` content | `[nxtDialogFooter]` | nút | | Hành động; primary ở cuối |

Cấu hình CDK cố định:
- `open`: `autoFocus: 'first-tabbable'`, `restoreFocus: true`, `ariaModal: true`, vị trí giữa màn hình;
- `confirm`: `disableClose: true` cho backdrop, Escape vẫn trả `'cancel'` (xử lý trong component); `autoFocus` vào nút xác nhận (tone `default`) hoặc nút huỷ (tone `danger`).

Tên truy cập: service đặt `id` cho dialog và `aria-labelledby = <id>-title`. Layout gán đúng id đó cho `h2`, nên tên đọc lên luôn trùng tiêu đề nhìn thấy (sửa lỗi "hai chuỗi dễ lệch" của Drawer §11).

## 4. Variants & sizes
| Size | Bề rộng | Dùng khi |
|------|---------|----------|
| `sm` | 400px (`size.dialog.sm`) | Xác nhận (mặc định của `confirm`) |
| `md` | 560px (`size.dialog.md`) | Form ngắn 1–3 trường (mặc định của `open`) |
| `lg` | 720px (`size.dialog.lg`) | Nội dung có bảng nhỏ; cân nhắc Drawer trước |

| Tone (`confirm`) | Dùng khi | Không dùng khi |
|------------------|----------|----------------|
| `default` | Xác nhận thông thường, rời trang khi chưa lưu | Hành động phá huỷ |
| `danger` | Xoá vĩnh viễn, thu hồi quyền, huỷ đơn đã duyệt | Hành động hoàn tác được (dùng undo thay cho dialog) |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ mở | — (theo nút bên trong) | ✓ theo control bên trong; focus bị giữ trong dialog | — | — | ✓ `disableClose`: Escape / backdrop / nút "Đóng" không đóng | — (nơi dùng đặt `loading` cho nút + `disableClose`) | — (lỗi theo `nxt-form-field` trong thân) | — | ✓ thân rỗng thì ẩn (dialog chỉ có tiêu đề, mô tả, footer) |

## 6. Keyboard & ARIA
APG: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ và https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/

| Phím | Hành vi |
|------|---------|
| (khi mở) | `open`: focus phần tử nhận focus đầu tiên. `confirm`: focus nút xác nhận, hoặc nút huỷ khi `tone="danger"` (lựa chọn ít phá huỷ nhất) |
| Tab / Shift+Tab | Vòng trong dialog (focus trap của CDK) |
| Escape | Đóng (`open`, trừ `disableClose`); `confirm` trả `'cancel'` |
| Enter / Space | Kích hoạt nút đang focus (native `button`) |
| (khi đóng) | Focus về phần tử đã mở dialog (`restoreFocus`) |

- Container: `role="dialog"` (`open`) hoặc `role="alertdialog"` (`confirm`), `aria-modal="true"`, `aria-labelledby` → `h2`; `confirm` thêm `aria-describedby` → mô tả. CDK đặt `aria-hidden="true"` cho phần còn lại của trang khi dialog mở.
- Nút "Đóng": `nxtIconButton` `aria-label="Đóng"`. Dialog xác nhận không có nút "Đóng": người dùng phải chọn một trong các nút ở footer (hoặc Escape = huỷ).

## 7. Tokens
`packages/tokens/src/component/dialog.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `bg` | `color.bg.surface-raised` |
| `border` | `color.border.default` |
| `backdrop` | `color.bg.overlay` |
| `radius` | `radius.overlay` |
| `width-sm`, `width-md`, `width-lg` | `size.dialog.{sm,md,lg}` (semantic mới, cùng giá trị 400/560/720 với drawer nhưng tách vai trò) |

Dùng thẳng semantic: `color.text.{strong,subtle}`, `elevation.modal`, `border-width.default`, `space.inset.{md,lg}`, `space.gap.{sm,md}`, `layout.gutter`, `typography.{heading-md,body-md}`, `motion.duration.normal`, `motion.ease.enter`.

## 8. Density, responsive, i18n
- Padding và gap theo density; bề rộng không đổi theo density.
- Màn hẹp: dialog rộng bằng màn hình trừ lề hai bên; footer xuống dòng khi không đủ chỗ.
- Nội dung dài: thân cuộn, header và footer đứng yên; cao tối đa bằng màn hình trừ lề.
- Animation: hiện dần và phóng nhẹ (`motion.duration.normal`); motion `reduced` thì không chuyển động.

## 9. Content guidelines
- Tiêu đề là câu hỏi nói rõ hành động: "Xoá vĩnh viễn 3 hồ sơ?", "Rời trang khi chưa lưu?". Không dùng "Xác nhận" hay "Bạn có chắc không?".
- Mô tả nói hậu quả và cách tránh: "Các thay đổi trong “Nghỉ phép · toàn công ty” sẽ mất. Lưu nháp để giữ lại mà chưa áp dụng."
- Nút xác nhận lặp lại động từ của tiêu đề ("Xoá 3 hồ sơ"), không dùng "OK", "Có". Nút huỷ: "Huỷ" hoặc "Ở lại".

## 10. Acceptance (Definition of Done)
- [x] Unit test: dialog có tên từ tiêu đề, `aria-modal`; `confirm` là `alertdialog` có mô tả, focus đúng nút theo tone, trả đúng kết quả (xác nhận, lựa chọn thứ ba, Escape); nút "Đóng" tôn trọng `disableClose`
- [x] Playwright e2e: cảnh báo rời trang trong mẫu Quy trình duyệt (focus, Escape = ở lại, trả focus)
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- Drawer chưa dùng `confirm()` để cảnh báo khi đóng mà còn thay đổi chưa lưu (cần mở `closePredicate` trong `NxtDrawerConfig`).
- Nhãn "Đóng", "Huỷ" viết cứng tiếng Việt.

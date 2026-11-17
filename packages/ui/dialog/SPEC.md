---
component: dialog
status: beta
owner: "NXT core"
updated: 2026-11-06
apg-pattern: dialog-modal, alertdialog, disclosure (vùng "Xem chi tiết" của notify)
---

# Dialog: Spec

Entry `@nxt/ui/dialog` gồm:
- service `NxtDialog`: `open()` mở dialog tuỳ ý ở giữa màn hình; `confirm()` mở dialog xác nhận dựng sẵn; `notify()` mở hộp thông báo một nút "Đóng" (message box). Cả ba dựa trên CDK Dialog.
- `nxt-dialog-layout`: khung tiêu đề, mô tả, nút đóng, thân cuộn, footer.

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** dừng lại một nhịp trước quyết định không lấy lại được hoặc dễ mất dữ liệu: rời trang khi còn thay đổi chưa lưu, xoá vĩnh viễn, áp dụng cho nhiều người. Người dùng đọc hậu quả và chọn rõ ràng.
- **Khi nào dùng:**
  - xác nhận hành động có hậu quả và **không hoàn tác được** ("Xoá vĩnh viễn 3 hồ sơ?");
  - cảnh báo rời trang khi còn thay đổi chưa lưu;
  - một form rất ngắn (1–3 trường) cần trả lời ngay, ví dụ nhập lý do từ chối;
  - (`notify()`) thông báo **không gắn với trường nào** mà người dùng phải đọc/ghi nhận: lỗi hệ thống chặn luồng khi trang không còn chỗ đặt alert ("Không kết nối được máy chủ"), kết quả có mã cần chép lại ("Đã tạo quyết định số QĐ-2026/118").
- **Khi nào KHÔNG dùng:**
  - Hành động hoàn tác được (xoá có thùng rác, ngừng sử dụng): làm ngay, rồi hiện `nxt-alert` có nút "Hoàn tác" (principles §2.5). Hỏi xác nhận cho việc hoàn tác được chỉ làm chậm người dùng.
  - Form tạo / sửa bản ghi, xem chi tiết: dùng [Drawer](../drawer/SPEC.md) để giữ ngữ cảnh danh sách.
  - Thông báo kết quả ("Đã lưu"): dùng [Toast](../toast/SPEC.md), hoặc `nxt-alert` trong vùng `nxtLiveRegion` khi cần "Hoàn tác"; không chặn màn hình.
  - Lỗi trường form, lỗi khi lưu form dài: lỗi tại trường + danh sách thông báo của [Action bar](../action-bar/SPEC.md), không dùng `notify()`.
  - Mở dialog chồng dialog, hoặc dialog từ trong drawer: cấm (principles §4). **Ngoại lệ duy nhất:** `confirm()` "Rời khỏi biểu mẫu khi chưa lưu?" khi đóng drawer còn thay đổi chưa lưu (`canClose` của [Drawer](../drawer/SPEC.md)); đó là bước đóng của chính drawer, không phải việc mới.

### Chọn confirm hay hoàn tác (undo)
Theo SAP Fiori (Delete objects, Message box): Fiori luôn hỏi xác nhận khi xoá ở chế độ xem **vì máy chủ không hoàn tác được**. NXT ưu tiên hoàn tác, nhưng chỉ khi hoàn tác là thật:

| Tình huống | Làm gì |
|------------|--------|
| Backend giữ được bản ghi (xoá mềm, thùng rác, "Ngừng sử dụng" → "Dùng lại") | Làm ngay, báo bằng toast hoặc alert có "Hoàn tác". **Không** hỏi |
| Thao tác chưa ghi xuống máy chủ (xoá một dòng con trong form đang sửa, trước khi bấm Lưu) | Làm ngay, không hỏi, không cần hoàn tác (Huỷ form là đủ) |
| Xoá vĩnh viễn ở máy chủ, gửi thông báo/email, chốt công, chạy lương, thu hồi quyền | **Bắt buộc** `confirm({ tone: 'danger' })`, tiêu đề nêu rõ đối tượng và số lượng |
| Biết trước một phần không làm được (3 trong 20 đơn đã quá hạn) và thao tác không hoàn tác được | `confirm()` nói rõ phần bị loại: "Duyệt 17 đơn còn lại?" |
| Rời trang/đóng drawer khi còn thay đổi chưa lưu | `confirm()` "Rời khỏi biểu mẫu khi chưa lưu?" |

Hoàn tác giả (gọi API xoá cứng rồi "Hoàn tác" bằng cách tạo lại) bị cấm: mất lịch sử, mã, liên kết.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Backdrop `.nxt-dialog-backdrop` | ✓ | Nền `bg.overlay`; bấm vào thì đóng (trừ `disableClose`; `confirm` và `notify` không đóng bằng backdrop) |
| 2 | Pane `.nxt-dialog-pane--{size}` | ✓ | Overlay CDK ở giữa màn hình; rộng `min(100vw − 2 × lề, size)`; cao tối đa `100dvh − 2 × lề` |
| 3 | Container CDK `.cdk-dialog-container` | ✓ | `role="dialog"` hoặc `"alertdialog"`, `aria-modal="true"`, `aria-labelledby` → tiêu đề |
| 4 | Host `nxt-dialog-layout` | ✓ | Lưới 3 hàng: header / thân / footer |
| 5 | Header | ✓ | Icon theo `tone` (tuỳ chọn, trang trí), tiêu đề `h2` (id = `<dialog id>-title`), mô tả (id = `<dialog id>-description`), nút "Đóng" (ẩn khi `closable` = false) |
| 6 | Thân `.nxt-dialog__body` | — | Nội dung chiếu vào, cuộn riêng; ẩn khi rỗng |
| 7 | Footer `[nxtDialogFooter]` | ✓ | Căn phải, primary ở cuối; phần tử `[nxtDialogStart]` dạt sang trái |
| 8 | Vùng chi tiết (`notify`) | — | Nút disclosure "Xem chi tiết" + khối chữ chọn/sao chép được, mặc định thu gọn |

## 3. API (Angular)
Service: `NxtDialog` (`providedIn: 'root'`). Selector: `nxt-dialog-layout`. Directive: `[nxtDialogFooter]`, `[nxtDialogStart]` (chỉ là marker). Export type `NxtDialogConfig<D>`, `NxtConfirmConfig`, `NxtConfirmResult`, `NxtNotifyConfig`, `NxtDialogTone`.

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
| `confirm` config | `alternateTone` | `'default' | 'danger'` | `'default'` | `danger`: lựa chọn thứ ba là nút ghost chữ đỏ (`dialog.alternate-danger-text`), dùng cho hành động phá huỷ mà người dùng không chủ động chọn (theo Apple HIG). Không đổi nút nào được focus ban đầu |
| `confirm` config | `tone` | `'default' \| 'danger'` | `'default'` | `danger`: nút xác nhận đỏ và focus ban đầu vào nút huỷ |
| result | `NxtConfirmResult` | `'confirm' \| 'alternate' \| 'cancel'` | | Escape và nút huỷ đều là `'cancel'` |
| method | `NxtDialog.notify(config)` | `(NxtNotifyConfig) => Observable<void>` | | Hộp thông báo một nút "Đóng"; phát một lần khi đóng (nút Đóng hoặc Escape) rồi hoàn tất |
| `notify` config | `title` | `string` | (bắt buộc) | Chuyện gì xảy ra: "Không lưu được hồ sơ" |
| `notify` config | `message` | `string` | (bắt buộc) | Vì sao + làm gì tiếp; là `aria-describedby` |
| `notify` config | `tone` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | Icon và màu icon ở header |
| `notify` config | `details` | `string` | `undefined` | Chi tiết kỹ thuật/bổ sung, **khác** câu `message`; hiện trong vùng "Xem chi tiết" |
| `notify` config | `detailsLabel` | `string` | `'Xem chi tiết'` | Nhãn nút disclosure |
| `notify` config | `closeLabel` | `string` | `'Đóng'` | Nhãn nút duy nhất |
| `nxt-dialog-layout` input | `tone` | `NxtDialogTone \| undefined` | `undefined` | Icon trước tiêu đề (trang trí); `notify` dùng |
| `nxt-dialog-layout` input | `title` | `string` | (bắt buộc) | Tiêu đề hiển thị (`h2`), cũng là tên truy cập của dialog |
| `nxt-dialog-layout` input | `description` | `string` | `undefined` | Mô tả dưới tiêu đề |
| `nxt-dialog-layout` input | `closable` | `boolean` | `true` | Hiện nút "Đóng" ở header |
| `nxt-dialog-layout` content | (default) | bất kỳ | | Thân |
| `nxt-dialog-layout` content | `[nxtDialogFooter]` | nút | | Hành động; primary ở cuối |

Cấu hình CDK cố định:
- `open`: `autoFocus: 'first-tabbable'`, `restoreFocus: true`, `ariaModal: true`, vị trí giữa màn hình;
- `confirm`: `disableClose: true` cho backdrop, Escape vẫn trả `'cancel'` (xử lý trong component); `autoFocus` vào nút xác nhận (tone `default`) hoặc nút huỷ (tone `danger`).
- `notify`: size `sm`, `role="alertdialog"`, `aria-describedby` → `message`; `disableClose: true` cho backdrop, Escape đóng (xử lý trong component); `autoFocus` vào nút "Đóng".

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

| Tone (`notify`) | Icon | Dùng khi | Không dùng khi |
|-----------------|------|----------|----------------|
| `info` | `info-circle` | Thông tin người dùng phải ghi nhận trước khi đi tiếp | Thông tin phụ: đặt alert `info` trong trang |
| `success` | `circle-check` | Kết quả có mã/số cần chép lại | Xác nhận thường: dùng toast |
| `warning` | `alert-triangle` | Đã làm nhưng có hậu quả cần biết, không cần quyết định | Cần quyết định: dùng `confirm()` |
| `danger` | `alert-circle` | Lỗi hệ thống chặn luồng, không gắn trường, trang không còn chỗ đặt alert | Lỗi trường/lỗi khi lưu form: dùng form-field + action bar |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ mở | — (theo nút bên trong) | ✓ theo control bên trong; focus bị giữ trong dialog | — | — | ✓ `disableClose`: Escape / backdrop / nút "Đóng" không đóng | — (nơi dùng đặt `loading` cho nút + `disableClose`) | — (lỗi theo `nxt-form-field` trong thân) | — | ✓ thân rỗng thì ẩn (dialog chỉ có tiêu đề, mô tả, footer) |

## 6. Keyboard & ARIA
APG: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ và https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/

| Phím | Hành vi |
|------|---------|
| (khi mở) | `open`: focus phần tử nhận focus đầu tiên. `confirm`: focus nút xác nhận, hoặc nút huỷ khi `tone="danger"` (lựa chọn ít phá huỷ nhất). `notify`: focus nút "Đóng" |
| Tab / Shift+Tab | Vòng trong dialog (focus trap của CDK) |
| Escape | Đóng (`open`, trừ `disableClose`); `confirm` trả `'cancel'`; `notify` đóng |
| Enter / Space | Kích hoạt nút đang focus (native `button`); trên "Xem chi tiết" thì mở/thu vùng chi tiết |
| (khi đóng) | Focus về phần tử đã mở dialog (`restoreFocus`) |

- Container: `role="dialog"` (`open`) hoặc `role="alertdialog"` (`confirm`), `aria-modal="true"`, `aria-labelledby` → `h2`; `confirm` thêm `aria-describedby` → mô tả. CDK đặt `aria-hidden="true"` cho phần còn lại của trang khi dialog mở.
- Nút "Đóng": `nxtIconButton` `aria-label="Đóng"`. Dialog xác nhận không có nút "Đóng": người dùng phải chọn một trong các nút ở footer (hoặc Escape = huỷ).
- `notify`: `role="alertdialog"`, `aria-describedby` → câu `message`. Nút "Xem chi tiết" theo APG disclosure: `aria-expanded`, `aria-controls` → vùng chi tiết (`hidden` khi thu gọn). Icon tone `aria-hidden`; loại tin nói bằng tiêu đề, không chỉ bằng màu.

## 7. Tokens
`packages/tokens/src/component/dialog.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `bg` | `color.bg.surface-raised` |
| `border` | `color.border.default` (chỉ dùng cho hộp "Xem chi tiết"; khung ngoài không viền, tách bằng `elevation.modal`) |
| `backdrop` | `color.bg.overlay` |
| `radius` | `radius.overlay` |
| `width-sm`, `width-md`, `width-lg` | `size.dialog.{sm,md,lg}` (semantic mới, cùng giá trị 400/560/720 với drawer nhưng tách vai trò) |

| `icon-info`, `icon-success`, `icon-warning`, `icon-danger` | `color.icon.{info,success,warning,danger}` (icon tone ở header) |
| `details-bg` | `color.bg.subtle` (nền vùng chi tiết của `notify`) |

Dùng thẳng semantic: `color.text.{strong,subtle}`, `elevation.modal`, `border-width.default`, `space.inset.{sm,md,lg}`, `space.gap.{xs,sm,md}`, `layout.gutter`, `typography.{heading-md,body-md,body-sm}`, `size.icon.md`, `radius.control`, `motion.duration.normal`, `motion.ease.enter`.

## 8. Density, responsive, i18n
- Padding và gap theo density; bề rộng không đổi theo density.
- Màn hẹp: dialog rộng bằng màn hình trừ lề hai bên; footer xuống dòng khi không đủ chỗ.
- Nội dung dài: thân cuộn, header và footer đứng yên; cao tối đa bằng màn hình trừ lề.
- Animation: hiện dần và phóng nhẹ (`motion.duration.normal`); motion `reduced` thì không chuyển động.

## 9. Content guidelines
- Tiêu đề là câu hỏi nói rõ hành động: "Xoá vĩnh viễn 3 hồ sơ?", "Rời trang khi chưa lưu?". Không dùng "Xác nhận" hay "Bạn có chắc không?".
- Câu xác nhận xoá theo ngữ cảnh: một mục "Xoá chức danh KT-01 “Kế toán tổng hợp”?"; nhiều mục "Xoá 3 chức danh đã chọn?" (không liệt kê từng tên); nút "Xoá chức danh" / "Xoá 3 chức danh"; mô tả nói hậu quả ("Không khôi phục được.").
- `notify`: tiêu đề nói chuyện gì xảy ra ("Không lưu được hồ sơ"), `message` nói vì sao và làm gì tiếp ("Mất kết nối tới máy chủ. Kiểm tra mạng rồi bấm Lưu lại; dữ liệu đang nhập vẫn còn."), `details` chỉ chứa thông tin **khác** (mã lỗi, thời điểm, mã yêu cầu) và không lặp lại `message`. Không dùng tiêu đề chung "Lỗi", "Thông báo".
- Mô tả nói hậu quả và cách tránh: "Các thay đổi trong “Nghỉ phép · toàn công ty” sẽ mất. Lưu nháp để giữ lại mà chưa áp dụng."
- Nút xác nhận lặp lại động từ của tiêu đề ("Xoá 3 hồ sơ"), không dùng "OK", "Có". Nút huỷ: "Huỷ" hoặc "Ở lại".

### Chân dialog/drawer (luật chung)
Áp cho footer của dialog, drawer, popover và [Action bar](../action-bar/SPEC.md):
- Căn phải. Tối đa **1** nút `primary`, và nó đứng **cuối** (ngoài cùng bên phải). Footer thường 1–2 nút, tối đa 3.
- "Huỷ" là `ghost` (hoặc `secondary`), **không bao giờ** `primary` hay `danger`.
- Footer chỉ có một nút thoát ("Đóng"): nút đó là `secondary`, không phải primary (`notify`).
- Lựa chọn thứ ba khác loại ("Bỏ thay đổi", "Đặt lại") dạt sang trái (`[nxtDialogStart]`).
- Hành động phá huỷ thay chỗ primary bằng `danger` (vẫn đứng cuối); không có cả primary lẫn danger cùng lúc.
- Đây là quy ước NXT, **khác Fiori có chủ đích** (Fiori đặt nút nhấn mạnh đầu nhóm): xem pattern "Vị trí hành động".

## 10. Acceptance (Definition of Done)
- [x] Unit test: dialog có tên từ tiêu đề, `aria-modal`; `confirm` là `alertdialog` có mô tả, focus đúng nút theo tone, trả đúng kết quả (xác nhận, lựa chọn thứ ba, Escape); nút "Đóng" tôn trọng `disableClose`
- [x] Playwright e2e: cảnh báo rời trang trong mẫu Quy trình duyệt (focus, Escape = ở lại, trả focus)
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)
- [x] Unit test `notify()`: alertdialog có tên và mô tả, focus nút "Đóng", nút là `secondary`, icon theo tone, disclosure "Xem chi tiết" (`aria-expanded`, `aria-controls`, `hidden`), Escape và nút Đóng đều đóng (`src/dialog.spec.ts`, 2026-11-06)
- [x] Example `dialog-notify` (lỗi kỹ thuật có chi tiết, kết quả có mã)
- [ ] axe cho `dialog-notify`: cần `npm run build && npm run test:a11y` (phiên chính chạy)

## 11. Việc còn mở
- Drawer đã có `canClose` (2026-11-06) dùng `confirm()` khi đóng còn thay đổi chưa lưu.
- Nhãn nút "Đóng" ở header của `nxt-dialog-layout` viết cứng tiếng Việt; "Huỷ"/"Đóng"/"Xem chi tiết" của `confirm`/`notify` override được qua config.
- `notify`: chưa có nút "Sao chép" cho vùng chi tiết (người dùng tự chọn chữ và chép).

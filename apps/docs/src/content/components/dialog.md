---
title: Dialog
description: Hộp thoại giữa màn hình để xác nhận việc không hoàn tác được, cảnh báo rời trang khi chưa lưu, hỏi một câu ngắn, hoặc báo một tin người dùng phải đọc (lỗi hệ thống, số quyết định).
status: beta
group: Phản hồi & lớp phủ
order: 43
package: "@nxt/ui/dialog"
keywords:
  - hop thoai
  - xac nhan
  - confirm
  - modal
  - dialog
  - canh bao roi trang
  - xoa vinh vien
  - hop thong bao
  - message box
  - notify
  - loi he thong
---

# Dialog

## Khi nào dùng

- Xác nhận hành động **không hoàn tác được**: xoá vĩnh viễn, thu hồi quyền, huỷ đơn đã duyệt.
- Cảnh báo rời trang khi còn thay đổi chưa lưu.
- Một câu hỏi ngắn cần trả lời ngay, 1–3 trường: lý do từ chối, ghi chú khi trả lại.
- Một tin **không gắn với trường nào** mà người dùng phải đọc rồi mới đi tiếp (`notify()`): lỗi hệ thống chặn luồng khi trang không còn chỗ đặt alert, hoặc kết quả có số cần ghi lại ("Đã ban hành quyết định QĐ-2026/118").

## Khi nào không dùng

- **Hành động hoàn tác được** (xoá có thể khôi phục, ngừng sử dụng): làm ngay, rồi hiện [Alert](/components/alert) có nút "Hoàn tác". Hỏi "Bạn có chắc không?" cho việc hoàn tác được chỉ làm người dùng chậm lại và quen tay bấm "Đồng ý".
- **Form tạo / sửa bản ghi, xem chi tiết**: dùng [Drawer](/components/drawer), giữ được ngữ cảnh danh sách phía sau.
- **Báo kết quả** ("Đã lưu"): dùng [Toast](/components/toast), hoặc [Alert](/components/alert) khi cần "Hoàn tác"; không chặn màn hình.
- **Lỗi trường, lỗi khi lưu form dài**: lỗi tại trường + danh sách thông báo của [Action bar](/components/action-bar), không dùng `notify()`.
- **Dialog trong dialog, dialog mở từ drawer**: không dùng. Chia bước ngay trong dialog hoặc drawer đang mở. Ngoại lệ duy nhất: hỏi "Rời khỏi biểu mẫu khi chưa lưu?" khi đóng drawer (xem [Drawer › Chặn đóng khi chưa lưu](/components/drawer#chan-dong-khi-chua-luu)).

## Xác nhận hay hoàn tác

NXT ưu tiên hoàn tác hơn hỏi xác nhận, nhưng chỉ khi hoàn tác là **thật**. SAP Fiori luôn hỏi khi xoá ở chế độ xem vì máy chủ không hoàn tác được; NXT giữ cùng lý do đó:

| Tình huống | Làm gì |
|------------|--------|
| Backend giữ được bản ghi (xoá mềm, thùng rác, "Ngừng sử dụng" → "Dùng lại") | Làm ngay, báo bằng [Toast](/components/toast) hoặc [Alert](/components/alert) có "Hoàn tác". Không hỏi |
| Chưa ghi xuống máy chủ (xoá một dòng con trong form đang sửa, trước khi bấm Lưu) | Làm ngay, không hỏi; "Huỷ" form là đủ để quay lại |
| Xoá vĩnh viễn, gửi thông báo/email, chốt công, chạy lương, thu hồi quyền | **Bắt buộc** `confirm({ tone: 'danger' })`, tiêu đề nêu đối tượng và số lượng |
| Biết trước một phần không làm được (3 trong 20 đơn đã quá hạn), thao tác không hoàn tác được | `confirm()` nói rõ phần còn lại: "Duyệt 17 đơn còn lại?" |
| Rời trang / đóng drawer khi còn thay đổi chưa lưu | `confirm()` "Rời khỏi biểu mẫu khi chưa lưu?" |

Không làm "hoàn tác giả" (gọi API xoá cứng rồi tạo lại khi bấm Hoàn tác): mất mã, lịch sử và liên kết.

## Xác nhận

`NxtDialog.confirm()` mở hộp thoại dựng sẵn và trả về `Observable` phát **một** câu trả lời: `'confirm'`, `'alternate'` hoặc `'cancel'` (nút huỷ và <kbd>Esc</kbd>).

```ts
this.dialog
  .confirm({
    title: 'Xoá vĩnh viễn 3 hồ sơ?',
    message: 'Hồ sơ và lịch sử công tác sẽ bị xoá. Không khôi phục được.',
    confirmLabel: 'Xoá 3 hồ sơ',
    tone: 'danger',
  })
  .subscribe((answer) => { if (answer === 'confirm') this.purge(); });
```

- `tone="danger"`: nút xác nhận màu đỏ và **focus ban đầu ở nút huỷ**, để Enter vô tình không xoá dữ liệu.
- `alternateLabel` thêm lựa chọn thứ ba, đặt tách về bên trái: "Bỏ thay đổi" trong cảnh báo rời trang.
- `alternateTone: 'danger'` vẽ lựa chọn thứ ba thành nút ghost chữ đỏ, để người dùng nhận ra đây là hành động phá huỷ họ không chủ động chọn (theo Apple HIG).
- Bấm ra ngoài không đóng hộp thoại xác nhận: người dùng phải chọn.

::example{dialog-confirm}

## Dialog tuỳ ý

`NxtDialog.open(component, config)` mở component của bạn và trả về `DialogRef` của CDK. Đặt `<nxt-dialog-layout>` làm gốc nội dung: tiêu đề của layout **chính là** tên đọc lên của dialog (`aria-labelledby`), nên không phải khai báo tên hai lần như Drawer.

::example{dialog-form}

- Ô đầu tiên có `cdkFocusInitial` để gõ được ngay; không có thì focus vào nút "Đóng".
- Kiểm tra khi bấm nút chính; còn lỗi thì giữ dialog mở và đưa focus tới ô lỗi (`afterNextRender`, vì ứng dụng chạy zoneless).
- Đang lưu: đặt `ref.disableClose = true` và `loading` cho nút, để <kbd>Esc</kbd>, backdrop và nút "Đóng" không cắt ngang.

## Hộp thông báo

`NxtDialog.notify()` mở hộp thông báo **một nút "Đóng"** (message box) và trả về `Observable<void>` phát một lần khi đóng. `tone` chọn icon trước tiêu đề: `info` (mặc định), `success`, `warning`, `danger`. `details` thêm vùng **"Xem chi tiết"** thu gọn sẵn, chữ chọn và sao chép được, cho thông tin **khác** câu chính (mã lỗi, thời điểm, mã yêu cầu).

::example{dialog-notify}

```ts
this.dialog
  .notify({
    tone: 'danger',
    title: 'Không lưu được hồ sơ',
    message: 'Mất kết nối tới máy chủ. Kiểm tra mạng rồi bấm Lưu lại; dữ liệu đang nhập vẫn còn trên màn hình.',
    details: 'Mã lỗi: HR-503\nThời điểm: 06/11/2026 09:42\nMã yêu cầu: 7f3c-21a9-4b0e',
  })
  .subscribe();
```

| `tone` | Dùng khi | Không dùng khi |
|--------|----------|----------------|
| `info` | Thông tin phải ghi nhận trước khi đi tiếp | Thông tin phụ: Alert `info` trong trang |
| `success` | Kết quả có số cần ghi lại | Xác nhận thường: Toast |
| `warning` | Đã làm nhưng có hậu quả cần biết, không cần quyết định | Cần quyết định: `confirm()` |
| `danger` | Lỗi hệ thống chặn luồng, không gắn trường | Lỗi trường: Form field + Action bar |

- Nút duy nhất là "Đóng" (`closeLabel` để đổi), kiểu `secondary`, có focus khi mở. <kbd>Esc</kbd> cũng đóng; bấm ra ngoài thì không.
- Tiêu đề nói chuyện gì xảy ra, `message` nói vì sao và làm gì tiếp. Không dùng tiêu đề chung "Lỗi", "Thông báo".

## Chân dialog và drawer

Một luật cho footer của dialog, drawer, popover và [Action bar](/components/action-bar):

- Căn phải. Tối đa **một** nút `primary`, đứng **cuối** (ngoài cùng bên phải). Thường 1–2 nút, tối đa 3.
- "Huỷ" là `ghost` (hoặc `secondary`), **không bao giờ** `primary` hay `danger`.
- Chỉ có một nút để thoát ("Đóng"): nút đó là `secondary`.
- Lựa chọn thứ ba khác loại ("Bỏ thay đổi", "Đặt lại") dạt sang trái.
- Hành động phá huỷ thay chỗ primary bằng `danger`, vẫn đứng cuối.

Thứ tự này là quy ước NXT và **khác SAP Fiori có chủ đích** (Fiori đặt nút nhấn mạnh đầu nhóm); xem [Vị trí hành động](/patterns/action-placement).

## Kích thước

| `size` | Bề rộng | Dùng cho |
|--------|---------|----------|
| `sm` | 400px | Xác nhận (mặc định của `confirm`) |
| `md` (mặc định của `open`) | 560px | Form 1–3 trường |
| `lg` | 720px | Nội dung có bảng nhỏ; cân nhắc Drawer trước |

Màn hẹp: dialog rộng bằng màn hình trừ lề. Nội dung dài thì phần thân cuộn, tiêu đề và nút đứng yên.

## Accessibility

| Phím | Hành vi |
|------|---------|
| (khi mở) | Focus nút xác nhận; `tone="danger"` thì nút huỷ. `notify()`: nút "Đóng". Dialog tuỳ ý: phần tử đầu tiên, hoặc `cdkFocusInitial` |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Vòng trong dialog, không ra trang phía sau |
| <kbd>Esc</kbd> | Đóng; hộp thoại xác nhận trả `'cancel'` |
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên "Xem chi tiết" | Mở / thu gọn vùng chi tiết (`aria-expanded`) |
| (khi đóng) | Focus về đúng nút đã mở dialog |

- `confirm()` và `notify()` là `role="alertdialog"`, có `aria-describedby` trỏ tới câu chính; `open()` là `role="dialog"`. Cả ba `aria-modal="true"`, trang phía sau bị ẩn khỏi screen reader khi dialog mở.
- Icon theo tone chỉ để trang trí; loại tin nói bằng tiêu đề. Vùng chi tiết dài cuộn được và nhận focus để cuộn bằng bàn phím.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Xoá vĩnh viễn 3 hồ sơ? | Xác nhận |
| Rời trang khi chưa lưu? | Bạn có chắc chắn không? |
| Hồ sơ và lịch sử công tác sẽ bị xoá. Không khôi phục được. | Hành động này không thể hoàn tác. |
| Xoá 3 hồ sơ · Huỷ | OK · Cancel |
| Xoá chức danh KT-01 “Kế toán tổng hợp”? (một mục) | Xoá mục đã chọn? |
| Xoá 3 chức danh đã chọn? (nhiều mục, không liệt kê tên) | Xoá Kế toán tổng hợp, Trưởng nhóm kinh doanh, Chuyên viên tuyển dụng? |
| `notify`: Không lưu được hồ sơ | Lỗi |

## API

::api{dialog}

## Token

::tokens{component.dialog}

## Changelog

- **Chưa phát hành**: thêm `NxtDialog.notify()` (hộp thông báo một nút, tone, "Xem chi tiết"), input `tone` của `nxt-dialog-layout`; luật chọn xác nhận hay hoàn tác và luật chân dialog/drawer.
- **0.1.0**: phát hành beta: `NxtDialog.open()`, `NxtDialog.confirm()` (2–3 lựa chọn, tone `danger`), `nxt-dialog-layout`.

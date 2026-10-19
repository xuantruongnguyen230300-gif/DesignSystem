---
title: Dialog
description: Hộp thoại giữa màn hình để xác nhận việc không hoàn tác được, cảnh báo rời trang khi chưa lưu, hoặc hỏi một câu ngắn trước khi đi tiếp.
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
---

# Dialog

## Khi nào dùng

- Xác nhận hành động **không hoàn tác được**: xoá vĩnh viễn, thu hồi quyền, huỷ đơn đã duyệt.
- Cảnh báo rời trang khi còn thay đổi chưa lưu.
- Một câu hỏi ngắn cần trả lời ngay, 1–3 trường: lý do từ chối, ghi chú khi trả lại.

## Khi nào không dùng

- **Hành động hoàn tác được** (xoá có thể khôi phục, ngừng sử dụng): làm ngay, rồi hiện [Alert](/components/alert) có nút "Hoàn tác". Hỏi "Bạn có chắc không?" cho việc hoàn tác được chỉ làm người dùng chậm lại và quen tay bấm "Đồng ý".
- **Form tạo / sửa bản ghi, xem chi tiết**: dùng [Drawer](/components/drawer), giữ được ngữ cảnh danh sách phía sau.
- **Báo kết quả** ("Đã lưu"): dùng [Alert](/components/alert), không chặn màn hình.
- **Dialog trong dialog, dialog mở từ drawer**: không dùng. Chia bước ngay trong dialog hoặc drawer đang mở.

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
- Bấm ra ngoài không đóng hộp thoại xác nhận: người dùng phải chọn.

::example{dialog-confirm}

## Dialog tuỳ ý

`NxtDialog.open(component, config)` mở component của bạn và trả về `DialogRef` của CDK. Đặt `<nxt-dialog-layout>` làm gốc nội dung: tiêu đề của layout **chính là** tên đọc lên của dialog (`aria-labelledby`), nên không phải khai báo tên hai lần như Drawer.

::example{dialog-form}

- Ô đầu tiên có `cdkFocusInitial` để gõ được ngay; không có thì focus vào nút "Đóng".
- Kiểm tra khi bấm nút chính; còn lỗi thì giữ dialog mở và đưa focus tới ô lỗi (`afterNextRender`, vì ứng dụng chạy zoneless).
- Đang lưu: đặt `ref.disableClose = true` và `loading` cho nút, để <kbd>Esc</kbd>, backdrop và nút "Đóng" không cắt ngang.

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
| (khi mở) | Focus nút xác nhận; `tone="danger"` thì nút huỷ. Dialog tuỳ ý: phần tử đầu tiên, hoặc `cdkFocusInitial` |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Vòng trong dialog, không ra trang phía sau |
| <kbd>Esc</kbd> | Đóng; hộp thoại xác nhận trả `'cancel'` |
| (khi đóng) | Focus về đúng nút đã mở dialog |

- `confirm()` là `role="alertdialog"`, có `aria-describedby` trỏ tới câu hậu quả; `open()` là `role="dialog"`. Cả hai `aria-modal="true"`, trang phía sau bị ẩn khỏi screen reader khi dialog mở.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Xoá vĩnh viễn 3 hồ sơ? | Xác nhận |
| Rời trang khi chưa lưu? | Bạn có chắc chắn không? |
| Hồ sơ và lịch sử công tác sẽ bị xoá. Không khôi phục được. | Hành động này không thể hoàn tác. |
| Xoá 3 hồ sơ · Huỷ | OK · Cancel |

## API

::api{dialog}

## Token

::tokens{component.dialog}

## Changelog

- **0.1.0**: phát hành beta: `NxtDialog.open()`, `NxtDialog.confirm()` (2–3 lựa chọn, tone `danger`), `nxt-dialog-layout`.

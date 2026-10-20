---
title: Alert
description: Thông báo trong trang về kết quả của thao tác vừa làm, kèm nút làm tiếp như "Hoàn tác", "Thử lại"; lỗi cấp trang; lưu ý thường trực.
status: beta
group: Phản hồi & lớp phủ
order: 44
package: "@nxt/ui/alert"
keywords:
  - thong bao
  - canh bao
  - alert
  - hoan tac
  - undo
  - notice
  - live region
---

# Alert

## Khi nào dùng

- Kết quả của thao tác vừa làm trên trang: đã lưu, đã xoá, đã nhập, đã áp dụng. Nhất là khi **hoàn tác được**: "Đã xoá 3 chức danh." kèm nút **Hoàn tác**.
- Lỗi cấp trang không gắn với một ô nhập: "Không tải được danh sách", kèm **Thử lại**.
- Lưu ý thường trực về bản ghi đang xem: "Đang sửa bản nháp; phiên bản 3 vẫn đang áp dụng".

## Khi nào không dùng

- **Lỗi của một ô nhập**: dùng `error` của [Form field](/components/form-field), đặt ngay dưới ô.
- **Cần trả lời trước khi đi tiếp**: dùng [Dialog](/components/dialog) `confirm()`.
- **Trạng thái của một bản ghi trong danh sách**: dùng [Tag](/components/tag).

## Tone

| Tone | Dùng khi |
|------|----------|
| `info` | Lưu ý trung tính, đã chuyển, đã sắp xếp lại |
| `success` | Thao tác xong |
| `warning` | Thành công một phần, có hậu quả cần biết |
| `danger` | Không làm được, cần sửa hoặc thử lại |

::example{alert-tones}

Nút hành động đặt trong slot `[nxtAlertActions]`, nằm cuối dòng khi đủ chỗ và xuống dòng khi hẹp. `dismissible` thêm nút "Đóng thông báo"; trang tự gỡ alert khi nhận `dismissed`.

## Thông báo sau thao tác

Alert **không tự có role**. Screen reader chỉ đọc ổn định những thay đổi xảy ra *bên trong* một vùng live đã có sẵn trên trang. Vì vậy đặt `[nxtLiveRegion]` cố định trong template rồi chèn alert vào đó:

```html
<div nxtLiveRegion>
  @if (notice(); as n) {
    <nxt-alert [tone]="n.tone">
      {{ n.text }}
      <button nxtAlertActions nxtButton size="sm" variant="ghost" (click)="undo()">Hoàn tác</button>
    </nxt-alert>
  }
</div>
```

- `nxtLiveRegion` mặc định là `role="status"` (đọc khi người dùng rảnh). `nxtLiveRegion="assertive"` là `role="alert"`, chỉ dùng cho lỗi cần chú ý ngay.
- Khi rỗng, vùng không chiếm chỗ và không tạo khoảng `gap`, nhưng vẫn nằm trong cây accessibility (không dùng `display: none`).
- Alert không lấy focus, để không cắt ngang người đang thao tác.

::example{alert-live}

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> | Đi qua các nút hành động, rồi nút đóng; bản thân alert không nhận focus |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Kích hoạt nút |

- Icon chỉ để trang trí. Câu chữ phải tự nói được tone: "Chưa áp dụng được: …", "Đã xoá …".
- Nền tone đạt tương phản 4.5:1 với chữ ở cả sáng và tối.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Đã xoá 3 chức danh. | Thao tác thành công! |
| Chưa áp dụng được: bước 3 cần chọn người duyệt. | Lỗi dữ liệu. |
| Hoàn tác | Nhấn vào đây để hoàn tác |

## API

::api{alert}

## Token

::tokens{component.alert}

## Changelog

- **0.1.0**: phát hành beta: `nxt-alert` (4 tone, tiêu đề, `[nxtAlertActions]`, `dismissible`), `[nxtLiveRegion]`.

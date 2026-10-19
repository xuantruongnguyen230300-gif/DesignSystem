---
title: Segmented
description: Chọn một trong 2–5 lựa chọn luôn hiển thị — kỳ báo cáo, kiểu hiển thị, loại đơn — có hiệu lực ngay.
status: beta
group: Hành động
order: 3
package: "@nxt/ui/segmented"
keywords:
  - segmented
  - segmented control
  - nhom lua chon
  - chon mot
  - chuyen che do xem
  - ky bao cao
  - loc nhanh
---

# Segmented

## Khi nào dùng

- Chọn **một** trong 2–5 lựa chọn ngắn, và người dùng cần thấy hết các lựa chọn cùng lúc: kỳ báo cáo (Tuần / Tháng / Quý), kiểu hiển thị (Danh sách / Thẻ), loại đơn.
- Thay đổi có hiệu lực ngay trên nội dung đang xem, không cần nút "Áp dụng".

## Khi nào không dùng

- **Hơn 5 lựa chọn, hoặc nhãn dài**: dùng select.
- **Bật/tắt một thứ**: dùng switch hoặc [Checkbox](/components/checkbox).
- **Chuyển giữa các phần nội dung khác nhau** (Thông tin chung, Hợp đồng, Tài liệu): dùng [Tabs](/components/tabs).
- **Trường trong form gửi đi**: dùng radio group có nhãn hiển thị. Segmented chưa có trạng thái lỗi và trạng thái khoá.
- **Kích hoạt hành động**: dùng [Button](/components/button). Segmented chỉ đổi một giá trị.

## Lựa chọn

Luôn đặt giá trị mặc định cho `value`, để nhóm luôn có đúng một lựa chọn đang chọn. Lựa chọn đang chọn nổi lên khỏi rãnh (nền sáng hơn, có bóng), không chỉ đổi màu chữ.

::example{segmented-basic}

`value` là two-way (`[(value)]`). Kiểu của giá trị lấy từ `options`, nên `NxtSegmentedOption<'week' | 'month'>` cho ra `value` đúng kiểu đó.

## Kích thước và icon

| `size` | Dùng ở |
|--------|--------|
| `md` (mặc định) | Đầu vùng nội dung, cạnh tiêu đề card |
| `sm` | Toolbar của bảng, page header, thanh trên cùng |

Chiều cao lấy theo mật độ hiện hành, giống [Button](/components/button) cùng cỡ, nên segmented đứng thẳng hàng với nút bên cạnh.

Mỗi lựa chọn có thể kèm `icon`. Với `iconOnly`, nhãn bị ẩn về mặt hình ảnh nhưng screen reader vẫn đọc, và hiện thành tooltip khi hover hoặc focus. Chỉ dùng `iconOnly` khi icon ai cũng hiểu (sáng/tối, danh sách/lưới) và chỗ thật sự chật.

::example{segmented-sizes}

## Lọc nhanh một danh sách

Segmented hợp với bộ lọc **một chiều** đặt ngay trên danh sách. Component không tự thông báo kết quả: đặt số kết quả trong một phần tử `role="status"` để người dùng screen reader biết danh sách đã đổi.

::example{segmented-filter}

## Segmented hay Tabs

| | Segmented | Tabs |
|---|-----------|------|
| Đổi gì | Một giá trị của **cùng** nội dung (kỳ, kiểu xem, bộ lọc phụ) | **Phần** nội dung khác nhau, hoặc bộ lọc chính của trang |
| Vị trí | Trong toolbar, card, page header | Ngay dưới page header, phía trên nội dung |
| Số lượng | 2–5, nhãn rất ngắn | 2–7, có thể kèm số đếm |
| Ngữ nghĩa | Nhóm radio (`fieldset` + `radio`) | `tablist` + `tab` (+ `tabpanel`) |

## Accessibility

Segmented dùng `<input type="radio">` native trong `<fieldset>`. `label` trở thành `<legend>` (ẩn về mặt hình ảnh), nên phím mũi tên, ngữ nghĩa và cách screen reader đọc đều do trình duyệt lo.

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Vào nhóm tại lựa chọn đang chọn, hoặc ra khỏi nhóm. Cả nhóm chỉ là một điểm dừng Tab |
| <kbd>→</kbd> / <kbd>↓</kbd> | Chọn lựa chọn kế tiếp, vòng lại ở cuối |
| <kbd>←</kbd> / <kbd>↑</kbd> | Chọn lựa chọn trước đó |
| <kbd>Space</kbd> | Chọn lựa chọn đang focus (khi chưa chọn) |

- `label` là bắt buộc. Screen reader đọc tên nhóm, nhãn của lựa chọn, trạng thái đã chọn và vị trí ("2 trên 4").
- Mỗi segmented có `name` riêng, nên nhiều nhóm trên cùng trang không ảnh hưởng nhau.
- Vòng focus nằm trên lựa chọn đang focus, dùng `focus.ring.*`. Ở chế độ tương phản cao (forced colors), lựa chọn đang chọn có viền `Highlight`.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Tuần · Tháng · Quý | Theo tuần · Theo tháng · Theo quý |
| Danh sách · Thẻ | Xem dạng danh sách · Xem dạng thẻ |
| Tất cả · Nghỉ phép · Tăng ca | Tất cả các loại đơn · Đơn nghỉ phép · Đơn tăng ca |

- Nhãn 1–2 từ, cùng loại từ. Phần chung ("Theo…", "Đơn…") đưa vào `label` của nhóm.
- Thứ tự theo logic (thời gian tăng dần, "Tất cả" đứng đầu), không theo bảng chữ cái.

## API

::api{segmented}

`NxtSegmentedOption<T>` (kiểu của mỗi phần tử trong `options`):

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `value` | `T` | Giá trị gán vào `value` khi chọn |
| `label` | `string` | Nhãn hiển thị (hoặc tooltip khi `iconOnly`) |
| `icon` | `NxtIconName` (tuỳ chọn) | Icon đặt trước nhãn |

## Token

::tokens{component.segmented}

## Changelog

- **0.1.0**: phát hành beta: radio native trong `fieldset`, 2 size, icon, chế độ `iconOnly` với tooltip, `value` two-way có kiểu.

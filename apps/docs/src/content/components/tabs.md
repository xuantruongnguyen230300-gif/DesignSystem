---
title: Tabs
description: Chia nội dung của một trang thành các phần ngang hàng, hoặc làm bộ lọc chính phía trên danh sách.
status: beta
group: Điều hướng
order: 22
package: "@nxt/ui/tabs"
keywords:
  - tabs
  - tab
  - the
  - chuyen tab
  - phan noi dung
  - loc theo trang thai
  - tablist
---

# Tabs

## Khi nào dùng

- Một đối tượng có nhiều phần ngang hàng, người dùng xem từng phần một: hồ sơ nhân viên có "Thông tin chung", "Hợp đồng", "Quá trình công tác".
- Bộ lọc chính của một trang danh sách, kèm số lượng: "Chờ duyệt (3)", "Đã duyệt", "Tất cả".

## Khi nào không dùng

- **Các bước phải làm theo thứ tự**: dùng form nhiều bước (stepper).
- **Đổi một giá trị nhỏ của cùng nội dung** (kỳ báo cáo, kiểu xem): dùng [Segmented](/components/segmented).
- **Nội dung người dùng cần so sánh cùng lúc**: đặt cạnh nhau, đừng chia tab.
- **Điều hướng giữa các phân hệ**: dùng [Sidenav](/components/app-shell).

## Tab có panel

Mặc định, `nxt-tabs` hiện nội dung của tab đang chọn trong một `tabpanel`. Nội dung của mỗi tab đặt ngay trong `<nxt-tab>`.

::example{tabs-basic}

- `value` là two-way. Không truyền thì tab đầu tiên được chọn.
- Angular khởi tạo nội dung của **mọi** tab ngay từ đầu; chỉ tab đang chọn được gắn vào trang. Vì vậy dữ liệu đang nhập trong một tab không mất khi chuyển tab. Nội dung nặng, hoặc cần gọi API, thì bọc trong `@if (tab() === 'contracts')` để chỉ tạo khi cần.
- `value` là chuỗi tự do ("Nghỉ phép" cũng được). Id của tab và panel sinh theo vị trí, không theo `value`.

## Tab lọc danh sách

Đặt `[panels]="false"` khi tab chỉ để chọn một giá trị, còn trang tự vẽ nội dung phía dưới. Cách này hợp với bộ lọc trạng thái phía trên bảng, như template [Phê duyệt](/templates/approval).

::example{tabs-filter}

- Số đếm (`count`) giúp người dùng biết tab nào còn việc mà không cần mở. Tab "Tất cả" thường không cần số.
- Khi danh sách đổi, thông báo kết quả bằng một phần tử `role="status"`.

## Icon, số đếm và tab bị khoá

::example{tabs-states}

- Icon là tuỳ chọn. Nếu dùng thì dùng cho mọi tab trong nhóm.
- Tab bị khoá (`disabled`) không focus được và bị phím mũi tên bỏ qua. Ghi lý do ngay cạnh danh sách tab, vì người dùng bàn phím không tới được tab đó.
- Khi không đủ chỗ, danh sách tab cuộn ngang. Tab đang focus luôn được cuộn vào tầm nhìn.

## Accessibility

Theo mẫu [Tabs của WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), kích hoạt tự động: phím mũi tên vừa chuyển focus vừa chọn tab.

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> | Vào danh sách tab tại tab đang chọn. Nhấn tiếp thì vào panel |
| <kbd>→</kbd> / <kbd>←</kbd> | Chọn tab sau / trước, vòng lại ở hai đầu, bỏ qua tab bị khoá |
| <kbd>Home</kbd> / <kbd>End</kbd> | Chọn tab đầu / tab cuối |
| <kbd>Shift</kbd>+<kbd>Tab</kbd> | Ra khỏi danh sách tab |

- `label` là bắt buộc: tên của `tablist`, ví dụ "Hồ sơ Nguyễn Văn An".
- Cả danh sách tab chỉ là **một** điểm dừng Tab (roving tabindex). Tab đang chọn có `aria-selected="true"`.
- Panel có `role="tabpanel"`, `aria-labelledby` trỏ về tab đang chọn, và `tabindex="0"` để vào được bằng Tab kể cả khi nội dung không có gì focus được.
- Tab đang chọn có vạch dưới **và** chữ đậm màu hơn, không chỉ khác màu.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Hợp đồng | Thông tin hợp đồng lao động |
| Chờ duyệt (3) | Các đơn đang chờ duyệt |
| Quá trình công tác | Tab 3 |

- Nhãn là danh từ, 1–3 từ, không lặp lại tên đối tượng (đã có trong tiêu đề trang).
- Không quá khoảng 7 tab. Tab đầu tiên là phần người dùng cần nhất.

## API

::api{tabs}

## Token

::tokens{component.tabs}

## Changelog

- **0.1.0**: phát hành beta: kích hoạt tự động bằng phím mũi tên, `Home`/`End`, panel bật/tắt, icon, số đếm, tab bị khoá.

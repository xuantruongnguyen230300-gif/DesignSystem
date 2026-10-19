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
  - xem them
  - nhieu tab
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
- Khi không đủ chỗ, các tab cuối được dồn vào menu "Xem thêm" (xem mục dưới), không cuộn ngang.

## Nhiều tab

Khi hàng tab không đủ bề ngang, `nxt-tabs` dùng cách **priority-plus**: hiện các tab theo thứ tự cho tới khi hết chỗ, phần còn lại dồn vào nút **"Xem thêm"** ở cuối hàng. Cách này giống PatternFly, ServiceNow và Coloplast; không cần cấu hình gì.

::example{tabs-overflow}

- **Tab đang chọn luôn hiện** trên hàng tab, kể cả khi nó nằm cuối danh sách: các tab khác nhường chỗ cho nó.
- **Nhãn không bao giờ bị cắt** ("Lý do ngh…"): tab nào không vừa thì vào menu, nhãn đầy đủ kèm số đếm ("Ngân hàng (31)").
- Bố cục được tính lại khi vùng chứa đổi bề rộng, khi nhãn hoặc số đếm đổi, và khi đổi tab. Hàng tab không bao giờ làm trang rộng ra.
- Nút "Xem thêm" nằm **ngoài** `tablist` (tablist chỉ được chứa tab) và có tên "Xem thêm 3 tab". Nút chỉ hiện khi có tab bị dồn.
- Chọn một tab trong menu: tab đó được chọn, hiện lên hàng tab và nhận focus, nên phím mũi tên đi tiếp từ đó.
- <kbd>←</kbd> <kbd>→</kbd> <kbd>Home</kbd> <kbd>End</kbd> chỉ đi qua các tab **đang hiện**; tab trong "Xem thêm" mở bằng menu.
- Thứ tự tab là thứ tự ưu tiên: đặt các tab người dùng cần nhất ở đầu, vì tab cuối là tab bị dồn trước.

**Khi nào nên dùng menu trái thay cho tab:** quá khoảng **7 tab**, hoặc các phần không thật sự liên quan với nhau. Khi đó tách thành mục cấp 2 trong [Sidenav](/components/app-shell), mỗi mục một trang có tab của riêng nó. Menu trái tối đa 2 cấp; cấp thứ 3 mới là tab. Xem thêm pattern [Trang danh sách & danh mục](/patterns/list-page).

## Accessibility

Theo mẫu [Tabs của WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), kích hoạt tự động: phím mũi tên vừa chuyển focus vừa chọn tab.

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> | Vào danh sách tab tại tab đang chọn. Nhấn tiếp thì vào panel |
| <kbd>→</kbd> / <kbd>←</kbd> | Chọn tab sau / trước trong các tab đang hiện, vòng lại ở hai đầu, bỏ qua tab bị khoá |
| <kbd>Home</kbd> / <kbd>End</kbd> | Chọn tab đầu / tab cuối trong các tab đang hiện |
| <kbd>Tab</kbd> từ tab đang chọn | Tới nút "Xem thêm" (khi có tab bị dồn), rồi tới panel |
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên "Xem thêm" | Mở menu các tab bị dồn |
| Trong menu "Xem thêm" | <kbd>↑</kbd> / <kbd>↓</kbd> chọn mục, <kbd>Enter</kbd> mở tab đó (tab hiện lên hàng tab và nhận focus), <kbd>Esc</kbd> đóng menu và trả focus về nút |
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

- **0.1.0**: phát hành beta: kích hoạt tự động bằng phím mũi tên, `Home`/`End`, panel bật/tắt, icon, số đếm, tab bị khoá; tab không vừa bề ngang dồn vào menu "Xem thêm" (priority-plus), tab đang chọn luôn hiện, nhãn không bị cắt.

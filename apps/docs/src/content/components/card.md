---
title: Card & Stat
description: Bề mặt trắng gom một nhóm nội dung trên nền canvas xám, kèm ô chỉ số hiện biến động so với kỳ trước.
status: beta
group: Hiển thị dữ liệu
order: 31
package: "@nxt/ui/card"
keywords:
  - the
  - card
  - khung noi dung
  - chi so
  - stat
  - kpi
  - widget
  - dashboard
  - bang dieu khien
---

# Card & Stat

## Khi nào dùng

- Gom một nhóm nội dung cùng chủ đề trên trang: widget dashboard, khối "Thông tin hợp đồng" trong trang chi tiết, panel chứa bảng hoặc danh sách.
- Hiện một chỉ số chính (KPI) cùng biến động so với kỳ trước: đặt `nxt-stat` trong card.

## Khi nào không dùng

- **Chia nhỏ bên trong một card**: dùng khoảng trắng, đường kẻ hoặc tiêu đề phụ. Không lồng card trong card, vì nó tạo phân cấp giả và tốn chỗ.
- **Mọi thứ trên trang đều là card**: một form dài chỉ cần một bề mặt, các phần trong form chia bằng tiêu đề.
- **Cả khối bấm được như một link**: card không phải nút hay link. Đặt một link rõ ràng trong card (ví dụ "Xem tất cả") thay vì bọc cả card bằng `<a>` hoặc gắn `(click)` lên card.
- **Thông báo lỗi, cảnh báo**: dùng thông báo trong trang, không dùng card tô màu.

## Card trên nền canvas

Nền ứng dụng là canvas xám nhạt (`color.bg.canvas`). Card là bề mặt trắng (`color.bg.surface`) có viền mảnh và bóng `elevation.raised`. Đây là công cụ tách lớp chính của NXT: chỉ cần nhìn là biết đâu là một khối nội dung. Vì vậy card đặt thẳng trên canvas, không đặt lên một card khác.

Header là tuỳ chọn, gồm `title`, `subtitle` và slot `[nxtCardActions]` cho một hoặc hai hành động nhẹ (nút `ghost` size `sm`). Slot `[nxtCardFooter]` nằm dưới thân card. Card không tự thêm khoảng đệm cho chân card, nên bạn tự đặt padding và đường kẻ như ví dụ dưới.

::example{card-basic}

> Header chỉ hiện khi có `title`. Card không có tiêu đề thì nội dung trong `[nxtCardActions]` cũng không hiện.

## Cấp tiêu đề

`title` là một heading thật, mặc định `h2`. Chọn `headingLevel` theo **dàn ý của trang**, không theo cỡ chữ (chữ tiêu đề luôn dùng `typography.heading-sm`).

| Vị trí của card | `headingLevel` |
|-----------------|----------------|
| Ngay dưới tiêu đề trang (`h1`), ví dụ widget dashboard | `2` (mặc định) |
| Trong một section đã có `h2`, như các ví dụ trên trang này | `3` |
| Trong tab hoặc section con | `4` |

## Khoảng đệm

| `padding` | Dùng cho |
|-----------|----------|
| `md` (mặc định) | Phần lớn nội dung |
| `lg` | Card đứng riêng cần thoáng hơn, ví dụ form một cột. Dùng token `space.section.sm`: hiện bằng `md` ở mật độ gọn và vừa, rộng hơn ở mật độ rộng |
| `none` | Bảng, danh sách chạy sát mép card. Header vẫn giữ khoảng đệm |

::example{card-table}

## Stat: chỉ số và xu hướng

`nxt-stat` hiện nhãn, giá trị, đơn vị và biến động so với kỳ trước. `value` và `delta` là **chuỗi đã định dạng sẵn** theo vi-VN (`1.284`, `2,1%`), để component không phải đoán cách làm tròn hay đơn vị.

Hướng biến động (`trend`) và ý nghĩa tốt hay xấu (`deltaTone`) là **hai input riêng**, vì tăng không phải lúc nào cũng tốt:

| Chỉ số | `trend` | `deltaTone` |
|--------|---------|-------------|
| Tổng nhân sự tăng | `up` | `neutral` (mặc định): tốt hay xấu tuỳ kế hoạch |
| Tỷ lệ nghỉ việc giảm | `down` | `positive`: mũi tên đi xuống nhưng là tin tốt |
| Chi phí tăng ca tăng | `up` | `negative` |
| Tỷ lệ đi làm đúng giờ giảm | `down` | `negative` |

Xu hướng không chỉ dựa vào màu. Icon mũi tên đi kèm chữ ẩn "Tăng", "Giảm" hoặc "Không đổi" cho screen reader, sau đó là con số và `caption` ("so với tháng 9"). Màu của `deltaTone` chỉ bổ trợ, nên nhãn và caption phải đủ rõ để người đọc tự hiểu là tốt hay xấu.

::example{card-stat}

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Đi qua các phần tử tương tác trong card theo thứ tự trong code. Bản thân card không nhận focus |
| <kbd>H</kbd> (phím tắt của screen reader) | Nhảy giữa các card nhờ tiêu đề là heading thật |

- Card không có role. Không gắn `(click)` hay `tabindex` lên cả card.
- Giữ `headingLevel` đúng dàn ý trang (WCAG 1.3.1, 2.4.6). Không chọn cấp heading để có chữ to hơn.
- Nút trong `[nxtCardActions]` phải có tên đủ nghĩa khi đọc riêng. Nút hiện chữ "Sửa" thì đặt `aria-label="Sửa thông tin hợp đồng"`; tên bắt đầu bằng chữ hiển thị để khớp WCAG 2.5.3.
- Stat được đọc theo thứ tự: nhãn, giá trị kèm đơn vị, "Tăng/Giảm/Không đổi", biến động, caption. Icon trong ô icon chỉ để trang trí (`aria-hidden`).
- Bảng trong card `padding="none"` đặt trong vùng cuộn có `role="region"`, `aria-label` và `tabindex="0"` để cuộn ngang được bằng bàn phím.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Hợp đồng sắp hết hạn | Thông tin |
| Trong 30 ngày tới · 4 hợp đồng | Lặp lại tiêu đề ở subtitle |
| 1.284 · 2,1% · 214 triệu ₫ | 1,284 · 2.1% · 214000000 |
| so với tháng 9 | so với kỳ trước (khi không rõ kỳ nào) |
| Tỷ lệ nghỉ việc | Tỷ lệ nhân viên nghỉ việc trong tháng hiện tại |

## API

::api{card}

## Token

::tokens{component.card}

::tokens{component.stat}

## Changelog

- **0.1.0**: phát hành beta: `nxt-card` (title, subtitle, headingLevel, padding, slot hành động và chân card), `nxt-stat` (trend và deltaTone tách riêng, chữ ẩn cho xu hướng).

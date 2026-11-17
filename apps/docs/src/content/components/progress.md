---
title: Progress
description: Thanh hoặc vòng tiến độ cho tỉ lệ hoàn thành, hạn mức đã dùng, cơ cấu theo nhóm, hoặc tác vụ chưa biết còn bao lâu; luôn có tên và giá trị đọc được.
status: beta
group: Hiển thị dữ liệu
order: 34
package: "@nxt/ui/progress"
keywords:
  - tien do
  - thanh tien do
  - progress
  - progress bar
  - ti le
  - phan tram
  - han muc
  - nhap file
  - indeterminate
  - khong xac dinh
  - dang xu ly
  - vong tien do
  - circular progress
---

# Progress

## Khi nào dùng

- Tác vụ dài có tiến độ đo được: nhập hoặc xuất file, gửi thông báo hàng loạt.
- Tỉ lệ đã dùng của một hạn mức: ngày phép, giờ tăng ca, ngân sách.
- Cơ cấu theo nhóm trên dashboard: mỗi thanh là phần trăm trên tổng.
- Tác vụ nền chạy lâu nhưng chưa đo được tiến độ (đồng bộ chấm công, tính lương): dùng `indeterminate`, thanh chạy cho đến khi xong.
- Chỗ vuông hoặc hẹp (thẻ thống kê, đầu hàng, cạnh một dòng chữ): dùng dạng vòng `shape="circle"`.

## Khi nào không dùng

- **Chờ nội dung của một khối** (bảng, thẻ, form đang tải): dùng skeleton đúng hình khối đó, đừng dùng thanh chạy.
- **Chờ kết quả của một nút vừa bấm** (đang lưu): dùng `loading` của [Button](/components/button).
- **Tác vụ dưới 1 giây**: đừng hiện gì, tránh chớp. Chỉ hiện chỉ báo khi tác vụ chạy quá khoảng 1 giây (`nxtDeferredLoading` của skeleton).
- **So sánh nhiều chuỗi số theo thời gian**: dùng biểu đồ.
- **Các bước của một quy trình** (bước 2 trên 4): dùng stepper hoặc timeline.
- **Thay cho con số**: luôn hiện giá trị bằng chữ bên cạnh thanh.

## Tiến độ tác vụ

- `value` là **phần trăm từ 0 đến 100**, được làm tròn và giới hạn trong khoảng đó. Với "12/40 hồ sơ", truyền `12 / 40 * 100`.
- `label` (bắt buộc) là tên của thanh và trở thành `aria-label`.
- `valueText` là giá trị screen reader đọc thay cho phần trăm, ví dụ "12 trên 40 hồ sơ". Viết "trên" thay cho dấu "/" để câu đọc tự nhiên.
- Hiện giá trị bằng chữ cạnh thanh cho người dùng nhìn.
- Chỉ thông báo lúc **bắt đầu và kết thúc** qua `role="status"`; đừng thông báo mỗi lần thanh tăng.

::example{progress-import}

## Tông

`brand` (mặc định) cho tiến độ trung tính. Dùng `success`, `warning`, `danger` khi giá trị mang nghĩa đánh giá: đã hoàn thành, sắp chạm hạn mức, sắp vượt ngân sách. Chữ bên cạnh phải tự nói được ý nghĩa đó, vì màu thôi là không đủ: "34/40 giờ · sắp chạm hạn mức".

::example{progress-tones}

## Chưa biết tiến độ (indeterminate)

Thêm `indeterminate` khi biết tác vụ đang chạy nhưng không biết còn bao lâu. `value` bị bỏ qua, và `aria-valuenow` bị bỏ đi: đó là cách ARIA báo "chưa biết".

- `label` nói việc đang làm, ở dạng tiếp diễn: "Đang đồng bộ dữ liệu chấm công". Không hứa thời gian ("Chỉ mất vài giây").
- `valueText` là tuỳ chọn, dùng khi muốn screen reader đọc một trạng thái ngắn ("Đang xử lý").
- Khi đo được tiến độ, bỏ `indeterminate` và truyền `value`; khi xong, đổi sang `tone="success"` hoặc thông báo qua `role="status"`. Đừng để chạy mãi.
- Chỉ thông báo lúc bắt đầu và lúc kết thúc, như thanh xác định.

::example{progress-indeterminate}

## Dạng vòng

`shape="circle"` vẽ tiến độ thành một vòng, xác định (`value`) hoặc không xác định (`indeterminate`). Đường kính theo `size` (`sm`, `md`, `lg`, mặc định `md`) và theo [mật độ](/foundations/spacing), nét dày bằng một phần mười đường kính. `size` chỉ có tác dụng với dạng vòng; thanh ngang chỉ có một độ dày.

- **Nhãn giữa vòng**: nội dung đặt giữa thẻ `<nxt-progress>` hiện ở giữa vòng. Chỉ nên là 2–4 ký tự ("72%", "9/12") ở cỡ `md` và `lg`; cỡ `sm` để trống. Slot này không có ở dạng thanh.
- **Nhãn giữa vòng không thay `valueText`**: nội dung bên trong `progressbar` không được screen reader đọc riêng, nên số liệu cần đọc phải nằm ở `valueText`.
- **Chữ giải thích bên ngoài vòng** (tên, "34/40 giờ · sắp chạm hạn mức"): vòng không có chỗ cho câu dài, và màu một mình không đủ.
- Cung vòng đi theo chiều kim đồng hồ từ vị trí 12 giờ. Để **so sánh** vài giá trị với nhau, dùng thanh: mắt so độ dài thẳng chính xác hơn so độ dài cung.

::example{progress-circle}

## Cơ cấu theo nhóm

Mỗi hàng gồm tên nhóm, số tuyệt đối, và thanh thể hiện **phần trăm trên tổng** (không phải so với nhóm lớn nhất), để độ dài thanh khớp với phần trăm được đọc. Ghi tổng ở tiêu đề khối.

::example{progress-breakdown}

## Accessibility

Progress không tương tác và không có điểm dừng Tab.

- Host có `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow` là phần trăm đã làm tròn, và `aria-valuetext` khi có `valueText`. Khi `indeterminate` thì không có `aria-valuenow`.
- Tên lấy từ `label`. Nhiều thanh trên cùng một màn hình phải có tên khác nhau.
- Vòng SVG là trang trí (`aria-hidden`); mọi thứ cần đọc nằm ở `label` và `valueText`.
- Thay đổi độ dài dùng `motion.duration.slow`; ở chế độ giảm chuyển động, thanh đổi ngay không có hiệu ứng.
- Chuyển động `indeterminate` chỉ dùng `transform` và `opacity`. Ở chế độ giảm chuyển động (cài đặt hệ điều hành hoặc `data-nxt-motion="reduced"`), thanh không chạy ngang và vòng không quay: cả thanh hoặc cả vòng mờ sáng chậm tại chỗ (chu kỳ theo `motion.duration.loop` ở mức giảm), nên vẫn thấy là đang chờ mà không có chuyển động lớn.
- Trong chế độ tương phản cao (forced colors), thanh có viền và phần đã đạt dùng màu `Highlight`; vòng có rãnh `GrayText` và cung `Highlight`.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| `valueText="12 trên 40 hồ sơ"` | `valueText="30"` |
| `label="Nhập hồ sơ từ nhan-vien-thang-10.xlsx"` | `label="Tiến độ"` |
| 34/40 giờ · sắp chạm hạn mức | 85% (chỉ có màu vàng báo hiệu) |
| Đã nhập xong 40 hồ sơ, không có lỗi. | Hoàn tất! |

## API

::api{progress}

## Token

::tokens{component.progress}

## Changelog

- **0.1.0**: phát hành beta: `nxt-progress` xác định với `value` (0–100), `label` bắt buộc, `valueText`, 4 tông (`brand`, `success`, `warning`, `danger`), `role="progressbar"`.
- **0.2.0** (16/11/2026): thêm `indeterminate` (chưa biết tiến độ: chuyển động chỉ dùng `transform` và `opacity`, không có `aria-valuenow`, giảm chuyển động chuyển sang mờ sáng tại chỗ), thêm dạng vòng `shape="circle"` với `size` `sm` / `md` / `lg` và nhãn giữa vòng bằng slot. Token mới: `circle-size-{sm,md,lg}`, `label-text`. Phụ thêm, không đổi API cũ.

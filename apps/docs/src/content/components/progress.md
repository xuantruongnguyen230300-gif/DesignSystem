---
title: Progress
description: Thanh tiến độ xác định cho tỉ lệ hoàn thành, hạn mức đã dùng hoặc cơ cấu theo nhóm, luôn có tên và giá trị đọc được.
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
---

# Progress

## Khi nào dùng

- Tác vụ dài có tiến độ đo được: nhập hoặc xuất file, gửi thông báo hàng loạt.
- Tỉ lệ đã dùng của một hạn mức: ngày phép, giờ tăng ca, ngân sách.
- Cơ cấu theo nhóm trên dashboard: mỗi thanh là phần trăm trên tổng.

## Khi nào không dùng

- **Không đo được tiến độ** (đang tải, đang lưu): dùng `loading` của [Button](/components/button) hoặc skeleton. `nxt-progress` chưa có chế độ không xác định (indeterminate).
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

## Cơ cấu theo nhóm

Mỗi hàng gồm tên nhóm, số tuyệt đối, và thanh thể hiện **phần trăm trên tổng** (không phải so với nhóm lớn nhất), để độ dài thanh khớp với phần trăm được đọc. Ghi tổng ở tiêu đề khối.

::example{progress-breakdown}

## Accessibility

Progress không tương tác và không có điểm dừng Tab.

- Host có `role="progressbar"`, `aria-valuemin="0"`, `aria-valuemax="100"`, `aria-valuenow` là phần trăm đã làm tròn, và `aria-valuetext` khi có `valueText`.
- Tên lấy từ `label`. Nhiều thanh trên cùng một màn hình phải có tên khác nhau.
- Thay đổi độ dài dùng `motion.duration.slow`; ở chế độ giảm chuyển động, thanh đổi ngay không có hiệu ứng.
- Trong chế độ tương phản cao (forced colors), thanh có viền và phần đã đạt dùng màu `Highlight`.

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

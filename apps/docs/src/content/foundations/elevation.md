---
title: Elevation & hình khối
description: Ba mức nổi — bề mặt, lớp phủ, modal — và góc bo theo vai trò; không dùng bóng để trang trí.
order: 5
status: beta
keywords:
  - bong do
  - shadow
  - elevation
  - bo goc
  - radius
---

# Elevation & hình khối

## Ba mức, mỗi mức một việc

Trong giao diện nghiệp vụ, phân cấp tạo chủ yếu bằng **khoảng trắng, đường kẻ và chữ**. Bóng chỉ dùng để nói "phần tử này nằm trên một lớp khác":

| Mức | Dùng cho |
|-----|----------|
| `raised` | Bề mặt nội dung (card, bảng, panel) đặt trên nền trang xám, luôn đi cùng viền 1px. Bóng rất nhẹ, chỉ để mép thẻ rõ hơn |
| `overlay` | Dropdown, menu, popover, tooltip |
| `modal` | Dialog, drawer |

::example{elevation-levels}

Ở chế độ tối, bóng đậm hơn để vẫn tách được lớp.

## Nền trang và bề mặt

Ở chế độ sáng, nền trang (`bg.canvas`) là xám nhạt, còn bề mặt nội dung (`bg.surface`) là trắng, có viền `border.default` và bóng `raised`. Ba tín hiệu này cộng lại giúp phân biệt rõ đâu là nền, đâu là vùng làm việc, kể cả trên màn hình độ tương phản thấp. Đừng đặt bề mặt trắng trực tiếp lên nền trắng mà không có viền.

## Không làm

- Card lồng card để "tạo chiều sâu".
- Kính mờ (glassmorphism), gradient, phát sáng, vì chúng giảm tương phản và khó đọc khi dùng lâu.

## Token

::tokens{semantic.elevation}

::tokens{semantic.radius}

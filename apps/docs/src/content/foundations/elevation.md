---
title: Elevation & hình khối
description: Giao diện theo HeroUI: card, ô nhập, alert trắng nổi nhẹ trên nền xám nhờ bóng ba lớp rất mỏng, không viền; lớp phủ và modal mới có bóng rõ.
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

## Bốn mức, mỗi mức một việc

Giao diện NXT theo phong cách HeroUI: phẳng, viền hairline, góc bo vừa phải. Bóng chỉ dùng để nói "phần tử này nằm trên một lớp khác":

| Mức | Dùng cho |
|-----|----------|
| `raised` | Phần tử nhô rất nhẹ: nút primary, thanh trượt của segmented, header dính |
| `card` | Bề mặt nội dung (card, bảng, panel, alert) trên nền trang: bóng ba lớp rất mỏng, không viền. Sidenav và topbar phẳng, không bóng |
| `overlay` | Dropdown, menu, popover, tooltip, toast |
| `modal` | Dialog, drawer |

::example{elevation-levels}

Ở chế độ tối, bóng đậm hơn để vẫn tách được lớp.

## Nền trang và bề mặt

Nền trang (`bg.canvas`) là xám nhạt, còn bề mặt nội dung (`bg.surface`) là trắng, tách nhau bằng góc bo `container` (16px) và bóng `card`. Hai tín hiệu này giúp phân biệt rõ đâu là nền, đâu là vùng làm việc. Ô nhập, checkbox và track switch có viền mảnh, màu mềm (khoảng 1,6:1 với nền) để giao diện nhẹ như iOS. Đây là ngoại lệ có chủ đích của WCAG 1.4.11 (xem ADR-012); nhãn luôn hiển thị và vòng focus vẫn ≥ 3:1.

## Góc bo

| Vai trò | Giá trị | Dùng cho |
|---------|---------|----------|
| `control` | 12px | Ô nhập, select, mục menu |
| `container` | 16px | Card, panel, bảng |
| `overlay` | 20px | Dialog, popover, menu |
| `pill` | tròn hẳn | Nút, tag, segmented, switch, ô tìm, avatar |

## Không làm

- Card lồng card để "tạo chiều sâu".
- Kính mờ (`backdrop-filter`), gradient trang trí, phát sáng, hoạt ảnh trên `box-shadow`: chúng giảm tương phản và tốn chi phí vẽ.
- Bóng viết tay trong CSS: chỉ dùng `elevation` token.

## Token

::tokens{semantic.elevation}

::tokens{semantic.radius}

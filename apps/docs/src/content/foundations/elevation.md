---
title: Elevation & hình khối
description: Ba mức nổi cho lớp phủ, góc bo theo vai trò — không dùng bóng để trang trí.
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

## Độ nổi chỉ dành cho lớp phủ

Trong giao diện nghiệp vụ, phân cấp tạo bằng **khoảng trắng, đường kẻ và chữ**, không bằng bóng. Bóng chỉ dùng khi phần tử thật sự nằm trên lớp khác: dropdown, popover, dialog, header sticky khi cuộn.

::example{elevation-levels}

Ở chế độ tối, bóng đậm hơn để vẫn tách được lớp.

## Không làm

- Card lồng card để "tạo chiều sâu".
- Kính mờ (glassmorphism), gradient, phát sáng, vì chúng giảm tương phản và khó đọc khi dùng lâu.

## Token

::tokens{semantic.elevation}

::tokens{semantic.radius}

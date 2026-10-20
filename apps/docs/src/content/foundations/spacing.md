---
title: Spacing & mật độ
description: Lưới 4px, ba mức mật độ, và vùng chạm tối thiểu ở mọi mật độ.
order: 3
status: beta
keywords:
  - khoang cach
  - spacing
  - density
  - mat do
  - compact
---

# Spacing & mật độ

## Lưới 4px

Mọi khoảng cách là bội số của 4px. Riêng 2px và 6px được dùng cho control dày đặc. Trong code, dùng token **theo vai trò**:

| Nhóm | Dùng cho |
|------|----------|
| `space.inset.*` | Padding bên trong control và container |
| `space.gap.*` | Khoảng cách giữa các phần tử cạnh nhau |
| `space.section.*` | Khoảng cách giữa các khối lớn của trang |

## Ba mức mật độ

Mật độ chỉ đổi **khoảng cách và chiều cao**, không đổi cỡ chữ. Đặt cho cả trang trên `<html>`, hoặc cho một vùng: một bảng rà soát có thể ở mức gọn trong khi phần còn lại ở mức vừa.

::example{density-comparison}

| | Gọn | Vừa (mặc định) | Rộng |
|---|---|---|---|
| Control md | 28px | 32px | 40px |
| Hàng bảng md | 32px | 40px | 48px |
| Vùng chạm nhỏ nhất | 24px | 28px | 32px |

Vùng chạm nhỏ nhất vẫn đạt WCAG 2.5.8 (24×24px) ngay cả ở mức gọn.

## Token khoảng cách

::tokens{semantic.space}

## Token kích thước

::tokens{semantic.size}

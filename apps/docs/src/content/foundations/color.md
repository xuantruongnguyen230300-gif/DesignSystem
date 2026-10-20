---
title: Màu sắc
description: Thang màu OKLCH, màu theo vai trò, và cam kết tương phản ở mọi chế độ.
order: 1
status: beta
keywords:
  - mau
  - color
  - palette
  - tuong phan
  - contrast
---

# Màu sắc

## Ba tầng màu

1. **Primitive**: thang 11 bước (50…950) cho mỗi hue. Đây là nơi duy nhất có giá trị màu thật.
2. **Semantic**: màu theo **vai trò**: `bg.surface`, `text.subtle`, `border.input`… Tầng này đổi giá trị khi chuyển sáng/tối.
3. **Component**: `button.primary.bg`… chỉ alias semantic.

Trong code giao diện chỉ dùng semantic hoặc component. Không dùng primitive và không viết cứng `#hex`.

## Thang màu primitive

Thang màu được sinh từ một màu gốc trong không gian **OKLCH** rồi gamut-map về sRGB. Vì độ sáng của mỗi bước được cố định theo cảm nhận, bước 600 của mọi hue có độ tương phản gần như nhau. Ví dụ, chữ trắng trên bất kỳ bước 600 nào cũng đạt khoảng 4,6–5,5:1.

::example{color-scales}

## Màu theo vai trò

Thử đổi màu của ví dụ sang **tối** hoặc đổi brand ở thanh trên cùng. Tỷ lệ tương phản ghi trên mỗi ô do validator tính lúc build.

::example{color-roles}

## Quy tắc dùng màu

- **Không truyền thông tin chỉ bằng màu.** Trạng thái luôn đi kèm icon hoặc chữ.
- **Màu trạng thái giữ nguyên ý nghĩa** ở mọi sản phẩm: đỏ là lỗi hoặc phá huỷ, xanh lá là thành công, hổ phách là cảnh báo, xanh dương là thông tin.
- **Màu dữ liệu** (`color.data.1…8`) chỉ dùng cho biểu đồ, không dùng cho trạng thái.
- **Chữ phụ** (`text.subtle`) vẫn đạt ≥ 4,5:1. Đừng làm nhạt thêm bằng `opacity`.
- **Nền trang khác bề mặt.** Ở chế độ sáng, `bg.canvas` là xám nhạt, card và bảng dùng `bg.surface` trắng kèm viền, nên vùng làm việc luôn tách khỏi nền. Chữ, link và vòng focus được kiểm tương phản trên **cả hai** nền (xem [Elevation](/foundations/elevation)).

## Token nền

::tokens{semantic.color.bg}

## Token chữ

::tokens{semantic.color.text}

## Token viền và icon

::tokens{semantic.color.border}

::tokens{semantic.color.icon}

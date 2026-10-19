---
title: Typography
description: Thang chữ theo vai trò, font Inter cho tiếng Việt, và số liệu thẳng cột.
order: 2
status: beta
keywords:
  - chu
  - font
  - typography
  - co chu
---

# Typography

## Font

NXT dùng **Inter**:

- đủ glyph tiếng Việt;
- có chữ số cùng độ rộng (`tabular-nums`) cho bảng số liệu;
- dễ đọc ở cỡ nhỏ.

Sản phẩm có thể đổi font qua brand slot `semantic.font-family.sans`, với điều kiện font đó không cắt dấu chồng (ặ, ỗ, ữ) ở line-height hiện tại.

## Thang chữ theo vai trò

Dùng tên vai trò (`heading-md`, `body-sm`), không dùng cỡ chữ cụ thể. Mỗi vai trò là một token typography gồm font, cỡ, độ đậm và line-height. Lớp tiện ích tương ứng là `.nxt-text-<vai-trò>`.

::example{type-scale}

## Quy tắc

- **Cỡ nhỏ nhất là 12px** (`caption`, `label-sm`), ở mọi mật độ.
- **Sentence case**, không viết hoa toàn bộ nhãn, vì tiếng Việt có dấu viết hoa toàn bộ rất khó đọc.
- **Số liệu căn phải** và dùng `.nxt-tabular-nums` để các cột số thẳng hàng.
- Văn bản dài giới hạn khoảng **60–75 ký tự mỗi dòng**.

## Token

::tokens{semantic.typography}

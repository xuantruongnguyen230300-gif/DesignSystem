---
title: Stack
description: Xếp dọc với khoảng cách đều theo mật độ — thay cho margin viết tay giữa các phần tử.
status: beta
group: Bố cục
order: 10
package: "@nxt/ui/layout"
keywords:
  - xep doc
  - stack
  - khoang cach
  - bo cuc
---

# Stack

## Khi nào dùng

- Các section của trang, các field trong form, các đoạn nội dung.
- Mỗi khi bạn định viết `margin-top` giữa hai phần tử anh em.

## Khi nào không dùng

- Xếp ngang: dùng [Inline](/components/inline).
- Bố cục nhiều cột: dùng [Grid](/components/grid).

## Lồng theo cấp

Khoảng cách thể hiện quan hệ: phần tử càng liên quan thì càng gần. Dùng `gap` lớn giữa các khối và `gap` nhỏ trong cùng một khối.

::example{stack-sections}

| `gap` | Gọn | Vừa | Rộng |
|-------|-----|-----|------|
| `xs` | 2px | 4px | 6px |
| `sm` | 4px | 8px | 12px |
| `md` (mặc định) | 8px | 12px | 16px |
| `lg` | 12px | 16px | 20px |
| `xl` | 16px | 24px | 32px |

## API

`nxt-stack` nằm trong entry `@nxt/ui/layout`. Xem bảng API đầy đủ ở trang [Grid](/components/grid#api).

## Token

::tokens{component.flow}

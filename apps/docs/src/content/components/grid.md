---
title: Grid
description: Lưới 12 cột phản hồi theo bề rộng của chính nó, gutter tự động, và chế độ tự lấp cột cho lưới thẻ.
status: beta
group: Bố cục
order: 12
package: "@nxt/ui/layout"
keywords:
  - luoi
  - grid
  - cot
  - layout
  - bo cuc
---

# Grid

## Khi nào dùng

- Bố cục form nhiều cột, trang chi tiết, dashboard.
- Lưới thẻ có số cột tự đổi theo chỗ trống (`columns="auto"`).

## Khi nào không dùng

- Xếp dọc đơn giản: dùng [Stack](/components/stack).
- Một hàng nút hoặc tag: dùng [Inline](/components/inline).
- Bảng dữ liệu: dùng Table (Phase 3), vì Grid không có ngữ nghĩa bảng.

## 12 cột

::example{grid-columns}

## Responsive theo bề rộng của lưới

`[nxtSpan]` nhận một object: `{ base, sm, md, lg, xl }`. Breakpoint là **bề rộng của lưới** (sm 640 · md 768 · lg 1024 · xl 1280), không phải bề rộng cửa sổ.

::example{grid-responsive-form}

Cùng một lưới đặt trong drawer và trong trang rộng:

::example{grid-container}

## Lưới thẻ tự động

`columns="auto"` lấp số cột theo `minItem`: `sm` 160 · `md` 240 · `lg` 320px.

::example{grid-auto}

## Accessibility

- Grid là primitive trình bày: không có role, không nhận focus.
- Thứ tự đọc và thứ tự Tab là **thứ tự trong code**. Không dùng `order` hay đặt cột ngược thứ tự để "đảo" giao diện, vì sẽ vi phạm WCAG 1.3.2 và 2.4.3.

## API

::api{layout}

## Token

::tokens{component.grid}

---
title: Inline
description: Xếp ngang và tự xuống dòng khi hết chỗ — nhóm nút, toolbar, danh sách tag.
status: beta
group: Bố cục
order: 11
package: "@nxt/ui/layout"
keywords:
  - xep ngang
  - inline
  - toolbar
  - nhom nut
---

# Inline

## Khi nào dùng

- Nhóm nút, toolbar, header của trang hoặc section (`justify="between"`).
- Danh sách tag, chip.

## Khi nào không dùng

- Xếp dọc: dùng [Stack](/components/stack).
- Cần căn cột thẳng hàng giữa nhiều hàng: dùng [Grid](/components/grid).

## Tự xuống dòng

Mặc định `wrap` là `true`: khi hết chỗ, phần tử xuống dòng và vẫn giữ khoảng cách đều. Đặt `[wrap]="false"` khi muốn giữ một hàng, ví dụ nhóm nút ở footer.

::example{inline-wrap}

## Header trang

`justify="between"` đẩy tiêu đề sang trái và nhóm hành động sang phải. Khi hẹp, nhóm hành động xuống dòng thay vì tràn ngang.

::example{button-toolbar}

## API

`nxt-inline` nằm trong entry `@nxt/ui/layout`. Xem bảng API đầy đủ ở trang [Grid](/components/grid#api).

## Token

::tokens{component.flow}

---
title: Layout & Grid
description: Một thang breakpoint, lưới 12 cột theo bề rộng của chính nó, gutter tự động, và độ rộng nội dung theo loại trang.
order: 4
status: beta
keywords:
  - luoi
  - grid
  - layout
  - bo cuc
  - breakpoint
  - responsive
---

# Layout & Grid

## Một thang breakpoint duy nhất

NXT chỉ có **một** thang breakpoint. Các hệ thống ghép từ nhiều thư viện thường trộn 576/768/992/1200 với 640/1024/1280 và vài giá trị lẻ, khiến hành vi responsive mỗi màn một kiểu.

::tokens{primitive.breakpoint}

CSS variable không dùng được trong `@media`, nên breakpoint được xuất thêm thành mixin SCSS (`@nxt/tokens/scss/breakpoints`) và hằng số TS (`breakpoints` từ `@nxt/tokens`).

## Lưới 12 cột

`nxt-grid` chia 12 cột. Item đặt độ rộng bằng `[nxtSpan]`.

::example{grid-columns}

## Responsive theo không gian thật

Điểm khác biệt quan trọng nhất: `nxt-grid` phản hồi theo **bề rộng của chính nó** (container query), không theo cửa sổ trình duyệt. Breakpoint trong `[nxtSpan]="{ base: 12, md: 6 }"` là bề rộng của lưới.

Hệ quả: cùng một form đặt trong trang rộng sẽ có 2 cột, đặt trong drawer 480px tự về 1 cột. Không cần viết thêm media query nào.

::example{grid-container}

## Gutter tự động

Mặc định `gap="gutter"`: 16px khi lưới hẹp hơn 768px, 24px từ 768px, 32px từ 1280px. Gutter **không** đổi theo mật độ, vì đó là nhịp của bố cục trang. Khoảng cách bên trong vùng nội dung thì đổi theo mật độ.

## Độ rộng nội dung theo loại trang

| Loại trang | Độ rộng tối đa | Token |
|-----------|----------------|-------|
| Bảng dữ liệu | Toàn bộ chiều rộng | — |
| Chi tiết, form 2 cột | 1280px | `layout.content-default` |
| Form 1 cột, nội dung đọc | 720px | `layout.content-narrow` |
| Khung trang tối đa | 1440px | `layout.container-max` |

## Primitive bố cục

| Primitive | Dùng cho |
|-----------|----------|
| [`nxt-stack`](/components/stack) | Xếp dọc với khoảng cách đều, thay cho margin tay |
| [`nxt-inline`](/components/inline) | Xếp ngang có xuống dòng: nhóm nút, toolbar, tag |
| [`nxt-grid`](/components/grid) | Lưới 12 cột hoặc lưới thẻ `columns="auto"` |

## Token bố cục

::tokens{semantic.layout}

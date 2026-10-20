---
title: Motion
description: Chuyển động ngắn để giải thích thay đổi, tôn trọng cài đặt giảm chuyển động của người dùng.
order: 6
status: beta
keywords:
  - chuyen dong
  - animation
  - motion
  - reduced motion
---

# Motion

## Nguyên tắc

- Chuyển động **giải thích thay đổi trạng thái**: mở, đóng, xuất hiện, biến mất. Không dùng để trang trí.
- **Ngắn**: 100–300ms. Người dùng thao tác lặp lại hàng trăm lần mỗi ngày.
- **Không animation khi vào trang** cho từng phần tử.

## Giảm chuyển động

Khi người dùng bật "giảm chuyển động" trong hệ điều hành, NXT tự đặt mọi thời lượng về 0 mà không cần code thêm. Có thể ép bằng `data-nxt-motion="reduced"` hoặc `"full"`. Riêng phản hồi tiến trình (spinner) chỉ chạy chậm lại, không tắt hẳn, vì nó mang thông tin.

::example{motion-durations}

## Token

::tokens{semantic.motion}

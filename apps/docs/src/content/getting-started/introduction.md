---
title: Giới thiệu
description: NXT Design là gì, dành cho ai, và tài liệu này được tổ chức ra sao.
order: 1
keywords:
  - gioi thieu
  - tong quan
  - nguyen tac
---

# Giới thiệu

NXT Design là design system dùng chung cho các sản phẩm phần mềm nghiệp vụ của NXT. Người dùng của các sản phẩm này làm việc nhiều giờ mỗi ngày với dữ liệu dày: danh sách hàng nghìn dòng, form nhiều trường, quy trình phê duyệt. Vì vậy NXT ưu tiên **tốc độ thao tác và sự rõ ràng** hơn hiệu ứng.

## Bộ này gồm những gì

| Gói | Nội dung |
|-----|----------|
| `@nxt/tokens` | Token W3C DTCG, sinh ra CSS variable `--nxt-*` theo chế độ sáng/tối, ba mức mật độ, motion và brand từng sản phẩm |
| `@nxt/ui` | Component Angular 21 (standalone, signals, CDK headless). Mỗi component là một entry point riêng: `@nxt/ui/button` |
| Tài liệu này | Hướng dẫn chọn và dùng đúng, ví dụ chạy thật, bảng API và token sinh tự động |

## Bảy nguyên tắc

1. **Rõ trước đẹp.** Mỗi vùng màn hình chỉ có một hành động chính.
2. **Mật độ có kiểm soát.** Có ba mức gọn, vừa, rộng; chữ không bao giờ nhỏ hơn 12px.
3. **Bàn phím là công dân hạng nhất.** Mọi luồng chính làm được không cần chuột.
4. **Trạng thái đầy đủ.** Mỗi màn hình đều có đủ trạng thái loading, rỗng, lỗi và không có quyền.
5. **Không làm mất dữ liệu.** Hệ thống cảnh báo khi rời trang chưa lưu và ưu tiên hoàn tác hơn hỏi xác nhận.
6. **Nhất quán xuyên sản phẩm.** Sản phẩm chỉ được đổi các brand slot đã định nghĩa.
7. **Tiếng Việt là ngôn ngữ chính.** Tìm kiếm không phân biệt dấu, định dạng ngày và tiền theo `vi-VN`.

## Đọc tài liệu thế nào

- **Bắt đầu**: cài đặt, theming cho sản phẩm, và cách làm việc với AI agent.
- **Nền tảng**: màu, chữ, khoảng cách, lưới, độ nổi, chuyển động. Đây là các quyết định nằm dưới mọi component.
- **Components**: mỗi trang trả lời *khi nào dùng*, *khi nào không*, kèm ví dụ, accessibility, API và token.

Mỗi ví dụ có nút đổi **màu** và **mật độ** riêng cho ví dụ đó. Tìm nhanh bất kỳ trang nào bằng <kbd>Ctrl</kbd> <kbd>K</kbd>, không cần gõ dấu.

> Thành phần chưa phát hành chỉ có trong [Roadmap](/roadmap), không xuất hiện trong menu. Bạn sẽ không bao giờ bấm vào một trang "chưa có".

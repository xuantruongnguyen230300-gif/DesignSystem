---
title: Typography
description: Thang chữ theo vai trò (vai trò nào cho chữ nào, cỡ 12px chỉ cho thông tin phụ), font hệ thống cho tiếng Việt, và số liệu thẳng cột.
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

NXT dùng **font hệ thống** (ADR-014, thay Plus Jakarta Sans của ADR-010): SF Pro trên thiết bị Apple, Segoe UI trên Windows, Roboto trên Android. Không phải tải font nào, nên chữ hiện ngay và gói nhẹ hơn.

- đủ glyph tiếng Việt, dấu chồng (ặ, ỗ, ữ) không bị cắt ở 12–20px;
- có chữ số cùng độ rộng (`tabular-nums`) cho bảng số liệu;
- chữ trên Apple đúng với giao diện hệ thống, chữ trên Windows là Segoe UI.

Sản phẩm có thể đổi font qua brand slot `semantic.font-family.sans` (Inter và Plus Jakarta Sans vẫn có sẵn ở `primitive.font.family.inter` và `primitive.font.family.plus-jakarta-sans`; ứng dụng tự cài và nạp gói font tương ứng), với điều kiện font đó không cắt dấu chồng ở line-height hiện tại và có `tabular-nums`.

## Thang chữ theo vai trò

Dùng tên vai trò (`heading-md`, `body-sm`), không dùng cỡ chữ cụ thể. Mỗi vai trò là một token typography gồm font, cỡ, độ đậm và line-height. Lớp tiện ích tương ứng là `.nxt-text-<vai-trò>`.

::example{type-scale}

## Chọn vai trò

| Vai trò | Cỡ · độ đậm | Dùng cho | Không dùng cho |
|---------|-------------|----------|----------------|
| `display` | 30px · semibold | Tiêu đề trang chào, đăng nhập (register Welcome) | Màn hình nghiệp vụ |
| `heading-lg` | 24px · semibold | Tiêu đề trang (page header) | Tiêu đề section, tiêu đề card |
| `heading-md` | 20px · semibold | Tiêu đề section, dialog, drawer | Nhãn trường, nhấn mạnh trong câu |
| `heading-sm` | 16px · semibold | Tiêu đề card, nhóm trường | Nhấn mạnh trong đoạn văn |
| `body-lg` | 16px · line-height 1,5 | Văn bản đọc dài (register Read) | Ô bảng, chữ trong control |
| `body-md` | 14px | **Chữ mặc định của giao diện**: nội dung, giá trị trong control, ô bảng | — |
| `body-sm` | 13px | Ô bảng dày, mô tả phụ dưới chữ chính | Chữ chính của control, đoạn văn |
| `label-md` | 14px · medium | Nhãn control: nút, tab, nhãn trường | Đoạn văn |
| `label-sm` | 12px · medium | Nhãn của control cỡ sm, tiêu đề cột bảng | Nhãn trường của form thường |
| `caption` | 12px | **Thông tin phụ**: hướng dẫn dưới trường, thời gian, đơn vị, bộ đếm, chú thích | Chữ chính của control, ô bảng, nội dung cần đọc để làm việc |
| `code` | 13px · mono | Mã, token, đường dẫn trong tài liệu | Nhấn mạnh chữ thường |

## Quy tắc

- **Cỡ nhỏ nhất là 12px** (`caption`, `label-sm`), ở mọi mật độ, và **chỉ cho thông tin phụ**: thời gian, đơn vị, bộ đếm, hướng dẫn, nhãn cỡ nhỏ, tiêu đề cột. Không dùng 12px làm cỡ chữ chính của control, ô bảng hay đoạn văn.
- **Đổi độ đậm không được đổi bề rộng.** Trạng thái chọn, hover, đang mở (tab, mục menu, hàng bảng, segmented) không đổi `font-weight` nếu việc đó làm chữ rộng ra và đẩy các phần tử bên cạnh. Báo trạng thái bằng màu chữ, nền, vạch chỉ báo hoặc dấu tích. Nếu bắt buộc in đậm khi chọn, phải giữ sẵn chỗ bằng bề rộng của chữ đậm để bố cục không nhảy.
- **Văn bản nhiều dòng cần line-height rộng.** Đoạn văn, ghi chú, lý do phê duyệt, nội dung textarea: line-height khoảng 1,5 để dấu chồng tiếng Việt không chạm dòng trên. Line-height của `body-md` (≈ 1,43) dành cho chữ một dòng trong control và bảng.
- **Số lớn (KPI)** dùng `tabular-nums` và độ đậm từ regular trở lên; nét mảnh chỉ hợp với cỡ rất lớn.
- **Sentence case**, không viết hoa toàn bộ nhãn, vì tiếng Việt có dấu viết hoa toàn bộ rất khó đọc. Luật viết đầy đủ ở [Cách viết](/foundations/writing).
- **Số liệu căn phải** và dùng `.nxt-tabular-nums` để các cột số thẳng hàng.
- Văn bản dài giới hạn khoảng **60–75 ký tự mỗi dòng**.

**Việc còn mở:** chưa có vai trò riêng cho văn bản nhiều dòng (14px, line-height 1,5) và cho số KPI; số trong thẻ chỉ số đang mượn `heading-lg`.

## Token

::tokens{semantic.typography}

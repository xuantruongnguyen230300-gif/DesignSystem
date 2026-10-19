# ADR-001: Font mặc định là Inter

- **Trạng thái:** Đã áp dụng, chờ xác nhận
- **Ngày:** 2026-10-16

## Bối cảnh
Giao diện nghiệp vụ dày số liệu, tiếng Việt có dấu chồng (ặ, ỗ, ữ). Trang tham chiếu cho chọn 4 font (Be Vietnam Pro, Inter, Roboto, SF Pro), khiến các sản phẩm thiếu nhất quán.

## Phương án
| Font | Ưu | Nhược |
|------|----|-------|
| **Inter** | Đủ glyph tiếng Việt, có `tabular-nums`, bản variable, rất dễ đọc ở 12–14px | Phổ biến, ít "cá tính" |
| Be Vietnam Pro | Thiết kế cho tiếng Việt | Chữ rộng hơn, tốn chỗ trong bảng dày |
| Roboto | Có sẵn trên Android | Dấu tiếng Việt ở cỡ nhỏ kém rõ |

## Quyết định
Dùng Inter (`@fontsource-variable/inter`, tự host, đủ subset tiếng Việt) làm `primitive.font.family.inter`, map vào `semantic.font-family.sans`. Sản phẩm được đổi font qua brand slot nếu font mới đạt kiểm tra dấu chồng trong skill `nxt-theme`.

## Hệ quả
- Cỡ chữ nhỏ nhất là 12px, line-height ≥ 1.33.
- Số liệu dùng `.nxt-tabular-nums`.

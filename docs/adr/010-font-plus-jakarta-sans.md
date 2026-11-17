# ADR-010: Font mặc định là Plus Jakarta Sans (thay ADR-001)

- **Trạng thái:** Đã áp dụng, chờ xác nhận. *Thay thế ADR-001.*
- **Ngày:** 2026-11-06

## Bối cảnh
Chủ sản phẩm thấy giao diện với Inter còn "chung chung", chưa ưa nhìn so với các sản phẩm SaaS hiện nay, và muốn chọn font theo tham chiếu thực tế. Ràng buộc từ ADR-001 không đổi: đủ glyph tiếng Việt, dấu chồng (ặ, ỗ, ữ) không bị cắt ở line-height 1.33–1.43, có chữ số cùng độ rộng (`tabular-nums`) cho bảng số liệu, tự host được, bề rộng chữ không làm bảng dày tốn thêm chỗ.

## Phương án
So trên màn Danh mục tổ chức thật (1320px) và bảng glyph `Ặ ặ Ỗ ỗ Ữ ữ Ỷ ỷ — Nguyễn Thị Ngọc Diệp` ở 12, 14, 20px. "tnum" là đo bằng trình duyệt: `1111111111` và `0000000000` có bằng bề rộng khi bật `tabular-nums` hay không. "Rộng" là bề rộng chuỗi "Nghỉ phép · Phòng Công nghệ thông tin" ở 14px.

| Font | Tiếng Việt | tnum | Rộng | Nhận xét |
|------|-----------|------|------|----------|
| Inter (hiện tại) | Đủ | Có | 262px | Rõ, nhưng phổ biến và trung tính, đúng điều chủ sản phẩm chê |
| **Plus Jakarta Sans** | Đủ | Có | 258px | Hiện đại, mềm hơn Inter, hợp sản phẩm nhân sự; dùng nhiều trong SaaS dashboard; bản variable 200–800 |
| Manrope | Đủ | Có | 251px | Đẹp, nhưng chữ số tabular giãn rộng, kém gọn trong cột số |
| Geist | Đủ | Có | 251px | Gần Inter, người dùng gần như không thấy khác |
| IBM Plex Sans | Đủ | Có | 243px | Gọn nhất, nhưng mang chất "kỹ thuật" của IBM Carbon |
| Be Vietnam Pro | Đủ, đẹp nhất cho tiếng Việt | **Không** | 264px | Không có chữ số cùng độ rộng: cột số trong bảng lệch hàng |

## Quyết định
Dùng Plus Jakarta Sans (`@fontsource-variable/plus-jakarta-sans`, tự host, có subset tiếng Việt) làm `primitive.font.family.plus-jakarta-sans`, map vào `semantic.font-family.sans`. Giữ `primitive.font.family.inter` để sản phẩm nào muốn Inter thì chọn lại qua brand slot.

## Hệ quả
- Thang cỡ chữ, line-height và độ đậm không đổi. Cỡ nhỏ nhất vẫn 12px, line-height ≥ 1.33.
- Ứng dụng dùng NXT cài `@fontsource-variable/plus-jakarta-sans` và nạp `index.css` của gói (docs: `angular.json` → `styles`). Thiếu gói này thì trình duyệt rơi về Segoe UI / Roboto theo stack, không vỡ giao diện.
- Số liệu vẫn dùng `.nxt-tabular-nums` hoặc `.nxt-table__num`.
- Đổi lại font khác chỉ cần trỏ `semantic.font-family.sans` sang primitive khác và đổi gói font được nạp.

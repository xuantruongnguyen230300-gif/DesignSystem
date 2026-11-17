# ADR-013: Giao diện phẳng theo HeroUI (thay một phần ADR-012)

- **Trạng thái:** Thay thế một phần bởi [ADR-014](014-apple-hig-default.md). *Thay thế một phần ADR-012.*
- **Ngày:** 2026-11-16

## Bối cảnh
Sau khi dùng thử kiểu C (iOS: bo 28–32px, bóng rộng, control cao, nền trang xám), chủ sản phẩm thấy giao diện "chưa đơn giản và đẹp như HeroUI". Ảnh tham chiếu là một ứng dụng của HeroUI: sidebar phẳng, card trắng viền hairline gần như không bóng, chữ nhỏ gọn, nút viền hình viên thuốc, chip xám có chấm màu.

## Số đo từ HeroUI v3 (trang components, đo bằng trình duyệt)
Font Inter 14px; nút cao 36px, bo viên thuốc, 14px/500, đệm ngang 16px, không bóng; ô nhập và select cao 36px, bo 12px, nền trắng, không viền, bóng ba lớp `0 2px 4px #0000000A, 0 1px 2px #0000000F, 0 0 1px #0000000F`; tab cao 32px bo viên thuốc trên rãnh xám; tiêu đề cột bảng cao 36px, 12px/500, màu xám; chip 10px/600; nền trang xám gần `#F5F5F5`.

## Quyết định
Đổi toàn bộ qua token, giữ cấu trúc và hành vi component:
- **Bo góc:** control 12px, container 16px, overlay 20px; nút, tag, segmented, switch vẫn là viên thuốc.
- **Bóng:** `elevation.card` và `raised` dùng `shadow.surface` (ba lớp rất mỏng như HeroUI); card không viền (`card.border` trong suốt). Alert trắng nổi nhẹ, trạng thái nhận biết qua icon và tiêu đề. Overlay và modal giữ bóng rõ. Sidenav và topbar phẳng, nền trong suốt, không bóng (`elevation.none`).
- **Nền:** `bg.canvas` xám nhạt (neutral.100); card, ô nhập, alert trắng nổi trên nền.
- **Chữ:** body 14px, nhãn 14px/500, tiêu đề cột 12px, tiêu đề heading-sm 16px, heading-md 20px, heading-lg 24px, display 30px (cùng thang gốc của NXT, khớp HeroUI).
- **Mật độ:** control 24/28/32 (gọn), 32/36/40 (vừa, mặc định), 40/46/54 (rộng); hàng bảng 32/40/48, 36/44/48, 48/56/64.
- **Nút:** secondary là nút viền (nền trắng, viền hairline); primary/danger phẳng, không bóng. Hàng bảng không kẻ đường (hover và hàng chọn tách hàng); mục sidebar đang active là nền xám nhạt; tiêu đề cột bảng là thanh xám nhạt, thân bảng trắng.
- **Giữ từ ADR-012:** viền ô nhập mềm (ngoại lệ có chủ đích của WCAG 1.4.11), chip trạng thái xám có chấm màu, tách CSS theo component, `provideNxt()`.

## Chưa làm
- Font vẫn là Plus Jakarta Sans. HeroUI dùng Inter; đổi cần cài `@fontsource-variable/inter` (thêm dependency, cần chủ repo cho phép) rồi trỏ `semantic.font-family.sans` sang `primitive.font.family.inter`.

## Hệ quả
- API, hành vi, keyboard map và các quyết định về lưới, toolbar không đổi.
- Muốn quay lại kiểu iOS, đảo các giá trị token nêu trên (xem ADR-012).

# ADR-014: Giao diện mặc định theo Apple HIG (thay một phần ADR-013 và ADR-010)

- **Trạng thái:** Đã áp dụng, chờ xác nhận. *Thay thế một phần ADR-013 (diện mạo) và ADR-010 (font).*
- **Ngày:** 2026-11-16

## Bối cảnh
Chủ sản phẩm thử bản HeroUI (ADR-013) và bản iOS (brand `ios` thử nghiệm) rồi chọn Apple Human Interface Guidelines làm chuẩn trực tiếp, không đi qua HeroUI nữa. HIG là bộ nguyên tắc (vùng bấm tối thiểu 44×44pt, nhãn riêng cho ô nhập, toggle chỉ cho hai trạng thái đối lập…), không có số CSS; các giá trị cụ thể lấy từ quy ước màu và hình khối của iOS.

## Quyết định
Nâng toàn bộ phần của brand thử nghiệm `ios` thành mặc định (brand `ios` bị xoá):
- Màu nhấn xanh kiểu Apple (seed oklch(0.55 0.2 257), chữ trắng ≥ 4,5:1); nền nhóm xám hệ thống; card không bóng, bo 12px.
- Nút secondary "tô nhạt" (nền accent nhạt, chữ accent); nút ghost chỉ có chữ accent; nút primary giữ viên thuốc.
- Ô nhập nền xám không viền; segmented bo vuông mềm; switch bật màu xanh lá; checkbox tròn.
- Bảng như danh sách: tiêu đề phẳng, đường kẻ mảnh giữa hàng; sidebar mục active tô accent nhạt.
- Font hệ thống (`primitive.font.family.system`): SF Pro trên thiết bị Apple, Segoe UI/Roboto nơi khác.
- Không dùng kính mờ (`backdrop-filter`): NXT cấm vì lý do hiệu năng và tương phản.

## Hệ quả
- Mật độ: HIG yêu cầu vùng bấm 44pt, nên màn cảm ứng dùng `data-nxt-density="spacious"`; bảng dữ liệu dày vẫn dùng comfortable/compact.
- Quay lại HeroUI hoặc iOS cũ: đảo các token nêu trên (xem ADR-012, ADR-013).
- Viền ô nhập vẫn là ngoại lệ có chủ đích của WCAG 1.4.11 (ADR-012).

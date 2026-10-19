# ADR-002: Lưới dữ liệu nâng cao

- **Trạng thái:** Đề xuất
- **Ngày:** 2026-10-16

## Bối cảnh
HRM cần bảng dữ liệu: khoảng 80% là danh sách sort/lọc/chọn/phân trang; phần còn lại cần nhóm, pivot, master-detail lớn, chỉnh sửa trong ô. Trang tham chiếu có trang riêng cho grid nâng cao (grouped, pivot, master-detail).

## Phương án
1. Tự viết toàn bộ trên `@angular/cdk/table` + virtual scroll.
2. `nxt-table` trên CDK cho khoảng 80% trường hợp, kèm **adapter theme** cho một data grid chuyên dụng (vd. AG Grid Community) cho phần nặng.
3. Dùng data grid thương mại cho mọi bảng.

## Đề xuất
Chọn phương án 2. Không tự viết pivot hay grouping, vì chi phí bảo trì quá lớn. Adapter chỉ map token NXT (màu, density, row height, focus) sang theme của grid, để người dùng không thấy khác biệt.

## Cần chốt
- Có giấy phép hoặc ngân sách cho bản Enterprise không, nếu cần pivot?
- Danh sách màn hình thật cần tính năng nặng.

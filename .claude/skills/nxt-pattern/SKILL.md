---
name: nxt-pattern
description: Thiết kế và dựng pattern/template nghiệp vụ dữ liệu dày từ component NXT có sẵn — trang danh sách CRUD, lọc & tìm kiếm, bulk action, master-detail, form nhiều bước, quy trình phê duyệt, dashboard vận hành, import/export, trạng thái rỗng/lỗi/phân quyền. Dùng khi user nói 'pattern', 'template trang', 'màn hình danh sách', 'trang chi tiết', 'form nhập liệu', 'luồng phê duyệt', 'dashboard', 'list page', 'master-detail', 'bộ lọc', 'thao tác hàng loạt', hoặc khi cần ghép nhiều component thành một luồng.
argument-hint: "<pattern> [sản phẩm/bối cảnh]"
---

# nxt-pattern: ghép component thành luồng nghiệp vụ

Pattern là nơi UX của NXT tốt hơn hay kém hơn trang tham chiếu. Một bộ component tốt mà ghép sai thì sản phẩm vẫn khó dùng.

**Đọc trước:**
- [references/patterns.md](references/patterns.md): luật của từng pattern.
- [docs/design/principles.md](../../../docs/design/principles.md): register Operate, quality floor, anti-pattern.

## Quy trình

### 1. Xác định công việc của người dùng
Viết một câu theo dạng: *"<Vai trò> cần <làm gì> với <bao nhiêu dữ liệu> <tần suất>"*. Ví dụ: "Chuyên viên C&B cần rà soát và duyệt khoảng 200 đề xuất tăng lương mỗi kỳ". Câu này quyết định mật độ, bulk action và phím tắt.

### 2. Chọn pattern trong catalog
Tra [references/patterns.md](references/patterns.md). Nếu nhu cầu không khớp pattern nào thì đề xuất pattern mới với user trước khi làm.

### 3. Chỉ dùng component có sẵn
- Liệt kê component sẽ dùng và kiểm `ls packages/ui`.
- Thiếu component thì **dừng phần đó**, tạo spec bằng `nxt-component-spec`. Không viết UI tạm trong pattern.

### 4. Viết pattern spec
Viết vào `packages/patterns/<pattern>/PATTERN.md`, hoặc vào `apps/docs/src/content/patterns/<pattern>.md` nếu pattern chỉ là hướng dẫn:
- **Anatomy trang:** header (tiêu đề, breadcrumb, hành động chính), toolbar, vùng nội dung, footer action.
- **Trạng thái bắt buộc:** loading (skeleton), empty lần đầu, empty do lọc, error, no-permission, partial, và stale/đang đồng bộ.
- **Tương tác:** bàn phím và phím tắt, chọn nhiều, undo, cảnh báo khi rời trang mà chưa lưu.
- **Responsive:** từ `lg` trở xuống thì gì thu gọn và gì ẩn; container query cho các panel.
- **Nội dung:** nhãn hành động và câu thông báo tiếng Việt (theo principles §5).

### 5. Dựng
- Pattern có code dùng lại được thì đặt trong `packages/patterns/<pattern>/` (Angular, theo conventions giống component).
- Pattern chỉ có hướng dẫn thì là trang docs, kèm example ghép từ `@nxt/ui`.
- Example dùng dữ liệu đủ lớn để lộ vấn đề: ≥ 50 dòng, tên dài, giá trị rỗng, số âm.

### 6. Review
Chạy `nxt-ui-review` cho example của pattern ở light/dark × compact/comfortable trước khi báo xong.

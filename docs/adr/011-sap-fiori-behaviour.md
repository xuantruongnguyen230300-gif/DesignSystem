# ADR-011: Hành vi và khuôn trang theo SAP Fiori, giao diện giữ của NXT

- **Trạng thái:** Đã áp dụng, chờ xác nhận.
- **Ngày:** 2026-11-06

## Bối cảnh
Chủ sản phẩm chọn SAP Fiori for Web (bản hướng dẫn 1.154) làm tham chiếu để cải thiện NXT, vì Fiori được thiết kế cho đúng loại phần mềm NXT phục vụ: nghiệp vụ dày dữ liệu. Sau đợt này, CoreAndSkill (Angular 21 + PrimeNG) sẽ sửa component theo NXT, nên NXT phải là nơi chốt hành vi.

## Quyết định
1. **Lấy của Fiori:** khuôn trang (Danh sách / Hàng đợi việc / Chi tiết đối tượng / Nhiều bước / Tổng quan), vị trí hành động, luồng xử lý đối tượng (tạo, sửa, bản nháp, xoá), kênh thông báo, trạng thái giá trị của trường nhập, tuỳ biến bảng và chế độ xem đã lưu, chọn giá trị từ danh mục lớn, thời gian phản hồi. **Không lấy:** màu, font "72", bộ icon, theme Horizon/Quartz và tên control SAPUI5.
2. **Tiêu đề trang trên topbar** (`placement="topbar"`) là hàng tiêu đề thu gọn vĩnh viễn của Dynamic Page. Phần tóm tắt đối tượng (avatar, thuộc tính chính, trạng thái) nằm ở `nxt-object-page`, co lại khi cuộn.
3. **Hành động kết thúc khi sửa/tạo** (Lưu, Huỷ) nằm ở `nxt-action-bar` dính đáy, kèm nút đếm lỗi mở danh sách thông báo. Hành động của đối tượng khi xem (Sửa, ⋯) ở topbar.
4. **Chỗ NXT cố ý khác Fiori:**
   - Nút chính đứng **ngoài cùng bên phải** nhóm (Fiori: bên trái nhóm căn phải). Lý do: quy ước sẵn có của NXT và của dialog/drawer; đổi sẽ đảo mọi màn hình.
   - Thao tác trên hàng bảng mặc định **hiện khi hover/focus** (`nxtRowActions`), theo yêu cầu của chủ sản phẩm; Fiori luôn hiện. Bù lại: mọi thao tác trong thanh hover phải có đường thứ hai luôn nhìn thấy (drawer chi tiết, menu); `reveal="always"` cho bảng mà thao tác là việc chính; thiết bị cảm ứng luôn hiện.
   - Lựa chọn hàng khi lọc: giữ các hàng còn khớp (`NxtSelection.retain()`), báo rõ số hàng bị bỏ; Fiori xoá hết lựa chọn.
   - Toast có tối đa một hành động (ví dụ "Hoàn tác"), luôn có đường khác để làm lại.
   - Định dạng theo vi-VN (`dd/MM/yyyy`, `.` phân cách nghìn, `₫` sau số), tuần bắt đầu Thứ Hai.

## Hệ quả
- Component mới: `popover`, `toast`, `action-bar`, `calendar`, `date-picker`, `combobox`, `value-help`, `radio-group`, `switch`, `object-page`, `skeleton`, `view-manager`, `format`; mở rộng `form-field`, `checkbox`, `segmented`, `button`, `dialog`, `drawer`, `table`, `card`. Token semantic mới: `color.border.{warning,success,info}`, `color.indication.1–8`, `color.bg.placeholder`, `motion.duration.loop`.
- Pattern mới: Chọn khuôn trang, Trang chi tiết đối tượng, Form nhập liệu, Thông báo & phản hồi, Vị trí hành động; foundation mới: Trạng thái, Cách viết, Định dạng.
- Mẫu HRM mới "Hồ sơ nhân viên"; Danh mục, Quy trình duyệt, Phê duyệt và Tổng quan làm lại theo List Report / Worklist / Overview Page.
- Việc còn mở cho CoreAndSkill dùng NXT: cơ chế cấp chuỗi dịch tập trung (thay vì từng input), lớp ghi đè token cho preset PrimeNG, và các điểm vênh token (cỡ control, bo góc, breakpoint, icon) cần chốt.

# Heuristic review cho màn hình nghiệp vụ dữ liệu dày

Dựa trên 10 heuristic của Nielsen, cụ thể hoá cho register Operate. Mỗi câu hỏi trả lời "không" là một finding P2, trừ khi có ghi mức khác.

## 1. Hiển thị trạng thái hệ thống
- Thao tác > 300ms có phản hồi tại chỗ (nút loading, skeleton, progress)?
- Sau khi lưu/xoá có xác nhận rõ không, đặt gần nơi thao tác hoặc bằng toast có undo?
- Dữ liệu cũ hoặc đang đồng bộ có được đánh dấu không?

## 2. Khớp với ngôn ngữ người dùng
- Nhãn dùng thuật ngữ nghiệp vụ trong glossary của sản phẩm, không dùng tên field DB (`emp_status`)?
- Ngày, tiền, số theo locale `vi-VN`?

## 3. Kiểm soát & tự do
- Có undo cho thao tác phá huỷ không, hoặc xác nhận ghi rõ đối tượng? (Thiếu cả hai: **P0**)
- Đóng được dialog/drawer bằng `Esc` và bằng nút đóng không?
- Rời trang khi có thay đổi chưa lưu thì có cảnh báo không? (Thiếu: **P0**)

## 4. Nhất quán & chuẩn
- Hành động chính luôn cùng vị trí trên các trang cùng loại (header phải / footer phải)?
- Cùng một khái niệm có dùng cùng một component không, ví dụ trạng thái luôn là tag cùng bảng màu?
- Có dùng pattern trong catalog `nxt-pattern` thay vì tự chế không?

## 5. Phòng lỗi
- Input có ràng buộc đúng kiểu không (date picker, number, mask CCCD), để không phải chờ validate sau?
- Hành động nguy hiểm có tách xa hành động thường và có màu danger không?

## 6. Nhận ra hơn là nhớ
- Bộ lọc đang áp dụng có hiển thị (chip) không?
- Select/combobox có tìm kiếm khi > 10 lựa chọn không?
- Ở trang chi tiết, ngữ cảnh (bản ghi nào, thuộc đơn vị nào) có luôn nhìn thấy không?

## 7. Linh hoạt & hiệu quả
- Có phím tắt cho thao tác lặp không (lưu, tìm, chuyển bản ghi)?
- Có bulk action cho tác vụ làm trên nhiều bản ghi không?
- Có saved view, ghi nhớ cột, ghi nhớ density không?

## 8. Tối giản & thẩm mỹ
- Mỗi vùng chỉ có một primary action?
- Có anti-pattern ở principles §4 không, như card lồng card, gradient, hero metric? (Có: P2)
- Mật độ có phù hợp với công việc không? Bảng rà soát nên compact, form nhập nên comfortable.

## 9. Giúp nhận biết và phục hồi lỗi
- Thông báo lỗi có nói chuyện gì xảy ra, vì sao, và làm gì tiếp không?
- Lỗi field có nằm cạnh field và được liên kết bằng `aria-describedby` không? (Thiếu liên kết: **P1**)

## 10. Trợ giúp
- Field khó hiểu có helper text hoặc tooltip không?
- Empty state lần đầu có link hướng dẫn không?

## Kiểm nhanh trên dữ liệu khó
Kiểm từng loại dữ liệu dưới đây:
- tên rất dài;
- giá trị rỗng hoặc null;
- 0 dòng, 1 dòng, 10.000 dòng;
- số âm;
- ngày ở quá khứ xa;
- người dùng thiếu quyền;
- mạng chậm (throttle 3G).

Chỗ nào vỡ layout hoặc hiển thị sai thì ghi finding kèm loại dữ liệu đã dùng.

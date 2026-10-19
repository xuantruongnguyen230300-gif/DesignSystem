---
title: Phê duyệt
description: Màn hình duyệt đơn theo kiểu hộp thư — danh sách bên trái, chi tiết và quy trình bên phải, xử lý xong tự sang đơn kế tiếp.
status: beta
order: 3
keywords:
  - phe duyet
  - duyet don
  - don tu
  - nghi phep
  - approval
  - workflow
  - quy trinh
---

# Phê duyệt

Trưởng phòng thường duyệt nhiều đơn liền một lúc. Mẫu này tối ưu cho **xử lý hàng đợi**: xem đủ thông tin để quyết định mà không cần mở trang khác, xử lý xong thì đơn tiếp theo đã sẵn sàng.

::example{template-approval}

## Cấu trúc

- **Tab trạng thái** có số đếm: "Chờ tôi duyệt" là mặc định; "Đã xử lý" để xem lại.
- **Danh sách đơn**: ảnh đại diện, tên, loại đơn, thời lượng, thời điểm gửi và trạng thái. Phía trên là toolbar chuẩn: ô tìm kiếm (tên, mã đơn, lý do) và nút **Bộ lọc** (loại đơn, phòng ban), chip bộ lọc khi đang lọc.
- **Chi tiết đơn**: thông tin dạng cặp nhãn–giá trị, lý do, file đính kèm, **quy trình duyệt** (`nxt-timeline`) cho biết đơn đang ở bước nào và sau bạn là ai.
- **Thanh quyết định** ở cuối thẻ chi tiết: Từ chối, Trả lại, và một nút primary "Duyệt đơn" tách sang phải.

## Quyết định UX

- **Từ chối và Trả lại bắt buộc có ý kiến**, để người gửi biết cần sửa gì. Duyệt thì không bắt buộc. Thiếu ý kiến thì focus vào ô ý kiến và báo lỗi tại chỗ.
- **"Trả lại" khác "Từ chối"**: trả lại cho phép người gửi sửa và gửi lại, giữ nguyên lịch sử.
- **Không hỏi xác nhận lần hai** cho từng đơn; thay vào đó kết quả được đọc qua `role="status"` và đơn chuyển sang tab "Đã xử lý" để xem lại.
- **Tự chọn đơn kế tiếp** sau khi xử lý, đúng thứ tự trong danh sách.
- **Màn rộng lấp đầy màn hình**: danh sách và phần chi tiết tự cuộn, thanh quyết định luôn thấy ở đáy. **Màn hẹp** xếp danh sách trên, chi tiết dưới và cả trang cuộn.

## Components dùng

`nxt-page-header` · `nxt-tabs` · `nxt-search` · `nxt-filter` · `nxt-card` · `nxt-avatar` · `nxt-tag` · `nxt-timeline` · `nxt-form-field` · `nxt-empty-state` · `nxtButton` · `nxt-icon`

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>←</kbd> / <kbd>→</kbd> trên tab | Chuyển tab trạng thái |
| <kbd>↑</kbd> / <kbd>↓</kbd> trong danh sách | Chuyển nhanh sang đơn trước/sau, chi tiết cập nhật ngay |
| <kbd>Tab</kbd> | Từ danh sách sang chi tiết, ô ý kiến, rồi các nút quyết định |

- Đơn đang xem có `aria-current="true"`, không chỉ đổi màu nền.
- Trạng thái đơn luôn có chữ ("Chờ duyệt"), chấm màu chỉ là phụ.

---
title: Phê duyệt
description: Hàng đợi việc (Worklist) duyệt đơn theo kiểu hộp thư — chế độ xem, danh sách có đơn gấp được tô sáng bên trái, chi tiết và quy trình bên phải, xử lý xong tự sang đơn kế tiếp.
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
  - worklist
  - hang doi viec
  - che do xem
---

# Phê duyệt

Trưởng phòng thường duyệt nhiều đơn liền một lúc. Mẫu này là một **hàng đợi việc** (theo SAP Fiori: Worklist), tối ưu cho xử lý lần lượt: xem đủ thông tin để quyết định mà không cần mở trang khác, xử lý xong thì đơn tiếp theo đã sẵn sàng. Bố cục chung xem [Trang danh sách & danh mục](/patterns/list-page#hai-loai-trang-danh-sach).

::example{template-approval}

## Cấu trúc

- **Tab trạng thái** có số đếm: "Chờ tôi duyệt" là mặc định; "Đã xử lý" để xem lại.
- **Hàng tiêu đề danh sách**: [Chế độ xem](/components/view-manager) đang dùng và số đơn đang hiện. Chế độ xem lưu tìm kiếm + bộ lọc (không lưu tab); có sẵn "Tăng ca và công tác".
- **Danh sách đơn**: ảnh đại diện, tên, loại đơn, thời lượng, thời điểm gửi và trạng thái. Phía trên là toolbar chuẩn: ô tìm kiếm (tên, mã đơn, lý do) và nút **Bộ lọc** (loại đơn, phòng ban), chip bộ lọc khi đang lọc.
- **Đơn gấp được tô sáng**: đơn chờ duyệt bắt đầu trong 2 ngày có dải `warning` ở đầu mục và chữ "Bắt đầu sau 1 ngày"; đơn đã qua ngày bắt đầu có dải `danger` và chữ "Đã qua ngày bắt đầu". Cùng ngôn ngữ với [tô sáng hàng](/components/table#to-sang-hang) của bảng: dải chỉ là gợi ý, lý do luôn bằng chữ.
- **Chi tiết đơn**: thông tin dạng cặp nhãn–giá trị, lý do, file đính kèm, **quy trình duyệt** (`nxt-timeline`) cho biết đơn đang ở bước nào và sau bạn là ai.
- **Thanh quyết định** ở cuối thẻ chi tiết: Từ chối, Trả lại, và một nút primary "Duyệt đơn" tách sang phải.

## Quyết định UX

- **Từ chối và Trả lại bắt buộc có ý kiến**, để người gửi biết cần sửa gì. Duyệt thì không bắt buộc. Thiếu ý kiến thì focus vào ô ý kiến và báo lỗi tại chỗ.
- **"Trả lại" khác "Từ chối"**: trả lại cho phép người gửi sửa và gửi lại, giữ nguyên lịch sử.
- **Không hỏi xác nhận lần hai** cho từng đơn; thay vào đó kết quả được đọc qua `role="status"` và đơn chuyển sang tab "Đã xử lý" để xem lại.
- **Tự chọn đơn kế tiếp** sau khi xử lý, đúng thứ tự trong danh sách.
- **Danh sách thay vì bảng**: người duyệt đọc từng đơn như một khối (ai, loại, bao lâu, khi nào) chứ không so sánh cột; đơn đang xem là mục chọn sẵn (`aria-current`), không cần checkbox.
- **Không có nhập/xuất, không có Thêm mới**: hàng đợi việc chỉ để xử lý.
- **Màn rộng lấp đầy màn hình**: danh sách và phần chi tiết tự cuộn, thanh quyết định luôn thấy ở đáy. **Màn hẹp** xếp danh sách trên, chi tiết dưới và cả trang cuộn.

## Components dùng

`nxt-page-header` · `nxt-tabs` · `nxt-view-manager` + `NxtViews` · `nxt-search` · `nxt-filter` · `nxt-card` · `nxt-avatar` · `nxt-tag` · `nxt-timeline` · `nxt-form-field` · `nxt-empty-state` · `nxt-alert` + `nxtLiveRegion` · `nxtButton` · `nxt-icon`

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>←</kbd> / <kbd>→</kbd> trên tab | Chuyển tab trạng thái |
| <kbd>↑</kbd> / <kbd>↓</kbd> trong danh sách | Chuyển nhanh sang đơn trước/sau, chi tiết cập nhật ngay |
| <kbd>Tab</kbd> | Từ danh sách sang chi tiết, ô ý kiến, rồi các nút quyết định |

- Đơn đang xem có `aria-current="true"`, không chỉ đổi màu nền.
- Trạng thái đơn luôn có chữ ("Chờ duyệt"), chấm màu chỉ là phụ; đơn gấp có chữ "Bắt đầu sau 1 ngày", dải màu chỉ là phụ.

---
title: Danh mục
description: Màn hình quản lý một danh mục — tìm, lọc, sắp xếp, thao tác hàng loạt, thêm/sửa trong drawer.
status: beta
order: 2
keywords:
  - danh muc
  - danh sach
  - bang
  - crud
  - them sua xoa
  - master data
---

# Danh mục

Mẫu cho mọi danh mục dùng chung: chức danh, phòng ban, loại hợp đồng, ca làm việc… Người dùng vào đây để **tìm một bản ghi, sửa nó, rồi quay lại việc chính**, nên màn hình phải nhanh hơn đẹp.

::example{template-catalog}

## Cấu trúc

- **Page header**: breadcrumb, tiêu đề, một nút primary "Thêm chức danh", nút phụ "Nhập từ Excel".
- **Thanh công cụ**: ô tìm kiếm (không phân biệt dấu), các bộ lọc thường dùng, "Xoá lọc" chỉ hiện khi đang lọc.
- **Thanh hàng loạt** thay thế thanh công cụ khi có hàng được chọn, ghi rõ số lượng ("Xoá 3 chức danh").
- **Bảng**: header dính khi cuộn, cột sắp xếp được, cột số căn phải, thao tác trên từng hàng ở cuối.
- **Phân trang**: luôn ghi "Hiển thị 1–10 trong 29 chức danh" và cho đổi số dòng/trang.

## Quyết định UX

- **Thêm/sửa trong drawer, không chuyển trang.** Người dùng giữ được bộ lọc, vị trí cuộn và hàng đang xem.
- **Lỗi được kiểm khi bấm Lưu**, focus nhảy tới trường lỗi đầu tiên, thông báo nói cách sửa ("Mã KT-TH đã tồn tại. Chọn mã khác.").
- **Mã không sửa được sau khi tạo** vì các hồ sơ khác đang tham chiếu; trường chuyển sang chỉ đọc thay vì ẩn.
- **Nhân bản** mở form với dữ liệu điền sẵn và mã để trống, thay vì tạo ngay một bản sao trùng mã.
- **Hai kiểu trạng thái trống**: "không có kết quả cho bộ lọc này" (gợi ý xoá lọc) khác với "danh mục chưa có dữ liệu" (gợi ý thêm mới).
- **Kết quả thao tác** được đọc qua vùng `role="status"`, không dùng toast tự biến mất.

## Components dùng

`nxt-page-header` · `nxt-card` · `nxt-form-field` + `nxtInput` · `table[nxtTable]` + `nxtSortHeader` · `nxt-checkbox` · `nxt-tag` · `nxtMenuTriggerFor` · `nxt-pagination` · `NxtDrawer` · `nxt-empty-state` · `nxtIconButton` + `nxtTooltip`

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> | Đi qua thanh công cụ → header bảng → từng hàng (checkbox, nút Sửa, nút thêm) → phân trang |
| <kbd>Enter</kbd> trên header cột | Đổi chiều sắp xếp; `aria-sort` cập nhật |
| <kbd>Esc</kbd> trong drawer | Đóng drawer, focus trả về nút đã mở |

- Mỗi hàng có `<th scope="row">` là tên chức danh, nên checkbox và nút thao tác được đọc kèm tên ("Sửa Kế toán tổng hợp").
- Checkbox "chọn tất cả" ở trạng thái `indeterminate` khi chỉ chọn một phần.

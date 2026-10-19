---
title: Danh mục
description: Nhiều danh mục trên một màn — tab, tìm kiếm + bộ lọc, chọn nhiều bằng Shift, nhập/xuất Excel, thêm/sửa trong drawer, hoàn tác.
status: beta
order: 2
keywords:
  - danh muc
  - danh sach
  - bang
  - crud
  - them moi
  - nhap excel
  - xuat excel
  - master data
---

# Danh mục

Mẫu cho nhóm danh mục dùng chung: chức danh, cấp bậc, phòng ban, loại hợp đồng, ca làm việc… Người dùng vào đây để **tìm một bản ghi, sửa nó, hoặc nạp cả danh mục từ Excel**, rồi quay lại việc chính. Bố cục theo [Trang danh sách & danh mục](/patterns/list-page).

::example{template-catalog}

## Thử nhanh

- Gõ "ke toan" (không dấu) vào ô tìm kiếm.
- Mở **Bộ lọc**, chọn Nhóm "Quản lý", bấm **Áp dụng**: nút hiện số tiêu chí, chip hiện dưới toolbar; bấm × trên chip để bỏ.
- Tích một hàng, giữ **Shift** rồi tích hàng thứ năm: cả dải được chọn.
- Bấm icon **Nhập chức danh từ Excel** → "Thử với dữ liệu mẫu" để xem bước kiểm tra lỗi.
- Chuyển sang tab **Ca làm việc** để xem trạng thái chưa có dữ liệu; thu hẹp cửa sổ để thấy tab dồn vào **Xem thêm**.

## Cấu trúc

- **Page header**: breadcrumb, tiêu đề "Danh mục tổ chức" và tab danh mục. Không có nút hành động.
- **Tab**: mỗi danh mục một tab có số đếm. Tab nằm trên toolbar vì nó quyết định toolbar đang làm việc với danh mục nào. Mỗi tab nhớ riêng tìm kiếm, bộ lọc, sắp xếp, trang và lựa chọn.
- **Thanh công cụ**: bên trái ô tìm kiếm và nút **Bộ lọc** (mọi tiêu chí lọc nằm trong panel); bên phải hai nút icon nhập/xuất Excel, vạch ngăn, nút primary **Thêm mới** ngoài cùng.
- **Chip bộ lọc** dưới toolbar khi đang lọc, cuối hàng "Xoá bộ lọc".
- **Thanh hàng loạt** thay toolbar khi có hàng được chọn: Ngừng sử dụng, Dùng lại, Xuất, Xoá, Bỏ chọn, và "Chọn tất cả 29 chức danh" khi đã chọn hết trang.
- **Bảng**: lấp đầy màn hình, chỉ lưới cuộn (dọc và ngang, thanh cuộn trong lưới), header dính, phân trang ghim ở đáy; sắp xếp, cột số căn phải, ô không xuống dòng.
- **Xem chi tiết**: bấm tên hoặc chỗ trống của dòng mở drawer chỉ đọc (thông tin, ràng buộc, lịch sử), nút bản ghi trước/sau (Alt+↑/↓), "Sửa" mở form.

## Quyết định UX

- **"Thêm mới" ở mọi danh mục**: tab đang chọn đã nói đối tượng. Tên truy cập vẫn đủ nghĩa ("Thêm mới chức danh"), drawer có tiêu đề "Thêm chức danh".
- **Nhập/xuất Excel gọn thành hai nút icon** có tooltip ghi rõ đối tượng và phạm vi: "Xuất 7 chức danh đang lọc ra Excel".
- **Nhập theo hai bước**: tải file mẫu, chọn file → xem trước "10 dòng hợp lệ · 3 dòng lỗi" kèm dòng, cột và cách sửa; nhập ngay các dòng hợp lệ.
- **Hoàn tác thay cho hộp xác nhận** khi ngừng sử dụng, xoá hoặc nhập file.
- **Không xoá bản ghi đang được dùng**: chức danh còn nhân viên giữ thì mục xoá bị khoá kèm số lượng; xoá hàng loạt chỉ xoá phần xoá được và báo phần còn lại.
- **Mã không sửa được sau khi tạo**; trường chỉ đọc kèm lý do. **Nhân bản** mở form với dữ liệu điền sẵn và mã để trống.
- **Thêm/sửa trong drawer**, không chuyển trang: người dùng giữ được bộ lọc, vị trí cuộn và hàng đang xem.

## Components dùng

`nxt-page-header` · `nxt-tabs` · `nxt-search` · `nxt-filter` + `nxt-filter-chips` · `table[nxtTable]` + `nxtSortHeader` + `NxtSelection` · `nxt-checkbox` · `nxt-tag` · `nxtMenuTriggerFor` · `nxt-pagination` · `NxtDrawer` · `nxt-empty-state` · `nxtIconButton` + `nxtTooltip`

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>←</kbd> / <kbd>→</kbd> trên tab | Chuyển danh mục (tab không vừa nằm trong "Xem thêm") |
| <kbd>Esc</kbd> trong ô tìm kiếm | Xoá nội dung tìm kiếm |
| <kbd>Enter</kbd> trong panel lọc | Áp dụng bộ lọc; <kbd>Esc</kbd> đóng mà không áp dụng |
| <kbd>Shift</kbd> + <kbd>Space</kbd> / click trên checkbox | Chọn hoặc bỏ chọn cả dải từ hàng vừa chọn |
| <kbd>Enter</kbd> trên header cột | Đổi chiều sắp xếp; `aria-sort` cập nhật |

- Mỗi hàng có `<th scope="row">` là tên, nên checkbox và nút thao tác được đọc kèm tên ("Sửa Kế toán tổng hợp").
- Số kết quả sau khi tìm/lọc và kết quả thao tác được đọc qua `role="status"`; nút "Hoàn tác" nằm ngay trong thông báo.
- Bản demo đọc file `.csv` (Excel: Tệp › Lưu thành › CSV UTF-8); sản phẩm thật nhận `.xlsx` ở máy chủ và hiển thị cùng bước kiểm tra.

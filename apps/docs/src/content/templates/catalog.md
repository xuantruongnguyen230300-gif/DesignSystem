---
title: Danh mục
description: Nhiều danh mục trên một màn — tab, chế độ xem đã lưu, tìm kiếm + bộ lọc, chọn cột, chọn nhiều bằng Shift, nhập/xuất Excel, thêm/sửa trong drawer, hoàn tác.
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
  - che do xem
  - tuy bien cot
---

# Danh mục

Mẫu cho nhóm danh mục dùng chung: chức danh, cấp bậc, phòng ban, loại hợp đồng, ca làm việc… Người dùng vào đây để **tìm một bản ghi, sửa nó, hoặc nạp cả danh mục từ Excel**, rồi quay lại việc chính. Bố cục theo [Trang danh sách & danh mục](/patterns/list-page).

::example{template-catalog}

## Thử nhanh

- Gõ "ke toan" (không dấu) vào ô tìm kiếm.
- Mở **Bộ lọc**, chọn Nhóm "Quản lý", bấm **Áp dụng**: nút hiện số tiêu chí, chip hiện dưới toolbar; bấm × trên chip để bỏ.
- Mở **Chế độ xem** (đầu danh sách), chọn "Nhóm Quản lý đang sử dụng": bộ lọc, sắp xếp đổi một lượt. Gõ vào ô tìm kiếm: nút hiện **Đã sửa**; **Lưu thành chế độ xem mới…** để giữ lại.
- Bấm icon **Cài đặt bảng**: hiện cột "Mô tả", dời "Trạng thái" lên bằng <kbd>Alt</kbd>+<kbd>↑</kbd>, **Áp dụng**. Cuộn ngang: cột chọn và Tên đứng yên.
- Tích một hàng, giữ **Shift** rồi tích hàng thứ năm: cả dải được chọn. Bấm **Ngừng sử dụng** khi trong dải có chức danh đã ngừng: phần không đổi được báo bằng số.
- Mở **Bộ lọc**, chọn Trạng thái "Đang sử dụng", **Áp dụng**; bấm tên một chức danh, **Ngừng sử dụng** trong drawer: hàng ở lại, tô sáng "Không còn khớp bộ lọc" tới lần lọc sau.
- **Thêm mới** một chức danh: sau khi lưu, nó đứng đầu trang 1 với "Mới thêm".
- Bấm icon **Nhập chức danh từ Excel** → "Thử với dữ liệu mẫu" để xem bước kiểm tra lỗi.
- Chuyển sang tab **Ca làm việc** để xem trạng thái chưa có dữ liệu; thu hẹp cửa sổ để thấy tab dồn vào **Xem thêm**.

## Cấu trúc

- **Page header** (trên thanh trên cùng, cùng hàng với tài khoản): breadcrumb và tiêu đề "Danh mục tổ chức". Tab danh mục nằm đầu vùng nội dung. Không có nút hành động, không có mô tả.
- **Tab**: mỗi danh mục một tab có số đếm. Tab nằm trên toolbar vì nó quyết định toolbar đang làm việc với danh mục nào. Mỗi tab nhớ riêng chế độ xem, tìm kiếm, bộ lọc, sắp xếp, cột, trang và lựa chọn.
- **Hàng tiêu đề danh sách**: [Chế độ xem](/components/view-manager) ("Tiêu chuẩn", "Đã sửa" khi lệch, menu Lưu / Lưu thành… / Quản lý…) và số bản ghi đang hiện.
- **Thanh công cụ**: bên trái ô tìm kiếm và nút **Bộ lọc** (mọi tiêu chí lọc nằm trong panel); bên phải nút icon nhập, xuất Excel, **Cài đặt bảng** (chọn cột, cuối nhóm), vạch ngăn, nút primary **Thêm mới** ngoài cùng.
- **Chip bộ lọc** dưới toolbar khi đang lọc, cuối hàng "Xoá bộ lọc".
- **Thanh hàng loạt** thay toolbar khi có hàng được chọn: Ngừng sử dụng, Dùng lại, Xuất, Xoá, Bỏ chọn, và "Chọn tất cả 29 chức danh" khi đã chọn hết trang.
- **Bảng**: lấp đầy màn hình, chỉ lưới cuộn (dọc và ngang, thanh cuộn trong lưới), header dính, phân trang ghim ở đáy; Tên và Mã đứng đầu (khoá, không ẩn được), cột chọn và Tên cố định khi cuộn ngang; sắp xếp, cột số và ngày căn phải, ô không xuống dòng; "Mô tả" ẩn trong mặc định. Hàng đang mở trong drawer có `aria-current`; hàng mới thêm, vừa sửa, không còn khớp bộ lọc được tô sáng kèm chữ. Thao tác của hàng (Sửa, menu ⋯) không chiếm cột: hiện khi hover hoặc Tab tới, ở mép phải phần đang thấy, không phải cuộn ngang; <kbd>Esc</kbd> ẩn đi.
- **Xem chi tiết**: bấm tên hoặc chỗ trống của dòng mở drawer chỉ đọc (thông tin, ràng buộc, lịch sử), nút bản ghi trước/sau (Alt+↑/↓, hàng đang mở đi theo), "Sửa" mở form. Drawer có Nhân bản, Ngừng sử dụng / Dùng lại, Sửa: đường thứ hai luôn nhìn thấy cho các thao tác trong thanh hover.

## Quyết định UX

- **"Thêm mới" ở mọi danh mục**: tab đang chọn đã nói đối tượng. Tên truy cập vẫn đủ nghĩa ("Thêm mới chức danh"), drawer có tiêu đề "Thêm chức danh".
- **Nhập/xuất Excel gọn thành hai nút icon** có tooltip ghi rõ đối tượng và phạm vi: "Xuất 7 chức danh đang lọc ra Excel".
- **Nhập theo hai bước**: tải file mẫu, chọn file → xem trước "10 dòng hợp lệ · 3 dòng lỗi" kèm dòng, cột và cách sửa; nhập ngay các dòng hợp lệ.
- **Hoàn tác thay cho hộp xác nhận** khi ngừng sử dụng, xoá hoặc nhập file.
- **Không xoá bản ghi đang được dùng**: chức danh còn nhân viên giữ thì mục xoá bị khoá kèm số lượng; xoá hàng loạt chỉ xoá phần xoá được và báo phần còn lại.
- **Thao tác hàng loạt xử lý một phần**: "Ngừng sử dụng" chỉ đổi các hàng đang dùng và báo "3/10 chức danh giữ nguyên vì đã ngừng sử dụng từ trước"; nút bị khoá kèm lý do khi không áp được cho hàng nào. Lựa chọn **được giữ** sau thao tác.
- **Lựa chọn theo kết quả**: tìm kiếm, lọc hoặc đổi chế độ xem bỏ chọn các hàng không còn trong kết quả và đọc số hàng đã bỏ; sắp xếp và chuyển trang giữ nguyên.
- **Bản ghi vừa lưu không lạc**: hàng mới thêm, vừa sửa hay vừa nhập đứng đầu trang 1, tô sáng `info`, tới lần sắp xếp/lọc sau; hàng không còn khớp bộ lọc sau khi sửa ở lại (tô sáng `warning`) tới lần lọc sau và được báo qua vùng thông báo.
- **Xuất theo định dạng file mẫu** (mọi cột, kể cả cột đang ẩn) để nhập lại được.
- **Mã không sửa được sau khi tạo**; trường chỉ đọc kèm lý do. **Nhân bản** mở form với dữ liệu điền sẵn và mã để trống.
- **Thêm/sửa trong drawer**, không chuyển trang: người dùng giữ được bộ lọc, vị trí cuộn và hàng đang xem.

## Components dùng

`nxt-page-header` · `nxt-tabs` · `nxt-view-manager` + `NxtViews` · `nxt-search` · `nxt-filter` + `nxt-filter-chips` · `table[nxtTable]` + `nxtSortHeader` + `nxtRowActions` + `NxtSelection` + `NxtColumnsState` + `[nxtTableColumnsFor]` · `nxt-checkbox` · `nxt-tag` · `nxtMenuTriggerFor` · `nxt-pagination` · `NxtDrawer` · `dl[nxtDescriptions]` · `nxt-empty-state` · `nxt-alert` + `nxtLiveRegion` (kết quả thao tác, "Hoàn tác") · `nxtIconButton` + `nxtTooltip`

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>←</kbd> / <kbd>→</kbd> trên tab | Chuyển danh mục (tab không vừa nằm trong "Xem thêm") |
| <kbd>Esc</kbd> trong ô tìm kiếm | Xoá nội dung tìm kiếm |
| <kbd>Enter</kbd> trong panel lọc | Áp dụng bộ lọc; <kbd>Esc</kbd> đóng mà không áp dụng |
| <kbd>Shift</kbd> + <kbd>Space</kbd> / click trên checkbox | Chọn hoặc bỏ chọn cả dải từ hàng vừa chọn |
| <kbd>Enter</kbd> trên header cột | Đổi chiều sắp xếp; `aria-sort` cập nhật |
| <kbd>Enter</kbd> trên "Chế độ xem" | Mở menu chế độ xem; <kbd>↑</kbd>/<kbd>↓</kbd> chọn, <kbd>Enter</kbd> áp dụng |
| <kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd> trong "Cài đặt bảng" | Dời cột đang focus |
| <kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd> trong drawer chi tiết | Bản ghi trước / sau; hàng đang mở đi theo |

- Mỗi hàng có `<th scope="row">` là tên, nên checkbox và nút thao tác được đọc kèm tên ("Sửa Kế toán tổng hợp").
- Số kết quả sau khi tìm/lọc và kết quả thao tác được đọc qua `role="status"`; nút "Hoàn tác" nằm ngay trong thông báo.
- Bản demo đọc file `.csv` (Excel: Tệp › Lưu thành › CSV UTF-8); sản phẩm thật nhận `.xlsx` ở máy chủ và hiển thị cùng bước kiểm tra.

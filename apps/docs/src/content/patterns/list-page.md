---
title: Trang danh sách & danh mục
description: Bố cục chuẩn cho mọi trang danh sách — tiêu đề và Thêm mới, tab phạm vi, toolbar chỉ có tìm kiếm + Bộ lọc, chip bộ lọc, bảng, nhập/xuất Excel.
status: beta
order: 1
keywords:
  - danh sach
  - danh muc
  - list page
  - toolbar
  - bo loc
  - tim kiem
  - nhap excel
  - xuat excel
  - them moi
---

# Trang danh sách & danh mục

Trang danh sách là màn người dùng mở nhiều nhất: tìm một bản ghi, sửa, thêm, xuất báo cáo. Mọi sản phẩm dùng NXT dựng trang danh sách theo **cùng một bố cục**, để người dùng chuyển giữa các phân hệ mà không phải học lại.

::example{template-catalog}

## Bố cục

Từ trên xuống, mỗi vùng một việc:

| # | Vùng | Nội dung | Ghi chú |
|---|------|----------|---------|
| 1 | Page header | Breadcrumb, tiêu đề, mô tả ngắn | **Không** có nút: header chỉ cho biết đang ở đâu và đứng yên khi đổi tab |
| 2 | Tab (khi cần) | Các danh mục / phạm vi dữ liệu cùng nhóm, có số đếm | Nằm **trên** toolbar, vì tab quyết định toolbar đang làm việc với dữ liệu nào |
| 3 | Thanh công cụ | Trái: ô tìm kiếm + nút **Bộ lọc**. Phải: **Nhập**, **Xuất** (hai nút icon), vạch ngăn, **Thêm mới** (primary) ngoài cùng | Khi chọn hàng, thanh thao tác hàng loạt thay chỗ thanh công cụ |
| 4 | Chip bộ lọc | Mỗi tiêu chí đang áp dụng một chip, cuối hàng "Xoá bộ lọc" | Chỉ hiện khi đang lọc |
| 5 | Bảng | Cột mã, tên (tiêu đề hàng), các cột riêng, trạng thái, ngày cập nhật, thao tác | Header dính, sắp xếp, chọn nhiều |
| 6 | Phân trang | "Hiển thị 1–10 trong 29 chức danh", số dòng/trang | |

## Tham khảo thực tế

Bố cục trên tổng hợp từ các hệ thống nghiệp vụ lớn, rồi chọn một phương án cho NXT thay vì để mỗi sản phẩm tự chọn:

| Hệ thống | Cách làm | NXT lấy gì |
|----------|----------|-----------|
| [IBM Carbon](https://carbondesignsystem.com/components/data-table/usage/) | Toolbar của bảng chứa nút chính, tìm kiếm, lọc, cài đặt hiển thị; chọn hàng thì thanh thao tác hàng loạt hiện thay | Thanh hàng loạt thay toolbar; giới hạn số nút trên toolbar |
| [SAP Fiori](https://www.sap.com/design-system/fiori-design-web/v1-120/discover/frameworks/sap-fiori-elements/tables-and-lists/tables-toolbar) | Create và Export to Spreadsheet là hành động chuẩn; dải tóm tắt bộ lọc nằm dưới toolbar, trên tiêu đề cột, chỉ khi đang lọc | Thêm mới + xuất Excel luôn ở cùng chỗ; hàng chip bộ lọc |
| [Salesforce](https://trailhead.salesforce.com/content/learn/modules/lightning-experience-for-salesforce-classic-users/work-with-list-views) | Icon phễu mở panel lọc cạnh danh sách | Một nút Bộ lọc mở panel |
| Microsoft 365 admin | Xuất danh sách người dùng ra CSV ở cạnh ô tìm kiếm | Xuất theo đúng phạm vi đang xem |
| [PatternFly](https://patternfly.org/components/tabs/design-guidelines), ServiceNow, Coloplast | Tab không vừa thì dồn vào menu "More" ở cuối; không cắt chữ nhãn tab | Tab tràn vào "Xem thêm" |

Nghiên cứu về bộ lọc (ví dụ [Baymard](https://baymard.com/learn/ecommerce-filter-ui), [LogRocket](https://blog.logrocket.com/ux-design/filtering-ux-ui-design-patterns-best-practices)) thống nhất ở hai điểm: chip cho bộ lọc đang áp dụng kèm "xoá tất cả", và **không trộn** bộ lọc áp dụng ngay với bộ lọc phải bấm "Áp dụng" trên cùng một màn, vì người dùng không biết thay đổi nào đã có hiệu lực.

## Quyết định của NXT

- **Tìm và lọc chỉ gồm ô tìm kiếm + Bộ lọc** (bên trái thanh công cụ). Mọi tiêu chí lọc (trạng thái, nhóm, phòng ban, thời gian) nằm trong panel của `nxt-filter`, áp dụng bằng "Áp dụng". Toolbar không đổi hình dạng giữa các phân hệ, không tràn trên màn hẹp, và người dùng luôn biết chỗ để lọc. Nút luôn có chữ "Bộ lọc" kèm số tiêu chí đang áp dụng.
- **Tìm kiếm áp dụng ngay**, không phân biệt dấu (`nxtMatches`): "ke toan" tìm ra "Kế toán". Esc xoá nội dung.
- **"Thêm mới"** là nhãn chuẩn của nút tạo, đứng ngoài cùng bên phải thanh công cụ: tiêu đề trang hoặc tab đang chọn đã nói đối tượng. Screen reader đọc đầy đủ nhờ `aria-label="Thêm mới chức danh"`; drawer mở ra có tiêu đề "Thêm chức danh".
- **Nhập / xuất Excel là hai nút icon** trên thanh công cụ, trước "Thêm mới": `file-upload` (mũi tên lên, "Nhập chức danh từ Excel") và `file-download` (mũi tên xuống, "Xuất 29 chức danh ra Excel"). Tooltip và tên truy cập ghi rõ đối tượng và số lượng sẽ xuất.
- **Tab nằm trên toolbar**, ngay dưới tiêu đề. Dùng khi một nhóm danh mục liên quan dùng chung một màn (Chức danh, Cấp bậc, Phòng ban…). Mỗi tab giữ riêng ô tìm kiếm, bộ lọc, sắp xếp, trang và lựa chọn, nên chuyển qua lại không mất gì.

## Nút hành động đặt ở đâu

Có hai cách làm phổ biến:

| Cách | Ai dùng | Hợp khi |
|------|---------|---------|
| Nút trên page header | [Shopify Polaris](https://shopify.dev/docs/apps/build/app-home/migrate-from-polaris-react/page) (primary + secondary actions của Page), Salesforce | Trang chỉ có **một** loại dữ liệu, không có tab |
| Nút trên thanh công cụ ngay trên bảng | [IBM Carbon](https://carbondesignsystem.com/components/data-table/usage/) (toolbar chứa nút chính, tìm, lọc), [SAP Fiori](https://www.sap.com/design-system/fiori-design-web/v1-120/discover/frameworks/sap-fiori-elements/tables-and-lists/tables-toolbar) (Create, Export to Spreadsheet trên table toolbar), [SharePoint / Microsoft 365](https://learn.microsoft.com/en-us/sharepoint/dev/declarative-customization/view-commandbar-formatting) (command bar "New" trên danh sách), [Ant Design ProTable](https://github.com/ant-design/pro-table) (`toolBarRender`), VnResource (quy tắc Danh sách CRUD: header không có nút) | Phần mềm nghiệp vụ, trang có tab hoặc nhiều danh sách |

NXT chọn **thanh công cụ** cho mọi trang danh sách, vì:

- **Đúng phạm vi.** Nút nằm trong vùng dữ liệu nó tác động. Khi trang có tab, nút trên header đứng ngoài tab: đổi tab là "Thêm mới" âm thầm đổi đối tượng sẽ tạo.
- **Gần chỗ nhìn.** Người dùng đang nhìn bảng và thanh tìm kiếm; "Xuất 7 chức danh đang lọc" đứng cạnh ô tìm và Bộ lọc nên phạm vi xuất hiển nhiên.
- **Một quy tắc cho mọi trang.** Trang có tab hay không có tab, nút luôn ở cùng chỗ; header chỉ còn tiêu đề và tab, không nhảy khi đổi tab.

Thứ tự trên thanh công cụ, từ trái sang phải: ô tìm kiếm, Bộ lọc, khoảng trống, Nhập, Xuất, vạch ngăn, **Thêm mới**. Màn hẹp thì nhóm nút xuống dòng; ô tìm kiếm và Thêm mới không bao giờ bị ẩn. Trang **chi tiết** một bản ghi thì khác: hành động (Sửa, Gửi duyệt, Phê duyệt) nằm trên page header của bản ghi đó.

## Tài khoản người dùng

Người dùng đang đăng nhập chỉ xuất hiện **một lần**, ở góc phải thanh trên cùng (avatar + menu: tên và chức vụ, Hồ sơ của tôi, Đăng xuất), giống Windows, Microsoft 365 và SAP Fiori. Không lặp lại ở chân menu trái; chân menu dành cho mục phụ như phiên bản hay chuyển đơn vị.

## Khi có nhiều tab

- Tab không vừa bề ngang được dồn vào menu **"Xem thêm"** ở cuối hàng tab; tab đang chọn luôn hiện. Nhãn tab không bao giờ bị cắt.
- Quá khoảng **7 tab**, hoặc các tab không liên quan với nhau: tách thành mục riêng trong menu trái (cấp 2), mỗi mục một trang có tab của riêng nó. Menu trái tối đa 2 cấp; cấp thứ 3 mới là tab.
- Không dùng tab cho trạng thái của **cùng một danh sách** nếu đó chỉ là một tiêu chí lọc (Đang dùng / Ngừng dùng): đưa vào Bộ lọc. Ngoại lệ là hàng đợi công việc mà người dùng chuyển liên tục ("Chờ tôi duyệt / Đã xử lý"), xem [Phê duyệt](/templates/approval).

## Nhập từ Excel

Hai bước trong drawer:

1. **Chọn file:** tải file mẫu (đúng tên cột), kéo-thả hoặc chọn file. Sai định dạng hay thiếu cột thì báo ngay, nói cách sửa.
2. **Kiểm tra dữ liệu:** "10 dòng hợp lệ · 3 dòng lỗi", bảng lỗi ghi **dòng, cột, lỗi và cách sửa** ("Mã GD-KD đã tồn tại. Đổi mã khác hoặc xoá dòng này."), tải được danh sách lỗi. Nút chính "Nhập 10 dòng" nhập các dòng hợp lệ; các dòng lỗi sửa trong file rồi nhập lại sau.

Sau khi nhập, trang báo kết quả ở vùng `role="status"` kèm nút **Hoàn tác**.

## Xuất ra Excel

- Xuất đúng **những gì đang xem**: theo tìm kiếm và bộ lọc, tất cả các trang (không chỉ trang hiện tại). Tooltip ghi rõ: "Xuất 7 chức danh đang lọc ra Excel".
- Khi đang chọn hàng, thanh hàng loạt có "Xuất 5" để xuất riêng các hàng đã chọn.
- Danh sách lớn (hàng chục nghìn dòng) xuất chạy nền và báo khi xong; không khoá màn hình.

## Thao tác an toàn

- **Hoàn tác thay cho hộp xác nhận** với thao tác đảo ngược được (ngừng sử dụng, xoá bản ghi chưa dùng, nhập file).
- **Không xoá bản ghi đang được dùng** (chức danh còn nhân viên giữ): mục xoá bị khoá kèm lý do, gợi ý "Ngừng sử dụng". Xoá hàng loạt thì xoá phần xoá được và báo rõ phần còn lại.
- Mã không sửa được sau khi tạo vì dữ liệu khác đang tham chiếu; trường chuyển sang chỉ đọc kèm giải thích.

## Cho mọi mức độ người dùng

| Người dùng | Màn hình giúp gì |
|------------|------------------|
| Mới dùng | Nút có chữ ("Bộ lọc", "Thêm mới"); icon luôn có tooltip; empty state nói bước tiếp theo; lỗi nói cách sửa; hoàn tác được |
| Thường xuyên | Chip cho biết đang lọc gì, bỏ từng tiêu chí bằng một cú bấm; mỗi tab nhớ trạng thái riêng; xuất đúng phạm vi đang xem |
| Thành thạo | Bàn phím xuyên suốt (Esc xoá tìm kiếm, Enter áp dụng bộ lọc, ←/→ chuyển tab, ↑/↓ trong danh sách duyệt); **Shift+click** chọn một dải hàng như Gmail và Windows Explorer; "Chọn tất cả 29 chức danh"; mật độ Gọn |

## Trạng thái bắt buộc

| Trạng thái | Nội dung |
|-----------|----------|
| Lần đầu (chưa có dữ liệu) | "Chưa có ca làm việc nào" + "Thêm mới" và "Nhập từ Excel" (thử tab Ca làm việc ở ví dụ trên) |
| Không có kết quả | "Không có chức danh phù hợp" + "Xoá tìm kiếm và bộ lọc" |
| Đang lọc | Chip bộ lọc + số tiêu chí trên nút Bộ lọc + số kết quả được đọc qua `role="status"` |
| Đang chọn | "Đã chọn 5" thay toolbar, các thao tác hàng loạt, "Bỏ chọn" |

## Components dùng

`nxt-page-header` · `nxt-tabs` · `nxt-search` · `nxt-filter` + `nxt-filter-chips` + `NxtFilterState` · `table[nxtTable]` + `nxtSortHeader` + `NxtSelection` · `nxt-checkbox` · `nxt-pagination` · `NxtDrawer` · `nxt-empty-state` · `nxtIconButton` + `nxtTooltip` · `nxtMenuTriggerFor`

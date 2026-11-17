---
title: Trang danh sách & danh mục
description: Bố cục chuẩn cho mọi trang danh sách (List Report) và hàng đợi việc (Worklist) — tiêu đề, tab phạm vi, toolbar tìm kiếm + Bộ lọc, bảng, thao tác hàng loạt, nhập/xuất Excel.
status: beta
order: 1
keywords:
  - danh sach
  - danh muc
  - list page
  - list report
  - worklist
  - hang doi viec
  - che do xem
  - toolbar
  - bo loc
  - tim kiem
  - nhap excel
  - xuat excel
  - them moi
  - thao tac hang loat
---

# Trang danh sách & danh mục

Trang danh sách là màn người dùng mở nhiều nhất: tìm một bản ghi, sửa, thêm, xuất báo cáo. Mọi sản phẩm dùng NXT dựng trang danh sách theo **cùng một bố cục**, để người dùng chuyển giữa các phân hệ mà không phải học lại.

::example{template-catalog}

## Hai loại trang danh sách

Theo SAP Fiori: List Report và Worklist, cùng một bố cục NXT, khác ở việc chính:

| | Trang danh sách (List Report) | Hàng đợi việc (Worklist) |
|-|------------------------------|--------------------------|
| Người dùng cần | Tìm trong tập lớn bằng tìm kiếm, lọc, sắp xếp; thao tác trên bản ghi | Xử lý lần lượt các việc đang chờ mình, quyết định làm việc nào trước |
| Ví dụ | [Danh mục](/templates/catalog), [Quy trình duyệt](/templates/workflow), danh sách nhân viên | [Phê duyệt](/templates/approval), xác nhận chấm công, hồ sơ chờ bổ sung |
| Tab | Danh mục cùng nhóm, hoặc không có | Trạng thái của việc: "Chờ tôi duyệt / Đã xử lý" (mỗi tab có số đếm) |
| Bộ lọc | Đầy đủ, có chế độ xem đã lưu | Gọn (loại việc, đơn vị); thường không cần nhập/xuất |
| Thao tác trên hàng | `nxtRowActions` (`reveal="hover"`) + drawer chi tiết | Hành động nằm ở phần chi tiết; xử lý xong tự sang việc kế tiếp |
| Sau khi xử lý | Hàng ở lại (đã sửa) | Việc rời hàng đợi (sang "Đã xử lý"), báo qua `role="status"` |

## Bố cục

Từ trên xuống, mỗi vùng một việc:

| # | Vùng | Nội dung | Ghi chú |
|---|------|----------|---------|
| 1 | Page header | Breadcrumb, tiêu đề | Nằm trên thanh trên cùng (`placement="topbar"`), cùng hàng với tài khoản, không có mô tả: lưới được thêm chỗ. **Không** có nút: header chỉ cho biết đang ở đâu và đứng yên khi đổi tab |
| 2 | Tab (khi cần) | Các danh mục / phạm vi dữ liệu cùng nhóm, có số đếm | Nằm **trên** toolbar, vì tab quyết định toolbar đang làm việc với dữ liệu nào |
| 3 | Thanh công cụ | Trái: ô tìm kiếm + nút **Bộ lọc**. Phải: nhóm công cụ (Nhập, Xuất, **Cài đặt bảng**), vạch ngăn, **Thêm mới** (primary) ngoài cùng | Khi chọn hàng, thanh thao tác hàng loạt thay chỗ thanh công cụ |
| 4 | Chip bộ lọc | Mỗi tiêu chí đang áp dụng một chip, cuối hàng "Xoá bộ lọc" | Chỉ hiện khi đang lọc |
| 5 | Bảng | Cột định danh (mã, tên) đầu tiên và cố định khi cuộn ngang, các cột riêng, trạng thái, ngày cập nhật | Header dính, sắp xếp, chọn nhiều, tô sáng hàng, hàng đang mở. Thao tác của hàng (Sửa, ⋯) **không chiếm cột**: hiện khi hover hoặc Tab tới, ở mép phải phần đang thấy (`td[nxtRowActions]`) |
| 6 | Phân trang | "Hiển thị 1–10 trong 29 chức danh", số dòng/trang | |

> **Quyết định (2026-11-16, chủ repo):** trang mẫu Danh mục **bỏ** hàng chế độ xem (dropdown "Tiêu chuẩn") và số bản ghi ("29 chức danh") phía trên toolbar; số bản ghi vẫn có ở chân bảng ("Hiển thị 1–10 trong 29 chức danh"). Component [Chế độ xem](/components/view-manager) vẫn còn trong thư viện cho trang nào cần lưu chế độ xem.

### Thứ tự trên thanh công cụ

Từ trái sang phải: **ô tìm kiếm · Bộ lọc** · khoảng trống · **[nghiệp vụ phụ] · Nhập · Xuất · Cài đặt bảng** · vạch ngăn · **Thêm mới**.

- Tìm kiếm và Bộ lọc luôn đứng đầu và không bao giờ bị ẩn; trên bảng không đặt ô tìm thứ hai.
- Nhóm công cụ là nút icon có tooltip; **Cài đặt bảng** (icon `adjustments`, `[nxtTableColumnsFor]`) luôn là nút **cuối** nhóm.
- Thêm mới (primary) ngoài cùng bên phải, sau vạch ngăn. Mỗi vùng tối đa một nút primary.
- Màn hẹp thì nhóm nút xuống dòng; ô tìm kiếm, Bộ lọc và Thêm mới không bao giờ bị ẩn.

## Tham khảo thực tế

Bố cục trên tổng hợp từ các hệ thống nghiệp vụ lớn, rồi chọn một phương án cho NXT thay vì để mỗi sản phẩm tự chọn:

| Hệ thống | Cách làm | NXT lấy gì |
|----------|----------|-----------|
| [IBM Carbon](https://carbondesignsystem.com/components/data-table/usage/) | Toolbar của bảng chứa nút chính, tìm kiếm, lọc, cài đặt hiển thị; chọn hàng thì thanh thao tác hàng loạt hiện thay | Thanh hàng loạt thay toolbar; giới hạn số nút trên toolbar |
| SAP Fiori (List Report, Worklist, Variant Management, Table Personalization) | Chế độ xem đã lưu thay tiêu đề danh sách; nút Settings ở bên phải toolbar của bảng; dải tóm tắt bộ lọc khi đang lọc; xử lý một phần thì báo số mục không làm được và vì sao | Hàng chế độ xem + số bản ghi; Cài đặt bảng cuối nhóm công cụ; chip bộ lọc; luật thao tác hàng loạt |
| [Salesforce](https://trailhead.salesforce.com/content/learn/modules/lightning-experience-for-salesforce-classic-users/work-with-list-views) | Icon phễu mở panel lọc cạnh danh sách; list view đã lưu | Một nút Bộ lọc mở panel |
| Microsoft 365 admin | Xuất danh sách người dùng ra CSV ở cạnh ô tìm kiếm | Xuất theo đúng phạm vi đang xem |
| [PatternFly](https://patternfly.org/components/tabs/design-guidelines), ServiceNow, Coloplast | Tab không vừa thì dồn vào menu "More" ở cuối; không cắt chữ nhãn tab | Tab tràn vào "Xem thêm" |

Nghiên cứu về bộ lọc (ví dụ [Baymard](https://baymard.com/learn/ecommerce-filter-ui), [LogRocket](https://blog.logrocket.com/ux-design/filtering-ux-ui-design-patterns-best-practices)) thống nhất ở hai điểm: chip cho bộ lọc đang áp dụng kèm "xoá tất cả", và **không trộn** bộ lọc áp dụng ngay với bộ lọc phải bấm "Áp dụng" trên cùng một màn, vì người dùng không biết thay đổi nào đã có hiệu lực.

## Quyết định của NXT

- **Tìm và lọc chỉ gồm ô tìm kiếm + Bộ lọc** (bên trái thanh công cụ). Mọi tiêu chí lọc (trạng thái, nhóm, phòng ban, thời gian) nằm trong panel của `nxt-filter`, áp dụng bằng "Áp dụng". Toolbar không đổi hình dạng giữa các phân hệ, không tràn trên màn hẹp, và người dùng luôn biết chỗ để lọc. Nút luôn có chữ "Bộ lọc" kèm số tiêu chí đang áp dụng.
- **Tìm kiếm áp dụng ngay**, không phân biệt dấu (`nxtMatches`): "ke toan" tìm ra "Kế toán". Esc xoá nội dung.
- **Chế độ xem** lưu tìm kiếm + bộ lọc + sắp xếp + cột + số dòng/trang dưới một tên; một chế độ xem cho cả trang (mỗi tab một bộ). Chọn là áp dụng ngay; "Đã sửa" khi màn hình lệch chế độ xem.
- **"Thêm mới"** là nhãn chuẩn của nút tạo, đứng ngoài cùng bên phải thanh công cụ: tiêu đề trang hoặc tab đang chọn đã nói đối tượng. Screen reader đọc đầy đủ nhờ `aria-label="Thêm mới chức danh"`; drawer mở ra có tiêu đề "Thêm chức danh".
- **Nhập / xuất Excel là hai nút icon** trên thanh công cụ, trước "Cài đặt bảng": `file-upload` ("Nhập chức danh từ Excel") và `file-download` ("Xuất 29 chức danh ra Excel"). Tooltip và tên truy cập ghi rõ đối tượng và số lượng sẽ xuất. Hàng đợi việc thường không cần nhập/xuất.
- **Tab nằm trên toolbar**, ngay dưới tiêu đề. Dùng khi một nhóm danh mục liên quan dùng chung một màn (Chức danh, Cấp bậc, Phòng ban…). Mỗi tab giữ riêng ô tìm kiếm, bộ lọc, chế độ xem, sắp xếp, cột, trang và lựa chọn, nên chuyển qua lại không mất gì.

## Nút hành động đặt ở đâu

Có hai cách làm phổ biến:

| Cách | Ai dùng | Hợp khi |
|------|---------|---------|
| Nút trên page header | [Shopify Polaris](https://shopify.dev/docs/apps/build/app-home/migrate-from-polaris-react/page) (primary + secondary actions của Page), Salesforce | Trang chỉ có **một** loại dữ liệu, không có tab |
| Nút trên thanh công cụ ngay trên bảng | [IBM Carbon](https://carbondesignsystem.com/components/data-table/usage/) (toolbar chứa nút chính, tìm, lọc), SAP Fiori (Create, Export to Spreadsheet trên table toolbar), [SharePoint / Microsoft 365](https://learn.microsoft.com/en-us/sharepoint/dev/declarative-customization/view-commandbar-formatting) (command bar "New" trên danh sách), [Ant Design ProTable](https://github.com/ant-design/pro-table) (`toolBarRender`), VnResource (quy tắc Danh sách CRUD: header không có nút) | Phần mềm nghiệp vụ, trang có tab hoặc nhiều danh sách |

NXT chọn **thanh công cụ** cho mọi trang danh sách, vì:

- **Đúng phạm vi.** Nút nằm trong vùng dữ liệu nó tác động. Khi trang có tab, nút trên header đứng ngoài tab: đổi tab là "Thêm mới" âm thầm đổi đối tượng sẽ tạo.
- **Gần chỗ nhìn.** Người dùng đang nhìn bảng và thanh tìm kiếm; "Xuất 7 chức danh đang lọc" đứng cạnh ô tìm và Bộ lọc nên phạm vi xuất hiển nhiên.
- **Một quy tắc cho mọi trang.** Trang có tab hay không có tab, nút luôn ở cùng chỗ; header chỉ còn tiêu đề và tab, không nhảy khi đổi tab.

Trang **chi tiết** một bản ghi thì khác: hành động (Sửa, Gửi duyệt, Phê duyệt) nằm trên page header của bản ghi đó.

## Focus ban đầu

| Trang | Focus khi mở |
|-------|--------------|
| Trang danh sách | Ô tìm kiếm của tab đang chọn (người dùng vào để tìm) |
| Mở từ liên kết đã lọc sẵn (thông báo, dashboard) | Vùng bảng (`nxt-table-scroll`), để đọc ngay kết quả |
| Hàng đợi việc có tab | Tab đang chọn |
| Hàng đợi việc không có tab | Việc đầu tiên trong danh sách |

Trang nhúng trong một khung có sẵn focus (ví dụ preview trong docs) thì không giành focus.

## Lưới lấp đầy màn hình

Trang danh sách vừa khít màn hình: header, tab, thanh công cụ và phân trang đứng yên; **chỉ lưới cuộn**, thanh cuộn dọc và ngang nằm trong lưới, header bảng dính, cột định danh cố định khi cuộn ngang. Người dùng luôn thấy thanh công cụ và phân trang khi đọc tới dòng thứ 50. Dựng bằng `nxtFill` → `nxt-card fill` → `nxt-table-scroll fill` (xem [Table › Lấp đầy màn hình](/components/table#lap-day-man-hinh)). Màn quá thấp thì lưới giữ tối thiểu 240px và cả trang cuộn. Màn chia đôi danh sách | chi tiết (như [Phê duyệt](/templates/approval)) lấp đầy khi đủ rộng, mỗi cột tự cuộn; màn hẹp thì xếp chồng và cuộn cả trang.

## Xem chi tiết từ lưới

- Bấm **tên** (nút trong ô tiêu đề hàng, dùng được bằng bàn phím) hoặc bấm vào **chỗ trống của dòng** để mở drawer xem chi tiết chỉ đọc. Checkbox chỉ chọn; nút trên dòng giữ việc của chúng.
- Trong lúc drawer mở, hàng đó là **hàng đang mở** (`tr[aria-current="true"]`): nền trung tính và dải ở đầu hàng, đi theo khi duyệt bản ghi trước/sau.
- Drawer gồm thông tin (Descriptions), ràng buộc ("Đang được dùng ở 4 hồ sơ: không xoá được"), lịch sử thay đổi, và hành động: Nhân bản, Ngừng sử dụng, **Sửa** (primary) mở form. Đây cũng là **đường thứ hai luôn nhìn thấy** cho mọi thao tác trong thanh hover của hàng.
- Nút **bản ghi trước / sau** (<kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd>) đi theo đúng thứ tự đang xem (tìm kiếm, bộ lọc, sắp xếp), kèm vị trí "10 / 29": duyệt nhanh như Outlook, Jira, không phải đóng mở lại.
- Bản ghi phức tạp (hồ sơ nhân viên, quy trình) mở **trang chi tiết** thay vì drawer; trang chi tiết có hành động trên page header (Lưu, Áp dụng). Drawer khi form dưới khoảng 8 trường chính.

## Sau khi lưu từ drawer

- **Bản ghi mới hoặc vừa sửa hiện ở đầu trang 1**, tô sáng `info` ("Mới thêm" / "Vừa sửa" trong ô định danh), bỏ qua sắp xếp tạm thời, để người dùng không mất dấu thứ mình vừa làm khi đang sắp xếp hay ở trang 5. Hàng trở về đúng chỗ (mất tô sáng) khi người dùng sắp xếp, lọc hoặc tìm lại.
- **Mục không còn khớp bộ lọc sau khi sửa** (đổi trạng thái thành "Ngừng sử dụng" khi đang lọc "Đang sử dụng"): **giữ lại tới lần lọc sau**, tô sáng và báo qua vùng `role="status"` / `nxtLiveRegion`: "“Kế toán thuế” không còn khớp bộ lọc đang dùng; sẽ ẩn ở lần lọc sau." Hàng biến mất ngay sau khi bấm Lưu làm người dùng hoang mang.
- Kết quả được đọc qua `role="status"` kèm "Hoàn tác" khi thao tác đảo ngược được.

## Thao tác hàng loạt

- **Bật** nút khi áp được cho **ít nhất một** hàng đã chọn; **tắt** (kèm lý do qua tooltip, nút vẫn focus được) khi không áp được cho hàng nào: "Các chức danh đã chọn đều đang ngừng sử dụng".
- **Xử lý một phần**: làm phần làm được, báo rõ phần còn lại **bằng số và lý do**: "Đã ngừng sử dụng 7 chức danh. 3/10 chức danh không ngừng được vì đã ngừng từ trước." Thao tác **không** đảo ngược được (duyệt, gửi, chốt công) mà biết trước có mục không đủ điều kiện thì hỏi trước bằng `NxtDialog.confirm()`: "3 trong 20 đơn không duyệt được (đã quá hạn). Duyệt 17 đơn còn lại?" với nút "Duyệt 17 đơn".
- Sau thao tác, **giữ chọn** các hàng vẫn còn trong kết quả, để làm tiếp thao tác thứ hai trên cùng tập.
- Không disable checkbox chọn hàng.
- Lựa chọn khi kết quả đổi (tìm kiếm, lọc, đổi chế độ xem): bỏ chọn các hàng không còn trong kết quả và báo số hàng đã bỏ (xem [Table › Lựa chọn khi kết quả thay đổi](/components/table#lua-chon-khi-ket-qua-thay-doi)).

## Quyền và trạng thái

| Lý do không dùng được | Cách hiện |
|-----------------------|-----------|
| **Thiếu quyền** (người dùng không bao giờ làm được việc này) | **Ẩn** hành động. Không hiện nút để rồi báo "không có quyền" |
| **Sai trạng thái** (bản ghi đang được dùng, đơn đã khoá, chưa chọn hàng nào) | **Disable + lý do**: mục menu "Không xoá được: đang được dùng (4)", tooltip trên nút `aria-disabled` |

## Khi có nhiều tab

- Tab không vừa bề ngang được dồn vào menu **"Xem thêm"** ở cuối hàng tab; tab đang chọn luôn hiện. Nhãn tab không bao giờ bị cắt.
- Quá khoảng **7 tab**, hoặc các tab không liên quan với nhau: tách thành mục riêng trong menu trái (cấp 2), mỗi mục một trang có tab của riêng nó. Menu trái tối đa 2 cấp; cấp thứ 3 mới là tab.
- Không dùng tab cho trạng thái của **cùng một danh sách** nếu đó chỉ là một tiêu chí lọc (Đang dùng / Ngừng dùng): đưa vào Bộ lọc hoặc lưu thành chế độ xem. Ngoại lệ là hàng đợi việc mà người dùng chuyển liên tục ("Chờ tôi duyệt / Đã xử lý"), xem [Phê duyệt](/templates/approval).

## Nhập từ Excel

Hai bước trong drawer:

1. **Chọn file:** tải file mẫu (đúng tên cột), kéo-thả hoặc chọn file. Sai định dạng hay thiếu cột thì báo ngay, nói cách sửa.
2. **Kiểm tra dữ liệu:** "10 dòng hợp lệ · 3 dòng lỗi", bảng lỗi ghi **dòng, cột, lỗi và cách sửa** ("Mã GD-KD đã tồn tại. Đổi mã khác hoặc xoá dòng này."), tải được danh sách lỗi. Nút chính "Nhập 10 dòng" nhập các dòng hợp lệ; các dòng lỗi sửa trong file rồi nhập lại sau.

Sau khi nhập, trang báo kết quả ở vùng `role="status"` kèm nút **Hoàn tác**; các dòng vừa nhập hiện ở đầu bảng, tô sáng `info`.

## Xuất ra Excel

- Xuất đúng **những gì đang xem**: theo tìm kiếm, bộ lọc, **cột đang hiện và thứ tự cột**, tất cả các trang (không chỉ trang hiện tại). Tooltip ghi rõ: "Xuất 7 chức danh đang lọc ra Excel". Ngoại lệ: file xuất để **nhập lại** (danh mục) giữ đúng định dạng file mẫu, đủ mọi cột.
- Khi đang chọn hàng, thanh hàng loạt có "Xuất 5" để xuất riêng các hàng đã chọn.
- Danh sách lớn (hàng chục nghìn dòng) xuất chạy nền và báo khi xong; không khoá màn hình.

## Thao tác an toàn

- **Hoàn tác thay cho hộp xác nhận** với thao tác đảo ngược được (ngừng sử dụng, xoá bản ghi chưa dùng khi máy chủ giữ được bản ghi, nhập file). Xoá vĩnh viễn ở máy chủ thì hỏi bằng `confirm({ tone: 'danger' })`.
- **Không xoá bản ghi đang được dùng** (chức danh còn nhân viên giữ): mục xoá bị khoá kèm lý do, gợi ý "Ngừng sử dụng". Xoá hàng loạt thì xoá phần xoá được và báo rõ phần còn lại.
- Mã không sửa được sau khi tạo vì dữ liệu khác đang tham chiếu; trường chuyển sang chỉ đọc kèm giải thích.

## Cho mọi mức độ người dùng

| Người dùng | Màn hình giúp gì |
|------------|------------------|
| Mới dùng | Nút có chữ ("Bộ lọc", "Thêm mới"); icon luôn có tooltip; empty state nói bước tiếp theo; lỗi nói cách sửa; hoàn tác được; mọi thao tác trong thanh hover đều có ở drawer chi tiết |
| Thường xuyên | Chế độ xem đã lưu, đặt mặc định; chip cho biết đang lọc gì, bỏ từng tiêu chí bằng một cú bấm; mỗi tab nhớ trạng thái riêng; chọn cột; xuất đúng phạm vi đang xem |
| Thành thạo | Bàn phím xuyên suốt (Esc xoá tìm kiếm, Enter áp dụng bộ lọc, ←/→ chuyển tab, ↑/↓ trong danh sách duyệt, Alt+↑/↓ bản ghi trước/sau); **Shift+click** chọn một dải hàng như Gmail và Windows Explorer; "Chọn tất cả 29 chức danh"; mật độ Gọn |

## Trạng thái bắt buộc

| Trạng thái | Nội dung |
|-----------|----------|
| Đang tải lần đầu | Bảng `loading` + hàng giữ chỗ (`tbody[nxtTablePlaceholder]`), "Đang tải…" qua `role="status"`; không spinner che trang |
| Đang tải lại | Hàng cũ mờ, không bấm được; phân trang khoá; bố cục đứng yên |
| Lần đầu (chưa có dữ liệu) | "Chưa có ca làm việc nào" + "Thêm mới" và "Nhập từ Excel" (thử tab Ca làm việc ở ví dụ trên) |
| Không có kết quả | "Không có chức danh phù hợp" + "Xoá tìm kiếm và bộ lọc" |
| Đang lọc | Chip bộ lọc + số tiêu chí trên nút Bộ lọc + số bản ghi ở hàng tiêu đề + số kết quả đọc qua `role="status"` |
| Chế độ xem đã sửa | "Đã sửa" cạnh tên chế độ xem; "Lưu" hoặc "Lưu thành chế độ xem mới…" |
| Đang chọn | "Đã chọn 5" thay toolbar, các thao tác hàng loạt, "Bỏ chọn" |
| Có hàng lỗi | Tô sáng `danger` + chữ lỗi trong hàng; nhiều hàng thì [Alert](/components/alert) tóm tắt phía trên bảng |
| Lỗi tải | [Alert](/components/alert) `danger` thay cho bảng, nói cách thử lại |

## Components dùng

`nxt-page-header` · `nxt-tabs` · `nxt-search` · `nxt-filter` + `nxt-filter-chips` + `NxtFilterState` · `table[nxtTable]` + `nxtSortHeader` + `nxtRowActions` + `NxtSelection` + `NxtColumnsState` + `[nxtTableColumnsFor]` · `nxt-checkbox` · `nxt-pagination` · `NxtDrawer` · `nxt-empty-state` · `nxt-alert` + `nxtLiveRegion` · `nxtIconButton` + `nxtTooltip` · `nxtMenuTriggerFor`

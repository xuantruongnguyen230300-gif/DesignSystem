---
title: Quy trình duyệt
description: Cấu hình ai duyệt từng loại đơn — các bước theo thứ tự, người duyệt, điều kiện, thời hạn — mô phỏng trước khi áp dụng, có phiên bản cho đơn đang chờ.
status: beta
order: 4
keywords:
  - quy trinh duyet
  - luong duyet
  - cau hinh phe duyet
  - buoc duyet
  - nguoi duyet
  - dieu kien
  - thoi han
  - phien ban
  - mo phong
  - workflow
  - approval workflow
---

# Quy trình duyệt

Quy định duyệt đơn thay đổi thường xuyên: công ty lập khối mới, đổi người ký tạm ứng, thêm bước giám đốc cho đơn nghỉ dài ngày. Mẫu này để **quản trị viên nhân sự tự sửa luồng duyệt mà không cần nhờ bộ phận CNTT**: chọn ai duyệt ở từng bước, theo thứ tự nào, trong bao lâu, khi nào thì bỏ qua một bước, rồi thử với một đơn giả định trước khi áp dụng.

Màn có hai phần: **danh sách quy trình** theo đúng [Trang danh sách & danh mục](/patterns/list-page), và **trình sửa** một quy trình (trang chi tiết, hành động nằm trên page header). Kết quả của nó là luồng mà màn [Phê duyệt](/templates/approval) hiển thị cho người duyệt.

::example{template-workflow}

## Thử nhanh

- Gõ "tam ung" (không dấu) vào ô tìm kiếm; mở **Bộ lọc**, chọn Trạng thái "Bản nháp" rồi **Áp dụng**.
- Mở "Nghỉ phép · toàn công ty". Ở **Mô phỏng**, đổi Số ngày nghỉ từ 2 lên 5: bước "Trưởng phòng duyệt" chuyển từ "Bỏ qua" sang có trong đường đi, tổng thời hạn cập nhật ngay.
- Chọn bước 3, đổi **Người duyệt** sang "Người cụ thể" nhưng không chọn người, rồi bấm **Áp dụng**: focus nhảy vào ô cần sửa, bước 3 được đánh dấu "Bước 3 cần chọn người duyệt".
- Chọn người, bấm **Áp dụng**: phiên bản tăng lên 4, thông báo "Đơn đang chờ duyệt vẫn đi theo phiên bản 3".
- Bấm **Thêm bước** giữa hai bước, rồi **Xoá bước** đó và **Hoàn tác**. Sửa gì đó rồi bấm **Quay lại danh sách** để thấy cảnh báo "Có thay đổi chưa lưu".
- Thu hẹp cửa sổ: hai cột xếp chồng và cả trang cuộn; màn rộng thì mỗi cột tự cuộn.

## Cấu trúc

**Danh sách**

- **Page header**: breadcrumb Thiết lập › Quy trình duyệt, tiêu đề, mô tả. Không có nút.
- **Thanh công cụ**: ô tìm kiếm (tên quy trình, loại đơn, phạm vi) và **Bộ lọc** (Trạng thái, Loại đơn) bên trái; **Thêm mới** bên phải. Chip bộ lọc bên dưới khi đang lọc.
- **Bảng**: Tên quy trình (mở trình sửa, bấm cả hàng cũng được), Loại đơn, Phạm vi áp dụng, Số bước, Tổng thời hạn, Trạng thái, Phiên bản ("v3 · có bản nháp"), Cập nhật; cuối hàng là **Sửa** và menu ⋯ (Nhân bản, Ngừng áp dụng / Áp dụng lại, Xoá).

**Trình sửa**

- **Page header**: breadcrumb tới tên quy trình, trạng thái, phiên bản, nhãn "Có thay đổi chưa lưu"; hành động **Quay lại danh sách**, **Lưu nháp**, **Áp dụng** (primary).
- **Thông tin chung** (`dl nxtDescriptions`): Loại đơn, Phạm vi áp dụng, Phiên bản đang áp dụng, Cập nhật; "Sửa thông tin chung" mở ba trường tại chỗ.
- **Các bước duyệt** (cột trái): Người gửi đơn → các bước theo thứ tự → Hoàn tất. Mỗi bước là một nút chọn, ghi số thứ tự, tên, người duyệt, cách duyệt, thời hạn và hành động khi quá hạn, chip điều kiện ("Chỉ khi số ngày nghỉ > 3"). Bên cạnh có Đưa lên, Đưa xuống, Xoá; giữa các bước là **Thêm bước**.
- **Thiết lập bước N** (cột phải): Tên bước, Người duyệt (Quản lý trực tiếp, Trưởng phòng, Giám đốc khối, Phòng Nhân sự, Người cụ thể), Cách duyệt (Một người là đủ / Tất cả cùng duyệt), Thời hạn xử lý và Khi quá hạn, Điều kiện, Quyền của người duyệt.
- **Mô phỏng**: nhập số liệu của một đơn giả định (số ngày nghỉ, số giờ tăng ca, số tiền… tuỳ loại đơn) và phòng ban người gửi; `nxt-timeline` cho thấy bước nào áp dụng, ai duyệt, bước nào bị bỏ qua và tổng thời hạn tối đa.

## Quyết định UX

- **Đơn đang chờ giữ phiên bản cũ.** "Áp dụng" tạo phiên bản mới cho đơn gửi từ lúc đó; đơn đã gửi vẫn đi hết theo phiên bản nó bắt đầu, nên không có đơn nào đổi người duyệt giữa chừng. Thông báo nói rõ điều này ("Đã áp dụng phiên bản 4. Đơn đang chờ duyệt vẫn đi theo phiên bản 3."). Ngừng áp dụng cũng chỉ chặn đơn mới.
- **Lưu nháp không làm thay đổi gì đang chạy.** Quy trình chưa áp dụng lần nào thì là "Bản nháp"; quy trình đang áp dụng thì giữ nguyên phiên bản hiện hành và cất bản nháp riêng, mở lại là sửa tiếp bản nháp đó.
- **Điều kiện theo số liệu của loại đơn.** Đơn nghỉ phép chỉ điều kiện được theo số ngày nghỉ, tạm ứng theo số tiền; loại đơn không có số liệu (Thay đổi thông tin) thì ô điều kiện bị khoá kèm lý do. Không thoả điều kiện thì đơn bỏ qua bước đó, không bị kẹt.
- **Mô phỏng trước khi áp dụng.** Người cấu hình thấy ngay đơn 2 ngày đi qua những ai và mất tối đa bao lâu, thay vì phát hiện sai khi đơn thật đã gửi. Mô phỏng cập nhật theo từng thay đổi, kể cả thay đổi chưa lưu.
- **Không có thao tác chỉ kéo-thả.** Thứ tự bước đổi bằng nút "Đưa bước 2 lên/xuống" có tên đầy đủ, dùng được bằng bàn phím và trình đọc màn hình (WCAG 2.5.7). Sản phẩm có thể thêm kéo-thả, nhưng chỉ như đường tắt.
- **Hoàn tác thay cho hộp xác nhận** khi xoá bước, ngừng áp dụng hay xoá quy trình. Quy trình đang áp dụng không xoá được (mục xoá bị khoá kèm lý do): ngừng áp dụng trước.
- **Lỗi kiểm khi bấm "Áp dụng"**, không chặn người dùng giữa chừng. Lỗi nằm cạnh trường, focus vào trường lỗi đầu tiên, và bước có lỗi được đánh dấu bằng chữ trong danh sách ("Bước 3 cần chọn người duyệt"), không chỉ bằng viền đỏ.
- **Rời trang khi còn thay đổi chưa lưu** hiện cảnh báo ngay dưới header với ba lựa chọn: Lưu nháp, Bỏ thay đổi, Ở lại. "Thêm mới" và "Nhân bản" chỉ tạo bản ghi khi người dùng lưu, nên mở ra rồi quay lại không để lại bản nháp rác.
- **Tên bước tự đặt theo người duyệt** ("Trưởng phòng duyệt") cho đến khi người dùng tự gõ tên khác.
- **Bố cục theo bề rộng của chính trình sửa**: đủ rộng thì hai cột lấp đầy màn hình và mỗi cột tự cuộn; hẹp thì xếp chồng và cả trang cuộn.

## Components dùng

`nxt-page-header` (`nxtPageMeta`, `nxtPageActions`) · `nxt-search` · `nxt-filter` + `nxt-filter-chips` + `NxtFilterState` · `table[nxtTable]` + `nxtSortHeader` + `nxt-table-scroll` · `nxt-card` · `nxtFill` · `nxt-grid` + `nxtSpan` · `dl[nxtDescriptions]` · `nxt-form-field` + `nxtInput` · `nxt-segmented` · `nxt-checkbox` · `nxt-timeline` · `nxt-tag` · `nxtMenuTriggerFor` · `nxt-empty-state` · `nxtIconButton` + `nxtTooltip`

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> | Đi qua từng bước (nút chọn bước), các nút Đưa lên/Đưa xuống/Xoá của bước, nút Thêm bước, rồi sang form của bước đang chọn |
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên một bước | Chọn bước để sửa ở cột bên cạnh; bước đang sửa có `aria-current="step"` |
| <kbd>Enter</kbd> trên "Đưa bước 2 lên" | Đổi thứ tự; focus ở lại đúng nút của bước vừa chuyển, kết quả đọc qua `role="status"` |
| <kbd>←</kbd> / <kbd>→</kbd> trong Cách duyệt | Chọn "Một người là đủ" / "Tất cả cùng duyệt" (radio gốc của trình duyệt) |
| <kbd>Esc</kbd> trong cảnh báo rời trang | Ở lại trang, focus về "Quay lại danh sách" |
| <kbd>Esc</kbd> trong ô tìm kiếm | Xoá nội dung tìm kiếm |

- Mở trình sửa thì focus đặt lên tiêu đề trang (quy trình mới: ô Tên quy trình); quay lại danh sách thì focus về đúng tên quy trình vừa mở.
- Nút icon luôn có tên đầy đủ kèm số bước ("Xoá bước 2") và tooltip; nút bị khoá vẫn focus được và nói lý do ("Không xoá được: quy trình cần ít nhất một bước").
- Hai cột khi tự cuộn là vùng có tên ("Các bước duyệt", "Thiết lập bước và mô phỏng") và nhận focus để cuộn bằng bàn phím.
- Kết quả mô phỏng ("Đơn này qua 2/3 bước · tổng thời hạn tối đa 32 giờ") được đọc qua `role="status"` khi số liệu thay đổi.
- Trạng thái và lỗi luôn có chữ; chấm màu và viền đỏ chỉ là phụ.

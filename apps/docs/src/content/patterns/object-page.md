---
title: Trang chi tiết đối tượng
description: Khuôn xem, sửa, tạo một đối tượng có nhiều phần — topbar là hàng tiêu đề, khối tóm tắt co lại khi cuộn, thanh neo hoặc tab, cùng bố cục giữa xem và sửa, Huỷ / Lưu ở thanh chân dính, bản nháp và sửa đồng thời.
status: beta
order: 2
keywords:
  - trang chi tiet
  - chi tiet doi tuong
  - object page
  - ho so
  - che do xem
  - che do sua
  - che do tao
  - sua mot phan
  - ban nhap
  - sua dong thoi
  - xung dot
  - khoa ban ghi
  - xoa
  - thanh neo
  - header co gon
---

# Trang chi tiết đối tượng

**Bài toán:** "Chuyên viên nhân sự cần tra và cập nhật hồ sơ của từng nhân viên, vài chục hồ sơ mỗi ngày, mỗi lần chỉ đổi vài trường." Người dùng cần biết ngay đang xem ai, nhảy thẳng tới phần cần (hợp đồng, lịch sử), sửa mà không mất định hướng, và không bao giờ mất thay đổi chưa lưu.

Khuôn này theo **Object Page** của SAP Fiori, đặt trên nền Dynamic Page. Dựng bằng [Object page](/components/object-page); mẫu đầy đủ: [Hồ sơ nhân viên](/templates/object). Chọn khuôn nào cho việc nào: [Chọn khuôn trang](/patterns/floorplans).

::example{template-object}

## Anatomy

| # | Vùng | Nội dung | Ghi chú |
|---|------|----------|---------|
| 1 | Topbar = hàng tiêu đề | Breadcrumb, tiêu đề (tên hoặc mã đối tượng), tag trạng thái, hành động **không kết thúc** (⋯, **Sửa**) | `nxt-page-header placement="topbar"`. Đây là hàng tiêu đề **thu gọn vĩnh viễn** của Dynamic Page: luôn hiện, không co giãn |
| 2 | Thông báo cấp đối tượng | Tối đa **một** `nxt-alert` liên quan cả đối tượng ("Hồ sơ đang chờ duyệt thay đổi lương") | Ngay dưới topbar, không xếp chồng. Kết quả thao tác đọc qua `role="status"` |
| 3 | Khối tóm tắt (header nội dung) | Avatar (tối đa một), phụ đề (chức danh · phòng ban), 3–5 cặp nhãn–giá trị chính, KPI nhỏ | `[nxtObjectPageHeader]`. Chỉ để đặt ngữ cảnh, **không** chứa ô nhập |
| 4 | Thanh neo hoặc tab | Một mục mỗi section; nút thu gọn, nút ghim | Dính mép trên vùng cuộn; ẩn khi chỉ có một section |
| 5 | Section | Tiêu đề `h2`, hành động cùng hàng, khối con `h3`, nội dung | Mỗi section một chủ đề: Thông tin chung, Công việc, Hợp đồng, Lịch sử |
| 6 | Thanh chân | Trái: chỉ báo (bản nháp, số lỗi). Phải: **Huỷ**, **Lưu** | Chỉ khi sửa / tạo (hoặc khi phải xem hết mới quyết định: Duyệt / Từ chối). Dính đáy |

**Topbar giữ gì, nội dung giữ gì.** Topbar: tiêu đề, breadcrumb, trạng thái, hành động không kết thúc. Đầu nội dung: tóm tắt, thông báo cấp đối tượng, thanh neo / tab. Đáy: hành động kết thúc (Lưu, Tạo, Gửi duyệt). Hành động kết thúc **không** đặt trên topbar: dưới 1024px page header về lại trong trang và cuộn mất, còn thanh chân thì luôn thấy.

## Header co gọn

- Khối tóm tắt nằm trong luồng ở đầu trang, **cuộn đi cùng nội dung**. Khi đã khuất, thanh neo dính lại và hiện một dòng tóm tắt gọn (`[nxtObjectPageSummary]`: avatar nhỏ + "NV-00123 · Trưởng nhóm Kế toán tổng hợp"). Cuộn về đầu thì khối tóm tắt hiện lại. Không thu nhỏ chữ hay chiều cao bằng animation.
- Nút **thu gọn / mở rộng** ẩn hẳn khối tóm tắt; mở rộng khi đang cuộn thì khối tóm tắt hiện tạm ở trên cùng, không đưa người dùng về đầu trang.
- **Ghim** chỉ cho khối tóm tắt ngắn (không quá 60% vùng cuộn) và màn từ 768px trở lên. Thu gọn thắng ghim.
- Khối tóm tắt nhỏ là tốt: không có gì quan trọng thì bỏ hẳn (chỉ còn topbar), chuyển thông tin vào section "Thông tin chung".

## Thanh neo, tab và section

| | Thanh neo (mặc định) | Tab |
|--|---------------------|-----|
| Hiển thị | Mọi section xếp liền, cuộn một mạch | Mỗi lần một section |
| Dùng khi | Đọc liền từ trên xuống, section vừa phải, ≤ 4 bảng | Section nặng: bảng > 20 dòng, nhiều bảng, mỗi phần là một chủ đề riêng |
| Bàn phím | Mỗi neo một điểm dừng Tab; Enter cuộn tới và focus tiêu đề section | APG tabs: một điểm dừng, ←/→ chọn |

- **Một tiêu đề cho mỗi section** (`h2`); khối con (`h3`) chỉ để gọi tên các khối khác nhau trong section. Section chỉ có một khối thì không thêm khối con. Section chỉ có một bảng thì bảng mang tên section.
- **Bảng con trong trang chi tiết**: ≤ 20 dòng hiện hết; đến khoảng 100 dòng tải dần bằng "Xem thêm"; nhiều hơn thì hiện 10 dòng đầu + "Xem tất cả (x)" ở hàng tiêu đề section, mở trang danh sách đã lọc sẵn.
- Không dùng khối gập (accordion) trong section; phần ít dùng ẩn sau "Xem thêm".
- Section tải chậm (gọi dịch vụ khác) có skeleton riêng và `busy`; phần còn lại của trang dùng được ngay.

## Xem, sửa, tạo

**Một bố cục cho cả ba chế độ.** Topbar, khối tóm tắt, thanh neo và thứ tự section giữ nguyên; chỉ nội dung section đổi từ `dl nxtDescriptions` sang `nxt-form-field`. Trường không sửa được ở đây vẫn hiện, chỉ đọc, kèm lý do ("Ngày vào làm gắn với hợp đồng đầu tiên").

| | Xem | Sửa | Tạo |
|--|-----|-----|-----|
| Tiêu đề | Tên / mã | Giữ nguyên tên / mã | "Nhân viên mới" cho tới khi có tên |
| Topbar | ⋯ + **Sửa** (primary) | Không có hành động | Không có hành động |
| Thanh chân | Không có | "Bản nháp · đã lưu lúc 14:32" · **Huỷ** · **Lưu** | **Huỷ** · **Tạo hồ sơ** |
| Focus ban đầu | Tiêu đề trang | Trường bắt buộc còn trống đầu tiên, không có thì trường sửa được đầu tiên | Như sửa (thường là Họ và tên) |
| Sau khi xong | — | Về chế độ xem + thông báo "Đã lưu thay đổi hồ sơ …" (Hoàn tác), focus về tiêu đề | Chế độ xem của bản ghi mới + "Đã tạo hồ sơ NV-00186 · …" |

- **Khối tóm tắt không sửa tại chỗ** (nó co lại khi cuộn). Sửa toàn trang thì trường của khối tóm tắt nằm trong section đầu.
- **Lỗi kiểm khi bấm Lưu**: lỗi cạnh trường, focus vào trường lỗi đầu tiên, thanh chân đếm "2 trường cần sửa". Thanh neo và thanh chân không được che trường đang focus.
- **Nút kết thúc**: "Lưu" khi sửa, "Tạo hồ sơ" khi tạo, "Lưu và gửi duyệt" khi phải lưu trước rồi gửi. Primary ở cuối, Huỷ ngay trước.

### Sửa toàn bộ hay sửa một phần

| Cách | Khi nào | Cách làm |
|------|---------|----------|
| Sửa toàn bộ | Một người chịu trách nhiệm cả hồ sơ, sửa nhiều phần một lúc | **Sửa** trên topbar; cả trang vào chế độ sửa; một thanh chân Huỷ / Lưu |
| Sửa một phần | Chỉ vài trường sửa được (nhân viên tự sửa số điện thoại, địa chỉ); các phần khác do nhóm khác quản lý | Nút **Sửa** (ghost) ở hàng tiêu đề của section (`[nxtSectionActions]`); section đó đổi thành form với **Huỷ** + **Lưu** riêng ở cuối section; không có thanh chân |
| Sửa trong hộp thoại / drawer | Mục con dưới khoảng 8 trường (một dòng phụ cấp, một người phụ thuộc) | Nút trên hàng hoặc trên thanh công cụ của bảng con; Huỷ là bỏ, không cần hỏi |

Một đối tượng chỉ dùng **một** cách sửa toàn bộ / một phần, không trộn. Sửa một phần mà đã có thay đổi thì Huỷ hoặc rời trang vẫn phải hỏi.

## Bản nháp và sửa đồng thời

- **Rời trang khi còn thay đổi** (breadcrumb, menu trái, nút quay lại): hộp thoại "Rời trang khi chưa lưu?" với **Lưu thay đổi** · **Bỏ thay đổi** · **Ở lại** (<kbd>Esc</kbd>). Đóng tab / tải lại trang: chỉ hộp hỏi gốc của trình duyệt (`beforeunload`) làm được. Trong ứng dụng có router, đặt kiểm tra này ở `CanDeactivate`.
- **Huỷ khi có thay đổi**: "Bỏ mọi thay đổi?" → **Bỏ thay đổi** / **Tiếp tục sửa**; không có thay đổi thì thoát ngay, không hỏi. Tạo mới: "Bỏ hồ sơ đang tạo?".
- **Chỉ báo bản nháp** ở thanh chân, cạnh nút kết thúc: "Bản nháp · đã lưu lúc 14:32". Sản phẩm có bản nháp phía máy chủ thì mở lại là sửa tiếp; không có thì ghi "Chưa lưu".
- **Trạng thái sửa không ghi đè trạng thái nghiệp vụ**: tag "Đang được sửa" / "Bản nháp" đứng riêng cạnh tag "Đang làm việc", không thay nó.

Mẫu câu khi nhiều người cùng sửa một bản ghi:

| Tình huống | Hiển thị | Mẫu câu |
|-----------|----------|---------|
| Lưu khi bản ghi đã bị người khác cập nhật | Hộp thoại lỗi, một nút | "Không lưu được hồ sơ “Nguyễn Thị Ngọc Diệp”: Trần Văn Bình đã cập nhật lúc 14:20. Tải lại để xem bản mới; thay đổi của bạn chưa được lưu." — nút **Tải lại hồ sơ** |
| Mở sửa khi người khác đang có thay đổi chưa lưu | Hộp thoại cảnh báo | "Phạm Thị Lan đang sửa hồ sơ này từ 13:05 và chưa lưu. Nếu bạn sửa tiếp, các thay đổi đó sẽ mất." — **Vẫn sửa** / **Huỷ** |
| Bản ghi đang bị khoá | Nút Sửa bị khoá, tooltip nêu lý do | "Đang được Phạm Thị Lan sửa (từ 13:05)." |
| Không biết tên người sửa | Như trên | Thay tên bằng "người khác" |
| Bản ghi không còn tồn tại (mở từ link cũ) | [Empty state](/components/empty-state) thay cả trang | "Hồ sơ “NV-00123” không còn tồn tại." + **Về danh sách nhân viên** |

## Hành động trên đối tượng

- **Topbar**: hành động nghiệp vụ là nút chữ ("Sửa", "Gửi duyệt"); hành động chung (in, chia sẻ) là nút icon có tooltip; tối đa **một** primary; còn lại vào menu ⋯ ("Nhân bản", "Ngừng làm việc…"). Thứ tự NXT: primary ở cuối (phải).
- **Nhân bản** mở chế độ tạo với phần công việc đã chép, phần cá nhân để trống; chỉ tạo bản ghi khi bấm "Tạo hồ sơ" (không để bản nháp rác).
- **Xoá** chỉ có ở chế độ xem (không ai vừa sửa vừa xoá). Bấm **Xoá** → [Dialog](/components/dialog) xác nhận nêu đúng đối tượng ("Xoá hồ sơ Nguyễn Thị Ngọc Diệp?") vì xoá ở máy chủ không hoàn tác được → **quay về danh sách**, [Toast](/components/toast) "Đã xoá hồ sơ Nguyễn Thị Ngọc Diệp." ở danh sách. Huỷ thì ở lại, chế độ xem. Nếu máy chủ có xoá mềm thì bỏ hộp xác nhận, toast có **Hoàn tác**.
- Thao tác ảnh hưởng ra ngoài trang (ngừng làm việc khoá tài khoản, gửi thông báo) hỏi trước và nêu hệ quả; thao tác đảo ngược được ngay trong trang thì làm luôn kèm **Hoàn tác**.

## Trạng thái bắt buộc

| Trạng thái | Nội dung |
|-----------|----------|
| Đang tải lần đầu | Tiêu đề trên topbar (nếu đã biết), thanh neo thật; khối tóm tắt và section là [Skeleton](/components/skeleton) đúng hình; `busy` trên section; "Đang tải hồ sơ…" qua `role="status"`. Dưới 1 giây không hiện gì |
| Tải lại | Giữ dữ liệu cũ trong 1 giây đầu, sau đó skeleton |
| Section rỗng | Một câu nói vì sao và làm gì: "Chưa có hợp đồng. Lập hợp đồng ở phân hệ Hợp đồng lao động." |
| Không có quyền xem một phần | Ẩn section khi không có quyền; khoá nút kèm lý do khi sai trạng thái ("Hồ sơ đã nghỉ việc: không sửa được") |
| Lỗi tải một phần | `nxt-alert` đầu section + "Thử lại"; các phần khác vẫn dùng được |
| Không còn tồn tại | Empty state cả trang + về danh sách |

## Phím tắt

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> | Topbar → thanh neo → nội dung → thanh chân |
| <kbd>Enter</kbd> trên neo | Cuộn tới section, focus tiêu đề section |
| <kbd>←</kbd> / <kbd>→</kbd> trên neo | Chuyển neo |
| <kbd>Esc</kbd> trong hộp thoại Huỷ / rời trang | Ở lại, tiếp tục sửa |
| <kbd>Alt</kbd>+<kbd>↑</kbd> / <kbd>↓</kbd> (khi mở từ danh sách) | Bản ghi trước / sau theo thứ tự của danh sách (như [drawer chi tiết](/patterns/list-page)) |

## Responsive

- Từ 1024px: tiêu đề và hành động trên topbar; khối tóm tắt xếp ngang, tự xuống dòng, không cắt chữ.
- Dưới 1024px: page header về lại đầu trang (cuộn đi), nên **hành động kết thúc phải ở thanh chân dính**.
- Dưới 768px: không ghim; thanh neo cuộn ngang, neo hiện tại tự vào tầm nhìn; form một cột.

## Components dùng

[Object page](/components/object-page) · [Page header](/components/page-header) · [Descriptions](/components/descriptions) · [Form field](/components/form-field) · [Table](/components/table) · [Timeline](/components/timeline) · [Skeleton](/components/skeleton) · [Tag](/components/tag) · [Avatar](/components/avatar) · [Menu](/components/menu) · [Alert](/components/alert) · [Dialog](/components/dialog) · [Toast](/components/toast) · [Empty state](/components/empty-state)

---
title: Object page
description: Khuôn trang chi tiết một đối tượng có nhiều phần (hồ sơ, hợp đồng, đơn) — khối tóm tắt co lại khi cuộn, thanh neo theo phần đang xem hoặc tab, thanh chân dính đáy cho Huỷ / Lưu.
status: beta
group: Bố cục
order: 13
package: "@nxt/ui/object-page"
keywords:
  - object page
  - trang chi tiet
  - chi tiet doi tuong
  - ho so
  - ho so nhan vien
  - thanh neo
  - anchor
  - scroll spy
  - section
  - header co gon
  - ghim
  - thanh chan
  - footer
  - dynamic page
---

# Object page

`nxt-object-page` dựng phần thân của trang chi tiết **một** đối tượng: khối tóm tắt ở đầu (avatar, phụ đề, các thông tin chính, trạng thái), thanh neo dính để nhảy giữa các phần, các section, và một khe chân trang dính đáy cho hành động kết thúc. Tiêu đề, breadcrumb, tag trạng thái và nút Sửa nằm trên thanh trên cùng qua [Page header](/components/page-header) `placement="topbar"`.

## Khi nào dùng

- Xem và sửa một đối tượng có từ hai phần trở lên: hồ sơ nhân viên, hợp đồng lao động, quyết định điều chuyển.
- Cần đặt ngữ cảnh trước khi đọc: ai, mã gì, thuộc phòng nào, đang ở trạng thái nào.
- Chế độ xem và chế độ sửa trên **cùng bố cục** (xem pattern [Trang chi tiết đối tượng](/patterns/object-page)).

## Khi nào không dùng

- **Tìm và thao tác trên nhiều bản ghi**: [Trang danh sách & danh mục](/patterns/list-page).
- **Bản ghi phẳng, khoảng 8 trường trở xuống**: xem và sửa trong [Drawer](/components/drawer) hoặc [Dialog](/components/dialog).
- **Duyệt lần lượt một hàng đợi** (xem rồi quyết định, sang mục kế): bố cục danh sách | chi tiết như [Phê duyệt](/templates/approval).
- **Trang chỉ có một phần và không có gì để tóm tắt**: [Page header](/components/page-header) + nội dung thường.
- **Chia phần trong một vùng nhỏ** (trong thẻ, trong drawer): [Tabs](/components/tabs).

## Thanh neo và header co gọn

Mặc định mọi section xếp liền nhau, trang cuộn một mạch (theo SAP Fiori). Thanh neo dính ở mép trên vùng cuộn; neo của phần đang đọc được đánh dấu khi cuộn. Bấm một neo thì trang cuộn tới phần đó và focus nhảy lên tiêu đề của phần.

::example{object-page-anchors}

- **Topbar là hàng tiêu đề thu gọn vĩnh viễn.** Trên Fiori, hàng tiêu đề luôn hiện còn phần header nội dung co lại khi cuộn. NXT đặt hàng tiêu đề lên topbar, nên `nxt-object-page` chỉ giữ phần header nội dung (`[nxtObjectPageHeader]`).
- **Co lại khi cuộn:** khối tóm tắt cuộn đi cùng nội dung. Khi đã khuất hẳn, thanh dính hiện một dòng tóm tắt gọn (`[nxtObjectPageSummary]`) để người dùng vẫn biết đang xem ai. Cuộn về đầu thì khối tóm tắt hiện lại.
- **Thu gọn / mở rộng** (nút ⌃ ở cuối thanh dính): ẩn hẳn khối tóm tắt để có thêm chỗ. Bấm mở rộng khi đã cuộn xuống: khối tóm tắt hiện tạm ở trên cùng, không cuộn mất chỗ đang đọc; cuộn tiếp là nó lại đi.
- **Ghim** (`pinnable`): giữ khối tóm tắt và thanh neo đứng yên khi cuộn, hợp khi cần vừa nhìn tóm tắt vừa đọc chi tiết. Không ghim được khi khối tóm tắt cao hơn 60% vùng cuộn hoặc trang hẹp hơn 768px.
- Khối tóm tắt chỉ chứa thông tin đặt ngữ cảnh (tối đa khoảng 5 cặp nhãn–giá trị, một avatar), **không** chứa ô nhập: nó co lại khi cuộn nên không phải chỗ để sửa.
- Thanh neo ẩn khi trang chỉ có một section.

## Chế độ tab

`navigation="tabs"` hiện mỗi lần một section, cho các phần nặng (bảng dài, nhiều bảng). Tab nằm đúng chỗ của thanh neo, cùng hình.

::example{object-page-tabs}

- Section chỉ được dựng khi mở lần đầu, sau đó giữ lại: chữ đang nhập không mất khi chuyển tab.
- Tiêu đề `h2` của section vẫn có cho trình đọc màn hình nhưng ẩn bằng mắt, vì tab đã ghi tên phần (không lặp tiêu đề).
- `count` của section hiện trong ngoặc sau nhãn tab: "Đào tạo (3)". Chỉ dùng cho số cần chú ý.

| Dùng thanh neo khi | Dùng tab khi |
|--------------------|--------------|
| Người dùng đọc hồ sơ từ trên xuống, các phần vừa phải | Mỗi phần là một chủ đề nặng, người dùng chỉ xem một phần mỗi lần |
| Tối đa khoảng 4 bảng trên cả trang | Có bảng dài (> 20 dòng) hoặc nhiều bảng |

## Section, khối con và thanh chân

- `nxt-object-page-section` có `id` (đích của neo, dùng được làm `#id` trong URL), `title` (`h2`), tuỳ chọn `busy` (đang tải: `aria-busy`) và hành động cùng hàng tiêu đề `[nxtSectionActions]` ("Xem tất cả (24)", "Sửa" của sửa một phần).
- `nxt-object-page-subsection` chia một section thành các khối có tiêu đề `h3` ("Thông tin cá nhân", "Liên hệ"). Section chỉ có một khối thì bỏ khối con: tiêu đề section đã đủ. Section chỉ có một bảng thì bảng mang tên section, không thêm tiêu đề bảng.
- `[nxtObjectPageFooter]` là thanh dính đáy cho hành động kết thúc ở chế độ sửa / tạo: bên trái chỉ báo ("Bản nháp · đã lưu lúc 14:32", "2 trường cần sửa"), bên phải **Huỷ** rồi **Lưu** (primary ở cuối). Chỉ đặt khe này khi đang sửa / tạo, hoặc khi người dùng phải xem hết nội dung mới quyết định (Duyệt / Từ chối). Thanh hành động chuẩn (`nxt-action-bar`) sẽ thay các nút thường trong khe này khi có.
- `goTo(id, { focus })` cuộn tới một section (hoặc chọn tab) từ code, ví dụ đưa người dùng tới phần có lỗi.

Xem cả trang ghép đủ các phần trong mẫu [Hồ sơ nhân viên](/templates/object).

## Hành vi & trạng thái

| Trạng thái (`data-header`) | Khi nào | Hiển thị |
|----------------------------|---------|----------|
| `expanded` | Mặc định, khối tóm tắt còn thấy | Khối tóm tắt trong luồng, dòng tóm tắt gọn ẩn |
| `scrolled` | Đã cuộn qua khối tóm tắt | Thanh dính có đường kẻ dưới và dòng tóm tắt gọn |
| `collapsed` | Người dùng thu gọn (`expanded = false`) | Khối tóm tắt ẩn, dòng tóm tắt gọn hiện |
| `pinned` / `peek` | Ghim, hoặc vừa mở rộng khi đang cuộn | Khối tóm tắt + thanh neo cùng dính trên cùng |

- Đang tải: đặt `busy` lên section và [Skeleton](/components/skeleton) đúng hình nội dung vào khối tóm tắt và section; tiêu đề trang trên topbar vẫn hiện thật.
- Cuộn tới section là cuộn mượt, và tức thì khi người dùng bật giảm chuyển động.
- Focus vào một trường bị thanh dính trên hoặc thanh chân che: trang tự cuộn vừa đủ để trường hiện ra (WCAG 2.4.11).

## Accessibility

Thanh neo là một `nav` có tên, mỗi neo là một nút; neo hiện tại có `aria-current="true"`. Không dùng `tablist` cho thanh neo vì mọi section cùng hiện trên trang (tablist hứa chỉ một panel hiện). Chế độ tab theo đúng [Tabs của WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Đi qua từng neo, nút thu gọn, nút ghim, rồi vào nội dung |
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên neo | Cuộn tới section, focus lên tiêu đề `h2` của section |
| <kbd>→</kbd> / <kbd>←</kbd> trên neo | Focus neo kế / trước (vòng ở hai đầu), không cuộn |
| <kbd>Home</kbd> / <kbd>End</kbd> trên neo | Focus neo đầu / cuối |
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên nút thu gọn | Thu gọn / mở rộng khối tóm tắt (`aria-expanded`) |
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên nút ghim | Ghim / bỏ ghim (`aria-pressed`) |
| <kbd>Tab</kbd> (chế độ tab) | Vào hàng tab ở tab đang chọn (một điểm dừng), Tab tiếp vào panel |
| <kbd>→</kbd> / <kbd>←</kbd>, <kbd>Home</kbd> / <kbd>End</kbd> (chế độ tab) | Chọn và focus tab kế / trước / đầu / cuối |

- Mỗi section là một vùng có tên (`section` + `aria-labelledby` tiêu đề `h2`), nên duyệt được bằng phím landmark và heading. Trang có đúng một `h1` (trên topbar), section là `h2`, khối con là `h3`.
- Tiêu đề section có `tabindex="-1"`: không nằm trong thứ tự Tab, chỉ nhận focus khi bấm neo.
- Dòng tóm tắt gọn chỉ là chữ, ẩn khỏi trình đọc màn hình khi khối tóm tắt đang hiện.
- Neo đổi theo vị trí cuộn mà không thông báo (tránh làm ồn).

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Tiêu đề section là danh từ ngắn: "Thông tin chung", "Công việc", "Hợp đồng", "Lịch sử" | Động từ hoặc câu dài: "Xem thông tin hợp đồng của nhân viên" |
| Khối tóm tắt: chức danh · phòng ban, mã, ngày vào làm, thâm niên, quản lý | Nhồi mọi trường vào khối tóm tắt, hoặc lặp lại tên đã có trên topbar |
| Chỉ báo ở thanh chân nói trạng thái lưu: "Bản nháp · đã lưu lúc 14:32" | "Đang chỉnh sửa…" không nói gì về dữ liệu |
| `navLabel` theo đối tượng: "Các phần của hồ sơ" | Để mặc định khi trang có nhiều vùng điều hướng |

## API

::api{object-page}

## Tokens

::tokens{component.object-page}

## Changelog

### Chưa phát hành

- Component mới (beta): `nxt-object-page`, `nxt-object-page-section`, `nxt-object-page-subsection`; khe `[nxtObjectPageHeader]`, `[nxtObjectPageSummary]`, `[nxtSectionActions]`, `[nxtSubsectionActions]`, `[nxtObjectPageFooter]`. Theo SAP Fiori Object Page + Dynamic Page, với topbar là hàng tiêu đề thu gọn vĩnh viễn.

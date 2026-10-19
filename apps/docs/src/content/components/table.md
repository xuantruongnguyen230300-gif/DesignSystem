---
title: Table
description: Bảng dữ liệu trên thẻ table native, có header dính, sắp xếp theo cột với aria-sort, chọn nhiều hàng và cột số căn phải.
status: beta
group: Hiển thị dữ liệu
order: 30
package: "@nxt/ui/table"
keywords:
  - bang
  - bang du lieu
  - table
  - data table
  - danh sach
  - sap xep
  - chon hang
  - chon nhieu
  - thao tac hang loat
---

# Table

`table[nxtTable]` thêm style NXT lên `<table>` native, nên screen reader có đủ ngữ nghĩa bảng và đọc tiêu đề cột khi người dùng di chuyển giữa các ô. Bạn quản lý dữ liệu, lọc và phân trang; component lo phần hiển thị, header dính và trạng thái sắp xếp.

## Khi nào dùng

- So sánh nhiều bản ghi theo cùng thuộc tính: danh sách nhân viên, bảng lương, chấm công.
- Danh sách cần sắp xếp, chọn nhiều hàng hoặc thao tác trên từng hàng.

## Khi nào không dùng

- **Xếp bố cục** theo hàng và cột: dùng [Grid](/components/grid); bảng chỉ dành cho dữ liệu.
- **Mỗi mục là một khối thông tin** với ít thuộc tính (hộp duyệt đơn, danh sách thông báo): dùng danh sách.
- **Một bản ghi** dạng nhãn và giá trị: dùng danh sách mô tả `dl`.
- **Nhập liệu kiểu Excel**, di chuyển giữa các ô bằng phím mũi tên: cần grid tương tác (`role="grid"`), NXT chưa có.

## Bảng cơ bản

- `<caption>` đặt tên cho bảng; có thể hiện ra hoặc ẩn bằng `nxt-visually-hidden`.
- Tiêu đề cột dùng `<th scope="col">`. Cột định danh hàng (thường là họ tên) dùng `<th scope="row">`, để screen reader đọc "Phạm Thị Lan, Lương cơ bản, 16.500.000" thay vì chỉ đọc con số.
- Cột số thêm class `.nxt-table__num` trên cả `th` và `td`: căn phải và dùng chữ số đều độ rộng (tabular nums), nên hàng đơn vị thẳng cột. Định dạng số bằng `Intl.NumberFormat('vi-VN')`. Ghi đơn vị trong caption hoặc tiêu đề cột, không lặp lại trong từng ô.
- Bảng có thể rộng hơn màn hình thì đặt trong vùng cuộn có `role="region"`, `aria-label` và `tabindex="0"`, để người dùng bàn phím cuộn ngang được.

::example{table-basic}

Chiều cao hàng lấy theo mật độ (`component.table.row-height`). Thử chuyển ví dụ sang mật độ gọn.

## Sắp xếp

Đặt `[(nxtSort)]` trên `<table>` và `nxtSortHeader="<khoá>"` trên `<th>` của từng cột sắp xếp được. Mỗi lần bấm tiêu đề cột, trạng thái đi theo vòng: tăng dần → giảm dần → bỏ sắp xếp. Cột đang sắp xếp có `aria-sort="ascending"` hoặc `"descending"`; các cột còn lại không có `aria-sort`.

`NxtSort` chỉ giữ trạng thái `NxtSortState` (`{ active, direction }`). Bạn tự sắp xếp dữ liệu, thường bằng một `computed`.

::example{table-sort}

- So sánh chuỗi bằng `localeCompare(…, 'vi')` để chữ có dấu và "Đ" được xếp đúng thứ tự.
- Danh sách người Việt thường xếp theo **tên** (từ cuối cùng), rồi mới tới họ.
- Báo kết quả sắp xếp qua `role="status"`, vì không phải screen reader nào cũng đọc khi `aria-sort` thay đổi.

| Directive | Selector | Input |
|-----------|----------|-------|
| `NxtSort` | `[nxtSort]` | Model `nxtSort: NxtSortState`, mặc định `{ active: '', direction: '' }`; `direction` là `'asc'`, `'desc'` hoặc `''` |
| `NxtSortHeader` | `th[nxtSortHeader]` | `nxtSortHeader` (bắt buộc): khoá của cột, được ghi vào `active` |

## Chọn nhiều hàng

- Cột đầu tiên (`th` và `td`) có class `.nxt-table__select` và chứa [Checkbox](/components/checkbox) có `hideLabel`.
- Nhãn từng ô nêu đối tượng: "Chọn Phạm Thị Lan". Ô ở hàng tiêu đề là "Chọn tất cả hợp đồng", ở trạng thái indeterminate khi mới chọn một phần.
- Hàng đã chọn đặt `[attr.aria-selected]="true"` để có nền `row-bg-selected`.
- Khi có hàng được chọn, thanh công cụ chuyển thành **thanh thao tác hàng loạt** (`role="group"` có tên) ghi rõ số lượng, "Đã chọn 2 hợp đồng". Nút trên thanh ghi rõ đối tượng: "Xoá 2 chức danh", không chỉ "Xoá".
- Khi thao tác xong và thanh hàng loạt biến mất, đưa focus về ô "Chọn tất cả" để người dùng bàn phím không bị mất vị trí.

::example{table-selection}

## Header dính

`stickyHeader` giữ hàng tiêu đề ở trên cùng khi bảng cuộn **bên trong vùng chứa của nó**. Vùng chứa cần `max-block-size` và `overflow: auto`, cùng `role="region"`, `aria-label` và `tabindex="0"` để cuộn được bằng phím mũi tên.

::example{table-sticky}

## Thao tác trên hàng

- Cột cuối có class `.nxt-table__actions`: chỉ rộng vừa nội dung và căn phải. Tiêu đề cột là chữ ẩn "Thao tác".
- Dùng nút `nxtIconButton size="sm" variant="ghost"` với `aria-label` gồm **hành động và đối tượng**: "Sửa Nguyễn Văn An". Thêm `nxtTooltip` với động từ ngắn ("Sửa") cho người dùng chuột.
- Hiện sẵn tối đa 2 nút; các thao tác còn lại gom vào một menu "Thao tác khác cho …".
- Xoá một hàng sẽ xoá luôn nút đang có focus. Chuyển focus sang cùng nút ở hàng kế tiếp, hoặc về vùng bảng khi không còn hàng nào.

::example{table-actions}

Ví dụ đầy đủ với tìm kiếm không dấu, bộ lọc, phân trang và form trong drawer: xem mẫu [Danh mục](/templates/catalog).

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Đi qua vùng cuộn, nút sắp xếp, checkbox và nút trên hàng theo thứ tự đọc |
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên tiêu đề cột | Đổi trạng thái sắp xếp: tăng dần → giảm dần → bỏ sắp xếp |
| <kbd>Space</kbd> trên checkbox | Chọn hoặc bỏ chọn hàng |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> khi vùng bảng đang focus | Cuộn bảng |

- Đây là bảng tĩnh, không phải grid tương tác: mỗi nút và checkbox là một điểm dừng Tab. Không thêm `role="grid"` khi chưa có điều hướng ô bằng phím mũi tên.
- Nút sắp xếp là `<button>` nằm trong `th`, nên tên của nút chính là tiêu đề cột; icon mũi tên chỉ để trang trí.
- Không truyền thông tin chỉ bằng màu nền: hàng đã chọn còn có checkbox được đánh dấu, trạng thái dùng [Tag](/components/tag) có chữ.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Họ và tên | Tên NV |
| Lương cơ bản, đơn vị ghi trong caption | "15.000.000 VNĐ" lặp trong từng ô |
| 20,5 | 20.50 |
| 28/10/2026 | 2026-10-28 |
| `aria-label="Sửa Nguyễn Văn An"` | `aria-label="Sửa"` |
| Không có ứng viên phù hợp. Thử xoá bộ lọc. | Không có dữ liệu |

## API

::api{table}

## Token

::tokens{component.table}

## Changelog

- **0.1.0**: phát hành beta: `table[nxtTable]` với `stickyHeader`; `NxtSort` (`[(nxtSort)]`) và `th[nxtSortHeader]` có `aria-sort`; class `.nxt-table__num`, `.nxt-table__select`, `.nxt-table__actions`; nền cho hàng hover và hàng `aria-selected`.

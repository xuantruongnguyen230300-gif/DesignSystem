---
title: Filter
description: Nút "Bộ lọc" mở panel chứa mọi tiêu chí lọc của danh sách, áp dụng bằng "Áp dụng", kèm hàng chip cho biết đang lọc gì và bỏ từng tiêu chí bằng một cú bấm.
status: beta
group: Nhập liệu
order: 8
package: "@nxt/ui/filter"
keywords:
  - bo loc
  - loc
  - filter
  - loc danh sach
  - chip bo loc
  - xoa bo loc
  - tieu chi
  - toolbar
---

# Filter

## Khi nào dùng

- Mọi trang danh sách hoặc danh mục có từ **một tiêu chí lọc** trở lên: trạng thái, nhóm, phòng ban, loại hợp đồng, khoảng thời gian.
- Danh sách trong panel hoặc drawer cần thu hẹp theo vài tiêu chí, cạnh một ô [Search](/components/search).

## Khi nào không dùng

- **Đổi phạm vi dữ liệu mà người dùng chuyển qua lại liên tục**: các danh mục khác nhau trên cùng một màn (Chức danh, Cấp bậc, Phòng ban), hoặc hàng đợi công việc ("Chờ tôi duyệt / Đã xử lý"). Dùng [Tabs](/components/tabs) đặt phía trên toolbar.
- **Bộ lọc dài hơn khoảng 8 trường, hoặc có điều kiện lồng nhau** (và/hoặc, khoảng giá trị tự nhập): dùng drawer bộ lọc nâng cao ([Drawer](/components/drawer)); NXT chưa có component riêng.
- **Một giá trị hiển thị** của cùng nội dung (tuần/tháng, bảng/thẻ): dùng [Segmented](/components/segmented).
- **Tìm theo chữ tự do**: dùng [Search](/components/search); bộ lọc chỉ chứa tiêu chí có danh sách giá trị.

## Quyết định của NXT

**Mọi tiêu chí lọc nằm trong một panel**, mở bằng nút "Bộ lọc" và áp dụng bằng nút "Áp dụng". Toolbar của danh sách chỉ có ô tìm kiếm và nút này.

- **Không có bộ lọc nhanh áp dụng ngay trên toolbar** (dropdown "Trạng thái", "Phòng ban" nằm ngoài panel). Khi một màn trộn bộ lọc áp dụng ngay với bộ lọc phải bấm "Áp dụng", người dùng không biết thay đổi nào đã có hiệu lực. NXT chọn một cách cho mọi sản phẩm, tham khảo Carbon, SAP Fiori và Salesforce.
- **Toolbar giữ một hình dạng** ở mọi phân hệ, không tràn trên màn hẹp, và người dùng luôn biết chỗ để lọc.
- **Tìm kiếm thì áp dụng ngay** khi gõ: đó là chữ tự do, không phải tiêu chí trong panel.
- **Chip cho biết đang lọc gì.** Mỗi tiêu chí đang áp dụng là một chip dưới toolbar, có nút bỏ. Cuối hàng là "Xoá bộ lọc", **không** ghi "Xoá tất cả": trên một trang danh sách, "Xoá tất cả" dễ bị hiểu là xoá mọi bản ghi.
- **Nút luôn có chữ "Bộ lọc"**, không chỉ icon phễu: người dùng mới nhận ra ngay, người dùng quen nhìn số tiêu chí đang áp dụng trên nút.

Bố cục đầy đủ của trang danh sách (tab, toolbar, chip, bảng, phân trang, nhập/xuất Excel) ở pattern [Trang danh sách & danh mục](/patterns/list-page).

## Bộ lọc và chip

`nxt-filter` là nút "Bộ lọc" cùng panel; nội dung panel (radio, checkbox, select) do trang chiếu vào. `nxt-filter-chips` hiện các tiêu chí đang áp dụng. `NxtFilterState` giữ giá trị **đã áp dụng** và **bản nháp** mà panel đang sửa.

::example{filter-basic}

Luồng một lần lọc:

1. Bấm "Bộ lọc": panel mở, phát `opened`. Trang gọi `filters.edit()` để bản nháp bắt đầu từ bộ lọc đang áp dụng. Focus vào field đầu tiên.
2. Người dùng đổi các field: chỉ **bản nháp** thay đổi (`filters.set()`, `filters.toggle()`), danh sách phía dưới chưa đổi.
3. "Áp dụng" hoặc <kbd>Enter</kbd> (panel là một `<form>`): phát `applied`, trang gọi `filters.apply()`. Panel đóng, focus về nút.
4. "Huỷ", <kbd>Esc</kbd> hoặc bấm ra ngoài: đóng mà **không** áp dụng; lần mở sau bản nháp lại bắt đầu từ bộ lọc đang áp dụng.
5. "Đặt lại": phát `reset`, trang gọi `filters.resetDraft()`. Bản nháp về mặc định, panel **vẫn mở**, chưa có gì được áp dụng cho tới khi bấm "Áp dụng".

Chip:

- Nhãn chip dạng "Tên tiêu chí: giá trị", nhiều giá trị nối bằng dấu phẩy: "Phòng ban: Kinh doanh, Công nghệ". Nhãn dài bị cắt "…" và có `title` đầy đủ.
- × trên chip phát `remove` với `key`; trang gọi `filters.clear(key)`. Focus chuyển sang chip kế tiếp; bỏ chip cuối cùng thì focus về `returnFocusTo`, thường là chính `nxt-filter` (`#filter`).
- "Xoá bộ lọc" phát `clearAll`; trang gọi `filters.clearAll()`. Focus về `returnFocusTo`.
- Không có tiêu chí nào thì `nxt-filter-chips` không render gì. Khi bỏ chip cuối cùng hoặc bấm "Xoá bộ lọc", component chuyển focus về `returnFocusTo` **trước** khi phát sự kiện, nên trang bọc hàng chip (cùng khung, padding, viền bao quanh) trong `@if (chips().length)` được mà focus không bị rơi về đầu trang.
- Số kết quả sau khi lọc do trang thông báo ở `role="status"`.

### NxtFilterState

Lớp thuần TS dựa trên signal, không bắt buộc dùng nhưng giúp mọi trang danh sách cư xử giống nhau. Bảng API phía dưới chỉ liệt kê component, nên `NxtFilterState` được mô tả ở đây.

```ts
protected readonly filters = new NxtFilterState({ status: 'all' as Status, depts: [] as string[] });
```

| Thành viên | Kiểu | Mô tả |
|------------|------|-------|
| `defaults` | `T` | Giá trị mặc định truyền vào constructor, nghĩa là "không lọc" |
| `applied` | `WritableSignal<T>` | Bộ lọc đang áp dụng: dùng để lọc dữ liệu và dựng chip |
| `draft` | `WritableSignal<T>` | Bản nháp mà panel đang sửa: bind vào các field trong panel |
| `activeCount` | `Signal<number>` | Số tiêu chí của `applied` khác mặc định; truyền vào `[activeCount]` của `nxt-filter` |
| `isActive(key)` | `boolean` | Tiêu chí `key` của `applied` có khác mặc định không (để quyết định có chip) |
| `edit()` | | Panel mở: chép `applied` sang `draft` |
| `set(key, value)` | | Đặt một tiêu chí trong `draft` (radio, select) |
| `toggle(key, item, on)` | | Thêm/bớt một giá trị trong tiêu chí dạng mảng của `draft` (nhóm checkbox) |
| `apply()` | | Chép `draft` sang `applied` |
| `resetDraft()` | | Đưa `draft` về mặc định ("Đặt lại"); chưa áp dụng |
| `clear(key)` | | Bỏ một tiêu chí khỏi `applied` (× trên chip) |
| `clearAll()` | | Đưa `applied` về mặc định ("Xoá bộ lọc") |

- Tiêu chí được coi là **đang áp dụng** khi khác giá trị mặc định (so sánh theo JSON), nên mảng rỗng `[]` hay `'all'`/`''` làm mặc định đều là "không lọc" và không được đếm.
- Mỗi danh sách (mỗi tab) giữ một `NxtFilterState` riêng, nên chuyển tab không mất bộ lọc của tab kia.

## Toolbar danh sách

Toolbar chuẩn của NXT: ô tìm kiếm co giãn bên trái, nút "Bộ lọc" ngay sau. Hàng chip nằm dưới toolbar, trên bảng, và chỉ hiện khi đang lọc. Thử lọc "Trạng thái: Đã chấm dứt" rồi tìm "lan" để thấy trạng thái không có kết quả.

::example{filter-toolbar}

- Khi không có kết quả, empty state có nút **"Xoá tìm kiếm và bộ lọc"**: xoá cả từ khoá lẫn tiêu chí, rồi đưa focus về ô tìm kiếm (nút đã biến mất cùng empty state).
- Phân biệt "không có kết quả" (đang tìm/lọc: đề nghị xoá) với "chưa có dữ liệu" (lần đầu: đề nghị thêm mới, nhập từ Excel). Xem [Empty state](/components/empty-state).
- Khi người dùng chọn hàng trong bảng, thanh thao tác hàng loạt thay chỗ toolbar. Xem [Table](/components/table#chon-nhieu-hang).
- `size="sm"` trên `nxt-filter` khớp với `nxt-search size="sm"` khi toolbar nằm trong panel hoặc drawer.

## Khi nào dùng tab thay cho bộ lọc

| Dùng [Tabs](/components/tabs) phía trên toolbar | Dùng tiêu chí trong Bộ lọc |
|------------------------------------------------|-----------------------------|
| Đổi **phạm vi** dữ liệu: mỗi tab là một danh mục hoặc một hàng đợi riêng | Thu hẹp **cùng một** danh sách |
| Người dùng chuyển qua lại liên tục ("Chờ tôi duyệt / Đã xử lý") | Người dùng đặt một lần rồi làm việc trên kết quả |
| Mỗi tab có số đếm riêng, có toolbar, bộ lọc, trang của riêng nó | Có thể kết hợp nhiều tiêu chí cùng lúc |
| Ví dụ: [Phê duyệt](/templates/approval), [Danh mục](/templates/catalog) | Ví dụ: Trạng thái "Đang sử dụng / Ngừng sử dụng" của danh mục |

Trạng thái của các bản ghi trong **cùng một** danh sách ("Đang sử dụng / Ngừng sử dụng") là tiêu chí lọc, không phải tab.

## Chế độ xem đã lưu và URL

Lưu một bộ lọc thành "chế độ xem" (saved view) và đồng bộ bộ lọc lên URL là **việc của trang**, không phải của component. `NxtFilterState.applied` là một signal thường: trang tự đọc từ query string khi mở và ghi lại khi `applied` đổi. NXT sẽ có pattern riêng cho saved view.

## Accessibility

Panel theo mẫu [Dialog (modal) của WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), áp dụng trong phạm vi panel.

| Phím | Hành vi |
|------|---------|
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên nút | Mở panel, focus vào field đầu tiên |
| <kbd>Tab</kbd> | Đi vòng trong panel |
| <kbd>Enter</kbd> trong panel | Áp dụng (panel là `<form>`) |
| <kbd>Esc</kbd>, bấm ra ngoài, "Huỷ" | Đóng, **không** áp dụng bản nháp; focus về nút |
| "Áp dụng" | Áp dụng, đóng, focus về nút |
| × trên chip | Bỏ tiêu chí; focus sang chip kế tiếp, hết chip thì về `returnFocusTo` |

- Nút có `aria-haspopup="dialog"` và `aria-expanded`. Tên của nút đọc được số tiêu chí: "Bộ lọc, đang áp dụng 2"; viên số đếm chỉ để nhìn (`aria-hidden`).
- Panel có `role="dialog"`, `aria-modal="true"`, tên lấy từ tiêu đề (`title`), focus trap và trả focus khi đóng (CDK Dialog).
- Nhóm field trong panel dùng `<fieldset>` + `<legend>` ("Trạng thái", "Phòng ban"); radio cùng nhóm có cùng `name`, và `name` phải là duy nhất trên trang.
- Hàng chip là `role="group"` tên "Bộ lọc đang áp dụng"; mỗi nút bỏ có tên "Bỏ lọc <nhãn chip>".
- Nút đang có tiêu chí áp dụng đổi viền và chữ sang màu chọn (`border.selected`), kèm số đếm: không chỉ dựa vào màu.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Bộ lọc · 2 | Icon phễu không có chữ |
| Tiêu đề panel "Lọc hợp đồng" | "Bộ lọc nâng cao" khi không có bộ lọc cơ bản |
| Phòng ban: Kinh doanh, Công nghệ | Kinh doanh + 1 |
| Xoá bộ lọc | Xoá tất cả |
| Đặt lại · Huỷ · Áp dụng | Reset · Đóng · OK |
| Không có hợp đồng phù hợp. Thử từ khoá ngắn hơn, hoặc bỏ bớt bộ lọc. | Không có dữ liệu |

## API

::api{filter}

## Token

::tokens{component.filter}

## Changelog

- **0.1.0**: phát hành beta: `nxt-filter` (panel CDK Dialog, `title`, `activeCount`, `size`, output `opened`/`applied`/`reset`), `nxt-filter-chips` (`chips`, `returnFocusTo`, output `remove`/`clearAll`) và lớp `NxtFilterState`.

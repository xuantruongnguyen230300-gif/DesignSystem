---
title: Table
description: Bảng dữ liệu trên thẻ table native, có header dính, sắp xếp theo cột với aria-sort, chọn nhiều hàng, tô sáng hàng, hàng đang mở, cố định cột định danh, tuỳ biến cột, đổi độ rộng cột và trạng thái đang tải.
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
  - thao tac tren hang
  - hover
  - shift click
  - chon dai
  - khong xuong dong
  - to sang hang
  - highlight
  - hang dang mo
  - co dinh cot
  - sticky column
  - tuy bien cot
  - doi do rong cot
  - keo cot
  - resize
  - resizable
  - column resize
  - do rong cot
  - cai dat bang
  - an hien cot
  - dang tai
  - loading
---

# Table

`table[nxtTable]` thêm style NXT lên `<table>` native, nên screen reader có đủ ngữ nghĩa bảng và đọc tiêu đề cột khi người dùng di chuyển giữa các ô. Bạn quản lý dữ liệu, lọc và phân trang; component lo phần hiển thị, header dính, trạng thái sắp xếp, tô sáng hàng, cột cố định và tuỳ biến cột.

## Khi nào dùng

- So sánh nhiều bản ghi theo cùng thuộc tính: danh sách nhân viên, bảng lương, chấm công.
- Danh sách cần sắp xếp, chọn nhiều hàng hoặc thao tác trên từng hàng.

## Khi nào không dùng

- **Xếp bố cục** theo hàng và cột: dùng [Grid](/components/grid); bảng chỉ dành cho dữ liệu.
- **Mỗi mục là một khối thông tin** với ít thuộc tính (hộp duyệt đơn, danh sách thông báo): dùng danh sách, như mẫu [Phê duyệt](/templates/approval).
- **Một bản ghi** dạng nhãn và giá trị: dùng [Descriptions](/components/descriptions).
- **Nhập liệu kiểu Excel**, di chuyển giữa các ô bằng phím mũi tên: cần grid tương tác (`role="grid"`), NXT chưa có.
- **Dữ liệu phân cấp** (cây tổ chức): cần bảng cây, NXT chưa có.

## Chọn cách hiển thị tập hợp

Bảng NXT là **lưới desktop**: mỗi ô một giá trị, hàng một dòng, màn hẹp thì cuộn ngang trong vùng cuộn (theo SAP Fiori: grid table). Chọn theo việc người dùng làm:

| Việc của người dùng | Dùng |
|---------------------|------|
| So sánh giá trị giữa các hàng, sắp xếp, chọn nhiều | Bảng |
| Đọc từng mục như một khối (người gửi, tóm tắt, thời gian), xử lý lần lượt | Danh sách (mẫu [Phê duyệt](/templates/approval)) |
| Xem một bản ghi | [Descriptions](/components/descriptions) |
| Nhìn tổng quan số lượng lớn, xu hướng | Biểu đồ, thẻ số liệu |
| Dữ liệu phân cấp nhiều tầng | Bảng cây (chưa có) |

Mỗi lần chỉ nạp **một trang** (10–100 hàng, tối đa khoảng 200): dữ liệu lớn phân trang ở máy chủ bằng [Pagination](/components/pagination), không render hàng nghìn hàng.

## Bảng cơ bản

- `<caption>` đặt tên cho bảng; có thể hiện ra hoặc ẩn bằng `nxt-visually-hidden`.
- Tiêu đề cột dùng `<th scope="col">`. Cột định danh hàng (thường là họ tên) dùng `<th scope="row">`, để screen reader đọc "Phạm Thị Lan, Lương cơ bản, 16.500.000" thay vì chỉ đọc con số.
- Cột số thêm class `.nxt-table__num` trên cả `th` và `td`: căn phải và dùng chữ số đều độ rộng (tabular nums), nên hàng đơn vị thẳng cột. Định dạng số bằng `Intl.NumberFormat('vi-VN')`.
- Bảng có thể rộng hơn màn hình thì đặt trong vùng cuộn `nxt-table-scroll` (có `role="region"`, `aria-label` và `tabindex="0"`), để người dùng bàn phím cuộn ngang được.

::example{table-basic}

Chiều cao hàng lấy theo mật độ (`component.table.row-height`). Thử chuyển ví dụ sang mật độ gọn. Mật độ **Gọn chỉ dành cho chuột và bàn phím**: trên thiết bị cảm ứng dùng tối thiểu mật độ vừa để đủ vùng chạm.

## Định dạng ô

| Nội dung | Căn | Ghi chú |
|----------|-----|---------|
| Chữ, mã, số điện thoại, email, trạng thái | Trái | Trạng thái dùng [Tag](/components/tag) có chữ |
| Số, tiền, ngày giờ | Phải (`.nxt-table__num`) | Chữ số đều độ rộng; tiêu đề cột căn theo nội dung |
| Icon, avatar | Giữa | Cột không có tiêu đề hiển thị phải có tên ẩn |

- **Cột định danh luôn đầu tiên** (mã, tên): không bao giờ bị ẩn hay dời chỗ, và [cố định khi cuộn ngang](#co-dinh-cot-dinh-danh).
- **Khoảng 8 cột** khi bảng chiếm toàn bề rộng (3–5 cột khi chia đôi màn hình). Cần nhiều hơn thì mặc định chỉ hiện cột chính và cho người dùng [chọn cột](#tuy-bien-cot).
- **Đơn vị** chung cho mọi hàng ghi ở tiêu đề cột ("Lương cơ bản (₫)"); đơn vị khác nhau giữa các hàng thì ghi cùng số trong ô.
- **Ô trống** ghi "—", một ký hiệu duy nhất (không "N/A", "Không có"). Khi "—" mang nghĩa riêng, thêm chữ ẩn cho screen reader ("Chưa áp dụng").
- **Không cắt chữ** bằng "…" trong ô dữ liệu: người dùng không đọc được phần bị cắt, và screen reader đọc một nội dung khác với thứ người nhìn thấy.

## Ô không xuống dòng

Mặc định, ô dữ liệu (`td`, `th` trong `tbody`) và tiêu đề cột **không xuống dòng**. Trên màn hẹp, bảng cuộn ngang trong vùng chứa của nó thay vì bẻ họ tên thành mỗi chữ một dòng, nên mỗi hàng vẫn đọc được trên một dòng và chiều cao hàng giữ đúng mật độ.

- Vì vậy, luôn đặt bảng trong vùng cuộn `nxt-table-scroll`.
- Cột chứa **văn bản tự do dài** (ghi chú, lý do, mô tả) thêm class `.nxt-table__wrap` trên `td` của cột đó: ô được xuống dòng, và giữ bề rộng tối thiểu `layout.item-min-sm` để không co thành một cột chữ hẹp.

```html
<td class="nxt-table__wrap">{{ r.reason }}</td>
```

## Sắp xếp

Đặt `[(nxtSort)]` trên `<table>` và `nxtSortHeader="<khoá>"` trên `<th>` của từng cột sắp xếp được. Mỗi lần bấm tiêu đề cột, trạng thái đi theo vòng: tăng dần → giảm dần → bỏ sắp xếp. Cột đang sắp xếp có `aria-sort="ascending"` hoặc `"descending"`; các cột còn lại không có `aria-sort`.

`NxtSort` chỉ giữ trạng thái `NxtSortState` (`{ active, direction }`). Bạn tự sắp xếp dữ liệu, thường bằng một `computed`.

::example{table-sort}

- **Khởi tạo bằng thứ tự mặc định có nghĩa**, thường là cột định danh tăng dần (`{ active: 'name', direction: 'asc' }`): icon và `aria-sort` cho người dùng biết bảng đang theo thứ tự nào ngay khi mở. "Bỏ sắp xếp" trả về đúng thứ tự mặc định đó.
- So sánh chuỗi bằng `localeCompare(…, 'vi')` để chữ có dấu và "Đ" được xếp đúng thứ tự.
- Danh sách người Việt thường xếp theo **tên** (từ cuối cùng), rồi mới tới họ.
- Báo kết quả sắp xếp qua `role="status"`, vì không phải screen reader nào cũng đọc khi `aria-sort` thay đổi.
- Nút sắp xếp **cao bằng cả ô tiêu đề**, nên bấm đâu trên chiều cao của ô cũng sắp xếp, không chỉ trên dòng chữ. Giao diện không đổi: nút lấy chiều cao của ô và bù lại bằng lề âm. Vòng focus vẽ vào trong nút.

| Directive | Selector | Input |
|-----------|----------|-------|
| `NxtSort` | `[nxtSort]` | Model `nxtSort: NxtSortState`, mặc định `{ active: '', direction: '' }`; `direction` là `'asc'`, `'desc'` hoặc `''` |
| `NxtSortHeader` | `th[nxtSortHeader]` | `nxtSortHeader` (bắt buộc): khoá của cột, được ghi vào `active` |

## Chọn nhiều hàng

- Cột đầu tiên (`th` và `td`) có class `.nxt-table__select` và chứa [Checkbox](/components/checkbox) có `hideLabel`.
- Nhãn từng ô nêu đối tượng: "Chọn Phạm Thị Lan". Ô ở hàng tiêu đề là "Chọn tất cả hợp đồng" (khi có phân trang: "Chọn tất cả chức danh trên trang"), ở trạng thái indeterminate khi mới chọn một phần.
- Hàng đã chọn đặt `[attr.aria-selected]="true"` để có nền `row-bg-selected`.
- Khi có hàng được chọn, thanh công cụ chuyển thành **thanh thao tác hàng loạt** (`role="group"` có tên) ghi rõ số lượng, "Đã chọn 2 hợp đồng". Nút trên thanh ghi rõ đối tượng: "Xoá 2 chức danh", không chỉ "Xoá".
- **Không disable checkbox chọn hàng**. Hàng nào không áp được thao tác thì làm phần áp được rồi báo phần còn lại ("Đã ngừng sử dụng 7 chức danh. 3 chức danh đã ngừng từ trước.").
- Khi thao tác xong và thanh hàng loạt biến mất, đưa focus về ô "Chọn tất cả" để người dùng bàn phím không bị mất vị trí.

::example{table-selection}

### Lựa chọn khi kết quả thay đổi

Chính sách của NXT (theo SAP Fiori: lựa chọn trong bảng, nhưng giữ phần còn khớp thay vì xoá hết):

| Khi | Lựa chọn |
|-----|----------|
| Sắp xếp, chuyển trang, đổi số dòng/trang | Giữ nguyên |
| Tìm kiếm, lọc, đổi [chế độ xem](/components/view-manager) | Bỏ chọn các hàng **không còn trong kết quả** (`selection.retain(khoá mọi hàng còn khớp)`), giữ các hàng còn khớp; nếu có hàng bị bỏ, báo qua `role="status"`: "Đã bỏ chọn 2 chức danh không còn trong kết quả" |
| Sau một thao tác hàng loạt | Giữ chọn các hàng vẫn còn, để làm tiếp thao tác thứ hai trên cùng tập |
| Xoá hàng, tải lại dữ liệu | `retain(khoá còn tồn tại)` |

Nhờ vậy thao tác hàng loạt không bao giờ tác động lên hàng người dùng không còn nhìn thấy.

### NxtSelection

`NxtSelection<K>` (import từ `@nxt/ui/table`) là lớp thuần TS giữ tập khoá đã chọn bằng signal, không đụng tới DOM. Chọn theo **khoá ổn định** của bản ghi (mã, id), không theo vị trí hàng.

```ts
protected readonly selection = new NxtSelection<string>();
/** Khoá của các hàng đang hiện, đúng thứ tự hiển thị. */
protected readonly pageKeys = computed(() => this.pageRows().map((r) => r.code));
```

```html
<!-- Ô chọn tất cả: các hàng trên trang hiện tại -->
<nxt-checkbox label="Chọn tất cả chức danh trên trang" hideLabel
  [checked]="selection.allSelected(pageKeys())"
  [indeterminate]="selection.someSelected(pageKeys())"
  (checkedChange)="selection.setMany(pageKeys(), $event)" />

<!-- Ô của từng hàng: Shift chọn cả dải -->
<nxt-checkbox [label]="'Chọn ' + r.name" hideLabel
  [checked]="selection.has(r.code)"
  (toggled)="selection.select(r.code, $event.checked, { range: $event.shiftKey, order: pageKeys() })" />
```

| Thành viên | Kiểu | Mô tả |
|------------|------|-------|
| `selected` | `WritableSignal<ReadonlySet<K>>` | Tập khoá đã chọn |
| `count` | `Signal<number>` | Số hàng đã chọn, cho "Đã chọn 5" |
| `has(key)` | `boolean` | Hàng có đang được chọn không |
| `select(key, checked, { range, order })` | | Chọn hoặc bỏ chọn một hàng. Với `range: true`, áp cùng trạng thái cho mọi hàng trong `order` nằm giữa hàng được bấm lần trước và hàng này |
| `setMany(keys, checked)` | | Chọn hoặc bỏ chọn nhiều hàng một lúc (ô chọn tất cả, "Chọn tất cả N …") |
| `allSelected(keys)` | `boolean` | Mọi khoá trong `keys` đều đã chọn (và `keys` không rỗng) |
| `someSelected(keys)` | `boolean` | Có chọn một phần `keys`: dùng cho `indeterminate` |
| `retain(keys)` | `number` | Chỉ giữ các khoá trong `keys`; trả về số khoá đã bỏ (để báo cho người dùng) |
| `clear()` | | Bỏ chọn tất cả ("Bỏ chọn") và quên hàng mốc của Shift |

### Chọn một dải bằng Shift

Giữ <kbd>Shift</kbd> khi bấm (hoặc nhấn <kbd>Shift</kbd>+<kbd>Space</kbd>) trên checkbox của một hàng sẽ áp cùng trạng thái cho mọi hàng từ hàng được bấm lần trước tới hàng này, như Gmail và Windows Explorer. Trong ví dụ trên, bấm ô của "Đỗ Minh Thư", rồi giữ Shift và bấm ô của "Trương Đình Khang".

- Output `toggled` của [Checkbox](/components/checkbox) phát `{ checked, shiftKey }`. Sự kiện `change` gốc không mang phím bổ trợ, nên ô của từng hàng dùng `toggled` thay cho `checkedChange`.
- `order` là danh sách khoá **đúng thứ tự đang hiển thị** (sau sắp xếp và lọc, thường là trang hiện tại). Hàng mốc không còn trong `order` (đã sang trang khác, đã bị lọc) thì chỉ hàng được bấm thay đổi.
- Shift chỉ là đường tắt: người dùng không biết Shift vẫn chọn được từng hàng và "Chọn tất cả".

### Chọn tất cả kết quả

Ô "Chọn tất cả" chỉ chọn các hàng **trên trang hiện tại**. Khi cả trang đã được chọn và kết quả còn nhiều hơn một trang, thanh hàng loạt có thêm nút **"Chọn tất cả 29 chức danh"** (gọi `selection.setMany(allKeys, true)`), như Gmail. Thao tác hàng loạt áp dụng cho đúng những gì đã chọn, kể cả ở các trang khác. Xem mẫu [Danh mục](/templates/catalog).

## Tô sáng hàng

`tr[data-highlight="danger|warning|success|info"]` vẽ một **dải màu ở đầu hàng** (theo SAP Fiori: highlight indicator), để hàng cần chú ý nổi lên khi lướt bảng: hợp đồng sắp hết hạn, dòng lỗi khi nhập Excel, bản ghi vừa thêm.

```html
<tr [attr.data-highlight]="r.daysLeft <= 30 ? 'warning' : null">
  …
  <td><nxt-tag tone="warning" dot>Sắp hết hạn · còn 14 ngày</nxt-tag></td>
</tr>
```

| Giá trị | Dùng khi |
|---------|----------|
| `danger` | Hàng có lỗi (thiếu dữ liệu, không hợp lệ, đã quá hạn). Hàng lỗi **luôn** được tô sáng |
| `warning` | Cần chú ý sớm: sắp hết hạn, sắp quá hạn |
| `success` | Vừa hoàn tất, khi cần nhấn mạnh trong một danh sách đang xử lý |
| `info` | Mới thêm hoặc vừa sửa: hiện ở đầu bảng tới lần sắp xếp/lọc sau |

- Dải màu chỉ là **gợi ý**: hàng luôn có chữ nói vấn đề (tag, dòng phụ), lý tưởng cùng tông màu. Không truyền nghĩa chỉ bằng màu.
- Mỗi hàng tối đa một tô sáng. Không tô sáng để trang trí, không dùng hàng kẻ sọc.
- Nhiều hàng lỗi thì thêm một [Alert](/components/alert) phía trên bảng tóm tắt ("3 dòng lỗi"), cập nhật khi lỗi được sửa.

::example{table-highlight}

## Hàng đang mở

Hàng đang hiện ở drawer chi tiết (hoặc cột chi tiết của màn chia đôi) đặt `[attr.aria-current]="'true'"`: nền trung tính `row-bg-current` (khác nền hàng đã chọn) và một dải `row-current-indicator` ở đầu hàng, ngay sau dải tô sáng nếu có. Khi người dùng duyệt bản ghi trước/sau trong drawer, dời `aria-current` theo; đóng drawer thì bỏ. Mỗi bảng chỉ một hàng đang mở. Trong ví dụ trên, bấm một tên.

## Cố định cột định danh

Thêm `.nxt-table__sticky` vào **cả `th` và `td`** của cột chọn và cột định danh (tên): hai cột này đứng yên ở mép trái khi bảng cuộn ngang, nên người dùng luôn biết đang đọc hàng của ai (bảng lương, chấm công, hồ sơ nhân viên đều rộng). Nền cột cố định theo trạng thái hàng (hover, đã chọn, đang mở). Khi vùng cuộn đã cuộn ngang, cột cố định cuối có vạch phân cách `sticky-divider`.

```html
<th scope="col" class="nxt-table__select nxt-table__sticky">…chọn tất cả…</th>
<th scope="col" class="nxt-table__sticky">Họ và tên</th>
…
<td class="nxt-table__select nxt-table__sticky">…</td>
<th scope="row" class="nxt-table__sticky">{{ r.name }}</th>
```

- Tối đa **cột chọn + một cột**. Cột cố định đầu tiên đặt ở đầu hàng; cột thứ hai chỉ hợp lệ khi ngay sau cột chọn.
- Thao tác trên hàng (`nxtRowActions`) dính mép phải nên một hàng luôn thấy được cả tên lẫn thao tác.

## Tuỳ biến cột

Bảng cần nhiều cột hơn chỗ trên màn (hồ sơ nhân viên, bảng lương) thì mặc định chỉ hiện các cột chính và cho người dùng chọn thêm. `NxtColumnsState` giữ thứ tự và cột ẩn; nút **Cài đặt bảng** (`[nxtTableColumnsFor]`, icon `adjustments`, tooltip) đặt **cuối nhóm công cụ bên phải** của toolbar, trước vạch ngăn và nút primary.

::example{table-columns}

```ts
protected readonly columns = new NxtColumnsState([
  { key: 'name', label: 'Họ và tên', locked: true },   // định danh: luôn hiện, luôn đầu
  { key: 'dept', label: 'Phòng ban' },
  { key: 'phone', label: 'Điện thoại', hidden: true }, // ẩn trong mặc định
  …
]);
```

```html
<button nxtIconButton type="button" aria-label="Cài đặt bảng" nxtTooltip="Cài đặt bảng" [nxtTableColumnsFor]="columns">
  <nxt-icon name="adjustments" />
</button>
…
@for (c of columns.visible(); track c.key) { <th scope="col">{{ c.label }}</th> }
```

- Bảng tự render theo `columns.visible()` (lặp trong `thead` và `tbody`, `@switch` theo `key`); component không đoán cách hiển thị ô.
- Dialog "Cài đặt bảng": ô tìm cột, "Hiện tất cả cột", nút **Lên / Xuống** cho cột đang chọn, danh sách checkbox theo thứ tự cột (trên xuống = trái sang phải), "Khôi phục mặc định". Cột `locked` có checkbox đã chọn, bị khoá và ghi "Luôn hiện". Chỉ áp dụng khi bấm **Áp dụng**; **Huỷ** bỏ mọi thay đổi.
- Đổi thứ tự bằng nút và phím (<kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd>), không bằng kéo thả.
- Lưu bố cục cột theo người dùng bằng [View Manager](/components/view-manager) (`columns` nằm trong `NxtViewState`), hoặc tự lưu qua output `nxtTableColumnsApplied`.
- Chỉ thêm tuỳ biến cột khi bảng thật sự cần nhiều cột hơn khoảng 5–8 cột vừa màn hình.

| `NxtColumnsState` | Mô tả |
|-------------------|-------|
| `visible()`, `visibleKeys()`, `isVisible(key)` | Cột đang hiện, đúng thứ tự |
| `value()` / `set(value)` | Bố cục đã áp dụng `{ order, hidden }`; `set` chuẩn hoá (bỏ khoá lạ, thêm cột mới vào vị trí mặc định, cột khoá luôn đầu) |
| `modified()`, `reset()` | Khác mặc định; về mặc định |
| `edit()`, `toggle()`, `setAll()`, `move()`, `resetDraft()`, `apply()` | Bản nháp mà panel sửa |

`nxt-table-columns` là phần thân của dialog (dùng riêng được trong popover); mọi chuỗi đổi được qua `labels` / `nxtTableColumnsLabels`.

## Đổi độ rộng cột

Người dùng thường muốn nới cột tên dài hay thu cột mã ngắn để vừa dữ liệu của họ (Apple HIG: bảng cho người dùng đổi độ rộng cột). Thêm `nxtResizable` vào `th` của **từng cột dữ liệu** cần đổi. Một tay nắm xuất hiện ở mép cuối của ô tiêu đề; cột nào không thêm thì không đổi gì, bảng cũ chạy y như trước.

::example{table-resizable}

```html
<th scope="col" nxtSortHeader="dept" nxtResizable="dept" [nxtResizeColumns]="columns" [nxtResizeMin]="144">Phòng ban</th>
```

| Thuộc tính | Mô tả |
|------------|-------|
| `nxtResizable` | Khoá cột (`nxtResizable="dept"`). Thuộc tính trần cũng được, nhưng không có khoá thì không lưu được |
| `[nxtResizeColumns]` | `NxtColumnsState` giữ độ rộng: lưu vào `columns.value().widths` và lấy lại từ đó |
| `[nxtResizeMin]` / `[nxtResizeMax]` | Hẹp nhất / rộng nhất của cột (px). Mặc định lấy từ token `resize-min` / `resize-max` |
| `(nxtResized)` | Phát `{ key, width }` **một lần** khi chọn xong (thả chuột, mỗi lần nhấn phím); `width: null` khi về mặc định. Không phát khi đang kéo |

**Cách dùng**
- Kéo tay nắm bằng chuột, cảm ứng hoặc bút. Mỗi pixel kéo là một pixel đổi: chiều rộng tính từ chỗ bắt đầu kéo, kẹp trong `[nxtResizeMin, nxtResizeMax]`.
- Bằng bàn phím: <kbd>Tab</kbd> tới tay nắm (nằm **sau** nút sắp xếp của cùng ô), rồi <kbd>←</kbd> / <kbd>→</kbd> đổi 8px, giữ <kbd>Shift</kbd> đổi 32px; <kbd>Home</kbd> / <kbd>End</kbd> về hẹp nhất / rộng nhất. Trong văn bản phải-sang-trái, chiều mũi tên đảo theo chiều mép dịch.
- <kbd>Enter</kbd> hoặc nhấp đúp tay nắm: về **độ rộng mặc định**, tức độ rộng theo nội dung của cột. <kbd>Esc</kbd> khi đang kéo: huỷ, cột về độ rộng trước đó.
- Bảng cuộn ngang trong `nxt-table-scroll` khi tổng độ rộng lớn hơn vùng chứa. Tiêu đề dính và cột cố định vẫn đứng yên.

**Bảng bố trí thế nào.** Khi chưa cột nào có độ rộng, bảng xếp theo nội dung như mọi bảng NXT. Từ lúc cột đầu tiên được đổi, bảng ghi lại độ rộng hiện tại của **mọi** cột và chuyển sang bố cục cố định rộng đúng bằng tổng: một cột đổi mà các cột còn lại không bị dàn lại. Bảng thu hẹp có thể ngắn hơn vùng chứa, như bảng tính.

**Nội dung rộng hơn cột bị cắt, không có "…".** Ô giữ nguyên nội dung trong DOM (screen reader đọc đủ) và người dùng nới cột để đọc. Đây là ngoại lệ có chủ đích của luật "không cắt chữ": độ rộng do chính người dùng chọn. Vì vậy:

- Đặt `nxtResizeMin` đủ cho nội dung ngắn nhất (mã, ngày, tag trạng thái).
- Chỉ đặt `nxtResizable` trên cột dữ liệu, **không** đặt trên cột chọn (`.nxt-table__select`) hay cột thao tác (`nxtRowActions`).
- Cột có nút sắp xếp được thêm khoảng đệm cuối bằng bề rộng tay nắm để tay nắm không che icon sắp xếp. Cột số (`.nxt-table__num`) giữ khoảng đệm để chữ tiêu đề thẳng với số.

**Lưu độ rộng.** Truyền `[nxtResizeColumns]="columns"` (cùng `NxtColumnsState` dùng cho tuỳ biến cột) thì độ rộng đi theo `columns.value()`, tức nằm trong chế độ xem đã lưu bởi [View Manager](/components/view-manager) (`nxtViewTargets` đã lưu và áp lại `columns`). Không dùng `NxtColumnsState` thì tự lưu qua `(nxtResized)`.

| `NxtColumnsState` | Mô tả |
|-------------------|-------|
| `widths()`, `width(key)` | Độ rộng đã đặt (px), theo khoá. Cột không có trong đó có độ rộng tự nhiên |
| `setWidth(key, px \| null)` | Đặt hoặc bỏ độ rộng một cột. Áp dụng **ngay**, không qua bản nháp của hộp thoại. Làm tròn, bỏ qua khoá lạ và số không dùng được |
| `resetWidths()` | Mọi cột về độ rộng tự nhiên; thứ tự và cột ẩn giữ nguyên |
| `reset()`, "Khôi phục mặc định" của hộp thoại Cài đặt bảng | Về mặc định **gồm cả độ rộng** |

`NxtColumnsValue.widths` là trường tuỳ chọn: chế độ xem đã lưu trước đây (chỉ có `order` và `hidden`) vẫn dùng được. Lưu ý: `nxtViewEqual` của View Manager chưa so độ rộng, nên chỉ đổi độ rộng thì chế độ xem chưa hiện "Đã sửa" (độ rộng vẫn được lưu khi bấm Lưu vì một thay đổi khác).

**Chuyển động.** Tay nắm không có transition nào, nên không cần nhánh riêng cho giảm chuyển động.

## Đang tải

- **Lần đầu**: đặt `loading` trên bảng và `<tbody nxtTablePlaceholder [columns]="n" [rows]="pageSize">` thay cho `tbody` dữ liệu: các hàng giữ chỗ đúng chiều cao mật độ, ẩn với screen reader.
- **Tải lại** (đổi trang, sắp xếp, lọc): chỉ đặt `loading`. Hàng cũ mờ đi và không bấm được, bố cục không nhảy.
- Bảng có `aria-busy="true"` khi đang tải. Báo "Đang tải…" và kết quả qua `role="status"`. Khoá phân trang trong lúc tải.
- Thanh giữ chỗ dùng cùng nền với [Skeleton](/components/skeleton) (`color.bg.placeholder`) và **đứng yên** khi người dùng giảm chuyển động.
- Không dùng spinner che cả trang.

::example{table-loading}

## Header dính

`stickyHeader` giữ hàng tiêu đề ở trên cùng khi bảng cuộn **bên trong vùng chứa của nó**. Đặt bảng trong `nxt-table-scroll` (`label` bắt buộc): vùng cuộn có tên, nhận focus để cuộn bằng phím mũi tên, thanh cuộn dọc và ngang nằm trong lưới. Giới hạn chiều cao bằng `max-block-size`, hoặc dùng `fill` để lấp đầy màn hình (mục dưới).

::example{table-sticky}

**Focus không bị che dưới header dính** (WCAG 2.4.11): trong bảng có `stickyHeader`, phần tử đang focus trong `tbody` có `scroll-margin-block-start` bằng chiều cao hàng tiêu đề. Khi người dùng Tab tới checkbox hay nút ở một hàng đang nằm sau header, trình duyệt cuộn hàng đó ra dưới header thay vì để nó khuất phía sau. Bạn không cần làm gì thêm.

## Lấp đầy màn hình

Trang danh sách vừa khít màn hình: tiêu đề, tab, thanh công cụ và phân trang đứng yên, **chỉ lưới cuộn**, cả dọc lẫn ngang, và thanh cuộn nằm trong lưới. Nối `nxtFill` (`@nxt/ui/layout`) từ vùng nội dung của app shell xuống tới `nxt-table-scroll fill`:

```html
<div class="page" nxtFill>                       <!-- vùng nội dung của trang -->
  <nxt-stack nxtFill>
    <nxt-page-header title="Chức danh" />
    <nxt-card padding="none" fill>
      <div class="toolbar">…tìm kiếm, Bộ lọc, Thêm mới…</div>
      <nxt-table-scroll fill label="Bảng chức danh">
        <table nxtTable stickyHeader>…</table>
      </nxt-table-scroll>
      <div class="footer"><nxt-pagination … /></div>
    </nxt-card>
  </nxt-stack>
</div>
```

- `nxt-table-scroll` là vùng cuộn có tên (`role="region"`, `aria-label`) và nhận focus, nên người dùng bàn phím cuộn được bằng phím mũi tên.
- Khi màn quá thấp, vùng lưới không nhỏ hơn `layout.scroll-region-min` (240px): lúc đó cả trang cuộn, lưới vẫn đọc được.
- Xem mẫu [Danh mục](/templates/catalog): đổi sang 50 dòng/trang để thấy lưới cuộn bên trong.

## Xem chi tiết

Bấm vào tên (một nút trong ô tiêu đề hàng) hoặc bấm vào bất kỳ chỗ trống nào của dòng để mở drawer **xem chi tiết** chỉ đọc; checkbox chỉ để chọn, các nút trên dòng giữ việc của chúng. Hàng đó là [hàng đang mở](#hang-dang-mo) trong lúc drawer mở. Trong drawer có nút bản ghi trước/sau (<kbd>Alt</kbd>+<kbd>↑</kbd>/<kbd>↓</kbd>) để duyệt danh sách mà không phải đóng mở lại, và nút "Sửa" mở form. Xem mẫu [Danh mục](/templates/catalog).

## Thao tác trên hàng

Hành động của bảng đặt ở ba chỗ:

| Chỗ | Khi |
|-----|-----|
| Toolbar | Tác động lên cả bảng (Thêm mới, Xuất, Cài đặt bảng) hoặc lên các hàng đã chọn (thanh hàng loạt) |
| Trong ô | Chỉ tác động dữ liệu của ô đó ("Gán người duyệt" trong ô người duyệt đang trống) |
| Trên hàng (`nxtRowActions`) | Tác động cả hàng, người dùng xử lý **từng** mục: Sửa, Nhân bản, Ngừng sử dụng |

Thao tác của hàng (Sửa, Xoá, ⋯) **không nằm ở cột cuối bảng**: bảng rộng thì người dùng phải cuộn ngang tới cuối mới thấy. Ô `td[nxtRowActions]` không chiếm cột; khi con trỏ ở trên hàng, thanh nút hiện ra ở **mép phải phần đang thấy** của hàng, dù bảng đang cuộn tới đâu (như Gmail, Outlook).

```html
<th scope="col" nxtRowActions></th>            <!-- tiêu đề cột ẩn "Thao tác" -->
…
<td nxtRowActions>
  <button nxtIconButton size="sm" variant="ghost" [attr.aria-label]="'Sửa ' + r.name" nxtTooltip="Sửa">…</button>
  <button nxtIconButton size="sm" variant="ghost" [attr.aria-label]="'Thao tác khác cho ' + r.name" [nxtMenuTriggerFor]="more">…</button>
</td>
```

- Thanh hiện khi: con trỏ ở trên hàng, focus bàn phím nằm trong hàng, hoặc menu ⋯ của hàng đang mở. <kbd>Esc</kbd> ẩn thanh tới khi con trỏ rời hàng.
- Thanh nổi đè lên phần cuối của chính hàng đó, có dải mờ ở mép trái. Vì vậy **giữ ít nút**, và đừng để thông tin quan trọng chỉ nằm ở cột cuối.
- Trên thiết bị cảm ứng (không có hover), thanh luôn hiện dưới dạng cột ghim mép phải, không đè lên dữ liệu.
- Hành động chính (mở chi tiết) gắn vào tên ở ô tiêu đề hàng và cả dòng, không chỉ ở thanh: thanh chỉ hiện khi hover.
- **Đường thứ hai luôn nhìn thấy** (bắt buộc): mọi thao tác trong thanh hover cũng có trong drawer / trang chi tiết của bản ghi, hoặc trên thanh hàng loạt khi chọn hàng. Không thao tác nào **chỉ** nằm trong thanh hover: người dùng mới, người dùng phóng to màn hình và người dùng bàn phím có thể không biết thanh tồn tại.
- Dùng nút `nxtIconButton size="sm" variant="ghost"` với `aria-label` gồm **hành động và đối tượng**: "Sửa Nguyễn Văn An". Thêm `nxtTooltip` với động từ ngắn ("Sửa") cho người dùng chuột.
- Hiện sẵn tối đa 2 nút; các thao tác còn lại gom vào một menu "Thao tác khác cho …".
- Xoá một hàng sẽ xoá luôn nút đang có focus. Chuyển focus sang cùng nút ở hàng kế tiếp, hoặc về vùng bảng khi không còn hàng nào.

::example{table-actions}

**Chọn `reveal`.** Mặc định là `hover`. Đặt `reveal="always"` trên cả `th` và `td` (thanh thành cột ghim ở mép phải vùng cuộn, luôn hiện) khi:

| `reveal` | Dùng khi |
|----------|----------|
| `hover` (mặc định) | Danh mục, danh sách dày dữ liệu cho người dùng thường xuyên; thao tác trên hàng là phụ, việc chính là mở chi tiết |
| `always` | Bảng "việc cần xử lý" (gia hạn hợp đồng, duyệt, đơn của tôi), bảng ngắn, người dùng không thường xuyên; thao tác trên hàng là việc chính |

::example{table-actions-always}

Class `.nxt-table__actions` (cột thao tác tĩnh ở cuối bảng) đã **ngừng dùng**; thay bằng `nxtRowActions`.

Ví dụ đầy đủ với tìm kiếm không dấu, bộ lọc, chế độ xem, tuỳ biến cột, phân trang và form trong drawer: xem mẫu [Danh mục](/templates/catalog).

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Đi qua vùng cuộn, nút sắp xếp, checkbox và nút trên hàng theo thứ tự đọc |
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên tiêu đề cột | Đổi trạng thái sắp xếp: tăng dần → giảm dần → bỏ sắp xếp |
| <kbd>Space</kbd> trên checkbox | Chọn hoặc bỏ chọn hàng |
| <kbd>Shift</kbd>+<kbd>Space</kbd> trên checkbox | Áp cùng trạng thái cho cả dải, từ hàng được chọn lần trước tới hàng này |
| <kbd>Tab</kbd> tới nút thao tác của hàng | Thanh thao tác của hàng hiện ra, nằm trong phần đang thấy |
| <kbd>Esc</kbd> khi con trỏ đang ở trên hàng | Ẩn thanh thao tác hiện do hover, tới khi con trỏ rời hàng. Không ẩn khi focus đang ở trong thanh |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> khi vùng bảng đang focus | Cuộn bảng; cột cố định đứng yên |
| <kbd>Enter</kbd> trên "Cài đặt bảng" | Mở dialog tuỳ biến cột, focus vào ô tìm cột |
| <kbd>Space</kbd> trên checkbox của một cột (dialog) | Hiện / ẩn cột |
| <kbd>Alt</kbd>+<kbd>↑</kbd> / <kbd>↓</kbd> trên checkbox của một cột | Dời cột lên / xuống; vị trí mới được đọc |
| <kbd>Esc</kbd> trong dialog | Đóng, bỏ thay đổi, focus về "Cài đặt bảng" |
| <kbd>←</kbd> / <kbd>→</kbd> trên tay nắm đổi rộng | Đổi độ rộng cột 8px (đảo chiều trong RTL) |
| <kbd>Shift</kbd>+<kbd>←</kbd> / <kbd>→</kbd> trên tay nắm | Đổi 32px |
| <kbd>Home</kbd> / <kbd>End</kbd> trên tay nắm | Cột hẹp nhất / rộng nhất |
| <kbd>Enter</kbd> trên tay nắm, nhấp đúp tay nắm | Về độ rộng mặc định |
| <kbd>Esc</kbd> khi đang kéo tay nắm | Huỷ, cột về độ rộng trước khi kéo |

- Đây là bảng tĩnh, không phải grid tương tác: mỗi nút và checkbox là một điểm dừng Tab. Không thêm `role="grid"` khi chưa có điều hướng ô bằng phím mũi tên.
- Nút sắp xếp là `<button>` nằm trong `th`, nên tên của nút chính là tiêu đề cột; icon mũi tên chỉ để trang trí.
- Tay nắm đổi rộng là `role="separator"` focusable (kiểu window splitter của APG), `aria-orientation="vertical"`, `aria-valuenow` / `aria-valuemin` / `aria-valuemax` theo độ rộng (px) và cận của cột, tên "Đổi độ rộng cột Phòng ban". Mọi việc làm được bằng con trỏ đều làm được bằng bàn phím; vùng chạm rộng ít nhất 24px và cao bằng ô tiêu đề.
- Thanh thao tác khi ẩn chỉ trong suốt: nút vẫn trong thứ tự Tab, screen reader vẫn đọc như một cột "Thao tác" bình thường. Hàng đang chứa focus bàn phím có nền như khi hover.
- Không truyền thông tin chỉ bằng màu: hàng đã chọn còn có checkbox được đánh dấu, hàng tô sáng có chữ giải thích, hàng đang mở có `aria-current="true"`, trạng thái dùng [Tag](/components/tag) có chữ.
- `aria-selected` trên `tr` của bảng native thường không được screen reader đọc: luôn có checkbox có tên trong hàng.
- Không đặt tooltip trên cả hàng. Cột chỉ có icon hoặc avatar không có tiêu đề hiển thị thì có tên ẩn.
- Đang tải: `aria-busy="true"` trên bảng, hàng giữ chỗ ẩn với screen reader; kết quả đọc qua `role="status"`.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Họ và tên | Tên NV |
| Lương cơ bản (₫), đơn vị ở tiêu đề cột | "15.000.000 VNĐ" lặp trong từng ô |
| 20,5 | 20.50 |
| 28/10/2026, căn phải | 2026-10-28 |
| — | N/A, Không có, null |
| Sắp hết hạn · còn 14 ngày (tag cạnh dải tô sáng) | Chỉ dải màu, không có chữ |
| `aria-label="Sửa Nguyễn Văn An"` | `aria-label="Sửa"` |
| Không có ứng viên phù hợp. Thử xoá bộ lọc. | Không có dữ liệu |

## API

::api{table}

## Token

::tokens{component.table}

## Changelog

- **Chưa phát hành**: đổi độ rộng cột `th[nxtResizable]` (`nxtResizeColumns`, `nxtResizeMin`, `nxtResizeMax`, output `nxtResized`; token `resize-handle-hit`, `resize-handle-width`, `resize-handle-color`, `resize-handle-color-active`, `resize-min`, `resize-max`); `NxtColumnsValue.widths` và `NxtColumnsState.widths` / `width` / `setWidth` / `resetWidths`; nút sắp xếp cao bằng cả ô tiêu đề (vùng bấm trước chỉ ~20px cao). Trước đó, theo SAP Fiori: tô sáng hàng `tr[data-highlight]` (token `row-highlight-*`, `row-indicator-width`); hàng đang mở `tr[aria-current]` (`row-bg-current`, `row-current-indicator`); cố định cột `.nxt-table__sticky` + vạch `sticky-divider` khi đã cuộn ngang (`nxt-table-scroll[data-scrolled]`); `loading` + `tbody[nxtTablePlaceholder]` (`placeholder-bg`); tuỳ biến cột `NxtColumnsState`, `nxt-table-columns`, `[nxtTableColumnsFor]`; `NxtSelection.retain` trả số khoá đã bỏ. Luật mới: căn lề, ô trống "—", không cắt chữ, khoảng 8 cột, cột định danh đầu, đường thứ hai cho thao tác hover, chọn `reveal`, chính sách lựa chọn khi kết quả đổi. Trước đó: `th/td[nxtRowActions]`: thao tác trên hàng hiện khi hover / focus ở mép phải phần đang thấy, không chiếm cột; `reveal="always"` cho cột ghim luôn hiện; <kbd>Esc</kbd> ẩn. `.nxt-table__actions` ngừng dùng. Hàng tiêu đề nền `bg.muted`, đường kẻ hàng `border.default`; hàng chứa focus bàn phím có nền hover.

- **0.1.0**: phát hành beta: `table[nxtTable]` với `stickyHeader`; `NxtSort` (`[(nxtSort)]`) và `th[nxtSortHeader]` có `aria-sort`; class `.nxt-table__num`, `.nxt-table__select`, `.nxt-table__actions`; nền cho hàng hover và hàng `aria-selected`; lớp `NxtSelection` với Shift chọn dải; ô dữ liệu không xuống dòng (`.nxt-table__wrap` cho văn bản dài); focus không bị che dưới header dính.

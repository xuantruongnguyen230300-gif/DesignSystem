---
title: View Manager
description: Lưu cách xem một danh sách (tìm kiếm, bộ lọc, sắp xếp, cột, số dòng) thành "chế độ xem" có tên để mở lại bằng một cú bấm, kèm dấu "Đã sửa" khi màn hình lệch chế độ xem đã lưu.
status: beta
group: Hiển thị dữ liệu
order: 32
package: "@nxt/ui/view-manager"
keywords:
  - che do xem
  - view
  - variant
  - bo loc da luu
  - luu bo loc
  - mac dinh
  - ca nhan hoa
  - danh sach
  - list report
  - worklist
---

# View Manager

`nxt-view-manager` là nút **Chế độ xem** ở đầu một danh sách: hiện tên chế độ xem đang dùng và số bản ghi, cho chọn chế độ xem khác, lưu, lưu thành chế độ xem mới và quản lý. Một chế độ xem gói **tìm kiếm + bộ lọc + sắp xếp + cột + số dòng/trang** trong một kiểu dữ liệu chung (`NxtViewState`), nên bộ lọc, tuỳ biến cột và URL dùng cùng một hình dạng.

## Khi nào dùng

- Trang danh sách hoặc hàng đợi việc người dùng mở hằng ngày, mỗi lần với một cách lọc quen thuộc: "Chức danh Khối Kinh doanh đang dùng", "Đơn nghỉ phép Phòng Nhân sự".
- Bảng có [tuỳ biến cột](/components/table#tuy-bien-cot): người dùng muốn giữ bộ cột của mình cho lần sau.

## Khi nào không dùng

- **Vài phạm vi cố định** người dùng không tự tạo thêm ("Chờ tôi duyệt / Đã xử lý"): dùng [Tabs](/components/tabs), mỗi tab giữ trạng thái riêng.
- **Danh sách ít dùng**, ít bản ghi (danh mục mở vài lần một năm): chỉ cần tiêu đề trang.
- **Bảng con** trong trang chi tiết: không cần chế độ xem.
- **Hai chế độ xem trên một trang** (một cho bộ lọc, một cho bảng): dùng một chế độ xem cho cả trang.

## Ví dụ

Mở **Chế độ xem**, chọn "Phòng Nhân sự theo ngày vào làm": tìm kiếm, bộ lọc, sắp xếp và cột đổi một lượt. Gõ vào ô tìm kiếm: nút hiện **Đã sửa**. Chọn **Lưu thành chế độ xem mới…** để giữ lại, hoặc **Quản lý chế độ xem…** để đổi tên, xoá, chọn mặc định.

::example{view-manager-basic}

## Anatomy

| # | Phần tử | Ghi chú |
|---|---------|---------|
| 1 | Nút "Chế độ xem" | Tên chế độ xem đang dùng (đậm) + **Đã sửa** khi màn hình lệch chế độ xem đã lưu + mũi tên. Nằm ở hàng tiêu đề danh sách, ngay trên ô tìm kiếm và Bộ lọc |
| 2 | Số bản ghi | "8 nhân viên": số đang hiện sau tìm kiếm và lọc (input `count`, `itemLabel`) |
| 3 | Menu | Các chế độ xem (đang dùng có dấu check, mặc định ghi "Mặc định"), Lưu, Lưu thành chế độ xem mới…, Quản lý chế độ xem… |
| 4 | Dialog "Lưu chế độ xem" | Tên (bắt buộc, không trùng), "Đặt làm mặc định khi mở trang" |
| 5 | Dialog "Quản lý chế độ xem" | Bảng: Mặc định (radio), Tên (sửa được, trừ chế độ xem chuẩn), Xoá |

## Hành vi

- **Chọn là áp dụng ngay**: tìm kiếm, bộ lọc, sắp xếp, cột và số dòng/trang đổi theo chế độ xem, về trang 1. Sau đó trang áp chính sách lựa chọn của bảng: bỏ chọn các hàng không còn trong kết quả (`selection.retain`).
- **Đã sửa**: so trạng thái đang hiện với chế độ xem đã lưu bằng `nxtViewEqual` (mảng bộ lọc so như tập hợp, thứ tự cột so đúng thứ tự). Hiện bằng chữ, không chỉ dấu "*".
- **Lưu** ghi đè chế độ xem đang dùng. Bị khoá với chế độ xem chuẩn ("Tiêu chuẩn" đi kèm sản phẩm không sửa, không xoá) và khi chưa có thay đổi.
- **Lưu thành chế độ xem mới…** tạo chế độ xem từ trạng thái hiện tại và chọn nó; có thể đặt làm mặc định.
- **Quản lý chế độ xem…**: đổi tên, xoá, chọn mặc định; không có gì thay đổi tới khi bấm "Lưu", "Huỷ" bỏ hết. Xoá chế độ xem đang dùng thì chuyển về chế độ xem mặc định.
- **Mặc định khi mở trang**: chỉ một chế độ xem. Khi `NxtViews` nạp xong từ store, chế độ xem mặc định được áp dụng.
- Chế độ xem **không lưu** trang hiện tại, hàng đang chọn, hàng đang mở hay tab: đó là trạng thái của phiên làm việc.

### NxtViews và nơi lưu

`NxtViews<F>` giữ danh sách chế độ xem bằng signal; `nxt-view-manager` chỉ là giao diện của nó. Mỗi danh sách (mỗi tab) một instance. Nơi lưu là một adapter `NxtViewStore<F>` do sản phẩm cung cấp (máy chủ, `localStorage`…); ví dụ dùng `NxtMemoryViewStore`.

```ts
protected readonly query = signal('');
protected readonly filters = new NxtFilterState({ status: 'all', depts: [] as string[] });
protected readonly sort = signal<NxtSortState>({ active: 'name', direction: 'asc' });
protected readonly columns = new NxtColumnsState([...]);
protected readonly page = signal(1);

protected readonly views = new NxtViews({
  // current() đọc màn hình, apply() đưa một chế độ xem lên màn hình
  ...nxtViewTargets({ query: this.query, filters: this.filters, sort: this.sort, columns: this.columns, page: this.page }),
  store: this.viewStore, // NxtViewStore: load() / save()
});
```

```html
<nxt-view-manager [views]="views" [count]="rows().length" itemLabel="chức danh" />
```

Adapter tối thiểu lưu trên máy chủ:

```ts
const store: NxtViewStore<Filters> = {
  load: () => firstValueFrom(http.get<NxtViewData<Filters>>('/api/views/chuc-danh')),
  save: (data) => firstValueFrom(http.put('/api/views/chuc-danh', data)).then(() => undefined),
};
```

| `NxtViewState<F>` | Kiểu | Ghi chú |
|-------------------|------|---------|
| `query` | `string` | Nội dung ô tìm kiếm |
| `filters` | `F` | `NxtFilterState.applied()`; chế độ xem cũ thiếu tiêu chí mới thì tiêu chí đó lấy giá trị "không lọc" |
| `sort` | `NxtSortState` | |
| `columns` | `NxtColumnsValue` | Thứ tự mọi cột và cột ẩn (`NxtColumnsState.value()`) |
| `pageSize` | `number` | Số dòng/trang |

| `NxtViews` | Mô tả |
|------------|-------|
| `views()`, `selected()`, `selectedId()`, `defaultId()` | Danh sách (chuẩn trước), đang dùng, mặc định |
| `modified()` | Màn hình lệch chế độ xem đang dùng |
| `select(id)` | Chọn và áp dụng |
| `save()`, `saveAs(name, { makeDefault })`, `manage({ names, removed, defaultId })` | Ghi qua store; trả `Promise` |
| `ready` | `Promise` nạp xong từ store |

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Enter</kbd> / <kbd>Space</kbd> / <kbd>↓</kbd> trên nút | Mở menu, focus chế độ xem đầu tiên |
| <kbd>↑</kbd> / <kbd>↓</kbd>, <kbd>Home</kbd> / <kbd>End</kbd> | Chuyển mục trong menu |
| <kbd>Enter</kbd> trên một chế độ xem | Áp dụng, đóng menu, focus về nút; "Đang xem: …" được đọc |
| <kbd>Enter</kbd> trên "Lưu thành…" / "Quản lý…" | Mở dialog, focus vào ô đầu tiên |
| <kbd>Enter</kbd> trong ô tên | Lưu; tên trống hoặc trùng thì báo lỗi tại ô và giữ focus |
| <kbd>Esc</kbd> | Đóng menu hoặc dialog, không đổi gì, focus về nút "Chế độ xem" |

- Tên truy cập của nút: "Chế độ xem: Tiêu chuẩn, Đã sửa". Menu là nhóm `menuitemradio` có tên "Chế độ xem".
- "Lưu" khi bị khoá vẫn focus được (`aria-disabled`) và tên truy cập nói lý do.
- Kết quả (đã lưu, đang xem, lỗi) được đọc qua `role="status"` trong component.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Chế độ xem | Variant, Bộ lọc đã lưu |
| Khối Kinh doanh đang sử dụng | Chế độ xem 1 |
| Tiêu chuẩn · Đã sửa | Tiêu chuẩn* |
| Đã có chế độ xem tên này. Đặt tên khác. | Tên không hợp lệ |

## API

::api{view-manager}

## Token

::tokens{component.view-manager}

## Changelog

- **Chưa phát hành**: thêm `nxt-view-manager`, `NxtViews`, `NxtViewState`, `nxtViewEqual`, `nxtViewTargets`, `NxtViewStore` / `NxtMemoryViewStore` (theo SAP Fiori: Variant Management).

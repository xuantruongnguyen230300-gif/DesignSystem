---
title: Value help
description: Chọn một hoặc nhiều bản ghi từ danh mục lớn có nhiều thuộc tính (nhân viên > 1.000) bằng ô tìm trên mọi cột và bảng kết quả; đặt trong dialog khi trường ở trang, hoặc làm một bước ngay trong drawer.
status: beta
group: Nhập liệu
order: 10
package: "@nxt/ui/value-help"
keywords:
  - value help
  - chon tu danh sach
  - danh sach day du
  - chon nhan vien
  - nguoi phe duyet
  - select dialog
  - table select dialog
  - hop thoai chon
  - chon nhieu
  - tim kiem
  - danh muc lon
---

# Value help

`nxt-value-help` là phần **nội dung** để chọn từ một danh mục lớn: ô tìm trên mọi cột, dòng số kết quả và bảng `table[nxtTable]`. Người dùng tìm "nguyen van an kho", thấy đủ mã, phòng ban, chức danh để phân biệt hai người trùng tên, rồi chọn. Component không tự mở lớp phủ: đặt nó trong dialog hoặc làm một bước trong drawer.

## Khi nào dùng

- Danh mục > 200 mục, hoặc người dùng cần ≥ 3 thuộc tính để nhận ra đúng mục: nhân viên, người phê duyệt, hợp đồng, tài sản.
- Mở từ nút "Mở danh sách đầy đủ" của [Combobox](/components/combobox) (`valueHelp`), hoặc từ nút "Chọn …" cạnh một danh sách đã chọn.

## Khi nào không dùng

- **≤ 200 mục, tên (và mã) là đủ**: [Combobox](/components/combobox), gõ để lọc ngay trong ô.
- **Lọc danh sách của trang**, không chọn giá trị để lưu: [Search](/components/search) và [Filter](/components/filter).
- **Cần tab, điều kiện phức tạp (khoảng, loại trừ), hay nút "Thêm mới" trong lúc chọn**: dựng trang hoặc drawer riêng cho việc đó.

## Đặt ở đâu

| Trường nằm ở | Đặt value help trong | Vì sao |
|--------------|---------------------|--------|
| Trang (form trang, thanh công cụ) | [Dialog](/components/dialog) `size: 'lg'`, `nxt-dialog-layout [closable]="false"` | Một lớp modal. Không có nút "Đóng" nên ô tìm nhận focus đầu tiên; Esc và "Huỷ" là huỷ; đóng thì focus về nút đã mở |
| [Drawer](/components/drawer) (form tạo / sửa) | **Một bước trong drawer**: tiêu đề đổi thành "Chọn …", form ẩn bằng `[hidden]`, `nxt-value-help step` lấp thân drawer, footer đổi thành Huỷ | NXT không mở dialog từ trong drawer (modal chồng modal). Bước trong drawer giữ một lớp modal và dùng hết chiều cao drawer cho bảng |

Theo SAP Fiori (Select Dialog, Table Select Dialog, Value Help Dialog): ô tìm là phần tử nhận focus đầu tiên; kết quả có sẵn khi mở; chữ đã gõ ở ô gốc được chuyển sang ô tìm; chọn một là xong, không cần nút "Chọn"; chọn nhiều có ô check, "Đã chọn: N", Chọn / Huỷ; mã và tên ở hai cột đầu, tối đa 4–5 cột.

## Ví dụ

### Chọn một, trong dialog

Combobox "Người phê duyệt" gợi ý khi gõ; nút "Mở danh sách đầy đủ" mở dialog với chữ đã gõ trong ô tìm. Bấm tên (hoặc bất kỳ đâu trên hàng) là chọn và đóng. Dữ liệu ở đây tải từ "máy chủ" theo chữ tìm (`searchMode="server"`, 50 hàng mỗi lần, có `total`).

::example{value-help-dialog}

- `value` đánh dấu người đang được chọn (`aria-current`, nền chọn và dấu ✓).
- Sau khi chọn, đưa người đó vào `options` của combobox để ô hiện được tên (xem [Combobox](/components/combobox), mục gợi ý từ máy chủ).
- Footer chỉ có "Huỷ". Esc cũng là huỷ: ô tìm còn chữ thì Esc xoá chữ trước.

### Chọn nhiều, trong dialog

`multiple` + `[(values)]` là **bản nháp**: chép giá trị của trường vào khi mở, chỉ áp vào trường khi bấm "Chọn N nhân viên". "Huỷ" bỏ bản nháp. Shift + bấm chọn cả dải; ô ở tiêu đề chọn mọi kết quả đang hiện.

::example{value-help-multiple}

- Danh mục 1.250 người lọc tại máy (`searchMode="local"`); bảng hiện tối đa 200 hàng (`limit`) và dòng kết quả nhắc "Gõ thêm để thu hẹp".
- Nút xác nhận ghi số lượng: "Chọn 3 nhân viên", khoá khi chưa chọn ai.

### Chọn trong drawer (một bước)

Form "Thêm bước duyệt" nằm trong drawer. "Mở danh sách đầy đủ" thay form bằng bước "Chọn người duyệt" ngay trong drawer: form chỉ bị ẩn nên chữ đã nhập còn nguyên. Chọn một người, hoặc "Huỷ" / Esc, là quay lại form và focus về trường "Người duyệt".

::example{value-help-drawer-step}

```html
<nxt-drawer-layout [title]="picking() ? 'Chọn người duyệt' : 'Thêm bước duyệt'">
  <form [hidden]="picking()">…</form>
  @if (picking()) {
    <nxt-value-help step caption="Nhân viên" … (picked)="onPicked($event)" (cancelled)="back()" />
  }
  <div nxtDrawerFooter>…</div>
</nxt-drawer-layout>
```

- `step`: ô tìm nhận focus khi bước hiện; Esc khi ô tìm trống phát `cancelled` (quay lại form) thay vì đóng cả drawer.
- Khi quay lại, đưa focus về trường đã mở bước (`nxt-combobox.focus()` sau lần render kế, `afterNextRender`).

## Anatomy

1. **Ô tìm** ([Search](/components/search)): tìm trên mọi cột, không phân biệt dấu.
2. **Ghi chú** (`hint`): lọc cố định mà người dùng không đổi được, ví dụ "Chỉ hiện nhân viên đang làm việc."
3. **Dòng kết quả** (`role="status"`): "128 kết quả", "Hiện 200 / 1.250 kết quả. Gõ thêm để thu hẹp."
4. **"Đã chọn: N"** + "Bỏ chọn tất cả" (chỉ khi chọn nhiều), đứng yên trên bảng.
5. **Bảng** trong vùng cuộn có tên, tiêu đề dính; cột tên là tiêu đề hàng.
6. **Footer** của nơi chứa: "Huỷ" (chọn một), "Huỷ" + "Chọn N …" (chọn nhiều).

## Hành vi & trạng thái

| Trạng thái | Hiển thị |
|------------|----------|
| Mở | Kết quả có sẵn; chữ đã gõ ở ô gốc nằm trong ô tìm |
| Giá trị hiện tại (chọn một) | Hàng có nền chọn, dấu ✓, `aria-current="true"` |
| Đã chọn (chọn nhiều) | Ô check, nền chọn của bảng, "Đã chọn: N" |
| Đang tải | Bảng `aria-busy` và mờ đi; lần đầu chưa có hàng thì hiện hàng giữ chỗ; dòng kết quả "Đang tải…" |
| Không có kết quả | "Không có kết quả khớp “…”" + "Xoá tìm kiếm" |
| Nhiều hơn `limit` (tại máy) | Hiện `limit` hàng đầu, nhắc gõ thêm để thu hẹp |

Trong dialog, vùng bảng cao cố định (10 hàng theo mật độ) nên dialog không nhảy khi gõ lọc. Trong bước drawer, vùng bảng lấp chỗ còn lại.

## Accessibility

| Phím | Hành vi |
|------|---------|
| (khi mở) | Focus ô tìm |
| Gõ | Lọc; dòng kết quả đọc số kết quả |
| <kbd>↓</kbd> trong ô tìm | Tới nút / ô check của hàng đầu |
| <kbd>↓</kbd> / <kbd>↑</kbd> trong bảng | Hàng kế / hàng trước; ↑ ở hàng đầu về ô tìm |
| <kbd>Home</kbd> / <kbd>End</kbd> trong bảng | Hàng đầu / hàng cuối |
| <kbd>Enter</kbd> trong ô tìm (chọn một) | Còn đúng một kết quả: chọn luôn |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Nút tên: chọn hàng. Ô check: chọn / bỏ hàng |
| <kbd>Shift</kbd>+<kbd>Space</kbd>, Shift+bấm | Áp cùng trạng thái cho cả dải (chọn nhiều) |
| <kbd>Esc</kbd> | Ô tìm có chữ: xoá chữ. Trống: dialog đóng (huỷ); bước drawer quay lại form |
| <kbd>Tab</kbd> | Đi qua ô tìm, "Bỏ chọn tất cả", các ô check / nút trong bảng, footer |

- Bảng native có tên (`caption`), vùng cuộn có tên và cuộn được bằng phím. Cột tên là `th scope="row"`, nên screen reader đọc tên người cùng với từng ô.
- Chọn một: mỗi hàng có nút "Chọn Nguyễn Văn An (NV-0012)", chứa đúng chữ nhìn thấy. Bấm chuột lên hàng là đường tắt cho chuột; bàn phím luôn có nút.
- Chọn nhiều: ô check từng hàng có tên "Chọn …"; ô ở tiêu đề "Chọn tất cả kết quả đang hiện" có trạng thái một phần. "Đã chọn: N" được đọc lên khi đổi.
- ↑/↓ là phím tắt thêm trên thứ tự Tab bình thường; bảng không phải grid.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Tiêu đề "Chọn người phê duyệt" (một), "Chọn các nhân viên áp dụng" (nhiều) | "Value help", "Tìm kiếm" |
| Cột "Mã NV", "Họ và tên", "Phòng ban", "Chức danh" (≤ 5 cột, mã và tên trước) | 8 cột, cuộn ngang để thấy tên |
| Nút "Chọn 3 nhân viên" | "OK", "Xác nhận" |
| `itemLabel` "Nguyễn Văn An (NV-0012)" khi tên có thể trùng | Chỉ họ tên |
| Ghi chú lọc cố định: "Chỉ hiện nhân viên đang làm việc." | Lọc ẩn mà không nói, người dùng tưởng thiếu dữ liệu |

## API

::api{value-help}

`NxtValueHelpColumn<T>`: `{ id: string; header: string; value: (item: T) => string | number | null | undefined; numeric?: boolean; rowHeader?: boolean }`. Ô trống hiện "—". Cột `rowHeader` (mặc định cột đầu) là tiêu đề hàng và chứa nút chọn.

`texts` (i18n): `search`, `searchPlaceholder`, `loading`, `clearSelection`, `selectAll`, `emptyHint`, `clearSearch`, và các hàm `summary(shown, total)`, `selected(n)`, `select(label)`, `pick(label)`, `emptyTitle(query)`.

## Token

::tokens{component.value-help}

## Changelog

- **Chưa phát hành**: thêm `nxt-value-help` (chọn một / nhiều, tìm trên mọi cột, `searchMode="server"` + `total`, `limit`, `loading`, `hint`, chế độ `step` cho drawer, `texts`).

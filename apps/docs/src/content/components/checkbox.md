---
title: Checkbox
description: Chọn một hoặc nhiều mục độc lập, có nhóm với lỗi cấp nhóm, ô xác nhận bắt buộc, chỉ đọc, indeterminate cho "chọn tất cả" và chạy được với Angular forms.
status: beta
group: Nhập liệu
order: 6
package: "@nxt/ui/checkbox"
keywords:
  - o chon
  - hop kiem
  - checkbox
  - chon nhieu
  - chon tat ca
  - danh dau
  - tick
  - xac nhan
  - shift click
  - chon dai
  - nhom checkbox
  - bat buoc
  - chi doc
---

# Checkbox

## Khi nào dùng

- Chọn nhiều mục độc lập trong một nhóm: kênh nhận thông báo, quyền, cột hiển thị.
- Một lựa chọn bật/tắt **có hiệu lực khi gửi form**: "Gửi bản sao cho quản lý trực tiếp".
- Xác nhận trước khi gửi: "Tôi xác nhận bảng công tháng 9 là chính xác".
- Chọn hàng trong bảng: xem [Table](/components/table).

## Khi nào không dùng

- **Bật/tắt có hiệu lực ngay**, không cần bấm Lưu: dùng [Switch](/components/switch).
- **Chọn đúng một trong nhiều giá trị**: dùng [Radio group](/components/radio-group) trong form, [Segmented](/components/segmented) để đổi chế độ xem.
- **Danh sách dài cần tìm** (hơn khoảng 8 lựa chọn): dùng combobox chọn nhiều.

## Nhóm lựa chọn

Bọc các ô trong `nxt-checkbox-group`. Nhóm là một `<fieldset>` với `<legend>` là câu hỏi chung (`label`), gợi ý của nhóm ngay dưới legend, và các ô xếp dọc. Screen reader đọc legend khi focus vào ô đầu tiên của nhóm, nên nhãn từng ô có thể ngắn.

::example{checkbox-group}

- `label` là bắt buộc ở cả nhóm và từng ô. Nhãn bọc cả ô và chữ, nên bấm vào chữ cũng chọn được và vùng chạm luôn tối thiểu 24×24px.
- Quy tắc chọn ghi trong ngoặc ở nhãn nhóm: "Kênh nhận thông báo (chọn ít nhất một)".
- Checkbox `disabled` không focus được: ghi lý do trong `hint` của ô đó.
- Nhóm không giữ giá trị: mỗi ô vẫn có `[(checked)]` hoặc `formControlName` riêng. Nhóm đặt tên, gợi ý, lỗi và trạng thái chung (`disabled`, `readonly`) cho mọi ô bên trong.
- `orientation="horizontal"` chỉ cho 2–3 nhãn ngắn; trong form để dọc.

## Gợi ý dưới nhãn

`hint` đặt một dòng chữ nhỏ dưới nhãn, cùng kiểu với gợi ý của [Form field](/components/form-field), để giải thích hệ quả hoặc điều kiện của lựa chọn mà không làm nhãn dài ra.

::example{checkbox-hint}

- Gợi ý nằm ngoài `<label>` và được nối vào ô bằng `aria-describedby`: screen reader đọc tên, trạng thái, rồi mới đến gợi ý. Bấm vào gợi ý không đổi trạng thái ô.
- Nhãn nói **điều được chọn**, gợi ý nói **điều sẽ xảy ra**: nhãn "Được từ chối", gợi ý "Đơn kết thúc ngay, các bước sau không nhận được đơn."
- Không dùng `hint` cho thông báo lỗi: dùng `error` (xem [Bắt buộc và lỗi](#bat-buoc-va-loi)).

## Bắt buộc và lỗi

**Lỗi cấp nhóm** (chưa chọn ô nào trong nhóm bắt buộc): đặt `error` trên `nxt-checkbox-group`. Thông điệp nằm **dưới nhóm**, mọi ô trong nhóm có viền lỗi và `aria-invalid`, `fieldset` được mô tả bằng gợi ý rồi lỗi. `required` thêm `*` sau legend và chữ ẩn "(bắt buộc)" (đổi bằng `requiredLabel`), vì nhóm `group` không nhận `aria-required`.

::example{checkbox-validation}

**Một ô bắt buộc** (cam kết, xác nhận trước khi gửi): `required` thêm `*` sau nhãn và `aria-required`; `error` hiện lỗi ngay dưới ô (trên gợi ý) và nối vào `aria-describedby`. `invalid` đánh dấu lỗi mà không có thông điệp riêng, khi thông điệp nằm ở chỗ khác.

Như form field: kiểm tra khi gửi, báo số mục cần sửa qua `role="status"` và đưa focus về ô lỗi đầu tiên (`input[aria-invalid="true"]`).

## Chỉ đọc

`readonly` (trên ô hoặc trên cả nhóm) dùng trong form đang sửa khi giá trị không đổi được ở bước này, ví dụ phụ cấp của hợp đồng đã ký. Ô chỉ đọc vẫn nhận focus và đọc được (`aria-readonly`), bấm hoặc <kbd>Space</kbd> không đổi gì; ô đã chọn có màu trung tính thay cho màu nhấn.

::example{checkbox-readonly}

Ô chưa chọn ở trạng thái chỉ đọc trông gần như ô thường (ô native không đổi được màu viền), nên luôn ghi lý do trong `hint` của nhóm hoặc của ô. Trang xem chi tiết dùng [Descriptions](/components/descriptions), không dùng checkbox chỉ đọc.

## Chọn tất cả

Ô cha ở trạng thái **indeterminate** khi chỉ một phần ô con được chọn; screen reader đọc là "chọn một phần" (mixed). Bấm ô cha khi đang indeterminate sẽ chọn tất cả, bấm lần nữa sẽ bỏ chọn tất cả.

::example{checkbox-select-all}

`indeterminate` là input một chiều: bạn tự tính từ trạng thái các ô con, component không tự suy ra.

```ts
protected readonly all = computed(() => this.granted().size === this.permissions.length);
protected readonly some = computed(() => this.granted().size > 0 && !this.all());
```

```html
<nxt-checkbox label="Tất cả quyền" [checked]="all()" [indeterminate]="some()" (checkedChange)="setAll($event)" />
```

## Chọn một dải bằng Shift

Output `toggled` phát `{ checked, shiftKey }` mỗi khi **người dùng** đổi ô (bấm chuột, chạm, hoặc <kbd>Space</kbd>), kèm việc có giữ <kbd>Shift</kbd> hay không. Sự kiện `change` gốc không mang phím bổ trợ, nên component lấy `shiftKey` từ cú bấm chuột hoặc phím ngay trước đó.

Dùng `toggled` cho cột chọn hàng của bảng, để Shift+click (hoặc <kbd>Shift</kbd>+<kbd>Space</kbd>) chọn cả một dải hàng như Gmail và Windows Explorer, cùng với `NxtSelection`:

```html
<nxt-checkbox [label]="'Chọn ' + r.name" hideLabel
  [checked]="selection.has(r.code)"
  (toggled)="selection.select(r.code, $event.checked, { range: $event.shiftKey, order: pageKeys() })" />
```

- `toggled` chỉ phát khi người dùng thao tác; đặt `checked` từ code hoặc qua forms (`writeValue`) không phát. `checkedChange` vẫn phát như cũ.
- Ví dụ chạy được và bảng API của `NxtSelection` ở [Table: chọn nhiều hàng](/components/table#chon-nhieu-hang).

## Với Angular forms

`NxtCheckbox` implement `ControlValueAccessor`, nên dùng được với `formControlName`, `[formControl]` và `[(ngModel)]`:

- `form.disable()` / `control.disable()` vô hiệu hoá checkbox qua `setDisabledState`.
- Control được đánh dấu touched khi checkbox mất focus.
- Validator như `Validators.requiredTrue` hoạt động bình thường.

::example{checkbox-forms}

Nếu không dùng forms, bind hai chiều qua model `checked`:

```html
<nxt-checkbox label="Gửi bản sao cho quản lý trực tiếp" [(checked)]="sendCopy" />

<!-- Template-driven forms (FormsModule) -->
<nxt-checkbox label="Gửi bản sao cho quản lý trực tiếp" name="sendCopy" [(ngModel)]="sendCopy" />
```

Với ô bắt buộc mà người dùng chưa chọn: truyền thông điệp vào `error` (ví dụ trên dùng `Validators.requiredTrue`), báo qua `role="status"` và đưa focus về ô đó.

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Focus vào/ra từng checkbox |
| <kbd>Space</kbd> | Chọn hoặc bỏ chọn; ô đang indeterminate chuyển sang được chọn. Ô `readonly` không đổi |
| <kbd>Shift</kbd>+<kbd>Space</kbd> | Như <kbd>Space</kbd>, và `toggled` báo `shiftKey: true` (chọn dải trong bảng) |

- Dùng `<input type="checkbox">` native trong `<label>`, nên role, trạng thái `checked`/`mixed` và `disabled` do trình duyệt cung cấp.
- `hideLabel` (cho cột chọn trong bảng) chỉ ẩn chữ khỏi mắt nhìn, nhãn vẫn được đọc. Nhãn phải nêu đối tượng: "Chọn Nguyễn Văn An", không chỉ "Chọn".
- Màu ô đã chọn lấy từ `component.checkbox.accent` qua `accent-color`; vòng focus dùng `focus.ring.*`.
- `hint` và `error` là mô tả (`aria-describedby`, lỗi trước gợi ý), không phải một phần của tên: tên vẫn là nhãn.
- Lỗi: `aria-invalid="true"` trên ô, thông điệp có icon và chữ; viền đỏ quanh ô chỉ là tín hiệu phụ. Lỗi nhóm nối vào `fieldset` bằng `aria-describedby`.
- `required` dùng `aria-required`, không dùng thuộc tính `required` native (tránh bong bóng lỗi của trình duyệt).
- Chỉ đọc: `aria-readonly="true"`, vẫn trong thứ tự Tab.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Gửi bản sao cho quản lý trực tiếp | Không gửi bản sao (nhãn phủ định) |
| Email công ty (trong nhóm "Kênh nhận thông báo") | Bật thông báo qua email công ty |
| Tôi xác nhận bảng công tháng 9 là chính xác | Đồng ý |
| Chọn Nguyễn Văn An | Chọn |
| Nhãn "Được từ chối", gợi ý "Đơn kết thúc ngay, các bước sau không nhận được đơn." | Nhãn "Được từ chối (đơn kết thúc ngay, các bước sau không nhận được đơn)" |
| Lỗi nhóm: "Chọn ít nhất một loại hợp đồng áp dụng." | "Trường này là bắt buộc" |

## API

::api{checkbox}

## Token

::tokens{component.checkbox}

## Changelog

- **0.1.0**: phát hành beta: model `checked`, `indeterminate`, `label` bắt buộc, `hideLabel`, `disabled`, `ControlValueAccessor` cho Reactive Forms và `ngModel`; output `toggled` (`{ checked, shiftKey }`) cho Shift chọn dải.
- **Chưa phát hành**: input `hint`, gợi ý dưới nhãn nối bằng `aria-describedby`. Token mới `checkbox.hint-text`.
- **Chưa phát hành**: `error`, `invalid`, `required`, `readonly` cho `nxt-checkbox`; component mới `nxt-checkbox-group` (legend, gợi ý, lỗi cấp nhóm dưới nhóm, `required`, `disabled`, `readonly`, `orientation`). Ô native được đặt lại theo giá trị khi form đặt lại giá trị trước lần render kế tiếp. Token mới `checkbox.{accent-readonly,group-label-text,error-text,required-text,border-invalid}`.

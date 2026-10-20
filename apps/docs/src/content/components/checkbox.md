---
title: Checkbox
description: Chọn một hoặc nhiều mục độc lập, có trạng thái indeterminate cho "chọn tất cả" và chạy được với Angular forms.
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
---

# Checkbox

## Khi nào dùng

- Chọn nhiều mục độc lập trong một nhóm: kênh nhận thông báo, quyền, cột hiển thị.
- Một lựa chọn bật/tắt **có hiệu lực khi gửi form**: "Gửi bản sao cho quản lý trực tiếp".
- Xác nhận trước khi gửi: "Tôi xác nhận bảng công tháng 9 là chính xác".
- Chọn hàng trong bảng: xem [Table](/components/table).

## Khi nào không dùng

- **Bật/tắt có hiệu lực ngay**, không cần bấm Lưu: dùng switch (đợt B).
- **Chọn đúng một trong nhiều giá trị**: dùng radio hoặc segmented control.
- **Danh sách dài cần tìm**: dùng combobox chọn nhiều (đợt B).

## Nhóm lựa chọn

Đặt nhóm checkbox trong `<fieldset>`, với `<legend>` là câu hỏi chung của nhóm. Screen reader đọc legend khi focus vào ô đầu tiên của nhóm, nên nhãn từng ô có thể ngắn.

::example{checkbox-group}

- `label` là bắt buộc. Nhãn bọc cả ô và chữ, nên bấm vào chữ cũng chọn được và vùng chạm luôn tối thiểu 24×24px.
- Checkbox `disabled` không focus được: ghi lý do ngay trong nhãn hoặc bên cạnh, ví dụ "Zalo (chưa kết nối, liên hệ quản trị viên)".

## Gợi ý dưới nhãn

`hint` đặt một dòng chữ nhỏ dưới nhãn, cùng kiểu với gợi ý của [Form field](/components/form-field), để giải thích hệ quả hoặc điều kiện của lựa chọn mà không làm nhãn dài ra.

::example{checkbox-hint}

- Gợi ý nằm ngoài `<label>` và được nối vào ô bằng `aria-describedby`: screen reader đọc tên, trạng thái, rồi mới đến gợi ý. Bấm vào gợi ý không đổi trạng thái ô.
- Nhãn nói **điều được chọn**, gợi ý nói **điều sẽ xảy ra**: nhãn "Được từ chối", gợi ý "Đơn kết thúc ngay, các bước sau không nhận được đơn."
- Không dùng `hint` cho thông báo lỗi. Checkbox chưa có trạng thái lỗi (xem [Với Angular forms](#voi-angular-forms)).

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

Checkbox chưa nối được thông báo lỗi vào ô bên trong bằng `aria-describedby`. Với checkbox bắt buộc mà người dùng chưa chọn, hãy làm như ví dụ: hiện lỗi ngay dưới ô, báo qua `role="status"` và đưa focus về ô đó.

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Focus vào/ra từng checkbox |
| <kbd>Space</kbd> | Chọn hoặc bỏ chọn; ô đang indeterminate chuyển sang được chọn |
| <kbd>Shift</kbd>+<kbd>Space</kbd> | Như <kbd>Space</kbd>, và `toggled` báo `shiftKey: true` (chọn dải trong bảng) |

- Dùng `<input type="checkbox">` native trong `<label>`, nên role, trạng thái `checked`/`mixed` và `disabled` do trình duyệt cung cấp.
- `hideLabel` (cho cột chọn trong bảng) chỉ ẩn chữ khỏi mắt nhìn, nhãn vẫn được đọc. Nhãn phải nêu đối tượng: "Chọn Nguyễn Văn An", không chỉ "Chọn".
- Màu ô đã chọn lấy từ `component.checkbox.accent` qua `accent-color`; vòng focus dùng `focus.ring.*`.
- `hint` là mô tả (`aria-describedby`), không phải một phần của tên: tên vẫn là nhãn.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Gửi bản sao cho quản lý trực tiếp | Không gửi bản sao (nhãn phủ định) |
| Email công ty (trong nhóm "Kênh nhận thông báo") | Bật thông báo qua email công ty |
| Tôi xác nhận bảng công tháng 9 là chính xác | Đồng ý |
| Chọn Nguyễn Văn An | Chọn |
| Nhãn "Được từ chối", gợi ý "Đơn kết thúc ngay, các bước sau không nhận được đơn." | Nhãn "Được từ chối (đơn kết thúc ngay, các bước sau không nhận được đơn)" |

## API

::api{checkbox}

## Token

::tokens{component.checkbox}

## Changelog

- **0.1.0**: phát hành beta: model `checked`, `indeterminate`, `label` bắt buộc, `hideLabel`, `disabled`, `ControlValueAccessor` cho Reactive Forms và `ngModel`; output `toggled` (`{ checked, shiftKey }`) cho Shift chọn dải.
- **Chưa phát hành**: input `hint`, gợi ý dưới nhãn nối bằng `aria-describedby`. Token mới `checkbox.hint-text`.

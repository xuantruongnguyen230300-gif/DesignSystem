---
title: Radio group
description: Chọn đúng một trong 3–8 phương án luôn hiển thị trong form — hình thức làm việc, loại hợp đồng — có lỗi cấp nhóm, chỉ đọc và chạy với Angular forms.
status: beta
group: Nhập liệu
order: 6
package: "@nxt/ui/radio-group"
keywords:
  - radio
  - radio button
  - nut radio
  - chon mot
  - nhom lua chon
  - phuong an
  - hinh thuc lam viec
  - gioi tinh
---

# Radio group

`nxt-radio-group` là một nhóm radio native: `fieldset` + `legend`, mỗi `nxt-radio` là một `input[type=radio]` dùng chung tên. Nhóm giữ giá trị (`[(value)]` hoặc Angular forms), có gợi ý, lỗi cấp nhóm và trạng thái chỉ đọc.

## Khi nào dùng

- Chọn **đúng một** trong 3–8 phương án, và người dùng cần thấy hết các phương án để so sánh: hình thức làm việc, loại hợp đồng, cách tính phép.
- Trường trong form sẽ được lưu, cần bắt buộc chọn, báo lỗi hoặc khoá.
- Phương án cần giải thích hệ quả riêng (`hint` của từng `nxt-radio`).

## Khi nào không dùng

- **Chỉ hai phương án có/không**: dùng [Checkbox](/components/checkbox) (chờ Lưu) hoặc [Switch](/components/switch) (có hiệu lực ngay).
- **Hơn 8 phương án**, hoặc người dùng thường chọn phương án phổ biến: dùng `select[nxtInput]` có giá trị mặc định trong [Form field](/components/form-field). Danh sách dài cần tìm: [Combobox](/components/combobox).
- **Đổi chế độ xem, lọc nhanh có hiệu lực ngay**, nhãn 1–2 từ: dùng [Segmented](/components/segmented).
- **Chọn nhiều**: dùng nhóm [Checkbox](/components/checkbox#nhom-lua-chon).

## Ví dụ

Nhóm xếp dọc, chọn sẵn phương án ít rủi ro nhất. Phương án bị khoá ghi lý do trong `hint` của nó.

::example{radio-group-basic}

```html
<nxt-radio-group label="Hình thức làm việc" [(value)]="mode">
  <nxt-radio value="office" label="Tại văn phòng" />
  <nxt-radio value="hybrid" label="Kết hợp" hint="Tối đa 2 ngày làm từ xa mỗi tuần." />
  <nxt-radio value="remote" label="Từ xa" disabled hint="Cần quản lý trực tiếp đề xuất." />
</nxt-radio-group>
```

`value` so sánh bằng `===`, nên giá trị là chuỗi, số hoặc một tham chiếu cố định. Chưa chọn gì thì `value` là `null`.

## Anatomy

| # | Phần | Ghi chú |
|---|------|---------|
| 1 | Nhãn nhóm (`legend`) | Câu hỏi ngắn hoặc danh từ; `*` khi `required` |
| 2 | Gợi ý nhóm | Ngay dưới nhãn nhóm |
| 3 | Phương án | Nút radio 16px + nhãn; vùng chạm tối thiểu 24×24px |
| 4 | Gợi ý phương án | Dưới nhãn phương án, thẳng hàng với chữ |
| 5 | Lỗi nhóm | **Dưới** nhóm: icon + chữ |

## Chọn sẵn và "Không áp dụng"

- **Chọn sẵn phương án an toàn nhất** (thường là phương án đầu), để người dùng chỉ phải đổi khi cần.
- **Không chọn sẵn** khi việc đó có thể gây giả định sai về người dùng (giới tính, tình trạng hôn nhân). Khi đó đặt `required` và báo lỗi lúc gửi.
- Được phép bỏ trống thì thêm phương án **"Không áp dụng"**: radio đã chọn thì không bỏ chọn được.

::example{radio-group-validation}

Lỗi cấp nhóm (`error`) nằm dưới nhóm, nhóm có `aria-invalid` và mọi nút có viền lỗi. Khi gửi lỗi, đưa focus về nhóm lỗi đầu tiên: chưa chọn gì thì focus nút đầu tiên của nhóm (đúng chỗ <kbd>Tab</kbd> sẽ vào).

## Trạng thái

::example{radio-group-states}

| Trạng thái | Cấu hình | Hành vi |
|------------|----------|---------|
| Chỉ đọc | `readonly` | Phương án đang chọn vẫn nhận focus và được đọc; bấm, mũi tên, <kbd>Space</kbd> không đổi gì; nút đã chọn màu trung tính |
| Khoá cả nhóm | `disabled`, hoặc `control.disable()` | `fieldset disabled`: bỏ qua khi Tab; ghi lý do trong `hint` |
| Khoá một phương án | `disabled` trên `nxt-radio` | Bỏ qua khi Tab và mũi tên; ghi lý do trong `hint` của phương án |
| Lỗi | `error` | Thông điệp dưới nhóm, `aria-invalid` trên nhóm |

**Ngang hay dọc.** Trong form luôn xếp **dọc** (`orientation="vertical"`, mặc định): nhãn dài ngắn khác nhau vẫn dễ quét. `orientation="horizontal"` chỉ cho 2–3 phương án một từ ở vùng rộng ("Sáng · Chiều · Đêm"). Hết chỗ thì nhóm ngang tự xuống dòng: đó là dấu hiệu nên chuyển sang dọc.

## Với Angular forms

`NxtRadioGroup` implement `ControlValueAccessor`: dùng `formControlName`, `[formControl]` hoặc `[(ngModel)]` trên `nxt-radio-group`. `control.disable()` khoá cả nhóm; control được đánh dấu touched khi focus rời khỏi nhóm. Thông điệp lỗi do nơi dùng tính và truyền vào `error`, như [Form field](/components/form-field).

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Vào nhóm tại phương án đang chọn (chưa chọn: phương án đầu), hoặc ra khỏi nhóm. Cả nhóm là một điểm dừng Tab |
| <kbd>↓</kbd> / <kbd>→</kbd> | Chọn phương án kế tiếp, vòng về đầu, bỏ qua phương án bị khoá |
| <kbd>↑</kbd> / <kbd>←</kbd> | Chọn phương án trước, vòng về cuối |
| <kbd>Space</kbd> | Chọn phương án đang focus (khi chưa chọn) |

- Radio native: phím, focus và cách đọc do trình duyệt lo. Mũi tên **chọn ngay** theo WAI-ARIA APG; lựa chọn chỉ có hiệu lực khi lưu form nên chọn ngay không gây hệ quả.
- `fieldset` mang `role="radiogroup"`, tên từ `legend` (`aria-labelledby`), nên nhóm nhận được `aria-required`, `aria-invalid`, `aria-readonly`. Gợi ý và lỗi nhóm nối vào nhóm bằng `aria-describedby`; gợi ý của phương án nối vào nút radio của nó.
- Chỉ đọc: `aria-readonly="true"` trên nhóm; phương án đang chọn vẫn trong thứ tự Tab.
- Lỗi luôn có icon và chữ; viền đỏ quanh nút chỉ là tín hiệu phụ.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Hình thức làm việc | Vui lòng chọn hình thức làm việc của bạn |
| Tại văn phòng · Kết hợp · Từ xa | Làm tại văn phòng · Làm kết hợp · Làm từ xa |
| Thứ tự rủi ro thấp → cao, hay dùng → ít dùng | Xếp theo bảng chữ cái |
| Không áp dụng | (để trống, không chọn lại được) |
| Lỗi: "Chọn giới tính." | "Trường này là bắt buộc" |

## API

::api{radio-group}

## Token

::tokens{component.radio-group}

## Changelog

- **Chưa phát hành**: phát hành beta `nxt-radio-group` + `nxt-radio`: radio native, `ControlValueAccessor`, `orientation`, `hint` cho nhóm và từng phương án, lỗi cấp nhóm, `required`, `disabled` (nhóm / phương án), `readonly`, `hideLabel`.

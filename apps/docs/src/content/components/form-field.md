---
title: Form field
description: Nhãn, ô nhập, gợi ý và trạng thái giá trị (lỗi, cảnh báo, thông tin, thành công) trong một khối; có chế độ chỉ đọc cho form hỗn hợp và tự nối id, aria-describedby, aria-invalid, aria-required.
status: beta
group: Nhập liệu
order: 5
package: "@nxt/ui/form-field"
keywords:
  - o nhap
  - truong
  - truong nhap
  - nhap lieu
  - input
  - textarea
  - select
  - form
  - bieu mau
  - loi
  - kiem tra
  - canh bao
  - chi doc
  - readonly
  - trang thai gia tri
  - dem ky tu
---

# Form field

`nxt-form-field` bọc một control native (`input`, `textarea`, `select`) có directive `nxtInput`. Field lo phần nhãn, gợi ý, lỗi và **tự nối thuộc tính accessibility**, nên bạn không phải tự đặt `id` hay `aria-describedby`.

## Khi nào dùng

- Mọi ô nhập chữ, số, email, mật khẩu trong form.
- Khung cho control ghép có ô nhập bên trong: [Date picker](/components/date-picker) (`nxt-date-picker`, `nxt-date-range-picker`), [Combobox](/components/combobox), ô có [Value help](/components/value-help). Đặt control đó **trong** `nxt-form-field` để có nhãn, `*`, trạng thái giá trị và chỉ đọc như mọi trường.
- Danh sách chọn ngắn, khoảng dưới 15 lựa chọn và không cần tìm: `select[nxtInput]`.
- Ô tìm kiếm và bộ lọc trên thanh công cụ (size `sm`).

## Khi nào không dùng

- **Chọn nhiều, xác nhận có/không**: dùng [Checkbox](/components/checkbox).
- **Chọn một trong 3–8 phương án trong form**: dùng [Radio group](/components/radio-group). Đổi chế độ xem 2–5 lựa chọn: [Segmented](/components/segmented).
- **Bật/tắt có hiệu lực ngay**: dùng [Switch](/components/switch).
- **Ngày tháng**: không dùng `input[nxtInput][type="date"]` (định dạng theo trình duyệt, có máy hiện tháng trước ngày); dùng [Date picker](/components/date-picker) trong field.
- **Danh sách dài, cần tìm, chọn nhiều**: dùng [Combobox](/components/combobox) hoặc [Value help](/components/value-help) trong field. `select` native không tìm được theo kiểu gõ không dấu.
- **Chỉ hiển thị giá trị** (trang chi tiết, chế độ xem): dùng [Descriptions](/components/descriptions). `readonly` chỉ dành cho trường không sửa được **trong một form đang sửa**.

## Cấu trúc cơ bản

Nhãn **luôn hiển thị** phía trên control. Placeholder chỉ là ví dụ định dạng và biến mất khi người dùng gõ, nên không thay được nhãn. `required` thêm dấu `*` (ẩn với screen reader) và `aria-required="true"` trên control. Ghi chú "Các trường có dấu * là bắt buộc" ở đầu form.

::example{form-field-basic}

```html
<nxt-form-field label="Email công ty" required hint="Dùng để đăng nhập và nhận phiếu lương.">
  <input nxtInput type="email" />
</nxt-form-field>
```

Field tự gắn lên control:

| Thuộc tính | Giá trị |
|------------|---------|
| `id` | Sinh tự động, nối với `<label for>` |
| `aria-describedby` | Thông điệp trạng thái, rồi gợi ý, rồi bộ đếm, rồi id bạn tự đặt |
| `aria-invalid` | `true` khi `error` khác rỗng (chỉ lỗi, không cho cảnh báo) |
| `aria-required` | `true` khi có `required` và không `readonly` |

`id` và `aria-describedby` **tĩnh** bạn tự đặt lên control được giữ: `<input nxtInput id="ma-nv" aria-describedby="ghi-chu">` thì nhãn trỏ tới `ma-nv` và `ghi-chu` được nối vào cuối danh sách mô tả. Giá trị bind động (`[attr.aria-describedby]`) vẫn bị field ghi đè. Mỗi field chỉ chứa **một** control `nxtInput`.

## Gợi ý và lỗi

- `hint` mô tả định dạng hoặc lý do cần thông tin. Gợi ý giúp người dùng nhập đúng ngay từ đầu.
- `error` khác rỗng thì viền control đổi sang màu lỗi, control có `aria-invalid="true"`, và lỗi hiện **ngay dưới control, phía trên gợi ý**. Gợi ý **vẫn giữ nguyên**, nên người dùng còn thấy định dạng đúng ngay lúc cần sửa; screen reader đọc lỗi trước, rồi gợi ý.
- Thông báo lỗi nói **sai ở đâu và sửa thế nào**, không chỉ "Không hợp lệ". Lỗi luôn có icon đi kèm chữ.

::example{form-field-hint-error}

## Trạng thái giá trị

Ngoài lỗi, field có ba trạng thái giá trị khác. Mỗi lúc chỉ hiện **một** trạng thái, theo thứ tự ưu tiên lỗi > cảnh báo > thông tin > thành công, nên bạn bind thẳng từng nguồn (`[error]` từ validator, `[warning]` từ luật nghiệp vụ) mà không phải tự gộp.

| Trạng thái | Input | Khi nào | Chặn lưu | Viền (token) |
|------------|-------|---------|----------|--------------|
| Lỗi | `error` | Giá trị sai hoặc thiếu, phải sửa mới lưu được | **Có** | `form-field.control-border-invalid` → `border.danger` |
| Cảnh báo | `warning` | Hợp lệ nhưng bất thường, có thể gây lỗi về sau | Không | `form-field.control-border-warning` → `border.warning` |
| Thông tin | `info` | Hệ thống đề xuất / tự điền giá trị, hoặc điều cần lưu ý | Không | `form-field.control-border-info` → `border.info` |
| Thành công | `success` | Hệ thống **vừa** xác nhận giá trị (đối chiếu máy chủ) | Không | `form-field.control-border-success` → `border.success` |
| (không) | | Trước khi kiểm tra, **và sau khi kiểm tra đạt** | — | `form-field.control-border` → `border.input` |

::example{form-field-value-states}

- **Không tô xanh mọi trường đã hợp lệ.** Trường nhập đúng trở về trạng thái thường; `success` chỉ dành cho lúc hệ thống vừa kiểm tra xong một giá trị khó (mã số thuế, trùng mã).
- Mọi thông điệp có icon riêng và chữ; cảnh báo, thông tin, thành công có thêm chữ ẩn "Cảnh báo:", "Thông tin:", "Thành công:" để screen reader phân biệt với gợi ý. Đổi các chữ này (đa ngôn ngữ) bằng `statusLabels`.
- Cảnh báo không chặn lưu và không đưa vào tóm tắt lỗi đầu form.

## Chỉ đọc

`readonly` dùng cho trường **không sửa được trong một form đang sửa** (form hỗn hợp), ví dụ mã nhân viên khi sửa hồ sơ. Trường chỉ đọc vẫn nằm trong thứ tự Tab, đọc rõ và copy được; nền trong suốt, viền nhạt, không có `*` và không có chevron.

::example{form-field-readonly}

| | Chỉ đọc (`readonly`) | Bị khoá (`disabled`) |
|---|---|---|
| Khi nào | Trường không sửa được ở bước này, người dùng vẫn cần đọc / copy | Chưa đủ điều kiện để nhập, và cách mở lại là hiển nhiên |
| Tab | Dừng được | Bị bỏ qua |
| Tương phản chữ | Đủ (`text.strong`) | Mờ (`text.disabled`) |
| Ghi lý do | Trong `hint` | Trong `hint` |

- `input` / `textarea` nhận thuộc tính `readonly` native. `select` không có `readonly` native, nên field đặt `aria-readonly` và chặn phím / chuột đổi giá trị.
- Trường **không bao giờ** sửa được (trang chi tiết, chế độ xem) thì hiển thị bằng [Descriptions](/components/descriptions), không dùng form chỉ đọc. Xem [Form nhập liệu](/patterns/form).

## Tiền tố và hậu tố

Thêm attribute `nxtPrefix` hoặc `nxtSuffix` vào phần tử con để đặt nó ở đầu hoặc cuối control.

- **Icon** (`nxt-icon`) chỉ để trang trí, đã có sẵn `aria-hidden`.
- **Đơn vị** ("VNĐ", "giờ", "%"): screen reader **không** đọc hậu tố cùng tên trường, nên ghi đơn vị trong `label` hoặc `hint`.
- **Nút trong field** (hiện mật khẩu, xoá nhanh): dùng `nxtIconButton` có `aria-label`. Nút bật/tắt giữ nguyên nhãn và đổi `aria-pressed`, không đổi nhãn qua lại giữa "Hiện" và "Ẩn".

::example{form-field-affixes}

## Textarea và select

`select[nxtInput]` có chevron tự động. `textarea[nxtInput]` cao tối thiểu bằng 2,5 lần chiều cao control và kéo giãn được theo chiều dọc. Control `disabled` có nền riêng và không focus được, nên ghi lý do trong `hint`.

Đặt `maxlength` trên control (khớp giới hạn của máy chủ) và `counter` trên field để hiện bộ đếm "26/300" ở cuối dòng dưới control. Screen reader đọc câu đầy đủ "Đã nhập 26 trên 300 ký tự" khi focus vào trường, không đọc mỗi lần gõ phím; đổi câu này bằng `counterText`.

::example{form-field-textarea-select}

## Số tiền và số lượng

Thêm `numeric` vào `nxtInput` cho số tiền, số lượng, số giờ: chữ số căn cuối và cùng độ rộng (`tabular-nums`) để dễ so sánh. Đơn vị đặt ở `nxtSuffix` và nhắc trong nhãn ("Lương cơ bản (đồng/tháng)"). Không dùng `numeric` cho mã, số điện thoại, số CCCD: đó là chuỗi ký tự, căn đầu như chữ.

## Kiểm tra khi gửi

Kiểm tra khi người dùng bấm gửi, không kiểm tra khi họ đang gõ dở. Sau lần gửi đầu tiên, kiểm tra lại mỗi khi người dùng sửa, để lỗi biến mất ngay khi giá trị đã đúng.

Khi có lỗi:

1. Hiện lỗi tại từng trường.
2. Báo tổng số trường lỗi qua `role="status"`.
3. **Đưa focus về trường lỗi đầu tiên**, để người dùng bàn phím và screen reader nghe ngay tên trường và nội dung lỗi.

::example{form-field-validation}

Ứng dụng chạy **zoneless**, nên `aria-invalid` chỉ xuất hiện trên DOM sau lần render kế tiếp. Dùng `afterNextRender` để đợi lần render đó, không dùng `queueMicrotask` hay `setTimeout`:

```ts
private readonly host: HTMLElement = inject(ElementRef).nativeElement;
private readonly injector = inject(Injector);

protected submit(event: Event) {
  event.preventDefault();
  const errors = this.validate();
  this.errors.set(errors);
  if (Object.keys(errors).length) {
    afterNextRender(() => this.host.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus(), { injector: this.injector });
  }
}
```

Đặt `novalidate` trên `<form>` để tắt bong bóng lỗi mặc định của trình duyệt (không theo ngôn ngữ của ứng dụng, không theo theme).

## Kích thước

`md` (mặc định) dùng cho form, `sm` dùng cho thanh lọc và toolbar phía trên bảng. Chiều cao control lấy theo mật độ hiện hành.

`hideLabel` chỉ ẩn nhãn khỏi mắt nhìn, screen reader vẫn đọc. Chỉ dùng khi mục đích của field đã rõ mà không cần nhãn: ô tìm kiếm có icon kính lúp, bộ lọc có lựa chọn đầu là "Tất cả …".

::example{form-field-sizes}

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Di chuyển giữa các control; nút hậu tố (hiện mật khẩu) là một điểm dừng riêng |
| <kbd>Enter</kbd> | Trong input: gửi form chứa nó. Trong textarea: xuống dòng |
| <kbd>Space</kbd> / <kbd>Enter</kbd> trên nút hậu tố | Kích hoạt nút (bật/tắt hiện mật khẩu) |
| <kbd>↑</kbd> / <kbd>↓</kbd> trên select | Đổi lựa chọn |
| <kbd>Alt</kbd>+<kbd>↓</kbd> trên select | Mở danh sách lựa chọn (Windows) |
| Phím đổi giá trị trên select `readonly` | Bị chặn; <kbd>Tab</kbd> và phím tắt trình duyệt vẫn chạy |

- Nhãn là `<label for>` thật: bấm vào nhãn sẽ đưa focus vào control.
- Vòng focus bọc cả khung control (`:focus-within`), kể cả khi focus đang ở nút hậu tố.
- Mọi trạng thái giá trị có icon và chữ, không chỉ đổi màu viền. Chỉ lỗi đặt `aria-invalid`.
- Trường chỉ đọc vẫn nhận focus; `input` / `textarea` báo "chỉ đọc" qua `readonly` native, `select` qua `aria-readonly`.
- Placeholder dùng màu `text.subtle` nên vẫn đọc được, nhưng không thay được nhãn.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Họ và tên | Nhập họ và tên của bạn vào đây |
| Nhập email công ty. | Trường này là bắt buộc |
| Email chưa đúng định dạng. Ví dụ: lan.pham@congty.vn | Email không hợp lệ |
| Số CCCD gồm 12 chữ số, bạn đã nhập 11. | Sai định dạng |
| Chọn phòng ban | -- Chọn -- |
| Cảnh báo: "Ngày 02/09/2026 là ngày lễ, ngày này không tính vào phép năm." | Cảnh báo: "Ngày không hợp lệ!" |
| Thành công: "Đã đối chiếu với cơ quan thuế." (chỉ sau khi kiểm tra máy chủ) | Viền xanh cho mọi trường đã nhập đúng |

## API

::api{form-field}

## Token

::tokens{component.form-field}

## Changelog

- **Chưa phát hành**: trạng thái giá trị `warning` / `info` / `success` (+ `statusLabels`), `readonly`, bộ đếm `counter` / `counterText`, `nxtInput numeric`. Gợi ý **không còn bị lỗi thay chỗ**: lỗi đứng trên gợi ý, cả hai trong `aria-describedby`. `id` và `aria-describedby` tĩnh của control được giữ. Token mới `form-field.{warning,info,success}-text`, `counter-text`, `control-bg-readonly`, `control-border-{warning,info,success,readonly}`.
- **0.1.0**: phát hành beta: `nxt-form-field` và `nxtInput` cho input, textarea, select; `label`, `hint`, `error`, `required`, `hideLabel`, size `sm`/`md`; slot `nxtPrefix`/`nxtSuffix`; chevron cho select; tự nối `id`, `aria-describedby`, `aria-invalid`, `aria-required`.

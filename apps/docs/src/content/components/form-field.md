---
title: Form field
description: Nhãn, ô nhập, gợi ý và thông báo lỗi trong một khối, tự nối id, aria-describedby, aria-invalid và aria-required cho control.
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
---

# Form field

`nxt-form-field` bọc một control native (`input`, `textarea`, `select`) có directive `nxtInput`. Field lo phần nhãn, gợi ý, lỗi và **tự nối thuộc tính accessibility**, nên bạn không phải tự đặt `id` hay `aria-describedby`.

## Khi nào dùng

- Mọi ô nhập chữ, số, ngày, email, mật khẩu trong form.
- Danh sách chọn ngắn, khoảng dưới 15 lựa chọn và không cần tìm: `select[nxtInput]`.
- Ô tìm kiếm và bộ lọc trên thanh công cụ (size `sm`).

## Khi nào không dùng

- **Bật/tắt, chọn nhiều**: dùng [Checkbox](/components/checkbox).
- **Chọn một trong 2–5 giá trị luôn hiển thị**: dùng segmented control hoặc radio.
- **Danh sách dài, cần tìm, chọn nhiều**: dùng combobox (đợt B). `select` native không tìm được theo kiểu gõ không dấu.
- **Chỉ hiển thị giá trị**: dùng danh sách mô tả `dl`, không dùng input `readonly` hay `disabled` để trình bày dữ liệu.

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
| `aria-describedby` | Trỏ tới lỗi nếu có, nếu không thì tới gợi ý |
| `aria-invalid` | `true` khi `error` khác rỗng |
| `aria-required` | `true` khi có `required` |

Field quản lý `id` và `aria-describedby` của control: giá trị bạn tự đặt lên control sẽ bị ghi đè. Mỗi field chỉ chứa **một** control `nxtInput`.

## Gợi ý và lỗi

- `hint` mô tả định dạng hoặc lý do cần thông tin. Gợi ý giúp người dùng nhập đúng ngay từ đầu.
- `error` khác rỗng thì viền control đổi sang màu lỗi, control có `aria-invalid="true"`, và **lỗi thay chỗ gợi ý**: gợi ý bị ẩn và `aria-describedby` chuyển sang lỗi. Nếu thông tin trong gợi ý vẫn cần khi có lỗi, nhắc lại nó trong thông báo lỗi.
- Thông báo lỗi nói **sai ở đâu và sửa thế nào**, không chỉ "Không hợp lệ". Lỗi luôn có icon đi kèm chữ.

::example{form-field-hint-error}

## Tiền tố và hậu tố

Thêm attribute `nxtPrefix` hoặc `nxtSuffix` vào phần tử con để đặt nó ở đầu hoặc cuối control.

- **Icon** (`nxt-icon`) chỉ để trang trí, đã có sẵn `aria-hidden`.
- **Đơn vị** ("VNĐ", "giờ", "%"): screen reader **không** đọc hậu tố cùng tên trường, nên ghi đơn vị trong `label` hoặc `hint`.
- **Nút trong field** (hiện mật khẩu, xoá nhanh): dùng `nxtIconButton` có `aria-label`. Nút bật/tắt giữ nguyên nhãn và đổi `aria-pressed`, không đổi nhãn qua lại giữa "Hiện" và "Ẩn".

::example{form-field-affixes}

## Textarea và select

`select[nxtInput]` có chevron tự động. `textarea[nxtInput]` cao tối thiểu bằng 2,5 lần chiều cao control và kéo giãn được theo chiều dọc. Control `disabled` có nền riêng và không focus được, nên ghi lý do trong `hint`.

::example{form-field-textarea-select}

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

- Nhãn là `<label for>` thật: bấm vào nhãn sẽ đưa focus vào control.
- Vòng focus bọc cả khung control (`:focus-within`), kể cả khi focus đang ở nút hậu tố.
- Lỗi có icon và chữ, không chỉ đổi màu viền.
- Placeholder dùng màu `text.subtle` nên vẫn đọc được, nhưng không thay được nhãn.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Họ và tên | Nhập họ và tên của bạn vào đây |
| Nhập email công ty. | Trường này là bắt buộc |
| Email chưa đúng định dạng. Ví dụ: lan.pham@congty.vn | Email không hợp lệ |
| Số CCCD gồm 12 chữ số, bạn đã nhập 11. | Sai định dạng |
| Chọn phòng ban | -- Chọn -- |

## API

::api{form-field}

## Token

::tokens{component.form-field}

## Changelog

- **0.1.0**: phát hành beta: `nxt-form-field` và `nxtInput` cho input, textarea, select; `label`, `hint`, `error`, `required`, `hideLabel`, size `sm`/`md`; slot `nxtPrefix`/`nxtSuffix`; chevron cho select; tự nối `id`, `aria-describedby`, `aria-invalid`, `aria-required`.

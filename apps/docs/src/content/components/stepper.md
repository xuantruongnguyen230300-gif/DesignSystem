---
title: Stepper
description: Chỉnh một con số trong khoảng hẹp bằng nút − / + hoặc gõ thẳng — số ngày nghỉ, số lượng cần tuyển, hệ số lương; mũi tên và Page Up / Page Down trên ô giá trị, kẹp vào khoảng cho phép.
status: draft
group: Nhập liệu
order: 7
package: "@nxt/ui/stepper"
keywords:
  - stepper
  - spinbutton
  - spin button
  - tang giam
  - nut cong tru
  - so luong
  - so ngay
  - he so
  - buoc nhay
  - input number
---

# Stepper

`nxt-stepper` là một ô số có hai nút giảm và tăng quanh con số: bấm từng bước, nhấn giữ để lặp, hoặc gõ thẳng khi biết số cần nhập. Ô giá trị là `input` có `role="spinbutton"`, hai nút là đường tắt cho chuột và cảm ứng.

## Khi nào dùng

- Số nguyên hoặc số thập phân có **khoảng nhỏ và bước cố định**: số ngày nghỉ (0–30), số lượng cần tuyển, hệ số lương 1,0–10,0 bước 0,1.
- Người dùng thường chỉnh vài bước quanh một giá trị có sẵn, hoặc đang dùng cảm ứng và bấm nhanh hơn gõ.

## Khi nào không dùng

- **Số lớn hoặc cần nhập chính xác** (lương, mã, số điện thoại, số CCCD): dùng `input[nxtInput]` trong [Form field](/components/form-field).
- **Chọn một giá trị trong khoảng liên tục**, chỉ cần ước lượng và thấy vị trí: dùng [Slider](/components/slider).
- **Chọn một trong vài giá trị rời rạc có nhãn**: dùng [Radio group](/components/radio-group) hoặc [Segmented](/components/segmented).
- **Ngày, giờ**: dùng [Date picker](/components/date-picker).

## Ví dụ

Nhãn đặt tên đại lượng, `unit` ghi đơn vị, `hint` nêu quy tắc. Con số hiện theo `vi-VN`, ô giữ bề rộng cố định nên bấm từ 9 lên 10 không làm khung nhảy.

::example{stepper-basic}

```html
<nxt-stepper
  label="Số ngày nghỉ phép"
  hint="Tối đa 30 ngày mỗi năm."
  unit="ngày"
  [min]="0"
  [max]="30"
  [(value)]="days"
/>
```

## Anatomy

| # | Phần | Ghi chú |
|---|------|---------|
| 1 | Nhãn | `label[for]` trỏ tới ô giá trị; `*` khi `required` |
| 2 | Nút giảm | Dấu trừ; ngoài thứ tự <kbd>Tab</kbd>; vô hiệu khi đã tới `min` |
| 3 | Ô giá trị | Con số (và đơn vị); **phần tử duy nhất nhận focus**, vòng focus bao cả khung |
| 4 | Nút tăng | Dấu cộng; vô hiệu khi đã tới `max` |
| 5 | Gợi ý | Quy tắc hoặc hệ quả, dưới khung |
| 6 | Lỗi | Icon + chữ dưới khung, khi giá trị sai hoặc có `error` |

## Khoảng, bước và số thập phân

| Cấu hình | Hành vi |
|----------|---------|
| `min` / `max` | Cận dưới / trên, gồm cả hai đầu. Kết quả của nút, phím, `Enter` và blur luôn được **kẹp** vào khoảng |
| `step` | Bước của nút và phím ↑ ↓. <kbd>Page Up</kbd> / <kbd>Page Down</kbd> đi 10 bước |
| `fractionDigits` | Số chữ số thập phân hiện và làm tròn. Mặc định theo `step` và `min` (bước 0,5 → 1 chữ số) |
| `unit` | Đơn vị sau con số; screen reader đọc "12 ngày" |
| `locale` | Mặc định `vi-VN`: dấu `.` ngăn nghìn, dấu `,` thập phân |

::example{stepper-decimal}

- Khi gõ, ô nhận cả `,` và `.` làm dấu thập phân (`2,5` hay `2.5`). Một dấu `.` đứng đúng chỗ dấu nghìn và có đủ ba chữ số theo sau (`1.250`) được đọc là dấu nghìn.
- Giá trị gõ tay chỉ bị **kẹp khoảng và làm tròn**, không bị bắt về lưới bước (`min + n × step`). Cần lưới bước thì kiểm ở validator của form.
- Chỉ gõ được số âm khi `min` âm hoặc không đặt `min`. Bàn phím số trên điện thoại không có dấu trừ nên khi đó ô dùng bàn phím chữ.

## Gõ và chốt giá trị

Chữ đang gõ chỉ được áp dụng khi **chốt**: `Enter` hoặc rời ô. Không báo lỗi lúc đang gõ (gõ `1` trên đường tới `15` không nhấp nháy đỏ).

| Chữ gõ | Khi chốt |
|--------|----------|
| Số trong khoảng | Đặt giá trị, hiện lại theo định dạng (`1,50` → `1,5`) |
| Số ngoài khoảng | Kẹp vào `min` / `max` và hiện con số đã kẹp |
| Không phải số (`abc`, `1,2,3`) | Giữ nguyên chữ đã gõ, **giá trị không đổi**, hiện trạng thái lỗi và lời nhắc cho tới khi gõ lại hoặc bấm <kbd>Esc</kbd> |
| Để trống | Giá trị là `null` |

<kbd>Esc</kbd> bỏ chữ đang gõ và trả về giá trị hiện tại. Khi không có chữ đang gõ, <kbd>Esc</kbd> không bị chặn (vẫn đóng được dialog bao quanh). <kbd>Enter</kbd> cũng không bị chặn: form bao quanh vẫn gửi, với giá trị vừa chốt.

## Trạng thái

::example{stepper-states}

| Trạng thái | Cấu hình | Hành vi |
|------------|----------|---------|
| Trống | `value` là `null` | Ô trống; ↑ hoặc ↓ bắt đầu từ `0` rồi kẹp vào khoảng |
| Bắt buộc | `required` | Dấu `*` sau nhãn và `aria-required` |
| Chỉ đọc | `readonly` | Thấy giá trị, focus được, không đổi được; **ẩn hai nút**, khung chỉ có viền nhạt |
| Bị khoá | `disabled`, hoặc `control.disable()` | Không focus được, vẫn thấy giá trị; ghi lý do trong `hint` |
| Lỗi do nơi dùng báo | `error="…"` | Khung đỏ, icon và chữ dưới khung, `aria-invalid`; nói nguyên nhân và cách sửa |
| Ngoài khoảng, đặt từ ngoài | `value` ngoài `[min, max]` | **Không tự sửa** (dữ liệu đúng quan trọng hơn): hiện trạng thái lỗi; nút giảm / tăng kéo giá trị về trong khoảng |

Lỗi luôn đi kèm icon và chữ, không chỉ bằng màu. Đổi lời nhắc mặc định bằng `invalidText` (i18n).

## Dùng với Angular forms

`NxtStepper` implement `ControlValueAccessor`: `formControlName`, `[formControl]`, `[(ngModel)]`. Giá trị là `number | null`; `control.disable()` khoá cả khung; `touched` được đánh dấu khi focus rời khỏi khung.

```html
<nxt-stepper label="Số ngày nghỉ phép" [min]="0" [max]="30" [formControl]="days" [error]="daysError()" />
```

Lỗi của form đưa vào `error` (nói nguyên nhân và cách sửa); lỗi gõ sai và ngoài khoảng do chính component xử lý.

## Accessibility

| Phím (khi focus ở ô giá trị) | Hành vi |
|------------------------------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Vào / ra ô giá trị (một điểm dừng); khoá thì bị bỏ qua, chỉ đọc vẫn nhận focus |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Tăng / giảm một `step` |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd> | Tăng / giảm `10 × step` |
| <kbd>Home</kbd> / <kbd>End</kbd> | Về `min` / lên `max` (khi không đặt giới hạn thì giữ nghĩa con trỏ của ô nhập) |
| <kbd>Enter</kbd> hoặc rời ô | Chốt chữ đang gõ |
| <kbd>Esc</kbd> | Bỏ chữ đang gõ |

- Ô giá trị: `input type="text" role="spinbutton"` với `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext` ("12 ngày"), `aria-invalid`, `aria-required`, `aria-readonly`. Screen reader đọc "Số ngày nghỉ phép, ô số, 12 ngày".
- Hai nút có `aria-label` "Giảm, Số ngày nghỉ phép" / "Tăng, …", `aria-controls` trỏ tới ô giá trị và **không nằm trong thứ tự Tab** (theo APG): người dùng bàn phím và screen reader dùng mũi tên trên ô giá trị; nút vẫn nằm trong cây trợ năng cho điều khiển bằng giọng nói và công tắc.
- Nhấn giữ nút (`autoRepeat`): bước đầu ngay lúc nhấn, sau 400 ms lặp mỗi 100 ms tới khi thả hoặc chạm cận. Tắt bằng `[autoRepeat]="false"`.
- Không dùng con lăn chuột để đổi giá trị, vì cuộn trang rất dễ đổi nhầm.
- Vòng focus bao cả khung (`focus.ring.*`). Chiều cao khung theo mật độ: gọn 28px, vừa 36px, **rộng 46px** (cảm ứng, vùng chạm của nút ≥ 44px).
- Ở chế độ tương phản cao, khung có viền `ButtonText` và vòng focus tô `Highlight`.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Số ngày nghỉ phép | Nhập số ngày / Tăng giảm số ngày |
| `unit="ngày"` và nhãn không nhắc "ngày" lần nữa | "Số ngày nghỉ (ngày)" |
| Tối đa 30 ngày mỗi năm. (gợi ý nêu quy tắc) | Nhắc lại khoảng đã có trong lời nhắc lỗi |
| Số ngày nghỉ vượt quá số ngày còn lại. Hãy nhập tối đa 5 ngày. | Giá trị không hợp lệ |

## API

::api{stepper}

## Token

::tokens{component.stepper}

## Changelog

- **Chưa phát hành**: thêm `nxt-stepper` (draft): `input[role=spinbutton]` với nút − / +, `min` / `max` / `step`, `unit`, `fractionDigits`, `locale`, đọc số `vi-VN`, nhấn giữ lặp (`autoRepeat`), `required`, `error`, `hint`, `disabled`, `readonly`, `ControlValueAccessor`.

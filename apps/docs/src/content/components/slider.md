---
title: Slider
description: Chọn một giá trị trong khoảng bằng cách kéo hoặc bấm lên thanh — ngưỡng cảnh báo, tỉ trọng, mức ưu tiên; nhãn hoặc icon hai đầu, giá trị hiện bên cạnh, mũi tên và Page Up / Page Down trên thanh.
status: draft
group: Nhập liệu
order: 8
package: "@nxt/ui/slider"
keywords:
  - slider
  - thanh truot
  - keo
  - khoang
  - nguong
  - ti trong
  - muc uu tien
  - range
  - do sang
---

# Slider

`nxt-slider` là một thanh ngang có tay kéo để chọn **một** giá trị trong khoảng khi việc ước lượng và thấy vị trí quan trọng hơn con số chính xác. Phần tử lấy focus là `div` có `role="slider"`; kéo và bấm có đường bàn phím tương đương.

## Khi nào dùng

- Giá trị nằm trong khoảng có **cận rõ ràng** (0–100%, 1–5): ngưỡng cảnh báo quá hạn, tỉ trọng KPI, mức ưu tiên.
- Thiết lập có hiệu lực ngay, hoặc xem trước kết quả ngay khi kéo.

## Khi nào không dùng

- **Cần nhập con số chính xác** (lương, số lượng, hệ số): dùng [Stepper](/components/stepper) hoặc `input[nxtInput]` trong [Form field](/components/form-field).
- **Khoảng rất rộng hoặc không có cận** (số nhân viên, số tiền): dùng ô nhập.
- **Chọn một trong vài giá trị có nhãn rõ**: dùng [Radio group](/components/radio-group) hoặc [Segmented](/components/segmented).
- **Chọn một khoảng** (từ … đến …): chưa có thanh hai tay kéo; dùng hai [Stepper](/components/stepper) hoặc hai field.

## Ví dụ

Nhãn đặt tên đại lượng; `showValue` hiện giá trị ở cuối hàng nhãn, `unit` ghi đơn vị. Nhấn lên thanh thì giá trị nhảy tới điểm đó, kéo thì bám theo `step`.

::example{slider-basic}

```html
<nxt-slider label="Ngưỡng cảnh báo quá hạn" showValue unit="%" [(value)]="overdue" />
```

## Anatomy

| # | Phần | Ghi chú |
|---|------|---------|
| 1 | Nhãn | Đặt tên cho thanh qua `aria-labelledby`; bấm vào nhãn đưa focus vào thanh |
| 2 | Giá trị | Tuỳ chọn (`showValue`), cuối hàng nhãn, số căn thẳng cột |
| 3 | Đầu thanh | Tuỳ chọn: nhãn chữ hoặc icon ở hai đầu |
| 4 | Rãnh và phần tô | Rãnh chưa tô đủ đậm để thấy phạm vi; phần tô từ đầu thanh tới tay kéo |
| 5 | Tay kéo | Tròn 24px, nền trắng, viền màu nhấn, bóng mềm tĩnh |
| 6 | Gợi ý | Cách đọc thang đo hoặc hệ quả, dưới thanh |

## Khoảng, bước và giá trị

| Cấu hình | Hành vi |
|----------|---------|
| `min` / `max` | Mặc định 0 và 100. Giá trị ngoài khoảng được **hiện và đọc đã kẹp**; chỉ phát `valueChange` khi người dùng đổi |
| `step` | Bước của phím mũi tên và nấc bám khi kéo. <kbd>Page Up</kbd> / <kbd>Page Down</kbd> đi 10 bước |
| `showValue` + `unit` | Hiện "40 %" ở cuối hàng nhãn; `aria-valuetext` đọc cùng chữ |
| `formatValue` | Đổi giá trị thành chữ khi con số chưa đủ nghĩa: 1–5 → "Rất thấp" … "Rất cao" |
| `fractionDigits` | Số chữ số thập phân; mặc định theo `step` và `min`; số hiện theo `vi-VN` ("1,2") |

Cận trên luôn chọn được, kể cả khi lệch lưới bước (khoảng 0–10, bước 3: 0, 3, 6, 9 và 10).

## Hai đầu thanh

Nhãn hoặc icon ở hai đầu nói nghĩa của hai cận. Dùng nhãn chữ khi cặp từ rõ ("Thấp" – "Cao"); dùng icon khi cặp hình quen thuộc (tối – sáng) và nghĩa không thể hiểu sai. Icon chỉ là trang trí (`aria-hidden`); nhãn chữ được đọc vì chúng giải nghĩa thang đo.

::example{slider-ends}

## Trạng thái

::example{slider-states}

| Trạng thái | Cấu hình | Hành vi |
|------------|----------|---------|
| Bình thường | | Rãnh xám, phần tô màu nhấn, tay kéo viền màu nhấn |
| Chỉ đọc | `readonly` | Thấy vị trí, focus được, không đổi được; phần tô và tay kéo trung tính |
| Bị khoá | `disabled`, hoặc `control.disable()` | Không focus được, vẫn thấy vị trí; ghi lý do trong `hint` |

Slider không có trạng thái lỗi: giá trị luôn nằm trong khoảng. Lỗi khi lưu báo ở cấp trang ([Alert](/components/alert) hoặc live region).

## Dùng với Angular forms

`NxtSlider` implement `ControlValueAccessor`: `formControlName`, `[formControl]`, `[(ngModel)]`. `control.reset()` (giá trị `null`) đưa thanh về `min`; `control.disable()` khoá thanh; `touched` được đánh dấu khi thanh mất focus.

```html
<nxt-slider label="Tỉ trọng KPI" showValue unit="%" [min]="10" [max]="50" [step]="5" [formControl]="weight" />
```

## Accessibility

| Phím (khi focus ở thanh) | Hành vi |
|--------------------------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Vào / ra thanh; khoá thì bị bỏ qua, chỉ đọc vẫn nhận focus |
| <kbd>→</kbd> hoặc <kbd>↑</kbd> | Tăng một `step` |
| <kbd>←</kbd> hoặc <kbd>↓</kbd> | Giảm một `step` |
| <kbd>Page Up</kbd> / <kbd>Page Down</kbd> | Tăng / giảm `10 × step` |
| <kbd>Home</kbd> / <kbd>End</kbd> | Về `min` / lên `max` |

- `div role="slider" tabindex="0"` với `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-valuetext`, `aria-orientation="horizontal"`, `aria-labelledby`, `aria-describedby`, `aria-readonly` và `aria-disabled`. Screen reader đọc "Ngưỡng cảnh báo quá hạn, thanh trượt, 80 %".
- Giá trị hiện bên cạnh nhãn là `aria-hidden`: `aria-valuetext` đã nói, đọc thêm sẽ bị lặp.
- Kéo bằng con trỏ luôn có đường bàn phím tương đương (WCAG 2.5.7). Trong trang đọc từ phải sang trái, ← tăng và → giảm theo hướng nhìn của thanh.
- Kéo dùng `pointer capture`: kéo ra ngoài thanh vẫn bám theo trục ngang; `touch-action: pan-y` để chạm dọc vẫn cuộn trang.
- Vòng focus ôm tay kéo (`focus.ring.*`). Vùng chạm cao theo mật độ: gọn 28px, vừa 36px, **rộng 46px** (cảm ứng, ≥ 44px); tay kéo luôn 24px.
- Viền tay kéo và rãnh đạt tương phản ≥ 3:1 với nền ở sáng và tối; bóng đổ của tay kéo chỉ là phụ, không phải ranh giới. Không có chuyển động nào ở tay kéo và phần tô, `box-shadow` không bị animate.
- Ở chế độ tương phản cao, rãnh `ButtonText`, phần tô `Highlight`, tay kéo viền `Highlight`.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Ngưỡng cảnh báo quá hạn | Kéo để chọn ngưỡng |
| Nhãn hai đầu một hoặc hai từ, cặp đối nghĩa: Thấp / Cao | Nhắc lại con số cận: 0 / 100 |
| `unit="%"` và nhãn không nhắc "%" lần nữa | "Tỉ trọng (%)" |
| Tên mức ngắn khi thang rời rạc: Thấp, Trung bình, Cao | Hiện "3" khi người dùng không biết 3 là mức nào |

## API

::api{slider}

## Token

::tokens{component.slider}

## Changelog

- **Chưa phát hành**: thêm `nxt-slider` (draft): `div[role=slider]` với kéo, bấm lên thanh và bàn phím APG, `min` / `max` / `step`, `showValue` + `unit` + `formatValue`, `minLabel` / `maxLabel` / `minIcon` / `maxIcon`, `hint`, `disabled`, `readonly`, `ControlValueAccessor`.

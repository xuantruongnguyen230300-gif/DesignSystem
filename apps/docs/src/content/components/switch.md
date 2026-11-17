---
title: Switch
description: Bật/tắt một thiết lập có hiệu lực ngay, không cần bấm Lưu — nhận thông báo, tự chuyển đơn kế tiếp; nhãn đứng trước hoặc trên, không chữ trong rãnh.
status: beta
group: Nhập liệu
order: 6
package: "@nxt/ui/switch"
keywords:
  - switch
  - cong tac
  - bat tat
  - toggle
  - thiet lap
  - cai dat
---

# Switch

`nxt-switch` là một `button` có `role="switch"`, bật/tắt **một** thiết lập và áp dụng ngay. Nhãn hiển thị đứng trước hoặc phía trên switch và đặt tên cho nó.

## Khi nào dùng

- Thiết lập cá nhân hoặc cấu hình **có hiệu lực ngay**: nhận thông báo qua email, tự chuyển sang đơn kế tiếp sau khi duyệt, hiện cột đã ẩn.
- Người dùng cần thấy ngay thiết lập đang bật hay tắt.

## Khi nào không dùng

- **Lựa chọn trong form chỉ có hiệu lực khi bấm Lưu**: dùng [Checkbox](/components/checkbox). Trộn switch vào form chờ Lưu làm người dùng tưởng đã lưu.
- **Không rõ switch thể hiện trạng thái hay hành động**: dùng checkbox hoặc [Button](/components/button).
- **Chọn một trong nhiều giá trị**: dùng [Radio group](/components/radio-group) hoặc [Segmented](/components/segmented).
- **Hành động phá huỷ hoặc cần xác nhận** (khoá tài khoản nhân viên): dùng nút + [Dialog](/components/dialog) xác nhận.

## Ví dụ

Thiết lập lưu ngay khi đổi; báo kết quả ngắn qua `role="status"`. Nếu lưu lên máy chủ thất bại, trả switch về trạng thái cũ và báo lỗi.

::example{switch-basic}

```html
<nxt-switch label="Nhận thông báo qua email khi có đơn cần duyệt" [(checked)]="email" />
```

## Anatomy

| # | Phần | Ghi chú |
|---|------|---------|
| 1 | Nhãn | `label[for]` trỏ tới nút; bấm vào nhãn cũng đổi trạng thái |
| 2 | Rãnh + tay gạt | Bo tròn; **không có chữ trong rãnh**. Bật: rãnh màu nhấn, tay gạt ở cuối |
| 3 | Chữ trạng thái | Tuỳ chọn (`showState`): "Bật" / "Tắt" sau switch |
| 4 | Gợi ý | Hệ quả của thiết lập, dưới nhãn |

## Vị trí nhãn và chữ trạng thái

| Cấu hình | Dùng khi |
|----------|----------|
| `labelPosition="start"` (mặc định) | Danh sách thiết lập: nhãn ngay trước switch, cùng hàng |
| `labelPosition="top"` | Trong lưới form hoặc dialog cấu hình, cạnh các [Form field](/components/form-field) có nhãn trên |
| `showState` | Nhãn là danh từ chưa nói rõ bật nghĩa là gì ("Duyệt nhanh"). Đổi chữ bằng `onText` / `offText` |
| `hideLabel` | Switch trong ô bảng đã có tiêu đề cột; nhãn vẫn được đọc. Thêm tooltip trùng nhãn |

::example{switch-states}

## Trạng thái

| Trạng thái | Cấu hình | Hành vi |
|------------|----------|---------|
| Bật / tắt | `checked` | Phân biệt bằng **vị trí** tay gạt và màu rãnh, không chỉ bằng màu |
| Chỉ đọc | `readonly` | Thấy giá trị, focus được, bấm không đổi; rãnh trung tính có viền |
| Bị khoá | `disabled`, hoặc `control.disable()` | Không focus được, vẫn thấy vị trí bật/tắt; ghi lý do trong `hint` |

Switch không có trạng thái lỗi: thiết lập không có "giá trị sai". Lỗi khi lưu báo ở cấp trang ([Alert](/components/alert) hoặc live region), kèm trả switch về trạng thái cũ.

`NxtSwitch` implement `ControlValueAccessor` (`formControlName`, `[formControl]`, `[(ngModel)]`), dùng cho trang thiết lập tự lưu theo form.

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Focus vào / ra; switch bị khoá bị bỏ qua, switch chỉ đọc vẫn nhận focus |
| <kbd>Space</kbd> | Bật / tắt |
| <kbd>Enter</kbd> | Bật / tắt |

- `button type="button" role="switch"` với `aria-checked="true|false"`; screen reader đọc "Nhận thông báo qua email, công tắc, bật". <kbd>Space</kbd> và <kbd>Enter</kbd> là hành vi native của `button`.
- Chữ trạng thái "Bật"/"Tắt" có `aria-hidden`: trạng thái đã có trong `aria-checked`, đọc thêm sẽ bị lặp.
- Chỉ đọc: `aria-readonly="true"`. Gợi ý nối bằng `aria-describedby`.
- Vòng focus ôm rãnh (`focus.ring.*`); vùng chạm tối thiểu 24×24px. Ở chế độ tương phản cao, rãnh bật tô `Highlight`.
- Chuyển động của tay gạt dùng `motion.duration.fast`, về 0 khi người dùng giảm chuyển động.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Nhận thông báo qua email | Bật/tắt thông báo qua email |
| Tự chuyển sang đơn kế tiếp sau khi duyệt | Không tự chuyển đơn (nhãn phủ định) |
| Nhãn cố định, trạng thái ở switch | Nhãn đổi qua lại "Đang bật" / "Đang tắt" |
| "Đã bật thông báo qua email." (live region) | Không báo gì sau khi lưu |

## API

::api{switch}

## Token

::tokens{component.switch}

## Changelog

- **Chưa phát hành**: phát hành beta `nxt-switch`: `button[role=switch]`, `labelPosition` (`start` / `top`), `hideLabel`, `hint`, `showState` + `onText` / `offText`, `disabled`, `readonly`, `ControlValueAccessor`.

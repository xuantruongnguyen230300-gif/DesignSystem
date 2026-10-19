---
title: Button
description: Kích hoạt một hành động trên trang hiện tại — lưu, gửi duyệt, xoá, mở dialog.
status: beta
group: Hành động
order: 1
package: "@nxt/ui/button"
keywords:
  - nut
  - nut bam
  - button
  - hanh dong
---

# Button

## Khi nào dùng

- Hành động thay đổi dữ liệu hoặc trạng thái giao diện: "Lưu hồ sơ", "Gửi duyệt", "Xoá 3 nhân viên".
- Mở dialog hoặc drawer để làm tiếp một tác vụ.

## Khi nào không dùng

- **Điều hướng sang trang khác**: dùng link. Nếu link cần trông như nút, dùng `a[nxtButton]`; nó vẫn giữ ngữ nghĩa link, mở được tab mới và hiện URL khi hover.
- **Bật/tắt có hiệu lực ngay**: dùng switch (đợt B).
- **Chọn một trong vài giá trị**: dùng segmented control hoặc radio (đợt B).
- **Chỉ có icon**: dùng `nxtIconButton` kèm `aria-label` (đợt A).

## Variant

Mỗi vùng màn hình **chỉ có một nút primary**. Khi phân vân, chọn variant nhẹ hơn.

::example{button-variants}

| Variant | Dùng cho |
|---------|----------|
| `primary` | Hành động chính của vùng |
| `secondary` (mặc định) | Hành động phụ, ngang hàng |
| `ghost` | Hành động ít quan trọng trong toolbar, hàng bảng |
| `danger` | Hành động phá huỷ, ghi rõ đối tượng: "Xoá 3 nhân viên" |

## Kích thước

Chiều cao lấy theo **mật độ** hiện hành. Thử đổi mật độ của ví dụ: `md` là 28/32/40px ở gọn/vừa/rộng.

::example{button-sizes}

## Trạng thái

**Disabled vẫn focus được.** NXT dùng `aria-disabled` thay cho thuộc tính `disabled`, nên người dùng bàn phím và screen reader vẫn tới được nút và đọc được *lý do* (liên kết bằng `aria-describedby`).

**Loading giữ nguyên kích thước.** Nhãn vẫn nằm trong cây accessibility, có `aria-busy="true"`, và mọi cú click đều bị chặn. Bấm "Lưu hồ sơ" để thử.

::example{button-states}

## Icon

Icon đặt trước nhãn cho hành động, đặt sau nhãn cho hành động mở thêm (mũi tên). Icon luôn có `aria-hidden="true"`.

::example{button-icons}

## Trong bố cục thật

::example{button-toolbar}

## Hành vi an toàn mặc định

- `type` mặc định là `button`: nút nằm trong `<form>` không vô tình submit. Muốn submit thì đặt `type="submit"` một cách tường minh.
- Khi `disabled` hoặc `loading`, cú click bị chặn **trước** mọi `(click)` của bạn, kể cả submit form và phím Enter.

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Focus vào/ra, kể cả khi disabled (để đọc lý do) |
| <kbd>Enter</kbd> | Kích hoạt; bị chặn khi disabled/loading |
| <kbd>Space</kbd> | Kích hoạt (`<button>`); bị chặn khi disabled/loading |

- Role native `button` hoặc `link`, không gắn thêm `role`.
- Vùng chạm nhỏ nhất là 24×24px (size `sm` ở mật độ gọn).
- Vòng focus dùng `focus.ring.*`, đạt ≥ 3:1 với nền ở mọi chế độ.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Thêm nhân viên | Thêm mới |
| Gửi duyệt | OK |
| Xoá 3 nhân viên | Xoá |
| Lưu hồ sơ | Xác nhận |

## API

::api{button}

## Token

::tokens{component.button}

## Changelog

- **0.1.0**: phát hành beta: 4 variant, 3 size, `aria-disabled`, `loading`, `type` an toàn.

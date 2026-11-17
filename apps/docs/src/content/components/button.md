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
  - toggle
  - nut bat tat
  - aria-pressed
---

# Button

## Khi nào dùng

- Hành động thay đổi dữ liệu hoặc trạng thái giao diện: "Lưu hồ sơ", "Gửi duyệt", "Xoá 3 nhân viên".
- Mở dialog hoặc drawer để làm tiếp một tác vụ.

## Khi nào không dùng

- **Điều hướng sang trang khác**: dùng link. Nếu link cần trông như nút, dùng `a[nxtButton]`; nó vẫn giữ ngữ nghĩa link, mở được tab mới và hiện URL khi hover.
- **Bật/tắt một cài đặt** (nhận email, chế độ tối): dùng switch. Bật/tắt một **chế độ hiển thị** trên thanh công cụ thì dùng toggle button (bên dưới).
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

## Toggle button

Đặt `[(pressed)]` để nút thành nút bật/tắt: bấm thì đảo giá trị, screen reader đọc "đã nhấn / chưa nhấn" (`aria-pressed`). Dùng cho chế độ xem trên thanh công cụ: "Chỉ xem của tôi", "Hiện cột đã ẩn", mở/đóng khung chi tiết.

::example{button-toggle}

- Chỉ `secondary` và `ghost` (không có toggle primary/danger). Khi bật: nền chọn và viền chọn dày gấp đôi, không chỉ khác ở màu.
- Nhãn **giữ nguyên** khi đổi trạng thái ("Chỉ xem của tôi"), không đổi thành "Bỏ chỉ xem của tôi".
- `pressed` để `undefined` (mặc định) là nút thường, không có `aria-pressed`.
- Khác switch (cài đặt) và checkbox (lựa chọn cần bấm Lưu).

## Trong bố cục thật

Thanh công cụ của trang danh sách (ngay trên bảng): bên trái ô tìm kiếm và Bộ lọc, bên phải hai nút icon nhập/xuất Excel có tooltip, vạch ngăn, rồi nút primary **"Thêm mới"** ngoài cùng. Bố cục đầy đủ ở pattern [Trang danh sách & danh mục](/patterns/list-page).

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
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên toggle button | Đảo trạng thái nhấn (`aria-pressed`); bị chặn khi disabled/loading |

- Role native `button` hoặc `link`, không gắn thêm `role`.
- Vùng chạm nhỏ nhất là 24×24px (size `sm` ở mật độ gọn).
- Vòng focus dùng `focus.ring.*`, đạt ≥ 3:1 với nền ở mọi chế độ.

## Nội dung

Nhãn nút là **động từ + đối tượng** khi đối tượng chưa rõ từ ngữ cảnh. Ngoại lệ duy nhất là nút tạo ở header trang.

- **Nút tạo của trang danh sách ghi "Thêm mới"** và đứng ngoài cùng bên phải thanh công cụ. Tiêu đề trang hoặc tab đang chọn đã nói đối tượng ("Nhân viên", tab "Chức danh"), nên mọi trang danh sách dùng cùng một nhãn ở cùng một chỗ. Được đặt `aria-label="Thêm mới chức danh"` cho screen reader: tên truy cập **bắt đầu bằng** chữ đang hiện (WCAG 2.5.3, label in name), nên người dùng điều khiển bằng giọng nói vẫn gọi được "Thêm mới". Drawer mở ra có tiêu đề cụ thể: "Thêm chức danh".
- **Giữ động từ + đối tượng** khi trên cùng một màn tạo được nhiều loại đối tượng ("Thêm người phụ thuộc", "Thêm quá trình công tác" trong hồ sơ nhân viên), cho nút submit ("Lưu", "Lưu hồ sơ", "Gửi duyệt"), và cho hành động phá huỷ, kèm số lượng ("Xoá 3 chức danh").
- **Nhập/xuất Excel là hai nút icon** (`nxtIconButton`) đặt cạnh nút primary, có `aria-label` và tooltip ghi rõ đối tượng: `file-upload` "Nhập chức danh từ Excel", `file-download` "Xuất 29 chức danh ra Excel". Xuất đúng phạm vi đang xem, và nói rõ khi đang lọc: "Xuất 7 chức danh đang lọc ra Excel".

| Nên | Không nên |
|-----|-----------|
| Thêm mới (thanh công cụ, `aria-label="Thêm mới nhân viên"`) | Thêm nhân viên mới vào hệ thống |
| Thêm người phụ thuộc (nhiều loại đối tượng trên một màn) | Thêm mới |
| Gửi duyệt | OK |
| Xoá 3 nhân viên | Xoá |
| Lưu hồ sơ | Xác nhận |
| Nút icon "Xuất 29 chức danh ra Excel" | Nút chữ "Xuất Excel" cạnh "Nhập Excel" và "Thêm mới" |

## API

::api{button}

## Token

::tokens{component.button}

## Changelog

- **Chưa phát hành**: toggle button (`pressed`, `aria-pressed`, chỉ `secondary`/`ghost`); spinner dùng `motion.duration.loop`.
- **0.1.0**: phát hành beta: 4 variant, 3 size, `aria-disabled`, `loading`, `type` an toàn.

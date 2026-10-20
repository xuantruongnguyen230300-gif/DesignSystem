---
title: Avatar
description: Ảnh đại diện, hoặc chữ cái đầu theo Họ + Tên trên nền màu cố định theo tên, để cùng một người luôn có cùng một màu.
status: beta
group: Hiển thị dữ liệu
order: 33
package: "@nxt/ui/avatar"
keywords:
  - avatar
  - anh dai dien
  - chu cai dau
  - ten viet tat
  - nguoi dung
  - nhan vien
  - tai khoan
---

# Avatar

## Khi nào dùng

- Cạnh tên người trong danh sách, bảng, hộp duyệt đơn, timeline, thanh tài khoản.
- Nhóm người tham gia (xếp chồng), khi người dùng chỉ cần biết "có những ai" chứ không cần đọc từng tên.

## Khi nào không dùng

- **Logo công ty, phòng ban, sản phẩm**: avatar chỉ dành cho người. Dùng ảnh hoặc icon.
- **Thay cho tên** ở nơi cần nhận ra chính xác người đó (người duyệt, người nhận): luôn hiện tên kèm theo.
- **Trạng thái trực tuyến**: chưa hỗ trợ; đừng tự chồng chấm màu lên avatar.

## Chữ cái đầu

Khi không có ảnh, avatar hiện chữ cái đầu của **Họ** và **Tên** (từ đầu tiên và từ cuối cùng), theo cách gọi tên người Việt: "Nguyễn Thị Ngọc Diệp" → "ND", "Đặng Anh" → "ĐA"; tên chỉ có một từ thì hiện một chữ. Màu nền được chọn ổn định từ tên (6 tông), nên cùng một người luôn có cùng màu trên mọi màn hình.

::example{avatar-initials}

Hai hàm `nxtInitials(name)` và `nxtAvatarTone(name)` được export để dùng ở nơi khác, ví dụ cho placeholder trong lúc đang tải dữ liệu.

## Kích thước và ảnh

- `sm` cho thanh tài khoản và hàng bảng dày; `md` (mặc định) cho danh sách; `lg` cho đầu trang chi tiết.
- `src` là URL ảnh. Khi ảnh lỗi (404, link hết hạn), avatar tự quay về chữ cái đầu thay vì hiện ảnh vỡ.
- Ảnh được cắt vừa khung tròn (`object-fit: cover`). Dùng ảnh vuông, kích thước tối thiểu gấp đôi kích thước hiển thị.

::example{avatar-sizes}

## Avatar cạnh tên

Khi tên đã hiển thị ngay bên cạnh, avatar **chỉ để trang trí**: không truyền `label`, để screen reader không đọc tên hai lần. Khi đó ảnh có `alt=""` và chữ cái đầu có `aria-hidden`.

Khi avatar đứng một mình (cột hẹp, nhóm người), truyền `label` là họ tên đầy đủ. Người dùng nhìn chỉ thấy chữ cái đầu, nên cân nhắc hiện tên ở chỗ khác: trong trang chi tiết, hoặc tooltip trên một phần tử focus được.

::example{avatar-with-name}

## Nhóm xếp chồng

Hiện tối đa 3–5 avatar, phần còn lại gộp thành "+N".

- Cả nhóm là một danh sách có tên (`aria-label`).
- Mỗi avatar trong nhóm có `label`.
- "+N" có chữ ẩn "và N người khác".
- Một vòng viền cùng màu nền giúp các avatar chồng lên nhau vẫn tách bạch.

::example{avatar-group}

## Accessibility

Avatar không tương tác và không có điểm dừng Tab. Nếu avatar mở hồ sơ hoặc menu tài khoản, bọc nó trong `<a>` hoặc `<button>` và đặt tên cho phần tử đó ("Tài khoản: Đặng Anh"); avatar bên trong không cần `label`.

- Không có `label`: avatar hoàn toàn trang trí.
- Có `label`: ảnh dùng `label` làm `alt`; khi hiện chữ cái đầu, `label` nằm trong một chữ ẩn đi kèm.
- Viền mảnh `component.avatar.border` giữ hình tròn rõ ràng khi nền tông gần trùng màu nền trang.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| `label="Bùi Quang Huy"` | `label="Ảnh đại diện"` |
| `name="Nguyễn Thị Ngọc Diệp"` (ra "ND") | `name="N.T.N.Diệp"` (ra một chữ "N") |
| "+3" kèm chữ ẩn "và 3 người khác" | "+3" không có chữ ẩn |

## API

::api{avatar}

## Token

::tokens{component.avatar}

## Changelog

- **0.1.0**: phát hành beta: `nxt-avatar` với `name`, `src` (tự về chữ cái khi ảnh lỗi), size `sm`/`md`/`lg`, `label`; hàm `nxtInitials` (Họ + Tên) và `nxtAvatarTone` (6 tông ổn định theo tên).

---
title: Icon
description: Bộ 259 icon nét (Tabler, MIT) có kiểu tên chặt — trang trí mặc định, tự lấy kích thước từ component chứa nó.
status: beta
group: Hiển thị dữ liệu
order: 36
package: "@nxt/ui/icon"
keywords:
  - icon
  - bieu tuong
  - hinh minh hoa
  - tabler
  - svg
  - kich thuoc icon
  - nut icon
---

# Icon

## Khi nào dùng

- Đi kèm nhãn để người dùng nhận ra nhanh hơn: nút "Xuất Excel", mục điều hướng, tab.
- Trạng thái nhỏ trong dòng dữ liệu, khi hình dạng đã rõ nghĩa (đã ký, chờ ký).
- Nút chỉ có icon trong toolbar hoặc hàng bảng, cho hành động ai cũng biết (sửa, tải xuống, thêm thao tác).

## Khi nào không dùng

- **Thay cho chữ khi nghĩa chưa rõ**: một icon lạ kèm tooltip vẫn khó hiểu hơn hai chữ. Viết nhãn.
- **Trang trí cho đẹp**: không đặt icon trước mọi dòng chữ hay mọi tiêu đề. Icon chỉ có giá trị khi hiếm.
- **Ảnh minh hoạ lớn, logo, ảnh đại diện**: dùng ảnh, hoặc [Avatar](/components/avatar) cho người.

## Bộ icon

NXT kèm 259 icon nét chọn từ [Tabler Icons](https://tabler.io/icons) (giấy phép MIT), chia theo nhóm: điều hướng, hành động, trạng thái, con người, nghiệp vụ nhân sự, và hệ thống thiết kế. Tên icon là chuỗi tiếng Anh dạng `kebab-case`. Bấm một icon để sao chép mã.

::example{icon-gallery}

```html
<nxt-icon name="users" />
```

`name` có kiểu `NxtIconName`, sinh từ chính bộ icon. Gõ sai tên (`"user-group"` thay cho `"users-group"`) thì lỗi ngay lúc biên dịch, không đợi lên trình duyệt mới thấy ô trống. Muốn duyệt cả bộ trong code, dùng `NXT_ICONS` (object tên → dữ liệu path).

Icon vẽ bằng `<path>` trong template, không dùng `innerHTML`, nên chạy được với Content Security Policy chặt.

## Kích thước

| `size` | Token | Dùng cho |
|--------|-------|----------|
| `sm` | `size.icon.sm` | Trong control cỡ sm/md, trong bảng, tag |
| `md` | `size.icon.md` | Icon đứng riêng, control cỡ lg, mục cấp 1 của sidenav |
| `lg` | `size.icon.lg` | Minh hoạ trong empty state nhỏ, alert có tiêu đề |

**Thường không cần đặt `size`.** Khi bỏ trống, icon lấy kích thước từ biến `--nxt-icon-size` của component chứa nó: Button đặt bằng `--nxt-button-icon-size`, Menu và Tabs đặt `size.icon.sm`, Sidenav đặt `size.icon.md`. Component của bạn cũng làm vậy: đặt `--nxt-icon-size` một lần trên phần tử cha, mọi icon bên trong tự theo.

::example{icon-sizes}

Độ dày nét lấy từ token `component.icon.stroke` (1,75, mảnh hơn mặc định 2 của Tabler, rõ hơn ở cỡ nhỏ). Màu là `currentColor`: icon theo màu chữ của phần tử cha, hoặc đặt `color` trên chính `nxt-icon`.

## Trang trí hay mang nghĩa

::example{icon-meaning}

- **Mặc định icon là trang trí**: `aria-hidden="true"`, screen reader bỏ qua. Đúng cho hầu hết trường hợp, vì icon đi kèm một nhãn đã có chữ.
- **Icon tự mang nghĩa** (không có chữ bên cạnh): đặt `label`. Icon thành `role="img"` có tên, ví dụ `label="Đã ký"`. Chỉ dùng khi hình dạng đủ rõ, hoặc tiêu đề cột đã giải thích. Không phân biệt trạng thái chỉ bằng màu: hai trạng thái phải khác hình.
- **Nút chỉ có icon**: dùng `button[nxtIconButton]` và đặt `aria-label` trên **nút**, không đặt `label` trên icon. Ở hàng dữ liệu, tên nút gồm cả đối tượng: "Tải xuống Hợp đồng lao động HĐ-2024-0311". Thêm `nxtTooltip` ([Tooltip](/components/tooltip)) để người dùng chuột cũng thấy tên.

```html
<button nxtIconButton variant="ghost" aria-label="Sửa Kế toán trưởng" nxtTooltip="Sửa">
  <nxt-icon name="pencil" />
</button>
```

## Thêm icon

1. Tìm tên trên [tabler.io/icons](https://tabler.io/icons) (bản **outline**).
2. Thêm tên vào đúng nhóm trong `packages/ui/icon/icons.json`.
3. Chạy `npm run icons:build`. Script sinh lại `packages/ui/icon/src/icons.generated.ts` và báo lỗi nếu tên không có trong Tabler.
4. Dùng `<nxt-icon name="…" />`. Kiểu `NxtIconName` cập nhật theo.

Chỉ thêm icon mà ít nhất một màn hình đang cần. Mỗi icon làm gói `@nxt/ui/icon` nặng thêm một chút.

## Accessibility

- Icon không nhận focus (`focusable="false"`) và không có tương tác riêng. Đặt icon trong `<button>` hoặc `<a>` khi cần bấm.
- Icon trang trí có `aria-hidden="true"`. Icon có `label` có `role="img"` và `aria-label`.
- Icon mang nghĩa cần tương phản ít nhất 3:1 với nền (WCAG 1.4.11). Dùng token `color.icon.*`, đã được kiểm ở mọi chế độ.
- Ở chế độ tương phản cao (forced colors), nét icon chuyển sang `CanvasText`.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| `aria-label="Tải xuống Hợp đồng HĐ-2024-0311"` trên nút | `aria-label="download"` |
| Icon + "Xuất Excel" | Chỉ icon file cho "Xuất Excel" |
| Một icon cho một nghĩa trong cả sản phẩm (`trash` = xoá) | `trash` ở màn này, `x` ở màn khác cho cùng việc xoá |

## API

::api{icon}

## Token

::tokens{component.icon}

## Changelog

- **0.1.0**: phát hành beta: 259 icon Tabler outline, `NxtIconName` kiểm tên lúc biên dịch, 3 size, kế thừa `--nxt-icon-size`, `label` cho icon mang nghĩa.

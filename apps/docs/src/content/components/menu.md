---
title: Menu
description: Danh sách lệnh nổi mở từ một nút — thao tác trên một hồ sơ, lựa chọn hiển thị, menu tài khoản.
status: beta
group: Hành động
order: 2
package: "@nxt/ui/menu"
keywords:
  - menu
  - menu thao tac
  - thao tac them
  - danh sach lenh
  - dropdown
  - ba cham
  - sap xep
---

# Menu

## Khi nào dùng

- Một đối tượng có nhiều hành động phụ: hàng nhân viên có "Xem hồ sơ", "Gửi email", "Cho nghỉ việc".
- Toolbar hết chỗ: gom các hành động ít dùng vào nút "Thao tác" hoặc nút ba chấm.
- Một tuỳ chọn hiển thị không cần lúc nào cũng thấy: sắp xếp, mật độ, cột hiển thị (dùng `nxtMenuItemRadio`).
- Menu tài khoản trên thanh trên cùng: hồ sơ của tôi, cài đặt, đăng xuất.

## Khi nào không dùng

- **Hành động chính của vùng**: đặt ra ngoài bằng [Button](/components/button). Không giấu "Lưu" hay "Gửi duyệt" vào menu.
- **Điều hướng giữa các trang**: dùng [App shell & Sidenav](/components/app-shell) hoặc [Tabs](/components/tabs).
- **Chọn giá trị trong form**: dùng select hoặc radio. Menu không gửi giá trị theo form.
- **2–5 lựa chọn cần thấy ngay**: dùng [Segmented](/components/segmented).
- **Nội dung có ô nhập, bộ lọc nhiều trường**: menu chỉ chứa lệnh. Dùng drawer hoặc popover (đợt sau).

## Cấu trúc

Menu gồm một **nút mở** (`[nxtMenuTriggerFor]`) và một `ng-template` chứa phần tử `nxtMenu`. Menu chỉ được tạo khi mở, và bị huỷ khi đóng.

```html
<button nxtButton [nxtMenuTriggerFor]="actions">Thao tác <nxt-icon name="chevron-down" /></button>
<ng-template #actions>
  <div nxtMenu>
    <div nxtMenuLabel>Hồ sơ</div>
    <button nxtMenuItem (triggered)="edit()">Sửa thông tin</button>
    <div nxtMenuSeparator></div>
    <button nxtMenuItem tone="danger" (triggered)="remove()">Xoá nhân viên</button>
  </div>
</ng-template>
```

- `nxtMenuLabel` là nhãn nhóm, không tương tác. `nxtMenuSeparator` ngăn các nhóm.
- Mục phá huỷ (`tone="danger"`) luôn ở **cuối menu**, sau một đường phân cách, và ghi rõ đối tượng: "Xoá nhân viên", không chỉ "Xoá".
- Icon trong mục là tuỳ chọn. Nếu dùng thì dùng cho mọi mục trong cùng nhóm để chữ thẳng hàng.

::example{menu-basic}

**Mục bị khoá** đặt bằng `[disabled]="true"`. Mục vẫn focus được bằng phím mũi tên (`aria-disabled`), nên người dùng biết nó tồn tại. Ghi lý do ngắn ngay trong nhãn khi có thể. Không viết thuộc tính tĩnh `disabled` trên `<button nxtMenuItem>`: thuộc tính đó khoá luôn nút native và mục không còn focus được.

Bắt sự kiện bằng `(triggered)` thay cho `(click)`: `triggered` chạy cả khi chọn bằng bàn phím, và không chạy khi mục bị khoá.

## Một lựa chọn

`nxtMenuItemRadio` dùng cho lựa chọn loại trừ nhau, như thứ tự sắp xếp. Mục đang chọn có dấu tích và `aria-checked="true"`. Giá trị đang chọn nên hiện ngay trên nút mở ("Sắp xếp: Mới gửi nhất"), để người dùng không phải mở menu mới biết.

::example{menu-radio}

Bấm <kbd>Space</kbd> trên một mục radio sẽ chọn mà **không đóng** menu. <kbd>Enter</kbd> và click thì chọn rồi đóng.

Một menu có **hai thiết lập trở lên** (ví dụ mật độ và brand) thì mỗi thiết lập bọc trong một `nxtMenuGroup` có `label`. Nhóm là `role="group"` có tên, và chọn trong nhóm này không bỏ chọn nhóm kia:

```html
<div nxtMenuLabel>Mật độ hiển thị</div>
<div nxtMenuGroup label="Mật độ hiển thị">
  <button nxtMenuItemRadio [checked]="density() === 'compact'" (triggered)="density.set('compact')">Gọn</button>
  <button nxtMenuItemRadio [checked]="density() === 'comfortable'" (triggered)="density.set('comfortable')">Vừa</button>
</div>
<div nxtMenuSeparator></div>
<div nxtMenuLabel>Brand sản phẩm</div>
<div nxtMenuGroup label="Brand sản phẩm">…</div>
```

## Trên hàng dữ liệu

Nút ba chấm ở mỗi hàng là nút chỉ có icon: dùng `nxtIconButton`, và đặt `aria-label` gồm cả tên đối tượng ("Thao tác cho Nguyễn Văn An"). Nếu tất cả nút cùng tên "Thao tác", người dùng screen reader không phân biệt được các hàng.

Menu mở bên dưới và canh theo mép trái nút. Ở cột cuối của bảng, truyền `[nxtMenuPosition]` (mảng `ConnectedPosition` của CDK) để canh theo mép phải. Khi không đủ chỗ, menu tự lật lên trên.

::example{menu-row-actions}

## Accessibility

Menu dựng trên Angular CDK Menu, theo mẫu [Menu Button của WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/).

| Phím | Hành vi |
|------|---------|
| <kbd>Enter</kbd> / <kbd>Space</kbd> / <kbd>↓</kbd> trên nút mở | Mở menu, focus mục đầu tiên |
| <kbd>↑</kbd> trên nút mở | Mở menu, focus mục cuối cùng |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Sang mục kế tiếp / trước đó, vòng lại ở hai đầu |
| <kbd>Home</kbd> / <kbd>End</kbd> | Về mục đầu / mục cuối |
| Gõ chữ cái | Nhảy tới mục bắt đầu bằng chữ đó |
| <kbd>Enter</kbd> | Chọn mục rồi đóng menu |
| <kbd>Space</kbd> | Chọn mục. Mục thường đóng menu, mục radio giữ menu mở |
| <kbd>Esc</kbd> | Đóng menu, trả focus về nút mở |
| <kbd>Tab</kbd> | Đóng menu, focus đi tiếp từ nút mở |

- Nút mở có `aria-haspopup="menu"` và `aria-expanded`. Menu có `role="menu"`, các mục có `role="menuitem"` hoặc `menuitemradio`.
- Mục bị khoá vẫn nằm trong vòng phím mũi tên, có `aria-disabled="true"` và không kích hoạt.
- Click ra ngoài cũng đóng menu. Menu không bẫy focus, vì nó không phải dialog.
- Icon trong mục luôn `aria-hidden`; tên của mục là chữ của nó.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Sửa thông tin | Sửa |
| Xoá nhân viên | Xoá |
| Tải hồ sơ PDF | PDF |
| Sắp xếp: Mới gửi nhất | Sắp xếp |
| Thao tác cho Nguyễn Văn An (nhãn của nút ba chấm) | Thao tác (giống nhau ở mọi hàng) |

- Nhãn bắt đầu bằng động từ, tối đa khoảng 4 từ.
- Không quá khoảng 10 mục và 3 nhóm. Nhiều hơn thì đối tượng cần một trang chi tiết riêng.

## API

::api{menu}

Các input/output dưới đây đến từ CDK Menu (qua `hostDirectives`). Bảng tự sinh ở trên chỉ có tên, nên kiểu và output `triggered` được ghi đầy đủ ở đây:

| Directive | Tên | Kiểu | Mô tả |
|-----------|-----|------|-------|
| `[nxtMenuTriggerFor]` | `nxtMenuTriggerFor` | `TemplateRef` | Template chứa `nxtMenu` sẽ mở |
| `[nxtMenuTriggerFor]` | `nxtMenuPosition` | `ConnectedPosition[]` | Vị trí menu so với nút mở (mặc định: bên dưới, canh mép đầu) |
| `[nxtMenu]` | | | Khung menu (`role="menu"`), điều khiển phím mũi tên và gõ chữ để tìm |
| `[nxtMenuItem]` | `disabled` | `boolean` | Khoá mục, vẫn focus được |
| `[nxtMenuItem]` | `triggered` | output `void` | Phát ra khi mục được chọn (chuột hoặc bàn phím) |
| `[nxtMenuItemRadio]` | `checked` | `boolean` | Mục đang được chọn |
| `[nxtMenuItemRadio]` | `disabled` | `boolean` | Khoá mục |
| `[nxtMenuItemRadio]` | `triggered` | output `void` | Phát ra khi mục được chọn; cập nhật giá trị của bạn tại đây |
| `[nxtMenuGroup]` | `label` | `string` | Nhóm radio có tên (`role="group"`); mỗi nhóm là một lựa chọn riêng |
| `[nxtMenuLabel]` | | | Nhãn nhóm, không tương tác |
| `[nxtMenuSeparator]` | | | Đường phân cách (`role="separator"`) |

## Token

::tokens{component.menu}

## Changelog

- **0.1.0**: phát hành beta: nút mở, menu, mục thường và mục `danger`, mục radio, nhóm radio (`nxtMenuGroup`), nhãn nhóm, đường phân cách, vị trí tuỳ chỉnh.

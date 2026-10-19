---
title: App shell & Sidenav
description: Khung của ứng dụng nghiệp vụ — điều hướng bên trái, thanh trên cùng, vùng nội dung — tự thành ngăn kéo trên màn hình hẹp.
status: beta
group: Điều hướng
order: 20
package: "@nxt/ui/app-shell"
keywords:
  - app shell
  - khung ung dung
  - sidenav
  - sidebar
  - menu ben trai
  - thanh dieu huong
  - topbar
  - thanh tren cung
  - thu gon menu
  - bo cuc ung dung
---

# App shell & Sidenav

## Khi nào dùng

- Mọi ứng dụng nghiệp vụ có nhiều màn hình: đặt **một** `nxt-app-shell` ở gốc ứng dụng, bọc `<router-outlet />`.
- Sidenav cho điều hướng chính theo phân hệ (Nhân sự, Chấm công, Tiền lương), tối đa hai cấp con.

## Khi nào không dùng

- **Đăng nhập, trang lỗi, màn hình in**: không cần shell. Xem template [Đăng nhập](/templates/login).
- **Chuyển giữa các phần của một đối tượng** (hồ sơ, hợp đồng, tài liệu của một nhân viên): dùng [Tabs](/components/tabs).
- **Lệnh và hành động**: dùng [Button](/components/button) hoặc [Menu](/components/menu). Sidenav chỉ chứa link tới trang.

## Cấu trúc

```html
<nxt-app-shell>
  <nxt-sidenav [items]="nav" [(collapsed)]="navCollapsed" label="Điều hướng NXT HRM">
    <a nxtSidenavHeader routerLink="/">…logo…</a>
  </nxt-sidenav>

  <nxt-topbar>
    <nxt-form-field nxtTopbarCenter label="Tìm kiếm trong NXT HRM" hideLabel size="sm">…</nxt-form-field>
    <button nxtTopbarEnd nxtIconButton variant="ghost" aria-label="Thông báo"><nxt-icon name="bell" /></button>
    <button nxtTopbarEnd class="account" aria-label="Tài khoản: Đặng Anh" [nxtMenuTriggerFor]="account">…avatar…</button>
  </nxt-topbar>

  <router-outlet />
</nxt-app-shell>
```

| Slot | Vị trí | Dùng cho |
|------|--------|----------|
| `[nxtSidenavHeader]` | Đầu sidenav, cạnh nút thu gọn | Logo, tên sản phẩm. Bị ẩn khi thu gọn |
| `[nxtSidenavTop]` | Dưới header, trên danh sách mục | Nút tạo nhanh, chọn công ty hoặc chi nhánh |
| `[nxtSidenavFooter]` | Cuối sidenav | Mục phụ: phiên bản, chuyển đơn vị. **Không** đặt người dùng đăng nhập (đã có ở topbar) |
| `[nxtTopbarStart]` | Bên trái thanh trên | Tên đơn vị đang làm việc |
| `[nxtTopbarCenter]` | Giữa, bề rộng cố định, co lại khi hẹp | Ô tìm kiếm toàn cục |
| `[nxtTopbarEnd]` | Bên phải, không bao giờ bị che | Trợ giúp, thông báo, menu tài khoản (nơi **duy nhất** hiện người dùng đăng nhập) |
| (mặc định) | Vùng nội dung | `<router-outlet />` |

::example{app-shell-basic}

## Cuộn: `container` hay `page`

| `scroll` | Ai cuộn | Dùng cho |
|----------|---------|----------|
| `container` (mặc định) | Chỉ vùng nội dung. Sidenav và thanh trên đứng yên | Ứng dụng nghiệp vụ: bảng, form, master-detail |
| `page` | Cả tài liệu. Sidenav và thanh trên dính (sticky) | Trang đọc dài, tài liệu. Trang docs này dùng `scroll="page"` |

- Với `container`, shell **lấp đầy phần tử cha**. Phần tử cha phải có chiều cao xác định, thường là `block-size: 100dvh` cho gốc ứng dụng. Ví dụ trên đặt shell trong một khung cao cố định: cuộn danh sách đơn thì sidenav và thanh trên không chạy theo.
- Với `page`, trình duyệt tự lo cuộn: <kbd>Ctrl</kbd>+<kbd>F</kbd>, link neo (`#muc`) và nút Back giữ đúng vị trí cuộn.

```html
<nxt-app-shell scroll="page">…</nxt-app-shell>
```

## Mục điều hướng

Sidenav vẽ từ một mảng `NxtNavItem`. Thứ bậc thể hiện bằng icon ở cấp 1, mục con thụt vào trên một đường dẫn thẳng hàng với icon cha, và tiêu đề nhóm.

::example{app-shell-nav-items}

- **Tiêu đề nhóm** (`heading: true`): chữ nhỏ, không tương tác. Khi thu gọn thành đường kẻ.
- **Nhóm** (`children`): nút mở/đóng có `aria-expanded`. Nhóm chứa trang hiện tại tự mở, cho tới khi người dùng tự đóng hoặc mở. Mục có `children` không có `link`. Không lồng quá hai cấp con.
- **Trang hiện tại**: link có `aria-current="page"` và nền `item-active-bg`. Mục con có thêm vạch chỉ báo trên đường dẫn; nhóm chứa nó có icon màu primary. Đặt `exact: true` cho trang tổng quan, để nó không sáng lên ở mọi trang con.
- **Số đếm** (`badge`): chỉ dùng cho việc đang chờ người dùng xử lý, như đơn chờ duyệt. Không dùng cho thông tin chung.
- **Mục bị khoá** (`disabled` + `hint`): mục chưa dùng được (chưa bật tính năng, thiếu quyền) vẫn hiện, để người dùng biết nó tồn tại. Mục vẫn focus được, có `aria-disabled="true"`, và tooltip hiện lý do từ `hint`. Nếu người dùng không bao giờ được dùng mục đó, ẩn hẳn thay vì khoá.

## Thu gọn thành thanh icon

Nút ở header sidenav (`collapsible`, mặc định bật) chuyển giữa dạng đầy đủ và thanh icon (rail). Nút có `aria-expanded`, tên đổi theo trạng thái: "Thu gọn menu" / "Mở rộng menu".

::example{app-shell-rail}

- `collapsed` là two-way. Lưu lại (localStorage, hồ sơ người dùng) để lần sau mở đúng trạng thái.
- Tên mục bị ẩn về mặt hình ảnh nhưng vẫn là tên của link. Tooltip hiện tên khi hover hoặc focus.
- Nhóm cấp 1 mở thành **menu bên cạnh** (fly-out) chứa các mục con. Nhóm cấp 2 thành nhãn trong menu đó. Menu này dùng bàn phím như [Menu](/components/menu).
- Số đếm của link thu thành một chấm (con số vẫn nằm trong tên của link), tiêu đề nhóm thành đường kẻ, logo ở header bị ẩn.
- Rail chỉ có ở màn hình rộng. Dưới 1024px sidenav luôn là ngăn kéo đầy đủ.

## Màn hình hẹp

Dưới 1024px (`primitive.breakpoint.lg`), sidenav thành **ngăn kéo** trượt từ trái, và thanh trên hiện nút "Mở menu điều hướng".
- Ngăn kéo là modal: `role="dialog"`, `aria-modal="true"`, tên "Menu điều hướng". Focus chuyển vào link hoặc nút đầu tiên trong ngăn kéo. Phần còn lại của trang bị `inert`: không Tab tới được, screen reader không đọc; skip link tạm ẩn.
- Nút "Đóng menu điều hướng" ở đầu ngăn kéo (thay chỗ nút thu gọn), <kbd>Esc</kbd>, bấm lớp phủ, hoặc chuyển trang đều đóng ngăn kéo. Focus trở về nút mở. Nút đóng cần cho người dùng screen reader trên điện thoại, vì họ không có phím Esc.
- <kbd>Esc</kbd>, bấm lớp phủ, hoặc chuyển trang đều đóng ngăn kéo. Focus trở về nút mở.
- Breakpoint tính theo **viewport**, không theo bề rộng khung. Thu hẹp cửa sổ trình duyệt dưới 1024px để thử với các ví dụ trên.

## Shell lồng trong trang khác

- Khi là khung ngoài cùng, shell tạo landmark `main` cho vùng nội dung, và một link "Bỏ qua tới nội dung" hiện ra ở lần <kbd>Tab</kbd> đầu tiên.
- Khi nằm trong một `main` có sẵn (bản xem trước trong docs, ứng dụng nhúng), shell tự nhận ra: **không** tạo `main` thứ hai và **không** thêm skip link. Các ví dụ trên trang này rơi vào trường hợp đó.
- Mỗi sidenav là một landmark `navigation`. Đặt `label` riêng khi trang có nhiều hơn một (mặc định "Điều hướng chính").

## Dùng trạng thái của shell

Component nằm trong shell (kể cả trang con của `router-outlet`) có thể inject `NxtShellState`, ví dụ để đổi bảng thành danh sách thẻ trên màn hình hẹp:

```ts
import { NxtShellState } from '@nxt/ui/app-shell';

export class EmployeeListPage {
  protected readonly shell = inject(NxtShellState);
  // template: @if (shell.mobile()) { …danh sách thẻ… } @else { …bảng… }
}
```

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> | Skip link (khi là khung ngoài cùng) → sidenav (logo, nút thu gọn, các mục) → thanh trên → nội dung |
| <kbd>Enter</kbd> | Mở link. Trên nhóm: mở/đóng nhóm, hoặc mở menu bên cạnh khi thu gọn |
| <kbd>Space</kbd> | Mở/đóng nhóm |
| <kbd>Esc</kbd> | Đóng ngăn kéo (màn hình hẹp), đóng menu bên cạnh, ẩn tooltip |
| <kbd>↓</kbd> / <kbd>↑</kbd> trong menu bên cạnh | Chuyển mục, như [Menu](/components/menu) |

- Landmark: `navigation` (sidenav, có tên), `main` (vùng nội dung, khi không lồng), `banner` (thanh trên, khi không lồng).
- Nhóm là `<button>` có `aria-expanded` và `aria-controls`. Mục bị khoá có `role="link"`, `aria-disabled="true"` và vẫn nằm trong thứ tự Tab.
- Mục cấp 1 cao `size.control.lg`, mục con `size.control.md`: vùng chạm đạt 24×24px ở mọi mật độ.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Đơn nghỉ phép | Quản lý đơn nghỉ phép |
| Nhân sự | Phân hệ quản lý nhân sự |
| Nhân sự › Danh sách nhân viên | Nhân sự › Danh sách nhân sự |
| Cần quyền Quản trị tiền lương (`hint`) | Không có quyền |

- Nhãn là danh từ ngắn, 1–3 từ. Nhãn con không lặp lại tên nhóm cha.
- Xếp theo tần suất dùng, không theo bảng chữ cái. Thiết lập và cấu hình để cuối.
- Không quá khoảng 7 mục cấp 1.

## API

::api{app-shell}

`NxtNavItem`:

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `label` | `string` | Nhãn hiển thị, cũng là tên của link |
| `icon` | `NxtIconName` (tuỳ chọn) | Icon, nên có ở mọi mục cấp 1 (rail chỉ hiện icon) |
| `link` | `string` (tuỳ chọn) | Đường dẫn router. Mục có `children` không đặt `link` |
| `exact` | `boolean` (tuỳ chọn) | So khớp route chính xác, cho `/` hoặc trang tổng quan |
| `badge` | `string \| number` (tuỳ chọn) | Số việc đang chờ |
| `children` | `NxtNavItem[]` (tuỳ chọn) | Mục con: nhóm mở/đóng |
| `heading` | `boolean` (tuỳ chọn) | Tiêu đề nhóm, không tương tác |
| `disabled` | `boolean` (tuỳ chọn) | Hiện nhưng chưa dùng được |
| `hint` | `string` (tuỳ chọn) | Lý do khoá, hiện trong tooltip |

`NxtShellState` (inject được trong shell):

| Thành viên | Kiểu | Mô tả |
|------------|------|-------|
| `mobile` | `Signal<boolean>` | `true` khi viewport hẹp hơn 1024px |
| `mobileOpen` | `Signal<boolean>` | Ngăn kéo điều hướng đang mở |
| `open(trigger?)` | `void` | Mở ngăn kéo; focus trả về `trigger` khi đóng |
| `close()` | `void` | Đóng ngăn kéo |

## Token

::tokens{component.app-shell}

::tokens{component.sidenav}

::tokens{component.topbar}

## Changelog

- **0.1.0**: phát hành beta: shell với 2 chế độ cuộn, sidenav nhiều cấp có tiêu đề nhóm, số đếm, mục khoá có lý do, thu gọn thành thanh icon có tooltip và menu bên cạnh, ngăn kéo modal dưới 1024px, thanh trên 3 vùng, tự bỏ `main` khi lồng.

---
title: Page header & Breadcrumb
description: Đầu trang — vị trí trong cây trang, tiêu đề, mô tả, trạng thái và các hành động chính của trang.
status: beta
group: Điều hướng
order: 21
package: "@nxt/ui/page-header"
keywords:
  - page header
  - dau trang
  - tieu de trang
  - breadcrumb
  - duong dan
  - vi tri trang
  - hanh dong chinh
---

# Page header & Breadcrumb

## Khi nào dùng

- Đầu mỗi trang trong vùng nội dung của [App shell](/components/app-shell): tiêu đề trang (`h1`), một dòng mô tả, và các hành động áp cho cả trang.
- Breadcrumb cho trang nằm sâu từ hai cấp trở lên, nhất là trang chi tiết mở từ một danh sách ("Phê duyệt › DNP-0412").

## Khi nào không dùng

- **Tiêu đề của một card hay một vùng trong trang**: dùng `title` của card, hoặc heading `h2`/`h3`.
- **Trang cấp một** (Tổng quan, Phê duyệt): không cần breadcrumb, sidenav đã cho biết vị trí.
- **Breadcrumb thay cho điều hướng chính**: breadcrumb chỉ bổ sung, không thay sidenav.

## Cấu trúc

| Vùng | Cách đặt | Ghi chú |
|------|----------|---------|
| Breadcrumb | `[breadcrumb]="items"` | Chỉ hiện khi mảng có phần tử |
| Tiêu đề | `title` | `h1` mặc định. `headingLevel="2"` khi header nằm trong vùng con |
| Trạng thái | phần tử có `nxtPageMeta` | Thường là một [Tag](/components/tag), đứng cạnh tiêu đề |
| Mô tả | `description` | Một dòng: số lượng, thời điểm cập nhật, đơn vị |
| Hành động | phần tử có `nxtPageActions` | Tối đa một nút `primary` |
| Phía dưới | nội dung mặc định | Thường là [Tabs](/components/tabs) của trang |

## Trang danh sách

Page header của trang danh sách chỉ cho biết người dùng đang ở đâu: breadcrumb, tiêu đề, mô tả và tab. **Không** đặt Thêm mới, Nhập, Xuất ở đây: các nút đó tác động lên danh sách nên nằm trên thanh công cụ ngay trên bảng, trong phạm vi tab đang chọn (xem [Trang danh sách & danh mục](/patterns/list-page)).

::example{page-header-basic}

Muốn chiếu nhiều nút vào cùng một slot mà không thêm phần tử bọc, dùng `<ng-container ngProjectAs="[nxtPageActions]">`.

## Trang chi tiết

Trang chi tiết có breadcrumb về danh sách, trạng thái của đối tượng cạnh tiêu đề, và tab phía dưới để chia nội dung.

::example{page-header-detail}

- Trạng thái dùng tag có chấm và chữ, không chỉ màu.
- Mô tả trả lời "của ai, ở đâu, khi nào". Không lặp lại tiêu đề.
- Tab đặt làm nội dung mặc định của page header, nên vạch dưới của tab nằm ngay dưới phần đầu trang.

## Breadcrumb

`nxt-breadcrumb` dùng được riêng, ví dụ trên thanh trên cùng hoặc trong drawer.

::example{page-header-breadcrumb}

- Mục cuối là **trang hiện tại**: không bao giờ là link, và có `aria-current="page"`.
- Mục không có `link` (nhóm điều hướng không có trang riêng, như "Thiết lập") hiện thành chữ thường.
- Breadcrumb ghi đúng tên trang trong sidenav. Mục cuối có thể là mã hoặc tên đối tượng ("DNP-0412", "Kế toán trưởng").
- Breadcrumb tự xuống dòng khi hẹp. Không rút gọn bằng "…".

## Đổi màn hình không qua router

Có màn hình đổi nội dung ngay trong một component, không đổi route: danh sách và trình sửa của [Quy trình duyệt](/templates/workflow), danh sách và chi tiết trong một drawer. Page header có hai công cụ cho trường hợp này:

- **Mục breadcrumb bấm được không cần router**: đặt `navigable: true` cho mục đó (không có `link`). Mục hiện như link nhưng là `<button>`; bấm thì `nxt-page-header` (hoặc `nxt-breadcrumb`) phát `navigate` kèm chính mục đó, và bạn tự đổi màn hình.
- **`focusTitle()`**: đưa focus lên tiêu đề của màn hình mới. Tiêu đề có `tabindex="-1"`, nên Tab không dừng ở đó nhưng code đặt focus được.

::example{page-header-views}

```ts
private readonly header = viewChild(NxtPageHeader);

protected show(p: Position) {
  this.open.set(p);
  // Gọi sau khi màn hình mới đã render.
  afterNextRender(() => this.header()?.focusTitle(), { injector: this.injector });
}
```

```html
<nxt-page-header [title]="p.name" [breadcrumb]="[{ label: 'Thiết lập' }, { label: 'Chức danh', navigable: true }, { label: p.name }]" (navigate)="back()" />
```

- Mở màn hình mới thì focus lên tiêu đề của nó: screen reader đọc "Kế toán trưởng, heading", và Tab tiếp theo đi từ đầu màn hình mới thay vì từ nút vừa biến mất.
- Quay lại danh sách thì đưa focus về **đúng mục vừa mở**, không về tiêu đề danh sách, để người dùng không mất chỗ.
- Có router thì dùng `link`: link mở được tab mới và gửi được cho người khác. `navigable` chỉ dành cho màn hình không có route.
- Vòng focus trên tiêu đề chỉ hiện khi người dùng đang dùng bàn phím, ôm sát chữ. Bấm chuột rồi chuyển màn hình thì không có vòng.

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> | Đi qua các link (và mục `navigable`) của breadcrumb, rồi các nút hành động. Tiêu đề không phải điểm dừng Tab |
| <kbd>Enter</kbd> | Mở link breadcrumb; với mục `navigable`, phát `navigate` |
| <kbd>Space</kbd> | Mục `navigable` (là nút): phát `navigate` |

- Tiêu đề là `h1`, nên **mỗi trang chỉ có một** page header với `headingLevel` mặc định. Các ví dụ trên trang này dùng `headingLevel="2"` vì trang docs đã có `h1`.
- Breadcrumb là landmark `navigation` chứa danh sách có thứ tự (`ol`). Tên mặc định là "Đường dẫn trang"; đặt `label` khi trang có nhiều breadcrumb. Page header hiện chưa cho đổi tên này.
- Dấu `›` giữa các mục là icon `aria-hidden`, screen reader không đọc.
- Link và nút của breadcrumb cao tối thiểu 24px (WCAG 2.5.8).
- Tiêu đề có `tabindex="-1"` để `focusTitle()` đặt focus được khi đổi màn hình không qua router (WCAG 2.4.3).

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Nhân viên | Quản lý danh sách nhân viên |
| Đơn nghỉ phép DNP-0412 | Chi tiết đơn |
| 1.284 hồ sơ đang làm việc · cập nhật 5 phút trước | Đây là trang quản lý nhân viên của công ty |

- Tiêu đề trùng tên mục trong sidenav, hoặc là tên của đối tượng đang xem.
- Slot hành động (`nxtPageActions`) dành cho **trang chi tiết** (Sửa, Gửi duyệt, Phê duyệt) và thao tác cấp trang không gắn với một danh sách; hành động phụ trước, `primary` ở cuối. Trang danh sách để trống slot này.
- Mô tả không quá một dòng. Hướng dẫn dài đặt trong nội dung trang.

## API

::api{page-header}

`NxtBreadcrumbItem`:

| Trường | Kiểu | Mô tả |
|--------|------|-------|
| `label` | `string` | Tên trang |
| `link` | `string` (tuỳ chọn) | Đường dẫn router. Bỏ qua ở mục cuối |
| `navigable` | `boolean` (tuỳ chọn) | Không có router: mục hiện như link, bấm thì phát `navigate` với mục này. Bỏ qua khi có `link` và ở mục cuối |

Method của `NxtPageHeader`:

| Method | Mô tả |
|--------|-------|
| `focusTitle(options?: FocusOptions)` | Đưa focus lên tiêu đề. Gọi trong `afterNextRender` sau khi đổi màn hình |

## Token

::tokens{component.page-header}

## Changelog

- **0.1.0**: phát hành beta: tiêu đề `h1`/`h2`, mô tả, slot trạng thái và hành động, nội dung phía dưới, breadcrumb với `aria-current="page"`.
- **Chưa phát hành**: mục breadcrumb `navigable` và output `navigate` (trên `nxt-breadcrumb` và `nxt-page-header`) cho màn hình đổi không qua router; tiêu đề `tabindex="-1"` và method `focusTitle()`; link breadcrumb cao tối thiểu 24px.

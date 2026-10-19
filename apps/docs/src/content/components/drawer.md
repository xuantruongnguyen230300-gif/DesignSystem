---
title: Drawer
description: Panel trượt ra từ cạnh cuối màn hình để xem nhanh chi tiết hoặc tạo, sửa một bản ghi mà không rời trang danh sách.
status: beta
group: Phản hồi & lớp phủ
order: 41
package: "@nxt/ui/drawer"
keywords:
  - ngan keo
  - drawer
  - panel ben
  - side panel
  - form them moi
  - xem nhanh
  - hop thoai
---

# Drawer

## Khi nào dùng

- Xem nhanh chi tiết một hàng trong bảng mà vẫn giữ vị trí cuộn, bộ lọc và lựa chọn của danh sách.
- Form tạo hoặc sửa một bản ghi có khoảng 4 đến 10 trường: "Thêm chức danh", "Thêm người phụ thuộc".
- Bộ lọc nâng cao có nhiều điều kiện.

## Khi nào không dùng

- **Xác nhận ngắn hoặc hành động phá huỷ** ("Xoá 3 nhân viên?"): dùng dialog xác nhận ở giữa màn hình.
- **Form dài, nhiều bước hoặc cần so sánh với trang phía sau**: dùng trang riêng có URL, để người dùng lưu nháp, chia sẻ link và dùng nút Back.
- **Điều hướng chính của ứng dụng**: dùng sidenav. App shell tự chuyển sidenav thành drawer ở màn hình hẹp.
- **Thông tin phụ không chặn thao tác**: hiện ngay trên trang. Drawer là modal: mọi thứ phía sau bị khoá cho tới khi đóng.

## Mở drawer

`NxtDrawer` là service. `open(component, config)` mở component của bạn trong một CDK Dialog và trả về `DialogRef`. Component nội dung lấy dữ liệu qua `DIALOG_DATA` và đóng bằng `DialogRef.close(kếtQuả)`. Đặt `<nxt-drawer-layout>` làm gốc của nội dung: nó dựng tiêu đề, mô tả, nút Đóng, phần thân cuộn được và chân cố định (slot `[nxtDrawerFooter]`).

```ts
const ref = this.drawer.open<Dependent, DependentFormData>(DependentForm, {
  title: 'Thêm người phụ thuộc', // tên accessible của dialog
  size: 'md',                    // sm | md (mặc định) | lg
  data: { employee: 'Đặng Anh', existingNames: this.items().map((d) => d.name) },
});
ref.closed.subscribe((saved) => {
  if (saved) this.items.update((list) => [...list, saved]); // undefined = người dùng huỷ
});
```

`title` trong config là tên accessible của dialog (`aria-label`). Đặt nó giống tiêu đề hiển thị của `nxt-drawer-layout`, hoặc cụ thể hơn: hiển thị "Sửa chức danh" thì config có thể là "Sửa chức danh Kế toán tổng hợp".

## Xem nhanh chi tiết

Nút mở drawer trên mỗi hàng ghi rõ đối tượng: chữ "Xem", tên accessible "Xem hồ sơ Lê Minh Anh". Khi đóng drawer, focus tự quay về đúng nút đó.

::example{drawer-detail}

## Form trả về giá trị

Form trong drawer chỉ kiểm tra khi bấm Lưu. Nếu còn lỗi: hiện lỗi tại từng trường, giữ drawer mở và đưa focus tới ô lỗi đầu tiên. Nếu hợp lệ: `ref.close(giáTrị)`, rồi trang gọi cập nhật danh sách và báo kết quả qua `role="status"`.

::example{drawer-form}

Hai chi tiết dễ sai:

- **Ứng dụng NXT chạy zoneless.** `aria-invalid` chỉ có sau lần render kế tiếp, nên muốn focus ô lỗi đầu tiên thì dùng `afterNextRender(() => …, { injector })`. Đừng dùng `queueMicrotask` hay `setTimeout`, vì lúc đó DOM có thể chưa cập nhật.
- **Nút Lưu nằm ở chân drawer, ngoài thẻ `<form>`.** Gắn `type="submit"` và `form="<id của form>"` cho nút, để cả Enter trong ô nhập lẫn nút Lưu đều đi qua `(submit)`.

Mặc định drawer focus vào phần tử đầu tiên tương tác được, tức là nút Đóng. Với form tạo mới, đặt `cdkFocusInitial` lên ô đầu tiên để người dùng gõ được ngay.

## Kích thước

| `size` | Bề rộng | Dùng cho |
|--------|---------|----------|
| `sm` | 400px | Xem nhanh, bộ lọc nâng cao |
| `md` (mặc định) | 560px | Form tạo và sửa thông thường |
| `lg` | 720px | Form 2 cột đầy đủ, bảng con, so sánh trước và sau |

Ở màn hình hẹp hơn bề rộng này, drawer chiếm toàn bộ bề ngang. Đặt nội dung trong `nxt-grid` để form tự về một cột.

::example{drawer-sizes}

## Chặn đóng khi đang lưu

`disableClose: true` chặn đóng bằng <kbd>Esc</kbd> và bằng click ra ngoài. Chỉ bật khi đóng drawer sẽ làm mất việc đang chạy, ví dụ trong lúc gửi dữ liệu. Có thể bật tạm thời từ component nội dung qua `ref.disableClose = true`, rồi tắt khi xong. Đừng bật cho cả vòng đời của một form chỉ để tránh mất dữ liệu đang nhập, vì người dùng sẽ không có cách thoát nhanh.

`disableClose` cũng khoá nút Đóng (X) của `nxt-drawer-layout`, nhưng không khoá các nút của bạn gọi `ref.close()`: trong lúc lưu, tự đặt nút Huỷ ở trạng thái `disabled`.

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Đi vòng trong drawer, không ra được trang phía sau (focus trap) |
| <kbd>Esc</kbd> | Đóng drawer, trừ khi `disableClose` |
| <kbd>Enter</kbd> trong ô nhập | Gửi form (khi nút Lưu có `type="submit"` và `form`) |
| Đóng bằng cách bất kỳ | Focus quay về phần tử đã mở drawer |

- Dựng trên CDK Dialog: `role="dialog"`, `aria-modal="true"`, tên lấy từ `title` của config. Trang phía sau bị khoá cho tới khi đóng.
- Tiêu đề trong `nxt-drawer-layout` là `h2`, nút Đóng là nút icon có `aria-label="Đóng"`.
- Khi drawer mở, focus vào phần tử đầu tiên tương tác được, hoặc vào phần tử có `cdkFocusInitial`.
- Hiệu ứng trượt dùng `motion.duration.slow`. Ở chế độ giảm chuyển động, drawer hiện ngay không trượt.
- Báo kết quả sau khi đóng (đã thêm, đã lưu) bằng vùng `role="status"` trên trang, vì drawer đã biến mất.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Thêm người phụ thuộc | Thêm mới |
| Sửa chức danh Kế toán tổng hợp | Chỉnh sửa |
| Lưu người phụ thuộc | OK |
| Huỷ | Thoát không lưu? |
| Mô tả: Trường có dấu * là bắt buộc. | Mô tả lặp lại tiêu đề |

## API

::api{drawer}

## Token

::tokens{component.drawer}

## Changelog

- **0.1.0**: phát hành beta: service `NxtDrawer` (CDK Dialog, 3 size, `data`, `disableClose`) và `nxt-drawer-layout` (tiêu đề, mô tả, nút Đóng, chân cố định).

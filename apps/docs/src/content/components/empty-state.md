---
title: Empty state
description: Thay cho vùng dữ liệu trống, giải thích vì sao chưa có gì để hiện và đưa ra bước tiếp theo.
status: beta
group: Phản hồi & lớp phủ
order: 42
package: "@nxt/ui/empty-state"
keywords:
  - trang thai rong
  - khong co du lieu
  - empty state
  - khong co ket qua
  - chua co du lieu
  - loi tai du lieu
  - khong co quyen
---

# Empty state

## Khi nào dùng

Khi một bảng, danh sách hay widget không có dữ liệu để hiện. Trước khi viết nội dung, xác định **vì sao** nó trống, vì mỗi lý do cần một thông điệp và một lối ra khác nhau:

| Lý do | Nói gì | Hành động |
|-------|--------|-----------|
| Lần đầu dùng: chưa có bản ghi nào | Danh mục này để làm gì | Tạo bản ghi đầu tiên, nhập từ Excel |
| Không có kết quả cho bộ lọc, từ khoá | Đang lọc theo gì | Xoá bộ lọc |
| Lỗi tải dữ liệu | Chuyện gì xảy ra, dữ liệu có mất không | Thử lại, liên hệ hỗ trợ kèm mã lỗi |
| Không có quyền | Ai được xem, vì sao | Gửi yêu cầu cấp quyền |
| Đã xử lý xong ("không còn đơn nào") | Một câu xác nhận | Thường không cần |

## Khi nào không dùng

- **Đang tải**: dùng skeleton hoặc trạng thái loading. Nếu hiện "Chưa có dữ liệu" trong lúc đang tải, người dùng sẽ nghĩ là không có gì.
- **Một ô trống trong bảng hay form**: ghi "—" hoặc "Chưa có", không dùng empty state.
- **Lỗi làm hỏng cả trang**: dùng trang lỗi. Empty state chỉ thay cho một vùng.
- **Lỗi khi nhập form**: dùng lỗi của form field.

## Lần đầu dùng

Nói ngắn danh mục này dùng để làm gì, sau đó đưa ra hành động chính. Có thể thêm một hành động phụ, ví dụ "Nhập từ Excel".

::example{empty-state-first-use}

## Không có kết quả

Nhắc lại người dùng đang lọc theo gì, gợi ý cách sửa, và luôn có nút **"Xoá bộ lọc"**. Khi bấm, nút này biến mất cùng empty state, vì vậy hãy đưa focus về ô tìm kiếm, nếu không focus sẽ rơi về đầu trang. Số kết quả được báo qua `role="status"`.

::example{empty-state-no-results}

Không dùng icon "Chưa có dữ liệu" hay nút "Tạo mới" ở trường hợp này: dữ liệu có, chỉ là bộ lọc đang loại hết.

## Lỗi và thiếu quyền

Nói rõ chuyện gì đã xảy ra, dữ liệu có bị mất không, và người dùng cần làm gì tiếp. Không đổ lỗi cho người dùng, không hiện mã lỗi trơn mà không có lời giải thích. Kết quả của "Thử lại" được báo qua `role="status"`.

::example{empty-state-error}

## Kích thước nhỏ

`size="sm"` giảm khoảng đệm cho widget dashboard, panel bên hoặc danh sách trong card. Nội dung cũng ngắn theo: một tiêu đề, có thể thêm một câu mô tả, thường không cần hành động.

::example{empty-state-small}

## Cấp tiêu đề

`title` là heading thật, mặc định `h2`. Chọn `headingLevel` theo dàn ý của trang:

| Vị trí | `headingLevel` |
|--------|----------------|
| Thay cho bảng chính, ngay dưới tiêu đề trang (`h1`) | `2` (mặc định) |
| Trong card có tiêu đề `h2`, hoặc trong section đã có `h2` | `3` |

`headingLevel` hiện chỉ nhận `2` hoặc `3`.

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> | Empty state không nhận focus. Tab đi tới các nút trong `[nxtEmptyActions]` |

- Icon minh hoạ là trang trí (`aria-hidden`). Mọi thông tin phải nằm trong tiêu đề và mô tả.
- Khi nội dung vùng thay đổi do thao tác của người dùng (lọc ra 0 kết quả, xoá bộ lọc), báo bằng một vùng `role="status"` luôn có sẵn trên trang. Không đặt `role="status"` lên chính empty state, vì nó chỉ được render sau khi trạng thái đổi.
- Nếu nút vừa bấm biến mất (như "Xoá bộ lọc"), chủ động đưa focus tới chỗ hợp lý (WCAG 2.4.3).
- Hành động bị chặn vì thiếu quyền thì giải thích trong mô tả, không chỉ hiện một nút disabled.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Chưa có ca làm việc nào | Không có dữ liệu |
| Không có nhân viên phù hợp | Không tìm thấy bản ghi |
| Không tìm thấy “Hoàng” trong Phòng Nhân sự. Thử từ khoá ngắn hơn hoặc xoá bộ lọc. | 0 kết quả |
| Máy chủ chấm công không phản hồi. Dữ liệu đã nhập không bị mất. | Đã xảy ra lỗi (500) |
| Bạn chưa có quyền xem bảng lương | Truy cập bị từ chối |
| Tạo ca làm việc | Tạo mới |

## API

::api{empty-state}

## Token

::tokens{component.empty-state}

## Changelog

- **0.1.0**: phát hành beta: tiêu đề, mô tả, icon minh hoạ (mặc định `inbox`), `headingLevel` 2 hoặc 3, 2 size, slot `[nxtEmptyActions]`.

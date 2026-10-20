---
title: Pagination
description: Chia danh sách dài thành trang — tóm tắt "Hiển thị 1–20 trong 1.284", số dòng mỗi trang, trang trước/sau và số trang.
status: beta
group: Điều hướng
order: 23
package: "@nxt/ui/pagination"
keywords:
  - pagination
  - phan trang
  - trang
  - so trang
  - so dong moi trang
  - trang truoc
  - trang sau
---

# Pagination

## Khi nào dùng

- Dưới bảng hoặc danh sách có thể dài hơn một trang: nhân viên, chức danh, phiếu lương.
- Khi người dùng cần biết tổng số bản ghi, và cần quay lại đúng một trang ("trang 3 có hồ sơ tôi đang tìm").

## Khi nào không dùng

- **Danh sách ngắn trong card** (5–10 dòng): hiện vài dòng mới nhất kèm link "Xem tất cả".
- **Dòng thời gian, thông báo**: dùng nút "Tải thêm". Người dùng đọc liên tục, không nhảy trang.
- **Tổng số bản ghi không vượt cỡ trang nhỏ nhất**: có thể ẩn pagination, vì không có gì để chuyển.

## Cấu tạo

Từ trái sang phải: tóm tắt ("Hiển thị **81–100** trong **1.284** nhân viên"), chọn số dòng mỗi trang, nút trang trước, các số trang, nút trang sau. Khi hẹp, phần điều khiển xuống dòng dưới tóm tắt.

::example{pagination-basic}

- `page` (bắt đầu từ 1) và `pageSize` là two-way. Đổi số dòng mỗi trang thì quay về trang 1.
- `itemLabel` là danh từ của bản ghi: "nhân viên", "chức danh", "phiếu". Mặc định "bản ghi".
- Số dùng định dạng tiếng Việt (`1.284`) và chữ số cùng bề rộng, nên tóm tắt không nhảy khi đổi trang.
- Khi `total` bằng 0, tóm tắt thành "Không có nhân viên".

## Ghép với bảng

Pagination không cắt dữ liệu: bạn tự lấy các dòng của trang hiện tại, hoặc gọi API với `page` và `pageSize`. Khi lọc hay tìm kiếm làm tổng giảm dưới trang hiện tại, pagination **tự lùi về trang cuối còn dữ liệu**, và cập nhật `page` của bạn.

::example{pagination-table}

Thử ở ví dụ trên: đang ở trang 10, chọn "Đang thử việc" thì chỉ còn 3 trang, và bảng hiện trang 3.

## Số trang và khoảng trống

Khi có hơn 7 trang, pagination luôn hiện **đúng 7 ô**: trang đầu, trang cuối, trang hiện tại với hai trang kề, và khoảng trống "…". Nhờ vậy nút "Trang sau" không đổi chỗ khi bấm liên tục. Khoảng trống không bao giờ thay cho đúng một trang: hiện "1 2 3 4 5 … 20", không hiện "1 … 3 4 5 … 20".

Hàm `nxtPageItems(page, count)` được export, dùng khi bạn dựng một bộ chuyển trang riêng.

::example{pagination-items}

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> | Đi qua: số dòng mỗi trang → trang trước → các số trang → trang sau |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Chuyển tới trang của nút |
| <kbd>↑</kbd> / <kbd>↓</kbd> trên ô số dòng | Đổi số dòng mỗi trang (select native) |

- Pagination là landmark `navigation`, tên mặc định "Phân trang". Đặt `label` riêng khi trang có nhiều pagination, ví dụ "Phân trang bảng nhân viên".
- Nút số trang có tên "Trang 5". Trang hiện tại có `aria-current="page"` và nền khác, không chỉ khác màu chữ.
- Nút trang trước/sau có tên "Trang trước", "Trang sau", và bị khoá ở trang đầu/cuối.
- Tóm tắt nằm trong vùng `aria-live="polite"`: đổi trang thì screen reader đọc "Hiển thị 21–40 trong 1.284 nhân viên".
- Ô số dòng mỗi trang là `<select>` native, có tên "Số dòng mỗi trang".
- Dấu "…" là `aria-hidden`.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Hiển thị 1–20 trong 1.284 nhân viên | 1–20 / 1284 |
| `itemLabel="phiếu lương"` | Giữ mặc định "bản ghi" khi đã biết loại dữ liệu |
| Cỡ trang 10 · 20 · 50 · 100 | Cỡ trang 7 · 13 · 25 |

## API

::api{pagination}

`nxtPageItems(page: number, count: number): (number | '…')[]`: danh sách ô cần hiện cho trang `page` trong `count` trang.

## Token

::tokens{component.pagination}

## Changelog

- **0.1.0**: phát hành beta: tóm tắt có `aria-live`, chọn số dòng mỗi trang, 7 ô cố định với khoảng trống, tự lùi trang khi tổng giảm, `nxtPageItems`.

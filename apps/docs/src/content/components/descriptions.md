---
title: Descriptions
description: Danh sách nhãn – giá trị chỉ đọc cho màn chi tiết và drawer xem nhanh; số cột tự co theo bề rộng.
status: beta
group: Hiển thị dữ liệu
order: 37
package: "@nxt/ui/descriptions"
keywords:
  - mo ta
  - chi tiet
  - nhan gia tri
  - thong tin
  - descriptions
  - description list
---

# Descriptions

## Khi nào dùng

- Xem chi tiết một bản ghi (chỉ đọc): hồ sơ nhân viên, chức danh, đơn phê duyệt.
- Drawer xem nhanh mở từ một dòng của bảng.
- Tóm tắt trước khi xác nhận một thao tác.

## Khi nào không dùng

- **Sửa dữ liệu**: dùng form với [Form field](/components/form-field).
- **So sánh nhiều bản ghi**: dùng [Table](/components/table).
- **Một số liệu cần nổi bật**: dùng `nxt-stat` trong [Card & Stat](/components/card).

## Cơ bản

Mặc định số cột tự co theo bề rộng của **chính danh sách** (không theo màn hình), nên cùng một khối hiển thị 3 cột trên trang rộng và 1 cột trong drawer hẹp. Mục dài (ghi chú, lý do, mô tả) thêm `full` để chiếm cả hàng.

::example{descriptions-basic}

## Số cột cố định

Đặt `columns` là 1, 2 hoặc 3 khi cần thẳng hàng với khối khác. Cặp từ – đến gộp thành một mục: "Thời gian: 20/10/2026 – 22/10/2026".

::example{descriptions-columns}

## Trong màn chi tiết

Drawer xem chi tiết của [mẫu Danh mục](/templates/catalog) dùng Descriptions cho phần "Thông tin": bấm một dòng của bảng để mở.

## Accessibility

- HTML gốc `dl` > `div` > `dt` + `dd`: screen reader đọc nhãn đi cùng giá trị. Selector gắn lên chính các phần tử đó (`dl[nxtDescriptions]`, `div[nxtDescription]`), nên cấu trúc luôn hợp lệ.
- Không có tương tác riêng; link, tag, nút đặt trong giá trị vẫn dùng được bằng bàn phím như bình thường.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Phòng ban | Phòng ban: |
| — (khi không có giá trị) | Để trống ô giá trị |
| Thời gian: 20/10/2026 – 22/10/2026 | Hai mục "Từ ngày" và "Đến ngày" khi chỉ xem |

## API

::api{descriptions}

## Token

::tokens{component.descriptions}

## Changelog

- **0.1.0**: phát hành beta: `dl[nxtDescriptions]` (cột tự co hoặc 1–3 cột), `div[nxtDescription]` (`label`, `full`).

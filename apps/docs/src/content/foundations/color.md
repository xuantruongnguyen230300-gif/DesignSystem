---
title: Màu sắc
description: Thang màu OKLCH, màu theo vai trò, màu trạng thái giá trị của trường nhập, màu chỉ thị để phân loại, và cam kết tương phản ở mọi chế độ.
order: 1
status: beta
keywords:
  - mau
  - color
  - palette
  - tuong phan
  - contrast
  - mau chi thi
  - indication
  - phan loai
  - trang thai gia tri
---

# Màu sắc

## Ba tầng màu

1. **Primitive**: thang 11 bước (50…950) cho mỗi hue. Đây là nơi duy nhất có giá trị màu thật.
2. **Semantic**: màu theo **vai trò**: `bg.surface`, `text.subtle`, `border.input`… Tầng này đổi giá trị khi chuyển sáng/tối.
3. **Component**: `button.primary.bg`… chỉ alias semantic.

Trong code giao diện chỉ dùng semantic hoặc component. Không dùng primitive và không viết cứng `#hex`.

## Thang màu primitive

Thang màu được sinh từ một màu gốc trong không gian **OKLCH** rồi gamut-map về sRGB. Vì độ sáng của mỗi bước được cố định theo cảm nhận, bước 600 của mọi hue có độ tương phản gần như nhau. Ví dụ, chữ trắng trên bất kỳ bước 600 nào cũng đạt khoảng 4,6–5,5:1.

::example{color-scales}

## Màu theo vai trò

Thử đổi màu của ví dụ sang **tối** hoặc đổi brand ở thanh trên cùng. Tỷ lệ tương phản ghi trên mỗi ô do validator tính lúc build.

::example{color-roles}

## Quy tắc dùng màu

- **Không truyền thông tin chỉ bằng màu.** Trạng thái luôn đi kèm icon hoặc chữ.
- **Màu trạng thái giữ nguyên ý nghĩa** ở mọi sản phẩm: đỏ là lỗi hoặc phá huỷ, xanh lá là thành công, hổ phách là cảnh báo, xanh dương là thông tin.
- **Màu dữ liệu** (`color.data.1…8`) chỉ dùng cho biểu đồ, không dùng cho trạng thái hay nhãn phân loại.
- **Màu chỉ thị** (`color.indication.1…8`) chỉ dùng để phân loại, không mang nghĩa trạng thái (xem [Màu chỉ thị](#mau-chi-thi)).
- **Chữ phụ** (`text.subtle`) vẫn đạt ≥ 4,5:1. Đừng làm nhạt thêm bằng `opacity`.
- **Nền trang khác bề mặt.** Ở chế độ sáng, `bg.canvas` là xám nhạt, card và bảng dùng `bg.surface` trắng kèm viền, nên vùng làm việc luôn tách khỏi nền. Chữ, link và vòng focus được kiểm tương phản trên **cả hai** nền (xem [Elevation](/foundations/elevation)).

## Trạng thái giá trị

Trường nhập có năm trạng thái giá trị, cộng với chỉ đọc (không mang trạng thái giá trị nào). Mỗi trạng thái có bộ viền, chữ và icon riêng; viền của năm trạng thái đạt ≥ 3:1 trên nền surface ở mọi mode. Viền chỉ đọc không cần 3:1 vì chữ giá trị mới là thông tin.

| Trạng thái | Viền control | Chữ thông điệp | Icon | Chặn lưu |
|------------|--------------|----------------|------|----------|
| Không | `border.input` | — | — | Không |
| Lỗi | `border.danger` | `text.danger` | `icon.danger` | Có |
| Cảnh báo | `border.warning` | `text.warning` | `icon.warning` | Không |
| Thông tin | `border.info` | `text.info` | `icon.info` | Không |
| Thành công | `border.success` | `text.success` | `icon.success` | Không |
| Chỉ đọc | `border.default`, không nền nhập | — | — | Không |

Trường hợp lệ **không** tô xanh: "thành công" chỉ dùng khi hệ thống vừa xác nhận một giá trị. Khi nào dùng trạng thái nào, kèm ví dụ HRM: [Trạng thái › Trạng thái giá trị](/foundations/states#trang-thai-gia-tri).

## Màu chỉ thị

Tám màu để **phân loại**: loại hợp đồng, nhóm ca làm việc, loại nghỉ phép, phòng ban, avatar chữ cái. Khác màu trạng thái (nghĩa cố định ở mọi nơi), nghĩa của màu chỉ thị **do sản phẩm gán**.

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|---|---|---|---|---|---|---|---|
| Xanh dương | Xanh mòng két | Tím | Hồng | Cam | Xanh lơ | Xanh lá | Xám |

Mỗi màu có ba token:

| Token | Dùng cho | Tương phản (validator kiểm ở sáng và tối) |
|-------|----------|-------------------------------------------|
| `indication.<n>.bg` | Nền nhạt của tag phân loại, avatar chữ cái | — |
| `indication.<n>.text` | Chữ trên nền `bg` của chính nó | ≥ 4,5:1 với `bg` |
| `indication.<n>.solid` | Chấm, viền, icon trên nền surface | ≥ 3:1 với `bg.surface` |

Luật dùng:

- **Nghĩa do sản phẩm gán và cố định.** Glossary của sản phẩm ghi màu nào cho loại nào (ví dụ HRM: hợp đồng chính thức = 1, thử việc = 3, thời vụ = 6), và một loại chỉ có một màu ở mọi màn hình.
- **Luôn kèm chữ.** Màu chỉ giúp lướt nhanh; nhãn chữ mới là thông tin (WCAG 1.4.1).
- **Không thay màu trạng thái.** "Đã duyệt", "Quá hạn", "Lỗi" dùng màu status. Tông 5 (cam) và 7 (xanh lá) gần màu cảnh báo và thành công: không đặt chúng cạnh tag trạng thái trong cùng một hàng hay một cột.
- **Không dùng cho biểu đồ.** Biểu đồ dùng `color.data.*`, thang được chọn để các series đặt cạnh nhau phân biệt được.
- **Quá tám loại thì không tô màu**, chỉ dùng chữ.
- Avatar chữ cái dùng tông 1–6, chọn theo tên; màu ở đây không mang nghĩa.
- Màu chỉ thị không đổi theo brand.

## Token nền

::tokens{semantic.color.bg}

## Token chữ

::tokens{semantic.color.text}

## Token viền và icon

::tokens{semantic.color.border}

::tokens{semantic.color.icon}

## Token màu chỉ thị

::tokens{semantic.color.indication}

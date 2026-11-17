---
title: Spacing & mật độ
description: Lưới 4px, ba mức mật độ đặt ở cấp ứng dụng theo sản phẩm và lựa chọn người dùng, mức Rộng cho cảm ứng, và vùng chạm tối thiểu ở mọi mật độ.
order: 3
status: beta
keywords:
  - khoang cach
  - spacing
  - density
  - mat do
  - compact
---

# Spacing & mật độ

## Lưới 4px

Mọi khoảng cách là bội số của 4px. Riêng 2px và 6px được dùng cho control dày đặc. Trong code, dùng token **theo vai trò**:

| Nhóm | Dùng cho |
|------|----------|
| `space.inset.*` | Padding bên trong control và container |
| `space.gap.*` | Khoảng cách giữa các phần tử cạnh nhau |
| `space.section.*` | Khoảng cách giữa các khối lớn của trang |

## Ba mức mật độ

Mật độ chỉ đổi **khoảng cách và chiều cao**, không đổi cỡ chữ.

::example{density-comparison}

| | Gọn | Vừa (mặc định) | Rộng |
|---|---|---|---|
| Control sm (vùng chạm nhỏ nhất) | 24px | 32px | 40px |
| Control md | 28px | 36px | 46px |
| Control lg | 32px | 40px | 54px |
| Hàng bảng md | 32px | 44px | 56px |

Vùng chạm nhỏ nhất vẫn đạt WCAG 2.5.8 (24×24px) ngay cả ở mức gọn.

## Chọn mật độ

**Đặt ở cấp ứng dụng.** Mật độ đặt một lần bằng `data-nxt-density` trên `<html>`, theo hai nguồn:

1. **Mặc định của sản phẩm**: sản phẩm dữ liệu dày, người dùng thao tác bằng chuột và bàn phím chọn Vừa hoặc Gọn; sản phẩm cần bố cục thoáng chọn Rộng. Không để mỗi màn hình tự chọn.
2. **Lựa chọn của người dùng**: một mục "Mật độ hiển thị: Gọn / Vừa / Rộng" (thường trong menu tài khoản), **lưu bền** theo người dùng, giữ qua các phiên làm việc. Lựa chọn này thắng mặc định của sản phẩm.

**Không trộn mật độ trong cùng một vùng làm việc.** Các control đứng cạnh nhau, thanh công cụ với bảng của nó, form với nút của form phải cùng một mức. Hai mức đặt cạnh nhau làm các control lệch chiều cao, lệch hàng, và người dùng phải đổi nhịp mắt liên tục.

> **Thay đổi luật (06/11/2026).** Trước đây trang này cho phép đặt mật độ riêng cho một vùng trong trang (ví dụ bảng rà soát ở mức Gọn trong trang mức Vừa). Từ nay không làm vậy nữa. `data-nxt-density` trên phần tử con vẫn hoạt động về kỹ thuật, nhưng chỉ dùng cho vùng **tách biệt hẳn** với phần còn lại: một màn hình riêng (màn rà soát toàn màn hình), bản xem trước trong docs, hay một cửa sổ in.

## Thiết bị cảm ứng

Ngón tay cần vùng chạm lớn hơn con trỏ chuột.

- Thiết bị có **thiết bị trỏ chính là ngón tay** (`@media (pointer: coarse)`: điện thoại, tablet) dùng mức **Rộng**, kể cả khi người dùng đã chọn Gọn trên máy tính.
- Thiết bị lai, trỏ chính là chuột nhưng có màn cảm ứng (`(any-pointer: coarse)`), giữ lựa chọn của người dùng và gợi ý mức Rộng.
- Vùng chạm trên cảm ứng tối thiểu **44×44px** (Apple HIG). Ở mức Rộng, control cỡ md (46px) và lg (54px) đạt, còn cỡ sm (40px) **dưới 44px**; ở mức Vừa không cỡ nào đạt (lớn nhất là 40px). Vì vậy component tự bù vùng chạm khi `@media (pointer: coarse)`, còn phần nhìn thấy giữ nguyên kích thước:
  - **Nút và nút icon, phân trang, segmented**: một `::after` trong suốt thuộc chính phần tử nới vùng bấm tới 44px (nút icon và ô số trang nới cả hai chiều; segmented và nút chỉ theo chiều khối). Bố cục không đổi.
  - **Checkbox, radio, switch**: hàng (nhãn bấm được) hoặc nút bọc rãnh cao tối thiểu 44px, nên nhịp hàng thoáng hơn trên cảm ứng; ô check, nút radio và rãnh switch vẫn giữ cỡ cũ.
  - **Tab**: tab cao tối thiểu 44px (thanh tab cắt phần tràn nên không dùng được `::after`). Ô chọn số dòng của phân trang (`select` native) cũng cao tối thiểu 44px.
  - Không có rule nào áp dụng cho `pointer: fine`: bố cục và vùng bấm trên máy tính không đổi.

Mỗi component có một component token `touch-target` (ví dụ `--nxt-button-touch-target`) cho giá trị này.

**Việc còn mở:** NXT chưa có token ngữ nghĩa cho vùng chạm tối thiểu (`semantic.size.touch-target`, 44px, không đổi theo mật độ). Tạm thời các token `touch-target` alias `size.row.md`: 44px ở mức Vừa, 56px ở mức Rộng (nới hơn cần thiết), và **32px ở mức Gọn, tức chưa đạt 44px**; vì vậy trên cảm ứng phải dùng mức Rộng như trên (tối thiểu là Vừa), không để mức Gọn. Khi có token ngữ nghĩa, chỉ cần đổi alias của các token `touch-target`. NXT cũng chưa có cơ chế tự chuyển sang mức Rộng trên thiết bị cảm ứng: hiện sản phẩm tự đặt `data-nxt-density="spacious"` khi `matchMedia('(pointer: coarse)')` khớp.

## Token khoảng cách

::tokens{semantic.space}

## Token kích thước

::tokens{semantic.size}

---
title: Theming cho sản phẩm
description: Brand slot, chế độ sáng/tối, mật độ, và cách chúng lồng nhau tới từng vùng màn hình.
order: 3
keywords:
  - theme
  - brand
  - dark mode
  - che do toi
  - mat do
  - density
---

# Theming cho sản phẩm

## Ba trục độc lập

| Trục | Mode | Đổi những gì |
|------|------|--------------|
| Màu | sáng · tối | Màu nền, chữ, viền, icon, độ nổi |
| Mật độ | vừa · gọn · rộng | Khoảng cách, chiều cao control và hàng bảng (cỡ chữ **không** đổi) |
| Chuyển động | đầy đủ · giảm | Thời lượng chuyển động |

Một token chỉ thuộc **một** trục. Validator chặn ngay khi token của trục này phụ thuộc vào token của trục khác, nhờ vậy mọi tổ hợp đều đúng.

## Lồng nhau tới từng phần tử

Ví dụ dưới là một vùng tối nằm trong trang sáng, bên trong lại có vùng brand khác ở mật độ gọn. Token tự tính lại ở mỗi cấp. Engine build sinh CSS khai báo lại mọi token phụ thuộc trong từng khối mode, nên alias như `--nxt-button-primary-bg` không bị "đóng băng" theo giá trị ở `:root`.

::example{theming-nested}

## Brand slot

Mỗi sản phẩm chỉ được override:

- thang màu `primitive.color.brand.*`, sinh bằng `npm run ds:palette`;
- nếu cần: `semantic.color.bg.primary*`, `text.on-primary`, `text.link`, `border.selected`, `focus.ring.color`;
- font chữ, chỉ khi font đó đủ glyph tiếng Việt.

Sản phẩm **không** được đổi màu trạng thái (lỗi, thành công, cảnh báo, thông tin), vì ý nghĩa của trạng thái phải giống nhau ở mọi sản phẩm. Brand cũng không được thêm token mới; validator sẽ chặn.

## Tạo brand mới

```bash
# 1. Sinh thang màu và xem bảng tương phản
npm run ds:palette -- --name brand --seed "#0F766E"

# 2. Ghi vào thư mục brand của sản phẩm
npm run ds:palette -- --name brand --seed "#0F766E" --out packages/tokens/src/brands/<san-pham>/brand.tokens.json

# 3. Kiểm tra: mọi cặp tương phản ở mọi mode
npm run ds:tokens
```

Brand `sample` (teal) trong repo là ví dụ đầy đủ. Đổi brand ở góc trên bên phải để xem toàn bộ tài liệu đổi theo.

## Tương phản được bảo đảm

`packages/tokens/tokens.config.json` liệt kê các cặp màu bắt buộc: chữ/nền, viền input, vòng focus, màu biểu đồ. Validator tính tỷ lệ tương phản WCAG cho **mọi** tổ hợp mode × brand. Hiện có **400 phép kiểm**, tất cả đều đạt.

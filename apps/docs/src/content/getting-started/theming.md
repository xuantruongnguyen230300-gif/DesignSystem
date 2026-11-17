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
  - primary
  - doi mau
  - mau chu dao
  - mau thuong hieu
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

Ví dụ dưới là một vùng tối nằm trong trang sáng, bên trong lại có vùng brand khác ở mật độ gọn. Token tự tính lại ở mỗi cấp. Đây là khả năng kỹ thuật (dùng cho docs, bản xem trước, vùng nhúng của sản phẩm khác); trong một ứng dụng, mật độ đặt ở cấp ứng dụng và **không trộn trong cùng một vùng làm việc** (xem [Spacing & mật độ](/foundations/spacing)). Engine build sinh CSS khai báo lại mọi token phụ thuộc trong từng khối mode, nên alias như `--nxt-button-primary-bg` không bị "đóng băng" theo giá trị ở `:root`.

::example{theming-nested}

## Đổi màu thương hiệu trong dự án của bạn

Dự án dùng NXT tự đặt màu chủ đạo, **không cần sửa repo NXT và không cần build lại**. Màu chủ đạo là thang 11 bậc `--nxt-color-brand-50 … 950`. Nút chính, link, mục được chọn, vòng focus, slider… đều lấy từ thang này, ở cả chế độ sáng và tối. Màu trạng thái (lỗi, thành công, cảnh báo, thông tin) **không đổi** theo sản phẩm.

### Cách 1: một dòng khi khởi động (khuyến nghị)

```ts
bootstrapApplication(App, {
  providers: [provideNxt({ primary: '#0f766e' })],
});
```

`primary` nhận hai dạng:

- **Một màu gốc** (`#rrggbb`, `rgb()` hoặc `oklch()`): NXT sinh thang 11 bậc từ màu đó. Màu gốc rơi đúng vào bậc gần nhất; **nút chính dùng bậc 600**, nên với màu gốc sáng (vàng, cam nhạt) nút sẽ đậm hơn màu đã nhập một chút, để chữ trắng trên nút luôn đạt 4,5:1.
- **Một thang đầy đủ** do designer làm: `primary: { 50: '…', 100: '…', … 950: '…' }`.

Đổi lúc chạy (người dùng chọn màu trong phần cài đặt, nhiều khách hàng dùng chung một bản build…) bằng `NxtTheme`:

```ts
const theme = inject(NxtTheme);
theme.setPrimary('#e11d48');   // trả về false và giữ màu cũ nếu màu không đọc được
theme.resetPrimary();          // về màu của stylesheet
```

::example{theming-primary}

Giá trị được ghi vào `<html>` bằng CSSOM (`style.setProperty`) chứ không chèn thẻ `<style>`, nên chạy được cả khi dự án bật Content-Security-Policy nghiêm.

### Cách 2: CSS tĩnh bằng lệnh

Khi không muốn tính lúc chạy, sinh sẵn CSS bằng lệnh đi kèm gói `@nxt/tokens`:

```bash
npx nxt-palette "#0f766e" > brand.css
```

`brand.css` là một khối `:root { --nxt-color-brand-50: …; … }`. Nạp nó **sau** `core.css`. Lệnh in kết quả kiểm tương phản ra stderr (`--json` in thang dưới dạng JSON).

### Cách 3: file brand trong repo NXT

Dùng khi sản phẩm nằm trong repo NXT, hoặc một vùng con của ứng dụng phải có màu khác với phần còn lại. Xem hai mục "Brand slot" và "Tạo brand mới" bên dưới.

### Tương phản được bảo đảm

Thang sinh ra có cùng độ sáng ở mỗi bậc, nên với **mọi** màu gốc, chữ trắng trên nút (bậc 600, hover 700, nhấn 800), link (bậc 700) và link ở chế độ tối (bậc 400) đều đạt 4,5:1. Unit test quét hơn 1000 màu gốc để chứng minh điều này. Thang tự làm không được bảo đảm: NXT kiểm cùng các vai trò đó và `console.warn` ở chế độ dev khi có cặp không đạt (vẫn áp dụng thang).

### Phạm vi

Cách 1 và 2 đổi màu cho **cả ứng dụng** (gốc `<html>`). Ghi đè thang màu trên một phần tử con không đủ: nút trong vùng đó vẫn giữ màu cũ, vì các token phụ thuộc đã được tính ở `<html>`. Vùng con khác màu phải dùng brand (cách 3). Nếu đặt cả `brand` và `primary` thì `primary` thắng.

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

`packages/tokens/tokens.config.json` liệt kê các cặp màu bắt buộc: chữ/nền, viền input, vòng focus, màu biểu đồ. Validator tính tỷ lệ tương phản WCAG cho **mọi** tổ hợp mode × brand. Số phép kiểm hiện tại in ra ở dòng `Contrast:` của `npm run ds:tokens`; CI chặn khi có phép kiểm không đạt.

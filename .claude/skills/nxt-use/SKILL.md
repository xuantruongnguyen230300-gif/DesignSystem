---
name: nxt-use
description: Hướng dẫn dùng NXT Design đúng cách khi dựng màn hình trong repo SẢN PHẨM (Angular) — cài đặt, bật brand/mode/density, chọn component và pattern phù hợp, không hard-code style, đủ trạng thái và nội dung tiếng Việt. Dùng khi user nói 'dùng design system', 'dựng màn hình bằng NXT', 'dùng component nào', 'cài @nxt/ui', 'theme sản phẩm trong app', 'làm trang danh sách/form bằng NXT', hoặc khi code UI trong repo có dependency @nxt/ui. Skill này được đóng gói kèm @nxt/ui cho các repo sản phẩm.
argument-hint: "[màn hình cần dựng]"
---

# nxt-use: dựng màn hình sản phẩm bằng NXT

## 1. Thiết lập (một lần cho mỗi app)
```ts
// app.config.ts: không cần provider riêng cho style; chỉ cần import CSS và đặt attribute.
```
```css
/* styles.css */
@import '@nxt/tokens/css/nxt.css';            /* :root + mọi mode */
@import '@nxt/tokens/css/brands/<product>.css';
@import '@nxt/ui/styles/nxt.css';              /* @layer order, reset, base */
```
```html
<html lang="vi" data-nxt-brand="<product>" data-nxt-color="light" data-nxt-density="comfortable">
```
- `data-nxt-color="dark"` bật dark mode. Bỏ attribute thì hệ thống theo `prefers-color-scheme` nếu app bật chế độ auto.
- Density có thể đặt riêng từng vùng, ví dụ `<section data-nxt-density="compact">` cho bảng rà soát.

## 2. Chọn đúng thứ cần dùng
Theo thứ tự ưu tiên:
1. **Pattern có sẵn** (list page, form, master-detail…). Xem catalog `/patterns` trên docs, hoặc `llms.txt` của docs.
2. **Component** `@nxt/ui/<name>`. Bảng "cần gì → dùng gì": [references/component-picker.md](references/component-picker.md).
3. Thiếu thứ cần dùng thì **mở yêu cầu cho team NXT**. Không tự viết component trùng vai trò trong repo sản phẩm.

Import theo entry point: `import { NxtButton } from '@nxt/ui/button';`. Không import từ đường dẫn nội bộ.

## 3. Luật trong repo sản phẩm
- **Không hard-code màu, px, font, z-index.** Dùng `var(--nxt-…)` semantic token. Có thể chép `tools/lint/check-hardcoded.mjs` của NXT vào CI của sản phẩm.
- Muốn đổi giao diện một component thì override **component token** ở phạm vi cha, ví dụ `.approval-bar { --nxt-button-bg: var(--nxt-color-bg-danger); }`. Không override class nội bộ và không dùng `::ng-deep`.
- Không đổi màu status (danger/success/warning/info) để "hợp brand".
- Mỗi vùng chỉ có một nút primary.
- Đủ trạng thái: loading (skeleton), empty, error, no-permission, theo catalog pattern §9.
- Nội dung theo giọng văn NXT: động từ + đối tượng ("Lưu hợp đồng"); lỗi nói cách sửa.
- Ngày, tiền, số định dạng bằng pipe hoặc formatter `vi-VN` của NXT, không tự format.

## 4. Kiểm tra trước khi tạo PR
- [ ] Không còn literal màu/px trong file style của màn hình mới.
- [ ] Thử dark mode và density compact.
- [ ] Đi hết luồng chính chỉ bằng bàn phím; focus luôn nhìn thấy.
- [ ] Thử với dữ liệu khó: tên dài, rỗng, 0 dòng, nhiều dòng.
- [ ] Test của màn hình dùng harness `@nxt/ui/<name>/testing` thay vì query CSS class nội bộ.

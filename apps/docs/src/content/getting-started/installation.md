---
title: Cài đặt
description: Thêm NXT vào một ứng dụng Angular 21 trong ba bước.
order: 2
keywords:
  - cai dat
  - install
  - npm
  - setup
---

# Cài đặt

## 1. Cài gói

NXT phát hành công khai (giấy phép MIT) trên **GitHub Packages** của tài khoản `xuantruongnguyen230300-gif`, nên tên gói thật có scope là tên tài khoản. GitHub Packages bắt đăng nhập kể cả khi đọc gói công khai, vì vậy cần một token đọc, tạo một lần.

**Bước 1.** Tạo [Personal access token (classic)](https://github.com/settings/tokens) với quyền `read:packages`, đặt vào biến môi trường `GITHUB_TOKEN` (không commit token).

**Bước 2.** Trỏ scope về GitHub Packages trong `.npmrc` của project dùng NXT:

```ini
# .npmrc
@xuantruongnguyen230300-gif:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**Bước 3.** Cài **bằng alias**, để trong code vẫn viết `@nxt/...` như mọi ví dụ của docs này:

```bash
npm install @nxt/ui@npm:@xuantruongnguyen230300-gif/ui @nxt/tokens@npm:@xuantruongnguyen230300-gif/tokens @angular/cdk
```

`package.json` của project sẽ có dòng dạng `"@nxt/ui": "npm:@xuantruongnguyen230300-gif/ui@^0.1.0"`. Alias là bắt buộc: các file bên trong `@nxt/ui` tự import nhau bằng `@nxt/ui/...`, nên thư mục trong `node_modules` phải tên `@nxt`, và alias làm đúng việc đó.

Đường cài này đã được kiểm bằng npm thật: `npm run consumer:smoke:registry` đóng gói như workflow phát hành, phục vụ qua một registry cục bộ, chạy đúng lệnh ở trên, build một app Angular với gói đã cài rồi chạy trong trình duyệt (cả axe). pnpm và yarn hỗ trợ cú pháp `npm:` tương tự nhưng chưa thử.

NXT yêu cầu Angular `>=21 <23` và Node ≥ 20.19. Mỗi phiên bản được ghi trong [CHANGELOG](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/CHANGELOG.md).

## 2. Nạp style

Thứ tự nạp quan trọng: token lõi, rồi (nếu có) brand của sản phẩm, rồi style nền của NXT, cuối cùng là CSS của ứng dụng.

```css
/* src/styles.css */
@import '@nxt/tokens/css/core.css';
@import '@nxt/tokens/css/brands/<san-pham>.css'; /* chỉ khi sản phẩm có brand riêng trong repo NXT */
@import '@nxt/ui/styles/nxt.css';
```

`core.css` (khoảng 4 KB nén) chỉ chứa token dùng chung. **Token riêng của từng component đi kèm chính component đó**: import `@nxt/ui/button` thì mới nạp token của nút, nên app không phải trả giá cho calendar, table, combobox… khi không dùng. Muốn nạp tất cả một lần (prototype, trang thử), dùng `@nxt/tokens/css/nxt.css` thay cho `core.css`.

`@nxt/ui/styles/nxt.css` khai báo thứ tự cascade layer: `nxt.reset, nxt.base, nxt.components, nxt.patterns, nxt.utilities`. CSS của ứng dụng viết ngoài các layer này **luôn thắng**, nên không cần `!important`.

Brand đặt ở gốc tài liệu (`<html>`). Vùng con đổi chế độ sáng/tối, mật độ, chuyển động vẫn đúng; riêng vùng con đổi **brand** cần nạp `nxt.css` đầy đủ.

## 3. Đặt chế độ hiển thị

Cách ngắn nhất: một dòng cấu hình khi khởi động ứng dụng. Mọi tuỳ chọn đều không bắt buộc, `provideNxt()` không tham số vẫn chạy được.

```ts
import { provideNxt } from '@nxt/ui';

bootstrapApplication(App, {
  providers: [
    provideNxt({
      primary: '#0f766e', // màu thương hiệu của dự án; bỏ trống để dùng xanh mặc định của NXT
      color: 'auto',
      density: 'comfortable',
    }),
  ],
});
```

`primary` là cách đổi màu thương hiệu mà **không cần brand riêng** và không cần build lại. Xem [Đổi màu thương hiệu](/getting-started/theming). Sản phẩm có brand riêng trong repo NXT thì dùng `brand: '<san-pham>'` thay cho `primary`.

Hoặc đặt trực tiếp thuộc tính trên `<html>`:

```html
<html lang="vi" data-nxt-brand="<san-pham>" data-nxt-color="light" data-nxt-density="comfortable">
```

| Thuộc tính | Giá trị | Ghi chú |
|-----------|---------|---------|
| `data-nxt-color` | `light` · `dark` · `auto` | `auto` theo cài đặt của hệ điều hành |
| `data-nxt-density` | `comfortable` · `compact` · `spacious` | Đặt riêng được cho từng vùng |
| `data-nxt-brand` | slug sản phẩm | Bỏ trống để dùng brand NXT |
| `data-nxt-motion` | `full` · `reduced` | Bỏ trống để theo `prefers-reduced-motion` |

Mọi thuộc tính đều dùng được trên **bất kỳ phần tử nào**, không chỉ `<html>`. Xem [Theming cho sản phẩm](/getting-started/theming).

## 4. Dùng component

```ts
import { NxtButton } from '@nxt/ui/button';
import { NxtStack, NxtInline, NxtGrid, NxtSpan } from '@nxt/ui/layout';

@Component({
  imports: [NxtButton, NxtStack],
  template: `
    <nxt-stack>
      <button nxtButton variant="primary">Lưu hồ sơ</button>
    </nxt-stack>
  `,
})
export class ProfileFooter {}
```

## Kiểm tra trong CI của sản phẩm

Chép `tools/lint/check-hardcoded.mjs` của NXT vào repo sản phẩm và chạy nó trong CI. Script chặn màu viết cứng (`#fff`, `rgb()`) và cảnh báo px, z-index, font-family không đi qua token.

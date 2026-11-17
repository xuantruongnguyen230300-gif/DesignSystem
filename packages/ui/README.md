# @nxt/ui

Component Angular 21 của NXT Design: standalone, signals, OnPush, hành vi headless từ Angular CDK. Style chỉ dùng token `--nxt-*`. Mỗi component là một entry point (`@nxt/ui/button`, `@nxt/ui/table`…), nên ứng dụng chỉ trả giá cho phần nó import. Giấy phép MIT.

## Cài đặt

Gói nằm trên GitHub Packages. GitHub bắt đăng nhập kể cả khi đọc gói công khai, nên cần một token đọc, tạo một lần.

**1. Token.** Tạo [Personal access token (classic)](https://github.com/settings/tokens) với quyền `read:packages` và đặt vào biến môi trường `GITHUB_TOKEN` (không commit token).

**2. `.npmrc`** của project dùng NXT:

```ini
@xuantruongnguyen230300-gif:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**3. Cài bằng alias.** Đừng chạy lệnh `npm install @xuantruongnguyen230300-gif/ui` mà trang gói gợi ý: các file bên trong gói tự import nhau bằng `@nxt/ui/...`, nên thư mục trong `node_modules` phải tên `@nxt`, và alias làm đúng việc đó.

```bash
npm install @nxt/ui@npm:@xuantruongnguyen230300-gif/ui @nxt/tokens@npm:@xuantruongnguyen230300-gif/tokens @angular/cdk
```

**4. Nạp style rồi dùng.** Yêu cầu Angular `>=21 <23`.

```css
/* src/styles.css */
@import '@nxt/tokens/css/core.css';
@import '@nxt/ui/styles/nxt.css';
```

```ts
import { NxtButton } from '@nxt/ui/button';
import { NxtStack } from '@nxt/ui/layout';

@Component({
  imports: [NxtButton, NxtStack],
  template: `<nxt-stack><button nxtButton variant="primary">Lưu hồ sơ</button></nxt-stack>`,
})
export class Demo {}
```

Tuỳ chọn một dòng khi khởi động (chế độ sáng/tối, mật độ, màu thương hiệu): `provideNxt({ color: 'auto', density: 'compact', primary: '#0f766e' })` từ `@nxt/ui`.

## Đổi màu thương hiệu

Không cần build lại: `provideNxt({ primary: '#0f766e' })`, đổi lúc chạy bằng `inject(NxtTheme).setPrimary('#e11d48')`, hoặc CSS tĩnh bằng `npx nxt-palette "#0f766e" > brand.css`. Mọi màu gốc đều cho thang đạt WCAG 2.2 AA. Chi tiết: [ADR-015](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/v0.1.1/docs/adr/015-consumer-theming.md).

## Tài liệu

- [Trang Cài đặt và Theming](https://github.com/xuantruongnguyen230300-gif/DesignSystem/tree/v0.1.1/apps/docs/src/content/getting-started) (docs chạy bằng `npm start` trong repo)
- [Quy ước component](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/v0.1.1/docs/design/component-conventions.md); mỗi component có `SPEC.md` trong thư mục của nó, là nguồn sự thật về hành vi
- Giấy phép MIT; `NOTICE` ghi giấy phép của Tabler Icons (dữ liệu icon)

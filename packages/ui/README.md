# @nxt/ui

Component Angular 21 của NXT Design: standalone, signals, OnPush, hành vi headless từ Angular CDK. Style chỉ dùng token `--nxt-*`. Mỗi component là một entry point (`@nxt/ui/button`, `@nxt/ui/table`…), nên ứng dụng chỉ trả giá cho phần nó import. Giấy phép MIT.

## Cài vào dự án Angular của bạn

Yêu cầu: Angular `>=21 <23`, Node ≥ 20.19, npm. Gói nằm trên GitHub Packages; GitHub bắt đăng nhập kể cả khi đọc gói công khai, nên cần một token đọc, tạo một lần.

**1. Tạo token.** Vào [Personal access token (classic)](https://github.com/settings/tokens), tạo token với quyền `read:packages` và chép giá trị đó.

**2. Đặt token vào biến môi trường `GITHUB_TOKEN`** (không ghi token vào file nào của project):

```bash
# macOS / Linux (thêm vào ~/.bashrc hoặc ~/.zshrc để giữ lâu dài)
export GITHUB_TOKEN=<token>
```

```powershell
# Windows PowerShell: chỉ phiên hiện tại
$env:GITHUB_TOKEN = "<token>"
# Windows: giữ lâu dài (mở terminal mới sau khi chạy)
setx GITHUB_TOKEN "<token>"
```

**3. Tạo file `.npmrc`** ở thư mục gốc project (cạnh `package.json`). File này không chứa token nên commit được:

```ini
@xuantruongnguyen230300-gif:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**4. Cài bằng alias.** Đừng chạy lệnh `npm install @xuantruongnguyen230300-gif/ui` mà trang gói gợi ý: các file bên trong gói tự import nhau bằng `@nxt/ui/...`, nên thư mục trong `node_modules` phải tên `@nxt`, và alias làm đúng việc đó.

```bash
npm install @nxt/ui@npm:@xuantruongnguyen230300-gif/ui @nxt/tokens@npm:@xuantruongnguyen230300-gif/tokens @angular/cdk
```

`package.json` sẽ có `"@nxt/ui": "npm:@xuantruongnguyen230300-gif/ui@^…"`; trong code vẫn viết `@nxt/...`.

**5. Nạp style** trong `src/styles.css`:

```css
@import '@nxt/tokens/css/core.css';
@import '@nxt/ui/styles/nxt.css';
```

**6. Bật cấu hình** trong `src/app/app.config.ts`. Bước này không bắt buộc, nhưng là nơi đặt chế độ sáng/tối, mật độ và màu thương hiệu:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideNxt } from '@nxt/ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideNxt({
      color: 'auto',            // 'light' | 'dark' | 'auto' (theo hệ điều hành)
      density: 'comfortable',   // 'comfortable' | 'compact' | 'spacious'
      // primary: '#0f766e',    // màu thương hiệu của bạn (xem mục "Đổi màu thương hiệu")
    }),
  ],
};
```

**7. Dùng component.**

```ts
import { Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtStack } from '@nxt/ui/layout';

@Component({
  selector: 'app-demo',
  imports: [NxtButton, NxtStack],
  template: `<nxt-stack><button nxtButton variant="primary">Lưu hồ sơ</button></nxt-stack>`,
})
export class Demo {}
```

### Cập nhật phiên bản

```bash
npm update @nxt/ui @nxt/tokens
```

Các thay đổi nằm ở [CHANGELOG](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/v0.1.2/CHANGELOG.md).

### CI của project dùng NXT

`npm ci` cần cùng hai thứ: file `.npmrc` ở trên và biến `GITHUB_TOKEN`. Lưu một token có quyền `read:packages` thành secret của CI rồi truyền vào biến đó (ví dụ GitHub Actions: `env: GITHUB_TOKEN: ${{ secrets.NXT_READ_TOKEN }}`).

### Lỗi thường gặp

| Triệu chứng | Nguyên nhân thường gặp | Cách sửa |
|-------------|------------------------|----------|
| `E401` hoặc `E403` khi cài | Token thiếu, hết hạn hoặc không có quyền `read:packages` | Tạo lại token (classic) với quyền đó |
| `E404` với `@xuantruongnguyen230300-gif/ui` | `.npmrc` thiếu dòng `registry`, hoặc `.npmrc` không nằm ở thư mục gốc project | Kiểm tra bước 3 |
| `Failed to replace env in config: ${GITHUB_TOKEN}` | Biến `GITHUB_TOKEN` chưa được đặt trong terminal đang chạy | Làm lại bước 2 và mở terminal mới |
| Build báo `Could not resolve "@nxt/ui/…"` | Đã cài thẳng theo tên scope, không qua alias | Gỡ gói đó (`npm uninstall @xuantruongnguyen230300-gif/ui @xuantruongnguyen230300-gif/tokens`) rồi cài lại bằng bước 4 |
| Cảnh báo thiếu peer `@angular/cdk` | Chưa cài CDK | `npm install @angular/cdk` |

## Đổi màu thương hiệu

Không cần build lại: `provideNxt({ primary: '#0f766e' })`, đổi lúc chạy bằng `inject(NxtTheme).setPrimary('#e11d48')`, hoặc CSS tĩnh bằng `npx nxt-palette "#0f766e" > brand.css`. Mọi màu gốc đều cho thang đạt WCAG 2.2 AA. Chi tiết: [ADR-015](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/v0.1.2/docs/adr/015-consumer-theming.md).

## Tài liệu

- [Trang Cài đặt và Theming](https://github.com/xuantruongnguyen230300-gif/DesignSystem/tree/v0.1.2/apps/docs/src/content/getting-started) (docs chạy bằng `npm start` trong repo)
- [Quy ước component](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/v0.1.2/docs/design/component-conventions.md); mỗi component có `SPEC.md` trong thư mục của nó, là nguồn sự thật về hành vi
- Giấy phép MIT; `NOTICE` ghi giấy phép của Tabler Icons (dữ liệu icon)

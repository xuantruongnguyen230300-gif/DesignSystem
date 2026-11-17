# NXT Design

NXT Design là design system đa sản phẩm cho phần mềm nghiệp vụ, xây trên Angular 21, Angular CDK (headless) và token W3C DTCG. Giao diện mặc định theo Apple HIG, sáng/tối, ba mức mật độ, hơn 40 component, đổi màu thương hiệu không cần build lại. Giấy phép MIT.

## Dùng NXT trong dự án của bạn

Gói phát hành công khai trên GitHub Packages (`@xuantruongnguyen230300-gif/ui` và `/tokens`). GitHub bắt đăng nhập kể cả khi đọc gói công khai, nên cần một token đọc (`read:packages`) trong `.npmrc`, và phải cài **bằng alias** để code vẫn viết `@nxt/...`:

```bash
npm install @nxt/ui@npm:@xuantruongnguyen230300-gif/ui @nxt/tokens@npm:@xuantruongnguyen230300-gif/tokens @angular/cdk
```

Các bước đầy đủ (token, `.npmrc`, nạp style, ví dụ đầu tiên, đổi màu thương hiệu): [packages/ui/README.md](packages/ui/README.md).

## Phát triển repo này

Yêu cầu: Node ≥ 20.19 và **npm ≥ 11** (`npm i -g npm@11`; npm 10.8 lỗi khi cài, xem [ADR-009](docs/adr/009-workspace.md)).

```bash
npm install
npm start             # docs tại http://localhost:4200 (token + dữ liệu docs tự sinh lại)
```

| Lệnh | Việc |
|------|------|
| `npm run build` | Token → dữ liệu docs → `@nxt/ui` → docs |
| `npm test` | Unit test (Vitest) |
| `npm run test:a11y` | axe + bàn phím trên mọi example và trang docs (Playwright, chạy sau `build`) |
| `npm run ds:check` | Kiểm token (tier, mode, brand, tương phản) và giá trị hard-code |
| `npm run consumer:smoke:registry` | Cài gói bằng `npm install` thật (alias) từ một registry cục bộ, build và chạy một app Angular |
| `GITHUB_TOKEN=<read:packages> npm run consumer:smoke:published` | Cùng việc đó nhưng cài từ GitHub Packages thật (phiên bản mới nhất hoặc `NXT_VERSION=…`), không cần build |
| `npm run release:check` | Phiên bản hai gói, `NXT_UI_VERSION`, peer và CHANGELOG cùng khớp |

Phát hành: tăng phiên bản, cập nhật [CHANGELOG](CHANGELOG.md), đẩy thẻ `v<phiên bản>`; workflow `publish.yml` kiểm tra rồi phát hành (xem [ADR-006](docs/adr/006-npm-scope.md)).

## Có gì trong repo

| Gói | Nội dung |
|-----|----------|
| [`@nxt/tokens`](packages/tokens) | Hơn 900 token DTCG: thang màu OKLCH sinh từ seed, sáng/tối, 3 mức mật độ, motion, brand theo sản phẩm; lệnh `nxt-palette` sinh thang màu thương hiệu |
| [`@nxt/ui`](packages/ui) | Hơn 40 component (nút, form, bảng, lịch, hộp thoại, điều hướng, khuôn trang…), layout primitives, `provideNxt()` và `NxtTheme` |
| [`apps/docs`](apps/docs) | Docs tiếng Việt: ví dụ chạy thật, bảng API và token sinh từ source, tìm kiếm <kbd>Ctrl K</kbd> không dấu, `llms.txt` |

## Tài liệu

- [Kế hoạch & trạng thái](docs/PLAN.md) · [Nhật ký thay đổi](CHANGELOG.md)
- [Nguyên tắc thiết kế](docs/design/principles.md) · [Kiến trúc token](docs/design/token-architecture.md) · [Quy ước component](docs/design/component-conventions.md)
- [ADR](docs/adr/README.md)
- [Hướng dẫn cho AI agent và bộ skill](CLAUDE.md)

# NXT Design

[![CI](https://github.com/xuantruongnguyen230300-gif/DesignSystem/actions/workflows/ci.yml/badge.svg)](https://github.com/xuantruongnguyen230300-gif/DesignSystem/actions/workflows/ci.yml)
[![Verify published](https://github.com/xuantruongnguyen230300-gif/DesignSystem/actions/workflows/verify-published.yml/badge.svg)](https://github.com/xuantruongnguyen230300-gif/DesignSystem/actions/workflows/verify-published.yml)

NXT Design là design system đa sản phẩm cho phần mềm nghiệp vụ dữ liệu dày, xây trên Angular 21, Angular CDK (headless) và token W3C DTCG. Tiếng Việt là ngôn ngữ chính. Giấy phép MIT.

- **40 entry point component**: nút, form, bảng, lịch, hộp thoại, điều hướng, khung trang… Mỗi component chỉ nạp phần của nó.
- **Giao diện theo Apple HIG**, chế độ sáng/tối, ba mức mật độ.
- **Đổi màu thương hiệu không cần build lại**: một dòng `provideNxt({ primary: '#0f766e' })`; mọi màu gốc đều cho thang đạt WCAG 2.2 AA.
- **Khả năng tiếp cận là điều kiện tối thiểu**: WCAG 2.2 AA, bàn phím theo WAI-ARIA APG, axe chạy trên mọi ví dụ ở sáng/tối/gọn trong CI.

## Dùng NXT trong dự án của bạn

Gói phát hành công khai trên GitHub Packages (`@xuantruongnguyen230300-gif/ui` và `/tokens`). GitHub bắt đăng nhập kể cả khi đọc gói công khai, nên cần một token đọc (`read:packages`) trong `.npmrc`, và phải cài **bằng alias** để code vẫn viết `@nxt/...`:

```bash
npm install @nxt/ui@npm:@xuantruongnguyen230300-gif/ui @nxt/tokens@npm:@xuantruongnguyen230300-gif/tokens @angular/cdk
```

```css
/* src/styles.css */
@import '@nxt/tokens/css/core.css';
@import '@nxt/ui/styles/nxt.css';
```

**Hướng dẫn đầy đủ** (tạo token, biến môi trường cho bash và PowerShell, `.npmrc`, ví dụ đầu tiên chạy được, cấu hình, đổi màu, dùng token trong CSS, danh mục 40 component, lỗi thường gặp): [packages/ui/README.md](packages/ui/README.md).

## Tài liệu

Thư viện chưa có trang web docs công khai. Tài liệu nằm ở:

| Cần gì | Ở đâu |
|--------|-------|
| Cài đặt, bắt đầu nhanh, danh mục component, lỗi thường gặp | [packages/ui/README.md](packages/ui/README.md) |
| Mục đích, API, bàn phím, token, tiêu chí nghiệm thu của **một component** | `packages/ui/<tên>/SPEC.md` (liên kết từ danh mục component) |
| Token và đổi màu | [packages/tokens/README.md](packages/tokens/README.md) · [ADR-015](docs/adr/015-consumer-theming.md) |
| Ví dụ chạy thật, bảng API và token sinh từ source, tìm kiếm <kbd>Ctrl K</kbd> không dấu, `llms.txt` | Trang docs của repo: `npm install && npm start`, mở http://localhost:4200 |
| Vì sao thiết kế như vậy | [ADR](docs/adr/README.md) · [Nguyên tắc thiết kế](docs/design/principles.md) · [Kiến trúc token](docs/design/token-architecture.md) · [Quy ước component](docs/design/component-conventions.md) |
| Đang làm gì, đã kiểm gì, chưa kiểm gì | [Kế hoạch & trạng thái](docs/PLAN.md) · [Nhật ký thay đổi](CHANGELOG.md) |

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
| `npm run ds:check` | Kiểm token (tier, mode, brand, tương phản), giá trị hard-code và danh mục component trong README |
| `npm run readme:catalog` | Sinh lại danh mục component trong `packages/ui/README.md` (sau khi thêm hay bỏ component) |
| `npm run consumer:smoke:registry` | Cài gói bằng `npm install` thật (alias) từ một registry cục bộ, build và chạy một app Angular (gồm cả đoạn "Bắt đầu nhanh" của README) |
| `GITHUB_TOKEN=<read:packages> npm run consumer:smoke:published` | Cùng việc đó nhưng cài từ GitHub Packages thật (phiên bản mới nhất hoặc `NXT_VERSION=…`), không cần build |
| `npm run release:check` | Phiên bản hai gói, `NXT_UI_VERSION`, peer và CHANGELOG cùng khớp |

Phát hành: tăng phiên bản, cập nhật [CHANGELOG](CHANGELOG.md), đẩy thẻ `v<phiên bản>`; workflow `publish.yml` kiểm tra rồi phát hành (xem [ADR-006](docs/adr/006-npm-scope.md)). Khi thêm hay bỏ component, chạy `npm run readme:catalog` để README không lệch.

## Có gì trong repo

| Gói | Nội dung |
|-----|----------|
| [`@nxt/tokens`](packages/tokens) | Hơn 900 token DTCG: thang màu OKLCH sinh từ seed, sáng/tối, 3 mức mật độ, motion, brand theo sản phẩm; lệnh `nxt-palette` sinh thang màu thương hiệu |
| [`@nxt/ui`](packages/ui) | 40 entry point component, layout primitives, `provideNxt()` và `NxtTheme` |
| [`apps/docs`](apps/docs) | Trang docs tiếng Việt của repo (chạy cục bộ bằng `npm start`) |

Hướng dẫn cho AI agent và bộ skill: [CLAUDE.md](CLAUDE.md).

## Giấy phép

MIT, xem [LICENSE](LICENSE). Dữ liệu icon là Tabler Icons (MIT), xem [NOTICE](NOTICE).

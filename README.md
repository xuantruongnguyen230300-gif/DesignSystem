# NXT Design

NXT Design là design system đa sản phẩm cho phần mềm nghiệp vụ, xây trên Angular 21, Angular CDK (headless) và token W3C DTCG.

## Bắt đầu

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
| `npm run ds:check` | Kiểm token (tier, mode, brand, 400 phép kiểm tương phản) và giá trị hard-code |

## Có gì trong repo

| Gói | Nội dung |
|-----|----------|
| [`@nxt/tokens`](packages/tokens) | Khoảng 390 token DTCG: thang màu OKLCH sinh từ seed, sáng/tối, 3 mức mật độ, motion, brand theo sản phẩm (ví dụ `sample`) |
| [`@nxt/ui`](packages/ui) | Style nền + Button + layout primitives (Stack, Inline, Grid theo container query) |
| [`apps/docs`](apps/docs) | Docs tiếng Việt: ví dụ chạy thật, bảng API và token sinh từ source, tìm kiếm <kbd>Ctrl K</kbd> không dấu, `llms.txt` |

## Tài liệu

- [Kế hoạch & trạng thái](docs/PLAN.md)
- [Nguyên tắc thiết kế](docs/design/principles.md) · [Kiến trúc token](docs/design/token-architecture.md) · [Quy ước component](docs/design/component-conventions.md)
- [ADR](docs/adr/README.md)
- [Hướng dẫn cho AI agent và bộ skill](CLAUDE.md)

# ADR-009: Workspace Angular CLI + npm 11, chưa dùng pnpm/Nx

- **Trạng thái:** Đã áp dụng, chờ xác nhận
- **Ngày:** 2026-10-16

## Bối cảnh
Kế hoạch ban đầu đề xuất pnpm workspaces. Máy phát triển hiện chưa có pnpm, và npm 10.8.2 gặp bug arborist (`Cannot read properties of null (reading 'edgesOut')`) với bộ `@angular/build` + `vitest` + `jsdom`. npm 11 cài được bình thường.

## Quyết định
- **Một `package.json` gốc** cho cả workspace Angular CLI (multi-project: `packages/ui` là library dùng ng-packagr, `apps/docs` là application). `packages/tokens` có `package.json` riêng để publish, build bằng script Node.
- **npm ≥ 11** (`packageManager: npm@11.21.1`). CI chạy `npm install -g npm@11` trước `npm ci`.
- Chưa dùng Nx: chỉ có 3 gói, build toàn bộ dưới 30 giây.

## Hệ quả
- Xem xét chuyển sang pnpm hoặc Nx khi có từ 6 gói trở lên, hoặc CI chạy quá 10 phút.
- `@nxt/ui` được docs và test dùng thẳng từ source qua tsconfig `paths`; bản publish dùng `dist/ui`.

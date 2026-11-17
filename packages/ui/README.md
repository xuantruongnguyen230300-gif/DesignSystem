# @nxt/ui

Component Angular 21 của NXT Design: standalone, signals, OnPush, hành vi headless từ Angular CDK. Style chỉ dùng token `--nxt-*`.

```ts
import { NxtButton } from '@nxt/ui/button';
import { NxtStack, NxtInline, NxtGrid, NxtSpan } from '@nxt/ui/layout';
```

```css
/* styles.css của app */
@import '@nxt/tokens/css/nxt.css';
@import '@nxt/ui/styles/nxt.css';
```

Cài đặt từ GitHub Packages (bằng alias, giữ tên `@nxt/*`): xem trang **Cài đặt** của docs. Giấy phép MIT, kèm `NOTICE` (Tabler Icons).

Đổi màu thương hiệu của dự án (không cần build lại): `provideNxt({ primary: '#0f766e' })`, đổi lúc chạy bằng `inject(NxtTheme).setPrimary(…)`, hoặc CSS tĩnh bằng `npx nxt-palette "#0f766e"`. Xem [ADR-015](../../docs/adr/015-consumer-theming.md).

- Quy ước: [docs/design/component-conventions.md](../../docs/design/component-conventions.md)
- Mỗi component có `SPEC.md` trong thư mục của nó. SPEC là nguồn sự thật về hành vi.
- Build: `npx ng build ui` → `dist/ui`. Test: `npm test` (unit) và `npm run test:a11y` (axe trên mọi example của docs).

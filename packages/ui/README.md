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

- Quy ước: [docs/design/component-conventions.md](../../docs/design/component-conventions.md)
- Mỗi component có `SPEC.md` trong thư mục của nó. SPEC là nguồn sự thật về hành vi.
- Build: `npx ng build ui` → `dist/ui`. Test: `npm test`.

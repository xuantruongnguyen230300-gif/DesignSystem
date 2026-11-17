# @nxt/tokens

Design token của NXT Design (W3C DTCG) và CSS custom property sinh sẵn. Đi cùng [`@nxt/ui`](../ui/README.md); dùng riêng được cho ứng dụng không phải Angular.

```css
/* styles.css của app */
@import '@nxt/tokens/css/core.css';   /* token dùng chung (~4 KB nén); token của từng component đi kèm component */
```

| Đường dẫn | Nội dung |
|-----------|----------|
| `css/core.css` | Token lõi, mọi chế độ sáng/tối, mật độ, chuyển động |
| `css/components/<tên>.css` | Token riêng của một component (đã nằm trong `@nxt/ui`) |
| `css/nxt.css` | Tất cả token một file, cho prototype |
| `css/brands/<sản-phẩm>.css` | Brand đã dựng sẵn (hiện có `sample`) |
| `scss/_breakpoints.scss` | Breakpoint và mixin |
| `json/tokens.json` | Toàn bộ token đã giải |
| `.` (JS) | `tokens`, `breakpoints`, `cssVar()` |

## Đổi màu thương hiệu

```bash
npx nxt-palette "#0f766e" > brand.css   # nạp sau core.css
```

Lệnh sinh thang 11 bậc `--nxt-color-brand-50 … 950` từ một màu gốc và in kết quả kiểm tương phản WCAG ra stderr (`--json` in thang dạng JSON). Trong Angular, `provideNxt({ primary: '#0f766e' })` làm điều tương tự lúc chạy. Chi tiết: trang **Theming** của docs và [ADR-015](../../docs/adr/015-consumer-theming.md).

## Cài đặt

Gói phát hành trên GitHub Packages theo tài khoản chứa repo, nên tên cài đặt có scope tài khoản. Cài bằng npm alias để giữ tên `@nxt/*` trong code: xem trang **Cài đặt** của docs.

Giấy phép MIT.

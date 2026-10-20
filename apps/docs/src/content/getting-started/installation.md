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

```bash
npm install @nxt/tokens @nxt/ui @angular/cdk
```

NXT yêu cầu Angular ≥ 21.2 và Node ≥ 20.19.

## 2. Nạp style

Thứ tự nạp quan trọng: token core, rồi brand của sản phẩm, rồi style nền của NXT, cuối cùng là CSS của ứng dụng.

```css
/* src/styles.css */
@import '@nxt/tokens/css/nxt.css';
@import '@nxt/tokens/css/brands/<san-pham>.css';
@import '@nxt/ui/styles/nxt.css';
```

`@nxt/ui/styles/nxt.css` khai báo thứ tự cascade layer: `nxt.reset, nxt.base, nxt.components, nxt.patterns, nxt.utilities`. CSS của ứng dụng viết ngoài các layer này **luôn thắng**, nên không cần `!important`.

## 3. Đặt chế độ hiển thị

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

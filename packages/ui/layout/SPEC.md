---
component: layout
status: beta
owner: "NXT core"
updated: 2026-10-16
apg-pattern: "none (presentational)"
---

# Layout primitives (Stack, Inline, Grid, Span): Spec

## 1. Mục đích
- **Vấn đề:** khoảng cách và bố cục được viết tay bằng margin ở mỗi màn hình sẽ lệch nhau, không theo density và vỡ khi đặt vào drawer hay panel hẹp.
- **Khi nào dùng:**
  - `nxt-stack`: xếp dọc, ví dụ các section, field trong form hay các đoạn nội dung.
  - `nxt-inline`: xếp ngang có wrap, ví dụ nhóm nút, toolbar, danh sách tag.
  - `nxt-grid` + `[nxtSpan]`: lưới 12 cột cho bố cục trang và form nhiều cột, hoặc `columns="auto"` cho lưới thẻ.
- **Khi nào KHÔNG dùng:**
  - Bố cục nội bộ của một component: component tự lo phần đó.
  - Bảng dữ liệu: dùng `nxt-table` (Phase 3).
  - Chia màn hình có splitter: dùng `nxt-split` (Phase 3).

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host (`nxt-stack` / `nxt-inline` / `nxt-grid`) | ✓ | Grid host là *container* (`container-type: inline-size`) |
| 2 | Track (`.nxt-grid__track`, chỉ có ở grid) | ✓ | Phần tử `display: grid` thật sự; nhận nội dung chiếu vào |
| 3 | Item `[nxtSpan]` | — | Con trực tiếp của grid |

## 3. API (Angular)
| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxt-stack` input | `gap` | `NxtGap` | `'md'` | `none · xs · sm · md · lg · xl`, theo density |
| `nxt-stack` input | `align` | `start · center · end · stretch` | `'stretch'` | Căn theo trục ngang |
| `nxt-inline` input | `gap` | `NxtGap` | `'sm'` | |
| `nxt-inline` input | `align` | `start · center · end · baseline · stretch` | `'center'` | Căn theo trục dọc |
| `nxt-inline` input | `justify` | `start · center · end · between` | `'start'` | |
| `nxt-inline` input | `wrap` | `boolean` | `true` | |
| `nxt-grid` input | `columns` | `1…12 \| 'auto'` | `12` | `auto` = auto-fill theo `minItem` |
| `nxt-grid` input | `minItem` | `sm · md · lg` | `'md'` | 160 / 240 / 320px |
| `nxt-grid` input | `gap` | `NxtGap \| 'gutter'` | `'gutter'` | `gutter` = 16 / 24 / 32px theo **bề rộng của grid** |
| `[nxtSpan]` input | `nxtSpan` | `1…12 \| 'full' \| { base, sm, md, lg, xl }` | (bắt buộc) | Breakpoint là bề rộng của grid: sm 640 · md 768 · lg 1024 · xl 1280 |

## 4. Variants & sizes
Không có variant thị giác. Primitive chỉ quyết định khoảng cách và vị trí, không có màu và không có viền.

## 5. States
Không áp dụng. Đây là primitive trình bày, không tương tác.

## 6. Keyboard & ARIA
- Không có role và không nhận focus. Thứ tự đọc và thứ tự Tab là **thứ tự DOM**.
- **Cấm** dùng `order` hay đặt `grid-column` ngược thứ tự DOM, vì sẽ vi phạm WCAG 1.3.2 và 2.4.3.

## 7. Tokens
| Token | Alias semantic |
|-------|----------------|
| `component.flow.gap-{xs…xl}` | `space.gap.{xs…xl}` (theo density) |
| `component.grid.gutter-{sm,md,lg}` | `layout.gutter-{sm,md,lg}` |
| `component.grid.item-min-{sm,md,lg}` | `layout.item-min-{sm,md,lg}` |

## 8. Density, responsive, i18n
- Gap theo density: compact nhỏ hơn, spacious lớn hơn. Gutter của lưới trang **không** đổi theo density, vì đó là nhịp của bố cục trang.
- Responsive bằng **container query** trên host grid. Cùng một form 2 cột có thể nằm ở trang rộng hoặc drawer 480px: ở drawer form tự về 1 cột.
- Primitive không cắt chữ. Nội dung dài tự xuống dòng; item có `min-inline-size: 0` nên không tràn.

## 9. Content guidelines
Không áp dụng.

## 10. Acceptance (Definition of Done)
- [x] Example cho stack, inline, grid 12 cột responsive, grid auto, grid trong vùng hẹp
- [x] Unit test phản ánh input → data-attribute / custom property
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-16)
- [x] `npm run ds:check` sạch
- [x] Docs page đủ mục

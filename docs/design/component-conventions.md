# NXT Design: quy ước component Angular

> Áp dụng cho `packages/ui` (component) và `packages/patterns` (pattern ghép). Phần hướng dẫn Angular tổng quát (signals, DI, router, testing) lấy từ skill upstream `angular-developer` ([angular/skills](https://github.com/angular/skills)) nếu đã cài. Tài liệu này chỉ ghi các quy ước riêng của NXT.

## 1. Cấu trúc gói

```
packages/ui/<name>/            # secondary entry point → import từ '@nxt/ui/<name>'
  ng-package.json
  public-api.ts                # chỉ export API công khai
  SPEC.md                      # spec (skill nxt-component-spec), là nguồn sự thật về hành vi
  src/<name>.ts                # component/directive (không có hậu tố .component, theo style guide Angular ≥ 20)
  src/<name>.css
  src/<name>.spec.ts           # Vitest (test runner mặc định từ Angular 21)
packages/tokens/src/component/<name>.tokens.json
apps/docs/src/content/components/<name>.md
apps/docs/src/examples/<name>/*.example.ts   # vừa là ví dụ docs, vừa là fixture cho test a11y/visual
```

Tạo khung bằng `npm run ds:new -- <name> [--attribute]`. Script này không ghi đè file đã có.

## 2. API

- **Selector:**
  - Phần tử có ngữ nghĩa native (button, a, input) → attribute selector `button[nxtButton]`, để giữ semantics và a11y của trình duyệt.
  - Component ghép → element selector `nxt-<name>`.
- **Class:** `Nxt<Name>` (không có hậu tố `Component`). Type đi kèm đặt tên `Nxt<Name>Variant`, `Nxt<Name>Size`.
- **Input/Output:**
  - Input dùng `input()` / `input.required()`; giá trị two-way dùng `model()`; output dùng `output()`. Không dùng decorator `@Input` / `@Output`.
  - Boolean dùng `transform: booleanAttribute`; số dùng `numberAttribute`.
  - Tên input thống nhất toàn hệ thống: `variant`, `size` (`sm` | `md` | `lg`), `disabled`, `readonly`, `loading`, `invalid`.
- **Change detection:** luôn `OnPush`. Code phải chạy được ở chế độ zoneless: không dựa vào `NgZone`, không mutate state ngoài signal.
- **Host bindings:** dùng object `host: {}`, không dùng `@HostBinding` / `@HostListener`. Variant, size và state phản ánh ra `data-*` để CSS chọn.
- **Forms:** control nhập liệu implement `ControlValueAccessor` (hoặc API Signal Forms khi đã ổn định). Hỗ trợ `disabled`, `touched` và hiển thị lỗi qua `nxt-form-field`.
- **Không có input kiểu `color="#..."`.** Muốn tuỳ biến thì override component token CSS (`--nxt-button-bg`) ở phạm vi cha.

## 3. Hành vi headless: dùng CDK/Aria, không tự viết lại

| Nhu cầu | Dùng |
|---------|------|
| Overlay, positioning (dropdown, popover, tooltip, menu) | `@angular/cdk/overlay` |
| Focus trap, focus restore, `FocusMonitor`, `LiveAnnouncer`, `ListKeyManager` | `@angular/cdk/a11y` |
| Dialog / drawer | `@angular/cdk/dialog` |
| Listbox, menu, combobox, tabs, tree, grid (keyboard pattern APG) | `@angular/aria` (developer preview ở v21; đánh giá theo từng component, xem ADR-004), fallback về `@angular/cdk/listbox`, `@angular/cdk/menu` |
| Bảng, virtual scroll | `@angular/cdk/table`, `@angular/cdk/scrolling` |
| Kéo thả | `@angular/cdk/drag-drop` |
| Breakpoint trong TS | `@angular/cdk/layout` + giá trị từ `@nxt/tokens/js` |

Hành vi bàn phím **phải** khớp WAI-ARIA APG của pattern ghi trong `SPEC.md`.

## 4. Style

- **Encapsulation:** `ViewEncapsulation.None`. Mọi rule bọc trong `@layer nxt.components` và scope bằng class `.nxt-<name>`.
- **Thứ tự layer** (khai báo một lần ở `@nxt/ui/styles`): `@layer nxt.reset, nxt.base, nxt.components, nxt.patterns, nxt.utilities;`. Ứng dụng viết CSS không bọc layer sẽ luôn thắng mà không cần `!important`.
- **Chỉ dùng token:**
  - Không có literal màu, px (trừ `0` và hairline `1px`), z-index, font-family.
  - Kiểm bằng `npm run ds:hardcoded`.
  - Ngoại lệ phải có comment `/* nxt-allow: <rule> — lý do */`.
- **Component token và semantic token:**
  - Thuộc tính mà sản phẩm có thể muốn tuỳ biến riêng cho từng component (**màu, bo góc, chiều cao/bề rộng chính**) phải đi qua component token `--nxt-<component>-*`.
  - Khoảng cách nội bộ, typography, focus, motion, elevation, z-index, độ dày viền và kích thước icon được dùng thẳng semantic token (`--nxt-space-*`, `--nxt-typography-*`, `--nxt-focus-ring-*`, `--nxt-motion-*`, `--nxt-elevation-*`, `--nxt-z-*`, `--nxt-border-width-*`, `--nxt-size-icon-*`). Tạo component token cho từng padding chỉ sinh hàng trăm token không ai override.
- **Icon lồng nhau:** component đặt `--nxt-icon-size` trên root của mình, rồi `nxt-icon` bên trong tự nhận kích thước đó (ví dụ Button đặt bằng `--nxt-button-icon-size`).
- **Focus:** dùng `:focus-visible` với `--nxt-focus-ring-*`. Không `outline: none` khi không có focus style thay thế.
- **Motion:** dùng `--nxt-motion-*`. Mode reduced đưa duration về 0, nên không cần viết media query riêng trong component.
- **Kích thước:** dùng logical properties (`inline-size`, `padding-inline`, `margin-block`).
- **Không có `::ng-deep`.**

## 5. Test (Definition of Done)

| Lớp | Công cụ | Lệnh | Bắt buộc |
|-----|---------|------|----------|
| Unit + keyboard map | Vitest + TestBed (`@angular/core/testing`) | `npm test` | Mọi dòng trong bảng Keyboard của SPEC |
| A11y | Playwright + `@axe-core/playwright` (`apps/docs/e2e/a11y.spec.ts`), tự chạy trên **mọi** example | `npm run build && npm run test:a11y` | 0 vi phạm ở sáng/tối/gọn |
| Visual regression | Playwright `toHaveScreenshot` | (chưa dựng, xem PLAN §7.4) | Mỗi variant × state chính × sáng/tối |
| Token/hard-code | validator + detector (cũng chạy qua hook của Claude Code) | `npm run ds:check` | Sạch |

Thêm component vào test a11y chỉ cần tạo file example: test tự lấy danh sách từ `apps/docs/src/generated/examples.json`.

Component tương tác nên có harness (`Nxt<Name>Harness`) trong `packages/ui/<name>/testing`, để ứng dụng sản phẩm dùng trong test của họ. Việc này sẽ làm từ đợt B, khi có control nhập liệu.

## 6. Trạng thái phát hành

| Status | Nghĩa | Điều kiện |
|--------|-------|-----------|
| `draft` | Đang làm, không dùng trong sản phẩm | Có SPEC |
| `beta` | Dùng được, API có thể đổi | Đạt DoD §5, có docs đủ mục |
| `stable` | API cam kết semver | Đã dùng trong ít nhất một sản phẩm thật, đã qua review a11y |
| `deprecated` | Có thay thế, sẽ bị xoá ở major tiếp theo | Có hướng dẫn migration |

Docs site hiển thị badge status, **không** liệt kê các mục "missing" vào navigation như trang tham chiếu. Các component dự kiến làm đặt ở trang Roadmap.

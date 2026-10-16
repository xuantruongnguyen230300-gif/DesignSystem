# NXT Design: kiến trúc token

> Đây là hợp đồng giữa thiết kế, code và tooling. `tools/tokens/validate.mjs` kiểm tra đúng các luật trong tài liệu này. Sửa luật ở đây thì phải sửa validator trong cùng một PR.

## 1. Định dạng & pipeline

- Nguồn token là **W3C Design Tokens (DTCG 2025.10)** JSON, nằm tại `packages/tokens/src/**/*.tokens.json`.
- Màu ưu tiên viết bằng `oklch` (object `{ colorSpace, components, alpha, hex }`, trong đó `hex` dùng làm fallback). Dimension viết dạng `{ "value": 8, "unit": "px" }` hoặc chuỗi `"8px"`.
- Build bằng Style Dictionary (v5+), sinh ra:
  - `@nxt/tokens/css/*.css`: CSS custom properties `--nxt-*`, mỗi mode/brand là một selector.
  - `@nxt/tokens/scss/_breakpoints.scss`: mixin breakpoint, vì CSS var không dùng được trong `@media`.
  - `@nxt/tokens/js`: hằng số TS (charts, canvas, so sánh).
  - `@nxt/tokens/json`: dữ liệu cho docs site và cho agent.
- Kiểm tra bằng `npm run ds:tokens`, chạy trong CI và trước mỗi commit đụng tới token.

## 2. Ba tầng (tier)

Nhóm cấp cao nhất của mỗi token **bắt buộc** là tên tier.

| Tier | Ví dụ path | CSS var | Được tham chiếu tới | Giá trị literal |
|------|-----------|---------|---------------------|-----------------|
| `primitive` | `primitive.color.blue.600` | `--nxt-color-blue-600` | primitive | ✓ (đây là nơi duy nhất có literal màu) |
| `semantic` | `semantic.color.text.default` | `--nxt-color-text-default` | primitive, semantic | ✗ với màu; các loại khác hạn chế |
| `component` | `component.button.bg` | `--nxt-button-bg` | semantic, component | ✗ với màu; loại khác sẽ bị cảnh báo |

Tên CSS var = `--nxt-` + path bỏ tier, các đoạn nối bằng `-`. Validator báo lỗi nếu hai token cho ra cùng một tên.

**Luật cốt lõi:**
- Component **không bao giờ** trỏ thẳng tới primitive. Đây là chỗ trang tham chiếu bị phình: dark mode phải nhân đôi token component (`badge-error-bg-light` / `badge-error-bg-dark`). NXT đổi mode ở tầng semantic, nên component token chỉ có **một** bản.
- CSS của component chỉ đọc `--nxt-<component>-*` và một số semantic toàn cục (`focus-ring-*`, `motion-*`).
- Mỗi token semantic và component phải có `$description`, vì docs site sinh bảng token từ trường này.

## 3. Tên gọi

- Mỗi đoạn của path dùng kebab-case chữ thường: `^[a-z0-9]+(-[a-z0-9]+)*$`.
- Thứ tự path semantic là `semantic.<category>.<role>.<variant?>.<state?>`, ví dụ `semantic.color.bg.primary-hover`, `semantic.color.text.on-primary`.
- Thứ tự path component là `component.<component>.<part?>.<property>.<variant/state?>`, ví dụ `component.button.bg-hover`, `component.table.header.bg`.
- Đặt tên theo **vai trò**, không theo cảm quan: viết `text.subtle`, không viết `text.gray`.

### Bộ semantic chuẩn

Component template của scaffold dựa vào các token này. Thêm token mới được, nhưng không đổi tên token đã có.

| Category | Token |
|----------|-------|
| `color.bg` | `canvas`, `surface`, `surface-hover`, `surface-raised`, `subtle`, `muted`, `disabled`, `inverse`, `overlay`, `primary`, `primary-hover`, `primary-pressed`, `primary-subtle`, `danger`, `danger-hover`, `danger-subtle`, `success-subtle`, `warning-subtle`, `info-subtle` |
| `color.text` | `default`, `strong`, `subtle`, `disabled`, `inverse`, `link`, `on-primary`, `on-danger`, `danger`, `success`, `warning`, `info` |
| `color.border` | `default`, `subtle`, `strong`, `input`, `input-hover`, `danger`, `selected` |
| `color.icon` | `default`, `subtle`, `disabled`, `primary`, `danger`, `success`, `warning`, `info` |
| `color.data` | `1`…`8` (categorical), `sequential-*`, `diverging-*` cho chart |
| `focus.ring` | `color`, `width`, `offset` |
| `space.inset` | `xs`, `sm`, `md`, `lg` (padding bên trong control/container) |
| `space.gap` | `xs`, `sm`, `md`, `lg`, `xl` (khoảng cách giữa phần tử) |
| `space.section` | `sm`, `md`, `lg` (khoảng cách giữa các khối trang) |
| `size.control` | `sm`, `md`, `lg` (block-size của input/button/select) |
| `size.row` | `sm`, `md`, `lg` (row height của table/list) |
| `size.icon` | `sm`, `md`, `lg` |
| `radius` | `control`, `container`, `overlay`, `pill` |
| `typography` | `display`, `heading-lg`, `heading-md`, `heading-sm`, `body-md`, `body-sm`, `label-md`, `label-sm`, `caption`, `code` (composite `typography`) |
| `font-family` | `sans`, `mono` |
| `elevation` | `raised`, `overlay`, `modal` (shadow) |
| `motion.duration` | `instant`, `fast`, `normal`, `slow` |
| `motion.ease` | `standard`, `enter`, `exit` |
| `z` | `base`, `sticky`, `dropdown`, `overlay`, `modal`, `toast`, `tooltip` |
| `layout` | `container-max`, `sidebar-width`, `sidebar-width-collapsed`, `header-height` |

## 4. Mode

Mode là các file cùng tên khác hậu tố: `<name>.<mode>.tokens.json`. Các mode trong cùng một trục **phải định nghĩa đúng cùng một tập token**.

| Trục | Mode (mode đầu là mặc định) | Đổi những gì | Selector CSS |
|------|-----------------------------|--------------|--------------|
| `color` | `light`, `dark` | `semantic.color.*`, `semantic.elevation.*` | `:root`, `[data-nxt-color="dark"]`, có thể theo `prefers-color-scheme` |
| `density` | `comfortable`, `compact`, `spacious` | `semantic.space.*`, `semantic.size.control.*`, `semantic.size.row.*` | `[data-nxt-density="compact"]`… |
| `motion` | `full`, `reduced` | `semantic.motion.duration.*` (reduced = 0ms trừ fade ngắn) | `@media (prefers-reduced-motion: reduce)` + `[data-nxt-motion="reduced"]` |

Một token đã nằm trong file mode thì không được định nghĩa lại trong file base.

## 5. Brand cho từng sản phẩm

Đa sản phẩm được tổ chức bằng thư mục `src/brands/<product>/`, ví dụ `src/brands/hrm/brand.tokens.json` và `brand.dark.tokens.json`.

- Brand **chỉ được override** token đã tồn tại, không được thêm token mới. Validator báo lỗi nếu brand thêm token.
- Brand slot được phép override:
  - `primitive.color.brand.*`: thang màu thương hiệu, sinh bằng `npm run ds:palette`.
  - `semantic.color.bg.primary*`, `semantic.color.text.on-primary`, `semantic.color.text.link`, `semantic.color.border.selected`, `semantic.focus.ring.color`.
  - `semantic.font-family.sans`, chỉ khi font đó hỗ trợ đầy đủ tiếng Việt.
  - `semantic.radius.*`, giới hạn ở hai preset `default` và `rounded`.
- Không override màu status (danger/success/warning/info). Ý nghĩa của trạng thái phải giống nhau ở mọi sản phẩm.
- Selector CSS là `[data-nxt-brand="hrm"]`.

## 6. Tương phản tự động

`packages/tokens/tokens.config.json → contrastPairs` liệt kê các cặp màu bắt buộc. Validator tính các cặp này ở **mọi** tổ hợp mode × brand.

```json
{
  "prefix": "nxt",
  "modes": {
    "color": ["light", "dark"],
    "density": ["comfortable", "compact", "spacious"],
    "motion": ["full", "reduced"]
  },
  "contrastPairs": [
    { "fg": "semantic.color.text.default",    "bg": "semantic.color.bg.surface", "min": 4.5 },
    { "fg": "semantic.color.text.subtle",     "bg": "semantic.color.bg.surface", "min": 4.5 },
    { "fg": "semantic.color.text.on-primary", "bg": "semantic.color.bg.primary", "min": 4.5 },
    { "fg": "semantic.color.border.input",    "bg": "semantic.color.bg.surface", "min": 3, "note": "WCAG 1.4.11 non-text" },
    { "fg": "semantic.focus.ring.color",      "bg": "semantic.color.bg.canvas",  "min": 3 }
  ]
}
```

## 7. Breakpoint & grid

| Token | Giá trị | Dùng cho |
|-------|---------|----------|
| `primitive.breakpoint.sm` | 640px | Điện thoại ngang |
| `primitive.breakpoint.md` | 768px | Tablet |
| `primitive.breakpoint.lg` | 1024px | Laptop nhỏ, sidebar bắt đầu thu gọn |
| `primitive.breakpoint.xl` | 1280px | Desktop chuẩn |
| `primitive.breakpoint.2xl` | 1536px | Màn hình rộng |

- **Một** thang duy nhất cho toàn hệ thống. Trang tham chiếu dùng lẫn ba thang: Ant 576/768/992/1200/1600, Tailwind rem, và các giá trị ad-hoc 767/900/991.
- Bên trong component dùng **container query**, không dùng viewport.
- Grid trang có 12 cột. Gutter và margin là semantic token đổi theo breakpoint: 16 (mobile), 24 (md–lg), 32 (xl+). Container tối đa 1440px. Riêng trang bảng dữ liệu được dùng full-width.

## 8. Đổi tên & ngừng dùng

- Không xoá token đang dùng. Đánh dấu `"$deprecated": "Dùng {semantic.color.text.subtle}"` và giữ ít nhất một minor version.
- Validator cảnh báo khi một token chưa deprecated tham chiếu tới token đã deprecated.
- Mỗi lần đổi tên phải có ghi chú migration trong changeset (skill `nxt-release`).

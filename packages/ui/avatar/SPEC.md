---
component: avatar
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: "none (presentational)"
---

# Avatar: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** nhận ra một người nhanh trong danh sách, bảng, timeline hay topbar, kể cả khi người đó chưa có ảnh.
- **Khi nào dùng:** đứng cạnh tên người (hàng bảng, người duyệt, người tạo), hoặc đứng một mình trong topbar khi có `label`.
- **Khi nào KHÔNG dùng:**
  - Biểu diễn đối tượng không phải người (phòng ban, file, sản phẩm): dùng `nxt-icon`.
  - Hiển thị trạng thái (online, đã duyệt): dùng `nxt-tag` / `nxt-badge` bên cạnh, avatar không mang trạng thái.
  - Ảnh minh hoạ hoặc ảnh lớn trong hồ sơ: dùng `img` thường.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-avatar` | ✓ | Hình tròn (`radius.pill`), viền mảnh `border-subtle` |
| 2 | Ảnh `img` | — | Chỉ render khi có `src` và ảnh chưa lỗi; `alt` = `label` hoặc `""` |
| 3 | Chữ cái `.nxt-avatar__initials` | — | Thay cho ảnh; `aria-hidden="true"` |
| 4 | Tên ẩn `.nxt-visually-hidden` | — | Chỉ có khi dùng chữ cái **và** có `label` |

## 3. API (Angular)
Selector: `nxt-avatar`. Export kèm hai hàm thuần `nxtInitials(name)` và `nxtAvatarTone(name)`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `name` | `string` | (bắt buộc) | Họ tên đầy đủ, quyết định chữ cái và tông màu |
| input | `src` | `string` | `undefined` | URL ảnh. Ảnh lỗi (`error`) thì tự về chữ cái |
| input | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Phản ánh ra `data-size` |
| input | `label` | `string` | `undefined` | Tên truy cập khi avatar đứng một mình. Không có thì avatar là trang trí |

- `nxtInitials`: chữ đầu của **từ đầu** (họ) + chữ đầu của **từ cuối** (tên), viết hoa theo locale `vi`. "Nguyễn Thị Ngọc Diệp" → "ND", "Đặng Anh" → "ĐA", "Minh" → "M", chuỗi rỗng → "?".
- `nxtAvatarTone`: băm tên ra tông 1–6, ổn định: cùng một người luôn cùng một màu ở mọi màn hình. Phản ánh ra `data-tone`.

## 4. Variants & sizes
Không có variant do người dùng chọn. Tông màu (1–6) tự sinh từ tên, không có input đổi tông.

| Size | comfortable | compact | spacious | Typography |
|------|-------------|---------|----------|------------|
| `sm` | 24px | 24px | 24px | 12px (`font-size-12`, cỡ label-sm) |
| `md` | 32px | 28px | 40px | `label-sm` |
| `lg` | 40px | 32px | 48px | `label-md` |

`sm` dựa trên `size.icon.lg` nên không đổi theo density; `md`, `lg` theo `size.control.*`.

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | — (không tương tác) | — | — | — | — | — (không có skeleton riêng) | ✓ ảnh lỗi → chữ cái | — | ✓ không có ảnh → chữ cái; tên rỗng → "?" |

## 6. Keyboard & ARIA
APG pattern: không áp dụng (phần tử trình bày, không nhận focus).

| Phím | Hành vi |
|------|---------|
| — | Avatar không nằm trong thứ tự Tab. Nếu cần bấm vào avatar (mở hồ sơ), bọc bằng `a` / `button` có tên truy cập |

- Không gắn `role`. Mặc định là trang trí: chữ cái `aria-hidden="true"`, ảnh có `alt=""`.
- Có `label`: ảnh nhận `alt="{label}"`; khi dùng chữ cái thì `label` được đặt trong `span.nxt-visually-hidden`.
- Chỉ truyền `label` khi **không** có tên hiển thị cạnh avatar, để screen reader không đọc tên hai lần.

## 7. Tokens
`packages/tokens/src/component/avatar.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `size-sm` | `size.icon.lg` |
| `size-md`, `size-lg` | `size.control.md`, `size.control.lg` |
| `radius` | `radius.pill` |
| `border` | `color.border.subtle` |
| `tone-1-bg` / `-text` | `color.bg.primary-subtle` / `color.text.link` |
| `tone-2-bg` / `-text` | `color.bg.info-subtle` / `color.text.info` |
| `tone-3-bg` / `-text` | `color.bg.success-subtle` / `color.text.success` |
| `tone-4-bg` / `-text` | `color.bg.warning-subtle` / `color.text.warning` |
| `tone-5-bg` / `-text` | `color.bg.danger-subtle` / `color.text.danger` |
| `tone-6-bg` / `-text` | `color.bg.muted` / `color.text.default` |

Dùng thẳng semantic: `border-width.default`, `typography.label-sm`, `typography.label-md`.

## 8. Density, responsive, i18n
- `md`/`lg` theo density; `sm` cố định 24px để vẫn đọc được 2 chữ cái.
- Ảnh `object-fit: cover`, không méo khi ảnh không vuông.
- Tiếng Việt: chữ cái giữ dấu và chữ Đ ("ĐA"); viết hoa bằng `toLocaleUpperCase('vi')`. Lấy họ + tên (từ đầu và từ cuối), không lấy tên đệm.
- Tông màu chỉ để phân biệt, không mang nghĩa trạng thái (tông "danger" không có nghĩa là lỗi).

## 9. Content guidelines
- `name` là họ tên đầy đủ như trong hồ sơ, không viết tắt: "Nguyễn Thị Ngọc Diệp".
- `label` khi đứng một mình nêu rõ là ai: "Nguyễn Văn An", hoặc "Tài khoản của bạn: Nguyễn Văn An" trong topbar.
- Luôn hiện tên cạnh avatar trong bảng và danh sách; avatar không thay được tên.

## 10. Acceptance (Definition of Done)
- [ ] Mọi trạng thái ở §5 có trong docs example
- [x] Unit test: chữ cái theo họ + tên, tông ổn định 1–6, trang trí mặc định, `label` khi đứng một mình, ảnh lỗi về chữ cái
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/avatar.css:17`: size `sm` dùng primitive `--nxt-font-size-12` trực tiếp thay vì semantic/component token.

### Đã xử lý (2026-10-19)
- `failed` là `linkedSignal` theo `src`: đổi URL thì thử tải lại. Có unit test.
- Đã thêm `text.link`/`bg.primary-subtle` và `text.default`/`bg.muted` vào `contrastPairs`.

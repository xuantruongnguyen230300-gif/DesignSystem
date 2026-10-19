---
component: drawer
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: dialog-modal
---

# Drawer: Spec

Entry `@nxt/ui/drawer` gồm service `NxtDrawer` (mở panel trượt từ cạnh phải, dựa trên CDK Dialog) và `nxt-drawer-layout` (khung tiêu đề, nút đóng, thân cuộn, footer).

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** tạo / sửa một bản ghi hoặc xem nhanh chi tiết mà không rời danh sách, vẫn giữ ngữ cảnh (bộ lọc, vị trí cuộn) của trang phía sau.
- **Khi nào dùng:** form tạo / sửa vừa phải, chi tiết nhanh của một hàng bảng, bộ lọc nâng cao.
- **Khi nào KHÔNG dùng:**
  - Xác nhận ngắn một câu ("Xoá 3 nhân viên?"): dùng dialog xác nhận (chưa có), hoặc ưu tiên undo.
  - Form rất dài, nhiều bước, cần cả màn hình: dùng trang riêng.
  - Mở drawer từ trong drawer: cấm (giống "modal chồng modal", principles §4); chia bước trong cùng drawer.
  - Thông tin không cần chặn tương tác với trang: hiển thị inline hoặc trong panel cố định.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Backdrop `.nxt-drawer-backdrop` | ✓ | Nền `bg.overlay`; bấm vào thì đóng (trừ `disableClose`) |
| 2 | Pane `.nxt-drawer-pane--{size}` | ✓ | Overlay CDK, sát cạnh phải, cao 100%, rộng tối đa 100vw; trượt vào bằng `motion.duration.slow` |
| 3 | Container CDK `.cdk-dialog-container` | ✓ | `role="dialog"`, `aria-label` = `config.title` |
| 4 | Host `nxt-drawer-layout` | ✓ | Lưới 3 hàng: header / thân / footer |
| 5 | Header | ✓ | Tiêu đề `h2` + mô tả (tuỳ chọn) + nút đóng `nxtIconButton` "Đóng" |
| 6 | Thân `.nxt-drawer__body` | ✓ | Nội dung chiếu vào, cuộn dọc riêng |
| 7 | Footer `[nxtDrawerFooter]` | — | Dính đáy, căn phải; ẩn khi rỗng |

## 3. API (Angular)
Service: `NxtDrawer` (`providedIn: 'root'`). Selector: `nxt-drawer-layout`. Export type `NxtDrawerConfig<D>`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| method | `NxtDrawer.open(content, config)` | `(ComponentType<C> \| TemplateRef<C>, NxtDrawerConfig<D>) => DialogRef<R, C>` | | Mở drawer; trả về `DialogRef` của CDK (`closed`, `close(result)`) |
| config | `title` | `string` | (bắt buộc) | Tên truy cập của dialog (`aria-label`) |
| config | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | 400 / 560 / 720px |
| config | `data` | `D` | `undefined` | Dữ liệu cho nội dung, lấy bằng `inject(DIALOG_DATA)` (từ `@angular/cdk/dialog`) |
| config | `disableClose` | `boolean` | `false` | Chặn đóng bằng Escape / backdrop (ví dụ khi đang lưu) |
| `nxt-drawer-layout` input | `title` | `string` | (bắt buộc) | Tiêu đề hiển thị (`h2`) |
| `nxt-drawer-layout` input | `description` | `string` | `undefined` | Mô tả dưới tiêu đề |
| `nxt-drawer-layout` content | (default) | bất kỳ | | Thân drawer |
| `nxt-drawer-layout` content | `[nxtDrawerFooter]` | nút | | Hành động: "Huỷ", "Lưu" (primary ở cuối) |

Cấu hình CDK cố định: `autoFocus: 'first-tabbable'`, `restoreFocus: true`, vị trí `global().right('0').top('0')`, cao 100%. Nút "Đóng" gọi `DialogRef.close()` không kèm kết quả.

## 4. Variants & sizes
| Size | Bề rộng | Dùng khi |
|------|---------|----------|
| `sm` | 400px (`size.drawer.sm`) | Bộ lọc, chi tiết ngắn |
| `md` | 560px (`size.drawer.md`) | Form tạo / sửa (mặc định) |
| `lg` | 720px (`size.drawer.lg`) | Chi tiết có bảng con |

Mọi size bị giới hạn `min(100vw, …)`: trên màn hình hẹp drawer chiếm toàn bộ bề rộng.

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ mở | — (theo control bên trong) | ✓ theo control bên trong; focus bị giữ trong drawer | — | — | ✓ `disableClose`: Escape / backdrop không đóng | — (nơi dùng đặt `loading` cho nút Lưu + `disableClose`) | — (lỗi theo `nxt-form-field`, tóm tắt trong thân) | — | — |

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/

| Phím | Hành vi |
|------|---------|
| (khi mở) | Focus vào phần tử nhận focus đầu tiên (nút "Đóng" trong header) |
| Tab / Shift+Tab | Vòng trong drawer (focus trap của CDK), không ra trang phía sau |
| Escape | Đóng drawer (trừ khi `disableClose`) |
| (khi đóng) | Focus trả về phần tử đã mở drawer (`restoreFocus`) |

- Container: `role="dialog"`, `aria-label` = `config.title`. CDK đặt `aria-hidden="true"` cho các phần tử anh em của overlay container, nên trang phía sau không đọc được khi drawer mở.
- Tiêu đề hiển thị là `h2`. Nút đóng: `nxtIconButton` với `aria-label="Đóng"`, icon trang trí.
- Đã kiểm bằng Playwright e2e (2026-10-19) trong template catalog: validate form trong drawer đưa focus về trường lỗi, Escape đóng drawer và trả focus.

## 7. Tokens
`packages/tokens/src/component/drawer.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `bg` | `color.bg.surface-raised` |
| `border` | `color.border.default` |
| `backdrop` | `color.bg.overlay` |
| `width-sm`, `width-md`, `width-lg` | `size.drawer.{sm,md,lg}` |

Dùng thẳng semantic: `color.text.{default,strong,subtle}`, `elevation.modal`, `border-width.default`, `space.inset.{md,lg}`, `space.gap.{sm,md}`, `typography.{heading-md,body-sm}`, `motion.duration.slow`, `motion.ease.enter`. Cặp `text.default` / `surface-raised` có trong `contrastPairs`.

## 8. Density, responsive, i18n
- Padding và gap theo density; bề rộng không đổi theo density.
- Màn hình hẹp hơn bề rộng drawer: drawer chiếm 100vw. Form trong drawer nên đặt trong `nxt-grid` để tự về 1 cột (container query).
- Thân cuộn riêng; header và footer luôn hiện.
- Drawer luôn mở từ cạnh phải (toạ độ vật lý), không đổi theo `dir`.

## 9. Content guidelines
- `title` (config) và `title` (layout) là **cùng một chuỗi**: "Thêm nhân viên", "Sửa hồ sơ Nguyễn Văn An".
- Footer: nút primary là động từ + đối tượng ("Lưu hồ sơ"), nút phụ "Huỷ"; primary đặt cuối.
- Mô tả nói phạm vi hoặc điều kiện: "Các trường có dấu * là bắt buộc."
- Khi đóng mà còn thay đổi chưa lưu, phải cảnh báo (principles §2.5) — xem §11.

## 10. Acceptance (Definition of Done)
- [ ] Ba size, có/không footer, form có lỗi, `disableClose` khi đang lưu có trong docs example
- [x] Unit test: dialog modal có tên, không landmark lồng, nút Đóng tôn trọng `disableClose`, trả kết quả (`src/drawer.spec.ts`)
- [x] Playwright e2e: focus trường lỗi + Escape trả focus (template catalog, 2026-10-19)
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/drawer.ts:30`, `:70`: tên truy cập (`config.title` → `aria-label`) và tiêu đề hiển thị (`layout.title`) là hai input riêng, dễ lệch nhau. Nên dùng `aria-labelledby` trỏ tới `h2`.
- Không có cơ chế cảnh báo khi đóng drawer còn thay đổi chưa lưu; `NxtDrawerConfig` không mở `closePredicate` của CDK.
- `src/drawer.ts:38`: `autoFocus: 'first-tabbable'` luôn focus nút "Đóng" ở header thay vì trường đầu tiên của form; không cấu hình được.
- `src/drawer.ts:34`, `src/drawer.css:23`: vị trí và animation dùng cạnh phải vật lý (`right`, `translateX(100%)`) dù tài liệu nói "end edge".
- `src/drawer.ts:56`: nhãn "Đóng" viết cứng; tiêu đề luôn là `h2`.
- `src/drawer.css:33`, `:52`, `:57`: màu chữ dùng thẳng `--nxt-color-text-*`; `:48` primitive `--nxt-space-0-5`.

### Đã xử lý (2026-10-19)
- Đặt `ariaModal: true`. Header/footer của layout là `div` (trước là `header`/`footer`, thành landmark banner/contentinfo trong modal). Có unit test.
- Nút "Đóng" tôn trọng `disableClose`. Có unit test.

---
component: tag
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: "none (presentational)"
---

# Tag & Badge: Spec

Entry `@nxt/ui/tag` gồm hai component: `nxt-tag` (nhãn trạng thái / phân loại) và `nxt-badge` (số đếm hoặc chấm báo).

## 1. Mục đích
- **Vấn đề người dùng giải quyết:**
  - `nxt-tag`: đọc nhanh trạng thái quy trình ("Chờ duyệt", "Đã duyệt") hoặc phân loại ("Toàn thời gian") trong bảng, thẻ, header.
  - `nxt-badge`: biết có bao nhiêu mục đang chờ (đơn chờ duyệt, thông báo mới) mà không phải mở ra.
- **Khi nào dùng:** nhãn ngắn, chỉ đọc, đứng cạnh đối tượng mà nó mô tả.
- **Khi nào KHÔNG dùng:**
  - Lọc hoặc chọn được (chip bấm được, bỏ được): chưa có component; dùng `nxt-segmented` hoặc checkbox. `nxt-tag` không tương tác.
  - Thông báo cần người dùng xử lý: dùng inline alert.
  - Tiến độ có giá trị: dùng `nxt-progress`.
  - Số liệu chính của một vùng: dùng `nxt-stat`, không dùng badge.

## 2. Anatomy
**Tag**

| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-tag` | ✓ | Viên thuốc (`radius.pill`), nền và chữ theo `tone` |
| 2 | Icon đầu `nxt-icon` | — | Khi có `icon`; màu theo `-dot` của tone, 16px |
| 3 | Chấm `.nxt-tag__dot` | — | Khi `dot` và không có `icon`; `aria-hidden="true"` |
| 4 | Nhãn `.nxt-tag__label` | ✓ | Nội dung chiếu vào; quá dài thì cắt bằng dấu "…" |

**Badge**

| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-badge` | ✓ | Viên thuốc, tối thiểu vuông 20px |
| 2 | Số hiển thị | — | Không có khi `dot`; `aria-hidden="true"` khi có `label` |
| 3 | Tên ẩn `.nxt-visually-hidden` | — | Khi có `label` |

## 3. API (Angular)
Selector: `nxt-tag`, `nxt-badge`. Export type `NxtTone`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxt-tag` input | `tone` | `NxtTone` = `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger' \| 'brand'` | `'neutral'` | Nghĩa trạng thái cố định qua mọi sản phẩm |
| `nxt-tag` input | `dot` | `boolean` | `false` | Chấm trạng thái ở đầu (cho trạng thái quy trình) |
| `nxt-tag` input | `icon` | `NxtIconName` | `undefined` | Icon đầu; có `icon` thì không hiện chấm |
| `nxt-tag` input | `size` | `'sm' \| 'md'` | `'md'` | |
| `nxt-tag` content | (default) | text | | Nhãn |
| `nxt-badge` input | `value` | `number \| string` | `undefined` | Số đếm |
| `nxt-badge` input | `max` | `number` | `99` | Số lớn hơn `max` hiện "99+" (chỉ áp dụng khi `value` là `number`) |
| `nxt-badge` input | `tone` | `'danger' \| 'neutral' \| 'brand'` | `'danger'` | |
| `nxt-badge` input | `dot` | `boolean` | `false` | Chỉ hiện chấm 8px, không có số |
| `nxt-badge` input | `label` | `string` | `undefined` | Câu đọc cho screen reader: "12 đơn chờ duyệt" |

Không có output.

## 4. Variants & sizes
| Tone (tag) | Dùng khi | Không dùng khi |
|------------|----------|----------------|
| `neutral` | Phân loại, trạng thái chưa bắt đầu ("Nháp") | |
| `info` | Đang xử lý, thông tin ("Đang xét duyệt") | |
| `success` | Hoàn tất tốt ("Đã duyệt", "Đang làm việc") | |
| `warning` | Cần chú ý, sắp hết hạn ("Chờ bổ sung") | |
| `danger` | Lỗi, bị từ chối, quá hạn ("Từ chối") | Chỉ để gây chú ý |
| `brand` | Nhấn mạnh theo thương hiệu ("Mới") | Mang nghĩa trạng thái (dùng status tone) |

Nghĩa của tone status không đổi theo sản phẩm (brand chỉ override `brand`).

| Size (tag) | Chiều cao tối thiểu | Padding ngang |
|------------|---------------------|---------------|
| `md` | 24px (`size.icon.lg`) | `space.inset.sm` |
| `sm` | 20px (`size.icon.md`) | `space.inset.xs` |

| Tone (badge) | Dùng khi |
|--------------|----------|
| `danger` | Mặc định: việc cần xử lý, thông báo chưa đọc |
| `neutral` | Số đếm thông tin (số mục trong tab) |
| `brand` | Số đếm nhấn mạnh theo thương hiệu |

Badge cao 20px (`size.icon.md`); chấm `dot` 8px.

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | — (không tương tác) | — | — | — | — | — | — (dùng `tone="danger"`) | — | Badge không có `value` vẫn render viên rỗng: không dùng; ẩn badge khi đếm bằng 0 |

## 6. Keyboard & ARIA
APG pattern: không áp dụng.

| Phím | Hành vi |
|------|---------|
| — | Tag và badge không nhận focus |

- Không gắn `role`. Chấm của tag `aria-hidden="true"`; icon của tag là trang trí (`nxt-icon` không có `label`). Nhãn chữ của tag là thông tin, nên trạng thái không chỉ truyền bằng màu (WCAG 1.4.1).
- Badge có `label`: số hiển thị `aria-hidden="true"`, `label` nằm trong `span.nxt-visually-hidden`. Không có `label`: screen reader đọc số trần.
- Badge không tự thông báo khi số thay đổi (không có live region).
- Forced colors: tag và badge có viền `CanvasText`.

## 7. Tokens
`packages/tokens/src/component/tag.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `neutral-bg / -text / -dot` | `color.bg.muted`, `color.text.default`, `color.icon.subtle` |
| `info-bg / -text / -dot` | `color.bg.info-subtle`, `color.text.info`, `color.icon.info` |
| `success-bg / -text / -dot` | `color.bg.success-subtle`, `color.text.success`, `color.icon.success` |
| `warning-bg / -text / -dot` | `color.bg.warning-subtle`, `color.text.warning`, `color.icon.warning` |
| `danger-bg / -text / -dot` | `color.bg.danger-subtle`, `color.text.danger`, `color.icon.danger` |
| `brand-bg / -text / -dot` | `color.bg.primary-subtle`, `color.text.link`, `color.icon.primary` |
| `radius` | `radius.pill` |
| `height`, `height-sm` | `size.icon.lg`, `size.icon.md` |

`packages/tokens/src/component/badge.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `bg`, `text` | `color.bg.danger`, `color.text.on-danger` |
| `neutral-bg`, `neutral-text` | `color.bg.muted`, `color.text.default` |
| `brand-bg`, `brand-text` | `color.bg.primary`, `color.text.on-primary` |
| `radius` | `radius.pill` |
| `height` | `size.icon.md` |

Dùng thẳng semantic: `space.gap.xs`, `space.inset.{xs,sm}`, `size.icon.sm`, `radius.pill`, `typography.label-sm`.

## 8. Density, responsive, i18n
- Chiều cao tag và badge dựa trên `size.icon.*` nên **không** đổi theo density; padding ngang theo density.
- Tag không xuống dòng (`white-space: nowrap`), tối đa bằng bề rộng cha; nhãn dài bị cắt "…".
- Badge dùng `tabular-nums` để số không nhảy bề rộng.
- Tiếng Việt: `label-sm` (12px / 16px) đủ chỗ cho dấu chồng.

## 9. Content guidelines
- Nhãn tag 1–3 từ, sentence case: "Chờ duyệt", "Đã duyệt", "Từ chối". Không viết hoa toàn bộ.
- Cùng một trạng thái dùng cùng một tone và cùng một chữ ở mọi màn hình.
- Trạng thái quy trình dùng `dot`; phân loại không dùng `dot`.
- `label` của badge là câu đầy đủ có đơn vị: "12 đơn chờ duyệt", "3 thông báo chưa đọc".

## 10. Acceptance (Definition of Done)
- [ ] Mọi tone và size ở §4 (tag có chấm, có icon; badge số, "99+", chấm) có trong docs example
- [ ] Unit test (chưa có)
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/tag.css:44`: nhãn tag bị cắt "…" nhưng không có tooltip hay `title`, trái principles §2.7 (nội dung bị cắt phải xem được đầy đủ).
- `src/tag.ts:70`: `display()` không định dạng số theo locale `vi` (khi `max` > 999 sẽ hiện "1250", không phải "1.250"); `value` rỗng vẫn render viên badge rỗng.
- `src/tag.css:38`, `src/tag.css:71`: kích thước chấm dùng primitive `--nxt-space-1-5` / `--nxt-space-2` thay vì token kích thước.

### Đã xử lý (2026-10-19)
- Cảnh báo dev khi badge `dot` không có `label` và không nằm trong phần tử đã có `aria-label`/`aria-labelledby`.
- Đã thêm hai cặp `text.link`/`bg.primary-subtle` và `text.default`/`bg.muted` vào `contrastPairs` (đạt ở mọi ngữ cảnh).

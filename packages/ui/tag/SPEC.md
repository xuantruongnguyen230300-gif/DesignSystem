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
| 4 | Nhãn `.nxt-tag__label` | ✓ | Nội dung chiếu vào; quá dài thì cắt bằng dấu "…" (chỉ bằng CSS, chữ đầy đủ vẫn nằm trong DOM) và có tooltip chữ đầy đủ khi rê chuột, **chỉ khi** thật sự bị cắt. `wrap`: xuống dòng, không cắt |

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
| `nxt-tag` input | `wrap` | `boolean` | `false` | Nhãn dài xuống dòng trong bề rộng của cha thay vì bị cắt "…"; bo góc đổi sang `radius-wrap`; phản ánh ra `data-wrap` |
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
| ✓ | — (không tương tác). Ngoại lệ: nhãn đang bị cắt thì rê chuột lên nhãn hiện tooltip chữ đầy đủ | — (không nhận focus) | — | — | — | — | — (dùng `tone="danger"`) | — | Badge không có `value` vẫn render viên rỗng: không dùng; ẩn badge khi đếm bằng 0 |

## 6. Keyboard & ARIA
APG pattern: không áp dụng.

| Phím | Hành vi |
|------|---------|
| — | Tag và badge không nhận focus |

- Không gắn `role`. Chấm của tag `aria-hidden="true"`; icon của tag là trang trí (`nxt-icon` không có `label`). Nhãn chữ của tag là thông tin, nên trạng thái không chỉ truyền bằng màu (WCAG 1.4.1).
- Badge có `label`: số hiển thị `aria-hidden="true"`, `label` nằm trong `span.nxt-visually-hidden`. Không có `label`: screen reader đọc số trần.
- Badge không tự thông báo khi số thay đổi (không có live region).
- Forced colors: tag và badge có viền `CanvasText`.

### Nhãn dài: quyết định (2026-10-19)
Nguyên tắc (principles §2): nội dung bị cắt phải xem được đầy đủ. Tag có hai cách, theo ngữ cảnh:

| Ngữ cảnh | Cách | Ai xem được chữ đầy đủ |
|----------|------|------------------------|
| Dày, một dòng: ô bảng, hàng danh sách, thanh công cụ | Mặc định: cắt "…" + tooltip khi bị cắt | Screen reader: luôn (chữ đầy đủ trong DOM). Chuột: tooltip. Bàn phím, cảm ứng: ở màn chi tiết của bản ghi |
| Chữ đầy đủ là thông tin cần để làm việc: trang chi tiết, drawer, card, `nxt-descriptions` | `wrap` | Mọi người, không cần tương tác |

- **Tooltip chỉ khi thật sự bị cắt.** Tag đo `scrollWidth > clientWidth` của nhãn lúc con trỏ vào; không bị cắt thì không có tooltip (tooltip lặp lại chữ đang hiện chỉ gây nhiễu). Dùng `@nxt/ui/tooltip` (hoverable, Escape đóng, WCAG 1.4.13).
- **Không đọc lặp.** Chữ tooltip trùng tên truy cập của nhãn, nên tooltip không gắn `aria-describedby`; screen reader đọc chữ trong DOM đúng một lần.
- **Tag không thành điểm dừng Tab.** Bảng 50 hàng có cột trạng thái sẽ thêm 50 điểm dừng Tab chỉ để đọc chữ; trái WCAG 2.4.3 về thứ tự focus có nghĩa và làm chậm người dùng bàn phím. Tooltip theo focus chỉ dành cho phần tử tương tác (nút, link, chip bộ lọc `nxt-filter-chips` đã có nhãn riêng); `nxt-tag` không tương tác nên không có.
- **Bù cho bàn phím và cảm ứng**: (1) nhãn 1–3 từ (§9) nên hiếm khi bị cắt; (2) chỉ để tag bị cắt ở nơi giá trị đầy đủ có ở chỗ khác trên đường đi bàn phím (màn chi tiết mở từ hàng); (3) ở màn chi tiết dùng `wrap`.
- `wrap` dùng bề rộng tối đa là bề rộng của cha (`max-inline-size: 100%`, như mặc định), xuống dòng ở mọi vị trí cần (`overflow-wrap: anywhere`), bo góc `radius-wrap` (= `radius.control`) vì bo viên thuốc làm chữ dòng đầu và dòng cuối lòi ra khỏi nền.

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
| `radius-wrap` | `radius.control` (tag `wrap` nhiều dòng) |

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
- Tag không xuống dòng (`white-space: nowrap`), tối đa bằng bề rộng cha; nhãn dài bị cắt "…" và có tooltip khi bị cắt. `wrap`: xuống dòng, không cắt, mỗi dòng thêm `typography.label-sm` (16px) chiều cao.
- Badge dùng `tabular-nums` để số không nhảy bề rộng.
- Tiếng Việt: `label-sm` (12px / 16px) đủ chỗ cho dấu chồng.

## 9. Content guidelines
- Nhãn tag 1–3 từ, sentence case: "Chờ duyệt", "Đã duyệt", "Từ chối". Không viết hoa toàn bộ.
- Cùng một trạng thái dùng cùng một tone và cùng một chữ ở mọi màn hình.
- Trạng thái quy trình dùng `dot`; phân loại không dùng `dot`.
- `label` của badge là câu đầy đủ có đơn vị: "12 đơn chờ duyệt", "3 thông báo chưa đọc".

## 10. Acceptance (Definition of Done)
- [ ] Mọi tone và size ở §4 (tag có chấm, có icon; badge số, "99+", chấm) có trong docs example
- [x] Unit test (tag): tone/size/wrap ra `data-*`, chấm và icon `aria-hidden`, tooltip chỉ hiện khi nhãn bị cắt, không gắn `aria-describedby`, không thêm `tabindex`, `wrap` không có tooltip
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/tag.ts:70`: `display()` không định dạng số theo locale `vi` (khi `max` > 999 sẽ hiện "1250", không phải "1.250"); `value` rỗng vẫn render viên badge rỗng.
- `src/tag.css:38`, `src/tag.css:71`: kích thước chấm dùng primitive `--nxt-space-1-5` / `--nxt-space-2` thay vì token kích thước.

### Đã xử lý (2026-10-19)
- Nhãn bị cắt "…" nay có tooltip chữ đầy đủ (chỉ khi bị cắt) và có `wrap` cho nơi cần thấy đủ chữ; xem §6 "Nhãn dài: quyết định".
- Cảnh báo dev khi badge `dot` không có `label` và không nằm trong phần tử đã có `aria-label`/`aria-labelledby`.
- Đã thêm hai cặp `text.link`/`bg.primary-subtle` và `text.default`/`bg.muted` vào `contrastPairs` (đạt ở mọi ngữ cảnh).

### Bổ sung (2026-10-19)
- Nhãn dài: tooltip khi nhãn thật sự bị cắt (đo lúc rê chuột), chữ đầy đủ luôn trong DOM cho screen reader, không thêm điểm dừng Tab; input `wrap` cho nơi chữ đầy đủ là thông tin cần thiết. Lý do chọn ở §6. Phát hiện khi dựng template HRM: tên phòng ban / phạm vi áp dụng dài bị cắt trong cột hẹp mà không xem được.
- Token mới `tag.radius-wrap` (alias `radius.control`).

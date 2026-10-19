---
component: pagination
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: "none (navigation landmark + button)"
---

# Pagination: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** đi qua một danh sách dài theo trang, biết đang xem bản ghi nào trên tổng số bao nhiêu, và chọn số dòng mỗi trang.
- **Khi nào dùng:** dưới `nxt-table` hoặc danh sách có tổng số bản ghi biết trước, phân trang phía server hoặc client.
- **Khi nào KHÔNG dùng:**
  - Danh sách ngắn (vừa một trang): không hiện pagination.
  - Luồng hoạt động liên tục (feed, log): dùng "Tải thêm" hoặc cuộn ảo (`@angular/cdk/scrolling`).
  - Không biết tổng số bản ghi: component cần `total`; dùng nút "Trang trước / Trang sau" riêng.
  - Điều hướng giữa các bước của một form: dùng stepper / form nhiều bước.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | `nav.nxt-pagination` | ✓ | Landmark `navigation`, `aria-label` = `label` |
| 2 | Tóm tắt `.nxt-pagination__summary` | ✓ | "Hiển thị **1–20** trong **1.284** bản ghi"; `aria-live="polite"` |
| 3 | Chọn số dòng `select` | ✓ | "20 / trang"; nhãn ẩn "Số dòng mỗi trang"; chevron trang trí |
| 4 | Nút "Trang trước" | ✓ | Icon `chevron-left`, `aria-label` |
| 5 | Nút số trang | ✓ | Trang hiện tại có `aria-current="page"` |
| 6 | Khoảng lược `…` | — | `aria-hidden="true"` |
| 7 | Nút "Trang sau" | ✓ | Icon `chevron-right`, `aria-label` |

## 3. API (Angular)
Selector: `nxt-pagination`. Export kèm hàm thuần `nxtPageItems(page, count)`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `total` | `number` (`numberAttribute`) | (bắt buộc) | Tổng số bản ghi |
| model | `page` | `number` | `1` | Trang hiện tại, bắt đầu từ 1; two-way `[(page)]` |
| model | `pageSize` | `number` | `20` | Số dòng mỗi trang; two-way `[(pageSize)]` |
| input | `pageSizeOptions` | `number[]` | `[10, 20, 50, 100]` | Lựa chọn trong `select` |
| input | `itemLabel` | `string` | `'bản ghi'` | Danh từ của bản ghi: "nhân viên", "phiếu" |
| input | `label` | `string` | `'Phân trang'` | Tên landmark; đặt riêng khi trang có nhiều bảng |

Output: `pageChange`, `pageSizeChange` (từ `model`). Không có content slot.

Hành vi:
- Đổi `pageSize` → về trang 1.
- `total` giảm (ví dụ sau khi lọc) khiến `page` vượt số trang → tự lùi về trang cuối còn tồn tại.
- `nxtPageItems`: luôn có trang đầu, trang cuối và hai trang kề trang hiện tại; khi quá 7 trang luôn dùng đúng 7 ô (control không đổi bề rộng khi lật trang); khoảng lược không bao giờ chỉ che một trang ("1 2 3 4 5 … 20", không phải "1 … 3 4 5 … 20").

## 4. Variants & sizes
Không có variant hay size. Nút trang theo `size.control.md`:

| | comfortable | compact | spacious |
|-|-------------|---------|----------|
| Nút trang, `select` | 32px | 28px | 40px |

Khi hẹp, tóm tắt và cụm điều khiển xuống dòng (`flex-wrap`).

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ nền `surface-hover` | ✓ ring token (nút và `select`) | — (native) | ✓ trang hiện tại: nền `bg.selected` + `aria-current` | ✓ "Trang trước" ở trang 1, "Trang sau" ở trang cuối (native `disabled`) | — (chưa có) | — | — | ✓ `total = 0`: "Không có {itemLabel}" |

## 6. Keyboard & ARIA
APG pattern: không có pattern riêng; dùng landmark `navigation` và `button` native (https://www.w3.org/WAI/ARIA/apg/patterns/button/).

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Lần lượt: `select` số dòng → "Trang trước" → các nút số trang → "Trang sau"; nút `disabled` bị bỏ qua |
| Enter / Space | Kích hoạt nút đang focus (native) |
| ↑ / ↓ (trong `select`) | Đổi số dòng mỗi trang (native) |

- `nav` có `aria-label` (mặc định "Phân trang").
- Nút số trang: `aria-label="Trang {n}"`, trang hiện tại `aria-current="page"`. Icon trong nút là trang trí.
- Tóm tắt có `aria-live="polite"`: lật trang hoặc đổi số dòng sẽ được đọc lại phạm vi đang hiện.
- `select` có nhãn ẩn "Số dòng mỗi trang".

## 7. Tokens
`packages/tokens/src/component/pagination.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `text` | `color.text.subtle` |
| `item-text` | `color.text.default` |
| `item-bg-hover` | `color.bg.surface-hover` |
| `item-current-bg` | `color.bg.selected` |
| `item-current-text` | `color.text.strong` |
| `item-size` | `size.control.md` |
| `item-radius` | `radius.control` |

`select` mượn `--nxt-form-field-control-border`, `--nxt-form-field-control-bg`, `--nxt-form-field-affix-color`. Dùng thẳng: `color.text.default`, `color.text.disabled`, `size.icon.sm`, `space.gap.{sm,lg}`, `space.inset.{xs,sm,lg}`, `border-width.default`, `typography.{body-sm,label-sm}`, `focus.ring.*`.

## 8. Density, responsive, i18n
- Chiều cao nút và `select` theo density; vùng chạm tối thiểu 28px ở compact.
- Số dùng `tabular-nums` để không nhảy bề rộng. Tổng số định dạng `vi-VN` ("1.284").
- Chuỗi giao diện viết sẵn bằng tiếng Việt trong template: "Hiển thị … trong …", "Không có …", "/ trang", "Số dòng mỗi trang", "Trang trước", "Trang sau", "Trang {n}". Chỉ `itemLabel` và `label` đổi được.

## 9. Content guidelines
- `itemLabel` là danh từ số nhiều tự nhiên của đối tượng, chữ thường: "nhân viên", "đơn nghỉ phép", "phiếu lương".
- Khi trang có nhiều bảng, đặt `label` riêng: "Phân trang danh sách nhân viên".
- `pageSizeOptions` giữ 3–4 giá trị; giá trị mặc định nên nằm trong danh sách.

## 10. Acceptance (Definition of Done)
- [ ] Ít trang, nhiều trang (có `…`), `total = 0`, trang đầu/cuối có trong docs example
- [x] Unit test: `nxtPageItems` (≤ 7 trang, giữ đầu/cuối/kề, không lược một trang, luôn 7 ô), tóm tắt định dạng `vi`, `aria-current` + "Trang trước" disabled ở trang 1, đổi `pageSize` về trang 1, `total` giảm thì lùi trang, `total = 0`
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/pagination.ts:30`–`63`: chuỗi giao diện viết cứng, không đổi được cho sản phẩm cần thuật ngữ khác.
- `src/pagination.css:84`–`96`: `select` dùng component token của form-field; `src/pagination.css:22`–`23`, `:58`, `:87` dùng thẳng `--nxt-color-text-*` và primitive `--nxt-font-weight-medium`; `:30` dùng primitive `--nxt-space-1`.
- `src/pagination.ts:40`: `pageSize` không có trong `pageSizeOptions` thì `select` hiện sai giá trị (option đầu).
- Chưa có trạng thái `disabled` / `loading` cho cả control (khi đang tải trang mới).

### Đã xử lý (2026-10-19)
- Trước/sau dùng `aria-disabled`, nút đang giữ focus không làm rơi focus. Có unit test.
- Nút số trang track theo số trang, focus ở lại đúng nút. Có unit test.
- Khoảng hiển thị định dạng `vi-VN` ("1.001–1.020").

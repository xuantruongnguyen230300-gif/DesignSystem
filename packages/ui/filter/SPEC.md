---
component: filter
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: dialog (non-modal về mặt trang, modal trong panel: focus giữ trong panel cho tới khi đóng)
---

# Filter: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** thu hẹp danh sách theo nhiều tiêu chí mà toolbar vẫn gọn (chỉ có ô tìm kiếm và một nút "Bộ lọc"), luôn biết đang lọc gì và bỏ lọc được bằng một cú bấm.
- **Khi nào dùng:** mọi trang danh sách/danh mục có từ một tiêu chí lọc trở lên (trạng thái, nhóm, phòng ban, khoảng thời gian…).
- **Khi nào KHÔNG dùng:**
  - Đổi phạm vi dữ liệu mà người dùng chuyển qua lại liên tục (danh mục khác nhau, "Chờ tôi duyệt / Đã xử lý"): dùng tab phía trên toolbar.
  - Bộ lọc dài hơn khoảng 8 trường hoặc có điều kiện lồng nhau (và/hoặc): dùng drawer bộ lọc nâng cao (pattern, chưa có component riêng).

Quyết định của NXT (dựa trên Carbon, SAP Fiori, Salesforce): **mọi bộ lọc nằm trong một panel**, áp dụng bằng nút "Áp dụng". Không trộn bộ lọc áp dụng ngay trên toolbar với bộ lọc có nút áp dụng, vì người dùng không biết thay đổi nào đã có hiệu lực.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Nút "Bộ lọc" | ✓ | Icon phễu + chữ; có số tiêu chí đang áp dụng ("Bộ lọc · 2") |
| 2 | Panel | ✓ | Neo dưới nút, `role="dialog"` có tên, nền overlay |
| 3 | Tiêu đề panel | ✓ | Mặc định "Bộ lọc"; nên cụ thể: "Lọc chức danh" |
| 4 | Nội dung | ✓ | Các field do trang chiếu vào (radio, checkbox, select) |
| 5 | Footer | ✓ | "Đặt lại" (ghost, trái) · "Huỷ" · "Áp dụng" (primary) |
| 6 | Chip bộ lọc (`nxt-filter-chips`) | ✓ khi đang lọc | Dưới toolbar: mỗi tiêu chí một chip có nút bỏ, cuối hàng "Xoá bộ lọc" (không ghi "Xoá tất cả": dễ hiểu nhầm là xoá dữ liệu) |

## 3. API (Angular)
Entry: `@nxt/ui/filter`.

`nxt-filter`:

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `title` | `string` | `'Bộ lọc'` | Tiêu đề và tên truy cập của panel |
| input | `activeCount` | `number` | `0` | Số tiêu chí đang áp dụng (hiện trên nút) |
| input | `size` | `'sm' \| 'md'` | `'md'` | Cỡ nút, khớp với `nxt-search` cạnh nó |
| output | `opened` | `void` | | Panel vừa mở: trang chép bộ lọc đang áp dụng sang bản nháp |
| output | `applied` | `void` | | Bấm "Áp dụng" hoặc Enter trong panel |
| output | `reset` | `void` | | Bấm "Đặt lại": trang đưa bản nháp về mặc định (panel vẫn mở) |
| content | (default) | field | | Nội dung panel |
| method | `open()`, `close()`, `focus()` | | | |

`nxt-filter-chips`:

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `chips` | `NxtFilterChip[]` (`{ key, label }`) | `[]` | Mỗi tiêu chí đang áp dụng; `label` dạng "Nhóm: Quản lý, Hỗ trợ" |
| input | `returnFocusTo` | `{ focus(): void }` | | Nơi nhận focus khi chip cuối cùng bị bỏ (thường là `nxt-filter`) |
| output | `remove` | `string` (key) | | Bỏ một tiêu chí |
| output | `clearAll` | `void` | | Bỏ mọi tiêu chí |

`NxtFilterState<T>` (lớp signal, không bắt buộc dùng): giữ `applied` và `draft`, kèm `edit()`, `apply()`, `resetDraft()`, `set(key, value)`, `clear(key)`, `clearAll()`, `isActive(key)`, `activeCount`. So sánh với giá trị mặc định để đếm tiêu chí, nên mảng rỗng hay `''` đều là "không lọc".

## 4. Variants & sizes
Không có variant. Nút dùng `nxtButton` secondary; khi có tiêu chí đang áp dụng nút có viền và chữ màu chọn (`border.selected`) để thấy ngay danh sách đang bị thu hẹp.

## 5. States
| Rest | Hover | Focus-visible | Active (đang lọc) | Mở panel | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|-------------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ | ✓ | ✓ số đếm + màu chọn | ✓ `aria-expanded="true"` | — | — (trang hiện tiến trình) | — | — | ✓ không có chip |

## 6. Keyboard & ARIA
APG: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (áp dụng trong phạm vi panel).

| Phím | Hành vi |
|------|---------|
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên nút | Mở panel, focus vào field đầu tiên |
| <kbd>Tab</kbd> | Đi vòng trong panel |
| <kbd>Enter</kbd> trong panel | Áp dụng (panel là `<form>`) |
| <kbd>Esc</kbd>, bấm ra ngoài, "Huỷ" | Đóng, **không** áp dụng bản nháp; focus về nút |
| "Áp dụng" | Áp dụng, đóng, focus về nút |
| × trên chip | Bỏ tiêu chí; focus sang chip kế tiếp, hết chip thì về `returnFocusTo` |

- Nút: `aria-haspopup="dialog"`, `aria-expanded`; tên đọc được số tiêu chí ("Bộ lọc, đang áp dụng 2").
- Panel: `role="dialog"`, `aria-labelledby` = tiêu đề, `aria-modal="true"` (CDK Dialog), focus trap, trả focus khi đóng.
- Chip: nhóm `role="group"` tên "Bộ lọc đang áp dụng"; mỗi nút bỏ có tên "Bỏ lọc <nhãn chip>".
- Số kết quả sau khi lọc do trang thông báo (`role="status"`).

## 7. Tokens
`packages/tokens/src/component/filter.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `panel-bg`, `panel-border`, `panel-radius` | `color.bg.surface-raised`, `color.border.default`, `radius.overlay` |
| `panel-width` | `size.popover.md` (bề rộng tối đa, co theo màn hình) |
| `active-border`, `active-text` | `color.border.selected`, `color.text.link` |
| `count-bg`, `count-text` | `color.bg.primary`, `color.text.on-primary` |
| `chip-bg`, `chip-text`, `chip-border`, `chip-radius` | `color.bg.selected`, `color.text.default`, `color.border.selected`, `radius.pill` |

## 8. Density, responsive, i18n
- Panel rộng tối đa `panel-width`, không vượt quá màn hình trừ gutter; trên màn hẹp chiếm gần hết bề ngang.
- Chip xuống dòng khi hết chỗ; nhãn dài bị cắt "…" và có `title` đầy đủ.

## 9. Content guidelines
- Nút luôn ghi "Bộ lọc" (không chỉ icon): người dùng mới nhận ra ngay, người dùng quen nhìn số đếm.
- Chip ghi "Tên tiêu chí: giá trị", nhiều giá trị nối bằng dấu phẩy: "Nhóm: Quản lý, Hỗ trợ".
- Footer: "Đặt lại" (đưa panel về mặc định), "Huỷ", "Áp dụng".

## 10. Acceptance (Definition of Done)
- [x] Unit test: mở/đóng, áp dụng và huỷ, Enter áp dụng, số đếm trên nút, chip bỏ từng tiêu chí và trả focus, `NxtFilterState`
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 370/370)
- [x] `npm run ds:check` sạch
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- Lưu bộ lọc thành "chế độ xem" (saved view) và đồng bộ lên URL là việc của trang; cần pattern riêng.

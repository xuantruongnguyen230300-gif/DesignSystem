# Keyboard map theo WAI-ARIA APG (tóm tắt)

Nguồn: https://www.w3.org/WAI/ARIA/apg/patterns/. Bảng dưới là tối thiểu bắt buộc. Muốn chi tiết hơn thì mở trang pattern tương ứng.

| Pattern | Role chính | Phím bắt buộc |
|---------|-----------|---------------|
| button | `button` (native `<button>`) | `Enter`, `Space` kích hoạt |
| toggle button | `button` + `aria-pressed` | `Enter`, `Space` đảo trạng thái |
| checkbox | native `input[type=checkbox]`, `aria-checked="mixed"` cho tri-state | `Space` đảo |
| switch | `switch` + `aria-checked` | `Space` đảo (`Enter` tuỳ chọn) |
| radio-group | `radiogroup` / `radio` | `Tab` vào mục đang chọn; `↑↓←→` chuyển và chọn; roving tabindex |
| tabs | `tablist` / `tab` / `tabpanel` | `←→` chuyển tab (`↑↓` nếu dọc); `Home` / `End`; kích hoạt tự động hoặc thủ công (ghi rõ) |
| disclosure / accordion | `button` + `aria-expanded`, `aria-controls` | `Enter`, `Space`; accordion thêm `↑↓`, `Home` / `End` (tuỳ chọn) |
| menu-button / menu | `button` + `aria-haspopup="menu"`; `menu` / `menuitem` | `Enter`, `Space`, `↓` mở và focus mục đầu; `↑` mở và focus mục cuối; `Esc` đóng và trả focus; gõ ký tự để nhảy |
| listbox | `listbox` / `option`, `aria-selected`, `aria-multiselectable` | `↑↓`, `Home` / `End`; type-ahead; multi: `Shift+↑↓`, `Ctrl+A` |
| combobox (select, autocomplete) | `combobox` + `aria-expanded`, `aria-controls`, `aria-activedescendant` | `↓` mở hoặc chuyển; `Alt+↓` mở; `Enter` chọn; `Esc` đóng (lần hai xoá); focus luôn ở input |
| dialog-modal | `dialog` + `aria-modal="true"`, `aria-labelledby` | Focus trap; `Esc` đóng; mở thì focus phần tử đầu (hoặc phần tử an toàn nhất); đóng thì trả focus về trigger |
| tooltip | `tooltip`, trigger có `aria-describedby` | Hiện khi hover **và** focus; `Esc` ẩn; không chứa nội dung tương tác |
| slider | `slider` + `aria-valuemin/max/now/valuetext` | `←→↑↓` ±1 bước; `PageUp` / `PageDown` ±10%; `Home` / `End` |
| grid (bảng tương tác) | `grid` / `row` / `gridcell` | `←→↑↓` giữa ô; `Home` / `End` trong hàng; `Ctrl+Home` / `End`; `PageUp` / `PageDown`; `Enter` / `F2` vào chế độ sửa ô; một điểm Tab duy nhất |
| tree-view | `tree` / `treeitem` + `aria-expanded` | `↑↓`; `→` mở hoặc vào con; `←` đóng hoặc về cha; `Home` / `End`; `*` mở mọi nhánh cùng cấp |
| toolbar | `toolbar` | Một điểm Tab; `←→` giữa các control |
| breadcrumb | `nav` + `aria-label="Breadcrumb"`, `aria-current="page"` | Chỉ cần Tab |
| alert / status | `alert` (khẩn) / `status` (lịch sự) | Không cần phím; announce qua live region (`LiveAnnouncer`) |

**Quy tắc chung cho NXT:**
- Control phức hợp (listbox, tabs, radio-group, toolbar, grid) chỉ có **một** điểm Tab, dùng roving tabindex hoặc `aria-activedescendant`. Dùng `ListKeyManager` hoặc `@angular/aria`, không tự viết lại.
- Phím tắt toàn trang (ví dụ `Ctrl+K` mở command palette, `/` để focus ô tìm kiếm) phải ghi trong spec và tránh trùng phím tắt của trình duyệt.

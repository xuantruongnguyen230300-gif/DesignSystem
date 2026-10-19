---
component: search
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: none (native input type="search", landmark do trang quyết định)
---

# Search: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** tìm nhanh bản ghi trong một danh sách bằng vài ký tự, gõ có dấu hay không dấu đều được.
- **Khi nào dùng:** ô tìm kiếm của toolbar danh sách, ô tìm trong panel chọn (danh sách nhân viên, phòng ban), ô tìm trong thư viện (icon, mẫu).
- **Khi nào KHÔNG dùng:**
  - Tìm toàn hệ thống (trang, bản ghi gần đây, hành động): dùng command palette `Ctrl+K`.
  - Trường nhập liệu có giá trị lưu lại (mã, tên): dùng `nxt-form-field` + `nxtInput`.
  - Chọn một giá trị từ danh sách gợi ý để lưu: dùng combobox (chưa có).

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Khung | ✓ | Cùng chiều cao, viền và bo góc với ô nhập của form-field |
| 2 | Icon kính lúp | ✓ | `aria-hidden`, chỉ là gợi ý thị giác |
| 3 | `input type="search"` | ✓ | Có nhãn thật (`label`), mặc định ẩn bằng `nxt-visually-hidden` |
| 4 | Nút xoá | — | Chỉ hiện khi có nội dung; tên "Xoá nội dung tìm kiếm" |

## 3. API (Angular)
Selector: `nxt-search`. Entry: `@nxt/ui/search`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `label` | `string` | (bắt buộc) | Tên truy cập, ví dụ "Tìm chức danh" |
| input | `placeholder` | `string` | `'Tìm kiếm'` | Gợi ý ngắn: nên nói tìm theo gì ("Mã hoặc tên") |
| input | `showLabel` | `boolean` | `false` | Hiện nhãn phía trên (dùng trong form/panel) |
| input | `size` | `'sm' \| 'md'` | `'md'` | |
| input | `debounce` | `number` (ms) | `0` | `0` cho dữ liệu tại máy; `250` khi mỗi lần gõ gọi máy chủ |
| model | `value` | `string` | `''` | Nội dung ô tìm (two-way). Cập nhật sau `debounce` |
| output | `submitted` | `string` | | Nhấn Enter: dùng khi tìm phải bấm mới chạy (máy chủ chậm) |
| method | `focus()` | | | Đưa focus vào ô (ví dụ sau khi xoá bộ lọc) |

Tiện ích đi kèm (thuần TS, dùng được ở mọi nơi):
- `nxtFold(text)`: chữ thường, bỏ dấu tiếng Việt, `đ` → `d`.
- `nxtMatches(query, ...fields)`: mọi từ trong `query` đều xuất hiện trong ít nhất một field (không phân biệt dấu, thứ tự từ tuỳ ý). "ke toan tong" khớp "Kế toán tổng hợp".

## 4. Variants & sizes
| Size | Dùng khi |
|------|----------|
| `md` | Toolbar danh sách (mặc định) |
| `sm` | Panel lọc, menu, bảng nhỏ trong drawer |

Không có variant màu. Bề rộng do layout cha quyết định (trong toolbar: co giãn, tối thiểu `layout.item-min-sm`).

## 5. States
| Rest | Hover | Focus-visible | Active | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|--------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ viền đậm hơn | ✓ ring token | — | — | — (ẩn hoặc giải thích thay vì khoá) | — (trang hiện tiến trình) | — | — | ✓ placeholder, không có nút xoá |

## 6. Keyboard & ARIA
| Phím | Hành vi |
|------|---------|
| Gõ | Lọc theo `debounce` |
| <kbd>Esc</kbd> | Có nội dung: xoá nội dung, giữ focus. Không có nội dung: không chặn (để Esc đóng drawer/panel bao quanh) |
| <kbd>Enter</kbd> | Phát `submitted` |
| <kbd>Tab</kbd> | Nút xoá **không** nằm trong thứ tự Tab (`tabindex="-1"`): Esc làm cùng việc, giữ một điểm dừng Tab cho người dùng bàn phím; chuột và cảm ứng vẫn bấm được |

- `input type="search"` có `<label for>`; không thêm `role="searchbox"` (native đã có).
- Kết quả tìm được thông báo ở trang (vùng `role="status"`: "Tìm thấy 4 chức danh"), không phải trong component, vì chỉ trang biết số kết quả.
- Nút xoá trình duyệt (`::-webkit-search-cancel-button`) bị ẩn để chỉ có một nút xoá nhất quán.

## 7. Tokens
`packages/tokens/src/component/search.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `bg` | `color.bg.surface` |
| `text`, `placeholder` | `color.text.strong`, `color.text.subtle` |
| `border`, `border-hover` | `color.border.input`, `color.border.input-hover` |
| `icon` | `color.icon.subtle` |
| `radius` | `radius.control` |
| `height`, `height-sm` | `size.control.md`, `size.control.sm` |

## 8. Density, responsive, i18n
- Chiều cao theo `size.control.*`, đổi theo density. Nút xoá giữ vùng chạm ≥ 24×24.
- So khớp bỏ dấu tiếng Việt (principles §2.7): người dùng gõ không dấu trên bàn phím chưa bật bộ gõ vẫn tìm được.

## 9. Content guidelines
- Placeholder nói tìm theo gì: "Mã hoặc tên chức danh", không chỉ "Tìm kiếm" khi có chỗ.
- Nhãn (label) là động từ + đối tượng: "Tìm chức danh".

## 10. Acceptance (Definition of Done)
- [x] Unit test: nhãn, xoá bằng nút và Esc, Esc không chặn khi rỗng, `submitted`, `debounce`, `nxtFold`/`nxtMatches`
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 370/370)
- [x] `npm run ds:check` sạch
- [x] Docs page đủ mục (skill `nxt-docs-page`)

---
component: empty-state
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: "none (presentational)"
---

# Empty state: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** khi vùng dữ liệu trống, người dùng biết **vì sao** trống và **làm gì tiếp**, thay vì nhìn một bảng rỗng không lời giải thích.
- **Khi nào dùng:**
  - Lần đầu dùng: chưa có bản ghi nào, mời tạo bản ghi đầu tiên.
  - Không có kết quả: bộ lọc hoặc tìm kiếm không khớp, mời xoá bộ lọc.
  - Trong thân bảng, thẻ, tab, drawer (dùng `size="sm"` ở vùng hẹp).
- **Khi nào KHÔNG dùng:**
  - Đang tải: dùng skeleton đúng hình khối.
  - Lỗi cần xử lý (không tải được, mất kết nối): dùng inline alert có nguyên nhân và cách sửa.
  - Thông báo ngắn sau thao tác: dùng toast / thông báo trạng thái.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-empty-state` | ✓ | Cột căn giữa, `text-align: center` |
| 2 | Vòng icon `.nxt-empty-state__icon` | ✓ | `nxt-icon` 24px trong vòng tròn; `aria-hidden="true"` |
| 3 | Tiêu đề `h2` / `h3` | ✓ | Theo `headingLevel` |
| 4 | Mô tả `p` | — | Chỉ render khi có `description`; tối đa 48ch |
| 5 | Vùng hành động `[nxtEmptyActions]` | — | Ẩn (`:empty`) khi không có nội dung chiếu vào |

## 3. API (Angular)
Selector: `nxt-empty-state`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `title` | `string` | (bắt buộc) | Tiêu đề |
| input | `description` | `string` | `undefined` | Giải thích lý do và bước tiếp theo |
| input | `icon` | `NxtIconName` | `'inbox'` | Icon minh hoạ |
| input | `headingLevel` | `number` (`numberAttribute`) | `2` | `3` → `h3`; mọi giá trị khác → `h2` |
| input | `size` | `'sm' \| 'md'` | `'md'` | `sm` giảm padding dọc; phản ánh ra `data-size` |
| content | `[nxtEmptyActions]` | nút, link | | Hành động tiếp theo |

Không có output.

## 4. Variants & sizes
| Ngữ cảnh | Icon gợi ý | Hành động |
|----------|-----------|-----------|
| Lần đầu dùng | `inbox` hoặc icon của đối tượng | Nút primary "Thêm {đối tượng}" |
| Không có kết quả | `search` | Nút secondary "Xoá bộ lọc" |

| Size | Padding dọc | Padding ngang | Dùng khi |
|------|-------------|---------------|----------|
| `md` | `space.section.lg` (32 / 24 / 48px) | `space.inset.lg` | Vùng chính của trang, bảng rộng |
| `sm` | `space.section.sm` (16 / 12 / 24px) | `space.inset.lg` | Thẻ, drawer, tab, ô nhỏ |

(giá trị theo thứ tự comfortable / compact / spacious)

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | — (theo nút bên trong) | — (theo nút bên trong) | — | — | — | — (dùng skeleton) | — (dùng alert) | — | ✓ đây chính là trạng thái rỗng |

## 6. Keyboard & ARIA
APG pattern: không áp dụng.

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Chỉ các nút / link trong `[nxtEmptyActions]` nhận focus |

- Không gắn `role`. Icon `aria-hidden="true"`.
- Tiêu đề là heading thật; chọn `headingLevel` sao cho đúng cấp trong trang (WCAG 1.3.1): `2` khi nằm dưới tiêu đề trang, `3` khi nằm trong một section đã có `h2`.
- Component không tự thông báo khi xuất hiện. Khi danh sách vừa lọc xong mà trống, nơi dùng cần báo số kết quả qua live region (ví dụ `LiveAnnouncer`).

## 7. Tokens
`packages/tokens/src/component/empty-state.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `icon-bg` | `color.bg.muted` |
| `icon-color` | `color.icon.subtle` |
| `title-text` | `color.text.strong` |
| `text` | `color.text.subtle` |

Dùng thẳng semantic: `space.gap.{xs,sm}`, `space.section.{sm,lg}`, `space.inset.lg`, `size.icon.lg`, `size.control.lg` (vòng icon), `radius.pill`, `typography.heading-sm`, `typography.body-md`.

## 8. Density, responsive, i18n
- Padding và gap theo density. Vòng icon theo `size.control.lg` (40 / 32 / 48px).
- Nút trong vùng hành động tự xuống dòng (`flex-wrap`) và căn giữa khi vùng hẹp.
- Mô tả giới hạn 48ch để dễ đọc; tiếng Việt có dấu dùng line-height của `body-md` nên không bị cắt.

## 9. Content guidelines
- Tiêu đề nói thực trạng: "Chưa có nhân viên nào", "Không tìm thấy nhân viên phù hợp". Không viết "Không có dữ liệu".
- Mô tả trả lời "vì sao" và "làm gì tiếp": "Thử bỏ bớt điều kiện lọc hoặc tìm theo mã nhân viên."
- Tối đa một hành động primary. Phân biệt rõ: lần đầu dùng → "Thêm nhân viên"; không có kết quả → "Xoá bộ lọc".
- Không đổ lỗi cho người dùng ("Bạn đã lọc sai").

## 10. Acceptance (Definition of Done)
- [ ] Hai ngữ cảnh ở §4 (lần đầu dùng, không có kết quả) và hai size có trong docs example
- [ ] Unit test (chưa có)
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/empty-state.ts:13`: `headingLevel` nhận mọi số nhưng chỉ hiểu `3`; `4`, `5`… lặng lẽ thành `h2`, có thể làm sai cấu trúc heading. Nên giới hạn kiểu `2 | 3 | 4` hoặc hỗ trợ đủ.
- Chưa có cơ chế thông báo cho screen reader khi trạng thái rỗng xuất hiện sau khi lọc; đang dựa vào nơi dùng.
- Chưa có biến thể cho "không có quyền" và "lỗi tải" mà principles §2.4 yêu cầu; hiện chỉ đổi được icon và chữ.

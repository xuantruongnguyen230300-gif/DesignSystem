---
component: table
status: beta
owner: "NXT core"
updated: 2026-11-16
apg-pattern: table
---

# Table & Sort: Spec

Entry `@nxt/ui/table` gồm `table[nxtTable]` (style cho bảng native), `nxt-table-scroll` (vùng cuộn), `[nxtSort]` (giữ trạng thái sắp xếp), `th[nxtSortHeader]` (tiêu đề cột sắp xếp được), `th[nxtResizable]` (đổi độ rộng cột), `th/td[nxtRowActions]` (thao tác trên hàng), `tbody[nxtTablePlaceholder]` (hàng giữ chỗ khi đang tải), `NxtSelection` (chọn nhiều), `NxtColumnsState` + `nxt-table-columns` + `[nxtTableColumnsFor]` (tuỳ biến cột).

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** đọc, so sánh và thao tác trên nhiều bản ghi cùng lúc: danh sách nhân viên, đơn chờ duyệt, bảng lương, với hàng theo density, số căn phải và sắp xếp theo cột.
- **Khi nào dùng:** dữ liệu dạng hàng × cột, người dùng cần so sánh giá trị giữa các hàng, chọn hàng để thao tác hàng loạt, sắp xếp.
- **Mô hình:** "lưới desktop" (Theo SAP Fiori: grid table). Mỗi ô một giá trị, hàng một dòng, màn hẹp thì **cuộn ngang trong vùng cuộn** thay vì đẩy cột xuống dưới hàng (pop-in). Không ảo hoá hàng: mỗi lần chỉ nạp một trang (khoảng 10–100 hàng, tối đa ~200); dữ liệu lớn hơn thì phân trang ở máy chủ.
- **Khi nào KHÔNG dùng:**
  - Bố cục trang hoặc form nhiều cột: dùng `nxt-grid` / `nxt-stack`.
  - Lưới chỉnh sửa trực tiếp trong ô, điều hướng ô bằng phím mũi tên: cần data grid (APG grid), chưa có.
  - Vài cặp nhãn – giá trị của một bản ghi: dùng danh sách mô tả (`dl[nxtDescriptions]`).
  - Mỗi mục là một khối thông tin ít thuộc tính (hộp duyệt đơn, thông báo): danh sách.
  - Dữ liệu phân cấp (cây tổ chức): cần tree table, chưa có.
  - Nhìn tổng quan số lượng lớn: biểu đồ.
  - Dòng thời gian sự kiện: dùng `nxt-timeline`.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | `table[nxtTable]` | ✓ | Bảng native, rộng 100%, nền `table.bg` |
| 2 | `caption` hoặc `aria-label` | ✓ | Do nơi dùng đặt: tên của bảng |
| 3 | `thead th` | ✓ | Nền `header-bg` (cùng nền bảng, kiểu C chỉ khác kiểu chữ), chữ `label-sm` đậm vừa (semibold) tông `header-text`, không xuống dòng; dính đầu khi `stickyHeader` |
| 4 | `th[nxtSortHeader]` | — | Bọc nội dung trong `button.nxt-sort-header` + icon sắp xếp. Nút **cao bằng cả ô tiêu đề** (`min-block-size` = `header-height`, lề âm bằng padding của ô: bố cục không đổi) nên cả chiều cao ô là vùng bấm, không chỉ dòng chữ cao ~20px |
| 5 | `tbody tr` | ✓ | Cao `row-height`, nền hover; nền `row-bg-selected` khi `aria-selected="true"`. Nền do các ô vẽ (không phải `tr`) để hai ô đầu và cuối bo `row-radius`; hàng được tô nền ẩn đường kẻ của mình |
| 5a | Tô sáng hàng `tr[data-highlight]` | — | `danger` · `warning` · `success` · `info`: dải màu ở **đầu hàng** (`row-highlight-*`, rộng `row-indicator-width`). Chỉ là gợi ý: hàng luôn có chữ giải thích (tag, dòng phụ) |
| 5b | Hàng đang mở `tr[aria-current="true"]` | — | Hàng đang hiện ở drawer / cột chi tiết: nền `row-bg-current` (trung tính, khác nền chọn) + dải `row-current-indicator` ở đầu hàng (sau dải tô sáng nếu có) |
| 6 | Ô chọn `.nxt-table__select` | — | Cột checkbox chọn hàng (`nxt-checkbox hideLabel`), rộng cố định `size.control.md` |
| 7 | Ô số `.nxt-table__num` | — | Căn phải, `tabular-nums` (số, tiền, ngày giờ); tiêu đề sắp xếp đảo icon sang trái |
| 7a | Cột cố định `.nxt-table__sticky` | — | Trên `th` và `td` của cột chọn + cột định danh: dính mép trái khi cuộn ngang, nền theo hàng (`--_row-bg`). Khi vùng cuộn đã cuộn ngang (`nxt-table-scroll[data-scrolled]`), cột cố định cuối có vạch `sticky-divider` |
| 8 | Thao tác trên hàng `th[nxtRowActions]` + `td[nxtRowActions]` | — | Ô cuối hàng. `th` tự có nhãn ẩn "Thao tác". `td` bọc các nút trong `.nxt-row-actions__bar`. Mặc định (`reveal="hover"`, thiết bị có hover): ô **không chiếm cột**, thanh nút nổi lên ở **mép phải phần đang thấy** của hàng khi hover / focus, không phải cuộn ngang tới cuối bảng (Gmail, Outlook). `reveal="always"` hoặc thiết bị cảm ứng: cột dính mép phải, luôn hiện |
| 8b | ~~Ô hành động `.nxt-table__actions`~~ | — | **Deprecated** (2026-11-06), dùng `nxtRowActions`. Cột tĩnh ở cuối bảng, co tối thiểu, căn phải; giữ cho mã cũ, xoá ở v1 |
| 9 | Hàng giữ chỗ `tbody[nxtTablePlaceholder]` | — | Lần tải đầu: N hàng có thanh mờ `placeholder-bg` đúng chiều cao density, `aria-hidden` |
| 4a | Tay nắm đổi rộng cột `th[nxtResizable]` | — | `span.nxt-resize-handle` (`role="separator"`) thêm vào **cuối** ô tiêu đề (sau nút sắp xếp), ở mép cuối của ô. Vùng chạm rộng `resize-handle-hit` (24px), vạch thấy được ngắn hơn ô, mảnh khi nghỉ, dày và đổi màu khi hover / focus / đang kéo |
| 10 | Tuỳ biến cột `nxt-table-columns` | — | Panel: ô tìm cột, "Hiện tất cả", nút Lên / Xuống, danh sách checkbox theo thứ tự cột, "Khôi phục mặc định". Mở bằng nút "Cài đặt bảng" `[nxtTableColumnsFor]` (dialog có Huỷ / Áp dụng) |

## 3. API (Angular)
Selector: `table[nxtTable]`, `nxt-table-scroll`, `[nxtSort]`, `th[nxtSortHeader]`, `th[nxtResizable]`, `th[nxtRowActions]`, `td[nxtRowActions]`, `tbody[nxtTablePlaceholder]`, `nxt-table-columns`, `[nxtTableColumnsFor]`. Export type `NxtSortDirection` = `'asc' | 'desc' | ''`, `NxtSortState` = `{ active: string; direction: NxtSortDirection }`, `NxtRowHighlight` = `'danger' | 'warning' | 'success' | 'info'`, `NxtColumnResize`, `NxtColumnDef`, `NxtColumnsValue`, `NxtTableColumnsLabels`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxtTable` input | `stickyHeader` | `boolean` | `false` | Hàng tiêu đề dính đầu khi cuộn trong container; phản ánh ra `data-sticky` |
| `nxtTable` input | `loading` | `boolean` | `false` | Đang tải: `aria-busy="true"`, `data-loading`; hàng đang có mờ đi và không bấm được (tải lại khi đổi trang / sắp xếp / lọc, bố cục không nhảy). Lần tải đầu đặt `tbody[nxtTablePlaceholder]` |
| `nxtTable` content | (default) | `caption`, `thead`, `tbody`, `tfoot` | | Cấu trúc bảng native |
| `tr` attribute | `data-highlight` | `NxtRowHighlight` | | Do nơi dùng đặt: `[attr.data-highlight]="r.expiring ? 'warning' : null"` |
| `tr` attribute | `aria-current` | `'true'` | | Do nơi dùng đặt trên hàng đang mở ở drawer / cột chi tiết. Một hàng mỗi bảng |
| class | `.nxt-table__sticky` | | | Trên `th` + `td` của cột cần cố định (cột chọn, cột định danh), theo thứ tự từ trái. Tối đa: cột chọn + **một** cột |
| `nxt-table-scroll` input | `label` | `string` | (bắt buộc) | Tên vùng cuộn (`role="region"`, `aria-label`); host có `tabindex="0"` để cuộn bằng bàn phím |
| `nxt-table-scroll` input | `fill` | `boolean` | `false` | Lấp đầy chiều cao còn lại của cha dạng cột (`nxtFill`, `nxt-card fill`), không thấp hơn `table.scroll-min-height`; thanh cuộn dọc và ngang nằm trong lưới |
| `nxt-table-scroll` host | `data-scrolled` | | | Có khi đã cuộn ngang khỏi mép đầu: hiện vạch phân cách sau cột cố định |
| `nxtSort` model | `nxtSort` | `NxtSortState` | `{ active: '', direction: '' }` | Two-way `[(nxtSort)]="sort"`. Nên khởi tạo bằng thứ tự mặc định có nghĩa (thường cột định danh tăng dần) để icon và `aria-sort` cho biết bảng đang theo thứ tự nào |
| `nxtSort` method | `toggle(key)` | `(key: string) => void` | | Không sắp xếp → tăng dần → giảm dần → không sắp xếp; đổi sang cột khác bắt đầu từ tăng dần. "Không sắp xếp" = thứ tự mặc định của nơi dùng |
| `nxtSortHeader` input | `nxtSortHeader` | `string` | (bắt buộc) | Khoá của cột |
| `nxtSortHeader` content | (default) | text | | Tên cột |
| `nxtResizable` input | `nxtResizable` | `string` | `''` | Khoá cột (`nxtResizable="dept"`). Thuộc tính trần `nxtResizable` cũng được: cột đổi rộng được nhưng không có khoá để lưu |
| `nxtResizable` input | `nxtResizeColumns` | `NxtColumnsState` | | Lưu độ rộng vào `state.value().widths` và lấy độ rộng từ đó (chế độ xem đã lưu, "Khôi phục mặc định"). Cần `nxtResizable` có khoá và khoá có trong `NxtColumnDef` |
| `nxtResizable` input | `nxtResizeMin` / `nxtResizeMax` | `number` (px) | token `resize-min` / `resize-max` | Hẹp nhất / rộng nhất của cột. Ghi ra `min-inline-size` / `max-inline-size` của `th` |
| `nxtResizable` output | `nxtResized` | `NxtColumnResize` = `{ key: string; width: number \| null }` | | Phát **một lần** khi người dùng chọn xong độ rộng (thả chuột, mỗi lần nhấn phím) hoặc về mặc định (`width: null`). Không phát khi đang kéo. Dùng để tự lưu khi không có `NxtColumnsState` |
| `nxtRowActions` input | `reveal` | `'hover' \| 'always'` | `'hover'` | `hover`: không chiếm cột, hiện ở mép phải phần đang thấy khi hover hàng, khi focus nằm trong hàng, khi menu mở từ hàng đang mở; thiết bị không có hover thì như `always`. `always`: cột dính mép phải vùng cuộn, luôn hiện. Phản ánh ra `data-reveal` |
| `nxtRowActions` input | `label` | `string` | `'Thao tác'` | Chỉ trên `th`: tên cột (ẩn, cho screen reader) |
| `nxtRowActions` content | (default) | nút icon, menu | | Chỉ trên `td`: các nút thao tác của hàng |
| `nxtTablePlaceholder` input | `columns` | `number` | (bắt buộc) | Số ô mỗi hàng giữ chỗ (bằng số cột đang hiện) |
| `nxtTablePlaceholder` input | `rows` | `number` | `5` | Số hàng giữ chỗ (thường bằng số dòng/trang, tối đa 10) |
| `nxt-table-columns` input | `state` | `NxtColumnsState` | (bắt buộc) | Panel sửa **bản nháp** (`state.draft`); nơi mở panel gọi `state.edit()` trước, `state.apply()` khi người dùng bấm Áp dụng |
| `nxt-table-columns` input | `labels` | `Partial<NxtTableColumnsLabels>` | tiếng Việt | Mọi chuỗi hiển thị (ngx-translate ghi đè được) |
| `nxtTableColumnsFor` input | `nxtTableColumnsFor` | `NxtColumnsState` | (bắt buộc) | Trên nút "Cài đặt bảng": bấm thì mở dialog chứa `nxt-table-columns`, footer Huỷ / Áp dụng; đóng thì focus về nút |
| `nxtTableColumnsFor` input | `nxtTableColumnsLabels` | `Partial<NxtTableColumnsLabels>` | tiếng Việt | Chuỗi của dialog và panel |
| `nxtTableColumnsFor` output | `nxtTableColumnsApplied` | `NxtColumnsValue` | | Sau khi Áp dụng (lưu theo người dùng nếu cần) |

`NxtSelection<K>` (lớp signal, không phụ thuộc DOM): `selected`, `count`, `has(key)`, `select(key, checked, { range, order })` (Shift: áp trạng thái mới cho cả dải từ hàng vừa chọn tới hàng này, như Gmail / Windows Explorer), `setMany(keys, checked)`, `allSelected(keys)`, `someSelected(keys)`, `retain(keys)` (trả về số khoá đã bỏ), `clear()`. Dùng với `nxt-checkbox (toggled)` (có `shiftKey`).

`NxtColumnsState` (lớp signal, không phụ thuộc DOM), khởi tạo `new NxtColumnsState(defs: NxtColumnDef[])`:
- `NxtColumnDef` = `{ key: string; label: string; locked?: boolean; hidden?: boolean }`. `locked`: cột định danh, luôn hiện, luôn đứng đầu, không ẩn và không dời được. `hidden`: ẩn trong mặc định.
- `NxtColumnsValue` = `{ order: string[]; hidden: string[]; widths?: Record<string, number> }` (thứ tự mọi cột, kể cả cột ẩn; tập cột ẩn; độ rộng px của các cột người dùng đã đổi, khoá không có = rộng tự nhiên). `widths` là **tuỳ chọn** và không có khoá nào khi không cột nào có độ rộng: giá trị cũ `{ order, hidden }` vẫn hợp lệ và chế độ xem đã lưu không đổi. Đây là phần lưu vào chế độ xem (`@nxt/ui/view-manager`).
- Đọc: `defs`, `defaults`, `value` (đã áp dụng), `widths` (signal, độ rộng đã đặt), `width(key)`, `visible` (định nghĩa cột đang hiện, đúng thứ tự), `visibleKeys`, `isVisible(key)`, `modified` (khác mặc định, tính cả `widths`), `draft`, `draftColumns` (cho panel: mọi cột theo thứ tự nháp + cờ hiện/khoá).
- Ghi: `set(value)` (chuẩn hoá: bỏ khoá lạ, thêm cột thiếu theo vị trí mặc định, cột khoá luôn hiện và đứng đầu; `widths` bỏ khoá lạ và số không dùng được, làm tròn), `reset()` (kể cả độ rộng), `setWidth(key, px | null)` (áp dụng **ngay**, không qua bản nháp: đổi rộng là thao tác trực tiếp; `null` về rộng tự nhiên; khoá lạ và số ≤ 0 / không hữu hạn bị bỏ qua), `resetWidths()` (chỉ độ rộng), `edit()` (nháp = đã áp dụng), `toggle(key, visible)`, `setAll(visible)`, `move(key, -1 | 1)` (trả về `false` khi không dời được), `resetDraft()` (cũng bỏ độ rộng khi `apply()`), `apply()`.

Output: `nxtSortChange` (từ `model`). `nxtSortHeader` phải nằm trong một phần tử có `[nxtSort]`. Component **không** tự sắp xếp, lọc hay phân trang dữ liệu, và không tự render cột theo `NxtColumnsState`: nơi dùng lặp `columns.visible()` trong `thead` và `tbody` (`@switch` theo `key`), sắp xếp theo `NxtSortState` (chuỗi tiếng Việt dùng `Intl.Collator('vi')`) và ghép với `nxt-pagination`.

## 4. Variants & sizes
Không có variant thị giác. Chiều cao theo density:

| | comfortable | compact | spacious |
|-|-------------|---------|----------|
| Hàng (`size.row.md`) | 40px | 32px | 48px |
| Tiêu đề (`size.row.sm`) | 32px | 28px | 40px |
| Dải tô sáng / hàng đang mở (`space.inset.xs`) | 4px | 2px | theo density |

Mật độ Gọn chỉ dành cho chuột và bàn phím: trên thiết bị cảm ứng dùng tối thiểu comfortable (vùng chạm).

| Cách dùng | Cấu hình |
|-----------|----------|
| Bảng cơ bản | `table[nxtTable]` |
| Sắp xếp | `[(nxtSort)]` trên `table` + `th[nxtSortHeader]` |
| Tiêu đề dính | `stickyHeader`, đặt bảng trong `nxt-table-scroll` |
| Chọn hàng | Cột `.nxt-table__select` với `nxt-checkbox`, `tr[aria-selected]` |
| Cố định cột định danh | `.nxt-table__sticky` trên cột chọn và cột tên (cả `th` và `td`) |
| Tô sáng hàng | `tr[data-highlight="warning"]` + chữ giải thích trong hàng |
| Hàng đang mở | `tr[aria-current="true"]` khi drawer chi tiết của hàng đang mở |
| Thao tác trên hàng | `<th scope="col" nxtRowActions></th>` + `<td nxtRowActions>` chứa nút icon (`size="sm"`, `variant="ghost"`) và menu ⋯ |
| Thao tác luôn hiện | `reveal="always"` trên cả `th` và `td` |
| Đang tải | `loading` trên `table`; lần đầu thêm `<tbody nxtTablePlaceholder [columns]="n">` thay cho `tbody` dữ liệu |
| Tuỳ biến cột | `NxtColumnsState` + nút icon `adjustments` có `[nxtTableColumnsFor]` ở cuối nhóm công cụ của toolbar |
| Đổi độ rộng cột | `nxtResizable="<khoá>"` trên từng `th` cần đổi (kèm `[nxtResizeColumns]="columns"` để lưu). Chọn cột nội dung ngắn, đừng đặt trên cột chọn và cột thao tác |

**Chọn `reveal`** (mặc định giữ `hover` theo yêu cầu chủ sản phẩm):

| `reveal` | Dùng khi | Không dùng khi |
|----------|----------|----------------|
| `hover` (mặc định) | Danh mục, danh sách dày dữ liệu cho người dùng thường xuyên; thao tác trên hàng là **phụ** (việc chính là mở chi tiết) | Thao tác trên hàng là việc chính; người dùng không thường xuyên |
| `always` | Bảng "việc cần xử lý" (gia hạn hợp đồng, duyệt, đơn của tôi), bảng ngắn, người dùng không thường xuyên | Bảng rộng nhiều cột mà thao tác ít dùng (cột ghim chiếm chỗ của dữ liệu) |

Theo SAP Fiori: hành động trên hàng (bảng): Fiori không ẩn hành động tới khi hover; NXT giữ hover làm mặc định nhưng bắt buộc **đường thứ hai luôn nhìn thấy** (§9).

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ nền hàng `surface-hover`; tiêu đề sắp xếp chữ đậm màu; thanh thao tác của hàng hiện (mờ dần `motion.duration.fast`) | ✓ ring token trên nút sắp xếp và control trong ô; hàng chứa focus bàn phím (`:focus-visible`) có nền `surface-hover`; focus vào trong hàng thì thanh thao tác hiện | — (bảng native, hàng không phải nút) | ✓ hàng `aria-selected="true"`; cột đang sắp xếp: chữ `text.strong`, icon `icon.primary`, `aria-sort`. Hàng đang mở `aria-current="true"`: nền `row-bg-current` + dải `row-current-indicator` | — (không disable checkbox chọn hàng: hàng không áp được thao tác thì báo sau khi thao tác) | ✓ `loading`: `aria-busy`, hàng cũ mờ và không bấm được; lần đầu `tbody[nxtTablePlaceholder]` | ✓ hàng lỗi `data-highlight="danger"` + chữ lỗi trong hàng (luôn tô sáng); lỗi cả bảng: nơi dùng đặt `nxt-alert` phía trên | — | — (nơi dùng đặt `nxt-empty-state` thay cho bảng) |

**Tay nắm đổi rộng cột** (`th[nxtResizable]`): nghỉ (vạch mảnh `resize-handle-color`), hover / focus-visible / đang kéo (vạch dày `resize-handle-width`, màu `resize-handle-color-active`; focus còn có ring `focus.ring.*` vẽ **bên trong** tay nắm, vì mép ô cũng là mép vùng cuộn). Đang kéo: `th[data-resizing]`, con trỏ `col-resize`. **Không có transition nào** (không có gì chuyển động nên không cần nhánh giảm chuyển động).

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/table/ (ví dụ sortable table). Panel tuỳ biến cột: nhóm checkbox (https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/) với nút dời theo ví dụ "listbox có thể sắp xếp lại" của APG (nút Lên / Xuống + Alt+↑/↓), trong dialog modal (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/).

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Đi qua các nút sắp xếp và control trong ô theo thứ tự DOM; bảng không phải grid nên không có điều hướng ô bằng mũi tên |
| Enter / Space | Trên nút sắp xếp: đổi chiều sắp xếp của cột (native `button`) |
| Tab tới nút thao tác của hàng | Thanh thao tác của hàng đó hiện (`focus-within`), nút nằm ở mép phải phần đang thấy nên không bị che (WCAG 2.4.11) |
| Escape (con trỏ đang ở trên hàng) | Ẩn thanh thao tác đang hiện do hover, tới khi con trỏ rời hàng (WCAG 1.4.13: đóng được mà không phải dời con trỏ). Không ẩn khi focus đang nằm trong thanh: focus không bao giờ ở trên nút vô hình |
| Tab tới control trong cột cố định | Cột cố định dính mép trái nên control không bị che khi bảng đã cuộn ngang |
| Tab tới tay nắm đổi rộng (`th[nxtResizable]`) | Tay nắm nằm **sau** nút sắp xếp của cùng ô, trước ô kế tiếp; focus hiện ring và vạch dày |
| ← / → trên tay nắm | Đổi rộng cột ±8px (→ rộng ra trong văn bản trái-sang-phải; đảo chiều trong RTL, đúng chiều mép dịch). Mỗi lần nhấn phát một `nxtResized` |
| Shift + ← / → trên tay nắm | ±32px |
| Home / End trên tay nắm | Home = hẹp nhất (`nxtResizeMin`), End = rộng nhất (`nxtResizeMax`) |
| Enter trên tay nắm, nhấp đúp tay nắm | Về độ rộng mặc định (rộng tự nhiên theo nội dung); `nxtResized` với `width: null` |
| Escape khi đang kéo | Huỷ: cột về độ rộng trước khi kéo, không phát `nxtResized`. Chỉ lắng nghe trong lúc kéo, có chặn lan lên dialog / drawer chứa bảng |
| Enter / Space trên nút "Cài đặt bảng" | Mở dialog tuỳ biến cột, focus vào ô tìm cột |
| Space trên checkbox của một cột (panel) | Hiện / ẩn cột trong bản nháp. Cột khoá: checkbox đã chọn và bị khoá, kèm chữ "Luôn hiện" |
| Alt+↑ / Alt+↓ trên checkbox của một cột | Dời cột lên / xuống một vị trí; focus ở lại cột đó; vị trí mới được đọc qua `role="status"` |
| Lên / Xuống (nút) | Dời cột đang chọn (hàng vừa focus hoặc bấm) một vị trí; tên nút gồm tên cột |
| Gõ trong ô tìm cột | Lọc danh sách cột ngay (không dấu); Esc xoá |
| Enter trên "Áp dụng" | Áp dụng thứ tự và cột hiện, đóng dialog, focus về nút "Cài đặt bảng" |
| Escape / "Huỷ" | Đóng dialog, bỏ bản nháp |

- Ngữ nghĩa bảng native (`table`, `th`, `td`), không gắn `role`. Bảng cần tên qua `caption` hoặc `aria-label`.
- `th[nxtSortHeader]`: `aria-sort="ascending" | "descending"` **chỉ** trên cột đang sắp xếp; cột khác không có `aria-sort`. Tên nút là tên cột; icon sắp xếp là trang trí.
- Hàng được chọn: `aria-selected="true"` do nơi dùng đặt trên `tr`; trạng thái chọn đọc được qua checkbox trong hàng.
- Tô sáng hàng là gợi ý thị giác, **không** mang nghĩa một mình (WCAG 1.4.1): hàng luôn có chữ nói vấn đề (tag "Sắp hết hạn", "Lỗi: thiếu mã", "Mới thêm"), lý tưởng cùng tông màu.
- Hàng đang mở: `aria-current="true"` trên `tr` (screen reader đọc "hiện tại"), cộng nền và dải: không chỉ dựa vào màu.
- Đang tải: `aria-busy="true"` trên `table`; hàng giữ chỗ `aria-hidden="true"`. Nơi dùng báo "Đang tải…" / kết quả qua `role="status"`.
- Thao tác trên hàng: `th[nxtRowActions]` là tiêu đề cột thật (nhãn ẩn "Thao tác"), nút nằm trong `td` cuối hàng theo đúng thứ tự DOM, nên screen reader và Tab đi qua như một cột bình thường. Khi ẩn, thanh chỉ trong suốt (`opacity: 0`), **không** `visibility: hidden` hay `display: none`: nút vẫn nhận Tab, và focus làm thanh hiện ra. Tên nút gồm cả đối tượng của hàng ("Sửa Kế toán thuế").
- Thanh thao tác nổi đè lên phần cuối của **chính hàng đó** (có dải mờ chuyển màu ở mép trái). WCAG 1.4.13: hover được (thanh là một phần của hàng đang hover), giữ nguyên tới khi rời hàng, đóng được bằng Escape.
- Thiết bị không có hover (`@media (hover: none)`: cảm ứng): luôn hiện dưới dạng cột dính bên phải, không đè lên dữ liệu.
- Panel cột: danh sách là `ul` có tên ("Cột của bảng"), mỗi mục một `nxt-checkbox` (tên = tên cột). Nút Lên / Xuống có tên đầy đủ ("Đưa cột Phòng ban lên") và bị khoá (`aria-disabled`) khi không dời được. Dời cột không dùng kéo thả (WCAG 2.5.7 không cần đường thay thế).
- Tay nắm đổi rộng: `role="separator"` focusable (tabindex 0) kiểu **window splitter** của APG (https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/), `aria-orientation="vertical"`, `aria-valuenow` = độ rộng hiện tại (px, làm tròn), `aria-valuemin` / `aria-valuemax` = cận của cột (giá trị luôn nằm trong khoảng, kể cả khi cột tự nhiên hẹp / rộng hơn cận), `aria-label="Đổi độ rộng cột <tên cột>"` (tên = chữ của `th`; không có chữ thì dùng khoá). Giá trị cập nhật khi focus và sau mỗi lần đổi, không cập nhật liên tục lúc kéo chuột.
- Mọi cách làm bằng con trỏ đều có đường bàn phím (WCAG 2.1.1, 2.5.7): kéo = ← / →, đúp chuột = Enter. Vùng chạm rộng ≥ 24px và cao bằng ô tiêu đề (≥ 28px, WCAG 2.5.8). Tay nắm nằm trên nút sắp xếp (vẽ sau): ô có nút sắp xếp được thêm `padding-inline-end` bằng `resize-handle-hit` để cột hẹp không giấu icon sắp xếp dưới tay nắm; cột số (`.nxt-table__num`) giữ padding để chữ tiêu đề thẳng với số bên dưới, icon sắp xếp của cột số nằm ở đầu nên không bị che.
- Click trên tay nắm không lan lên `th` / `tr` (`stopPropagation`), nên không kích hoạt hành vi click của ô tiêu đề hay hàng; kéo bằng chuột / cảm ứng / bút dùng pointer events và `setPointerCapture`, `touch-action: none` trên tay nắm để cảm ứng không cuộn trang.
- Không đặt tooltip trên cả hàng; cột chỉ có icon / avatar không có tiêu đề hiển thị thì có tên ẩn.

## 7. Tokens
`packages/tokens/src/component/table.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `bg` | `color.bg.surface` |
| `header-bg` | `color.bg.surface` |
| `header-text` | `color.text.subtle` |
| `row-border` | `color.border.default` |
| `row-bg-hover` | `color.bg.surface-hover` |
| `row-bg-selected` | `color.bg.selected` |
| `row-bg-current` | `color.bg.surface-hover` |
| `row-current-indicator` | `color.border.selected` |
| `row-highlight-danger` | `color.border.danger` |
| `row-highlight-warning` | `color.border.warning` |
| `row-highlight-success` | `color.border.success` |
| `row-highlight-info` | `color.border.info` |
| `row-indicator-width` | `space.inset.xs` |
| `sticky-divider` | `color.border.strong` |
| `placeholder-bg` | `color.bg.placeholder` |
| `row-height` | `size.row.md` |
| `header-height` | `size.row.sm` |
| `sort-icon` | `color.icon.subtle` |
| `sort-icon-active` | `color.icon.primary` |
| `scroll-min-height` | `layout.scroll-region-min` |
| `row-radius` | `radius.control` (bo hai đầu hàng được tô nền) |
| `radius` | `radius.container` (vùng chứa bảng, do card cung cấp) |
| `shadow` | `elevation.card` (vùng chứa bảng, do card cung cấp) |
| `resize-handle-hit` | `size.icon.lg` (bề rộng vùng chạm của tay nắm đổi rộng, 24px ở mọi mật độ) |
| `resize-handle-width` | `border-width.strong` (vạch khi hover / focus / đang kéo; lúc nghỉ vạch `border-width.default`) |
| `resize-handle-color` | `color.icon.subtle` (vạch lúc nghỉ, ≥ 3:1 trên `bg.surface`: có trong `contrastPairs`) |
| `resize-handle-color-active` | `color.border.selected` (vạch khi hover / focus / đang kéo, ≥ 3:1 trên `bg.surface`: có trong `contrastPairs`) |
| `resize-min` | `size.control.lg` (hẹp nhất mặc định của cột đổi rộng được) |
| `resize-max` | `layout.content-narrow` (rộng nhất mặc định) |

**Diện mạo kiểu C.** Bảng nằm trong `nxt-card` (bo `radius.container`, bóng `elevation.card`; xem card/SPEC §7): `radius` và `shadow` của bảng trỏ cùng giá trị đó để tài liệu nhất quán, còn việc cắt góc bo do card `padding="none"` làm bằng `overflow: clip`, nên header dính và thanh cuộn của `nxt-table-scroll` nằm trong góc bo mà chuỗi `nxtFill` → `nxt-card fill` → `nxt-table-scroll fill` không đổi. Giữa các hàng chỉ có đường kẻ mảnh `row-border`; hàng đang chọn, đang mở hoặc đang hover tô nền và bo hai đầu (`row-radius`), vẫn kèm checkbox và `aria-selected` nên không chỉ dựa vào màu.

Thanh thao tác trên hàng và cột cố định dùng lại `bg`, `row-bg-hover`, `row-bg-selected`, `row-bg-current` (nền theo trạng thái hàng, qua biến nội bộ `--_row-bg`).

Dùng thẳng semantic: `color.text.{default,strong,subtle}`, `space.inset.{xs,sm,md,lg}`, `space.gap.{xs,sm}`, `size.icon.{sm,lg}` (cột chọn: `space.inset.md` + `size.icon.lg`), `border-width.default`, `radius.control`, `z.sticky`, `typography.{body-md,label-sm,body-sm}`, `focus.ring.*`, `motion.duration.{fast,loop}`, `motion.ease.standard`. Cặp `text.default` / `bg.selected` và `text.subtle` / `surface-hover` có trong `contrastPairs`.

❓ Cần cặp tương phản (≥ 3:1, UI non-text) trong `contrastPairs`: `border.{danger,warning,success,info}` trên `bg.selected` và `bg.surface-hover`; `border.selected` trên `bg.surface-hover` (dải tô sáng / hàng đang mở trên hàng đã chọn, đang hover). Đã có trên `bg.surface`.

## 8. Density, responsive, i18n
- Chiều cao hàng và tiêu đề theo `size.row.*`; padding ô theo density; dải tô sáng theo `space.inset.xs`.
- Bảng rộng tối thiểu 100%; ô tiêu đề và ô dữ liệu **không xuống dòng**, nên trên màn hẹp bảng cuộn ngang trong container (`role="region"` + `aria-label` + `tabindex="0"`, `overflow: auto`) thay vì bẻ tên thành nhiều dòng. Cột chữ dài (mô tả, lý do) thêm `.nxt-table__wrap` để được xuống dòng, rộng tối thiểu `layout.item-min-sm`.
- Cột định danh cố định (`.nxt-table__sticky`) để khi cuộn ngang vẫn biết đang đọc hàng của ai.
- Số cột: toàn bề rộng khoảng **8** cột; chia đôi màn hình 3–5 cột. Cần nhiều hơn để phủ phần lớn tình huống thì cho người dùng chọn cột (`NxtColumnsState`), mặc định chỉ hiện các cột chính.
- Số liệu căn phải (`.nxt-table__num`), `tabular-nums`; tiền và ngày định dạng theo `vi`: "1.250.000 ₫", "15/10/2026".
- Sắp xếp chuỗi tiếng Việt theo collation `vi` (do nơi dùng).
- Logical properties: dải tô sáng, cột cố định và vạch phân cách đổi phía trong RTL. Tay nắm đổi rộng ở `inset-inline-end`; chiều kéo và chiều mũi tên đảo trong RTL (đọc `direction` của ô).
- **Đổi độ rộng cột** (`nxtResizable`, opt-in theo cột; bảng không dùng thì không đổi gì):
  - Chưa cột nào có độ rộng: bảng bố trí theo nội dung như mọi bảng NXT. Cột đầu tiên được đổi (kéo, phím hoặc độ rộng đã lưu): `NxtResizable` đo độ rộng tự nhiên của **mọi** cột ở hàng tiêu đề, ghi lại thành số (`--_col-w`, `--_table-w`; CSS đổi thành chiều dài), và bảng chuyển sang `table-layout: fixed` (`table[data-sized]`) rộng đúng bằng tổng. Nhờ vậy một cột đổi mà các cột khác không bị dàn lại, bảng rộng hơn vùng chứa thì cuộn ngang trong `nxt-table-scroll`, hẹp hơn thì kết thúc sớm (như bảng tính). Tiêu đề dính, cột cố định và tay nắm không đổi vị trí.
  - Đo lại (một lần, đồng bộ, giữ vị trí cuộn) khi: cột thêm / bớt (ẩn / hiện cột), độ rộng đổi từ ngoài (chế độ xem), một cột về mặc định. Khi đang kéo chỉ ghi chênh lệch (không đọc layout, không `requestAnimationFrame`, không phát sự kiện): hai dòng `style.setProperty`.
  - **Độ rộng mặc định** của cột = độ rộng tự nhiên theo nội dung khi mọi cột chưa có độ rộng (đúng lúc bảng chưa đổi).
  - **Nội dung rộng hơn cột bị cắt** (`overflow: clip` trên ô; không "…", ngoại lệ có chủ đích của "không cắt chữ" ở §9: người dùng tự chọn độ rộng, chữ vẫn đầy đủ trong DOM và screen reader đọc đủ, rộng ra là đọc được). Cột chọn (`.nxt-table__select`) và cột thao tác không bị cắt. Đặt `nxtResizeMin` đủ cho nội dung ngắn (mã, ngày), đừng cho thu nhỏ cột trạng thái dưới độ rộng của tag.
  - Chỉ đặt `nxtResizable` trên cột dữ liệu. Không đặt trên cột chọn, cột thao tác (`nxtRowActions`). Cột cố định (`.nxt-table__sticky`) đổi rộng được; cột chọn không.
  - Lưu: `[nxtResizeColumns]` → `NxtColumnsState.widths`; `nxtViewTargets` lưu `columns.value()` nên `widths` đi theo chế độ xem; `set()` / `reset()` áp lại hoặc bỏ. Không có `NxtColumnsState`: dùng `(nxtResized)`.

## 9. Content guidelines
- Tiêu đề cột là danh từ ngắn: "Họ và tên", "Phòng ban", "Ngày vào làm". Đơn vị chung cho mọi hàng ghi trong tiêu đề: "Lương cơ bản (₫)"; đơn vị khác nhau giữa các hàng thì ghi cùng số trong ô.
- **Căn lề**: trái cho chữ, mã, số điện thoại, email, trạng thái; phải cho số, tiền, ngày giờ (`.nxt-table__num`); giữa cho icon, avatar. Tiêu đề cột căn theo nội dung ô.
- **Cột định danh luôn đầu tiên** (mã, tên; `th scope="row"`), không bao giờ bị ẩn hay dời (`locked`), cố định khi cuộn ngang.
- Ô trống ghi "—" (một ký hiệu duy nhất; không "N/A", "Không có", "null"). Khi "—" mang nghĩa riêng, thêm chữ ẩn cho screen reader ("Chưa áp dụng").
- **Không cắt chữ "…"** trong ô dữ liệu: tên người dài vẫn hiện đủ (cột rộng theo nội dung, bảng cuộn ngang); văn bản tự do dài dùng `.nxt-table__wrap`. (Trước đây mục này ghi "cắt kèm tooltip", mâu thuẫn với docs; đã bỏ.)
- Hành động trong hàng tối đa 2 nút `ghost` / icon, còn lại gom vào menu "Thao tác khác" (⋯). Thanh nổi đè lên cuối hàng, nên càng ít nút càng ít che dữ liệu.
- Hành động chính của hàng (mở chi tiết) gắn vào ô tên (nút trông như chữ) và cả hàng, không chỉ ở thanh thao tác: thanh chỉ hiện khi hover.
- **Đường thứ hai luôn nhìn thấy** (bắt buộc với `reveal="hover"`): mọi thao tác trong thanh hover cũng có ở drawer / trang chi tiết của bản ghi, hoặc trên thanh hàng loạt khi chọn hàng. Không thao tác nào **chỉ** nằm trong thanh hover.
- **Lựa chọn khi kết quả đổi** (chính sách NXT): sắp xếp và chuyển trang giữ lựa chọn; khi tập kết quả đổi do **tìm kiếm, lọc hoặc đổi chế độ xem**, nơi dùng gọi `selection.retain(khoá của mọi hàng còn khớp)` để bỏ chọn các hàng bị lọc khuất, và báo qua `role="status"` khi có hàng bị bỏ ("Đã bỏ chọn 2 chức danh không còn trong kết quả"). Thao tác hàng loạt vì thế không bao giờ tác động lên hàng người dùng không còn thấy. (Theo SAP Fiori: lựa chọn trong bảng; Fiori xoá hết lựa chọn, NXT giữ phần còn khớp.)
- Không disable checkbox chọn hàng; hàng không áp được thao tác thì xử lý phần áp được và báo phần còn lại.
- Tô sáng: `danger` lỗi (hàng lỗi luôn tô sáng), `warning` cần chú ý (sắp hết hạn, quá hạn), `success` vừa hoàn tất, `info` mới thêm / vừa sửa. Mỗi hàng tối đa một tô sáng; không tô sáng để trang trí; không dùng hàng kẻ sọc.

## 10. Acceptance (Definition of Done)
- [x] Bảng cơ bản, sắp xếp, chọn hàng, tiêu đề dính, thao tác trên hàng (hover: `table-actions`; `always`: `table-actions-always`) có trong docs example
- [x] Example tô sáng hàng + hàng đang mở (`table-highlight`), tuỳ biến cột + cột cố định (`table-columns`), đang tải (`table-loading`)
- [x] Unit test `nxtRowActions`: nhãn ẩn của `th`, thanh bọc nội dung `td`, `data-reveal`, Escape ẩn khi đang hover và không ẩn khi focus nằm trong thanh, rời hàng thì hết ẩn
- [x] Unit test: giữ ngữ nghĩa bảng native và cờ sticky, nút sắp xếp nằm trong `th` + `aria-sort` chỉ trên cột đang sắp xếp, vòng none → asc → desc → none, đổi cột bắt đầu từ asc
- [x] Unit test: `loading` → `aria-busy` / `data-loading`; hàng giữ chỗ đủ hàng × cột, `aria-hidden`; `data-scrolled` của vùng cuộn; `retain` trả số khoá bỏ
- [x] Unit test `NxtColumnsState` (khoá, thứ tự, chuẩn hoá `set`, nháp / áp dụng) và `nxt-table-columns` (Space, Alt+↑/↓, nút Lên / Xuống, tìm, khôi phục, cột khoá) + `[nxtTableColumnsFor]` (Áp dụng / Huỷ)
- [ ] e2e: mẫu Danh mục ở 1024px, thanh thao tác ẩn khi chưa hover, hover thì hiện trong khung nhìn mà không cuộn ngang, Tab tới thì hiện, Escape thì ẩn (đã có từ trước; cần chạy lại sau đợt này)
- [ ] axe: 0 vi phạm ở sáng/tối/gọn cho example mới (chưa chạy `npm run test:a11y` trong đợt này)
- [x] Unit test `nxtResizable`: tay nắm `role="separator"` + `aria-orientation` + tabindex + tên "Đổi độ rộng cột …" + `aria-valuenow/min/max`; tay nắm sau nút sắp xếp và không làm đổi sắp xếp; bảng không đổi gì tới khi có độ rộng; ← / → ±8, Shift ±32, Home / End, cận min / max; kéo (từ điểm bắt đầu, kẹp cận, phát một lần khi thả); Escape và pointercancel huỷ; Enter / nhấp đúp về mặc định; RTL đảo chiều; lưu qua `NxtColumnsState` và áp lại từ ngoài
- [x] Unit test `NxtColumnsState.widths` (`setWidth`, làm tròn, khoá lạ, `set()` chuẩn hoá, `resetWidths`, `reset`, hình dạng giá trị không đổi khi không có độ rộng)
- [x] Kiểm trong Chromium (playwright-core, lab ngoài repo: `resize.ts` thật qua shim Angular tối thiểu + `table.css` và token thật; chưa phải docs app): nút sắp xếp cao bằng ô tiêu đề (36px, tiêu đề vẫn 36px + 1px viền), kéo đúng từng pixel, bảng rộng đúng tổng, Escape, phím, cuộn ngang, tay nắm nằm trên nút sắp xếp; axe (wcag2a/aa/21/22aa) 0 vi phạm sáng / tối / gọn
- [ ] e2e: kéo tay nắm trong bảng thật có `nxt-table-scroll fill` và cột cố định (chưa viết; cần `npm run build` do lead chạy)
- [x] `npm run ds:check` sạch phần table (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/table.css`: `aria-selected` trên `tr` của bảng native (không phải grid) thường không được screen reader đọc; trạng thái chọn thực tế chỉ đến từ checkbox trong hàng. Docs đã ghi: luôn có checkbox có tên.
- `nxt-pagination` chưa có `disabled` để khoá khi bảng đang tải (cần sửa ở pagination).
- Hàng giữ chỗ vẽ bằng CSS của table, cùng nền (`color.bg.placeholder`) và cùng luật chuyển động với `nxt-skeleton`: nhấp nháy theo `motion.duration.loop`, **đứng yên** khi giảm chuyển động (`prefers-reduced-motion` hoặc `data-nxt-motion="reduced"`).
- Cột cố định thứ hai tính lề trái theo bề rộng cố định của `.nxt-table__select`; chỉ hỗ trợ "cột chọn + một cột". Nhiều cột cố định hơn cần đo bề rộng (chưa làm).
- Ctrl+A chọn tất cả trên trang, sắp xếp nhiều cột, ẩn cột theo bề rộng (`data-priority`): P2, chưa làm. (Đổi rộng cột: đã làm 2026-11-16.)
- `th[nxtSortHeader]` không có `[nxtSort]` ở tổ tiên sẽ lỗi DI lúc chạy, không có thông báo rõ.
- `src/table.css`: màu chữ dùng thẳng `--nxt-color-text-*`; nút sắp xếp dùng primitive `--nxt-space-1`, `--nxt-space-0-5`.

- Đổi rộng cột: `nxtViewEqual` (`@nxt/ui/view-manager`) so `columns` theo `order` và `hidden`, **chưa so `widths`**: chỉ đổi độ rộng thì chế độ xem chưa hiện "Đã sửa" và nút Lưu vẫn khoá, dù `widths` đã nằm trong `columns.value()` và được lưu cùng chế độ xem. Cần sửa ở view-manager (owner khác).
- Đổi rộng cột: cột có nút sắp xếp ở **cột số** vẫn bị tay nắm đè lên ~16px cuối chữ tiêu đề khi cột hẹp tối thiểu (icon ở đầu nên vẫn bấm được).
- Đổi rộng cột: chưa tự cuộn khi kéo sát mép vùng cuộn; chưa có "vừa nội dung" (autofit) bằng nhấp đúp (nhấp đúp = về mặc định theo yêu cầu).
- Đổi rộng cột: cận mặc định lấy từ token `resize-min` (`size.control.lg`) và `resize-max` (`layout.content-narrow`) vì chưa có token semantic về bề rộng cột. Nếu cần chuẩn hoá: thêm `size.column.min` / `size.column.max` (xem báo cáo).

### Đã xử lý (2026-10-19)
- Focus không bị tiêu đề dính che (WCAG 2.4.11): phần tử focus trong `tbody` có `scroll-margin-block-start` bằng chiều cao tiêu đề.
- Ô dữ liệu không xuống dòng mặc định (bảng cuộn ngang trên màn hẹp); `.nxt-table__wrap` cho cột chữ dài.
- `NxtSelection` cho chọn nhiều, gồm Shift+click chọn dải và "chọn tất cả N kết quả" (`setMany`). Có unit test.
- `nxt-table-scroll` (2026-10-19): vùng cuộn dựng sẵn của bảng (tên, focus, cuộn dọc và ngang trong lưới), `fill` để lưới lấp đầy màn hình; token `table.scroll-min-height` → `layout.scroll-region-min`. Có unit test và e2e (mẫu Danh mục: trang không cuộn, chỉ lưới cuộn).

### Bổ sung (2026-11-06)
- Hàng tiêu đề nền `bg.muted` (trước là `bg.subtle`, gần như trắng nên lưới trông "không có nền") và đường kẻ hàng `border.default` (trước `border.subtle`, gần như không thấy). Có cặp tương phản `text.subtle`, `icon.subtle`, `icon.primary`, `border.input` trên `bg.muted` trong `contrastPairs`.
- **Thao tác trên hàng hiện khi hover** (`th/td[nxtRowActions]`), thay cột `.nxt-table__actions` (deprecated). Theo yêu cầu chủ sản phẩm: cột thao tác ở cuối bảng bắt người dùng cuộn ngang tới cuối mới thấy. Ô thao tác giờ không chiếm cột; thanh nút dính mép phải phần đang thấy (`position: sticky`) và nổi lên khi hover / focus / menu mở. Tham chiếu: Gmail, Outlook web (thao tác hiện khi hover hàng), Ant Design / AG Grid (cột thao tác ghim bên phải, dùng cho `reveal="always"` và cảm ứng).
- **Theo SAP Fiori (bảng, chế độ xem, tuỳ biến bảng)**: tô sáng hàng `tr[data-highlight]`; hàng đang mở `tr[aria-current]`; cột cố định `.nxt-table__sticky`; `loading` + `tbody[nxtTablePlaceholder]`; tuỳ biến cột `NxtColumnsState` / `nxt-table-columns` / `[nxtTableColumnsFor]`; luật căn lề, ô trống, không cắt chữ, ~8 cột, cột định danh đầu; đường thứ hai cho thao tác hover và hướng dẫn chọn `reveal`; chính sách lựa chọn khi kết quả lọc đổi.

### Bổ sung (2026-11-16)
- **Đổi độ rộng cột** `th[nxtResizable]` (opt-in, cộng thêm, bảng cũ không đổi): tay nắm `role="separator"` ở mép cuối ô tiêu đề, kéo bằng pointer events + `setPointerCapture`, phím ← / → ±8, Shift ±32, Home / End, Escape huỷ khi kéo, Enter / nhấp đúp về mặc định; cận `nxtResizeMin` / `nxtResizeMax`; lưu vào `NxtColumnsValue.widths` qua `[nxtResizeColumns]` (cộng thêm, tuỳ chọn, `NxtColumnsState` thêm `widths`, `width()`, `setWidth()`, `resetWidths()`) hoặc output `nxtResized`. Token: `resize-handle-hit`, `resize-handle-width`, `resize-handle-color`, `resize-handle-color-active`, `resize-min`, `resize-max`. Theo Apple HIG: bảng cho người dùng đổi rộng cột.
- **Nút sắp xếp cao bằng ô tiêu đề**: `th[nxtSortHeader] .nxt-sort-header` có `min-block-size: header-height` và lề âm bằng padding của ô (vùng bấm trước chỉ ~20px cao, dưới 24px của WCAG 2.5.8); bố cục không đổi. Ring focus vẽ vào trong nút (trước đây ra ngoài, sẽ bị vùng cuộn cắt vì nút giờ chạm mép trên của ô).

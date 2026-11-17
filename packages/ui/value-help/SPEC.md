---
component: value-help
status: beta
owner: "NXT core"
updated: 2026-11-06
apg-pattern: table (bảng native) + dialog-modal (do nơi chứa: NxtDialog, hoặc bước trong drawer)
---

# Value help: Spec

Entry `@nxt/ui/value-help` gồm `nxt-value-help`: **nội dung** chọn một hoặc nhiều mục từ danh mục lớn có nhiều thuộc tính (nhân viên > 1.000: mã, họ tên, phòng ban, chức danh): ô tìm + dòng kết quả + bảng `table[nxtTable]`. Component không tự mở lớp phủ; nơi dùng đặt nó vào `NxtDialog` (khi đứng ở trang) hoặc làm một **bước** trong drawer (khi form nằm trong drawer).

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** chọn đúng người / đối tượng khi danh sách quá lớn để cuộn và tên dễ trùng: tìm theo mã, tên, phòng ban (không phân biệt dấu), xem đủ thuộc tính để phân biệt "Nguyễn Văn An – Kế toán" với "Nguyễn Văn An – Kho hàng", rồi chọn bằng một lần bấm (một mục) hoặc tick nhiều mục rồi "Chọn".
- **Khi nào dùng:**
  - > 200 mục, hoặc cần ≥ 3 thuộc tính để nhận ra mục (nhân viên, hợp đồng, tài sản).
  - Mở từ nút "Mở danh sách đầy đủ" của [`nxt-combobox`](../combobox/SPEC.md) (`valueHelp`), hoặc từ một nút "Chọn …" / "Thêm …" cạnh danh sách đã chọn.
- **Khi nào KHÔNG dùng:**
  - ≤ 200 mục, 1–2 thuộc tính: `nxt-combobox` (gõ để lọc ngay trong ô).
  - Lọc danh sách của trang (không chọn giá trị để lưu): `nxt-search` + `nxt-filter`.
  - Cần tab, bộ lọc nâng cao theo điều kiện (khoảng, loại trừ), nút "Thêm mới" trong lúc chọn: dựng trang / drawer riêng.

Theo SAP Fiori: Select Dialog / Table Select Dialog / Value Help Dialog. NXT lấy phần dùng được cho HRM: ô tìm cơ bản luôn có và là phần tử nhận focus đầu tiên, kết quả nạp sẵn khi mở, chữ đã gõ ở ô gốc được chuyển sang ô tìm, chọn một là xong (không cần nút "Chọn"), chọn nhiều có ô check + "Đã chọn: N" + Chọn / Huỷ, mã và tên ở hai cột đầu, tối đa 4–5 cột. Không làm: tab "Định nghĩa điều kiện", cú pháp toán tử (`*a*`, `a…b`, `!(…)`), mẫu tìm kiếm, kéo giãn / kéo dời dialog.

### Quyết định: đặt ở đâu
| Trường nằm ở | Đặt `nxt-value-help` trong | Lý do |
|--------------|----------------------------|-------|
| Trang (form trang, thanh công cụ) | `NxtDialog.open()` + `nxt-dialog-layout [closable]="false"`, size `lg` | Một lớp modal; dialog không có nút "Đóng" nên ô tìm là phần tử nhận focus đầu tiên (CDK `first-tabbable`); Esc = Huỷ; đóng thì focus về nút đã mở |
| Drawer (form tạo / sửa) | **Một bước trong drawer**: tiêu đề drawer đổi thành "Chọn …", form ẩn bằng `[hidden]` (giữ nguyên dữ liệu và DOM), `nxt-value-help step` lấp thân drawer, footer đổi thành Huỷ / Chọn | Luật NXT cấm mở dialog từ trong drawer (`drawer/SPEC.md` §1, `dialog/SPEC.md` §1, principles §4 "modal chồng modal"). Bước trong drawer giữ **một** lớp modal, dùng hết chiều cao drawer cho bảng, và không phải tính vị trí như một popover lớn neo vào trường (drawer chỉ rộng 560px) |

Đã cân nhắc và loại: (b) popover lớn không modal neo vào trường — chật trong drawer, focus và Esc phức tạp, che mất form; (c) nới luật cho riêng dialog chọn — mở lại "modal chồng modal" mà principles cấm.

Trong bước: Esc khi ô tìm trống (`step`) phát `cancelled` để quay lại form, **không** đóng drawer; khi vào bước, focus vào ô tìm; khi quay lại, nơi dùng đưa focus về trường đã mở (`nxt-combobox.focus()`).

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-value-help` | ✓ | Cột dọc; trong bước drawer cao 100% thân drawer |
| 2 | Ô tìm `nxt-search` | ✓ | Phần tử tương tác đầu tiên; tìm khi gõ, trên **mọi cột** đang hiện |
| 3 | Ghi chú `hint` | — | Lọc cố định ẩn: "Chỉ hiện nhân viên đang làm việc" |
| 4 | Dòng kết quả `role="status"` | ✓ | "128 kết quả", "Hiện 200 / 1.250 kết quả. Gõ thêm để thu hẹp.", "Đang tải…" |
| 5 | "Đã chọn: N" + "Bỏ chọn tất cả" | — | Chỉ khi `multiple`; đứng yên trên bảng (không cuộn đi) |
| 6 | Vùng cuộn `nxt-table-scroll` + `table[nxtTable] stickyHeader` | ✓ | Header dính; cao cố định trong dialog (không nhảy khi lọc), lấp chỗ còn lại trong bước drawer |
| 7 | Cột chọn (ô check) | — | Chỉ khi `multiple`; ô ở header chọn / bỏ mọi kết quả đang hiện |
| 8 | Ô tên `th scope="row"` | ✓ | Cột `rowHeader`; khi chọn một là nút "Chọn <tên>" |
| 9 | Trạng thái rỗng / đang tải | — | `nxt-empty-state` (có "Xoá tìm kiếm"), hoặc hàng giữ chỗ `tbody[nxtTablePlaceholder]` |
| 10 | Footer (Huỷ / Chọn N) | ✓ | Của **nơi chứa** (`[nxtDialogFooter]` / `[nxtDrawerFooter]`), không nằm trong component |

## 3. API (Angular)
Selector: `nxt-value-help`. Generic `NxtValueHelp<T, K = string>` (kiểu bản ghi, kiểu khoá). Export type `NxtValueHelpColumn<T>`, `NxtValueHelpTexts`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `items` | `readonly T[]` | `[]` | Bản ghi: toàn bộ (`local`) hoặc kết quả máy chủ trả về (`server`) |
| input | `columns` | `readonly NxtValueHelpColumn<T>[]` | (bắt buộc) | Cột hiển thị, tối đa 4–5; mã và tên đứng đầu |
| input | `itemKey` | `(item: T) => K` | (bắt buộc) | Khoá lưu lại |
| input | `itemLabel` | `(item: T) => string` | (bắt buộc) | Tên đọc lên: "Chọn Nguyễn Văn An" |
| input | `caption` | `string` | (bắt buộc) | Tên bảng và vùng cuộn: "Nhân viên" |
| input | `multiple` | `boolean` | `false` | Chọn nhiều bằng ô check |
| model | `value` | `K \| null` | `null` | Chọn một: giá trị hiện tại (hàng có `aria-current`); đổi khi chọn |
| model | `values` | `K[]` | `[]` | Chọn nhiều: **bản nháp** lựa chọn; nơi dùng chỉ áp vào trường khi bấm "Chọn" |
| model | `query` | `string` | `''` | Chữ tìm; đặt sẵn bằng chữ người dùng đã gõ ở ô gốc |
| input | `searchMode` | `'local' \| 'server'` | `'local'` | `local`: lọc `items` bằng `nxtMatches` trên mọi cột. `server`: hiện nguyên `items`, nơi dùng tải lại khi `query` đổi |
| input | `debounce` | `number` (ms) | `0` | Độ trễ cập nhật `query` (250 khi mỗi lần gõ gọi máy chủ) |
| input | `loading` | `boolean` | `false` | Đang tải: bảng `aria-busy`, hàng giữ chỗ khi chưa có hàng nào |
| input | `total` | `number` | `undefined` | `server`: tổng số kết quả máy chủ có (để nói "Hiện 50 / 1.250") |
| input | `limit` | `number` | `200` | `local`: số hàng hiện tối đa; nhiều hơn thì nhắc gõ thêm để thu hẹp |
| input | `hint` | `string` | `undefined` | Ghi chú dưới ô tìm, ví dụ lọc cố định ẩn |
| input | `step` | `boolean` | `false` | Làm một bước trong drawer: focus ô tìm khi hiện; Esc (ô tìm trống) phát `cancelled` thay vì đóng drawer |
| input | `texts` | `Partial<NxtValueHelpTexts>` | tiếng Việt | Mọi chuỗi (i18n) |
| output | `picked` | `T` | | Chọn một: người dùng đã chọn một hàng (`value` đã đổi). Nơi chứa đóng dialog / quay lại form |
| output | `cancelled` | `void` | | Chỉ khi `step`: Esc khi ô tìm trống |
| method | `focus()` | | | Focus ô tìm |

`NxtValueHelpColumn<T>`: `{ id: string; header: string; value: (item: T) => string | number | null | undefined; numeric?: boolean; rowHeader?: boolean }`. Ô trống hiện "—". `numeric` căn phải + `tabular-nums`. Cột `rowHeader` (mặc định cột đầu) là `th scope="row"`.

`NxtValueHelpTexts`: `search` ("Tìm kiếm"), `searchPlaceholder` ("Tìm theo mọi cột"), `summary(shown, total)`, `loading` ("Đang tải…"), `selected(n)` ("Đã chọn: n"), `clearSelection` ("Bỏ chọn tất cả"), `selectAll` ("Chọn tất cả kết quả đang hiện"), `select(label)` ("Chọn <tên>", ô check), `pick(label)` ("Chọn <tên>", nút), `emptyTitle(query)`, `emptyHint`, `clearSearch` ("Xoá tìm kiếm").

## 4. Variants & sizes
| Chế độ | Dùng khi | Footer của nơi chứa |
|--------|----------|---------------------|
| Chọn một (mặc định) | Một người phê duyệt, một quản lý trực tiếp | Chỉ "Huỷ": chọn một hàng là xong |
| `multiple` | Nhiều người nhận, nhiều nhân viên áp dụng | "Huỷ" + "Chọn N <đối tượng>" (primary, khoá khi N = 0); Huỷ bỏ bản nháp |

| Nơi chứa | Cấu hình |
|----------|----------|
| Dialog | `NxtDialog.open(tpl, { size: 'lg' })`, `nxt-dialog-layout title="Chọn …" [closable]="false"` |
| Bước trong drawer | `nxt-value-help step`, tiêu đề drawer đổi, form `[hidden]` |

Không có variant màu, không có size riêng (bảng theo density).

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ kết quả nạp sẵn | ✓ hàng `row-bg-hover` (của bảng); nút tên gạch chân | ✓ ring trên ô tìm, nút tên, ô check; hàng chứa focus có nền hover | — | ✓ nhiều: ô check + `aria-selected` + nền `row-bg-selected`; một: hàng giá trị hiện tại `aria-current="true"` + nền chọn | — (danh mục chỉ chứa mục chọn được; mục không chọn được thì lọc ra ở nguồn) | ✓ `loading`: bảng `aria-busy` + mờ; chưa có hàng thì hàng giữ chỗ; dòng kết quả "Đang tải…" | — (lỗi tải: nơi dùng hiện `nxt-alert` trong thân nơi chứa) | — | ✓ `nxt-empty-state`: "Không có kết quả khớp “…”" + "Xoá tìm kiếm" |

## 6. Keyboard & ARIA
APG: https://www.w3.org/WAI/ARIA/apg/patterns/table/ (bảng native) trong https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (do nơi chứa).

| Phím | Hành vi |
|------|---------|
| (khi mở) | Focus ô tìm (dialog: CDK `first-tabbable` vì dialog không có nút "Đóng"; bước drawer: `step` tự focus) |
| Gõ | Lọc trên mọi cột, không phân biệt dấu; dòng kết quả đọc số kết quả |
| <kbd>↓</kbd> (trong ô tìm) | Tới nút / ô check của hàng đầu |
| <kbd>↓</kbd> / <kbd>↑</kbd> (trong bảng) | Hàng kế / hàng trước; ↑ ở hàng đầu về ô tìm |
| <kbd>Home</kbd> / <kbd>End</kbd> (trong bảng) | Hàng đầu / hàng cuối |
| <kbd>Enter</kbd> (trong ô tìm, chọn một) | Còn đúng một kết quả: chọn luôn |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Trên nút tên (chọn một): chọn hàng → `picked`. Trên ô check (nhiều): chọn / bỏ hàng |
| <kbd>Shift</kbd>+<kbd>Space</kbd> / Shift+bấm (nhiều) | Áp cùng trạng thái cho cả dải từ hàng bấm trước tới hàng này |
| <kbd>Esc</kbd> | Ô tìm có chữ: xoá chữ (nxt-search). Trống: dialog → đóng (= Huỷ); `step` → `cancelled` (quay lại form), không đóng drawer |
| <kbd>Tab</kbd> | Đi qua ô tìm, nút "Bỏ chọn tất cả", ô check header, các nút / ô check trong hàng, footer của nơi chứa |

- Bảng native: `table[nxtTable]` có `aria-label` = `caption`; vùng cuộn `nxt-table-scroll` có tên và nhận focus để cuộn bằng phím. Cột tên là `th scope="row"`.
- Chọn một: nút trong ô tên có tên "Chọn <tên>" (chứa chữ nhìn thấy, WCAG 2.5.3). Bấm chuột vào bất kỳ đâu trên hàng cũng chọn (tiện cho chuột), nhưng bàn phím và screen reader luôn có nút.
- Chọn nhiều: ô check từng hàng tên "Chọn <tên>", ô header "Chọn tất cả kết quả đang hiện" (có trạng thái một phần). Hàng đã chọn có `aria-selected="true"` (để tô nền; trạng thái đọc qua ô check). "Đã chọn: N" là `role="status"`.
- Dòng kết quả là `role="status"`: đọc "Hiện 200 / 1.250 kết quả. Gõ thêm để thu hẹp." khi lọc.
- ↑/↓ giữa các hàng là phím tắt **thêm** trên thứ tự Tab bình thường (bảng không phải grid). Tự viết (không dùng `FocusKeyManager`) vì phần tử nhận focus của mỗi hàng là nút hoặc ô check native nằm trong component khác; xem §11.

## 7. Tokens
`packages/tokens/src/component/value-help.tokens.json`:

| Token | Alias semantic | Ghi chú |
|-------|----------------|---------|
| `row-height` | `size.row.md` | Đơn vị chiều cao vùng bảng trong dialog (10 hàng, theo density) |
| `summary-text` | `color.text.subtle` | Dòng kết quả, ghi chú `hint` |
| `bar-bg`, `bar-text` | `color.bg.selected`, `color.text.default` | Dòng "Đã chọn: N" |
| `pick-text`, `pick-text-hover` | `color.text.link`, `color.text.link-hover` | Nút tên (chọn một) |
| `current-bg` | `color.bg.selected` | Hàng là giá trị hiện tại (chọn một) |
| `radius` | `radius.pill` | Dòng "Đã chọn: N" (viên thuốc), vòng focus của nút tên |
| `match-text` | `color.text.strong` | Đoạn khớp chữ tìm (chữ đậm hơn) |

Hàng, header dính, nền chọn: token của `table`. Dùng thẳng semantic: `space.gap.{xs,sm}`, `space.inset.{xs,sm}`, `size.icon.sm`, `typography.{caption,label-sm}`, `layout.scroll-region-min`. Cặp `text.link` / `bg.selected` (nút tên trên hàng đang chọn) đo được ≥ 5,4:1 ở mọi mode × brand nhưng chưa có trong `contrastPairs`.

## 8. Density, responsive, i18n
- Chiều cao hàng theo density (bảng); vùng bảng trong dialog = 10 × `row-height`, nên dialog không đổi chiều cao khi gõ lọc.
- Bước drawer: vùng bảng lấp chỗ còn lại, không thấp hơn `layout.scroll-region-min`.
- Màn hẹp: bảng cuộn ngang trong vùng cuộn (ô không xuống dòng), cột tên là cột thứ hai nên vẫn thấy cùng mã.
- Tìm không dấu, mọi từ khớp ở đâu cũng được (`nxtMatches`); đoạn khớp tô đậm (`nxtHighlight` của combobox). Số định dạng `vi-VN` ("1.250 kết quả").

## 9. Content guidelines
- Tiêu đề nơi chứa: "Chọn <đối tượng>" khi chọn một ("Chọn người phê duyệt"), "Chọn các <đối tượng>" khi chọn nhiều ("Chọn các nhân viên áp dụng").
- Nút xác nhận (nhiều): "Chọn 3 nhân viên", không "OK". Nút huỷ: "Huỷ".
- Cột: "Mã NV", "Họ và tên", "Phòng ban", "Chức danh". Tối đa 4–5 cột.
- Lọc cố định ẩn (chỉ nhân viên đang làm việc, cùng pháp nhân, trong phạm vi quyền) không hiện thành bộ lọc sửa được; nếu có thể gây bất ngờ thì nói trong `hint`.
- Rỗng: "Không có kết quả khớp “nguyen van z”" + "Thử tìm theo mã nhân viên, hoặc gõ ít chữ hơn."

## 10. Acceptance (Definition of Done)
- [x] Docs example: chọn một trong dialog từ combobox, tải từ máy chủ + `total` + `loading` (`value-help-dialog`), chọn nhiều trong dialog + `limit` (`value-help-multiple`), bước trong drawer (`value-help-drawer-step`)
- [x] Unit test (`src/value-help.spec.ts`): ô tìm, lọc không dấu trên mọi cột, nút tên + `picked`, Enter khi còn một kết quả, chọn nhiều + Shift + chọn tất cả + "Bỏ chọn tất cả", ↓/↑/Home/End giữa hàng, Esc trong `step`, `limit` + dòng kết quả, rỗng + "Xoá tìm kiếm", `loading`, `aria-current` (11/11 pass, 2026-11-06)
- [ ] axe: 0 vi phạm ở sáng/tối/gọn (cần `npm run build && npm run test:a11y`, phiên chính chạy; overlay chỉ mở khi tương tác nên axe theo example chỉ phủ trạng thái đóng)
- [x] `npm run ds:check` sạch (tokens + hardcoded; 2026-11-06, 810/810 cặp tương phản)
- [x] Docs page đủ mục (`apps/docs/src/content/components/value-help.md`)

## 11. Việc còn mở
- Bộ lọc theo cột (ẩn mặc định sau nút "Bộ lọc", dùng lại `nxt-filter`) và "Chỉ xem mục đã chọn": P2.
- Bảng chưa đổi thành danh sách hai dòng trên màn hẹp (đang cuộn ngang).
- ↑/↓ giữa hàng tự viết; nếu bảng có roving tabindex (một điểm dừng Tab cho cả bảng) thì đổi sang `FocusKeyManager` — cần `nxt-checkbox` cho đặt `tabindex` của ô check bên trong.
- Một service tiện dụng `NxtValueHelpDialog.open(config)` (dựng sẵn dialog + footer) để sản phẩm khỏi lặp template: cân nhắc khi CoreAndSkill dùng thật.
- Tiêu đề drawer (`nxt-drawer-layout title`) đổi theo bước, nhưng tên truy cập của drawer (`config.title`) vẫn là tên form; drawer chưa có `aria-labelledby` trỏ tới `h2` (`drawer/SPEC.md` §11).

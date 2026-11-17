---
component: view-manager
status: beta
owner: "NXT core"
updated: 2026-11-06
apg-pattern: menu-button, dialog-modal
---

# View Manager: Spec

Entry `@nxt/ui/view-manager` gồm:
- `nxt-view-manager`: nút "Chế độ xem" đặt ở hàng tiêu đề danh sách (tên chế độ xem đang dùng + "Đã sửa" khi trạng thái lệch chế độ xem đã lưu, kèm số bản ghi), menu chọn / Lưu / Lưu thành… / Quản lý…, và hai dialog "Lưu chế độ xem", "Quản lý chế độ xem".
- `NxtViews<F>`: lớp signal giữ danh sách chế độ xem, chế độ xem đang chọn, mặc định, cờ "đã sửa"; lưu qua adapter `NxtViewStore<F>` do nơi dùng cung cấp.
- Kiểu `NxtViewState<F>` (một hình dạng chung cho tìm kiếm + bộ lọc + sắp xếp + cột + số dòng/trang), hàm `nxtViewEqual`, helper `nxtViewTargets` nối với `NxtFilterState` (`@nxt/ui/filter`), `NxtSortState` và `NxtColumnsState` (`@nxt/ui/table`), adapter mẫu `NxtMemoryViewStore`.

Theo SAP Fiori: Variant Management (chế độ xem), List Report (chế độ xem cho cả trang), Table Personalization (lưu cột).

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** người dùng thường xuyên mở cùng một danh sách theo vài cách cố định ("Chức danh Khối Kinh doanh đang dùng", "Đơn nghỉ phép Phòng Nhân sự"). Không có chế độ xem, mỗi lần vào trang họ phải gõ lại tìm kiếm, chọn lại bộ lọc, sắp xếp và cột. Chế độ xem lưu toàn bộ thiết lập đó dưới một cái tên, chọn lại bằng một cú bấm, và đặt được một chế độ xem làm mặc định khi mở trang.
- **Khi nào dùng:** trang danh sách (List Report) hoặc hàng đợi việc (Worklist) mà người dùng quay lại thường xuyên với nhiều cách lọc khác nhau; bảng có tuỳ biến cột.
- **Khi nào KHÔNG dùng:**
  - Trang không có nhu cầu lưu thiết lập (danh mục ít bản ghi, mở vài lần một năm): chỉ có tiêu đề trang, không đặt nút.
  - Chuyển giữa vài phạm vi cố định mà người dùng không tự tạo thêm ("Chờ tôi duyệt / Đã xử lý"): dùng `nxt-tabs` (mỗi tab giữ trạng thái riêng).
  - Bảng con trong trang chi tiết: không cần chế độ xem.
  - Một trang có hai chế độ xem (trang + bảng): tránh. Một chế độ xem cho cả trang lưu cả bộ lọc lẫn cột.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-view-manager` | ✓ | Hàng ngang: nút + số bản ghi. Đặt ở **hàng tiêu đề danh sách**, ngay trên toolbar tìm kiếm + Bộ lọc |
| 2 | Nút `button[nxtButton] variant="ghost"` | ✓ | Chữ: tên chế độ xem đang dùng (đậm) + "Đã sửa" (chữ phụ) khi trạng thái lệch chế độ xem đã lưu + icon `chevron-down`. Tên truy cập có tiền tố ẩn "Chế độ xem: " |
| 3 | Số bản ghi | — | Khi có input `count`: "29 chức danh" (định dạng `vi-VN`), chữ phụ |
| 4 | Menu `[nxtMenu]` | ✓ | Nhóm "Chế độ xem": mỗi chế độ xem một `nxtMenuItemRadio` (đang dùng có dấu check), cạnh tên có "Mặc định" nếu là mặc định; vạch ngăn; "Lưu"; "Lưu thành chế độ xem mới…"; "Quản lý chế độ xem…" |
| 5 | Dialog "Lưu chế độ xem" | ✓ | `nxt-dialog-layout`: ô "Tên chế độ xem" (bắt buộc, không trùng), checkbox "Đặt làm mặc định khi mở trang"; Huỷ · Lưu |
| 6 | Dialog "Quản lý chế độ xem" | ✓ | Bảng: cột Mặc định (radio), Tên (ô nhập; chế độ xem chuẩn là chữ + tag "Chuẩn"), Thao tác (nút Xoá; chế độ xem chuẩn không có); Huỷ · Lưu |
| 7 | Vùng thông báo `role="status"` | ✓ | Ẩn: "Đang xem: …", "Đã lưu chế độ xem …", lỗi lưu |

## 3. API (Angular)
Selector: `nxt-view-manager`. Lớp: `NxtViews<F>`, `NxtMemoryViewStore<F>`. Hàm: `nxtViewEqual`, `nxtViewTargets`. Kiểu: `NxtViewState<F>`, `NxtSavedView<F>`, `NxtViewData<F>`, `NxtViewStore<F>`, `NxtViewsOptions<F>`, `NxtViewTargets<F>`, `NxtViewManagerLabels`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `views` | `NxtViews<F>` | (bắt buộc) | Trạng thái chế độ xem của danh sách (mỗi danh sách / tab một instance) |
| input | `count` | `number \| undefined` | `undefined` | Số bản ghi đang hiện (sau tìm kiếm, lọc); bỏ trống thì không hiện |
| input | `itemLabel` | `string` | `'bản ghi'` | Danh từ đi sau số: "29 chức danh" |
| input | `labels` | `Partial<NxtViewManagerLabels>` | tiếng Việt | Mọi chuỗi hiển thị (ngx-translate ghi đè được); `{name}` được thay bằng tên chế độ xem |

`NxtViewState<F>` = `{ query: string; filters: F; sort: NxtSortState; columns?: NxtColumnsValue; pageSize?: number }`. Không chứa trang hiện tại, lựa chọn hay tab (đó là trạng thái phiên).

`NxtSavedView<F>` = `{ id: string; name: string; state: NxtViewState<F>; standard?: boolean }`. `standard`: chế độ xem đi kèm sản phẩm, **không ghi đè, không đổi tên, không xoá**.

`NxtViewStore<F>` (adapter, nơi dùng cung cấp: máy chủ, `localStorage`…): `load(): NxtViewData<F> | null | Promise<…>`, `save(data: NxtViewData<F>): void | Promise<void>`. `NxtViewData<F>` = `{ views: NxtSavedView<F>[] /* chỉ chế độ xem người dùng tạo */; defaultId?: string | null }`. `NxtMemoryViewStore<F>` giữ trong bộ nhớ (ví dụ, test).

`new NxtViews<F>(options: NxtViewsOptions<F>)`:

| Option | Kiểu | Mặc định | Mô tả |
|--------|------|----------|-------|
| `current` | `() => NxtViewState<F>` | (bắt buộc) | Đọc trạng thái đang hiện (đọc signal: được theo dõi để tính "đã sửa") |
| `apply` | `(state: NxtViewState<F>) => void` | (bắt buộc) | Đưa một chế độ xem vào trang (tìm kiếm, bộ lọc, sắp xếp, cột, số dòng; về trang 1) |
| `store` | `NxtViewStore<F>` | không lưu | Nơi lưu chế độ xem người dùng tạo và mặc định |
| `standard` | `NxtSavedView<F>[]` | một chế độ xem "Tiêu chuẩn" = `current()` lúc khởi tạo | Chế độ xem chuẩn của sản phẩm (tự gắn `standard: true`) |
| `standardName` | `string` | `'Tiêu chuẩn'` | Tên chế độ xem chuẩn dựng tự động |

| Thành viên `NxtViews` | Kiểu | Mô tả |
|-----------------------|------|-------|
| `views` | `Signal<NxtSavedView<F>[]>` | Chuẩn trước, rồi chế độ xem người dùng theo thứ tự tạo |
| `selected` / `selectedId` | `Signal` | Chế độ xem đang dùng |
| `defaultId` | `Signal<string>` | Mặc định khi mở trang (một cái duy nhất) |
| `modified` | `Signal<boolean>` | `current()` khác trạng thái đã lưu của chế độ xem đang dùng |
| `ready` | `Promise<void>` | Đã nạp từ store (và đã áp dụng mặc định nếu khác chế độ xem chuẩn) |
| `select(id)` | `void` | Chọn và áp dụng ngay |
| `save()` | `Promise<void>` | Ghi đè chế độ xem đang dùng bằng trạng thái hiện tại; từ chối với chế độ xem chuẩn |
| `saveAs(name, { makeDefault })` | `Promise<NxtSavedView<F>>` | Tạo chế độ xem mới từ trạng thái hiện tại và chọn nó |
| `manage({ names, removed, defaultId })` | `Promise<void>` | Đổi tên, xoá, đặt mặc định một lượt (dialog Quản lý). Xoá chế độ xem đang dùng thì chuyển về mặc định (hoặc chuẩn) và áp dụng |
| `nameTaken(name, exceptId?)` | `boolean` | Tên đã có (so không phân biệt hoa thường, bỏ khoảng trắng thừa) |

`nxtViewEqual(a, b)`: so sánh hai `NxtViewState`; mảng trong `filters` so như tập hợp (thứ tự chọn checkbox không làm "đã sửa"), thứ tự cột so đúng thứ tự; `columns` / `pageSize` chỉ so khi cả hai có.

`nxtViewTargets({ query, filters, sort, columns, pageSize, page })` dựng sẵn `current` + `apply` từ `WritableSignal<string>`, `NxtFilterState<F>` (`applied` và `draft`, gộp với `defaults` để chế độ xem cũ thiếu tiêu chí mới vẫn đúng), `WritableSignal<NxtSortState>`, `NxtColumnsState` (`set()` chuẩn hoá), `WritableSignal<number>`; `page` được đặt về 1 khi áp dụng.

Không có output: mọi thay đổi đi qua `NxtViews` (nơi dùng đọc signal của nó). Sau khi áp dụng một chế độ xem, nơi dùng áp chính sách lựa chọn của bảng (`selection.retain(...)`, xem `packages/ui/table/SPEC.md` §9).

## 4. Variants & sizes
Không có variant. Nút là `nxtButton variant="ghost"` cỡ `md`; ở mật độ gọn theo kích thước nút của density.

| Trạng thái chế độ xem | Hiển thị |
|-----------------------|----------|
| Đã lưu, đang khớp | "Tiêu chuẩn ▾" |
| Đã sửa (lệch trạng thái đã lưu) | "Tiêu chuẩn · Đã sửa ▾" (chữ, không chỉ dấu "*"), tên truy cập "Chế độ xem: Tiêu chuẩn, Đã sửa" |
| Chuẩn | Không ghi đè, không đổi tên, không xoá; "Lưu" bị khoá kèm lý do (dùng "Lưu thành chế độ xem mới…") |
| Mặc định | Chữ "Mặc định" cạnh tên trong menu; radio trong dialog Quản lý |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ (nút ghost, item menu) | ✓ ring token (nút, item, ô nhập) | ✓ nút `aria-expanded="true"` khi menu mở | ✓ chế độ xem đang dùng `aria-checked="true"` | ✓ "Lưu" khoá (`aria-disabled`) với chế độ xem chuẩn hoặc khi chưa sửa gì | — (nạp từ store diễn ra trước khi người dùng mở menu; nếu chậm, nút vẫn hiện "Tiêu chuẩn") | ✓ tên trống / trùng: lỗi tại ô nhập, focus về ô; lưu thất bại: thông báo trong `role="status"` | — | — (luôn có ít nhất một chế độ xem chuẩn) |

## 6. Keyboard & ARIA
APG pattern: menu button https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/ (qua `@nxt/ui/menu`, CDK Menu) và dialog modal https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ (qua `@nxt/ui/dialog`, CDK Dialog).

| Phím | Hành vi |
|------|---------|
| Enter / Space / ↓ trên nút | Mở menu, focus mục đầu (chế độ xem đầu tiên) |
| ↑ / ↓, Home / End trong menu | Chuyển mục |
| Enter / Space trên một chế độ xem | Áp dụng ngay, đóng menu, focus về nút; "Đang xem: …" được đọc |
| Enter trên "Lưu" | Ghi đè chế độ xem đang dùng; "Đã lưu chế độ xem …" được đọc |
| Enter trên "Lưu thành…" / "Quản lý…" | Đóng menu, mở dialog; focus vào ô tên / ô đầu tiên |
| Escape (menu) | Đóng menu, focus về nút |
| Enter trong ô tên (dialog Lưu) | Lưu (form submit); tên trống / trùng thì báo lỗi tại chỗ, focus ở lại ô |
| Escape / "Huỷ" (dialog) | Đóng, không thay đổi gì; focus về nút "Chế độ xem" |
| Tab trong dialog Quản lý | Radio mặc định (một nhóm, ←/→ hoặc ↑/↓ đổi), ô tên, nút Xoá của từng hàng |

- Nút: tên truy cập = "Chế độ xem: " (ẩn) + tên + "Đã sửa" (khi có). `aria-haspopup="menu"`, `aria-expanded` do CDK Menu gắn.
- Menu: nhóm có tên "Chế độ xem" (`role="group"`), mục chế độ xem là `menuitemradio`; "Lưu" khoá là `aria-disabled` (vẫn focus được) và có lý do trong tên truy cập.
- Mở dialog từ một mục menu: dialog được mở **sau khi** menu đóng và trả focus về nút (một microtask), để CDK Dialog nhớ đúng nút làm chỗ trả focus khi dialog đóng. Đây là lý do duy nhất của `queueMicrotask` (không phải đợi render).
- Dialog Quản lý: bảng native có `caption` ẩn; radio "Đặt … làm mặc định" có tên đầy đủ; nút Xoá "Xoá chế độ xem …"; xoá một hàng chuyển focus sang nút Xoá kế tiếp (hoặc ô tên đầu tiên). Chưa lưu gì tới khi bấm "Lưu" nên "Huỷ" hoàn tác được mọi thao tác trong dialog.
- Thông báo kết quả qua `role="status"` ẩn trong component.

## 7. Tokens
`packages/tokens/src/component/view-manager.tokens.json`:

| Token | Alias semantic | Ghi chú |
|-------|----------------|---------|
| `name-text` | `color.text.strong` | Tên chế độ xem trên nút |
| `meta-text` | `color.text.subtle` | "Đã sửa", số bản ghi, "Mặc định" trong menu |

Dùng thẳng semantic: `typography.{label-md,body-sm}`, `space.gap.{xs,sm,md}`, `space.inset.*`. Màu nút, menu, dialog, bảng lấy từ component token của `button`, `menu`, `dialog`, `table`.

## 8. Density, responsive, i18n
- Kích thước theo `nxtButton` / menu / dialog của density.
- Tên chế độ xem dài ("Khối Kinh doanh · đang sử dụng · cập nhật 90 ngày"): trên nút không cắt; hàng tiêu đề danh sách cho xuống dòng (số bản ghi xuống dưới). Giới hạn tên 60 ký tự trong dialog.
- Mọi chuỗi qua `labels`; số bản ghi định dạng `Intl.NumberFormat('vi-VN')`.

## 9. Content guidelines
- Thuật ngữ trên giao diện: "chế độ xem" (không "variant", không "bộ lọc đã lưu").
- Chế độ xem chuẩn tên "Tiêu chuẩn"; sản phẩm có thể thêm chế độ xem chuẩn khác (ví dụ "Đang sử dụng").
- Tên do người dùng đặt nói phạm vi dữ liệu: "Khối Kinh doanh đang sử dụng", không "Chế độ xem 1".
- "Đã sửa" chứ không chỉ "*": người dùng không thường xuyên không biết quy ước dấu sao.
- Chế độ xem lưu: tìm kiếm, bộ lọc đã áp dụng, sắp xếp, cột hiện và thứ tự cột, số dòng/trang. Không lưu: trang hiện tại, hàng đang chọn, hàng đang mở.

## 10. Acceptance (Definition of Done)
- [x] Example: danh sách có chế độ xem + bộ lọc + cột (`view-manager-basic`); áp vào mẫu Danh mục, Quy trình duyệt, Phê duyệt
- [x] Unit test phủ keyboard map §6 (mở menu, chọn chế độ xem áp dụng ngay, Lưu khoá với chuẩn, Lưu thành… kiểm tên trống/trùng, Quản lý đổi tên/xoá/mặc định, Huỷ không đổi gì) và `NxtViews` / `nxtViewEqual` / `nxtViewTargets`
- [ ] axe: 0 vi phạm ở light/dark × 3 density (chưa chạy `npm run test:a11y` trong đợt này)
- [x] `npm run ds:check` sạch phần view-manager (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- Chế độ xem công khai / chia sẻ, yêu thích, "áp dụng tự động", ô tìm khi có hơn 10 chế độ xem (Fiori): P2/P3, chưa làm.
- Đồng bộ chế độ xem với URL (deep link): nơi dùng tự làm từ `views.selectedId` + `current()`.
- Khi có `nxt-popover` / `nxt-toast` (nhánh khác), cân nhắc dùng toast cho "Đã lưu chế độ xem" thay vì chỉ `role="status"` ẩn.

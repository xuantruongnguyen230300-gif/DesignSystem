---
component: action-bar
status: beta
owner: "NXT core"
updated: 2026-11-06
apg-pattern: không có pattern riêng (landmark `region` chứa nút native); nút thông báo theo pattern popover (dialog không modal), danh sách theo list
---

# Action bar: Spec

Entry `@nxt/ui/action-bar` gồm:
- `nxt-action-bar`: thanh dính đáy vùng nội dung chứa **hành động kết thúc** của trang sửa/tạo (Lưu, Huỷ, Gửi duyệt) và nút thông báo;
- `nxt-message-list`: danh sách thông báo nhóm theo loại (dùng trong popover của action bar, dùng riêng được);
- kiểu `NxtMessage`, `NxtMessageType`, `NxtMessageLabels` và hàm `nxtFocusMessageTarget()`.

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** trên trang sửa/tạo dài, nút Lưu/Huỷ luôn nhìn thấy dù cuộn tới đâu (cả khi page header trên topbar đã cuộn mất ở màn dưới 1024px); khi lưu có lỗi, người dùng thấy ngay **bao nhiêu** lỗi, **ở đâu**, và nhảy tới đúng trường để sửa.
- **Khi nào dùng:** trang (không phải drawer/dialog) đang ở chế độ **sửa hoặc tạo** có hành động kết thúc cho cả trang: hồ sơ nhân viên, cấu hình quy trình duyệt, form nhiều section.
- **Khi nào KHÔNG dùng:**
  - Trang chỉ xem (không có hành động kết thúc): không hiện thanh; hành động của đối tượng (Sửa, Xoá, ⋯) nằm trên [Page header](../page-header/SPEC.md).
  - Form trong drawer/dialog: dùng footer của [Drawer](../drawer/SPEC.md) / [Dialog](../dialog/SPEC.md).
  - Hành động chỉ tác động một bảng/khối: đặt trên toolbar của khối đó.
  - Thao tác hàng loạt trên hàng đã chọn: dùng thanh "Đã chọn N" của bảng.
  - Báo thành công: dùng [Toast](../toast/SPEC.md); lỗi không gắn trường khi không còn chỗ trong trang: `NxtDialog.notify()`.

Theo SAP Fiori (Footer toolbar, Action placement, Message popover): thanh chân trang luôn thấy, chỉ hiện khi có hành động kết thúc; nút thông báo ở **bên trái**, mang icon + màu của tin nặng nhất và số lượng; hành động kết thúc **căn phải**; bấm một tin thì đóng popover và đưa tới trường lỗi; khi bấm lưu mà có lỗi thì danh sách tự mở, còn lỗi lúc đang gõ thì không tự mở. NXT **giữ thứ tự nút riêng** (primary ngoài cùng bên phải, "Huỷ" không bao giờ primary), khác Fiori có chủ đích (xem pattern "Vị trí hành động").

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Thanh `.nxt-action-bar` | ✓ | `role="region"` có tên; `position: sticky` đáy vùng cuộn; viền trên, nền `surface` |
| 2 | Nút thông báo | — | Chỉ có khi `messages` không rỗng; icon + số lượng của loại nặng nhất, màu theo loại; mở popover |
| 3 | Popover thông báo | — | `nxt-popover` tiêu đề "Thông báo (N)", chứa `nxt-message-list`; mở lên trên |
| 4 | Trạng thái `[nxtActionBarStatus]` | — | Chữ phụ ngay trước nhóm nút: "Có thay đổi chưa lưu", "Đã lưu nháp lúc 10:24" |
| 5 | Nhóm nút (nội dung mặc định) | ✓ | Căn phải; thứ tự: phụ → "Huỷ" → primary cuối |

`nxt-message-list`:

| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Nhóm theo loại | ✓ | Thứ tự Lỗi → Cảnh báo → Thông tin → Thành công; nhãn nhóm "Lỗi (2)" là tên của `ul` |
| 2 | Mục có `target` | — | `button`: icon loại + tiêu đề + mô tả; bấm thì đưa tới trường |
| 3 | Mục không `target` | — | Chữ thường (tin không gắn trường, ví dụ lỗi máy chủ) |

## 3. API (Angular)
Selector: `nxt-action-bar`, `nxt-message-list`; marker `[nxtActionBarStatus]`.

```ts
export type NxtMessageType = 'error' | 'warning' | 'info' | 'success';
export interface NxtMessage {
  id: string;
  type: NxtMessageType;
  /** Câu ngắn nêu vấn đề: "Nhập ngày kết thúc hợp đồng." */
  title: string;
  /** Vị trí hoặc cách sửa: "Hợp đồng · Ngày kết thúc". */
  description?: string;
  /** Trường cần sửa: id phần tử hoặc chính phần tử. */
  target?: string | HTMLElement;
}
```

`nxt-action-bar`:

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `messages` | `NxtMessage[]` | `[]` | Thông báo của form; rỗng thì không có nút thông báo |
| input | `label` | `string` | `'Thanh thao tác'` | Tên của landmark `region`; đặt riêng khi trang có nhiều thanh |
| input | `labels` | `Partial<NxtMessageLabels>` | `{}` | Chữ của nút/popover/danh sách (i18n) |
| output | `messageSelect` | `NxtMessage` | | Người dùng chọn một tin: trang mở section/tab chứa trường nếu cần; focus vào `target` chạy **sau** lần render kế tiếp |
| method | `openMessages()` | `() => void` | | Mở danh sách thông báo; gọi sau khi bấm Lưu mà còn lỗi |
| method | `closeMessages()` | `() => void` | | |
| content | (default) | nút | | Hành động kết thúc |
| content | `[nxtActionBarStatus]` | chữ | | Trạng thái lưu |

`nxt-message-list`:

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `messages` | `NxtMessage[]` | (bắt buộc) | |
| input | `labels` | `Partial<NxtMessageLabels>` | `{}` | |
| output | `select` | `NxtMessage` | | Bấm một mục có `target` |

`NxtMessageLabels` (mặc định tiếng Việt):

| Khoá | Mặc định | Dùng ở |
|------|----------|--------|
| `title` | `'Thông báo'` | Tiêu đề popover, đầu tên truy cập của nút |
| `error` / `warning` / `info` / `success` | `'Lỗi'` / `'Cảnh báo'` / `'Thông tin'` / `'Thành công'` | Nhãn nhóm, tiền tố tên truy cập của mục |
| `summary` | `(counts) => 'Thông báo: 2 lỗi, 1 cảnh báo'` | Tên truy cập + tooltip của nút (cần hàm cho ngôn ngữ có số nhiều) |

`nxtFocusMessageTarget(target)`: tìm phần tử (theo id hoặc chính nó), cuộn vào giữa màn hình và focus phần tử đó, hoặc control đầu tiên bên trong nếu bản thân nó không focus được. Trả `false` nếu không tìm thấy.

## 4. Variants & sizes
Không có variant. Màu nút thông báo theo **loại nặng nhất** trong `messages`:

| Loại nặng nhất | Icon | Màu (nền / chữ / viền) | Số trên nút |
|----------------|------|-------------------------|-------------|
| `error` | `alert-circle` | `bg.danger-subtle` / `text.danger` / `border.danger` | số lỗi |
| `warning` | `alert-triangle` | `bg.warning-subtle` / `text.warning` / `border.warning` | số cảnh báo |
| `info` | `info-circle` | `bg.info-subtle` / `text.info` / `border.info` | số thông tin |
| `success` | `circle-check` | `bg.success-subtle` / `text.success` / `border.success` | số thành công |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | — (theo nút) | ✓ theo nút; thanh không che focus (`scroll-padding-block-end` cho vùng cuộn) | — | — | — (nơi dùng disable từng nút, kèm lý do) | — (nơi dùng đặt `loading` cho nút Lưu) | ✓ nút thông báo màu lỗi + số lỗi | — (trang chỉ xem không có thanh) | ✓ không có tin: không có nút thông báo |

## 6. Keyboard & ARIA
Không có pattern APG cho thanh; nút thông báo theo [Popover](../popover/SPEC.md) (dialog không modal), danh sách theo list.

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Qua nút thông báo rồi các nút hành động (thứ tự DOM = thứ tự nhìn) |
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên nút thông báo | Mở danh sách, focus mục đầu tiên |
| <kbd>Tab</kbd> trong danh sách | Qua từng mục có `target`, vòng trong popover |
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên một mục | Đóng popover, phát `messageSelect`, cuộn tới và focus trường của mục |
| <kbd>Esc</kbd> | Đóng danh sách, focus về nút thông báo |
| `openMessages()` (sau khi Lưu có lỗi) | Mở danh sách và focus mục đầu tiên, screen reader đọc "Thông báo (N)" |

- Thanh: `role="region"`, `aria-label` = `label` (một landmark để nhảy tới nhanh).
- Nút thông báo: tên truy cập "Thông báo: 2 lỗi, 1 cảnh báo" (chứa số đang hiện, đạt WCAG 2.5.3), tooltip cùng nội dung; icon `aria-hidden`; `aria-haspopup="dialog"`, `aria-expanded`.
- Danh sách: mỗi nhóm là `ul` có tên "Lỗi (2)"; mỗi mục có tiền tố ẩn "Lỗi:" để khi Tab qua vẫn biết loại; icon trang trí.
- Màu không đứng một mình: loại có icon riêng và có chữ (nhãn nhóm, tên truy cập).
- Thanh dính đáy có thể che control đang focus (WCAG 2.4.11): action bar đặt `scroll-padding-block-end` cho vùng cuộn chứa nó (`html` hoặc vùng nội dung của app shell) bằng chiều cao thanh.

## 7. Tokens
`packages/tokens/src/component/action-bar.tokens.json`:

| Token | Alias semantic | Ghi chú |
|-------|----------------|---------|
| `bg` | `color.bg.surface` | Nền thanh |
| `border` | `color.border.default` | Viền trên |
| `status-text` | `color.text.subtle` | Chữ trạng thái |
| `message-{error,warning,info,success}-bg` | `color.bg.{danger,warning,info,success}-subtle` | Nền nút thông báo |
| `message-{error,warning,info,success}-text` | `color.text.{danger,warning,info,success}` | Chữ + icon nút thông báo |
| `message-{error,warning,info,success}-border` | `color.border.{danger,warning,info,success}` | Viền nút thông báo |
| `item-text` | `color.text.default` | Tiêu đề một tin |
| `item-description` | `color.text.subtle` | Mô tả/vị trí của tin, nhãn nhóm |
| `item-bg-hover` | `color.bg.selected` (`bg.surface-hover` trùng nền popover ở dark) | Nền mục danh sách khi hover |
| `item-icon-{error,warning,info,success}` | `color.icon.{danger,warning,info,success}` | Icon mục danh sách |

Dùng thẳng semantic: `border-width.default`, `space.inset.{xs,sm,md,lg}`, `space.gap.{xs,sm,md}`, `size.control.md`, `typography.{label-md,label-sm,body-sm,body-md}`, `z.sticky`, `focus.ring.*`, `radius.control`. Chiều cao thanh (cho `scroll-padding`) = `size.control.md` + 2 × `space.inset.sm` + `border-width.default`.

## 8. Density, responsive, i18n
- Padding và chiều cao theo density.
- Màn hẹp: nhóm nút xuống dòng, vẫn căn phải; nút thông báo và trạng thái ở hàng đầu.
- Dính đáy vùng cuộn gần nhất (`position: sticky`): đặt thanh là **phần tử cuối cùng** của trang. Trong vùng `nxtFill` (flex cột) thanh tự xuống đáy (`margin-block-start: auto`) khi nội dung ngắn.
- Chữ trạng thái dài thì xuống dòng; tiêu đề tin dài trong danh sách xuống dòng (tối đa khoảng 140 ký tự mỗi câu).

## 9. Content guidelines
- Nút: động từ + đối tượng, primary cuối: "Huỷ" · "Lưu nháp" · **"Lưu và gửi duyệt"**. Chỉ một primary cho cả trang; "Huỷ" là `ghost`, không bao giờ primary/danger.
- Tin trong danh sách: `title` là câu ngắn nói việc cần làm ("Nhập ngày kết thúc hợp đồng."), giống hệt câu lỗi dưới trường; `description` là vị trí ("Hợp đồng · Ngày kết thúc") hoặc cách sửa.
- Trạng thái: "Có thay đổi chưa lưu", "Đã lưu nháp lúc 10:24"; không viết "Unsaved".

## 10. Acceptance (Definition of Done)
- [x] Unit test: landmark có tên; không tin thì không có nút; nút lấy icon/màu/số của loại nặng nhất và tên truy cập đầy đủ; mở danh sách (click và `openMessages()`) focus mục đầu; nhóm theo loại đúng thứ tự; chọn mục đóng popover, phát `messageSelect`, focus trường; Esc trả focus về nút; nhãn override được (`src/action-bar.spec.ts`)
- [x] Example: form sửa có lỗi khi lưu, các trạng thái của thanh (`apps/docs/src/examples/action-bar/`)
- [ ] axe: 0 vi phạm ở sáng/tối/gọn (cần `npm run build && npm run test:a11y`; phiên chính chạy)
- [x] `npm run ds:check` sạch (tokens + hardcoded) cho file của action-bar
- [x] Docs page đủ mục (`apps/docs/src/content/components/action-bar.md`)

## 11. Việc còn mở
- Phím tắt mở lại danh sách thông báo (Fiori: Ctrl+Shift+M) chưa có; chọn chung với toast.
- Lọc theo loại trong danh sách (segmented Lỗi/Cảnh báo/…) chưa có; NXT nhóm theo loại thay cho lọc.
- Tràn hành động vào menu ⋯ khi thiếu chỗ chưa có (nút xuống dòng).
- Danh sách đang mở mà `messages` về rỗng (người dùng sửa hết lỗi bằng cách khác): nút thông báo biến mất, popover đóng và focus rơi về `body`. Nên đưa focus về nút hành động đầu tiên.
- Template HRM (Quy trình duyệt, trang chi tiết đối tượng) chưa dùng thanh này: nhánh khác chuyển sang.

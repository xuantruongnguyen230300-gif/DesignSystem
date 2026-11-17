---
component: skeleton
status: beta
owner: "NXT core"
updated: 2026-11-06
apg-pattern: "không có (trang trí, aria-hidden) + aria-busy / live region ở vùng chứa"
---

# Skeleton: Spec

Entry `@nxt/ui/skeleton` gồm `nxt-skeleton` (khối giữ chỗ: dòng chữ, tiêu đề, khối, ô nhập, avatar) và hàm `nxtDeferredLoading()` (luật thời gian hiện / ẩn chỉ báo đang tải). **Hàng bảng** giữ chỗ dùng `tbody[nxtTablePlaceholder]` + `loading` của `@nxt/ui/table` (cùng hình, cùng luật), không làm lại ở đây.

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** khi dữ liệu đang tải, người dùng thấy ngay **hình dạng** của nội dung sắp có (tiêu đề, các dòng, bảng) ở đúng chỗ, nên trang không nhảy khi dữ liệu về và cảm giác nhanh hơn spinner toàn trang (principles §2.4, anti-pattern "Spinner toàn trang").
- **Khi nào dùng:** lần tải đầu của một trang, một section, một thẻ, một bảng, khi việc tải mất **hơn khoảng 1 giây** (xem §5 "Thời gian").
- **Khi nào KHÔNG dùng:**
  - Tải dưới khoảng 1 giây: không hiện gì (`nxtDeferredLoading` lo việc này).
  - Đo được tiến độ (nhập file, chạy lương): `nxt-progress`.
  - Một nút đang xử lý (Lưu, Gửi): `loading` của `nxtButton`.
  - Tải lại sau tìm kiếm / lọc / sắp xếp: giữ dữ liệu cũ, đặt `aria-busy` trên bảng (không thay bằng skeleton, người dùng mất chỗ đang đọc).
  - Không có dữ liệu sau khi tải xong: `nxt-empty-state`, không để skeleton.
  - Lỗi khi tải: `nxt-alert` / `nxt-empty-state` có "Thử lại".

Theo SAP Fiori: placeholder loading (khung xám theo bố cục nội dung thật), busy handling và Timing. NXT không có busy dialog chặn toàn màn hình.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-skeleton` | ✓ | `aria-hidden="true"`, khối nền `bg`, bo `radius`; chuyển động "nhịp" chậm (độ mờ) |
| 2 | Dòng `.nxt-skeleton__line` | ✓ (`text`) | Mỗi dòng một thanh cao bằng cỡ chữ, cách nhau theo line-height của `body-md`; dòng cuối ngắn hơn (60%) khi `lines` > 1 |
| 3 | Hàng bảng | — | Không thuộc entry này: `table[nxtTable][loading]` + `tbody[nxtTablePlaceholder]` (Table) |
| 4 | Vùng chứa (của nơi dùng) | ✓ | `aria-busy="true"` khi đang tải; một live region (`[nxtLiveRegion]`) nói "Đang tải …" và "Đã tải xong …" |

## 3. API (Angular)
Selector: `nxt-skeleton`. Hàm `nxtDeferredLoading(loading: Signal<boolean>, options?)`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxt-skeleton` input | `variant` | `'text' \| 'heading' \| 'block' \| 'control' \| 'circle'` | `'text'` | Hình của nội dung sắp có |
| `nxt-skeleton` input | `lines` | `number` (`numberAttribute`) | `1` | Số dòng (`text`); tối thiểu 1 |
| `nxt-skeleton` input | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Cỡ của `circle`, khớp `nxt-avatar` |
| `nxt-skeleton` input | `width` | `'full' \| 'long' \| 'medium' \| 'short'` | `'full'` | Bề rộng theo bậc (100% / 75% / 50% / 25% của vùng chứa); không nhận giá trị tự do |
| function | `nxtDeferredLoading(loading, { delay?, minDuration? })` | `Signal<boolean>` | `delay` 1000ms, `minDuration` 500ms | Gọi trong injection context. Trả về `true` chỉ khi `loading` kéo dài quá `delay`; đã hiện thì giữ ít nhất `minDuration` để không nháy. Dọn timer khi component bị huỷ |

`block` mặc định cao `layout.scroll-region-min` (240px, token `skeleton.block-height`). Cần khối đúng kích thước nội dung (biểu đồ, ảnh) thì nơi dùng đặt `block-size` cho `nxt-skeleton` bằng token, hoặc override `--nxt-skeleton-block-height` ở phạm vi cha.

## 4. Variants & sizes
| Variant | Dùng khi | Không dùng khi |
|---------|----------|----------------|
| `text` | Đoạn chữ, giá trị của cặp nhãn–giá trị, ô bảng | Tiêu đề (dùng `heading`) |
| `heading` | Tiêu đề trang / section / thẻ | Chữ thường |
| `block` | Ảnh, biểu đồ, thẻ, vùng nội dung lớn | Khi biết cấu trúc bên trong (ghép `text` + `heading` cho đúng hình) |
| `control` | Ô nhập, nút (form đang tải giá trị) | Nhãn của trường (dùng `text` `width="short"`) |
| `circle` | Avatar (`size` khớp `nxt-avatar`) | Icon nhỏ (bỏ qua, không cần giữ chỗ) |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ (nhịp chậm) | — (không tương tác) | — (không focus được) | — | — | — | ✓ chính là trạng thái đang tải | — (nơi dùng thay bằng `nxt-alert`) | — | — (nơi dùng thay bằng `nxt-empty-state`) |

**Thời gian (theo Fiori Timing / busy handling):**
| Quy tắc | Giá trị | Ở đâu |
|---------|---------|-------|
| Không hiện chỉ báo nếu tải nhanh | < khoảng 1 giây: không hiện gì | `nxtDeferredLoading` `delay` = 1000ms |
| Đã hiện thì hiện đủ lâu | tối thiểu 500ms (tránh nháy) | `minDuration` = 500ms |
| Tải quá lâu | > 10 giây: chuyển sang tiến trình chi tiết (`nxt-progress`, mô tả việc đang làm, cho "Huỷ" / chạy nền) | nơi dùng |
| Chuyển động | một nhịp = `motion.duration.loop` (700ms, đi rồi về), chậm và nhẹ | CSS |

Ví dụ: tải mất 1,3 giây → skeleton hiện ở giây thứ 1, giữ tới 1,5 giây (đủ 500ms) rồi mới thay bằng dữ liệu.

**Giảm chuyển động:** skeleton **đứng yên** (không nhịp) khi `prefers-reduced-motion: reduce` hoặc `data-nxt-motion="reduced"`. Đây là ngoại lệ có ghi lý do với quy ước "không viết media query trong component": token `motion.duration.loop` ở mode `reduced` chỉ chậm lại (1600ms, cho spinner vẫn báo đang chạy), còn skeleton đã tự nói "đang tải" bằng hình nên không cần chuyển động.

## 6. Keyboard & ARIA
Không có phím: skeleton không tương tác, không focus được.

| Phím | Hành vi |
|------|---------|
| Tab | Bỏ qua skeleton (không có phần tử focus được bên trong) |

- `nxt-skeleton` luôn `aria-hidden="true"`: screen reader không đọc các khối xám (hàng giữ chỗ của Table cũng vậy).
- **Vùng chứa** (nơi dùng): đặt `aria-busy="true"` lên phần tử bao nội dung đang tải (section, thẻ, `table`), gỡ khi xong. Đặt một live region `[nxtLiveRegion]` (polite) có sẵn trên trang; khi bắt đầu hiện skeleton, chèn chữ "Đang tải hồ sơ nhân viên…" (có thể ẩn bằng `nxt-visually-hidden`); khi xong, thay bằng "Đã tải xong hồ sơ nhân viên." hoặc để trống nếu focus đã chuyển tới nội dung. Lỗi dùng `nxtLiveRegion="assertive"`.
- Không chuyển focus vào vùng đang tải. Nếu focus đang nằm trong vùng bị thay bằng skeleton (tải lại), nơi dùng giữ focus ở nút đã kích hoạt.
- `aria-busy` không thay cho thông báo: một số screen reader bỏ qua nó, nên luôn kèm live region.

## 7. Tokens
Component tokens (`packages/tokens/src/component/skeleton.tokens.json`), chỉ alias semantic:

| Token | Alias semantic | Ghi chú |
|-------|----------------|---------|
| `bg` | `color.bg.muted` | Màu khối; dùng trên nền `surface` (thẻ, section). Trên nền `canvas` sáng gần trùng màu nền, xem §11 |
| `radius` | `radius.control` | Bo góc khối, dòng, ô nhập |
| `radius-circle` | `radius.pill` | Avatar |
| `circle-sm` / `circle-md` / `circle-lg` | `size.icon.lg` / `size.control.md` / `size.control.lg` | Trùng cỡ `nxt-avatar` |
| `control-height` | `size.control.md` | Chiều cao `control` |
| `block-height` | `layout.scroll-region-min` | Chiều cao mặc định của `block` khi vùng chứa không đặt |

Dùng thẳng semantic: `typography.{body-md,heading-md}` (chiều cao dòng), `space.gap.sm`, `motion.duration.loop`, `motion.ease.standard`.

## 8. Density, responsive, i18n
- Dòng `text` cao theo line-height của `body-md` (không đổi theo density, như chữ thật); `control` và `circle` theo `size.control.*` nên đổi theo density như control thật; hàng bảng theo chiều cao hàng của bảng.
- Bề rộng theo bậc phần trăm của vùng chứa, nên co giãn theo container.
- Không có chữ hiển thị; chữ của live region do nơi dùng viết (tiếng Việt, theo đối tượng: "Đang tải danh sách chức danh…").

## 9. Content guidelines
- Dựng skeleton **đúng hình** nội dung thật: header (avatar + 2 dòng), section (tiêu đề + 3–4 cặp nhãn–giá trị), bảng (đúng số cột, số hàng một trang). Không dùng một khối xám lớn cho cả trang.
- Chỉ giữ chỗ cho phần đang tải; phần đã có (tiêu đề trang trên topbar, thanh neo, nút) hiện thật ngay.
- Câu live region: "Đang tải <đối tượng>…" / "Đã tải xong <đối tượng>." Không dùng "Loading", không dùng "Vui lòng chờ".

## 10. Acceptance (Definition of Done)
- [x] Example: các variant (`skeleton-variants`), thẻ đang tải có `aria-busy` + live region + luật thời gian (`skeleton-card`); trang chi tiết đang tải trong template "Hồ sơ nhân viên". Bảng đang tải: example của Table (`nxtTablePlaceholder`)
- [x] Unit test (8, `src/skeleton.spec.ts`, 2026-11-06): `aria-hidden`, số dòng và dòng cuối ngắn, `data-variant` / `data-size` / `data-width`, `nxtDeferredLoading` (không hiện khi < delay, hiện sau delay, giữ đủ `minDuration`, tắt ngay khi đã đủ, giữ hiện khi tải lại trong lúc chờ)
- [ ] axe: 0 vi phạm ở light/dark × 3 density (chạy ở phiên chính: `npm run build && npm run test:a11y`)
- [x] `npm run ds:check` sạch (tokens + hardcoded) cho file của component
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- Màu khối `bg.muted` trùng `bg.canvas` ở theme sáng (cùng `neutral.100`): skeleton đặt thẳng trên nền trang gần như không thấy. Đề xuất semantic `color.bg.placeholder` (sáng: `neutral.200`; tối: `neutral.800`) nếu sản phẩm cần skeleton trên canvas.
- Chưa có preset theo khuôn trang (danh sách, chi tiết) dạng component; template HRM tự ghép từ `nxt-skeleton`.
- Hàng giữ chỗ của Table (`nxtTablePlaceholder`) vẫn nhịp chậm ở mode `reduced` (theo token `loop`), còn `nxt-skeleton` đứng yên: cần thống nhất một luật cho cả hai.
- `nxtDeferredLoading` dùng `setTimeout` (hẹn giờ theo luật UX, không phải để đợi render).

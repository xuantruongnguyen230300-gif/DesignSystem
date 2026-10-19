---
component: tabs
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: tabs
---

# Tabs: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** chia một trang chi tiết nhiều thông tin thành các phần cùng cấp ("Thông tin chung", "Hợp đồng", "Lịch sử") và chuyển nhanh giữa chúng mà không rời trang; hoặc lọc nhanh một danh sách theo nhóm trạng thái có số đếm ("Chờ duyệt 12").
- **Khi nào dùng:** 2–7 phần ngang hàng, người dùng thường chỉ cần xem một phần mỗi lúc.
- **Khi nào KHÔNG dùng:**
  - Chọn một giá trị hiển thị (bảng / thẻ, tháng / quý): dùng `nxt-segmented`.
  - Các bước có thứ tự bắt buộc: dùng stepper / form nhiều bước.
  - Điều hướng sang trang khác (đổi URL): dùng nav link trong `nxt-sidenav` hoặc link thường.
  - Nội dung cần so sánh cạnh nhau: hiển thị cùng lúc, không chia tab.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-tabs` | ✓ | |
| 2 | Tab list `.nxt-tabs__list` | ✓ | `role="tablist"`, viền dưới, cuộn ngang khi tràn (ẩn thanh cuộn) |
| 3 | Tab `button.nxt-tabs__tab` | ✓ | `role="tab"`; icon (tuỳ chọn) + nhãn + số đếm (tuỳ chọn) |
| 4 | Chỉ báo chọn | ✓ | `::after` dày `border-width.strong` dưới tab đang chọn |
| 5 | Số đếm `.nxt-tabs__count` | — | Viên số; đổi sang tông brand khi tab được chọn |
| 6 | Tab panel `.nxt-tabs__panel` | — | `role="tabpanel"`, chỉ có khi `panels`; chỉ render nội dung của tab đang chọn |
| 7 | `nxt-tab` | ✓ | Khai báo một tab; nội dung nằm trong `ng-template`, render lười |

## 3. API (Angular)
Selector: `nxt-tabs`, `nxt-tab`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxt-tabs` input | `label` | `string` | (bắt buộc) | Tên truy cập của tablist |
| `nxt-tabs` model | `value` | `string \| undefined` | `undefined` | Tab đang chọn (two-way). Bỏ trống → tab đầu tiên |
| `nxt-tabs` input | `panels` | `boolean` | `true` | `false`: không render tabpanel; tab chỉ điều khiển `value` (tab lọc trên danh sách) |
| `nxt-tabs` content | `nxt-tab` | | | Các tab theo thứ tự |
| `nxt-tab` input | `value` | `string` | (bắt buộc) | Giá trị, có thể là chữ tự do ("Nghỉ phép") |
| `nxt-tab` input | `label` | `string` | (bắt buộc) | Nhãn hiển thị |
| `nxt-tab` input | `icon` | `NxtIconName` | `undefined` | Icon trước nhãn |
| `nxt-tab` input | `count` | `number \| string` | `undefined` | Số đếm cạnh nhãn |
| `nxt-tab` input | `disabled` | `boolean` | `false` | Không chọn được, bị bỏ qua khi dùng phím mũi tên |
| `nxt-tab` content | (default) | bất kỳ | | Nội dung panel, chỉ render khi tab được chọn |

Output: `valueChange` (từ `model`). Id của tab / panel dùng **chỉ số** (`nxt-tabs-{n}-tab-{i}`, `nxt-tabs-{n}-panel`), không dùng `value`, để luôn là id hợp lệ.

## 4. Variants & sizes
| Cách dùng | Cấu hình | Dùng khi |
|-----------|----------|----------|
| Tab có panel (mặc định) | `panels` | Trang chi tiết chia phần |
| Tab lọc | `panels="false"` + `count` | Lọc danh sách theo trạng thái; trang tự render danh sách theo `value` |

Một kích thước: chiều cao tối thiểu `size.control.lg` (40 / 32 / 48px).

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ chữ `text.default` | ✓ ring token (tab và panel) | — | ✓ chữ `text.strong` + chỉ báo + số đếm tông brand | ✓ native `disabled`, mờ 50% | — | — | — | — (panel rỗng do nơi dùng đặt `nxt-empty-state`) |

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/ (kích hoạt tự động, hướng ngang)

| Phím | Hành vi |
|------|---------|
| Tab | Vào tablist tại tab đang chọn (một Tab stop duy nhất); Tab tiếp theo vào panel |
| → | Chọn và focus tab kế tiếp (bỏ qua tab disabled, vòng về đầu) |
| ← | Chọn và focus tab trước (bỏ qua tab disabled, vòng về cuối) |
| Home / End | Chọn và focus tab đầu / cuối (trong các tab không disabled) |
| Enter / Space | Kích hoạt tab (native `button`; tab đã được chọn khi focus) |

- Tablist: `role="tablist"`, `aria-label` = `label`.
- Tab: `role="tab"`, `aria-selected`, `tabindex` 0 cho tab đang chọn và -1 cho tab khác, `aria-controls` trỏ tới panel khi `panels`.
- Panel: `role="tabpanel"`, `aria-labelledby` trỏ tới tab đang chọn, `tabindex="0"`.
- Icon trong tab là trang trí; số đếm nằm trong tên tab ("Chờ duyệt 12").
- Forced colors: chỉ báo chọn dùng `Highlight`.
- Đã kiểm bằng Playwright e2e trong template phê duyệt (2026-10-19).

## 7. Tokens
`packages/tokens/src/component/tabs.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `text` | `color.text.subtle` |
| `text-hover` | `color.text.default` |
| `text-selected` | `color.text.strong` |
| `indicator` | `color.border.selected` |
| `border` | `color.border.default` |
| `height` | `size.control.lg` |

Số đếm mượn token của badge: `--nxt-badge-height`, `--nxt-badge-radius`, `--nxt-badge-neutral-{bg,text}`, `--nxt-badge-brand-{bg,text}`. Dùng thẳng semantic: `space.gap.{xs,md,lg}`, `space.inset.xs`, `size.icon.sm`, `border-width.{default,strong}`, `radius.{pill,control}`, `typography.{label-md,label-sm}`, `focus.ring.*`. Cặp `border.selected` / `surface` (3:1) có trong `contrastPairs`.

## 8. Density, responsive, i18n
- Chiều cao tab và khoảng cách giữa tab theo density.
- Tab không xuống dòng; khi tràn, tablist cuộn ngang (thanh cuộn bị ẩn), phím mũi tên đưa tab được focus vào tầm nhìn.
- Nhãn `label-md` (14 / 20px) đủ chỗ cho dấu chồng tiếng Việt. Số đếm dùng `tabular-nums`, định dạng `vi` do nơi dùng truyền vào.

## 9. Content guidelines
- Nhãn tab là danh từ ngắn 1–3 từ, sentence case: "Thông tin chung", "Hợp đồng", "Lịch sử phê duyệt".
- Nhãn các tab cùng loại từ và cùng độ dài tương đối; không dùng động từ cho tab.
- `count` chỉ cho số cần chú ý (việc chờ xử lý), không thêm cho mọi tab.

## 10. Acceptance (Definition of Done)
- [ ] Tab có panel, tab lọc có `count`, tab có icon, tab disabled, tab tràn ngang có trong docs example
- [x] Unit test: chọn tab đầu mặc định + một Tab stop, id hợp lệ khi value có dấu cách, ←/→ bỏ qua disabled + vòng + focus, Home/End, bỏ qua click tab disabled + hiện count, `panels` tắt không có tabpanel/`aria-controls`
- [x] Playwright e2e: tabs trong template phê duyệt (2026-10-19)
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; 2026-10-19, 341/341)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/tabs.ts:69`: panel chỉ render template của tab đang chọn; chuyển tab sẽ huỷ nội dung tab cũ, kể cả dữ liệu đang nhập trong form chưa lưu (principles §2.5). Cần ghi rõ trong docs hoặc có tuỳ chọn giữ nội dung.
- `src/tabs.css:10`–`12`: tablist tràn thì cuộn ngang nhưng ẩn thanh cuộn, không có nút cuộn hay dấu hiệu còn tab bị che; người dùng chuột khó biết.
- `src/tabs.css:61`–`75`: số đếm dùng component token của badge, trái quy tắc "component chỉ dùng token của chính nó".
- `panels="false"`: `role="tab"` không có `tabpanel` đi kèm, lệch APG; cân nhắc mẫu khác (segmented / toolbar) cho tab lọc hoặc ghi rõ lý do.
- `src/tabs.css:23`: padding tab dùng primitive `--nxt-space-0-5`; `:57` opacity 0.5 viết cứng.

### Đã xử lý (2026-10-19)
- Luôn còn đúng một điểm dừng Tab: tab đang chọn, hoặc tab bật đầu tiên khi `value` không khớp / tab đang chọn bị disabled (`focusValue`). Có unit test.

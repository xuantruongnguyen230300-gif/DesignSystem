---
component: alert
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: alert (role="alert") / status (role="status") — qua vùng `nxtLiveRegion`
---

# Alert: Spec

Entry `@nxt/ui/alert` gồm:
- `nxt-alert`: khối thông báo nằm trong trang, có tone, tiêu đề, nội dung, nút hành động ("Hoàn tác", "Thử lại") và nút đóng;
- `[nxtLiveRegion]`: vùng luôn có trên trang để screen reader đọc các thông báo xuất hiện sau một thao tác.

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** biết kết quả của thao tác vừa làm và làm tiếp ngay tại chỗ: "Đã xoá 3 chức danh." kèm **Hoàn tác**, "Chưa áp dụng được: 1 bước cần sửa." Không phải đoán việc có thành công không, không phải tìm nút hoàn tác ở nơi khác.
- **Khi nào dùng:**
  - kết quả một thao tác trên trang (lưu, xoá, nhập, áp dụng), nhất là khi có thể hoàn tác;
  - lỗi cấp trang không gắn với một ô nhập ("Không tải được danh sách. Thử lại");
  - lưu ý thường trực về trạng thái của bản ghi ("Đang sửa bản nháp; phiên bản 3 vẫn đang áp dụng").
- **Khi nào KHÔNG dùng:**
  - Lỗi của một ô nhập: dùng `error` của `nxt-form-field`.
  - Cần người dùng trả lời trước khi đi tiếp: dùng `NxtDialog.confirm()`.
  - Gợi ý ngắn cho một control: dùng `hint` của form field hoặc tooltip.
  - Trạng thái của một bản ghi trong danh sách: dùng `nxt-tag`.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-alert` | ✓ | Nền và icon theo tone (`data-tone`) |
| 2 | Icon | ✓ | Theo tone: info-circle, circle-check, alert-triangle, alert-circle; trang trí (`aria-hidden`) |
| 3 | Tiêu đề | — | Một dòng in đậm, khi thông báo có nhiều câu |
| 4 | Nội dung | ✓ | Nội dung chiếu vào (default slot) |
| 5 | Hành động `[nxtAlertActions]` | — | Nút `size="sm"`: "Hoàn tác", "Thử lại", "Xem chi tiết" |
| 6 | Nút đóng | — | `dismissible`: `nxtIconButton` "Đóng thông báo" |
| 7 | `[nxtLiveRegion]` | — | Phần tử cha luôn có trên trang; rỗng thì không chiếm chỗ (vẫn trong cây accessibility) |

## 3. API (Angular)
| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxt-alert` input | `tone` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | Nền, icon; phản ánh ra `data-tone` |
| `nxt-alert` input | `title` | `string` | `undefined` | Tiêu đề (không để lại thuộc tính `title` gốc trên host) |
| `nxt-alert` input | `dismissible` | `boolean` | `false` | Hiện nút "Đóng thông báo" |
| `nxt-alert` output | `dismissed` | `void` | | Bấm nút đóng; nơi dùng tự gỡ alert và đưa focus về chỗ hợp lý |
| `nxt-alert` content | (default) | văn bản | | Nội dung |
| `nxt-alert` content | `[nxtAlertActions]` | nút | | Hành động, đặt cuối khối |
| `[nxtLiveRegion]` input | `nxtLiveRegion` | `'polite' \| 'assertive' \| ''` | `'polite'` | `polite` → `role="status"`; `assertive` → `role="alert"` (chỉ cho lỗi cần chú ý ngay) |

Alert **không tự đặt role**: role trên phần tử vừa chèn vào trang không được screen reader đọc ổn định. Thông báo xuất hiện sau thao tác đặt trong một `[nxtLiveRegion]` đã có sẵn:

```html
<div nxtLiveRegion>
  @if (notice(); as n) {
    <nxt-alert [tone]="n.tone">{{ n.text }} <button nxtAlertActions nxtButton size="sm" variant="ghost">Hoàn tác</button></nxt-alert>
  }
</div>
```

Lưu ý thường trực (có ngay khi trang mở) không cần live region.

## 4. Variants & sizes
| Tone | Dùng khi | Không dùng khi |
|------|----------|----------------|
| `info` | Lưu ý trung tính, đã chuyển / đã sắp xếp lại | Báo thành công (dùng `success`) |
| `success` | Thao tác xong: đã lưu, đã xoá, đã nhập | Việc chỉ thành công một phần (dùng `warning`) |
| `warning` | Thành công một phần, hậu quả cần biết ("4 chức danh đang dùng nên chưa xoá") | Lỗi chặn việc (dùng `danger`) |
| `danger` | Không làm được, cần sửa hoặc thử lại | Lỗi của một ô nhập (dùng form field) |

Một kích thước; padding theo density.

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | — (theo nút bên trong) | — (theo nút bên trong) | — | — | — | — | ✓ tone `danger` | — | — (không hiển thị alert rỗng; `nxtLiveRegion` rỗng thì không chiếm chỗ) |

## 6. Keyboard & ARIA
APG: https://www.w3.org/WAI/ARIA/apg/patterns/alert/

| Phím | Hành vi |
|------|---------|
| Tab | Đi qua các nút hành động rồi nút đóng; alert không nhận focus |
| Enter / Space | Kích hoạt nút (native `button`) |

- Không tự lấy focus (không làm gián đoạn người đang thao tác). Khi người dùng đóng alert, nơi dùng đưa focus về phần tử hợp lý (vd. nút đã kích hoạt thao tác).
- Icon trang trí; tone phải nói được bằng chữ trong nội dung ("Chưa áp dụng được: …"), không chỉ bằng màu và icon.
- `[nxtLiveRegion]` rỗng dùng `position: absolute` thay cho `display: none`, để vùng vẫn nằm trong cây accessibility và thông báo sau được đọc.

## 7. Tokens
`packages/tokens/src/component/alert.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `bg-info`, `bg-success`, `bg-warning`, `bg-danger` | `color.bg.{info,success,warning,danger}-subtle` |
| `icon-info`, `icon-success`, `icon-warning`, `icon-danger` | `color.icon.{info,success,warning,danger}` |
| `border` | `color.border.subtle` |
| `text` | `color.text.default` |
| `title` | `color.text.strong` |

Cặp tương phản mới trong `contrastPairs`: `text.default` trên `bg.{info,success,warning,danger}-subtle` (4.5).
Dùng thẳng semantic: `radius.container`, `border-width.default`, `space.inset.{sm,md}`, `space.gap.{xs,sm}`, `size.icon.md`, `layout.item-min-sm` (bề rộng tối thiểu của phần chữ trước khi nút xuống dòng), `typography.{body-md,label-md}`.

## 8. Density, responsive, i18n
- Padding theo density.
- Nội dung xuống dòng; nút hành động nằm cuối dòng khi đủ chỗ, xuống dòng riêng khi hẹp (flex-wrap).
- Câu thông báo dài ("Đã nhập 128 chức danh từ “chuc-danh-19-10-2026.xlsx”") xuống dòng, không cắt.

## 9. Content guidelines
- Nói việc đã xảy ra bằng thì quá khứ và con số: "Đã xoá 3 chức danh.", không "Thao tác thành công".
- Lỗi nói cách sửa: "Chưa áp dụng được: bước 3 cần chọn người duyệt."
- Nút hành động là động từ: "Hoàn tác", "Thử lại". Không quá 2 nút.

## 10. Acceptance (Definition of Done)
- [x] Unit test: `data-tone`, icon theo tone, tiêu đề không để lại `title` gốc, `dismissible` + `dismissed`, `nxtLiveRegion` → `role` theo politeness
- [x] Dùng trong mẫu Danh mục, Phê duyệt, Quy trình duyệt (thay `.notice` tự dựng)
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`)
- [x] `npm run ds:check` sạch (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- Nhãn "Đóng thông báo" viết cứng tiếng Việt.
- Chưa có toast (thông báo nổi tự ẩn). Cân nhắc khi có nhu cầu thật; alert trong trang đủ cho các mẫu hiện tại.

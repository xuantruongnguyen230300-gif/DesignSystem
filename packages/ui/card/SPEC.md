---
component: card
status: beta
owner: "NXT core"
updated: 2026-11-06
apg-pattern: "none (presentational); link khi có `link`"
---

# Card & Stat: Spec

Entry `@nxt/ui/card` gồm hai component: `nxt-card` (bề mặt gom nhóm nội dung, kiêm thẻ trang tổng quan) và `nxt-stat` (một chỉ số chính kèm xu hướng).

## 1. Mục đích
- **Vấn đề người dùng giải quyết:**
  - `nxt-card`: tách một khối nội dung liên quan (widget dashboard, section form, panel danh sách) khỏi nền trang, có tiêu đề và hành động riêng. Trên trang tổng quan, thẻ là **lối vào** một danh sách: xem trước vài mục hoặc một KPI, rồi đi tới danh sách đầy đủ đã lọc sẵn.
  - `nxt-stat`: đọc nhanh một chỉ số và biết nó tăng hay giảm so với kỳ trước, tốt hay xấu.
- **Khi nào dùng:** card đặt trực tiếp trên canvas của trang; stat đặt trong card (thân, hoặc `[nxtCardKpi]` làm header số) hoặc trong một dải stat gọn phía trên bảng.
- **Khi nào KHÔNG dùng:**
  - Card trong card: cấm (principles §4). Bên trong card dùng section + divider / khoảng trắng (`nxt-stack`).
  - Bọc mọi thứ thành card cho "đẹp": chỉ dùng khi khối nội dung thật sự độc lập.
  - Thẻ trang tổng quan có trường nhập: thẻ chỉ để xem và đi tiếp. Nhập liệu thuộc form/drawer.
  - Thẻ lặp lại thông tin của thẻ khác trên cùng trang.
  - `clickable` khi thẻ có hơn một đích (danh sách có link từng dòng, nút hành động): dùng `link` thường (liên kết "Xem tất cả" ở chân thẻ).
  - Số liệu "hero" khổng lồ trên dashboard nghiệp vụ: dùng dải stat gọn + bảng/biểu đồ có ngữ cảnh.

Theo SAP Fiori: Cards, Overview Page Card (header là vùng điều hướng, bộ đếm, header số, nội dung chỉ dữ liệu liên quan nhất, trạng thái lỗi/không có kết quả).

## 2. Anatomy
**Card**

| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-card` | ✓ | Nền `surface`, viền, bo `radius.container`, `elevation.raised` |
| 2 | Header `.nxt-card__header` | — | Chỉ render khi có `title` |
| 3 | Tiêu đề `h2` / `h3` / `h4` | — | Theo `headingLevel`; `id` ổn định = `headingId` (`nxt-card-{n}-title`). Khi `clickable`, chữ tiêu đề là `<a>` phủ cả thẻ |
| 4 | Trạng thái `[nxtCardStatus]` | — | Cạnh tiêu đề (vd. `nxt-tag`); ẩn khi rỗng |
| 5 | Phụ đề `.nxt-card__subtitle` | — | Khi có `subtitle`; bổ ngữ, kỳ, đơn vị ("Tháng 10/2026 \| người") |
| 6 | Bộ đếm `.nxt-card__count` | — | "5/12" căn phải, không cắt; chữ ẩn "Hiển thị 5 trên 12 mục" |
| 7 | Hành động `[nxtCardActions]` | — | Trong header, căn phải; ẩn khi rỗng |
| 8 | Header số `[nxtCardKpi]` | — | Dưới tiêu đề (thường là `nxt-stat` không `label`) |
| 9 | Thân `.nxt-card__body` | ✓ | Nội dung chiếu vào mặc định; padding theo `padding`; ẩn khi `state` ≠ `ready` |
| 10 | Vùng trạng thái `.nxt-card__state` | — | Khi `state` là `loading` (skeleton), `empty`, `error` (icon + chữ + `[nxtCardStateAction]`) |
| 11 | Footer `[nxtCardFooter]` | — | Chiếu vào sau thân, không có wrapper hay style riêng (giữ tương thích) |
| 12 | Chân "Xem tất cả" `.nxt-card__footer` | — | Khi có `link` và không `clickable`; đường kẻ trên + liên kết `viewAllLabel` |

**Stat**

| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Icon `.nxt-stat__icon` | — | Vuông bo góc, `aria-hidden="true"` |
| 2 | Nhãn `.nxt-stat__label` | — | Bỏ khi stat là header số của card (tiêu đề card đã là nhãn) |
| 3 | Giá trị `.nxt-stat__value` + đơn vị | ✓ | `tabular-nums`; đơn vị nhỏ hơn, màu phụ |
| 4 | Thay đổi `.nxt-stat__delta` | — | Icon xu hướng + chữ ẩn "Tăng/Giảm/Không đổi" + `delta` + `caption` |

## 3. API (Angular)
Selector: `nxt-card`, `nxt-stat`. Type: `NxtCardState = 'ready' | 'loading' | 'empty' | 'error'`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxt-card` input | `title` | `string` | `undefined` | Không có `title` thì không có header (kể cả actions, KPI, bộ đếm) |
| `nxt-card` input | `subtitle` | `string` | `undefined` | |
| `nxt-card` input | `headingLevel` | `number` (`numberAttribute`) | `2` | `3` → `h3`, `4` → `h4`, giá trị khác → `h2` |
| `nxt-card` input | `padding` | `'none' \| 'md' \| 'lg'` | `'md'` | `none` cho nội dung tràn mép như bảng; phản ánh ra `data-padding` |
| `nxt-card` input | `region` | `boolean` | `false` | Card là landmark `region` có tên = tiêu đề. Chỉ có hiệu lực khi có `title` |
| `nxt-card` property | `headingId` | `string` (readonly) | `nxt-card-{n}-title` | `id` của tiêu đề, cho `aria-labelledby` của nội dung bên trong |
| `nxt-card` input | `fill` | `boolean` | `false` | Chiếm phần chiều cao còn lại của cha dạng cột; phản ánh ra `data-fill` |
| `nxt-card` input | `link` | `string \| readonly unknown[]` | `undefined` | Đích của thẻ (lệnh `routerLink`), thường là danh sách đầy đủ đã lọc sẵn. Có `link` mà không `clickable` → chân thẻ có liên kết `viewAllLabel` |
| `nxt-card` input | `queryParams` | `Params` | `undefined` | Bộ lọc của danh sách đích (`?trang-thai=cho-duyet`) |
| `nxt-card` input | `clickable` | `boolean` | `false` | Cả thẻ là một liên kết tới `link` (một đích duy nhất). Cần `title` và `link`; thân không được chứa phần tử tương tác. Phản ánh ra `data-clickable` |
| `nxt-card` input | `viewAllLabel` | `string` | `'Xem tất cả'` | Chữ liên kết ở chân thẻ; nên nêu số và đối tượng: "Xem tất cả 12 đơn" |
| `nxt-card` input | `count` | `number` | `undefined` | Số mục đang hiện trên thẻ |
| `nxt-card` input | `total` | `number` | `undefined` | Tổng số mục. Bộ đếm "count/total" chỉ hiện khi có cả hai, `count < total` và `state` là `ready` |
| `nxt-card` input | `countLabel` | `string` | `'Hiển thị {count} trên {total} mục'` | Chữ ẩn của bộ đếm (đọc bằng screen reader); `{count}`, `{total}` được thay bằng số đã định dạng |
| `nxt-card` input | `state` | `NxtCardState` | `'ready'` | `loading` / `empty` / `error` thay thân bằng vùng trạng thái; phản ánh ra `data-state`, `loading` thêm `aria-busy="true"` |
| `nxt-card` input | `loadingText` | `string` | `'Đang tải dữ liệu'` | Chữ ẩn khi đang tải |
| `nxt-card` input | `emptyText` | `string` | `'Chưa có dữ liệu'` | Nên cụ thể: "Không có đơn chờ duyệt" |
| `nxt-card` input | `errorText` | `string` | `'Không tải được dữ liệu. Hãy thử lại sau.'` | Nói chuyện gì xảy ra và làm gì tiếp |
| `nxt-card` content | (default) | bất kỳ | | Thân card |
| `nxt-card` content | `[nxtCardActions]` | nút, menu | | Chỉ hiện khi có `title`. Không dùng cùng `clickable` |
| `nxt-card` content | `[nxtCardStatus]` | `nxt-tag` | | Trạng thái cạnh tiêu đề; không tương tác |
| `nxt-card` content | `[nxtCardKpi]` | `nxt-stat` | | Header số; chỉ hiện khi có `title` và `state` là `ready` |
| `nxt-card` content | `[nxtCardStateAction]` | nút | | Dưới chữ của trạng thái `empty`/`error` (vd. "Thử lại"). Không dùng cùng `clickable` |
| `nxt-card` content | `[nxtCardFooter]` | bất kỳ | | Chiếu vào cuối card, tự lo style |
| `nxt-stat` input | `label` | `string` | `undefined` | "Tổng nhân viên". Bỏ trống khi stat nằm trong `[nxtCardKpi]` |
| `nxt-stat` input | `value` | `string` | (bắt buộc) | Đã định dạng bằng `@nxt/ui/format`: "1.284", "18,6" |
| `nxt-stat` input | `unit` | `string` | `undefined` | "người", "₫", "tỷ ₫" |
| `nxt-stat` input | `icon` | `NxtIconName` | `undefined` | |
| `nxt-stat` input | `delta` | `string` | `undefined` | Đã định dạng: "2,1%". Không có thì không hiện dòng thay đổi |
| `nxt-stat` input | `trend` | `'up' \| 'down' \| 'flat'` | `'flat'` | Chọn icon và chữ ẩn |
| `nxt-stat` input | `deltaTone` | `'positive' \| 'negative' \| 'neutral'` | `'neutral'` | Tốt/xấu khai báo riêng, vì "tăng" không phải lúc nào cũng tốt |
| `nxt-stat` input | `caption` | `string` | `undefined` | "so với tháng trước" |

Không có output (hành động trong trạng thái lỗi do nơi dùng chiếu vào `[nxtCardStateAction]`, nên không có nút "Thử lại" chết khi không ai lắng nghe).

Tương thích ngược: mọi input mới có mặc định giữ nguyên hành vi cũ; `nxt-stat` `label` từ bắt buộc thành tuỳ chọn.

## 4. Variants & sizes
| Padding (card) | comfortable | compact | spacious | Dùng khi |
|----------------|-------------|---------|----------|----------|
| `md` | 16px (`space.inset.lg`) | 12px | 20px | Mặc định |
| `lg` | 16px (`space.section.sm`) | 12px | 24px | Card nội dung đọc nhiều |
| `none` | 0 | 0 | 0 | Bảng, danh sách tràn mép |

| Kiểu điều hướng | Cấu hình | Dùng khi | Không dùng khi |
|-----------------|----------|----------|----------------|
| Không điều hướng | (không `link`) | Section form, khối thông tin trong trang chi tiết | Thẻ trang tổng quan (Fiori khuyên luôn có đích) |
| Chân "Xem tất cả" | `link` | Thẻ danh sách/bảng: dòng dẫn tới chi tiết, chân dẫn tới danh sách đầy đủ | — |
| Cả thẻ bấm được | `link` + `clickable` | Thẻ KPI, thẻ tóm tắt: **một** đích, không phần tử tương tác bên trong | Thẻ có link từng dòng, nút, menu |

| `trend` × `deltaTone` | Ví dụ |
|-----------------------|-------|
| `up` + `neutral` | Tổng nhân viên tăng |
| `up` + `negative` | Tỉ lệ nghỉ việc tăng |
| `down` + `positive` | Số ngày nghỉ không phép giảm |
| `flat` + `neutral` | Không đổi |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ khi `clickable`: nền `bg-hover`, viền `border-hover`, gạch chân tiêu đề; liên kết chân thẻ gạch chân | ✓ khi `clickable`: vòng focus quanh cả thẻ; liên kết chân thẻ có vòng focus riêng | — (liên kết, không có trạng thái nhấn riêng) | — | — (thẻ không disable; đích không có quyền thì bỏ `link`) | ✓ `state="loading"`: 3 dòng skeleton giữ chỗ, `aria-busy="true"`, chữ ẩn `loadingText`; ẩn bộ đếm và header số | ✓ `state="error"`: icon cảnh báo + `errorText` + `[nxtCardStateAction]`; ẩn bộ đếm | — | ✓ `state="empty"`: icon + `emptyText`; ẩn bộ đếm và chân "Xem tất cả" |

- Bộ đếm ẩn khi `count >= total` (thẻ đã hiện hết), khi lỗi, đang tải hoặc rỗng (Theo SAP Fiori: Overview Page Card, bộ đếm).
- Chân "Xem tất cả" vẫn hiện khi đang tải và khi lỗi (danh sách đích vẫn mở được), ẩn khi rỗng.

## 6. Keyboard & ARIA
APG pattern: không áp dụng cho card; liên kết theo hành vi native của `<a href>`.

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Card thường không nhận focus; chỉ control trong header / thân / footer. Card `clickable`: đúng **một** điểm dừng (liên kết tiêu đề), vòng focus bao cả thẻ. Card có `link`: liên kết "Xem tất cả" là một điểm dừng |
| Enter | Trên liên kết tiêu đề (`clickable`) hoặc "Xem tất cả": đi tới `link` (router) |

- Card mặc định không có `role`. Tiêu đề là heading thật: chọn `headingLevel` cho đúng cấu trúc trang (`h1` là tiêu đề trang).
- `clickable` dùng mẫu "liên kết kéo giãn": `<a>` nằm **trong** heading, pseudo-element của nó phủ cả thẻ để chuột bấm đâu cũng được; tên liên kết = tiêu đề, `aria-describedby` = phụ đề + trạng thái + header số, nên screen reader đọc "Tổng nhân sự, liên kết, Tháng 10/2026, 1.284 người, Tăng 2,1%…". Không bọc cả card bằng `<a>` (đọc lẫn lộn cả nội dung) và không gắn `(click)` lên host. Khác Fiori (cả header là vùng bấm và vẫn cho phần tử bấm được trong nội dung): NXT chỉ cho cả thẻ bấm được khi thẻ có một đích, để không lồng phần tử tương tác (WCAG 4.1.2, tránh bấm nhầm).
- Ở dev mode, card `clickable` có phần tử tương tác khác bên trong thì `console.warn`.
- Liên kết "Xem tất cả" có tên = chữ hiển thị + tiêu đề thẻ (`aria-labelledby`), nên nhiều thẻ cùng có "Xem tất cả" vẫn phân biệt được (WCAG 2.4.4) và tên bắt đầu bằng chữ nhìn thấy (2.5.3).
- Bộ đếm: chữ "5/12" `aria-hidden`, kèm chữ ẩn `countLabel` ("Hiển thị 5 trên 12 mục").
- `state="loading"`: `aria-busy="true"` trên card; skeleton `aria-hidden`; chữ ẩn `loadingText`. Card không tự thông báo (live region) khi đổi trạng thái: trang tổng quan tải nhiều thẻ cùng lúc, thông báo từng thẻ sẽ ồn.
- `headingId`, `region`: như trước (landmark có tên = tiêu đề; chỉ cho vài khối chính; tên duy nhất trên trang).
- Stat: icon chính và icon xu hướng đều `aria-hidden`. Xu hướng được đọc bằng chữ ẩn "Tăng" / "Giảm" / "Không đổi" đặt trước `delta`, nên không chỉ truyền bằng màu hay icon. Màu tốt/xấu của `delta` luôn đi cùng chữ và icon (WCAG 1.4.1).

## 7. Tokens
`packages/tokens/src/component/card.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `bg` / `bg-hover` | `color.bg.surface` / `color.bg.surface-hover` |
| `shadow` | `elevation.card` (bóng mềm hai lớp, kiểu C; thay cho viền) |
| `radius` | `radius.container` (28px) |
| `title-text` | `color.text.strong` |
| `subtitle-text` | `color.text.subtle` |
| `count-text` | `color.text.subtle` |
| `link-text` / `link-text-hover` | `color.text.link` / `color.text.link-hover` |
| `divider` | `color.border.subtle` |
| `state-text` / `state-icon` | `color.text.subtle` / `color.icon.subtle` |
| `error-icon` | `color.icon.danger` |
| `skeleton-bg` | `color.bg.muted` |
| `skeleton-radius` | `radius.control` |

`packages/tokens/src/component/stat.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `label-text` | `color.text.subtle` |
| `value-text` | `color.text.strong` |
| `positive-text` / `negative-text` / `neutral-text` | `color.text.success` / `color.text.danger` / `color.text.subtle` |
| `icon-bg` / `icon-color` | `color.bg.primary-subtle` / `color.icon.primary` |
| `icon-radius` | `radius.control` |

Dùng thẳng semantic: `border-width.default` (chỉ vẽ viền thật trong `forced-colors`), `space.inset.{sm,md,lg}`, `space.section.sm`, `space.gap.{xs,sm,md}`, `size.control.{sm,lg}`, `size.icon.{sm,md}`, `radius.control`, `focus.ring.*`, `typography.{heading-sm,heading-lg,body-sm,body-md,label-sm,label-md,caption}`.

**Diện mạo kiểu C.** Card không viền: bóng `card.shadow` tách lớp, bo `card.radius`. Card bấm được khi rê chuột chỉ đổi nền (`bg-hover`) và gạch chân tiêu đề, không đổi bóng. Card `padding="none"` (bọc lưới, danh sách chạm mép) cắt nội dung theo góc bo bằng `overflow: clip` (không phải vùng cuộn, nên header dính, chuỗi `fill` và thanh cuộn của `nxt-table-scroll` vẫn nằm trong card bo); card bấm được không cắt để vòng focus quanh thẻ không bị mất. Chế độ `fill` không đổi.

## 8. Density, responsive, i18n
- Padding và gap theo density. Vòng icon stat theo `size.control.lg` (40 / 32 / 48px). Liên kết "Xem tất cả" cao tối thiểu `size.control.sm` (vùng chạm ≥ 24px ở compact).
- Card `min-inline-size: 0`, nên co được trong `nxt-grid`; header xếp tiêu đề bên trái, bộ đếm + hành động bên phải. Bộ đếm `white-space: nowrap`, không bao giờ cắt: tiêu đề xuống dòng thay.
- Tiêu đề, phụ đề xuống dòng (không cắt): nội dung giữ ngắn theo §9.
- Stat: `value`, `delta` nhận chuỗi **đã định dạng** bằng `@nxt/ui/format` (`nxtNumber`, `nxtCompact`, `nxtPercent`). Component không tự định dạng số. Bộ đếm định dạng `count`/`total` bằng `nxtNumber` ("5/1.240").
- Mọi chữ mặc định tiếng Việt (`viewAllLabel`, `countLabel`, `loadingText`, `emptyText`, `errorText`) đổi được qua input. Chữ ẩn xu hướng của stat vẫn cố định trong code (xem §11).

## 9. Content guidelines
Theo SAP Fiori: Overview Page UI Text Guidelines, chuyển sang tiếng Việt (viết hoa kiểu câu thay vì Title Case).
- **Tiêu đề** là danh từ ngắn nêu góc nhìn của thẻ, 1–4 từ, một dòng (tối đa hai): "Đơn chờ duyệt", "Hợp đồng sắp hết hạn", "Nghỉ việc". Không nhồi bổ ngữ vào tiêu đề dài; bổ ngữ đặt ở phụ đề. Dùng một khuôn tiêu đề nhất quán cho mọi thẻ trên trang.
- **Phụ đề** (tuỳ chọn) bổ nghĩa, giải thích hoặc nêu trạng thái, một dòng: "Trong 30 ngày tới", "Tháng 10/2026". Nhiều bổ ngữ cách nhau bằng dấu phẩy. Đơn vị/tiền tệ ở cuối, tách bằng " | ": "Tháng 10/2026 | tỷ ₫". Không viết "tính bằng VND".
- Tiêu đề và phụ đề phải dịch được độc lập (không ghép câu xuyên hai dòng).
- **Không** đặt số vào tiêu đề ("12 đơn chờ bạn duyệt"): số đi vào bộ đếm, header số hoặc chân "Xem tất cả 12 đơn".
- Chân thẻ: "Xem tất cả" + số + đối tượng khi biết tổng: "Xem tất cả 12 đơn", "Xem tất cả 9 hợp đồng".
- Nội dung thẻ chỉ dữ liệu liên quan nhất: danh sách ≤ 5 mục (≤ 3 mục nếu mỗi mục nhiều dòng), một kiểu mục cho cả thẻ; bảng ≤ 3–4 cột × ≤ 5 hàng.
- Ngày trong thẻ ưu tiên tương đối (`nxtRelative`: "Hôm qua", "3 ngày trước") kèm ngày tuyệt đối trong `title`; số lớn dạng gọn (`nxtCompact`: "18,6 tỷ").
- Nhãn stat nêu đại lượng: "Tổng nhân viên", "Tỉ lệ nghỉ việc". `caption` nêu kỳ so sánh: "so với tháng trước". `deltaTone` phản ánh ý nghĩa nghiệp vụ, không phải hướng mũi tên.
- `emptyText` nói cụ thể không có gì ("Không có đơn chờ duyệt"); `errorText` nói chuyện gì xảy ra và làm gì tiếp.
- Tối đa 2–3 hành động trong `[nxtCardActions]`; nhiều hơn thì gom vào menu.

## 10. Acceptance (Definition of Done)
- [x] Card có/không header, ba mức `padding`, có footer; stat với các tổ hợp `trend` × `deltaTone` có trong docs example
- [x] Example cho thẻ trang tổng quan: chân "Xem tất cả" + bộ đếm, cả thẻ bấm được + header số, ba trạng thái tải/rỗng/lỗi (`card-overview`, `card-clickable`, `card-states`)
- [x] Unit test (card): tiêu đề có `id` = `headingId` ở mọi `headingLevel`, `headingId` khác nhau giữa các card, `region` ra `role="region"` + `aria-labelledby` chỉ khi có `title`
- [x] Unit test (card, 2026-11-06): `link` → chân "Xem tất cả" có `href` + `queryParams` và tên gồm tiêu đề; `clickable` → một liên kết trong heading, `aria-describedby`, không chân thẻ, `data-clickable`; bộ đếm hiện/ẩn theo `count`/`total`/`state` và chữ ẩn; `state` loading/empty/error (`aria-busy`, thân ẩn, chữ, slot hành động); cảnh báo dev khi `clickable` có phần tử tương tác; Enter trên liên kết điều hướng; stat không `label`
- [ ] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`; lần chạy gần nhất 2026-10-19, 341/341, **trước** các example mới; phiên chính chạy lại)
- [x] `npm run ds:check` sạch (tokens + hardcoded) cho thay đổi 2026-11-06
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- `src/card.ts`: `[nxtCardActions]`, `[nxtCardKpi]`, bộ đếm nằm trong `@if (title())`, nên card không có `title` sẽ lặng lẽ bỏ mất chúng.
- `[nxtCardFooter]` vẫn không có wrapper, padding hay divider (giữ tương thích); chân "Xem tất cả" có style riêng. Cân nhắc gộp ở bản major.
- `src/card.css`: `padding="lg"` (`space.section.sm`) bằng đúng `md` (`space.inset.lg`) ở comfortable và compact (16px, 12px); chỉ khác ở spacious.
- `headingLevel` ngoài 2/3/4 lặng lẽ thành `h2`.
- `nxt-stat`: chữ ẩn xu hướng ("Tăng"/"Giảm"/"Không đổi") viết cứng; chưa có tối đa 2 chỉ số phụ và `period` tách khỏi `caption` (Fiori header số, P2).
- `src/card.css`: gap / margin trong stat dùng primitive `--nxt-space-0-5`, `--nxt-space-1` thay vì semantic `space.gap.*`, không theo density.
- Chuyển góc nhìn trong thẻ (`nxt-segmented size="sm"` trong `[nxtCardActions]`), micro chart so mục tiêu: P2, chưa làm.
- `link` chỉ nhận lệnh router; ứng dụng không dùng router chưa có cách đặt đích (cân nhắc output `navigate` như `nxt-breadcrumb`).

### Bổ sung (2026-10-19)
- `headingId` (readonly, sinh tự động) và input `region`. Input `fill`. Host không còn để lại thuộc tính `title` gốc.

### Bổ sung (2026-11-06): thẻ trang tổng quan theo SAP Fiori
- `link`, `queryParams`, `clickable`, `viewAllLabel`: điều hướng tới danh sách đã lọc sẵn. Hai kiểu (chân "Xem tất cả" hoặc cả thẻ) thay cho luật cũ "card không bấm được"; cả thẻ chỉ khi một đích.
- `count`, `total`, `countLabel`: bộ đếm "5/12". Không rút gọn số (Fiori rút gọn từ 1.000) vì "5/1,2 nghìn" khó đọc; dùng phân cách nghìn.
- `state` + `loadingText`/`emptyText`/`errorText` + slot `[nxtCardStateAction]`.
- Slot `[nxtCardKpi]` (header số) và `[nxtCardStatus]`; `nxt-stat` `label` thành tuỳ chọn.

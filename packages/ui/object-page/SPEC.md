---
component: object-page
status: beta
owner: "NXT core"
updated: 2026-11-06
apg-pattern: "landmarks (navigation) + tabs"
---

# Object page: Spec

Entry `@nxt/ui/object-page` gồm `nxt-object-page` (khuôn trang chi tiết một đối tượng), `nxt-object-page-section` (một phần của trang, tiêu đề `h2`), `nxt-object-page-subsection` (khối con, tiêu đề `h3`), thanh neo / tab `.nxt-object-page-nav` (do `nxt-object-page` tự dựng từ các section, không đặt tay) và các khe `[nxtObjectPageHeader]`, `[nxtObjectPageSummary]`, `[nxtSectionActions]`, `[nxtSubsectionActions]`, `[nxtObjectPageFooter]` (thuộc tính thường, không có directive phải import).

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** xem, sửa và (khi cần) tạo **một** đối tượng có nhiều phần (hồ sơ nhân viên, hợp đồng, đơn từ): biết ngay đối tượng nào và trạng thái gì, nhảy nhanh tới phần cần xem, và luôn thấy nút kết thúc (Lưu / Huỷ) khi đang sửa.
- **Khi nào dùng:** trang chi tiết có từ 2 phần trở lên, hoặc có thông tin tóm tắt cần đặt ngữ cảnh (avatar, mã, phòng ban, trạng thái); xem → sửa trên cùng bố cục.
- **Khi nào KHÔNG dùng:**
  - Tìm và thao tác nhiều bản ghi: trang danh sách ([pattern Trang danh sách](../../../apps/docs/src/content/patterns/list-page.md)).
  - Bản ghi phẳng, khoảng 8 trường trở xuống: `NxtDrawer` (xem/sửa trong drawer) hoặc `NxtDialog`.
  - Tạo mới cần dẫn qua nhiều bước, rẽ nhánh: form nhiều bước (chưa có).
  - Trang một phần và không có tóm tắt: `nxt-page-header` + nội dung thường (không cần khuôn).
  - Duyệt hàng đợi (xem rồi quyết định, sang mục kế): danh sách | chi tiết như template Phê duyệt.

Theo SAP Fiori: Object Page + Dynamic Page. NXT không lặp hàng tiêu đề: tiêu đề, breadcrumb, tag trạng thái và hành động không kết thúc (Sửa, ⋯) nằm trên topbar qua `nxt-page-header placement="topbar"`. **Topbar là hàng tiêu đề thu gọn vĩnh viễn** của Dynamic Page (luôn hiện, tiêu đề + hành động không bao giờ mất). `nxt-object-page` chỉ gánh phần còn lại: header nội dung (khối tóm tắt), thanh điều hướng section, các section, thanh chân dính.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-object-page` | ✓ | Khối dọc, không có nền; đặt ngay sau `nxt-page-header placement="topbar"` |
| 2 | Header nội dung `.nxt-object-page__header` | — | Chứa `[nxtObjectPageHeader]`: avatar (tối đa một, bên trái), phụ đề (chức danh · phòng ban), nhóm nhãn–giá trị chính (tối đa 5 cặp), tag trạng thái, KPI nhỏ. Nền `surface`, không viền, bóng `elevation.card`, bo `radius.container`. Không chứa control nhập liệu |
| 3 | Thanh dính `.nxt-object-page__bar` | ✓ khi có ≥ 2 section hoặc có nút thu gọn/ghim | `position: sticky` ở mép trên vùng cuộn; chứa dòng tóm tắt gọn, thanh neo / tab, nút thu gọn, nút ghim |
| 4 | Dòng tóm tắt gọn `[nxtObjectPageSummary]` | — | Chỉ hiện khi header nội dung không thấy (đã cuộn khuất hoặc thu gọn): ví dụ avatar nhỏ + "NV-00123 · Trưởng nhóm Kế toán tổng hợp" |
| 5 | Thanh neo `.nxt-object-page-nav` | — | `nav` có tên, mỗi section một nút neo; neo của section đang thấy có `aria-current="true"` và vạch chỉ báo như tab. Ẩn khi chỉ có 1 section |
| 5b | Tab (`navigation="tabs"`) | — | Cùng vị trí, cùng hình; `role="tablist"` theo APG tabs; mỗi section một tab, chỉ section đang chọn hiện. Không dùng `nxt-tabs` vì tablist phải nằm trong thanh dính còn panel nằm ở vùng nội dung, mà `nxt-tabs` dựng cả hai trong một host |
| 6 | Nút thu gọn / mở rộng | — | Icon button `chevron-up` / `chevron-down`, `aria-expanded` + `aria-controls` trỏ tới header; khi `collapsible` |
| 7 | Nút ghim | — | Icon button `pin` / `pinned`, `aria-pressed`; khi `pinnable` và header không quá 60% chiều cao vùng cuộn |
| 8 | Section `nxt-object-page-section` | ✓ (≥ 1) | Render thành `section` có tên (= tiêu đề), `id` = `id` của section để neo; nền `surface`, không viền, bóng `elevation.card`, bo `radius.container` |
| 8a | Tiêu đề section `h2` | ✓ | `tabindex="-1"` (nhận focus khi bấm neo). Ở chế độ tab: vẫn là `h2` nhưng ẩn bằng `nxt-visually-hidden` (không lặp tên tab, giữ thứ bậc heading) |
| 8b | Hành động section `[nxtSectionActions]` | — | Cùng hàng tiêu đề, cuối hàng (ví dụ "Sửa" của sửa một phần, "Xem tất cả (24)") |
| 9 | Khối con `nxt-object-page-subsection` | — | Tiêu đề `h3` (tuỳ chọn) + hành động `[nxtSubsectionActions]` + nội dung |
| 10 | Thanh chân `.nxt-object-page__footer` | — | Chứa `[nxtObjectPageFooter]`; dính đáy vùng cuộn, nền `surface`, không viền, bo `radius.container`, bóng `elevation.overlay` (nổi trên nội dung cuộn). Chỉ render khi có khe này |

## 3. API (Angular)
Selector: `nxt-object-page`, `nxt-object-page-section`, `nxt-object-page-subsection`, `[nxtObjectPageHeader]`, `[nxtObjectPageSummary]`, `[nxtSectionActions]`, `[nxtSubsectionActions]`, `[nxtObjectPageFooter]`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxt-object-page` input | `navigation` | `'anchors' \| 'tabs'` | `'anchors'` | `anchors`: mọi section xếp liền, cuộn một mạch, thanh neo theo section đang thấy (mặc định, theo Fiori). `tabs`: mỗi lần một section, dùng khi các section đều nặng (bảng dài) |
| `nxt-object-page` model | `section` | `string \| undefined` | `undefined` | `id` của section đang chọn (tab) / đang thấy (neo). Bỏ trống → section đầu. Ở `anchors`, gán từ ngoài không cuộn: dùng `goTo()` |
| `nxt-object-page` input | `navLabel` | `string` | `'Các phần của trang'` | Tên truy cập của thanh neo / tablist |
| `nxt-object-page` model | `expanded` | `boolean` | `true` | Header nội dung mở (two-way). `false`: ẩn header, hiện dòng tóm tắt gọn |
| `nxt-object-page` model | `pinned` | `boolean` | `false` | Ghim header: header + thanh dính cùng đứng yên khi cuộn. Bị bỏ qua khi header cao hơn 60% vùng cuộn |
| `nxt-object-page` input | `collapsible` | `boolean` | `true` | Hiện nút thu gọn / mở rộng header (chỉ khi có `[nxtObjectPageHeader]`) |
| `nxt-object-page` input | `pinnable` | `boolean` | `false` | Hiện nút ghim |
| `nxt-object-page` input | `collapseLabel` / `expandLabel` / `pinLabel` | `string` | `'Thu gọn phần tóm tắt'` / `'Mở rộng phần tóm tắt'` / `'Ghim phần tóm tắt'` | Tên truy cập + tooltip của nút; đổi được cho i18n |
| `nxt-object-page` method | `goTo(id: string, options?: { focus?: boolean })` | `void` | | Neo: cuộn tới section (tiêu đề nằm ngay dưới thanh dính) và mặc định đưa focus lên tiêu đề. Tab: chọn tab đó |
| `nxt-object-page-section` input | `id` | `string` | (bắt buộc) | Id của `section` render ra (đích neo, deep link `#id`) |
| `nxt-object-page-section` input | `title` | `string` | (bắt buộc) | Tiêu đề `h2`, nhãn neo / tab |
| `nxt-object-page-section` input | `count` | `number \| string` | `undefined` | Số đếm trên tab (chỉ `tabs`), cho số cần chú ý |
| `nxt-object-page-section` input | `busy` | `boolean` | `false` | Section đang tải: `aria-busy="true"` trên `section`; nội dung (skeleton) do nơi dùng đặt |
| `nxt-object-page-subsection` input | `title` | `string` | `undefined` | Tiêu đề `h3`; bỏ trống khi section chỉ có một khối |
| content | `[nxtObjectPageHeader]` | bất kỳ | | Header nội dung |
| content | `[nxtObjectPageSummary]` | bất kỳ (không focus được) | | Dòng tóm tắt khi header khuất |
| content | `nxt-object-page-section` | | | Các section theo thứ tự |
| content | `[nxtSectionActions]` (trong section) | nút | | Hành động cùng hàng tiêu đề section |
| content | `[nxtSubsectionActions]` (trong subsection) | nút | | Hành động cùng hàng tiêu đề khối con |
| content | `[nxtObjectPageFooter]` | nút, chỉ báo | | Thanh chân dính đáy (Huỷ / Lưu ở chế độ sửa). Nhánh S2 làm `nxt-action-bar`: đặt vào khe này khi có |

Output: `sectionChange`, `expandedChange`, `pinnedChange` (từ `model`).

## 4. Variants & sizes
| Cách dùng | Cấu hình | Dùng khi | Không dùng khi |
|-----------|----------|----------|----------------|
| Cuộn liền + thanh neo (mặc định) | `navigation="anchors"` | Hồ sơ đọc từ trên xuống, section vừa phải, ≤ 4 bảng lưới | Có section chứa bảng dài (> 20 dòng) hoặc nhiều bảng: dùng tab |
| Tab | `navigation="tabs"` | Mỗi section là một chủ đề nặng (bảng, danh sách dài); người dùng chỉ xem một phần mỗi lần | Section ngắn mà người dùng hay đọc liền nhau |
| Có thanh chân | thêm `[nxtObjectPageFooter]` | Chế độ sửa / tạo: Huỷ + Lưu luôn thấy; chế độ xem chỉ khi phải đọc hết mới quyết định (Duyệt / Từ chối) | Chế độ xem thường: hành động (Sửa, ⋯) ở topbar |
| Ghim được | `pinnable` | Header ngắn, người dùng cần nhìn tóm tắt khi đọc section (so số liệu) | Màn hẹp, header cao |

Không có size. Khoảng cách theo density.

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ neo / nút: chữ `text-hover` | ✓ ring token trên neo, nút, tiêu đề section (khi nhận focus từ bàn phím) | ✓ nút ghim `aria-pressed="true"` (icon `pinned`) | ✓ neo của section đang thấy: `aria-current="true"` + vạch chỉ báo; tab đang chọn theo `nxt-tabs` | — (neo luôn bấm được; section không disabled) | ✓ `busy` trên section → `aria-busy`; cả trang đang tải: nơi dùng đặt skeleton (`@nxt/ui/skeleton`) vào header và section | — (lỗi của form do `nxt-form-field`; lỗi cấp đối tượng: một `nxt-alert` đầu nội dung) | — (chế độ xem / sửa do nơi dùng đổi nội dung, bố cục giữ nguyên) | — (cần ít nhất một section) |

Trạng thái header (thuộc tính `data-header` trên host):
| Giá trị | Khi nào | Hiển thị |
|---------|---------|----------|
| `expanded` | `expanded` và header còn thấy | Header nội dung trong luồng, dòng tóm tắt gọn ẩn |
| `scrolled` | `expanded` nhưng đã cuộn qua header (snap khi cuộn) | Header cuộn khuất cùng nội dung; thanh dính hiện dòng tóm tắt gọn và đường kẻ dưới |
| `collapsed` | `expanded = false` | Header ẩn hẳn (`hidden`), dòng tóm tắt gọn hiện |
| `pinned` | `pinned` và được phép ghim | Header + thanh dính cùng dính trên cùng; nội dung cuộn phía dưới |

**Co lại khi cuộn (snapping):** header nội dung nằm trong luồng ở đầu trang và cuộn đi cùng nội dung; khi đã khuất hoàn toàn (thanh dính chạm mép trên vùng cuộn), trang chuyển `scrolled` và dòng tóm tắt gọn hiện trong thanh dính. Cuộn về đầu thì header hiện lại và dòng tóm tắt ẩn. Không đổi chiều cao header bằng animation, không nhảy nội dung. Bấm **Mở rộng** khi header đã cuộn khuất: header hiện tạm ở trên cùng (dính như khi ghim) cho tới lần cuộn tiếp theo, không cuộn mất vị trí đang đọc (theo Fiori: mở header tại chỗ). Nút **Thu gọn** thắng ghim.

**Ghim:** chỉ được ghim khi header cao không quá 60% chiều cao vùng cuộn (theo Fiori); vượt ngưỡng thì nút ghim ẩn và `pinned` bị bỏ qua (giá trị model giữ nguyên, ghim lại khi đủ chỗ).

## 6. Keyboard & ARIA
APG: thanh neo theo [landmark navigation](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/); chế độ tab theo [tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) (`nxt-tabs`, kích hoạt tự động).

**Chọn mô hình cho thanh neo: `nav` + nút, không phải tablist.** Ở chế độ cuộn liền, mọi section cùng hiện trên trang; `role="tablist"` sẽ hứa với screen reader rằng chỉ một panel hiện và các panel khác bị ẩn, sai với thực tế. Thanh neo là mục lục trong trang: `nav` có tên (liệt kê được bằng phím landmark), mỗi neo là `button` (không dùng `a href="#id"` vì ứng dụng có `<base href>` sẽ điều hướng khỏi trang), neo hiện tại có `aria-current="true"`. Mỗi neo là một điểm dừng Tab (hành vi native); thêm ←/→/Home/End như đường tắt (Fiori: ←/→ giữa các neo), không bắt người dùng học. Ở chế độ tab, nội dung thật sự chỉ hiện một phần nên dùng đúng APG tabs (một điểm dừng Tab, kích hoạt tự động).

| Phím | Hành vi |
|------|---------|
| Tab / Shift+Tab | Đi qua từng neo (mỗi neo một điểm dừng), nút thu gọn, nút ghim, rồi vào nội dung section theo thứ tự DOM |
| Enter / Space (trên neo) | Cuộn tới section (tiêu đề nằm ngay dưới thanh dính; cuộn mượt, tức thì khi giảm chuyển động), đưa focus lên tiêu đề `h2` của section; neo đó thành `aria-current` |
| → / ← (trên neo) | Focus neo kế tiếp / trước, vòng ở hai đầu; không cuộn trang |
| Home / End (trên neo) | Focus neo đầu / cuối |
| Enter / Space (nút thu gọn) | Thu gọn / mở rộng header (`aria-expanded`) |
| Enter / Space (nút ghim) | Ghim / bỏ ghim (`aria-pressed`) |
| Tab (chế độ `tabs`) | Vào tablist tại tab đang chọn (một điểm dừng Tab); Tab tiếp theo vào panel (`tabindex="0"`) |
| → / ← (chế độ `tabs`) | Chọn và focus tab kế tiếp / trước, vòng ở hai đầu (kích hoạt tự động) |
| Home / End (chế độ `tabs`) | Chọn và focus tab đầu / cuối |

- Thanh neo: `nav` `aria-label` = `navLabel`, `ul role="list"`, mỗi `li` một `button`. Neo hiện tại `aria-current="true"`; khi cuộn, neo đổi theo section đang thấy (scroll-spy) mà không thông báo (không làm ồn).
- Section: phần tử `section` có `aria-labelledby` trỏ tới `h2` của nó (landmark region có tên), `aria-busy="true"` khi `busy`.
- Tiêu đề section `h2` có `tabindex="-1"`: không nằm trong thứ tự Tab, chỉ nhận focus khi bấm neo; vòng focus chỉ hiện khi đến từ bàn phím. Khối con là `h3`. Trang có đúng một `h1` (tiêu đề trên topbar).
- Chế độ tab: tab `role="tab"`, `aria-selected`, `aria-controls` (chỉ khi panel đã render); panel là `section role="tabpanel"` `aria-labelledby` trỏ tới tab, `tabindex="0"`. `h2` vẫn có nhưng ẩn bằng mắt (`nxt-visually-hidden`), nên điều hướng theo heading vẫn đủ h1 → h2 → h3. Section chỉ render khi được mở lần đầu, sau đó giữ lại (ẩn) nên chữ đang nhập không mất khi chuyển tab.
- Nút thu gọn: `aria-expanded` = header đang thấy, `aria-controls` = id của header; tooltip cùng tên. Nút ghim: `aria-pressed`, tên cố định `pinLabel`.
- **Focus không bị che (WCAG 2.4.11):** tiêu đề section có `scroll-margin-block-start` bằng chiều cao phần dính phía trên; khi focus vào một phần tử bị thanh dính trên hoặc thanh chân che, trang tự cuộn vừa đủ để phần tử hiện ra.
- Dòng tóm tắt gọn chỉ là chữ (không đặt phần tử focus được), ẩn hoàn toàn khỏi cây truy cập khi header đang thấy.
- Giảm chuyển động: cuộn mượt và chuyển trạng thái header dùng thời lượng từ token `motion` (về 0 ở `reduced`); cuộn tới section dùng `behavior: 'auto'` khi `--nxt-motion-duration-normal` = 0.
- Focus ban đầu do nơi dùng quyết định (theo Fiori): chế độ xem → tiêu đề trang (`focusTitle()` của page header); chế độ sửa → trường bắt buộc còn trống đầu tiên, không có thì trường sửa được đầu tiên.

## 7. Tokens
Component tokens (`packages/tokens/src/component/object-page.tokens.json`), chỉ alias semantic:

| Token | Alias semantic | Ghi chú |
|-------|----------------|---------|
| `header-bg` | `color.bg.surface` | Nền header nội dung |
| `section-bg` | `color.bg.surface` | Nền section |
| `border` | `color.border.subtle` | Đường kẻ mảnh: dưới thanh neo / thanh dính, giữa các khối con; viền ngoài card chỉ khi forced-colors |
| `radius` | `radius.container` | Bo góc header, section và thanh chân |
| `shadow` | `elevation.card` | Bóng mềm của header và section |
| `footer-shadow` | `elevation.overlay` | Bóng thanh chân dính đáy |
| `bar-bg` | `color.bg.canvas` | Nền thanh dính (che nội dung cuộn phía dưới, cùng màu nền trang) |
| `footer-bg` | `color.bg.surface` | Nền thanh chân |
| `title-text` | `color.text.strong` | Tiêu đề section / khối con |
| `summary-text` | `color.text.subtle` | Dòng tóm tắt gọn |
| `anchor-text` | `color.text.subtle` | Neo chưa chọn |
| `anchor-text-hover` | `color.text.default` | Neo khi hover |
| `anchor-text-current` | `color.text.strong` | Neo hiện tại |
| `anchor-indicator` | `color.border.selected` | Vạch dưới neo hiện tại (cặp `border.selected` / `canvas` cần ≥ 3:1, xem §11) |
| `anchor-height` | `size.control.lg` | Chiều cao neo (vùng chạm) |

Dùng thẳng semantic: `space.inset.{sm,md,lg}`, `space.gap.{xs,sm,md,lg}`, `space.section.sm`, `typography.{heading-md,heading-sm,label-md,body-sm}`, `border-width.{default,strong}`, `radius.{control,pill}`, `z.sticky`, `size.icon.sm`, `focus.ring.*`, `motion.*`.

## 8. Density, responsive, i18n
- Khoảng cách, chiều cao neo theo density; cỡ chữ không đổi.
- Header nội dung: các khối xếp ngang, tự xuống dòng khi hẹp, **không cắt chữ** (theo Fiori: facet không bị cắt). Avatar luôn bên trái.
- Thanh neo / tab không xuống dòng: tràn thì cuộn ngang trong thanh (thanh cuộn mảnh, không ẩn), neo / tab hiện tại tự cuộn vào tầm nhìn. Số đếm của tab viết trong ngoặc sau nhãn ("Hợp đồng (3)").
- Trang hẹp hơn `breakpoint.md` (768px, đo bề rộng của chính trang): nút ghim ẩn và không ghim (Fiori: không ghim trên điện thoại).
- Thanh chân: nội dung xuống dòng khi hẹp; nút giữ thứ tự NXT (primary ở cuối).
- Tên tiếng Việt dài ("Phòng Quản trị Nguồn nhân lực & Phát triển Tổ chức") xuống dòng trong header và trong section; dòng tóm tắt gọn cắt "…" một dòng (chữ đủ vẫn có trong header và DOM).
- Chuỗi mặc định tiếng Việt, đổi được qua input: `navLabel`, `collapseLabel`, `expandLabel`, `pinLabel`.
- Vùng cuộn là tổ tiên gần nhất có `overflow` cuộn được (vùng nội dung của `nxt-app-shell`), hoặc tài liệu. Thanh dính và thanh chân dính theo vùng đó.

## 9. Content guidelines
- Tiêu đề trang (trên topbar) là tên hoặc mã đối tượng; chế độ tạo dùng "<Đối tượng> mới" ("Nhân viên mới") cho tới khi có tên.
- Header nội dung chỉ chứa thông tin thiết yếu để đặt ngữ cảnh (Fiori: tối đa 5 cặp nhãn–giá trị một nhóm, một avatar). Thông tin còn lại vào section "Thông tin chung". Không lặp tiêu đề trang trong header.
- Tiêu đề section là danh từ ngắn, sentence case: "Thông tin chung", "Công việc", "Hợp đồng", "Lịch sử". Không lặp tiêu đề section ở khối con duy nhất; bảng duy nhất trong section mang tên section.
- Thanh chân ở chế độ sửa: bên trái chỉ báo ("Bản nháp · đã lưu lúc 14:32", số lỗi), bên phải Huỷ rồi Lưu (primary ở cuối).

## 10. Acceptance (Definition of Done)
- [x] Example: thanh neo + header co gọn + ghim (`object-page-anchors`), chế độ tab (`object-page-tabs`); template "Hồ sơ nhân viên" (xem / sửa / đang tải, thanh chân)
- [x] Unit test (15, `src/object-page.spec.ts`, 2026-11-06): neo là `nav` có tên + mỗi neo một Tab stop; kích hoạt neo (click = Enter/Space native) cuộn vùng cuộn tới section và focus `h2`; `goTo()` không focus; ←/→ vòng, Home/End chỉ chuyển focus; scroll-spy (`aria-current` theo vị trí, cuối trang → section cuối); ẩn thanh neo khi 1 section; tab: tablist APG, roving tabindex, `aria-controls` / `aria-labelledby`, dựng lười + giữ chữ đã nhập, →/End/vòng chọn và focus; nút thu gọn `aria-expanded` / `aria-controls` / nhãn + dòng tóm tắt; nút ghim `aria-pressed` + `data-sticky`; không có nút khi không có header; `busy` → `aria-busy`; khe chân trang. Chưa có test trình duyệt thật cho thanh dính, snap khi cuộn, peek và focus không bị che (jsdom không có layout): cần e2e
- [ ] axe: 0 vi phạm ở light/dark × 3 density (chạy ở phiên chính: `npm run build && npm run test:a11y`)
- [x] `npm run ds:check` sạch (tokens + hardcoded) cho file của component
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- Cặp tương phản `semantic.color.border.selected` / `semantic.color.bg.canvas` (vạch neo hiện tại nằm trên nền thanh dính `canvas`) chưa có trong `contrastPairs`; `nxt-tabs` mới kiểm `border.selected` / `surface`. Đề xuất thêm cặp này (min 3).
- `scroll="page"` của `nxt-app-shell` (topbar dính trên cửa sổ): thanh dính của object page chưa bù chiều cao topbar, sẽ nằm dưới topbar. Ứng dụng nghiệp vụ dùng `scroll="container"` nên chưa ảnh hưởng.
- Thanh neo / tab tràn đang cuộn ngang; Fiori dồn neo thừa vào menu tràn, `nxt-tabs` dùng "Xem thêm". Làm sau nếu có trang > 7 section.
- Phím ←/→ chưa đảo chiều khi RTL (giống `nxt-tabs`).
- Neo cho khối con (menu con của section) chưa có.
- Chế độ sửa từng section (sửa một phần) không có API riêng: nơi dùng đặt nút vào `[nxtSectionActions]` và tự đổi nội dung section.

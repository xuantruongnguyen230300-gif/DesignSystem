---
component: calendar
status: beta
owner: "NXT core"
updated: 2026-11-06
apg-pattern: grid (lưới ngày theo "Date Picker Dialog" của WAI-ARIA APG)
---

# Calendar: Spec

Entry `@nxt/ui/calendar`: component `nxt-calendar` (lưới tháng dùng chung cho `nxt-date-picker`, `nxt-date-range-picker` và lịch đặt thẳng trên trang) cùng các hàm ngày thuần (`nxtParseDate`, `nxtFormatDate`, `nxtAddDays`…) mà các picker dùng lại.

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** chọn một ngày hoặc một khoảng ngày khi cần **nhìn thấy thứ trong tuần** và ngữ cảnh của tháng (ngày lễ, ngày nghỉ, hôm nay), không bị mơ hồ định dạng ngày.
- **Khi nào dùng:**
  - Bên trong `nxt-date-picker` / `nxt-date-range-picker` (component tự dựng, nơi dùng không gọi trực tiếp).
  - Lịch luôn hiển thị trên trang khi việc chọn ngày là trọng tâm: chọn ngày nghỉ trong màn đăng ký nghỉ phép, xem ngày lễ của tháng ở dashboard nhân sự.
- **Khi nào KHÔNG dùng:**
  - Ô nhập ngày trong form, bộ lọc: dùng [`nxt-date-picker`](/components/date-picker) (lịch mặc định đóng, gõ được). Theo SAP Fiori: Calendar, lịch luôn hiện không dành cho màn nhập liệu nhiều trường hay khi bàn phím là cách nhập chính.
  - Khoảng ngày là việc chính của trường: dùng `nxt-date-range-picker`.
  - So lịch nhiều người, ca làm: chưa có (planning calendar, P3).
  - Chọn ngày + giờ: chưa có (`nxt-datetime-picker`, P3).

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-calendar` | ✓ | Không có viền/nền riêng; đặt trong card, panel hoặc popover |
| 2 | Nút trước (`‹`) | ✓ | "Tháng trước" / "Năm trước" / "20 năm trước" theo mức xem |
| 3 | Tiêu đề (nút) | ✓ | "Tháng 11 năm 2026" → bấm để lên mức tháng ("Năm 2026") → mức năm ("2020 – 2039") → về mức ngày |
| 4 | Nút sau (`›`) | ✓ | Đối xứng nút trước |
| 5 | Hàng tên thứ | ✓ (mức ngày) | `T2 T3 T4 T5 T6 T7 CN`; tuần bắt đầu **Thứ Hai** (ISO 8601) |
| 6 | Lưới `role="grid"` | ✓ | Mức ngày luôn 6 hàng × 7 (chiều cao không nhảy giữa các tháng); mức tháng 4 × 3; mức năm 5 × 4 (20 năm/trang) |
| 7 | Ô ngày | ✓ | Số ngày; ngày của tháng kề hiện mờ, bấm được (chuyển tháng) |
| 8 | Dấu hiệu ô | — | Hôm nay (vòng viền + chữ đậm), đã chọn (nền đặc), trong khoảng (dải nền), ngày nghỉ (nền xám), ngày lễ (chấm tròn + chữ màu), sự kiện (gạch ngang) |
| 9 | Nút "Hôm nay" | — | Khi `showToday`; đưa lịch về hôm nay và focus vào đó (không chọn) |
| 10 | Chú giải (legend) | — | Tự hiện khi có ngày nghỉ/ngày đặc biệt: các loại dấu hiệu + danh sách ngày đặc biệt của tháng đang xem ("02/09 · Quốc khánh") |

## 3. API (Angular)
Selector `nxt-calendar`. Ngày luôn là chuỗi ISO `yyyy-MM-dd` (ngày lịch, không có giờ và múi giờ).

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `mode` | `'single' \| 'range'` | `'single'` | Chọn một ngày hoặc một khoảng |
| model | `value` | `string \| null` | `null` | Ngày đã chọn (mode `single`) |
| model | `range` | `NxtDateRange \| null` (`{ start, end }`) | `null` | Khoảng đã chọn (mode `range`); `start ≤ end`, tính cả ngày cuối |
| input | `min`, `max` | `string \| null` | `null` | Ngày ngoài khoảng bị khoá, focus bị giữ trong khoảng |
| input | `dateFilter` | `((date: string) => boolean) \| null` | `null` | Trả `false` để khoá ngày rời rạc (ví dụ ngày đã có đơn) |
| input | `specialDays` | `NxtCalendarSpecialDay[]` (`{ date, kind, label }`) | `[]` | Ngày lễ, ngày nghỉ bù, sự kiện do sản phẩm truyền vào; `kind`: `'holiday' \| 'non-working' \| 'event'` |
| input | `nonWorkingWeekdays` | `number[]` (1 = Thứ Hai … 7 = Chủ Nhật) | `[]` | Thứ nghỉ cố định trong tuần, ví dụ `[6, 7]` |
| input | `today` | `string` | ngày hiện tại (giờ máy) | Ghi đè để test/example cố định |
| input | `startAt` | `string \| null` | `null` | Tháng mở ra và ô focus ban đầu khi chưa có lựa chọn (ví dụ ngày kết thúc mở sau ngày bắt đầu) |
| input | `showToday` | `boolean` | `false` | Hiện nút "Hôm nay" |
| input | `legend` | `boolean` | `true` | Cho phép hiện chú giải khi có ngày nghỉ/đặc biệt |
| input | `disabled` | `boolean` | `false` | Khoá cả lịch (vẫn xem và di chuyển focus được) |
| input | `labels` | `Partial<NxtCalendarLabels>` | tiếng Việt | Ghi đè mọi chuỗi (thứ, tháng, tiêu đề, tên nút, chú giải) |
| output | `dateSelected` | `string` | | Mỗi lần người dùng chọn một ngày (cả hai mode; kể cả chọn lại ngày đang chọn) |
| output | `rangeSelected` | `NxtDateRange` | | Khoảng vừa hoàn tất (ngày thứ hai được chọn) |
| method | `focusActiveCell()` | | | Đưa focus vào ô đang có `tabindex="0"` (picker gọi khi mở) |

DI: `NXT_CALENDAR_LABELS` (InjectionToken) để thay bộ chuỗi cho cả ứng dụng (ngx-translate); input `labels` ghi đè từng chuỗi tại chỗ.

Hàm thuần (export từ `@nxt/ui/calendar`):
- `nxtParseDate(text)` → `{ value: string \| null }` hoặc `{ error: true }`. Nhận `d/M/yyyy`, `dd-MM-yyyy`, `dd.MM.yyyy`, `ddMMyyyy`, ISO `yyyy-MM-dd`; khoảng trắng quanh dấu phân cách được bỏ qua. **Luôn là ngày–tháng–năm, không bao giờ đoán MM/dd**; năm phải đủ 4 chữ số (không đoán thế kỷ cho `85`); ngày không tồn tại (`31/02/2026`) là lỗi.
- `nxtParseDateRange(text)`: hai ngày như trên, phân cách bằng `–`, `—`, `-`, `~` hoặc "đến"; một ngày duy nhất = khoảng một ngày; ngày cuối trước ngày đầu thì tự đảo.
- `nxtFormatDate(iso)` → `dd/MM/yyyy`; `nxtFormatDateRange(range)` → `dd/MM/yyyy – dd/MM/yyyy` (gạch en có khoảng trắng). Không dùng `Intl` `dateStyle: 'short'` của `vi-VN` (ra `6/11/26`).
- `nxtAddDays`, `nxtAddMonths` (giữ số ngày, tháng ngắn hơn thì lùi về ngày cuối tháng: 31/01 → 28/02), `nxtCompareDate`, `nxtIsoWeekday`, `nxtTodayIso`.

## 4. Variants & sizes
| Mode | Dùng khi | Không dùng khi |
|------|----------|----------------|
| `single` | Một ngày cụ thể: ngày sinh, ngày hiệu lực | Cần hai mốc liên quan nhau |
| `range` | Kỳ nghỉ phép, công tác, kỳ chấm công, lọc theo kỳ | Hai ngày không liên quan (dùng hai trường) |

Không có size: ô lịch theo density (`size.control.md`: 28 / 32 / 40px). Không có variant màu.

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ nền `surface-hover`; mode range sau khi chọn ngày đầu: tô khoảng tạm tới ô đang hover/focus | ✓ ring token quanh ô (roving) | — (chọn là xong, không có trạng thái nhấn riêng) | ✓ nền đặc `bg.primary`; khoảng: dải `bg.selected`, hai đầu nền đặc; `aria-selected="true"` | ✓ ô ngoài `min`/`max`/`dateFilter`: chữ `text.disabled`, `aria-disabled="true"`, vẫn nhận focus; cả lịch khi `disabled` | — (dữ liệu ngày lễ là input đồng bộ) | — (lịch không nhận giá trị sai; lỗi thuộc ô nhập của picker) | — (dùng `disabled`; lịch chỉ xem thì không cần component tương tác) | ✓ chưa chọn: không ô nào `aria-selected="true"`, focus ở hôm nay |

Thêm: **hôm nay** (vòng viền `border.selected` + chữ đậm + `aria-current="date"`), **tháng kề** (chữ `text.subtle`), **ngày nghỉ** (nền `bg.subtle`), **ngày lễ** (chữ `text.danger` + chấm tròn), **sự kiện** (gạch ngang `icon.info`). Theo SAP Fiori: Calendar, ngày đặc biệt có chú giải và tooltip; NXT thêm **hình dạng** (chấm, gạch, nền) và **chữ** (chú giải, `aria-label`, `title`) để màu không là kênh duy nhất (WCAG 1.4.1).

## 6. Keyboard & ARIA
APG: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/ (phần lưới ngày).

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Nút trước → tiêu đề → nút sau → **một** ô của lưới (roving tabindex) → nút "Hôm nay" |
| <kbd>←</kbd> / <kbd>→</kbd> | Ngày trước / sau (qua ranh giới tháng thì lịch chuyển tháng). Mức tháng/năm: ô trước / sau |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Cùng thứ tuần trước / tuần sau. Mức tháng: ±3 tháng; mức năm: ±4 năm |
| <kbd>Home</kbd> / <kbd>End</kbd> | Thứ Hai / Chủ Nhật của tuần đang focus. Mức tháng/năm: đầu / cuối hàng |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | Tháng trước / sau, giữ số ngày (tháng ngắn hơn thì về ngày cuối tháng). Mức tháng: ±1 năm; mức năm: ±20 năm |
| <kbd>Shift</kbd>+<kbd>PageUp</kbd> / <kbd>Shift</kbd>+<kbd>PageDown</kbd> | Năm trước / sau (29/02 → 28/02) |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Mức ngày: chọn ngày (range: lần một đặt ngày đầu, lần hai hoàn tất). Mức tháng: vào mức ngày của tháng đó. Mức năm: vào mức tháng của năm đó |
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên tiêu đề | Lên mức tháng → mức năm → về mức ngày |

Focus bị giữ trong `[min, max]`: phím đưa focus ra ngoài thì dừng ở biên. Ô bị `dateFilter` khoá vẫn nhận focus (đọc "không chọn được"), để di chuyển theo tuần luôn đoán trước được; đây là khác biệt có chủ đích với Fiori (Fiori bỏ qua ô khoá rời rạc), theo thực hành APG cho ô lưới bị vô hiệu.

- Lưới ngày: `<table role="grid">`, `aria-labelledby` = tiêu đề; mode range thêm `aria-multiselectable="true"`. Hàng tên thứ là `th scope="col"` có `abbr` đầy đủ ("Thứ Hai"). Lưới tháng/năm không có hàng tiêu đề cột nên dựng bằng `div role="grid"` / `role="row"` / `role="gridcell"` (tránh luật bảng dữ liệu "ô phải có tiêu đề" của axe), cùng hành vi phím.
- Ô: `td` có `tabindex` (0 cho ô đang active, -1 cho ô khác), `aria-selected` (`true`/`false`), `aria-current="date"` cho hôm nay, `aria-disabled="true"` cho ô khoá. Tên ô là ngày đầy đủ: "Thứ Sáu, 6 tháng 11 năm 2026", thêm ", Ngày lễ: Quốc khánh", ", ngày bắt đầu" khi có.
- Nút trước/sau dùng `nxtIconButton` (có `aria-label`, chặn bằng `aria-disabled` khi vượt `min`/`max` để không mất focus).
- Tiêu đề là nút; tên = chữ hiển thị + hành động ("Tháng 11 năm 2026, chọn tháng"), đạt WCAG 2.5.3.
- Đổi tháng/năm bằng nút trước/sau/tiêu đề được đọc qua `LiveAnnouncer` (CDK); đổi bằng phím trong lưới thì tên ô mới đã chứa tháng/năm.
- Focus: `focusActiveCell()` đặt focus sau lần render kế tiếp (`afterNextRender`); chọn ở mức tháng/năm chuyển mức và giữ focus trong lưới.

## 7. Tokens
`packages/tokens/src/component/calendar.tokens.json`:

| Token | Alias semantic | Ghi chú |
|-------|----------------|---------|
| `cell-size` | `size.control.md` | Ô vuông, theo density |
| `cell-radius` | `radius.pill` | Kiểu iOS: ngày chọn / hôm nay / hover là hình tròn; dải khoảng ngày bo tròn hai đầu |
| `cell-text`, `cell-text-muted`, `cell-text-disabled` | `color.text.default`, `color.text.subtle`, `color.text.disabled` | Muted = ngày tháng kề |
| `cell-bg-hover` | `color.bg.surface-hover` | |
| `selected-bg`, `selected-text` | `color.bg.primary`, `color.text.on-primary` | Ngày chọn, hai đầu khoảng |
| `range-bg`, `range-text` | `color.bg.selected`, `color.text.default` | Dải khoảng (cả khoảng tạm khi hover) |
| `today-border`, `today-text` | `color.border.selected`, `color.text.strong` | |
| `non-working-bg` | `color.bg.subtle` | |
| `holiday-text`, `holiday-marker` | `color.text.danger`, `color.icon.danger` | |
| `event-marker` | `color.icon.info` | |
| `weekday-text`, `title-text` | `color.text.subtle`, `color.text.strong` | |
| `legend-text` | `color.text.subtle` | |

Dùng thẳng semantic: `space.gap.*`, `space.inset.*`, `typography.{label-md,label-sm,body-md,caption}`, `border-width.*`, `focus.ring.*`, `motion.duration.fast`, `size.icon.sm`.

Cặp tương phản cần có trong `contrastPairs` (đề xuất cho phiên chính, file dùng chung): `text.danger`/`bg.subtle` (ngày lễ rơi vào ngày nghỉ), `text.default`/`bg.selected`, `text.on-primary`/`bg.primary`, `border.selected`/`bg.surface` (≥ 3:1, vòng hôm nay).

## 8. Density, responsive, RTL/i18n
- Ô lịch = `size.control.md`: compact 28px (đạt vùng chạm tối thiểu 24×24), comfortable 32px, spacious 40px. Lịch rộng 7 ô, không co giãn; đặt trong container responsive.
- Chuỗi mặc định tiếng Việt: thứ "T2…T7, CN", tháng "Tháng 1…Tháng 12", tiêu đề "Tháng 11 năm 2026", tên ô "Thứ Sáu, 6 tháng 11 năm 2026". Tuần bắt đầu Thứ Hai, **không** lấy mặc định en-US (Chủ Nhật). Không dùng `Intl` để sinh tên (vi cho "tháng 11", thứ "Th 2"), nên mọi chuỗi đến từ `labels`.
- Lịch chỉ dùng Gregorian. Không hard-code ngày lễ Việt Nam: sản phẩm truyền `specialDays` từ cấu hình lịch làm việc.
- Logical properties; nút trước/sau dùng `chevron-left/right` (RTL không áp dụng cho tiếng Việt).

## 9. Content guidelines
- Nhãn ngày đặc biệt ngắn, danh từ: "Quốc khánh", "Nghỉ bù Quốc khánh", "Hạn chốt công". Không viết "Ngày lễ Quốc khánh" (loại đã có trong chú giải).
- Chú giải dùng tên loại: "Hôm nay", "Ngày nghỉ", "Ngày lễ", "Sự kiện".
- Không đặt lịch luôn hiện trong form nhiều trường; dùng picker.

## 10. Acceptance (Definition of Done)
- [x] Unit test phủ keyboard map §6 (mũi tên, Home/End, PageUp/PageDown, Shift+PageUp/PageDown, Enter/Space, đổi mức bằng tiêu đề, giữ focus trong min/max)
- [x] Unit test state → ARIA: `aria-selected`, `aria-current="date"`, `aria-disabled`, roving tabindex, `aria-multiselectable`, tên ô có ngày đặc biệt
- [x] Unit test hàm ngày: parse (mọi định dạng nhận, từ chối MM/dd không hợp lệ, năm 2 chữ số, ngày không tồn tại), format, cộng tháng cuối tháng
- [x] Example: một ngày (min/max, nút "Hôm nay", thứ nghỉ), khoảng + ngày đặc biệt + chú giải (`apps/docs/src/examples/calendar/`); mức tháng/năm chỉ có qua tương tác (chưa có example tĩnh)
- [ ] axe: 0 vi phạm ở sáng/tối/gọn (chưa chạy: `npm run test:a11y` thuộc phiên chính)
- [x] `npm run ds:check` sạch cho file của calendar (tokens + hardcoded)
- [x] Docs page đủ mục (skill `nxt-docs-page`)

## 11. Việc còn mở
- Hai tháng cạnh nhau cho khoảng vắt qua cuối tháng (Fiori Calendar §9) · P2.
- Chọn nhiều ngày rời, chọn cả tuần qua số tuần, cột số tuần ISO · P2/P3.
- Mức "chọn tháng" / "chọn năm" như một kiểu picker riêng (`granularity`) · P2.
- Ngày đầu tuần cấu hình được (hiện cố định Thứ Hai theo vi-VN) · P3.

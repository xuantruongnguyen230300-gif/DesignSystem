---
component: format
status: beta
owner: "NXT core"
updated: 2026-11-06
apg-pattern: "none (tiện ích định dạng, không có UI)"
---

# Format: Spec

Entry `@nxt/ui/format` gồm **hàm thuần** (`nxtNumber`, `nxtMoney`…) và **pipe standalone** cùng tên (`{{ v | nxtMoney }}`) để định dạng ngày, giờ, số, tiền, phần trăm, đơn vị, kích thước tệp và danh sách theo `vi-VN`. Luật đầy đủ cho người đọc nằm ở trang foundation `apps/docs/src/content/foundations/formatting.md`; spec này là nguồn sự thật về hành vi của code.

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** cùng một con số, cùng một ngày phải trông giống nhau ở mọi bảng, thẻ, form chỉ đọc, timeline của mọi sản phẩm. Hiện mỗi màn tự gọi `new Intl.NumberFormat('vi-VN')` với tuỳ chọn khác nhau, và `Intl` của `vi-VN` có vài bẫy (xem §8).
- **Khi nào dùng:** mọi giá trị hiển thị cho người đọc: ngày, giờ, khoảng ngày/giờ, thời gian tương đối, số, tiền, phần trăm, số gọn cho KPI, đơn vị đo, thời lượng, kích thước tệp, danh sách liệt kê, và giá trị chữ có thể rỗng.
- **Khi nào KHÔNG dùng (dùng gì thay thế):**
  - Mã định danh: mã nhân viên, số CCCD, số điện thoại, số tài khoản, mã danh mục. Hiển thị nguyên chuỗi, không phân cách nghìn (vẫn thêm `.nxt-tabular-nums` trong bảng).
  - Nhập liệu: định dạng ở đây chỉ để hiển thị. Ô nhập ngày dùng date picker, ô nhập số dùng control nhập số (chưa có).
  - Làm tròn tiền lương, thuế: là luật nghiệp vụ, backend quyết. UI chỉ hiển thị số đã chốt.

Theo SAP Fiori: Formatting Data (mọi giá trị đi qua formatter theo locale, không tự ghép chuỗi).

## 2. Anatomy
Không có UI. Mỗi định dạng là một cặp hàm + pipe:

| Hàm | Pipe | Kết quả mẫu (`vi-VN`) |
|-----|------|------------------------|
| `nxtNumber(v)` | `nxtNumber` | `1.590.000,99` |
| `nxtMoney(v)` | `nxtMoney` | `15.000.000 ₫` · `{ display: 'none' }` → `15.000.000` · `{ display: 'code' }` → `15.000.000 VND` |
| `nxtPercent(v)` | `nxtPercent` | `0.022` → `2,2%` · `{ ratio: false }`: `96.4` → `96,4%` |
| `nxtCompact(v)` | `nxtCompact` | `1600000` → `1,6 triệu` · `{ display: 'short' }` → `1,6 tr` · `3400000000` → `3,4 tỷ` |
| `nxtUnit(v, unit)` | `nxtUnit` | `12.5, 'kg'` → `12,5 kg` |
| `nxtFileSize(bytes)` | `nxtFileSize` | `1258291` → `1,2 MB` |
| `nxtDuration(phút)` | `nxtDuration` | `510` → `8 giờ 30 phút` |
| `nxtDate(d)` | `nxtDate` | `17/08/2023` · `{ time: true }` → `17/08/2023 14:05` · `{ style: 'text' }` → `17 tháng 8, 2023` · `{ style: 'weekday' }` → `Thứ Năm, 17/08/2023` |
| `nxtTime(d)` | `nxtTime` | `14:05` · `{ seconds: true }` → `14:05:09` |
| `nxtDateRange(a, b)` | `nxtDateRange` | `17/08/2023 – 19/08/2023` · một đầu: `Từ 17/08/2023`, `Đến 19/08/2023` |
| `nxtTimeRange(a, b)` | `nxtTimeRange` | `08:00 – 17:30` |
| `nxtRelative(d, { now })` | `nxtRelative` | `Vừa xong` · `3 phút trước` · `2 giờ trước` · `Hôm qua` · `3 ngày trước` · ngoài ±6 ngày → `dd/MM/yyyy` |
| `nxtList(items)` | `nxtList` | `Hà Nội, Đà Nẵng và TP.HCM` · `{ type: 'disjunction' }` → `A, B hoặc C` |
| `nxtText(v)` | `nxtText` | `'  Kế toán  '` → `Kế toán` · `''` → `—` |

Hằng số: `NXT_EMPTY = '—'`, `NXT_DEFAULT_LOCALE = 'vi-VN'`. Mảng `NXT_FORMAT_PIPES` gom mọi pipe để đưa vào `imports`.

## 3. API (Angular)
Mọi hàm nhận `options` tuỳ chọn; mọi pipe nhận cùng `options` làm tham số cuối (`{{ v | nxtMoney: { display: 'none' } }}`). Pipe khoảng nhận đầu cuối làm tham số thứ nhất (`{{ start | nxtDateRange: end }}`).

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| option chung | `locale` | `string` | `'vi-VN'` | Locale của `Intl` |
| option chung | `empty` | `string` | `'—'` | Chữ thay cho giá trị rỗng |
| `nxtNumber` | `minimumFractionDigits` / `maximumFractionDigits` | `number` | `0` / `3` (như `Intl`) | |
| `nxtNumber` | `fractionDigits` | `number` | — | Cố định số chữ số thập phân (cả min và max), dùng cho một cột/biểu đồ |
| `nxtMoney` | `currency` | `string` (ISO 4217) | `'VND'` | Số lẻ theo loại tiền (`VND` 0, `USD` 2) |
| `nxtMoney` | `display` | `'symbol' \| 'code' \| 'none'` | `'symbol'` | `none` cho ô bảng khi đơn vị đã ở tiêu đề cột |
| `nxtMoney` | `compact` | `boolean \| 'long' \| 'short'` | `false` | Số gọn cho KPI: `1,2 tỷ ₫` |
| `nxtPercent` | `ratio` | `boolean` | `true` | `true`: `0.25` → `25%` (như `Intl`); `false`: `25` → `25%` |
| `nxtPercent` | `maximumFractionDigits` / `fractionDigits` | `number` | `1` / — | |
| `nxtCompact` | `display` | `'long' \| 'short'` | `'long'` | `long`: nghìn, triệu, tỷ; `short`: nghìn, tr, tỷ |
| `nxtCompact` | `maximumFractionDigits` | `number` | `1` | |
| `nxtCompact` | `unit` | `string` | — | Thêm sau số gọn: `1,2 nghìn người` |
| `nxtCompact` | `labels` | `{ thousand?, million?, billion?, trillion? }` | tiếng Việt | Đổi chữ đơn vị (i18n) |
| `nxtUnit` | `unit` (tham số) | `string` | (bắt buộc) | Đơn vị đã dịch: `ngày`, `giờ`, `kg`, `₫/kg` |
| `nxtFileSize` | `maximumFractionDigits` | `number` | `1` | Cơ số 1024: B, KB, MB, GB, TB |
| `nxtDuration` | `hourLabel` / `minuteLabel` | `string` | `'giờ'` / `'phút'` | Đầu vào là **số phút** |
| `nxtDate` | `style` | `'numeric' \| 'text' \| 'weekday'` | `'numeric'` | |
| `nxtDate` | `time` | `boolean` | `false` | Thêm giờ `HH:mm` sau ngày |
| `nxtDate`, `nxtTime` | `seconds` | `boolean` | `false` | |
| `nxtDate`, `nxtTime`, khoảng | `timeZone` | `string` (IANA) | giờ máy | Ví dụ `'Asia/Ho_Chi_Minh'` |
| `nxtDateRange` | `fromLabel` / `toLabel` | `string` | `'Từ'` / `'Đến'` | Khi chỉ có một đầu |
| `nxtRelative` | `now` | `Date \| string \| number` | `new Date()` | Mốc so sánh; truyền cố định trong test và example |
| `nxtRelative` | `maxDays` | `number` | `6` | Ngoài ±`maxDays` ngày trả ngày tuyệt đối |
| `nxtRelative` | `justNow` | `string` | `'Vừa xong'` | Dưới 1 phút (quá khứ) |
| `nxtRelative` | `precision` | `'time' \| 'day'` | `'time'` | `day`: chỉ theo ngày lịch ("Hôm nay", "Ngày mai", "sau 3 ngày nữa") cho giá trị chỉ có ngày (sinh nhật, hạn) |
| `nxtList` | `type` | `'conjunction' \| 'disjunction'` | `'conjunction'` | "và" / "hoặc" |
| DI | `NXT_FORMAT_DEFAULTS` | `InjectionToken<NxtFormatDefaults>` | `{ locale: 'vi-VN', empty: '—' }` | Mặc định cho mọi pipe |
| DI | `provideNxtFormat(defaults)` | `Provider` | | Đổi locale/`empty`/`timeZone` cho cả ứng dụng hoặc một nhánh component |

Đầu vào chấp nhận:
- Số: `number`, chuỗi số dạng JS (`"15000000"`, từ API), `null`/`undefined`. Chuỗi đã định dạng (`"1.250"`) **không** được hỗ trợ (mơ hồ giữa các locale) và thành rỗng.
- Ngày: `Date`, epoch ms, chuỗi ISO. Chuỗi chỉ có ngày `yyyy-MM-dd` được hiểu là **ngày theo giờ máy** (không lệch một ngày ở múi giờ âm như `new Date('2026-11-06')`).

## 4. Variants & sizes
| Định dạng | Dùng khi | Không dùng khi |
|-----------|----------|----------------|
| Ngày `numeric` (mặc định) | Bảng, form chỉ đọc, bộ lọc: cột thẳng hàng, dễ so sánh | Câu văn, tiêu đề thẻ |
| Ngày `text` | Tiêu đề, thẻ, câu văn: "Hiệu lực từ 1 tháng 12, 2026" | Bảng dày |
| Ngày `weekday` | Lịch, chấm công, ca làm | Bảng không cần thứ |
| `nxtRelative` | Hoạt động gần đây, thẻ dashboard, thông báo (≤ ±6 ngày) | Hạn chót pháp lý, ngày hiệu lực: luôn ngày tuyệt đối |
| `nxtMoney` `symbol` | Tiền đứng riêng: thẻ, descriptions | Ô bảng: dùng `none` + đơn vị ở tiêu đề cột "Lương cơ bản (₫)" |
| `nxtCompact` `long` (mặc định) | KPI, trục biểu đồ | Bảng, số cần chính xác |
| `nxtCompact` `short` | Chỗ rất chật (nhãn trục, bộ đếm) | Văn bản đọc to: screen reader đọc "tr" thành chữ cái |

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | — (không có UI) | — | — | — | — | — | — (đầu vào sai → như rỗng) | — | ✓ `null`, `undefined`, `''`, chuỗi toàn khoảng trắng, `NaN`, ngày không hợp lệ → `empty` (mặc định "—") |

- Giá trị rỗng luôn là một ký hiệu, không bao giờ "N/A", "null", "0" giả hay "Invalid Date". Bảng và descriptions dùng cùng "—".
- `nxtText` bỏ khoảng trắng đầu/cuối (dữ liệu dán từ Excel) trước khi hiển thị; chuỗi chỉ có khoảng trắng là rỗng.
- `nxtList` bỏ phần tử rỗng/khoảng trắng; danh sách rỗng → `empty`.

## 6. Keyboard & ARIA
Không áp dụng: không có phần tử tương tác.
- Ký hiệu rỗng "—" được screen reader đọc là "gạch ngang dài" hoặc bỏ qua. Nơi hiển thị (bảng, descriptions) nên kèm chữ ẩn "Chưa có" nếu cần; việc đó thuộc component hiển thị.
- `nxtRelative` nên đi cùng ngày tuyệt đối: `<time [attr.datetime]="iso" [title]="d | nxtDate: { time: true }">{{ d | nxtRelative: { now } }}</time>`.
- Số gọn `short` ("1,2 tr") đọc kém bằng screen reader; dùng `long` khi chữ là nội dung chính.

## 7. Tokens
Không áp dụng: tiện ích không có style. Nơi hiển thị số tự thêm `.nxt-tabular-nums` / căn phải.

## 8. Density, responsive, i18n
- Density/responsive: không áp dụng.
- Bẫy `Intl` `vi-VN` đã xử lý (kiểm bằng Node 20 ICU):
  - `dateStyle: 'short'` cho `17/8/23` (không số 0, năm 2 chữ số) → dùng `{ day: '2-digit', month: '2-digit', year: 'numeric' }`.
  - `formatRange` bỏ số 0 đứng đầu → khoảng ngày ghép tay từ hai lần định dạng.
  - `notation: 'compact'` dạng short cho `1,6 Tr`, `1,6 T` (T dễ hiểu nhầm) → bảng đơn vị riêng cho `vi`: nghìn / triệu (tr) / tỷ / nghìn tỷ. Locale khác dùng `Intl` compact.
  - `RelativeTimeFormat` `numeric: 'auto'` cho "Hôm kia"/"Ngày kia" ở ±2 ngày → chỉ dùng `auto` cho ±1 ngày ("Hôm qua", "Ngày mai"), còn lại `always` ("2 ngày trước", "sau 2 ngày nữa").
  - Giờ luôn 24 giờ (`hourCycle: 'h23'`), không AM/PM.
- Khoảng ngày/giờ dùng gạch ngang en "–" (không dấu trừ, không gạch nối), có khoảng trắng không ngắt (U+00A0) **trước** "–" để dấu không rơi xuống đầu dòng sau. Cùng một ngày: `nxtDateRange` trả một ngày; có `time` thì `06/11/2026 08:00 – 17:30`. Không rút gọn khoảng khi cùng tháng/năm (Fiori không có luật này; hai đầu đầy đủ giữ cột thẳng hàng).
- Ngày + giờ: `dd/MM/yyyy HH:mm` (ngày trước giờ).
- Số và đơn vị cách nhau bằng khoảng trắng không ngắt (`12,5 kg`, `15.000.000 ₫`), trừ `%` viết liền (`2,2%`) theo `Intl` vi.
- `Intl` làm tròn **nửa lên** (`15000000.5` → `15.000.001 ₫`); hiển thị số đã chốt từ backend.
- Mọi chữ tiếng Việt (`Từ`, `Đến`, `Vừa xong`, `giờ`, `phút`, đơn vị số gọn, "—") đổi được qua option hoặc `provideNxtFormat`, để ứng dụng dùng ngx-translate truyền chuỗi đã dịch.

## 9. Content guidelines
- Đơn vị viết đầy đủ tiếng Việt (`ngày`, `giờ`, `người`, `hồ sơ`); dạng ngắn chỉ cho `₫`, `kg`, `km`, `%`. Đơn giá dùng "/" (`1.200 ₫/kg`).
- Bảng: đơn vị chung của cột ghi ở tiêu đề cột (`Lương cơ bản (₫)`, `Thời lượng (giờ)`), ô chỉ có số.
- Thẻ/subtitle có đơn vị: "Tháng 10/2026 | tỷ ₫" (dấu "|" tách bổ ngữ với đơn vị).
- Số chữ số thập phân cố định trong cùng một cột/biểu đồ (`fractionDigits`).

## 10. Acceptance (Definition of Done)
- [x] Unit test mọi hàm và mọi pipe: giá trị thường, rỗng, không hợp lệ, số âm, ranh giới làm tròn số gọn, locale khác, `provideNxtFormat` (2026-11-06: 48/48 pass, chạy `ng test ui` với tsconfig tạm chỉ gồm spec format/card vì bản build test chung đang lỗi ở file dở của component khác)
- [x] Trang foundation `foundations/formatting.md` (luật + bảng ví dụ + cách dùng hàm/pipe) và example dùng pipe trong bảng
- [ ] axe: 0 vi phạm ở sáng/tối/gọn cho example (`npm run test:a11y`; phiên chính chạy)
- [x] `npm run ds:check` sạch (2026-11-06)
- [ ] Bảng API trong docs sinh tự động: `tools/docs/generate.mjs` chưa đọc `@Pipe` và hàm export, nên bảng hàm trên trang foundation đang viết tay

## 11. Việc còn mở
- Component hiển thị (table, descriptions, stat, badge, pagination, timeline) vẫn nhận chuỗi đã định dạng; chuyển dần sang dùng `@nxt/ui/format` ở nơi gọi (template HRM) trước, rồi cân nhắc input số trực tiếp (ví dụ `nxt-badge` định dạng số vi).
- Lớp "giá trị + đơn vị nhỏ" (`.nxt-num` + `__unit`) cho descriptions, dòng tổng bảng: P3.
- `nxtRelative` so ngày theo giờ máy (không theo `timeZone`).

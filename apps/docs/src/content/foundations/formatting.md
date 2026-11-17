---
title: Định dạng dữ liệu
description: Luật hiển thị ngày, giờ, số, tiền, phần trăm, đơn vị và giá trị rỗng theo vi-VN, kèm hàm và pipe của @nxt/ui/format để mọi màn hình viết giống nhau.
order: 7
status: beta
package: "@nxt/ui/format"
keywords:
  - dinh dang
  - format
  - ngay thang
  - so tien
  - tien te
  - vnd
  - phan tram
  - don vi
  - thoi gian tuong doi
  - pipe
---

# Định dạng dữ liệu

## Nguyên tắc

- **Mọi giá trị đi qua formatter, không tự ghép chuỗi.** Dùng `@nxt/ui/format` (hàm hoặc pipe). Mỗi màn tự gọi `Intl` với tuỳ chọn riêng là cách nhanh nhất để hai bảng cạnh nhau viết một con số theo hai kiểu.
- **Mặc định `vi-VN`.** Phân cách nghìn bằng dấu chấm, thập phân bằng dấu phẩy, ngày `dd/MM/yyyy`, giờ 24 giờ. Ví dụ chép từ tài liệu tiếng Anh (`1,590,000.99`, `8/17/23`, `11:15 AM`) phải đổi lại.
- **Giá trị rỗng là "—"** ở mọi nơi: bảng, descriptions, thẻ. Không viết "N/A", "null", "0" giả hay để lọt "Invalid Date".
- **Định dạng chỉ để hiển thị.** Làm tròn tiền lương, thuế là luật nghiệp vụ do backend quyết; giao diện hiển thị số đã chốt.
- **Mã định danh không phải số.** Mã nhân viên, số CCCD, số điện thoại, số tài khoản hiển thị nguyên chuỗi, không phân cách nghìn.

## Ngày và giờ

| Loại | Kết quả | Dùng khi |
|------|---------|----------|
| Ngày (mặc định) | `17/08/2023` | Bảng, form chỉ đọc, bộ lọc: cột thẳng hàng, dễ so sánh |
| Ngày + giờ | `17/08/2023 14:05` | Thời điểm gửi, duyệt, cập nhật |
| Ngày dạng chữ | `17 tháng 8, 2023` | Tiêu đề, câu văn: "Hiệu lực từ 1 tháng 12, 2026" |
| Ngày có thứ | `Thứ Năm, 17/08/2023` | Lịch, chấm công, ca làm |
| Giờ | `14:05` · có giây `14:05:09` | Luôn 24 giờ, không SA/CH |
| Khoảng ngày | `17/08/2023 – 19/08/2023` | Thời gian nghỉ, hiệu lực hợp đồng |
| Khoảng ngày cùng một ngày, có giờ | `06/11/2026 08:00 – 17:30` | Ca làm, cuộc họp |
| Một đầu khoảng | `Từ 17/08/2023` · `Đến 19/08/2023` | Hợp đồng không thời hạn |
| Khoảng giờ | `08:00 – 17:30` | Giờ làm việc |
| Tương đối | `Vừa xong` · `3 phút trước` · `2 giờ trước` · `Hôm qua` · `3 ngày trước` · `Ngày mai` | Hoạt động gần đây, thông báo, thẻ trang tổng quan |
| Tương đối theo ngày | `Hôm nay` · `Ngày mai` · `sau 3 ngày nữa` | Giá trị chỉ có ngày (sinh nhật, lịch nghỉ): `precision: 'day'`, không bao giờ ra "9 giờ trước" |

- Ngày luôn có số 0 đứng đầu và năm 4 chữ số. Không dùng `dateStyle: 'short'` của `Intl`: với `vi-VN` nó cho `17/8/23`.
- Khoảng ngày/giờ dùng **gạch ngang en "–"**, không dấu trừ hay gạch nối, có khoảng trắng hai bên. Hai đầu luôn đầy đủ, kể cả khi cùng tháng hoặc cùng năm, để cột thẳng hàng.
- Thời gian tương đối chỉ trong **±6 ngày**; xa hơn trả về ngày tuyệt đối. Ở ±2 ngày viết "2 ngày trước", không "Hôm kia" (không phải người đọc nào cũng quen). Luôn kèm ngày tuyệt đối trong `title` của phần tử `<time>`.
- Không dùng thời gian tương đối cho hạn chót pháp lý, ngày hiệu lực, ngày ký: những ngày đó phải đọc được chính xác.
- Thời lượng viết đầy đủ chữ: `8 giờ 30 phút`, `45 phút`; công, phép dùng số thập phân kèm đơn vị: `1,5 ngày`. Không viết `8h30`, `8.5h`.
- Múi giờ: mặc định giờ của máy (ứng dụng nội địa là `Asia/Ho_Chi_Minh`) và không ghi múi giờ; chỉ ghi khi dữ liệu thuộc chi nhánh nước ngoài.

## Số, tiền và phần trăm

| Loại | Kết quả | Ghi chú |
|------|---------|---------|
| Số | `10.000.000` · `1.590.000,99` · `-1.234,5` | Giữ số chữ số thập phân ít nhất có thể |
| Tiền VND | `15.000.000 ₫` | Không số lẻ, ký hiệu `₫` **sau** số, cách bằng khoảng trắng không ngắt |
| Tiền trong ô bảng | `15.000.000` | Đơn vị ở tiêu đề cột: "Lương cơ bản (₫)" |
| Mã tiền tệ | `15.000.000 VND` | Khi một màn có nhiều loại tiền, hoặc xuất dữ liệu |
| Ngoại tệ | `1.500,50 US$` · `15.000,99 €` | Số lẻ theo loại tiền |
| Phần trăm | `2,2%` · `96,4%` | Viết liền dấu %; một cột/biểu đồ cố định số chữ số thập phân |
| Số gọn (KPI) | `1,6 nghìn` · `1,2 triệu` · `18,6 tỷ` · `2,5 nghìn tỷ` | Thẻ, trục biểu đồ. Giá trị đầy đủ có trong bảng hoặc `title` |
| Số gọn ngắn | `1,2 tr` · `3,4 tỷ` | Chỉ chỗ rất chật (nhãn trục, bộ đếm) |
| Tiền gọn | `18,6 tỷ ₫` | Thẻ KPI |

**Luật ký hiệu tiền.** Tiền đứng riêng (thẻ, descriptions, câu văn) ghi `₫` sau số: `18.500.000 ₫`. Trong bảng, đơn vị chung của cột ghi ở tiêu đề cột `(₫)`, ô chỉ có số để cột gọn và thẳng hàng. Dùng mã `VND` thay `₫` khi trên cùng màn có nhiều loại tiền hoặc khi xuất ra Excel. Không viết "VNĐ", "đ", "đồng" lẫn lộn.

- Số gọn dạng chữ đầy đủ (`triệu`) là mặc định vì screen reader đọc đúng; dạng ngắn (`tr`) bị đọc thành chữ cái. Không dùng dạng compact của `Intl` cho `vi-VN` (`1,6 Tr`, `1,6 T`): "T" dễ hiểu nhầm.
- Số âm dùng dấu trừ; chỉ thêm màu hoặc icon khi có ý nghĩa nghiệp vụ, và không chỉ dựa vào màu.

## Đơn vị đo

| Đúng | Không nên |
|------|-----------|
| `12,5 kg` · `3 ngày` · `1.284 người` | `12,5kg` · `3d` · `1284 ng` |
| `1.200 ₫/kg` | `1.200 ₫ mỗi kg` |
| Tiêu đề cột "Thời lượng (giờ)", ô `8,5` | Ô `8,5 giờ` lặp ở mọi dòng |
| `1,2 MB` | `1258291 bytes` |

- Đơn vị nghiệp vụ viết đầy đủ tiếng Việt (`ngày`, `giờ`, `người`, `hồ sơ`), lấy từ từ điển dịch của sản phẩm, không lấy từ `Intl` (`Intl` vi cho `12,5 kilôgam`). Dạng ngắn chỉ cho `₫`, `kg`, `km`, `%`.
- Một cột cùng đơn vị: đơn vị ghi ở tiêu đề cột. Subtitle thẻ có đơn vị: "Tháng 10/2026 | tỷ ₫".
- Kích thước tệp theo cơ số 1024 (như Windows Explorer): B, KB, MB, GB.

## Chữ, danh sách và giá trị rỗng

| Đầu vào | Kết quả |
|---------|---------|
| `'  Kế toán tổng hợp '` (dán từ Excel) | `Kế toán tổng hợp` |
| `''`, `'   '`, `null`, `undefined` | `—` |
| Số `NaN`, ngày không tồn tại (`2026-13-45`) | `—` |
| `['Hà Nội', 'Đà Nẵng', 'TP.HCM']` | `Hà Nội, Đà Nẵng và TP.HCM` |
| Cùng danh sách, kiểu "hoặc" | `Hà Nội, Đà Nẵng hoặc TP.HCM` |

- Bỏ khoảng trắng đầu/cuối trước khi hiển thị. Khi **nhập**, cắt khoảng trắng ở trường định danh (mã nhân viên, email, CCCD, số tài khoản), giữ nguyên ở ghi chú, lý do, mô tả.
- Danh sách liệt kê dùng formatter danh sách ("A, B và C"), không ghép dấu phẩy cứng.
- Ô số tiền trống có thể để trống hẳn (`empty: ''`) nếu cả bảng thống nhất như vậy; mặc định là "—".

## Cách dùng trong code

Import hàm cho TypeScript, pipe cho template. `NXT_FORMAT_PIPES` gom mọi pipe:

```ts
import { NXT_FORMAT_PIPES, nxtMoney, nxtDate } from '@nxt/ui/format';

@Component({
  imports: [NXT_FORMAT_PIPES],
  template: `
    <td class="nxt-table__num">{{ row.base | nxtMoney: { display: 'none' } }}</td>
    <td>{{ row.start | nxtDateRange: row.end }}</td>
    <time [attr.datetime]="iso" [title]="sent | nxtDate: { time: true }">{{ sent | nxtRelative: { now: now() } }}</time>
    <nxt-stat [value]="total | nxtCompact" />
  `,
})
export class PayrollPage {
  readonly csvValue = nxtMoney(18_500_000, { display: 'code' }); // "18.500.000 VND"
}
```

::example{format-table}

::example{format-details}

| Hàm / pipe | Ví dụ | Tuỳ chọn chính |
|------------|-------|----------------|
| `nxtNumber` | `1.590.000,99` | `fractionDigits`, `minimumFractionDigits`, `maximumFractionDigits` |
| `nxtMoney` | `15.000.000 ₫` | `currency` (`'VND'`), `display` (`'symbol'` · `'code'` · `'none'`), `compact` |
| `nxtPercent` | `0.022` → `2,2%` | `ratio` (`true`: giá trị là tỉ lệ; `false`: đã là phần trăm), `fractionDigits` |
| `nxtCompact` | `1,2 triệu` | `display` (`'long'` · `'short'`), `maximumFractionDigits` (1), `unit`, `labels` |
| `nxtUnit` | `nxtUnit(12.5, 'kg')` → `12,5 kg` | như `nxtNumber` |
| `nxtFileSize` | `1,2 MB` | `maximumFractionDigits` |
| `nxtDuration` | `510` (phút) → `8 giờ 30 phút` | `hourLabel`, `minuteLabel` |
| `nxtDate` | `17/08/2023` | `style` (`'numeric'` · `'text'` · `'weekday'`), `time`, `seconds`, `timeZone` |
| `nxtTime` | `14:05` | `seconds`, `timeZone` |
| `nxtDateRange` | `nxtDateRange(a, b)` · pipe `a \| nxtDateRange: b` | như `nxtDate`, `fromLabel`, `toLabel` |
| `nxtTimeRange` | `08:00 – 17:30` | `seconds`, `timeZone` |
| `nxtRelative` | `3 phút trước` | `now`, `maxDays` (6), `justNow`, `precision` (`'time'` · `'day'`) |
| `nxtList` | `A, B và C` | `type` (`'conjunction'` · `'disjunction'`) |
| `nxtText` | `Kế toán` | `empty` |

Mọi hàm nhận thêm `locale` (mặc định `'vi-VN'`) và `empty` (mặc định `'—'`). Số nhận `number` hoặc chuỗi số từ API (`"15000000"`); ngày nhận `Date`, epoch ms hoặc chuỗi ISO, riêng chuỗi `yyyy-MM-dd` được hiểu là ngày theo giờ máy (không lệch một ngày như `new Date('2026-11-06')` ở múi giờ âm).

- **Đổi mặc định cho cả ứng dụng:** `providers: [provideNxtFormat({ timeZone: 'Asia/Ho_Chi_Minh' })]`. Ứng dụng dùng ngx-translate truyền chữ đã dịch qua tuỳ chọn (`fromLabel`, `justNow`, `labels`…) hoặc `empty`.
- **Thời gian tương đối là pipe thuần:** nó chỉ tính lại khi giá trị hoặc `now` đổi. Truyền một `now` do ứng dụng cập nhật (ví dụ mỗi phút), và luôn truyền `now` cố định trong test, example.
- Component hiển thị (`nxt-stat`, bảng, descriptions) nhận chuỗi **đã định dạng**; định dạng ở nơi gọi bằng pipe.

## Nên / Không nên

| Nên | Không nên |
|-----|-----------|
| `17/08/2023` | `17/8/23` · `2023-08-17` · `08/17/2023` |
| `17/08/2023 – 19/08/2023` | `17/08/2023 - 19/08/2023` · `17–19/08/2023` |
| `14:05` | `2:05 CH` · `14h05` |
| `15.000.000 ₫` | `15,000,000 VND` · `15.000.000đ` · `₫15.000.000` |
| Cột "Lương cơ bản (₫)", ô `18.500.000` | Ô `18.500.000 ₫` lặp ở mọi dòng |
| `2,2%` | `2.2 %` |
| `18,6 tỷ ₫` trên thẻ KPI | `18.640.000.000 ₫` trên thẻ, `18,6 T` |
| `8 giờ 30 phút` | `8h30` · `8.5h` |
| `—` cho giá trị trống | `N/A` · `null` · `0` |
| Mã nhân viên `0012045` | `12.045` |
| `Hà Nội, Đà Nẵng và TP.HCM` | `Hà Nội, Đà Nẵng, TP.HCM` khi ý là "và" |

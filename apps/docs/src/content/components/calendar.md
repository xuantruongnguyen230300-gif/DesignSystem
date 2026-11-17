---
title: Calendar
description: Lưới lịch tháng luôn hiển thị để chọn một ngày hoặc một khoảng khi người dùng cần thấy thứ trong tuần, ngày lễ và ngày nghỉ; tuần bắt đầu Thứ Hai, phím theo WAI-ARIA APG.
status: beta
group: Nhập liệu
order: 10
package: "@nxt/ui/calendar"
keywords:
  - lich
  - lich thang
  - chon ngay
  - khoang ngay
  - ngay le
  - ngay nghi
  - calendar
  - date
---

# Calendar

`nxt-calendar` là lưới tháng dùng chung cho [Date picker](/components/date-picker) và [Date range picker](/components/date-picker#khoang-ngay). Dùng trực tiếp khi lịch **là nội dung chính** của vùng màn hình. Giá trị luôn là chuỗi ISO `yyyy-MM-dd`.

## Khi nào dùng

- Lịch luôn hiển thị khi chọn ngày là việc chính: chọn ngày nghỉ trong màn đăng ký nghỉ phép, chọn ngày phỏng vấn còn trống.
- Người dùng cần thấy **thứ trong tuần**, ngày lễ, ngày nghỉ của công ty ngay khi chọn.
- Xem nhanh các ngày đặc biệt của tháng trên dashboard nhân sự (chú giải liệt kê ngày của tháng đang xem).

## Khi nào không dùng

- **Ô ngày trong form, bộ lọc**: dùng [Date picker](/components/date-picker). Lịch mặc định đóng, gõ được `06112026`, không chiếm chỗ.
- **Khoảng ngày trong form**: dùng [Date range picker](/components/date-picker#khoang-ngay).
- **So lịch nhiều người, ca làm**: chưa có (planning calendar). Tạm dùng [Table](/components/table).
- **Ngày + giờ**: chưa có. Tạm dùng date picker và ô giờ cạnh nhau.

## Ví dụ

::example{calendar-basic}

Chọn khoảng: bấm ngày đầu, di chuột (hoặc dùng phím mũi tên) để xem khoảng tạm, bấm ngày cuối. Ngày cuối trước ngày đầu thì tự đảo. Khoảng **tính cả ngày cuối**.

::example{calendar-range}

## Anatomy

| # | Phần | Ghi chú |
|---|------|---------|
| 1 | Nút trước / sau | "Tháng trước" / "Tháng sau"; ở mức tháng là năm, mức năm là 20 năm. Khoá khi vượt `min` / `max` |
| 2 | Tiêu đề (nút) | "Tháng 11 năm 2026". Bấm để lên mức tháng → mức năm → về mức ngày |
| 3 | Hàng tên thứ | `T2 T3 T4 T5 T6 T7 CN`, tuần bắt đầu Thứ Hai |
| 4 | Lưới ngày | Luôn 6 hàng, chiều cao không nhảy giữa các tháng. Ngày của tháng kề hiện mờ, bấm được |
| 5 | Nút "Hôm nay" | Khi `showToday`: đưa lịch về hôm nay, **không** chọn |
| 6 | Chú giải | Tự hiện khi có ngày nghỉ hoặc ngày đặc biệt: các loại dấu hiệu và danh sách ngày đặc biệt của tháng |

## Hành vi & trạng thái

| Trạng thái | Hiển thị | Cho screen reader |
|------------|----------|-------------------|
| Hôm nay | Vòng viền + chữ đậm | `aria-current="date"` |
| Đã chọn | Nền đặc + chữ đậm | `aria-selected="true"` |
| Trong khoảng | Dải nền nối liền, bo hai đầu | `aria-selected="true"` trên mọi ngày của khoảng; tên ô thêm "ngày bắt đầu" / "ngày kết thúc" |
| Ngày nghỉ | Nền xám | Tên ô thêm "Ngày nghỉ" |
| Ngày lễ | Chữ màu + **chấm tròn** | Tên ô thêm "Ngày lễ: Tết Dương lịch"; `title` khi rê chuột |
| Sự kiện | **Gạch ngang** dưới số | Tên ô thêm "Sự kiện: Hạn chốt công tháng 11" |
| Không chọn được (`min`, `max`, `dateFilter`) | Chữ mờ, con trỏ cấm | `aria-disabled="true"`, vẫn nhận focus |

Màu không bao giờ là kênh duy nhất: mỗi loại ngày có thêm hình dạng (chấm, gạch, nền) và chữ (chú giải, tên ô).

- **Ngày lễ, ngày nghỉ bù do sản phẩm truyền vào** qua `specialDays` (`{ date, kind, label }`) từ cấu hình lịch làm việc; NXT không có sẵn lịch lễ Việt Nam. Thứ nghỉ cố định trong tuần dùng `nonWorkingWeekdays` (ví dụ `[6, 7]`).
- `min` / `max` giữ focus trong khoảng; ô bị `dateFilter` khoá vẫn nhận focus để di chuyển theo tuần luôn đoán được.
- `today` mặc định là ngày trên máy; đặt cố định trong test và ví dụ.
- Lựa chọn giữ nguyên khi chuyển tháng. Chọn ngày đầu của khoảng mới thì khoảng cũ được thay bằng khoảng tạm.

## Accessibility

Lưới là `table role="grid"` theo mẫu [Date Picker Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/) của WAI-ARIA APG, tên lấy từ tiêu đề tháng. Chỉ một ô nằm trong thứ tự <kbd>Tab</kbd> (roving tabindex).

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Nút trước → tiêu đề → nút sau → ô đang chọn của lưới → "Hôm nay" |
| <kbd>←</kbd> / <kbd>→</kbd> | Ngày trước / sau (qua ranh giới thì sang tháng kề). Mức tháng, năm: ô trước / sau |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Cùng thứ tuần trước / sau. Mức tháng: ±3 tháng; mức năm: ±4 năm |
| <kbd>Home</kbd> / <kbd>End</kbd> | Thứ Hai / Chủ Nhật của tuần. Mức tháng, năm: đầu / cuối hàng |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | Tháng trước / sau, giữ số ngày (31/01 → 28/02). Mức tháng: ±1 năm; mức năm: ±20 năm |
| <kbd>Shift</kbd>+<kbd>PageUp</kbd> / <kbd>Shift</kbd>+<kbd>PageDown</kbd> | Năm trước / sau |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Chọn ngày (khoảng: lần một là ngày đầu, lần hai là ngày cuối). Mức tháng, năm: mở tháng / năm đó |
| <kbd>Enter</kbd> trên tiêu đề | Lên mức tháng → mức năm → về mức ngày |

- Tên mỗi ô là ngày đầy đủ: "Thứ Sáu, 6 tháng 11 năm 2026", cộng loại ngày đặc biệt. Hàng tên thứ có `abbr` "Thứ Hai"….
- Đổi tháng bằng nút trước / sau / tiêu đề được đọc qua live region; đổi bằng phím trong lưới thì tên ô mới đã có tháng và năm.
- Ô lịch theo density: 28px ở gọn (vẫn ≥ 24px vùng chạm), 32px, 40px ở thoáng.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Quốc khánh · Nghỉ bù Quốc khánh · Hạn chốt công | Ngày lễ Quốc khánh (loại đã có trong chú giải) |
| Tháng 11 năm 2026 | November 2026 · 11/2026 |
| T2 … CN, tuần bắt đầu Thứ Hai | CN đứng đầu tuần (mặc định en-US) |

Mọi chuỗi đổi được qua input `labels` (từng chỗ) hoặc `NXT_CALENDAR_LABELS` (cả ứng dụng, ví dụ nạp từ ngx-translate). Chuỗi có chỗ trống `{month}`, `{year}`, `{weekday}`, `{day}`.

```ts
providers: [{ provide: NXT_CALENDAR_LABELS, useValue: { today: 'Về hôm nay' } }]
```

Hàm ngày đi kèm entry: `nxtParseDate`, `nxtParseDateRange`, `nxtFormatDate` (`dd/MM/yyyy` có số 0), `nxtFormatDateRange` (`dd/MM/yyyy – dd/MM/yyyy`), `nxtAddDays`, `nxtAddMonths`, `nxtIsoWeekday`, `nxtTodayIso`. Không dùng `Intl` `dateStyle: 'short'` của `vi-VN` để hiển thị ngày: kết quả là `6/11/26`.

## API

::api{calendar}

## Token

::tokens{component.calendar}

## Changelog

- **Chưa phát hành**: thêm `nxt-calendar` (beta): mode `single` / `range`, mức ngày → tháng → năm, `min`, `max`, `dateFilter`, `specialDays`, `nonWorkingWeekdays`, chú giải, nút "Hôm nay", `labels` + `NXT_CALENDAR_LABELS`; hàm ngày `nxtParseDate`, `nxtFormatDate`…; token `component.calendar.*`.

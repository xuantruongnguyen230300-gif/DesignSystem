---
title: Card & Stat
description: Bề mặt trắng gom một nhóm nội dung trên nền canvas xám; trên trang tổng quan là thẻ có bộ đếm, chỉ số và liên kết tới danh sách đã lọc sẵn.
status: beta
group: Hiển thị dữ liệu
order: 31
package: "@nxt/ui/card"
keywords:
  - the
  - card
  - khung noi dung
  - chi so
  - stat
  - kpi
  - widget
  - dashboard
  - bang dieu khien
  - the tong quan
  - overview page
  - xem tat ca
---

# Card & Stat

## Khi nào dùng

- Gom một nhóm nội dung cùng chủ đề trên trang: widget dashboard, khối "Thông tin hợp đồng" trong trang chi tiết, panel chứa bảng hoặc danh sách.
- Hiện một chỉ số chính (KPI) cùng biến động so với kỳ trước: đặt `nxt-stat` trong card.
- Thẻ trên [trang tổng quan](/templates/dashboard): xem trước vài mục hoặc một KPI rồi đi tới danh sách đầy đủ đã lọc sẵn (`link`, `count`/`total`, `state`).

## Khi nào không dùng

- **Chia nhỏ bên trong một card**: dùng khoảng trắng, đường kẻ hoặc tiêu đề phụ. Không lồng card trong card, vì nó tạo phân cấp giả và tốn chỗ.
- **Mọi thứ trên trang đều là card**: một form dài chỉ cần một bề mặt, các phần trong form chia bằng tiêu đề.
- **Tự bọc cả card bằng `<a>` hoặc gắn `(click)` lên card**: dùng `link` + `clickable` (liên kết thật trong tiêu đề, phủ cả thẻ). Và chỉ khi thẻ có **một** đích; thẻ có link từng dòng hay nút thì dùng `link` thường (liên kết "Xem tất cả" ở chân thẻ).
- **Nhập liệu trên thẻ tổng quan**: thẻ chỉ để xem và đi tiếp. Sửa, duyệt có lý do thì mở [Drawer](/components/drawer) hoặc trang chi tiết.
- **Thông báo lỗi, cảnh báo của trang**: dùng [Alert](/components/alert), không dùng card tô màu. Lỗi tải dữ liệu của riêng một thẻ thì dùng `state="error"`.

## Card trên nền canvas

Nền ứng dụng là canvas xám nhạt (`color.bg.canvas`). Card là bề mặt trắng (`color.bg.surface`) không viền, bo `radius.container` (28px) và bóng mềm `elevation.card`. Đây là công cụ tách lớp chính của NXT: chỉ cần nhìn là biết đâu là một khối nội dung. Vì vậy card đặt thẳng trên canvas, không đặt lên một card khác.

Header là tuỳ chọn, gồm `title`, `subtitle` và slot `[nxtCardActions]` cho một hoặc hai hành động nhẹ (nút `ghost` size `sm`). Slot `[nxtCardFooter]` nằm dưới thân card. Card không tự thêm khoảng đệm cho chân card, nên bạn tự đặt padding và đường kẻ như ví dụ dưới.

::example{card-basic}

> Header chỉ hiện khi có `title`. Card không có tiêu đề thì nội dung trong `[nxtCardActions]` cũng không hiện.

## Cấp tiêu đề

`title` là một heading thật, mặc định `h2`. Chọn `headingLevel` theo **dàn ý của trang**, không theo cỡ chữ (chữ tiêu đề luôn dùng `typography.heading-sm`).

| Vị trí của card | `headingLevel` |
|-----------------|----------------|
| Ngay dưới tiêu đề trang (`h1`), ví dụ widget dashboard | `2` (mặc định) |
| Trong một section đã có `h2`, như các ví dụ trên trang này | `3` |
| Trong tab hoặc section con | `4` |

## Khoảng đệm

| `padding` | Dùng cho |
|-----------|----------|
| `md` (mặc định) | Phần lớn nội dung |
| `lg` | Card đứng riêng cần thoáng hơn, ví dụ form một cột. Dùng token `space.section.sm`: hiện bằng `md` ở mật độ gọn và vừa, rộng hơn ở mật độ rộng |
| `none` | Bảng, danh sách chạy sát mép card. Header vẫn giữ khoảng đệm |

::example{card-table}

## Tiêu đề làm tên cho nội dung

Tiêu đề card có `id` cố định, đọc qua `headingId`. Dùng nó cho `aria-labelledby` của nội dung bên trong cần tên, thay vì chép lại tiêu đề vào `aria-label`. Ví dụ ở mục [Khoảng đệm](#khoang-dem): vùng cuộn của bảng lấy tên từ tiêu đề "Hợp đồng sắp hết hạn".

```html
<nxt-card #card title="Hợp đồng sắp hết hạn" padding="none">
  <div role="region" tabindex="0" [attr.aria-labelledby]="card.headingId">…</div>
</nxt-card>
```

`region` biến cả card thành một landmark có tên là tiêu đề (`role="region"` + `aria-labelledby`), để người dùng screen reader nhảy thẳng tới bằng phím landmark (<kbd>D</kbd> trong NVDA).

::example{card-region}

- Chỉ bật `region` cho vài khối chính của trang, như các widget dashboard. Mọi card đều là landmark thì danh sách landmark dài và vô dụng.
- `region` cần `title`; card không có tiêu đề thì không thành landmark.
- Tên landmark phải khác nhau trên cùng trang. Không bật `region` cho card mà bên trong đã có vùng cuộn mang cùng tên.

## Lấp đầy chiều cao

`fill` cho card chiếm phần chiều cao còn lại của cha (một `nxtFill`, vùng nội dung app shell) và xếp nội dung theo cột, để một phần bên trong, thường là `nxt-table-scroll fill`, lấy hết chỗ còn lại và tự cuộn. Thanh công cụ và phân trang trong card đứng yên. Xem [Table › Lấp đầy màn hình](/components/table#lap-day-man-hinh).

## Stat: chỉ số và xu hướng

`nxt-stat` hiện nhãn, giá trị, đơn vị và biến động so với kỳ trước. `value` và `delta` là **chuỗi đã định dạng sẵn** theo vi-VN (`1.284`, `2,1%`), để component không phải đoán cách làm tròn hay đơn vị. Định dạng bằng [`@nxt/ui/format`](/foundations/formatting): `{{ 1284 | nxtNumber }}`, `{{ 0.021 | nxtPercent }}`, `{{ 18640000000 | nxtCompact }}`.

Hướng biến động (`trend`) và ý nghĩa tốt hay xấu (`deltaTone`) là **hai input riêng**, vì tăng không phải lúc nào cũng tốt:

| Chỉ số | `trend` | `deltaTone` |
|--------|---------|-------------|
| Tổng nhân sự tăng | `up` | `neutral` (mặc định): tốt hay xấu tuỳ kế hoạch |
| Tỷ lệ nghỉ việc giảm | `down` | `positive`: mũi tên đi xuống nhưng là tin tốt |
| Chi phí tăng ca tăng | `up` | `negative` |
| Tỷ lệ đi làm đúng giờ giảm | `down` | `negative` |

Xu hướng không chỉ dựa vào màu. Icon mũi tên đi kèm chữ ẩn "Tăng", "Giảm" hoặc "Không đổi" cho screen reader, sau đó là con số và `caption` ("so với tháng 9"). Màu của `deltaTone` chỉ bổ trợ, nên nhãn và caption phải đủ rõ để người đọc tự hiểu là tốt hay xấu.

::example{card-stat}

## Thẻ trang tổng quan

Trên [trang tổng quan](/templates/dashboard), mỗi thẻ là một **lối vào**: xem trước vài mục quan trọng nhất hoặc một chỉ số, rồi đi tới danh sách đầy đủ với đúng bộ lọc đó. Thẻ có header, nội dung và đường đi tiếp; không có trường nhập.

### Đi tới danh sách đã lọc sẵn

`link` (lệnh `routerLink`) và `queryParams` đặt đích của thẻ. Có hai kiểu:

| Kiểu | Cấu hình | Dùng khi |
|------|----------|----------|
| Chân "Xem tất cả" | `link` | Thẻ danh sách hoặc bảng: mỗi dòng có thể dẫn tới chi tiết, chân thẻ dẫn tới danh sách đầy đủ. Ghi số và đối tượng: `viewAllLabel="Xem tất cả 12 đơn"` |
| Cả thẻ bấm được | `link` + `clickable` | Thẻ KPI, thẻ tóm tắt: chỉ **một** đích và bên trong không có nút, link hay menu |

Header và các dòng của một thẻ dựa trên cùng một tập dữ liệu, nên phải dẫn về cùng một nơi: chân thẻ tới danh sách đầy đủ cùng bộ lọc, mỗi dòng tới chi tiết của đối tượng đó.

**Bộ đếm** `count`/`total` hiện "5/12" ở góc phải header khi thẻ chỉ hiện một phần (screen reader đọc "Hiển thị 5 trên 12 mục"). Bộ đếm không bao giờ bị cắt (tiêu đề xuống dòng thay) và tự ẩn khi thẻ đã hiện hết, khi đang tải, rỗng hoặc lỗi. Thẻ danh sách hiện tối đa 5 mục, hoặc 3 mục nếu mỗi mục nhiều dòng.

::example{card-overview}

### Cả thẻ bấm được và header số

`clickable` biến chữ tiêu đề thành liên kết và kéo giãn vùng bấm của nó ra cả thẻ: rê chuột thấy nền đổi và tiêu đề gạch chân, focus bàn phím có một vòng bao cả thẻ, và chỉ có **một** điểm dừng <kbd>Tab</kbd>. Screen reader đọc tên liên kết (tiêu đề) kèm mô tả là phụ đề, trạng thái và header số.

Header số là `nxt-stat` đặt trong slot `[nxtCardKpi]`, không cần `label` vì tiêu đề thẻ đã là nhãn. Đơn vị đặt cuối phụ đề sau dấu " | ": "Tháng 10/2026 | tỷ ₫". Trạng thái nghiệp vụ (`nxt-tag`) đặt trong `[nxtCardStatus]`, cạnh tiêu đề.

::example{card-clickable}

> Card `clickable` không được chứa phần tử tương tác khác: chúng sẽ lồng trong vùng bấm của liên kết, khó bấm đúng và đọc lẫn lộn. Ở dev mode card báo `console.warn` khi phát hiện. Cần nút hay link bên trong thì bỏ `clickable`, dùng chân "Xem tất cả".

Khác SAP Fiori: Fiori lấy cả header làm vùng bấm và vẫn cho phần tử bấm được trong nội dung. NXT chỉ cho cả thẻ bấm được khi thẻ có một đích; còn lại đi tiếp bằng một liên kết có chữ ở chân thẻ.

### Đang tải, rỗng, lỗi

`state` thay thân thẻ bằng vùng trạng thái, giữ nguyên header để người dùng vẫn biết thẻ nói về gì:

| `state` | Hiển thị | Ghi chú |
|---------|----------|---------|
| `loading` | 3 thanh skeleton giữ chỗ | `aria-busy="true"`, chữ ẩn `loadingText`. Không spinner |
| `empty` | Icon + `emptyText` | Nói cụ thể: "Không có hồ sơ nào thiếu giấy tờ." Ẩn chân "Xem tất cả" |
| `error` | Icon cảnh báo + `errorText` | Nói chuyện gì xảy ra và làm gì tiếp. Nút "Thử lại" do bạn đặt vào `[nxtCardStateAction]` |

Bộ đếm và header số ẩn ở cả ba trạng thái. Chân "Xem tất cả" vẫn hiện khi đang tải và khi lỗi, vì danh sách đích vẫn mở được. Sau "Thử lại", nút biến mất cùng vùng lỗi: đưa focus về nội dung vừa tải hoặc tiêu đề thẻ để người dùng bàn phím không bị lạc.

::example{card-states}

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Đi qua các phần tử tương tác trong card theo thứ tự trong code. Card thường không nhận focus. Card `clickable` là đúng một điểm dừng (liên kết tiêu đề, vòng focus bao cả thẻ). Card có `link` thêm một điểm dừng ở liên kết "Xem tất cả" |
| <kbd>Enter</kbd> | Trên liên kết tiêu đề (`clickable`) hoặc "Xem tất cả": đi tới danh sách đích |
| <kbd>H</kbd> (phím tắt của screen reader) | Nhảy giữa các card nhờ tiêu đề là heading thật |

- Card không có role, trừ khi bật `region` (landmark có tên là tiêu đề). Không tự gắn `(click)` hay `tabindex` lên cả card; dùng `clickable`.
- Liên kết "Xem tất cả" có tên là chữ hiển thị cộng tiêu đề thẻ ("Xem tất cả 12 đơn Đơn chờ duyệt"), nên nhiều thẻ cùng có "Xem tất cả" vẫn phân biệt được khi duyệt danh sách liên kết (WCAG 2.4.4).
- Card `clickable`: liên kết nằm trong heading, tên là tiêu đề, `aria-describedby` trỏ tới phụ đề, trạng thái và header số.
- Đang tải: card có `aria-busy="true"`; card không tự thông báo khi đổi trạng thái (trang tổng quan tải nhiều thẻ cùng lúc, thông báo từng thẻ sẽ ồn).
- Nội dung trong card cần tên (vùng cuộn, danh sách) dùng `[attr.aria-labelledby]="card.headingId"`, không chép lại tiêu đề.
- Giữ `headingLevel` đúng dàn ý trang (WCAG 1.3.1, 2.4.6). Không chọn cấp heading để có chữ to hơn.
- Nút trong `[nxtCardActions]` phải có tên đủ nghĩa khi đọc riêng. Nút hiện chữ "Sửa" thì đặt `aria-label="Sửa thông tin hợp đồng"`; tên bắt đầu bằng chữ hiển thị để khớp WCAG 2.5.3.
- Stat được đọc theo thứ tự: nhãn, giá trị kèm đơn vị, "Tăng/Giảm/Không đổi", biến động, caption. Icon trong ô icon chỉ để trang trí (`aria-hidden`).
- Bảng trong card `padding="none"` đặt trong `nxt-table-scroll` (vùng cuộn có tên, nhận focus) để cuộn được bằng bàn phím.

## Nội dung

Tiêu đề thẻ là danh từ ngắn (1–4 từ, một dòng, tối đa hai) nêu góc nhìn của thẻ; bổ ngữ, kỳ và đơn vị đặt ở phụ đề. Dùng một khuôn tiêu đề nhất quán cho mọi thẻ trên cùng trang. Tiêu đề và phụ đề phải dịch được độc lập.

| Nên | Không nên |
|-----|-----------|
| Hợp đồng sắp hết hạn | Thông tin |
| Đơn chờ duyệt · bộ đếm "5/12" | 12 đơn chờ bạn duyệt (số trong tiêu đề) |
| Trong 30 ngày tới | Lặp lại tiêu đề ở subtitle |
| Tháng 10/2026 \| tỷ ₫ | Tháng 10/2026, tính bằng tỷ đồng |
| Nghỉ việc · Đi làm đúng giờ · Quỹ lương | Tình hình nghỉ việc của nhân viên trong tháng |
| Xem tất cả 12 đơn | Xem thêm · Chi tiết · Bấm vào đây |
| 1.284 · 2,1% · 18,6 tỷ ₫ | 1,284 · 2.1% · 18640000000 |
| so với tháng 9 | so với kỳ trước (khi không rõ kỳ nào) |
| Không có hồ sơ nào thiếu giấy tờ. | Không có dữ liệu (khi biết rõ thiếu gì) |
| Tỷ lệ nghỉ việc | Tỷ lệ nhân viên nghỉ việc trong tháng hiện tại |

## API

::api{card}

Thuộc tính công khai của `NxtCard`:

| Thuộc tính | Kiểu | Mô tả |
|------------|------|-------|
| `headingId` | `string` (chỉ đọc) | `id` của tiêu đề, cố định suốt vòng đời card (`nxt-card-{n}-title`). Đọc qua template ref: `#card` → `card.headingId` |

## Token

::tokens{component.card}

::tokens{component.stat}

## Changelog

- **0.1.0**: phát hành beta: `nxt-card` (title, subtitle, headingLevel, padding, slot hành động và chân card), `nxt-stat` (trend và deltaTone tách riêng, chữ ẩn cho xu hướng).
- **Chưa phát hành**: `headingId` (id cố định của tiêu đề, cho `aria-labelledby`) và input `region` (card thành landmark có tên). Thẻ trang tổng quan theo SAP Fiori: `link`, `queryParams`, `clickable`, `viewAllLabel` (đi tới danh sách đã lọc sẵn), `count`/`total`/`countLabel` (bộ đếm), `state` + `loadingText`/`emptyText`/`errorText` (đang tải, rỗng, lỗi), slot `[nxtCardKpi]`, `[nxtCardStatus]`, `[nxtCardStateAction]`; `nxt-stat` `label` thành tuỳ chọn. Không thay đổi phá vỡ.

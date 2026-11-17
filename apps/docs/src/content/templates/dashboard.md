---
title: Tổng quan (Dashboard)
description: Trang tổng quan theo vai trò — lưới thẻ cố định theo cột, thẻ việc cần xử lý đứng đầu, mỗi thẻ dẫn tới danh sách đã lọc sẵn.
status: beta
order: 1
keywords:
  - dashboard
  - tong quan
  - trang chu
  - bao cao
  - thong ke
  - overview page
  - the
  - kpi
---

# Tổng quan (Dashboard)

Dashboard của phần mềm nghiệp vụ không phải trang trình diễn số liệu. Người dùng mở nó mỗi sáng để biết **hôm nay phải làm gì**, rồi mới xem tình hình chung. Mỗi thẻ là một lối vào: xem trước vài mục hoặc một chỉ số, rồi đi tới danh sách đầy đủ với đúng bộ lọc đó.

::example{template-dashboard}

## Khi nào dùng

Theo SAP Fiori: Overview Page.

- Một trang vào việc cho **một vai trò** (trưởng phòng nhân sự, quản lý trực tiếp), gom thông tin từ **ít nhất hai** phân hệ (phê duyệt, hợp đồng, chấm công, lương).
- Có **ít nhất 3 thẻ** và các thẻ **khác loại** (danh sách, bảng, chỉ số, biểu đồ).

## Khi nào không dùng

- Chỉ nói về **một đối tượng** (một nhân viên, một hợp đồng): dùng trang chi tiết.
- Chỉ một phân hệ với dưới 3 khối thông tin: đặt các chỉ số trên đầu [trang danh sách](/patterns/list-page).
- Chỉ để mở ứng dụng: đó là menu điều hướng, không phải trang tổng quan.
- Phân tích tự do (kéo thả chiều, lọc chéo): dùng công cụ báo cáo chuyên dụng.

## Bố cục: lưới thẻ cố định theo cột

- **Cột đều nhau, rộng tối thiểu `layout.item-min-lg`** (`nxt-grid columns="auto" minItem="lg"`). Số cột tự đổi theo bề rộng vùng nội dung (container query): 1 cột trên điện thoại, 2–4 cột trên máy tính, tối đa 5 cột trên màn rất rộng. Thẻ không đổi kích thước theo ý người dùng; chiều cao do nội dung quyết định, thẻ cùng hàng cao bằng nhau.
- **Thứ tự Z** (trái sang phải, trên xuống dưới) chính là thứ tự tầm quan trọng, và cũng là thứ tự trong DOM nên bàn phím và screen reader đi đúng thứ tự đó. Thẻ ở trên cùng bên trái là quan trọng nhất.
- Ba nhóm, mỗi nhóm một lưới, cách nhau `space.gap.md`:
  1. **Việc cần xử lý**: thẻ danh sách và thẻ bảng (đơn chờ duyệt, hợp đồng sắp hết hạn, thử việc sắp kết thúc).
  2. **Chỉ số**: dải thẻ KPI nhỏ (`minItem="md"`), cả thẻ bấm được.
  3. **Phân tích và theo dõi**: biểu đồ, cơ cấu, lịch, hoạt động gần đây.
- Gom các thẻ cùng chủ đề cạnh nhau. Không giới hạn cứng số thẻ, nhưng mỗi thẻ phải phục vụ đúng vai trò; khoảng 8–10 thẻ là đủ cho một màn hình rộng.

## Loại thẻ

| Loại | Dùng cho | Luật nội dung | Đường đi tiếp |
|------|----------|---------------|---------------|
| Danh sách | Đơn chờ duyệt, thử việc sắp kết thúc, sinh nhật | ≤ 5 mục (≤ 3 nếu mỗi mục nhiều dòng); một kiểu mục cho cả thẻ; bộ đếm "5/12" | Chân "Xem tất cả 12 đơn"; mỗi dòng có thể dẫn tới chi tiết |
| Bảng | Hợp đồng sắp hết hạn | ≤ 3–4 cột × ≤ 5 hàng; `padding="none"`, vùng cuộn có tên = tiêu đề thẻ | Chân "Xem tất cả 9 hợp đồng" |
| KPI (header số) | Nhân sự, nghỉ việc, đi làm đúng giờ, quỹ lương | `nxt-stat` trong `[nxtCardKpi]`; đơn vị ở phụ đề; xu hướng có chữ, không chỉ màu | Cả thẻ bấm được (`clickable`): một đích |
| Biểu đồ đơn giản | Biến động nhân sự, cơ cấu theo khối | ≤ 5 thanh để so sánh (nhiều hơn thì gộp "khối còn lại"), luôn kèm số và %; bảng dữ liệu ẩn cho screen reader | Chân "Xem báo cáo …" |
| Hoạt động | Ai vừa làm gì | `nxt-timeline`, 4–5 mục mới nhất, thời gian tương đối | Chân "Xem tất cả hoạt động" |

Header và các dòng của một thẻ dựa trên **cùng một tập dữ liệu**, nên dẫn về cùng một nơi: chân thẻ tới danh sách đầy đủ với cùng bộ lọc (`link` + `queryParams`), mỗi dòng tới chi tiết của đối tượng đó. Xem [Card › Thẻ trang tổng quan](/components/card#the-trang-tong-quan).

## Viết tiêu đề và phụ đề thẻ

Theo SAP Fiori: Overview Page UI Text Guidelines, chuyển sang tiếng Việt.

- **Tiêu đề trang** là danh từ nêu vai trò hoặc lĩnh vực: "Tổng quan nhân sự". Không viết "Trang tổng quan" hay "Dashboard".
- **Tiêu đề thẻ** là danh từ ngắn nêu góc nhìn, một dòng (tối đa hai), viết hoa kiểu câu: "Đơn chờ duyệt", "Hợp đồng sắp hết hạn", "Nghỉ việc". Tiêu đề ngắn có thể kèm bổ ngữ ("Sinh nhật trong tuần"); bổ ngữ dài đưa xuống phụ đề. Mọi thẻ trên trang theo **một khuôn** tiêu đề.
- **Không đặt số vào tiêu đề** ("12 đơn chờ bạn duyệt"): số đi vào bộ đếm, header số hoặc chân "Xem tất cả 12 đơn".
- **Phụ đề** bổ nghĩa, giải thích hoặc nêu kỳ: "Trong 30 ngày tới", "Cũ nhất trước". Nhiều bổ ngữ cách nhau bằng dấu phẩy: "Đến 31/10/2026, tổng 1.284 người".
- **Đơn vị** ở cuối phụ đề, tách bằng " | ": "Tháng 10/2026 | tỷ ₫", "Đến 31/10/2026 | người". Không viết "tính bằng VND".
- Tiêu đề và phụ đề phải dịch được độc lập (không ghép một câu xuyên hai dòng).
- Chữ hành động bắt đầu bằng động từ: "Xem tất cả 9 hợp đồng", "Xuất báo cáo".

## Số và ngày

Mọi số và ngày trên trang đi qua [`@nxt/ui/format`](/foundations/formatting):

| Ở đâu | Định dạng | Ví dụ |
|-------|-----------|-------|
| KPI | `nxtNumber`, `nxtPercent`, `nxtUnit`; số lớn `nxtCompact` hoặc chia sẵn theo đơn vị ở phụ đề | `1.284` · `2,1%` · `5 người` · `18,6` (tỷ ₫) |
| Thời điểm gửi, hoạt động | `nxtRelative` (±6 ngày), ngày giờ tuyệt đối trong `title` | `10 phút trước` · `Hôm qua` |
| Sinh nhật, lịch | `nxtRelative` với `precision: 'day'` | `Hôm nay` · `Ngày mai` |
| Hạn hợp đồng, thử việc | `nxtDate`: hạn pháp lý luôn là ngày tuyệt đối | `12/11/2026` |
| Khoảng nghỉ | `nxtDateRange` | `10/11/2026 – 12/11/2026` |

## Quyết định UX

- **Kỳ báo cáo** đặt ở page header trên thanh trên cùng (`nxt-segmented`), áp cho cả trang và cập nhật ngay, không có nút "Áp dụng"; không đặt bộ lọc riêng trong từng thẻ.
- **Trạng thái từng thẻ**: thẻ tải độc lập, mỗi thẻ có `state` riêng (skeleton khi đang tải, câu cụ thể khi rỗng, nguyên nhân + "Thử lại" khi lỗi). Một thẻ lỗi không làm hỏng cả trang; không spinner toàn trang.
- **Biểu đồ luôn có bảng dữ liệu đi kèm** (ẩn với mắt, có với screen reader), vì cột màu không đọc được bằng giọng nói.
- **Màu dữ liệu** lấy từ `color.data.*`; mỗi chuỗi có thêm chú thích chữ cạnh ô màu. Từ chỉ trạng thái ("Vượt kế hoạch") luôn đi với màu ngữ nghĩa của nó.
- **Thẻ quan trọng được nhấn bằng vị trí**, không bằng cỡ chữ khổng lồ hay màu nền.
- **Landmark**: chỉ thẻ việc chính nhất ("Đơn chờ duyệt") bật `region`, để người dùng screen reader nhảy tới bằng phím landmark.

## Components dùng

`nxt-app-shell` · `nxt-page-header` · `nxt-segmented` · `nxt-grid` · `nxt-card` · `nxt-stat` · `nxt-table` · `nxt-progress` · `nxt-avatar` · `nxt-timeline` · `nxt-tag` · `nxt-icon` · `@nxt/ui/format`

## Không nên

| Không nên | Vì sao |
|-----------|--------|
| 12 ô số liệu cùng cỡ | Không còn gì nổi bật; người dùng bỏ qua cả trang |
| Số trong tiêu đề thẻ ("12 đơn chờ bạn duyệt") | Tiêu đề đổi theo dữ liệu, khó dịch, khó quét; dùng bộ đếm và chân thẻ |
| Thẻ có trường nhập hoặc nút "Duyệt" hàng loạt | Thẻ chỉ để xem và đi tiếp; duyệt ở [trang phê duyệt](/templates/approval) |
| Cả thẻ bấm được khi bên trong còn link hoặc nút | Lồng phần tử tương tác, bấm nhầm, screen reader đọc lẫn lộn |
| Thẻ lặp lại thông tin của thẻ khác | Tốn chỗ, người dùng không biết tin số nào |
| Biểu đồ tròn nhiều hơn 5 phần, hoặc hơn 5 thanh để so sánh | Khó so sánh; gộp phần nhỏ thành "khối còn lại", luôn kèm số và % |
| Ngày tương đối cho hạn hợp đồng | Hạn pháp lý phải đọc được chính xác |
| Số liệu tự làm mới liên tục | Gây mất tập trung, screen reader đọc lặp; làm mới khi người dùng yêu cầu |

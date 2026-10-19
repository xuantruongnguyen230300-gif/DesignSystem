---
title: Timeline
description: Danh sách các mốc theo thời gian, như các bước của một quy trình duyệt, lịch sử thay đổi hồ sơ hay luồng hoạt động.
status: beta
group: Hiển thị dữ liệu
order: 35
package: "@nxt/ui/timeline"
keywords:
  - dong thoi gian
  - timeline
  - lich su
  - nhat ky
  - hoat dong
  - quy trinh duyet
  - cac buoc
---

# Timeline

## Khi nào dùng

- Các bước của một quy trình đã và sẽ diễn ra: duyệt đơn nghỉ phép, ký hợp đồng, quy trình nghỉ việc.
- Lịch sử thay đổi của một bản ghi: ai sửa gì, lúc nào.
- Luồng hoạt động gần đây trên dashboard.

## Khi nào không dùng

- **Người dùng cần đi qua từng bước để nhập liệu**: dùng stepper của form nhiều bước. Timeline chỉ để đọc, các mốc không bấm được.
- **Cần lọc, sắp xếp hoặc so sánh nhiều cột**: dùng bảng, ví dụ nhật ký truy cập có hàng nghìn dòng.
- **Lịch theo ngày, tuần**: dùng lịch hoặc bảng phân ca.

## Các bước phê duyệt

Mỗi mốc có `title` (bắt buộc), `time`, `icon` và nội dung phụ trong thân. **Tiêu đề phải tự nói lên trạng thái**: "Trưởng phòng Kế toán đã duyệt", "Đang chờ Phòng Nhân sự ghi nhận". Bước chưa diễn ra để tone mặc định và ghi rõ khi nào nó xảy ra.

::example{timeline-approval}

`time` là chuỗi đã định dạng sẵn. Dùng giờ trước, ngày sau (`08:15 · 14/10/2026`). Với hoạt động gần đây có thể dùng thời gian tương đối ("10 phút trước"), nhưng lịch sử dùng làm bằng chứng (duyệt, ký) thì ghi giờ chính xác.

## Tông của mốc

`tone` đổi màu viền và icon của mốc. Màu chỉ bổ trợ cho chữ (WCAG 1.4.1): bỏ màu đi, người đọc vẫn phải hiểu đầy đủ trạng thái từ tiêu đề.

| `tone` | Dùng cho |
|--------|----------|
| `neutral` (mặc định) | Sự kiện thường, bước chưa bắt đầu |
| `brand` | Mốc do người dùng khởi tạo: gửi đơn, nộp hồ sơ |
| `success` | Bước đã hoàn thành: đã duyệt, đã ký, đã bàn giao |
| `warning` | Đang chờ xử lý, sắp tới hạn |
| `danger` | Bị từ chối, trả lại, lỗi. Thân mốc nói rõ cần làm gì tiếp |

::example{timeline-tones}

## Bước bị bỏ qua

Bước không áp dụng cho đơn này (điều kiện không thoả, chỉ dành cho loại đơn khác) dùng `skipped`, không dùng tone `neutral`: bước "chưa tới" và bước "bỏ qua" khác nhau, và người đọc cần biết đơn sẽ **không** đi qua bước đó.

::example{timeline-skipped}

- `skipped` không chỉ đổi màu: marker có **viền nét đứt** và icon bỏ qua (`player-skip-forward`, khi không truyền `icon`), chữ nhạt hơn. Bỏ màu đi (in đen trắng, chế độ tương phản cao) vẫn thấy nét đứt.
- Component tự ghi **"Bỏ qua: "** trước tiêu đề (người nhìn và screen reader đều đọc được), vì marker chỉ là trang trí. Tiêu đề giữ tên bước ("Bước 2 · Giám đốc khối Kinh doanh").
- Ghi **lý do** vào `time` hoặc thân mốc: "Chỉ áp dụng khi số ngày nghỉ > 3". Không viết lại chữ "Bỏ qua", component đã ghi.
- Có `skipped` thì `tone` không còn tác dụng.

## Luồng hoạt động

Timeline đặt trong card để làm "Lịch sử thay đổi" của trang chi tiết hoặc "Hoạt động gần đây" của dashboard. Hiện vài mục mới nhất trước, để người dùng chủ động xem thêm. Nút xem thêm đứng **ngoài** timeline, vì danh sách chỉ được chứa các mốc.

::example{timeline-activity}

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> | Timeline không nhận focus. Tab chỉ dừng ở link hoặc nút nằm trong thân mốc |
| Phím đọc danh sách của screen reader (ví dụ <kbd>L</kbd>, <kbd>I</kbd> trong NVDA) | Nhảy tới timeline và giữa các mốc; screen reader đọc "danh sách, 4 mục" |

- `nxt-timeline` có `role="list"`, mỗi `nxt-timeline-item` có `role="listitem"`. Chỉ đặt `nxt-timeline-item` làm con trực tiếp của `nxt-timeline`.
- Đặt `aria-label` cho timeline khi trang có nhiều danh sách: "Quy trình duyệt đơn nghỉ phép của Lê Minh Anh".
- Marker và icon là trang trí (`aria-hidden`). Mỗi mốc được đọc theo thứ tự tiêu đề, thời gian, nội dung.
- Mốc `skipped` được đọc "Bỏ qua: Bước 2 · Giám đốc khối Kinh doanh, Chỉ áp dụng khi số ngày nghỉ > 3, …". Chữ nhạt vẫn đạt tương phản 4.5:1, viền nét đứt đạt 3:1 ở cả sáng và tối.
- Thêm mục mới (tải thêm, cập nhật realtime) thì báo bằng một vùng `role="status"` nằm ngoài timeline, ví dụ "Đã hiện thêm 3 hoạt động cũ hơn".

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Trưởng phòng Kế toán đã duyệt | Bước 2 |
| Đang chờ Phòng Nhân sự ghi nhận | Pending |
| Quyết toán thuế bị trả lại, kèm việc cần làm và hạn | Lỗi |
| 08:15 · 14/10/2026 | 2026-10-14T08:15 |
| Trần Thị Mai cập nhật tài khoản nhận lương | Cập nhật bản ghi #4812 |
| `skipped`, `time="Chỉ áp dụng khi số ngày nghỉ > 3"` | `icon="minus"`, `time="Bỏ qua"` (không giải thích vì sao) |

## API

::api{timeline}

## Token

::tokens{component.timeline}

## Changelog

- **0.1.0**: phát hành beta: `nxt-timeline` (role list) và `nxt-timeline-item` (title, time, icon, 5 tone).
- **Chưa phát hành**: `skipped` cho bước bị bỏ qua: marker nét đứt, icon `player-skip-forward`, chữ nhạt, chữ "Bỏ qua: " trước tiêu đề. Token mới `marker-skipped`, `skipped-text`.

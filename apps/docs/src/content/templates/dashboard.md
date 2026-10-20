---
title: Tổng quan (Dashboard)
description: Màn hình đầu tiên sau đăng nhập — việc cần làm trước, số liệu sau, hoạt động gần đây cuối cùng.
status: beta
order: 1
keywords:
  - dashboard
  - tong quan
  - trang chu
  - bao cao
  - thong ke
---

# Tổng quan (Dashboard)

Dashboard của phần mềm nghiệp vụ không phải trang trình diễn số liệu. Người dùng mở nó mỗi sáng để biết **hôm nay phải làm gì**, rồi mới xem tình hình chung.

::example{template-dashboard}

## Thứ tự nội dung

1. **Việc cần xử lý**: đơn chờ duyệt, hợp đồng sắp hết hạn, hồ sơ thiếu giấy tờ. Mỗi dòng có số lượng và đi thẳng tới danh sách đã lọc sẵn.
2. **Chỉ số chính** (`nxt-stat`): tối đa 4 ô trên một hàng. Mỗi ô có so sánh với kỳ trước, kèm chiều tăng/giảm *và* màu, không chỉ màu.
3. **Biểu đồ và cơ cấu**: chỉ khi trả lời được một câu hỏi cụ thể ("tuyển vào có bù được nghỉ việc không?").
4. **Hoạt động gần đây** (`nxt-timeline`): để biết ai vừa làm gì, không cần mở từng hồ sơ.

## Quyết định UX

- **Kỳ báo cáo** đặt ở page header (`nxt-segmented`), áp cho cả trang, thay vì mỗi thẻ một bộ lọc riêng.
- **Biểu đồ luôn có bảng dữ liệu đi kèm** (ẩn với mắt, có với screen reader), vì cột màu không đọc được bằng giọng nói.
- **Màu dữ liệu** lấy từ `color.data.*`; mỗi chuỗi có thêm chú thích chữ cạnh ô màu.
- **Lưới tự co giãn** theo bề rộng vùng nội dung (container query), nên dashboard vẫn đúng khi menu thu gọn hay mở.

## Components dùng

`nxt-app-shell` · `nxt-sidenav` · `nxt-topbar` · `nxt-page-header` · `nxt-segmented` · `nxt-card` · `nxt-stat` · `nxt-progress` · `nxt-avatar` · `nxt-timeline` · `nxt-tag` · `nxt-badge` · `nxt-icon`

## Không nên

| Không nên | Vì sao |
|-----------|--------|
| 12 ô số liệu cùng cỡ | Không còn gì nổi bật; người dùng bỏ qua cả trang |
| Biểu đồ tròn nhiều hơn 5 phần | Khó so sánh; dùng thanh ngang (`nxt-progress`) |
| Số liệu tự làm mới liên tục | Gây mất tập trung, screen reader đọc lặp; làm mới khi người dùng yêu cầu |

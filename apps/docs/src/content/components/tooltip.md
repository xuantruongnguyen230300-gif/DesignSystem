---
title: Tooltip
description: Gợi ý ngắn hiện khi rê chuột hoặc focus vào một phần tử, chủ yếu để gọi tên nút chỉ có icon.
status: beta
group: Phản hồi & lớp phủ
order: 40
package: "@nxt/ui/tooltip"
keywords:
  - goi y
  - chu thich
  - tooltip
  - nhan nut icon
  - mo ta ngan
  - hover
---

# Tooltip

## Khi nào dùng

- Gọi tên nút chỉ có icon trong toolbar, hàng bảng: "Làm mới", "Xuất Excel".
- Thêm một thông tin phụ, có cũng được không có cũng được: "Lần đồng bộ gần nhất: 08:00 hôm nay".

## Khi nào không dùng

- **Thông tin người dùng bắt buộc phải biết** (điều kiện, hạn chót, lý do không làm được việc): hiện bằng chữ trên trang. Người dùng màn hình cảm ứng không hover được, và nhiều người không bao giờ rê chuột để tìm tooltip.
- **Nội dung tương tác** (link, nút, ô nhập): tooltip không nhận focus, nên không bấm được gì bên trong. Dùng popover hoặc drawer.
- **Hướng dẫn nhập cho ô form**: dùng `hint` của form field, luôn hiện và được nối với ô nhập.
- **Lặp lại nhãn đã hiện rõ**: nút "Lưu hồ sơ" không cần tooltip "Lưu hồ sơ".
- **Thông báo kết quả**: dùng vùng `role="status"` hoặc toast.

## Nút chỉ có icon

Tooltip **không thay** `aria-label`. Nút `nxtIconButton` luôn cần `aria-label`, đó là tên mà screen reader và phần mềm điều khiển bằng giọng nói dùng. Tooltip chỉ nhắc lại tên đó cho người dùng chuột. Khi chữ của tooltip trùng với tên của nút, NXT **không** thêm `aria-describedby`, nên screen reader không đọc tên hai lần.

::example{tooltip-icon-buttons}

## Thông tin bổ sung

Khi chữ của tooltip khác tên của nút, tooltip được nối vào nút bằng `aria-describedby` trong lúc đang hiện. Screen reader đọc tên nút trước, sau đó đọc tooltip như phần mô tả.

::example{tooltip-description}

## Nút đang disabled

Nút NXT dùng `aria-disabled` thay cho thuộc tính `disabled`, nên nút vẫn nhận focus và hover. Vì vậy tooltip vẫn hiện để giải thích vì sao chưa bấm được. Với `<button disabled>` thông thường, trình duyệt bỏ qua cả focus lẫn sự kiện chuột, nên tooltip không bao giờ hiện.

Tắt tooltip khi nó không còn cần bằng `nxtTooltipDisabled`. Ví dụ dưới chỉ hiện tooltip khi chưa chọn đơn nào.

::example{tooltip-disabled}

Nếu lý do là điều kiện quan trọng (hồ sơ thiếu giấy tờ, chưa có quyền), hiện lý do bằng chữ ngay cạnh nút và nối bằng `aria-describedby` như ở [Button](/components/button). Tooltip chỉ hợp khi lý do đã khá rõ từ ngữ cảnh.

## Vị trí và độ trễ

`nxtTooltipPosition` nhận `top` (mặc định), `bottom`, `start`, `end`. `start` và `end` theo chiều đọc, nên tự đổi bên khi giao diện viết từ phải sang trái. Khi không đủ chỗ, tooltip tự lật sang phía đối diện.

Khi rê chuột, tooltip chờ `nxtTooltipDelay` (mặc định 300ms) rồi mới hiện, để không nhấp nháy khi chuột lướt qua toolbar. Khi focus bằng bàn phím, tooltip hiện ngay.

::example{tooltip-positions}

## Accessibility

| Phím, thao tác | Hành vi |
|----------------|---------|
| <kbd>Tab</kbd> tới phần tử | Tooltip hiện ngay |
| <kbd>Tab</kbd> rời phần tử | Tooltip ẩn |
| <kbd>Esc</kbd> | Ẩn tooltip, focus vẫn ở nguyên chỗ (WCAG 1.4.13) |
| Rê chuột vào | Hiện sau `nxtTooltipDelay` |
| Rê chuột từ phần tử sang tooltip | Tooltip vẫn hiện, để đọc hoặc phóng to được (WCAG 1.4.13) |
| Click phần tử | Tooltip ẩn, để không che kết quả của thao tác |

- Panel có `role="tooltip"` và không bao giờ nhận focus.
- Chỉ gắn `nxtTooltip` lên phần tử **focus được** (nút, link). Đặt lên `<span>` hay icon trơn thì người dùng bàn phím không bao giờ thấy được tooltip.
- `aria-describedby` chỉ được thêm khi chữ của tooltip khác tên accessible của phần tử (lấy từ `aria-label` hoặc chữ bên trong), và được gỡ khi tooltip ẩn. `aria-describedby` có sẵn trên phần tử vẫn được giữ.
- Tooltip dùng `color.bg.inverse` và `color.text.inverse`, đạt tối thiểu 4.5:1 ở mọi chế độ. Ở chế độ tương phản cao (forced colors), panel có viền riêng.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Xuất Excel | Bấm vào đây để xuất dữ liệu ra file Excel |
| Lần đồng bộ gần nhất: 08:00 hôm nay | Thông tin |
| Chọn ít nhất một đơn để duyệt | Không thể thực hiện |
| Một câu ngắn, không chấm câu cuối khi chỉ là tên | Đoạn văn nhiều dòng |

## API

::api{tooltip}

## Token

::tokens{component.tooltip}

## Changelog

- **0.1.0**: phát hành beta: directive `[nxtTooltip]` trên CDK Overlay, 4 vị trí tự lật, hover được và đóng bằng Esc (WCAG 1.4.13), chỉ thêm `aria-describedby` khi chữ khác tên của phần tử.

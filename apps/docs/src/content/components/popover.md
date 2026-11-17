---
title: Popover
description: Panel nổi neo vào một nút để xem nhanh hoặc làm một việc nhỏ gắn với phần tử đó (thẻ nhân viên, danh sách thông báo, xác nhận nhanh) mà không rời trang và không khoá trang.
status: beta
group: Phản hồi & lớp phủ
order: 45
package: "@nxt/ui/popover"
keywords:
  - popover
  - the nhanh
  - quick view
  - panel noi
  - xac nhan nhanh
  - bo ban nhap
---

# Popover

## Khi nào dùng

- **Thẻ nhanh**: bấm tên nhân viên trong bảng, đơn phê duyệt hay timeline để xem chức danh, phòng ban, liên hệ, rồi "Xem hồ sơ".
- **Danh sách thông báo** của form: [Action bar](/components/action-bar) đã dựng sẵn bằng popover.
- **Xác nhận nhanh ngay cạnh nút** cho thao tác ít rủi ro: "Bỏ bản nháp này?".

## Khi nào không dùng

- **Gợi ý một câu, không có gì để bấm**: dùng [Tooltip](/components/tooltip).
- **Danh sách hành động**: dùng [Menu](/components/menu), có phím mũi tên và gõ để tìm.
- **Lọc danh sách**: dùng [Filter](/components/filter), panel có "Áp dụng".
- **Buộc người dùng quyết định, thao tác không hoàn tác được**: dùng [Dialog](/components/dialog) `confirm()`; popover không khoá trang nên không đủ mạnh.
- **Form tạo/sửa, nội dung dài**: dùng [Drawer](/components/drawer).

## Thẻ nhanh

Khai báo `nxt-popover` ngay trong template và gắn `[nxtPopoverTriggerFor]` lên một `button`. Popover mở bằng click, Enter hoặc Space, nằm cạnh nút, tự lật lên trên khi bên dưới không đủ chỗ. Trường trống hiện "—", không để khoảng trắng.

::example{popover-quick-view}

```html
<button type="button" [nxtPopoverTriggerFor]="card">Nguyễn Thị Ngọc Diệp</button>
<nxt-popover #card title="Nguyễn Thị Ngọc Diệp">
  …avatar, chức danh, liên hệ…
  <a href="/nhan-vien/NV-00218">Xem hồ sơ</a>
</nxt-popover>
```

## Có footer

Đặt nút vào slot `[nxtPopoverFooter]`: căn phải, primary (hoặc danger) đứng cuối. Gọi `close()` của popover sau khi làm xong để đóng và trả focus về nút đã mở.

::example{popover-confirm}

## Anatomy

| # | Phần | Ghi chú |
|---|------|---------|
| 1 | Nút mở | `button` native có `[nxtPopoverTriggerFor]` |
| 2 | Panel | Nền nổi, viền mảnh, bo 20px (`radius.overlay`), bóng `elevation.overlay`; rộng theo nội dung, tối đa 400px |
| 3 | Tiêu đề (tuỳ chọn) | `h2`, cũng là tên đọc lên của panel; không có tiêu đề thì bắt buộc `label` |
| 4 | Thân | Nội dung của bạn; cuộn khi dài |
| 5 | Footer (tuỳ chọn) | `[nxtPopoverFooter]`, nút căn phải, primary cuối |

Không có nút "Đóng" ở góc: Esc, bấm ra ngoài và bấm lại nút đã đủ.

## Hành vi & trạng thái

| Tình huống | Popover làm gì |
|------------|----------------|
| Mở | Focus vào phần tử bấm được đầu tiên (hoặc phần tử có `cdkFocusInitial`); không có thì focus chính panel |
| <kbd>Tab</kbd> | Đi vòng trong popover, không chạy ra cuối trang |
| <kbd>Esc</kbd>, bấm lại nút | Đóng, focus về nút |
| Bấm ra ngoài | Đóng. Bấm vào một control khác thì focus ở control đó; bấm vào chỗ trống thì focus về nút |
| Nút bị `disabled` | Không mở |
| Thiếu chỗ | Lật sang phía đối diện; `nxtPopoverPosition="top"` cho nút ở đáy màn hình |
| Nội dung dài | Thân cuộn, cao tối đa 70% màn hình; tiêu đề và footer đứng yên |

Popover **không modal**: không có nền tối, trang phía sau vẫn bấm được (và bấm như vậy là đóng popover). Mở trong drawer thì <kbd>Esc</kbd> chỉ đóng popover, không đóng drawer.

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên nút | Mở, focus phần tử đầu tiên |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Đi vòng trong popover |
| <kbd>Esc</kbd> | Đóng, focus về nút |

- Nút: `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls` (khi mở).
- Panel: `role="dialog"` có tên từ `title` (`aria-labelledby`) hoặc `label` (`aria-label`); không có `aria-modal`.
- Vì sao Tab đi vòng trong popover: panel nằm ở cuối trang (overlay); nếu Tab được đi tiếp, focus sẽ nhảy xa khỏi nút trong khi popover vẫn mở. Esc luôn là đường ra.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Tiêu đề: "Nguyễn Thị Ngọc Diệp", "Bỏ bản nháp này?" | "Chi tiết", "Xác nhận" |
| Một hai dòng thông tin, một hai nút | Form nhiều trường |
| Trường trống: "—" | Để trống, "N/A" |
| Nút lặp động từ: "Bỏ bản nháp" | "OK", "Đồng ý" |

## API

::api{popover}

## Token

::tokens{component.popover}

## Changelog

- **Chưa phát hành**: beta: `nxt-popover` (tiêu đề hoặc `label`, footer), `[nxtPopoverTriggerFor]` (`nxtPopoverPosition`, `open()`, `close()`, `toggle()`, `isOpen`).

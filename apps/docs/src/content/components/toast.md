---
title: Toast
description: Xác nhận ngắn rằng thao tác vừa làm đã thành công ("Đã lưu hồ sơ"), hiện ở đáy vùng nội dung rồi tự ẩn, không ngắt người dùng; không dùng cho lỗi.
status: beta
group: Phản hồi & lớp phủ
order: 46
package: "@nxt/ui/toast"
keywords:
  - toast
  - snackbar
  - thong bao thanh cong
  - da luu
  - hoan tac
  - message toast
---

# Toast

## Khi nào dùng

- Xác nhận **thành công** ngắn sau một thao tác: lưu, gửi duyệt, sao chép, xuất file xong.
- Nhất là khi chỗ vừa thao tác đã biến mất: drawer vừa đóng, hàng vừa rời khỏi danh sách đang lọc.
- Kèm **một** hành động tiện lợi như "Hoàn tác", khi việc đó **còn đường khác** để hoàn tác (nút "Dùng lại", thùng rác, lịch sử).

## Khi nào không dùng

- **Lỗi, cảnh báo, thành công một phần**: dùng [Alert](/components/alert) ngay trong trang, gần chỗ có vấn đề. Toast tự biến mất trước khi người dùng kịp xử lý.
- **Lỗi trường form, lỗi khi lưu form dài**: lỗi tại trường + danh sách thông báo của [Action bar](/components/action-bar).
- **Người dùng phải đọc, ghi lại hoặc chép** (số quyết định, mã chứng từ): dùng [Dialog](/components/dialog) `notify()`.
- **"Hoàn tác" là đường duy nhất** để lấy lại dữ liệu: dùng [Alert](/components/alert) có nút "Hoàn tác" trong `[nxtLiveRegion]`; alert không tự biến mất.
- **Thông báo hệ thống cần xem lại sau** (đơn mới chờ duyệt): chuông thông báo trên topbar của sản phẩm.

## Ví dụ

`NxtToast` là service: gọi `show()`, không đặt gì vào template. Toast hiện ở **đáy giữa vùng nội dung** (vùng `main` của app shell, không đè lên menu trái), ngay trên [Action bar](/components/action-bar) nếu trang có. Mỗi lúc chỉ một toast; toast sau chờ toast trước ẩn đi.

::example{toast-basic}

```ts
private readonly toast = inject(NxtToast);

save() {
  // …lưu xong
  this.toast.show('Đã lưu hồ sơ Nguyễn Văn An.');
}
```

## Có "Hoàn tác"

Thêm `action`. Toast có hành động hiện **10 giây** và dừng đếm khi rê chuột hoặc focus vào nó. Hành động trong toast chỉ là lối tắt: trong ví dụ, nút "Dùng lại" vẫn nằm trên hàng sau khi toast đã ẩn.

::example{toast-undo}

```ts
this.toast
  .show('Đã ngừng sử dụng chức danh “Kế toán tổng hợp”.', { action: 'Hoàn tác' })
  .onAction.subscribe(() => this.restore());
```

## Anatomy

| # | Phần | Ghi chú |
|---|------|---------|
| 1 | Khung | Nền đảo (tối ở chế độ sáng), không viền, bo 28px, bóng `elevation.overlay`; rộng theo nội dung, tối đa 400px |
| 2 | Icon thành công | Trang trí; toast chỉ có một kiểu |
| 3 | Thông điệp | Một câu, tối đa khoảng 2 dòng |
| 4 | Hành động (tuỳ chọn) | Một nút `ghost` nhỏ |

## Hành vi & trạng thái

| Tình huống | Toast làm gì |
|------------|--------------|
| `show()` | Hiện ngay nếu không có toast nào; nếu có thì xếp hàng |
| Thời gian | `1 giây + 60 ms × số ký tự`, trong khoảng **3–5 giây**; có hành động: **10 giây**; tối thiểu 3 giây kể cả khi đặt `duration` nhỏ hơn |
| Rê chuột / focus vào toast | Dừng đếm; rời ra thì đếm tiếp (ít nhất 1 giây) |
| Bấm hành động | Chạy `onAction`, ẩn toast, focus về chỗ cũ |
| <kbd>Esc</kbd> khi focus trong toast | Ẩn toast, focus về chỗ cũ |
| `clear()` | Ẩn toast đang hiện và bỏ hàng đợi (ví dụ khi rời trang) |
| Giảm chuyển động | Không trượt lên, hiện ngay |

## Accessibility

| Phím | Hành vi |
|------|---------|
| (khi hiện) | Không lấy focus; câu thông báo được đọc qua vùng `aria-live="polite"` |
| <kbd>Tab</kbd> | Nút hành động nằm cuối thứ tự Tab của trang; focus vào thì dừng đếm |
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên hành động | Chạy hành động, ẩn toast |
| <kbd>Esc</kbd> | Ẩn toast khi focus đang ở trong nó |

- Toast không có `role` riêng: câu thông báo đi qua `LiveAnnouncer` của CDK, nên screen reader đọc một lần, không lặp.
- `announcement` cho câu đọc khác chữ hiển thị khi cần, ví dụ nói thêm đường hoàn tác khác.
- Vì hành động phải có đường khác và toast dừng khi có focus, toast không phải giới hạn thời gian cho việc của người dùng (WCAG 2.2.1).

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Đã lưu hồ sơ Nguyễn Văn An. | Thành công! |
| Đã ngừng sử dụng 3 chức danh. + Hoàn tác | Thao tác thành công. Bấm vào đây để hoàn tác |
| Đã sao chép mã nhân viên NV-00241. | Mã NV-00241 (cần ghi lại) trong toast |
| Không lưu được: dùng Alert hoặc `notify()` | Toast đỏ "Lỗi máy chủ" |

## API

`NxtToast.show(message, options)` trả về `NxtToastRef` (`afterDismissed`, `onAction`, `dismiss()`). Các tuỳ chọn: `action`, `duration`, `announcement`. `NxtToast.dismiss()` ẩn toast đang hiện, `NxtToast.clear()` ẩn và bỏ hàng đợi. `nxtToastDuration(message, hasAction)` trả thời gian mặc định.

::api{toast}

## Token

::tokens{component.toast}

## Changelog

- **Chưa phát hành**: beta: service `NxtToast` (hàng đợi, thời gian theo độ dài chữ, dừng khi hover/focus, một hành động), `nxt-toast-host`.

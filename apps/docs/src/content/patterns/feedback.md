---
title: Thông báo & phản hồi
description: Chọn đúng kênh cho mỗi sự kiện — lỗi trường, lỗi khi lưu form dài, thành công, cảnh báo trong trang, xác nhận nguy hiểm, lỗi hệ thống — kèm mức ngắt người dùng và role ARIA.
status: beta
order: 5
keywords:
  - thong bao
  - phan hoi
  - feedback
  - messaging
  - toast
  - alert
  - loi
  - xac nhan
  - message box
  - live region
---

# Thông báo & phản hồi

Sau mỗi thao tác, người dùng cần biết ba điều: **đã xong chưa**, **có gì sai**, **làm gì tiếp**. Mỗi sự kiện có đúng một kênh. Chọn sai kênh là lỗi thường gặp nhất: toast đỏ cho lỗi biến mất trước khi kịp đọc, hộp thoại "Đã lưu" bắt người dùng bấm thêm một lần cho không gì cả.

Ba nguyên tắc (theo SAP Fiori, phần messaging):

1. **Không ngắt khi không cần.** Chỉ ngắt (dialog modal) khi người dùng phải quyết định hoặc phải đọc rồi mới đi tiếp được.
2. **Thông báo nằm gần thứ nó nói tới.** Lỗi của trường ở dưới trường; lỗi của bảng ở trên bảng; lỗi không gắn chỗ nào mới lên dialog.
3. **Giúp sửa, không chỉ báo.** Mỗi câu lỗi trả lời: chuyện gì xảy ra, vì sao, làm gì tiếp (principles §5).

::example{action-bar-form}

## Sự kiện nào, kênh nào

| Sự kiện | Kênh | Ngắt? | Role / ARIA |
|---------|------|-------|-------------|
| Lỗi một trường (thiếu, sai định dạng) | `error` của [Form field](/components/form-field), ngay dưới trường | Không | `aria-invalid` + `aria-describedby` trên control |
| Lỗi khi lưu **form dài** (nhiều section, phải cuộn) | Lỗi tại từng trường **và** nút thông báo của [Action bar](/components/action-bar); danh sách tự mở khi bấm lưu | Không (popover không modal, focus vào danh sách) | Nút `aria-haspopup="dialog"`; danh sách `role="dialog"` không modal, mỗi nhóm là `list` có tên |
| Lỗi khi lưu **form ngắn** trong drawer/dialog | Lỗi tại trường, focus trường lỗi đầu tiên; số lỗi đọc qua `role="status"` | Không | `status` |
| Thành công (lưu, gửi, sao chép, xuất xong) | [Toast](/components/toast) | Không | live region `polite` |
| Thành công mà "Hoàn tác" là đường duy nhất để lấy lại | [Alert](/components/alert) `success` + "Hoàn tác" trong `[nxtLiveRegion]` (không tự biến mất) | Không | `status` |
| Thành công một phần ("Đã duyệt 17 trong 20 đơn") | Alert `warning` + "Xem chi tiết" (drawer kết quả theo từng mục) | Không | `status` |
| Cảnh báo / lưu ý trong trang ("Đang sửa bản nháp; phiên bản 3 vẫn áp dụng") | Alert `info` / `warning` gần nội dung, không có nút đóng nếu là trạng thái thường trực | Không | Không role nếu có sẵn khi tải trang; xuất hiện sau thao tác thì đặt trong `[nxtLiveRegion]` |
| Lỗi tải một khối dữ liệu | [Empty state](/components/empty-state) hoặc Alert `danger` + "Thử lại" ngay tại khối | Không | `status` (hoặc `alert` nếu chặn việc đang làm) |
| Xác nhận thao tác **không hoàn tác được** (xoá vĩnh viễn, chạy lương, thu hồi quyền) | [Dialog](/components/dialog) `confirm({ tone: 'danger' })` | **Có** | `alertdialog`, focus nút huỷ |
| Rời trang / đóng drawer khi còn thay đổi chưa lưu | `confirm()` "Rời khỏi biểu mẫu khi chưa lưu?" (drawer: `canClose`) | **Có** | `alertdialog` |
| Xác nhận nhanh, ít rủi ro, ngay cạnh nút ("Bỏ bản nháp này?") | [Popover](/components/popover) có footer | Không | `dialog` không modal |
| Lỗi hệ thống chặn luồng, không gắn trường (mất kết nối khi lưu, phiên hết hạn) | Dialog `notify({ tone: 'danger' })`, chi tiết kỹ thuật trong "Xem chi tiết" | **Có** | `alertdialog`, focus "Đóng" |
| Kết quả có số cần ghi lại (số quyết định, mã chứng từ) | Dialog `notify({ tone: 'success' })` | **Có** | `alertdialog` |
| Việc mới đến từ hệ thống (đơn chờ duyệt) | Chuông trên topbar + badge, menu trái có số | Không | Số nằm trong tên của nút; không đọc lên liên tục |

## Cách chọn nhanh

1. Gắn với **một trường**? → lỗi tại trường. Form dài thì thêm action bar.
2. Là **thành công**? → toast. Hoàn tác là đường duy nhất, hoặc cần ở lại để đọc → alert.
3. Người dùng phải **quyết định**? → `confirm()`. Ít rủi ro và gắn với một nút → popover.
4. Người dùng phải **đọc rồi mới đi tiếp**, không có chỗ nào trong trang để đặt? → `notify()`.
5. Còn lại (lưu ý, thành công một phần, lỗi khối) → alert ngay tại chỗ.

## Luật

- **Toast không bao giờ cho lỗi hay cảnh báo.** Lỗi cần người dùng làm gì đó; toast tự biến mất.
- **Lỗi trường luôn ở dưới trường**, kể cả khi đã có danh sách thông báo. Danh sách chỉ giúp tìm, không thay chỗ.
- **Danh sách thông báo tự mở chỉ khi bấm hành động kết thúc** (Lưu, Gửi duyệt). Lỗi xuất hiện khi đang sửa chỉ cập nhật số trên nút.
- **Kiểm khi bấm lưu, sau đó kiểm lại sau mỗi lần sửa.** Không báo lỗi khi người dùng mới đi qua trường lần đầu.
- **Một vùng tối đa một alert kết quả.** Kết quả mới thay kết quả cũ; alert kết quả được gỡ khi người dùng bắt đầu thao tác khác hoặc đổi tab.
- **Không hỏi xác nhận cho việc hoàn tác được.** Xem [Dialog › Xác nhận hay hoàn tác](/components/dialog#xac-nhan-hay-hoan-tac).
- **Dialog không chồng dialog.** Ngoại lệ duy nhất: `confirm()` khi đóng drawer còn thay đổi chưa lưu.
- **Câu thông báo dùng tên thật của đối tượng**: "Đã lưu hồ sơ Nguyễn Văn An.", không "Lưu thành công".

## Phải đọc cho screen reader

Những thay đổi người nhìn thấy được mà không có focus đi kèm thì phải đọc qua live region (không nói thêm điều người nhìn không thấy):

- Kết quả tìm kiếm và lọc: "Tìm thấy 7 chức danh".
- Đã lưu, đã xoá, đã nhập, đã hoàn tác (toast hoặc alert trong `[nxtLiveRegion]`).
- Số lỗi sau khi bấm lưu form ngắn.
- Nội dung drawer/dialog đổi toàn bộ (sang bước khác, sang bản ghi kế tiếp).
- Dữ liệu tự làm mới, giá trị được hệ thống tự sửa.
- Nút đổi nhãn sau thao tác.

## Trạng thái

| Trạng thái | Hiển thị |
|------------|----------|
| Đang lưu | Nút Lưu `loading`; drawer/dialog `disableClose`; không toast "Đang lưu…" |
| Lưu xong | Toast (form trong drawer, trang sửa) |
| Lưu lỗi do dữ liệu | Lỗi tại trường + action bar (trang) / focus trường lỗi (drawer) |
| Lưu lỗi do hệ thống | `notify({ tone: 'danger' })`; dữ liệu đang nhập vẫn giữ nguyên |
| Có thay đổi chưa lưu | Chữ trạng thái trên action bar; cảnh báo khi rời trang/đóng drawer |

## Phím tắt

| Phím | Ở đâu | Làm gì |
|------|-------|--------|
| <kbd>Esc</kbd> | Toast (khi focus trong toast), popover, dialog | Đóng; dialog xác nhận trả "huỷ" |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Nút thông báo của action bar | Mở danh sách, focus tin đầu tiên |
| <kbd>Enter</kbd> | Một tin trong danh sách | Tới đúng trường |
| <kbd>Tab</kbd> | Popover, dialog | Đi vòng bên trong |

## Responsive

- Toast nằm ở đáy giữa **vùng nội dung**, không đè lên menu trái; có action bar thì nằm trên action bar.
- Action bar dính đáy ở mọi bề rộng; nút xuống dòng khi hẹp. Dưới 1024px page header cuộn mất nên hành động kết thúc **phải** ở action bar.
- Dialog thu theo màn hình trừ lề; vùng "Xem chi tiết" cuộn riêng.

## Đối chiếu khi chuyển từ thư viện khác

| Khái niệm (SAP Fiori / thư viện UI phổ biến) | Dùng trong NXT |
|-----------------------------------------------|----------------|
| Message toast, toast thành công | `NxtToast` (chỉ thành công) |
| Toast lỗi/cảnh báo | Không có: `nxt-alert` trong trang |
| Message strip, inline message | `nxt-alert` |
| Message box một nút (lỗi, thông tin) | `NxtDialog.notify()` |
| Confirm dialog | `NxtDialog.confirm()` |
| Message popover (gom lỗi của form) | Nút thông báo + danh sách của `nxt-action-bar` |
| Value state của trường | `error` / `warning` của `nxt-form-field` |
| Illustrated message | `nxt-empty-state` |
| Quick confirmation cạnh nút | `nxt-popover` có footer |

## Components dùng

`nxt-form-field` · `nxt-action-bar` + `nxt-message-list` · `NxtToast` · `nxt-alert` + `[nxtLiveRegion]` · `NxtDialog.confirm()` / `notify()` · `NxtDrawer` (`canClose`) · `nxt-popover` · `nxt-empty-state`

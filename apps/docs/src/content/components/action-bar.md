---
title: Action bar
description: Thanh dính đáy vùng nội dung cho hành động kết thúc của trang sửa/tạo (Lưu, Huỷ, Gửi duyệt), kèm nút thông báo đếm lỗi mở danh sách và đưa tới đúng trường.
status: beta
group: Hành động
order: 4
package: "@nxt/ui/action-bar"
keywords:
  - action bar
  - footer toolbar
  - thanh hanh dong
  - nut luu
  - danh sach loi
  - thong bao loi
  - message popover
  - tom tat loi
---

# Action bar

## Khi nào dùng

- Trang **sửa hoặc tạo** (không phải drawer/dialog) có hành động kết thúc cho cả trang: hồ sơ nhân viên, hợp đồng, cấu hình quy trình duyệt.
- Form dài: người dùng cuộn tới đâu cũng thấy Lưu/Huỷ, và khi lưu có lỗi thì biết **bao nhiêu** lỗi, **ở đâu**.

## Khi nào không dùng

- **Trang chỉ xem**: không có thanh. Hành động của bản ghi (Sửa, Xoá, ⋯) nằm trên [Page header](/components/page-header).
- **Form trong drawer hoặc dialog**: dùng footer của [Drawer](/components/drawer) / [Dialog](/components/dialog).
- **Hành động của một bảng/khối**: đặt trên thanh công cụ của khối đó.
- **Thao tác trên các hàng đã chọn**: dùng thanh "Đã chọn N" của [Table](/components/table).
- **Báo lưu thành công**: dùng [Toast](/components/toast).

Thứ tự và kiểu nút theo pattern [Vị trí hành động](/patterns/action-placement); cách chọn kênh thông báo theo [Thông báo & phản hồi](/patterns/feedback).

## Ví dụ

Bấm **Lưu và gửi duyệt** khi chưa nhập ngày kết thúc: lỗi hiện dưới trường, nút thông báo màu đỏ hiện bên trái thanh và danh sách tự mở. Chọn một tin để nhảy tới trường đó. Sau lần lưu đầu, lỗi tự cập nhật khi sửa; lúc đang gõ lần đầu thì không báo gì.

::example{action-bar-form}

```html
<nxt-action-bar [messages]="messages()">
  <span nxtActionBarStatus>Có thay đổi chưa lưu</span>
  <button nxtButton variant="ghost">Huỷ</button>
  <button nxtButton>Lưu nháp</button>
  <button nxtButton variant="primary" (click)="submit()">Lưu và gửi duyệt</button>
</nxt-action-bar>
```

```ts
readonly bar = viewChild.required(NxtActionBar);

submit() {
  this.checked.set(true);                         // từ giờ kiểm lại sau mỗi lần sửa
  if (this.messages().some((m) => m.type === 'error')) {
    this.bar().openMessages();                    // mở danh sách, focus tin đầu tiên
    return;
  }
  this.save();
}
```

Mỗi `NxtMessage` có `id`, `type` (`error` | `warning` | `info` | `success`), `title` (giống câu lỗi dưới trường), `description` (vị trí: "Thông tin hợp đồng · Ngày kết thúc") và `target` (id hoặc phần tử của trường). Tin không có `target` (lỗi máy chủ không gắn trường) hiện dạng chữ, không bấm được.

## Các trạng thái

::example{action-bar-states}

## Anatomy

| # | Phần | Ghi chú |
|---|------|---------|
| 1 | Thanh | Dính đáy vùng cuộn, viền trên, cả bề ngang vùng nội dung; landmark `region` có tên |
| 2 | Nút thông báo | Bên trái; chỉ có khi có tin. Icon, màu và số theo loại **nặng nhất** (lỗi > cảnh báo > thông tin > thành công) |
| 3 | Danh sách thông báo | Popover mở lên trên, tiêu đề "Thông báo (N)", nhóm theo loại, lỗi trước |
| 4 | Trạng thái | `[nxtActionBarStatus]`: "Có thay đổi chưa lưu", "Đã lưu nháp lúc 10:24" |
| 5 | Nhóm nút | Căn phải: phụ → "Huỷ" → **primary cuối** |

## Hành vi & trạng thái

| Tình huống | Thanh làm gì |
|------------|--------------|
| Không có tin | Không có nút thông báo |
| Lỗi lúc đang sửa (sau lần lưu đầu) | Nút cập nhật số lượng, **không** tự mở danh sách |
| Bấm hành động kết thúc mà còn lỗi | Trang gọi `openMessages()`: danh sách mở, focus tin đầu tiên |
| Chọn một tin | Đóng danh sách, phát `messageSelect` (trang mở tab/section nếu cần), rồi cuộn tới và focus trường |
| Chỉ có cảnh báo | Nút màu cảnh báo; vẫn cho lưu |
| Cuộn | Thanh luôn ở đáy; trường đang focus không bị thanh che (`scroll-padding`) |
| Màn hẹp | Nút xuống dòng, vẫn căn phải |

Đặt `nxt-action-bar` là **phần tử cuối cùng** của trang. Nó dính đáy vùng cuộn gần nhất (vùng nội dung của app shell); trong `nxtFill` nó tự xuống đáy khi nội dung ngắn. Toast hiện ngay phía trên thanh.

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Qua nút thông báo rồi các nút hành động |
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên nút thông báo | Mở danh sách, focus tin đầu tiên |
| <kbd>Tab</kbd> trong danh sách | Qua từng tin bấm được, vòng trong danh sách |
| <kbd>Enter</kbd> / <kbd>Space</kbd> trên một tin | Đóng danh sách, focus trường của tin |
| <kbd>Esc</kbd> | Đóng danh sách, focus về nút thông báo |

- Thanh là landmark `region` (mặc định "Thanh thao tác"; đặt `label` riêng khi trang có nhiều thanh), screen reader nhảy tới nhanh.
- Nút thông báo có tên "Thông báo: 2 lỗi, 1 cảnh báo", chứa đúng con số đang hiện; tooltip cùng nội dung.
- Mỗi nhóm là một danh sách có tên "Lỗi (2)"; mỗi tin đọc kèm loại ("Lỗi: Nhập ngày kết thúc hợp đồng.").
- Loại tin không chỉ nói bằng màu: có icon riêng và chữ.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Huỷ · Lưu nháp · **Lưu và gửi duyệt** | **Lưu** · Huỷ (primary đứng đầu) |
| "Huỷ" là `ghost` | "Huỷ" primary hoặc danger |
| Tin: "Nhập ngày kết thúc hợp đồng." + "Thông tin hợp đồng · Ngày kết thúc" | "Trường bắt buộc", "Invalid date" |
| Trạng thái: "Có thay đổi chưa lưu" | "Unsaved", "Dirty" |

## API

`NxtMessageLabels` đổi được mọi chữ (tiêu đề, tên loại, hàm `summary` cho tên của nút). `nxtFocusMessageTarget(target)` dùng riêng được để đưa người dùng tới một trường.

::api{action-bar}

## Token

::tokens{component.action-bar}

## Changelog

- **Chưa phát hành**: beta: `nxt-action-bar` (nút thông báo theo loại nặng nhất, `openMessages()`, `messageSelect`, slot trạng thái), `nxt-message-list`, `NxtMessage`, `nxtFocusMessageTarget()`.

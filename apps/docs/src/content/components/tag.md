---
title: Tag & Badge
description: Tag gắn nhãn trạng thái hoặc phân loại bằng chữ; badge đếm số mục cần chú ý. Màu chỉ hỗ trợ, không bao giờ là tín hiệu duy nhất.
status: beta
group: Hiển thị dữ liệu
order: 32
package: "@nxt/ui/tag"
keywords:
  - tag
  - nhan
  - trang thai
  - phan loai
  - badge
  - huy hieu
  - dem
  - so luong
  - thong bao
  - chip
---

# Tag & Badge

## Khi nào dùng

- **Tag**: trạng thái của một bản ghi ("Chờ duyệt", "Đã ký hợp đồng") hoặc phân loại ngắn ("Toàn thời gian").
- **Badge**: số mục cần chú ý trên nút, tab, mục menu ("12 đơn mới"), hoặc một chấm báo có mục mới.

## Khi nào không dùng

- **Cần bấm, lọc hoặc xoá**: tag không tương tác. Dùng button, segmented control, hoặc chip bộ lọc (`nxt-filter-chips`, xem [Filter](/components/filter)).
- **Thông báo cho cả trang**: dùng alert hoặc banner (đợt B).
- **Giá trị số trong ô bảng**: ghi số trực tiếp, không bọc trong badge.
- **Câu dài**: tag chỉ nên có 1–3 từ. Nhãn dài hơn bị cắt bằng dấu "…" (xem [Nhãn dài](#nhan-dai)); câu giải thích thì đặt thành chữ thường cạnh tag.

## Tông

Ý nghĩa của từng tông **cố định trên mọi sản phẩm**: brand không được đổi màu trạng thái.

::example{tag-tones}

| Tông | Dùng cho |
|------|----------|
| `neutral` (mặc định) | Bản nháp, đã huỷ, ngừng sử dụng, phân loại thông thường |
| `info` | Đang xử lý, đang thử việc |
| `success` | Đã duyệt, hoàn thành, đang hoạt động |
| `warning` | Chờ duyệt, chờ bổ sung, sắp hết hạn |
| `danger` | Từ chối, lỗi, quá hạn, đã nghỉ việc |
| `brand` | Nhấn mạnh không mang nghĩa trạng thái: "Mới", "Đề xuất" |

## Trạng thái không chỉ bằng màu

Chữ trong tag **luôn mang đủ nghĩa**, để người mù màu, người xem bản in đen trắng hoặc dùng chế độ tương phản cao vẫn hiểu. `dot` và `icon` chỉ bổ trợ cho chữ và đều có `aria-hidden`.

- `dot` cho trạng thái của một quy trình; dùng nhất quán trong cùng một bảng.
- `icon` khi hình dạng giúp quét nhanh hơn: đồng hồ cát, dấu tích, tam giác cảnh báo. Khi có `icon` thì `dot` không hiện.
- `size="sm"` cho hàng bảng và danh sách dày.

::example{tag-status}

## Nhãn dài

Một số tag mang giá trị dài không rút gọn được: phạm vi áp dụng, tên phòng ban, tên dự án. Tag có hai cách hiện, chọn theo chỗ đặt:

| Chỗ đặt | Cách | Người dùng xem đủ chữ bằng |
|---------|------|-----------------------------|
| Ô bảng, hàng danh sách, toolbar: phải giữ một dòng | Mặc định: cắt "…" | Rê chuột lên nhãn bị cắt: tooltip hiện đủ chữ. Screen reader luôn đọc đủ chữ |
| Màn chi tiết, drawer, card: chữ đầy đủ là thông tin cần đọc | `wrap` | Không cần làm gì: tag xuống dòng trong bề rộng của cột |

::example{tag-long}

- Tooltip chỉ hiện khi nhãn **thật sự bị cắt**. Nhãn vừa chỗ thì rê chuột không hiện gì.
- Dấu "…" chỉ là CSS: chữ đầy đủ vẫn nằm trong trang, nên screen reader đọc đủ một lần, tooltip không đọc lặp lại.
- Tag **không** nhận focus, kể cả khi bị cắt: một bảng 50 hàng sẽ thành 50 điểm dừng Tab chỉ để đọc chữ. Vì vậy người dùng bàn phím và cảm ứng không mở được tooltip. Chỉ để tag bị cắt ở chỗ mà giá trị đầy đủ có ở nơi khác, ví dụ màn chi tiết mở từ hàng đó, và ở màn chi tiết thì dùng `wrap`.
- `wrap` đổi bo góc viên thuốc thành bo góc của control, để chữ nhiều dòng không lòi ra ngoài nền.

## Badge đếm

- `value` lớn hơn `max` (mặc định 99) thì hiện "99+".
- `label` là văn bản screen reader đọc **thay cho** con số, ví dụ "12 đơn mới". Nên có khi con số thiếu ngữ cảnh hoặc bị rút gọn thành "99+".
- Tông: `danger` (mặc định) cho việc cần xử lý, `neutral` cho số mang tính thông tin (số mục trong tab), `brand` để nhấn nhẹ.
- Khi không còn mục nào, **ẩn badge** bằng `@if`; đừng hiện "0".

::example{tag-badge}

## Badge trên nút icon

Tên của nút icon lấy từ `aria-label`, nên screen reader **bỏ qua** nội dung badge nằm trong nút. Ghi con số (hoặc "có tin chưa đọc") ngay trong `aria-label` của nút và cập nhật nhãn khi số thay đổi: "Thông báo, 5 chưa đọc". Badge `dot` không có chữ, nên nút bắt buộc phải nói rõ điều đó trong nhãn.

::example{tag-badge-icon-button}

```html
<button nxtIconButton variant="ghost" [attr.aria-label]="'Thông báo, ' + unread() + ' chưa đọc'">
  <nxt-icon name="bell" />
  @if (unread()) {
    <nxt-badge [value]="unread()" />
  }
</button>
```

Badge không tự định vị. Đặt `position: absolute` cho badge ở góc nút; `nxtIconButton` đã có `position: relative`.

## Accessibility

Tag và badge không tương tác: không có điểm dừng Tab và không có phím tắt.

- Tag là chữ thường, không có role riêng; `dot` và `icon` có `aria-hidden`.
- Nhãn bị cắt: chữ đầy đủ vẫn trong DOM; tooltip (chỉ khi bị cắt, khi rê chuột) không thêm `aria-describedby` nên không bị đọc hai lần. Tag không thêm điểm dừng Tab; nơi chữ đầy đủ là thông tin cần thiết dùng `wrap`.
- Badge có `label` thì con số hiển thị bị ẩn khỏi screen reader và `label` được đọc thay.
- Trong chế độ tương phản cao (forced colors), tag và badge có thêm viền để không lẫn vào nền.
- Badge thay đổi không tự thông báo. Nếu người dùng cần biết ngay (có đơn mới), thông báo qua một vùng `role="status"` hoặc `LiveAnnouncer`.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Chờ duyệt | Pending |
| Đã duyệt | OK |
| Sắp hết hạn | !!! |
| Từ chối, kèm tông `danger` | Chấm đỏ không có chữ |
| `aria-label="Thông báo, 5 chưa đọc"` | `aria-label="Thông báo"` và badge 5 |
| Màn chi tiết: `<nxt-tag wrap>` cho phạm vi áp dụng dài | Để phạm vi áp dụng bị cắt "…" ở màn chi tiết, nơi không còn chỗ nào khác hiện đủ |

## API

::api{tag}

## Token

### Tag

::tokens{component.tag}

### Badge

::tokens{component.badge}

## Changelog

- **0.1.0**: phát hành beta: `nxt-tag` với 6 tông, `dot`, `icon`, size `sm`/`md`; `nxt-badge` với `value`, `max` (99+), 3 tông, `dot`, `label` cho screen reader.
- **Chưa phát hành**: nhãn tag bị cắt có tooltip chữ đầy đủ khi rê chuột (chỉ khi thật sự bị cắt); input `wrap` cho nhãn dài xuống dòng. Token mới `tag.radius-wrap`.

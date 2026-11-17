---
title: Skeleton
description: Khối giữ chỗ đúng hình nội dung sắp có (dòng chữ, tiêu đề, ô nhập, avatar, khối) khi tải lâu hơn khoảng 1 giây — thay cho spinner toàn trang.
status: beta
group: Phản hồi & lớp phủ
order: 45
package: "@nxt/ui/skeleton"
keywords:
  - skeleton
  - placeholder
  - dang tai
  - loading
  - tai du lieu
  - khung xam
  - aria-busy
  - cho
  - busy
---

# Skeleton

`nxt-skeleton` vẽ khung xám đúng hình nội dung sắp có, ở đúng chỗ, để trang không nhảy khi dữ liệu về và người dùng biết cái gì đang tới. Hàm `nxtDeferredLoading()` lo luật thời gian: tải nhanh thì không hiện gì, đã hiện thì không nháy.

## Khi nào dùng

- Lần tải đầu của một trang, một section, một thẻ, khi việc tải mất **hơn khoảng 1 giây**.
- Một phần trang tải chậm hơn phần còn lại (section lịch sử gọi một dịch vụ khác): chỉ phần đó có skeleton.

## Khi nào không dùng

- **Tải dưới khoảng 1 giây**: không hiện gì. `nxtDeferredLoading()` đã lo việc này.
- **Bảng đang tải lần đầu**: hàng giữ chỗ của [Table](/components/table) (`loading` + `tbody[nxtTablePlaceholder]`), cùng hình và cùng luật.
- **Tải lại sau tìm kiếm, lọc, sắp xếp**: giữ dữ liệu cũ, đặt `loading` / `aria-busy` lên bảng; thay bằng skeleton làm người dùng mất chỗ đang đọc.
- **Một nút đang xử lý** (Lưu, Gửi duyệt): `loading` của [Button](/components/button).
- **Đo được tiến độ** (nhập file, chạy lương): [Progress](/components/progress).
- **Tải xong mà không có dữ liệu** hoặc **lỗi**: [Empty state](/components/empty-state) / [Alert](/components/alert) có "Thử lại", không để skeleton.

## Các hình giữ chỗ

::example{skeleton-variants}

- `text` (mặc định): `lines` dòng, mỗi dòng cao bằng một dòng chữ thật; nhiều dòng thì dòng cuối ngắn hơn.
- `heading`: một dòng tiêu đề. `block`: ảnh, biểu đồ (mặc định cao 240px, đặt `block-size` bằng token nếu cần đúng kích thước).
- `control`: ô nhập / nút, cao theo density như control thật. `circle`: avatar, `size` khớp [Avatar](/components/avatar).
- `width` theo bậc của vùng chứa: `full`, `long` (75%), `medium` (50%), `short` (25%). Không nhận giá trị tự do.

## Thời gian và thông báo

::example{skeleton-card}

| Quy tắc | Giá trị |
|---------|---------|
| Không hiện chỉ báo nếu tải nhanh | Dưới khoảng 1 giây (`delay` mặc định 1000ms) |
| Đã hiện thì hiện đủ lâu để không nháy | Tối thiểu 500ms (`minDuration`) |
| Tải quá lâu | Hơn 10 giây: chuyển sang tiến trình chi tiết ([Progress](/components/progress), mô tả việc đang làm, cho "Huỷ" hoặc chạy nền) |

```ts
readonly loading = signal(false);
readonly showSkeleton = nxtDeferredLoading(this.loading); // gọi trong injection context
```

- Trong khoảng 1 giây đầu, giữ chỗ trống (hoặc dữ liệu cũ khi tải lại) để không nhảy bố cục.
- Ví dụ: tải mất 1,3 giây → skeleton hiện ở giây thứ 1, giữ đến 1,5 giây rồi mới thay bằng dữ liệu.

## Hành vi & trạng thái

- Skeleton không tương tác, không focus được, không có hover.
- Nhịp chậm (độ mờ, một nhịp `motion.duration.loop`). Khi người dùng bật giảm chuyển động (`prefers-reduced-motion` hoặc `data-nxt-motion="reduced"`), skeleton **đứng yên**: hình khối đã đủ nói "đang tải".
- Màu khối `bg.muted` dùng trên nền `surface` (thẻ, section). Trên nền trang sáng (`canvas`) khối gần như trùng màu nền: đặt skeleton trong thẻ hoặc section.

## Accessibility

Skeleton không có phím.

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> | Bỏ qua skeleton (không có gì focus được bên trong) |

- `nxt-skeleton` luôn `aria-hidden="true"`: trình đọc màn hình không đọc các khối xám.
- **Vùng đang tải** (của nơi dùng): đặt `aria-busy="true"` lên phần tử bao nội dung (section, thẻ, bảng), gỡ khi xong. Với [Object page](/components/object-page), dùng `busy` của section.
- **Câu trạng thái**: đặt sẵn một live region (`[nxtLiveRegion]`, có thể ẩn bằng `nxt-visually-hidden`) trên trang; khi bắt đầu tải chèn "Đang tải …", khi xong chèn "Đã tải xong …". `aria-busy` không thay được câu này vì một số trình đọc màn hình bỏ qua nó.
- Không chuyển focus vào vùng đang tải.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Dựng skeleton đúng hình: avatar + 2 dòng, 4 cặp nhãn–giá trị, đúng số cột | Một khối xám lớn cho cả trang |
| Chỉ giữ chỗ phần đang tải; tiêu đề, nút, thanh neo hiện thật ngay | Skeleton cả những gì đã biết (tiêu đề trang) |
| "Đang tải hồ sơ nhân viên…" / "Đã tải xong hồ sơ nhân viên." | "Loading…", "Vui lòng chờ" |

## API

::api{skeleton}

## Tokens

::tokens{component.skeleton}

## Changelog

### Chưa phát hành

- Component mới (beta): `nxt-skeleton` (text, heading, block, control, circle) và `nxtDeferredLoading()` (trễ 1 giây, hiện tối thiểu 500ms). Theo SAP Fiori placeholder loading, busy handling và Timing.

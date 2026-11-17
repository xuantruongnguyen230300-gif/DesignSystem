---
title: Motion
description: Chuyển động ngắn để giải thích thay đổi, thời gian phản hồi khi đang tải, và cách tôn trọng cài đặt giảm chuyển động của người dùng.
order: 6
status: beta
keywords:
  - chuyen dong
  - animation
  - motion
  - reduced motion
  - thoi gian
  - dang tai
  - loading
  - timing
---

# Motion

## Nguyên tắc

- Chuyển động **giải thích thay đổi trạng thái**: mở, đóng, xuất hiện, biến mất. Không dùng để trang trí. Bỏ hết chuyển động đi, người dùng vẫn phải làm xong việc.
- **Ngắn**: 100–300ms. Người dùng thao tác lặp lại hàng trăm lần mỗi ngày. Dài hơn chỉ dành cho chuyển động lặp của chỉ báo đang chờ.
- **Thời lượng theo kích thước**: phần tử nhỏ đổi nhanh, phần tử lớn đi vào từ mép màn hình chậm hơn một chút để mắt kịp theo.
- **Không animation khi vào trang** cho từng phần tử, không nảy (bounce), không lấy đà.
- **Xuất hiện từ nguồn gốc**: menu mở từ nút của nó, drawer trượt từ mép phải, phần chi tiết mở ra ngay dưới nút "Xem chi tiết".

::example{motion-durations}

## Nhóm thời lượng

| Nhóm | Token | Đủ / giảm chuyển động | Dùng cho | Component |
|------|-------|-----------------------|----------|-----------|
| Tức thì | `duration.instant` | 0 / 0 | Thay đổi không cần chuyển động | — |
| Nhanh | `duration.fast` | 100ms / 0 | Hover, đổi màu nền và viền, phần tử nhỏ neo vào control xuất hiện | Button, form field, hàng bảng (hover, thanh thao tác), menu và tooltip (mở) |
| Vừa | `duration.normal` | 200ms / 0 | Phần tử cỡ vừa mở ra, bố cục đổi tại chỗ | Dialog (mở), thu gọn / mở rộng sidenav |
| Chậm | `duration.slow` | 300ms / 0 | Phần tử lớn đi vào từ mép màn hình, kích thước đổi có nghĩa | Drawer (mở), sidenav trên màn hẹp, thanh tiến trình |
| Lặp | `duration.loop` | 700ms / **1600ms** | Một vòng của chỉ báo đang chờ | Skeleton (nhịp), spinner của nút đang xử lý |

Không đặt thời lượng ngoài bảng này. Cần một giá trị mới thì thêm token, không viết số trong CSS.

## Vào và ra

- **Ra nhanh hơn vào.** Phần tử xuất hiện cần đủ thời gian để người dùng nhận ra và chuẩn bị thao tác; phần tử biến mất chỉ cần dọn chỗ và xác nhận việc đã xong. Khi có chuyển động đóng, dùng bậc thời lượng **thấp hơn một bậc** so với lúc mở: drawer mở `slow` thì đóng `normal`, dialog mở `normal` thì đóng `fast`; menu và tooltip đóng ngay.
- **Đường cong theo vai trò**: phần tử vào dùng `ease.enter` (giảm tốc: xuất hiện nhanh, dừng êm ở vị trí cuối); phần tử ra dùng `ease.exit` (tăng tốc: rời đi dứt khoát); đổi trạng thái tại chỗ dùng `ease.standard`. Tên token theo vai trò, nên không cần nhớ đường cong nào là "ease-in" hay "ease-out".
- **Một thay đổi, một chuyển động.** Nhiều phần tử cùng đổi thì để chúng đổi cùng lúc hoặc nối tiếp ngắn; không chạy nhiều hiệu ứng chồng lên nhau.

## Thời gian phản hồi

Người dùng cảm nhận độ trễ theo bốn mức. Mỗi mức có một cách phản hồi:

| Thời gian | Người dùng cảm nhận | NXT làm gì |
|-----------|---------------------|------------|
| ≤ 100ms | Tức thì | Đổi trạng thái nút, checkbox, hover. Không cần chỉ báo nào |
| 100ms – 1s | Vẫn liền mạch | Mở tooltip, menu; tìm kiếm sau phím cuối (debounce 250ms). **Không hiện chỉ báo đang tải** |
| 1 – 10s | Biết là phải chờ | Hiện chỉ báo sau khoảng 1 giây: skeleton khi tải lần đầu, `loading` trên nút, `aria-busy` trên vùng tải lại |
| > 10s | Dễ tưởng bị treo | Thanh tiến trình nếu đo được ([Progress](/components/progress)), mô tả việc đang làm, cho chạy nền hoặc "Huỷ" |

### Luật đang tải

1. **Dưới khoảng 1 giây: không hiện gì.** Chỉ báo nháy lên rồi tắt làm thao tác có vẻ chậm hơn.
2. **Hiện chỉ báo sau khoảng 1 giây.**
3. **Đã hiện thì giữ tối thiểu khoảng 500ms** để khỏi nháy. Ví dụ: việc mất 1,3 giây thì chỉ báo hiện ở giây thứ 1 và tắt ở giây thứ 1,5.
4. **Quá 10 giây**: chuyển sang tiến trình chi tiết, hoặc cho chạy nền và báo khi xong, hoặc có nút "Huỷ" kèm mô tả đúng việc đang chạy ("Đang tính lương kỳ 11/2026…").
5. **Chỉ chặn vùng bị ảnh hưởng.** Không chặn app shell, không spinner toàn trang. Tải lại sau lọc hoặc sắp xếp thì giữ dữ liệu cũ (xem [Trạng thái › Dữ liệu](/foundations/states#du-lieu)).
6. **Chặn bấm lặp ngay**, kể cả khi chỉ báo chưa hiện: nơi dùng giữ cờ "đang gửi" từ lúc bấm.
7. **Báo kết quả cho screen reader** qua live region khi kết quả không nằm ở chỗ đang focus.

Hàm `nxtDeferredLoading()` (`@nxt/ui/skeleton`) thực hiện luật 1–3 (trễ 1000ms, giữ tối thiểu 500ms); xem [Skeleton](/components/skeleton).

### Hover và tooltip

- Hover **300–500ms** mới là ý định mở nội dung ẩn. Sớm hơn dễ mở nhầm khi rê chuột ngang qua; muộn hơn có cảm giác chậm. Tooltip của NXT hiện sau 300ms khi hover, **hiện ngay** khi focus bằng bàn phím, đóng sau 100ms khi rời chuột.
- Phản hồi hover của nút (đổi nền) và trở về trong ≤ 100ms (`duration.fast`).

## Giảm chuyển động

Khi người dùng bật "giảm chuyển động" trong hệ điều hành, NXT tự đổi token mà không cần code thêm. Có thể ép bằng `data-nxt-motion="reduced"` hoặc `"full"` trên bất kỳ phần tử nào.

| Token | Đủ | Giảm |
|-------|----|------|
| `instant`, `fast`, `normal`, `slow` | 0 / 100 / 200 / 300ms | **0** (mở, đóng, hover thay đổi tức thì) |
| `loop` | 700ms | **1600ms**: chậm lại, không về 0 |

- Chỉ báo đang chờ có chuyển động lặp (spinner) **chạy chậm lại, không tắt**, vì nó cho biết hệ thống vẫn đang làm việc.
- Skeleton **đứng yên** khi giảm chuyển động: hình khối đã đủ nói "đang tải".
- Component đọc thời lượng từ token (`var(--nxt-motion-duration-*)`) để theo cả cài đặt hệ điều hành lẫn `data-nxt-motion`. Chỉ viết `@media (prefers-reduced-motion)` trong component khi có lý do ghi trong SPEC (như skeleton tắt nhịp), vì media query bỏ qua `data-nxt-motion`.

## Token

::tokens{semantic.motion}

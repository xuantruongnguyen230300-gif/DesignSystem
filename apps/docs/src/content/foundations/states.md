---
title: Trạng thái
description: Dùng khi quyết định ẩn, vô hiệu hoá, chỉ đọc hay hiện thành chữ một nút hoặc trường; khi chọn trạng thái giá trị (lỗi, cảnh báo, thông tin) cho trường nhập; và khi đặc tả ma trận trạng thái của một component.
order: 8
status: beta
keywords:
  - trang thai
  - state
  - disabled
  - vo hieu hoa
  - an
  - hidden
  - chi doc
  - readonly
  - focus
  - hover
  - da chon
  - selected
  - value state
  - loi
  - canh bao
  - dang tai
  - rong
  - khong co quyen
---

# Trạng thái

## Nguyên tắc

- **Trạng thái chia theo trục.** Một nút có thể vừa được chọn, vừa đang focus, vừa đang rê chuột, nhưng trên **mỗi trục** nó chỉ có đúng một giá trị tại một thời điểm.
- **Người dùng phải biết vì sao không làm được.** Ẩn khi họ không bao giờ dùng được; vô hiệu hoá chỉ khi họ biết cách bật lại; còn lại để bật và báo lỗi khi dùng sai.
- **Không chỉ bằng màu.** Mọi trạng thái có thêm icon, chữ hoặc hình (vạch chỉ báo, dấu tích) và có thuộc tính ARIA tương ứng.
- **Trạng thái không làm nhảy bố cục.** Đổi màu, nền, viền; không đổi kích thước hay độ đậm làm chữ đổi bề rộng (xem [Typography](/foundations/typography)).

## Sáu trục trạng thái

| Trục | Giá trị | Ai quyết định | Thể hiện trong code |
|------|---------|---------------|---------------------|
| Khả dụng | bật · vô hiệu hoá · chỉ đọc · ẩn | Nơi dùng, theo quyền và ngữ cảnh | `aria-disabled` hoặc `disabled`, `readonly` / `aria-readonly`, không render (`@if`) |
| Focus | có focus · không | Người dùng (bàn phím, chuột, code) | `:focus-visible`, vòng focus `focus.ring.*` |
| Tương tác | nghỉ · hover · đang nhấn | Component tự xử lý | `:hover` trong `@media (hover: hover)`, `:active`, `aria-pressed` cho nút bật/tắt |
| Chọn | đã chọn · chưa chọn · chọn một phần | Người dùng | `aria-selected`, `aria-checked`, `aria-current`, `indeterminate` |
| Giá trị | không · lỗi · cảnh báo · thông tin · thành công | Kiểm tra dữ liệu, luật nghiệp vụ, hệ thống | `aria-invalid` (chỉ lỗi), thông điệp nối qua `aria-describedby` |
| Dữ liệu | sẵn sàng · đang tải · rỗng · lỗi tải · một phần · không có quyền | Vùng dữ liệu: trang, bảng, card | `aria-busy`, skeleton, empty state, alert |

Năm trục đầu áp cho từng phần tử. Trục **Dữ liệu** là của NXT, áp cho cả một vùng, và nối với nguyên tắc "trạng thái đầy đủ": mỗi màn hình phải thiết kế đủ các trạng thái dữ liệu.

### Khả dụng

| Giá trị | Nghĩa | Dùng khi | Không dùng khi |
|---------|-------|----------|----------------|
| Bật | Thấy, focus được, dùng được | Mặc định. Cả khi điều kiện để dùng nằm ở chỗ khác: để bật, kiểm khi bấm và báo cách sửa | — |
| Vô hiệu hoá | Thấy nhưng không kích hoạt được | Người dùng **biết cách bật lại** bằng một thao tác trên chính màn hình (chọn hàng, tích ô ngay cạnh) | Người dùng không bao giờ bật được (→ ẩn); lý do không rõ (→ để bật và báo lỗi) |
| Chỉ đọc | Thấy rõ, focus được, chọn và sao chép được giá trị, không sửa được | Trường trong một form **đang sửa** mà lúc này không sửa được | Trang ở chế độ xem (→ hiện thành chữ); trường không bao giờ sửa được (→ hiện thành chữ) |
| Ẩn | Không thấy, không focus, không chiếm chỗ | Không có quyền; không thuộc chế độ hiện tại (nút Lưu khi đang xem); ẩn có chủ đích trên màn hẹp | Người dùng có thể làm cho nó dùng được bằng một thao tác (→ vô hiệu hoá kèm lý do) |

"Hiện thành chữ" không phải một trạng thái của control: giá trị hiển thị bằng chữ thường (trong [Descriptions](/components/descriptions) hoặc ngay trong form), đọc đầy đủ, không cắt, không có khung nhập.

### Focus

- Mọi phần tử tương tác có vòng focus khi dùng bàn phím; chỉ **một** phần tử có focus tại một thời điểm.
- Vòng focus không bị header hay thanh dính che (WCAG 2.4.11).
- Di chuyển focus không kích hoạt phần tử. Phần tử ẩn không bao giờ nhận focus.
- Hành động vô hiệu hoá **vẫn nhận focus** để đọc được lý do (xem [Chính sách vô hiệu hoá](#chinh-sach-vo-hieu-hoa)); trường nhập `disabled` native thì không.

### Tương tác

- Hover chỉ có với chuột và bút. Không có trên cảm ứng và bàn phím, nên **không đặt thông tin chỉ hiện khi hover**: thanh thao tác của hàng bảng phải có đường khác (menu, màn chi tiết), tooltip không được là nơi duy nhất chứa thông tin.
- Đang nhấn chỉ tồn tại khi chưa thả. Nút bật/tắt (ghim cột, in đậm) dùng `aria-pressed`, giữ một nhãn hành động cho cả hai trạng thái.

### Chọn

- Mục đã chọn phân biệt rõ với phần còn lại bằng hơn một tín hiệu: nền `bg.selected` kèm dấu tích, vạch chỉ báo hoặc `aria-current`.
- Chọn một phần (`indeterminate`) chỉ cho chọn nhiều có cấp: ô "chọn tất cả" khi chỉ một số hàng được chọn, nút cha trong cây.
- **Ô chọn hàng trong bảng không bao giờ bị vô hiệu hoá.** Hành động không áp được cho vài hàng thì vẫn cho chọn, khi chạy báo rõ hàng nào không xử lý được.

### Dữ liệu

| Trạng thái | Khi nào | Hiển thị | Component |
|------------|---------|----------|-----------|
| Đang tải lần đầu | Chưa có dữ liệu, mất hơn khoảng 1 giây | Khung giữ chỗ đúng hình nội dung; vùng có `aria-busy="true"`. Dưới 1 giây không hiện gì (xem [Thời gian phản hồi](/foundations/motion#thoi-gian-phan-hoi)) | [Skeleton](/components/skeleton), `loading` của [Table](/components/table) |
| Đang tải lại | Sau tìm kiếm, lọc, sắp xếp, đổi trang | Giữ dữ liệu cũ, làm mờ và chặn bấm, `aria-busy="true"`; không thay bằng skeleton | `loading` của Table |
| Rỗng | Tải xong, không có gì | Nói vì sao rỗng và bước tiếp theo; tách "chưa có dữ liệu" với "không có kết quả cho bộ lọc" | [Empty state](/components/empty-state) |
| Lỗi tải | Không lấy được dữ liệu | Nguyên nhân + "Thử lại", đặt tại vùng bị lỗi; không toast | Empty state (lỗi), [Alert](/components/alert) |
| Một phần | Có dữ liệu nhưng thiếu một phần (một nguồn lỗi, quá giới hạn) | Hiện phần đã có; alert cảnh báo nói phần nào thiếu và cách lấy lại | Alert `warning` |
| Không có quyền | Người dùng không được xem vùng này | Vùng nằm trong trang: **ẩn**. Cả trang: một câu "Bạn không có quyền xem trang này." kèm người cần liên hệ | Empty state |
| Cũ / ngoại tuyến | Dữ liệu chưa cập nhật, mất kết nối | Vẫn hiện dữ liệu, alert thông tin ghi thời điểm cập nhật cuối | Alert `info` |

Chỉ chặn đúng vùng bị ảnh hưởng. Không chặn app shell, không spinner toàn trang.

## Tổ hợp trạng thái

| Tổ hợp | Được phép | Ví dụ |
|--------|-----------|-------|
| Bật + đã chọn + hover | ✓ | Hàng bảng đã chọn đang được rê chuột: vẫn phải thấy phản hồi hover |
| Focus + đã chọn + hover | ✓ | Tab đang chọn vừa nhận focus bàn phím |
| Focus + lỗi (hoặc cảnh báo, thông tin) | ✓ | Trường lỗi đang nhập: vòng focus và viền lỗi đều phải thấy |
| Chỉ đọc + focus | ✓ | Tab tới trường "Mã chức danh" khi sửa để sao chép giá trị |
| Chỉ đọc + đã chọn | ✓ | Checkbox chỉ đọc đã tích |
| Chỉ đọc + bất kỳ trạng thái giá trị | ✗ | Trường chỉ đọc không mang lỗi hay cảnh báo; vấn đề của giá trị đó báo ở mức form (alert) |
| Vô hiệu hoá + bất kỳ trạng thái khác | ✗ | Không hover, không chọn, không trạng thái giá trị. Ngoại lệ duy nhất: hành động `aria-disabled` vẫn nhận focus |
| Ẩn + bất kỳ trạng thái khác | ✗ | — |
| Nhiều trạng thái giá trị cùng lúc | ✗ | Chỉ hiện một, theo thứ tự ưu tiên bên dưới |

Khi nhiều nguồn cùng muốn đặt trạng thái, lấy theo thứ tự:

- **Khả dụng**: ẩn > vô hiệu hoá > hiện thành chữ > chỉ đọc > bật (lấy cái hạn chế nhất).
- **Tương tác**: đang nhấn > hover > nghỉ.
- **Giá trị**: lỗi > cảnh báo > thông tin > thành công > không (lấy cái nghiêm trọng nhất; khớp với `nxt-form-field`).

## Ẩn, vô hiệu hoá, chỉ đọc hay hiện thành chữ

Trả lời lần lượt, dừng ở câu đầu tiên đúng:

1. **Người dùng không có quyền** dùng hoặc xem phần tử này? → **Ẩn.** Link tới trang họ không được mở mà chữ vẫn có giá trị (mã đơn) thì hiện thành chữ thường, bỏ link; link chỉ có chữ chung chung ("Chi tiết") thì ẩn.
2. Phần tử **không thuộc chế độ hiện tại** (nút Lưu khi đang xem, nút Sửa khi đang sửa)? → **Ẩn.**
3. Là **trường nhập** và trang đang ở **chế độ xem**? → **Hiện thành chữ** ([Descriptions](/components/descriptions)), không dùng input chỉ đọc.
4. Là trường nhập **không bao giờ sửa được** ở bất kỳ chế độ nào của form (mã tự sinh, người tạo, ngày tạo)? → **Hiện thành chữ** ngay trong form.
5. Là trường nhập **tạm thời không sửa được** trong form đang sửa (mã khoá sau khi tạo, khoá theo quy trình duyệt, giá trị tính từ trường khác)? → **Chỉ đọc**, kèm hướng dẫn nói lý do: "Mã không đổi được sau khi tạo."
6. Là **hành động** chưa dùng được, người dùng **làm cho nó dùng được bằng một thao tác trên màn hình này** (chọn hàng, tích ô)? → **Vô hiệu hoá kèm lý do**: "Chọn ít nhất một đơn để duyệt."
7. Là hành động bị **trạng thái của bản ghi** chặn mà người dùng nên biết ràng buộc (chức danh đang được dùng thì không xoá được)? → **Vô hiệu hoá kèm lý do**: "Không xoá được: đang được dùng ở 12 hồ sơ."
8. Điều kiện để dùng **không rõ hoặc nằm ở màn khác**? → **Để bật.** Kiểm khi bấm, báo lỗi nói cách sửa.
9. Còn lại → **Bật.**

Luôn bật, kiểm khi bấm:

- **Hành động kết thúc**: Lưu, Gửi duyệt, Áp dụng. Không vô hiệu hoá nút Lưu cho tới khi form hợp lệ; người dùng không biết trường nào đang chặn.
- **Nút trên thanh công cụ không phụ thuộc lựa chọn**: Bộ lọc, Nhập, Xuất, Thêm mới.
- **Nút hàng loạt khi ít nhất một mục đã chọn đủ điều kiện**: "Xoá" vẫn bật nếu xoá được một phần; kết quả nói rõ phần nào không xoá được. Chưa chọn gì, hoặc không mục nào đủ điều kiện thì vô hiệu hoá kèm lý do.

## Chính sách vô hiệu hoá

Một chính sách cho mọi component và mọi sản phẩm dùng NXT:

| Loại phần tử | Cách vô hiệu hoá | Focus | Lý do hiện ở đâu |
|--------------|------------------|-------|------------------|
| **Hành động**: nút, nút icon, mục menu, tab, mục điều hướng, nút phân trang | `aria-disabled="true"`; component tự chặn kích hoạt (click, Enter, Space) | **Vẫn focus được**: Tab hoặc phím mũi tên vẫn tới (trong tablist, menu: mũi tên không bỏ qua) | Tooltip một câu nêu điều kiện để bật, hiện cả khi focus bằng bàn phím |
| **Trường nhập**: input, select, textarea, checkbox, radio | `disabled` native, **chỉ khi lý do hiển nhiên** (ô "Ngày kết thúc" ngay dưới ô tích "Không thời hạn") | Không focus | Ngay cạnh trên màn hình, hoặc trong hướng dẫn của trường |
| | Lý do không hiển nhiên, hoặc người dùng cần đọc / sao chép giá trị → **`readonly`** (control không native dùng `aria-readonly`) | Focus được, sao chép được | Hướng dẫn của trường (`hint`), nối qua `aria-describedby` |
| | Lý do không rõ hoặc nằm ở màn khác → **để bật**, kiểm khi lưu | — | Lỗi tại trường khi lưu |

::example{tooltip-disabled}

Luật đi kèm:

- **Lý do là một câu nói điều kiện để bật, hoặc ràng buộc đang chặn**: "Chọn ít nhất một đơn để duyệt", "Không xoá được: đang được dùng ở 12 hồ sơ." Không viết "Không khả dụng" hay "Bạn không thể thực hiện".
- Hành động vô hiệu hoá **không đổi màu khi hover** và không có trạng thái đang nhấn.
- Nút icon vô hiệu hoá vẫn giữ tên truy cập là tên hành động; lý do là phần mô tả thêm.
- Trên cảm ứng không có hover. Lý do quan trọng cho nghiệp vụ (vì sao không gửi duyệt được) phải có thêm ở dạng chữ trên màn hình, không chỉ trong tooltip.

## Trạng thái giá trị

Áp cho trường nhập (`nxt-form-field` và các control nhập liệu). Mỗi trường chỉ có **một** trạng thái giá trị tại một thời điểm. Thông điệp luôn có icon và chữ, không chỉ đổi màu viền.

| Trạng thái | Khi nào | Token (viền · chữ · icon) | Ví dụ HRM | Chặn lưu |
|------------|---------|---------------------------|-----------|----------|
| Không | Trước khi kiểm tra, **và sau khi kiểm tra đạt** | `border.input` · `text.default` · — | "Họ và tên" vừa nhập đúng: không tô gì | Không |
| Lỗi | Giá trị sai hoặc thiếu; phải sửa mới lưu được | `border.danger` · `text.danger` · `icon.danger` | "Ngày kết thúc phải sau ngày bắt đầu (01/11/2026)." | **Có** |
| Cảnh báo | Hợp lệ nhưng bất thường, có thể gây sai về sau; người dùng tự quyết | `border.warning` · `text.warning` · `icon.warning` | "Ngày 02/09/2026 là ngày lễ, ngày này không tính phép." | Không |
| Thông tin | Giá trị do hệ thống đề xuất hoặc tự điền, hoặc một lưu ý không phải lỗi | `border.info` · `text.info` · `icon.info` | "Lấy theo hợp đồng HĐ-2026-0142. Sửa nếu đã có phụ lục." | Không |
| Thành công | Hệ thống **vừa** xác nhận một giá trị mà người dùng cần biết đã được xác nhận | `border.success` · `text.success` · `icon.success` | "Đã đối chiếu mã số thuế với cơ quan thuế." | Không |
| Chỉ đọc | Trường không sửa được trong form đang sửa; **không mang trạng thái giá trị nào** | viền `border.default`, không nền nhập (`control-border-readonly`, `control-bg-readonly` của form field) | "Mã chức danh" khi sửa một chức danh đã có | Không |

**Hợp lệ thì không tô xanh.** Trường nhập đúng trở về trạng thái "không". Tô xanh mọi trường hợp lệ làm form rối mắt và làm mất tác dụng của màu thành công ở chỗ thật sự cần. "Thành công" chỉ dùng khi hệ thống đối chiếu với nguồn bên ngoài (mã số thuế, số tài khoản, trùng mã) và người dùng cần biết kết quả.

Thêm vài luật:

- Lỗi chặn lưu và được đếm trong tóm tắt lỗi đầu form; cảnh báo, thông tin, thành công **không** chặn và không vào tóm tắt lỗi.
- Chỉ lỗi đặt `aria-invalid="true"`. Ba trạng thái còn lại có chữ ẩn đứng trước thông điệp ("Cảnh báo:", "Thông tin:", "Thành công:") để screen reader phân biệt với hướng dẫn.
- Kiểm tra khi bấm hành động kết thúc; sau lần đầu, kiểm lại mỗi khi sửa để lỗi biến mất ngay. Xem [Form field](/components/form-field).
- Cách viết thông điệp: [Cách viết › Thông báo & xác nhận](/foundations/writing#thong-bao-xac-nhan).

Màu trạng thái giữ nguyên nghĩa ở mọi sản phẩm; nhãn phân loại không có nghĩa trạng thái dùng [màu chỉ thị](/foundations/color#mau-chi-thi).

## Trong SPEC component

Ma trận trạng thái (§5) của mỗi SPEC phải trả lời được: component có những trục nào; tổ hợp nào phải thử (đã chọn + hover, đã chọn + focus, chỉ đọc + đã chọn, lỗi + focus); vô hiệu hoá theo hàng nào của bảng chính sách ở trên.

## Nên và không nên

| Nên | Không nên |
|-----|-----------|
| Ẩn nút "Duyệt" với người không có quyền duyệt | Hiện nút "Duyệt" mờ mà không ai bật được |
| "Duyệt đơn đã chọn" vô hiệu hoá, tooltip "Chọn ít nhất một đơn để duyệt" | Nút mờ không lời giải thích |
| Để nút "Lưu" luôn bật, bấm thì báo "Nhập họ và tên." và focus về trường đó | Vô hiệu hoá "Lưu" cho tới khi form hợp lệ |
| "Mã chức danh" chỉ đọc khi sửa, hướng dẫn "Mã không đổi được sau khi tạo." | Trường `disabled` mờ nhạt, không sao chép được mã |
| Cảnh báo "Lương thấp hơn mức tham chiếu của chức danh." và vẫn cho lưu | Dùng lỗi đỏ chặn lưu cho một điều bất thường |
| Trường hợp lệ giữ viền thường | Tô xanh mọi trường đã nhập đúng |

Tham khảo: SAP Fiori for Web 1.154, các trang Interaction states, Value states, UI element states. NXT giữ một khác biệt có chủ đích: hành động vô hiệu hoá vẫn nhận focus để đọc được lý do.

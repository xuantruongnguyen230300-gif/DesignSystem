---
title: Form nhập liệu
description: Cách dựng form tạo / sửa hồ sơ — số cột theo bề rộng form (1 cột trong drawer, tối đa 3 cột), nhóm có tiêu đề, nhãn luôn ở trên, xem bằng Descriptions và sửa bằng Form field, chọn đúng control chọn lựa, trạng thái giá trị và kiểm tra khi lưu.
status: beta
order: 3
keywords:
  - form
  - bieu mau
  - nhap lieu
  - ho so nhan vien
  - so cot
  - nhom truong
  - xem sua
  - chon control
  - trang thai gia tri
  - kiem tra
  - validation
---

# Form nhập liệu

Chuyên viên nhân sự tạo và cập nhật hồ sơ nhân viên, hợp đồng, quyết định nhiều lần mỗi ngày; mỗi form có 10–40 trường. Form tốt giúp họ nhập nhanh theo đúng thứ tự giấy tờ, thấy ngay trường nào sai và sửa thế nào, và không nhầm giữa trang **xem** với trang **sửa**. Mọi sản phẩm dùng NXT dựng form theo cùng các luật dưới đây.

::example{form-employee}

## Bố cục

| # | Vùng | Nội dung | Ghi chú |
|---|------|----------|---------|
| 1 | Tiêu đề | Tên đối tượng (trang, card, drawer, dialog) | Form chỉ có một nhóm thì tiêu đề này là đủ, không thêm tiêu đề nhóm |
| 2 | Ghi chú bắt buộc | "Các trường có dấu * là bắt buộc." | Đầu form. Nếu đa số trường bắt buộc thì đánh dấu "(không bắt buộc)" cho phần còn lại |
| 3 | Nhóm trường | `section` + tiêu đề `heading-sm` khi form có **từ 2 nhóm** | Không làm nhóm thu gọn / mở rộng: trường bị giấu là trường bị bỏ sót |
| 4 | Lưới trường | `nxt-grid` + `nxtSpan`, số cột theo bề rộng **form** | Xem [Số cột](#so-cot) |
| 5 | Hành động | **Lưu** (primary) và **Huỷ**, cuối form | Trong drawer / dialog nằm ở chân cố định; theo [Vị trí hành động](/patterns/action-placement) |
| 6 | Kết quả | Số trường cần sửa / "Đã lưu …" trong `role="status"` | Kèm focus về trường lỗi đầu tiên |

## Số cột

Số cột tính theo **bề rộng của chính form** (container query của `nxt-grid`), không theo màn hình: cùng một form tự về 1 cột khi đặt trong drawer, 2–3 cột khi đặt trên trang rộng.

| Bề rộng form | Số cột | Thường gặp ở | `nxtSpan` của mỗi trường |
|--------------|--------|--------------|--------------------------|
| < 640px | 1 | Drawer, dialog, panel chi tiết | `base: 12` |
| 640–1023px | 2 | Trang có menu trái, nửa màn hình | `sm: 6` |
| ≥ 1024px | tối đa 3 | Trang rộng, form nhiều trường | `lg: 4` |

```html
<nxt-grid gap="md">
  <nxt-form-field label="Họ và tên" required [nxtSpan]="{ base: 12, sm: 6, lg: 4 }">…</nxt-form-field>
  <nxt-form-field label="Ghi chú" nxtSpan="full">…</nxt-form-field>
</nxt-grid>
```

- Drawer (`size.drawer.*` ≤ 720px) và dialog luôn rơi vào 1 cột: không cần cấu hình riêng.
- Không quá **3 cột**: mắt phải nhảy quá xa, thứ tự đọc không còn rõ.
- Trường dài (địa chỉ, ghi chú, lý do) chiếm cả hàng: `nxtSpan="full"`. Trường ngắn (mã, ngày) **không** co hẹp theo nội dung: cùng một lưới, cùng một bề rộng.
- Nhóm chỉ 2–3 trường mà trang rất rộng, khiến hàng thứ ba trống: dừng ở 2 cột (`{ base: 12, sm: 6 }`) thay vì để khoảng trắng lớn.
- Không đặt bề rộng cố định cho control; bề rộng đến từ lưới.

## Nhóm, thứ tự và nhãn

- **Thứ tự theo nghiệp vụ**, giống giấy tờ người dùng đang cầm: định danh → liên hệ → công việc → lương. Tên trước địa chỉ, "Từ ngày" trước "Đến ngày". Bớt trường tới mức tối thiểu.
- **Nhãn luôn ở trên** control, sentence case, không dấu hai chấm, không gõ tay `*` (dùng `required`). Placeholder chỉ là ví dụ định dạng, không thay nhãn.
- **Trường ghép dùng một nhãn chung**: khoảng ngày nghỉ là một [Date range picker](/components/date-picker) "Thời gian nghỉ", không phải hai trường rời không có quan hệ.
- **Nhóm chọn lựa** (radio, checkbox) dùng nhãn nhóm (`legend`) như nhãn trường, đặt cùng lưới với các field.

## Xem và sửa

Trang **xem** và form **sửa** trông khác nhau, để người dùng không bao giờ tưởng một trang xem là sửa được (hoặc ngược lại).

| | Xem: [Descriptions](/components/descriptions) | Sửa: [Form field](/components/form-field) |
|---|---|---|
| Dấu `*` | Không | Có, kèm ghi chú đầu form |
| Giá trị trống | "—" hoặc chữ có nghĩa ("Chưa thoả thuận") | Ô trống, placeholder nếu cần ví dụ |
| Số tiền, số lượng | Căn đầu như chữ, kèm đơn vị: `18.500.000 ₫` | Căn cuối, `tabular-nums` (`nxtInput numeric`), đơn vị ở `nxtSuffix` |
| Ngày | `dd/MM/yyyy`, `tabular-nums` | [Date picker](/components/date-picker) |
| Trường không sửa được | Như mọi trường | `readonly` (form hỗn hợp: mã nhân viên khi sửa), ghi lý do trong `hint` |
| Lựa chọn | Chữ của phương án đã chọn ("Kết hợp") | Radio group / checkbox / select |

Trường **không bao giờ** sửa được thì hiển thị dạng chữ, không dùng control chỉ đọc. Không có quyền sửa thì ẩn nút "Sửa", không mở form toàn trường chỉ đọc.

## Chọn control chọn lựa

| Cần | Số phương án | Hiệu lực | Dùng |
|-----|--------------|----------|------|
| Có / không, cần bấm Lưu | 1 | Khi lưu | [Checkbox](/components/checkbox) |
| Bật / tắt một thiết lập | 1 | **Ngay** | [Switch](/components/switch) |
| Chọn nhiều | ≤ ~8 | Khi lưu | [Checkbox group](/components/checkbox#nhom-lua-chon) |
| Chọn một, cần thấy hết để so sánh | 3–8 | Khi lưu | [Radio group](/components/radio-group), xếp dọc |
| Đổi chế độ xem, lọc nhanh, nhãn 1–2 từ | 2–5 | **Ngay** | [Segmented](/components/segmented) |
| Chọn một, có giá trị mặc định hợp lý | ≤ ~15 | Khi lưu | `select[nxtInput]` trong [Form field](/components/form-field) |
| Chọn một / nhiều, cần gõ để tìm (không dấu) | ~15–200 | Khi lưu | [Combobox](/components/combobox) |
| Danh sách lớn, nhận ra bằng nhiều thuộc tính (nhân viên: tên, mã, phòng ban) | > 200 | Khi lưu | [Value help](/components/value-help) |
| Ngày, khoảng ngày | — | Khi lưu | [Date picker](/components/date-picker) |

- Chỉ hai phương án loại trừ có/không: một checkbox (hoặc switch nếu áp dụng ngay), không dùng hai radio.
- Radio: chọn sẵn phương án an toàn nhất; không chọn sẵn khi việc đó gây giả định sai (giới tính) — khi đó bắt buộc và báo lỗi lúc lưu. Được bỏ trống thì thêm "Không áp dụng".
- Select: mục đầu là lời nhắc có nghĩa ("Chọn phòng ban"), không để mục trống; hơn 8 mục thì sắp theo bảng chữ cái tiếng Việt.

## Trạng thái giá trị

Mỗi trường chỉ hiện **một** trạng thái tại một thời điểm (lỗi > cảnh báo > thông tin > thành công). Thông điệp luôn có icon và chữ.

| Trạng thái | Khi nào | Chặn lưu | Token viền | Ví dụ |
|------------|---------|----------|------------|-------|
| Lỗi (`error`) | Thiếu hoặc sai, phải sửa | **Có** | `form-field.control-border-invalid` → `border.danger` | "Số CCCD gồm 12 chữ số, bạn đã nhập 11." |
| Cảnh báo (`warning`) | Hợp lệ nhưng bất thường, có thể gây lỗi sau | Không | `form-field.control-border-warning` → `border.warning` | "Thấp hơn lương tối thiểu vùng I." |
| Thông tin (`info`) | Giá trị do hệ thống đề xuất / tự điền | Không | `form-field.control-border-info` → `border.info` | "Lấy theo hợp đồng HĐ-2026-0142." |
| Thành công (`success`) | Hệ thống **vừa** xác nhận giá trị | Không | `form-field.control-border-success` → `border.success` | "Đã đối chiếu với cơ quan thuế." |
| (không) | Trước khi kiểm tra, và sau khi kiểm tra đạt | — | `form-field.control-border` → `border.input` | |

Nhóm radio / checkbox chỉ có trạng thái lỗi (`error` của nhóm), đặt **dưới** nhóm.

## Kiểm tra và lưu

1. Kiểm tra khi bấm **Lưu**, không kiểm tra khi người dùng đang gõ dở. Sau lần lưu đầu, kiểm tra lại mỗi khi người dùng sửa, để lỗi biến mất ngay khi giá trị đúng.
2. Lỗi hiện tại từng trường; số trường cần sửa đọc qua `role="status"` ("Chưa lưu: còn 2 trường cần sửa."). Form dài có thêm tóm tắt lỗi đầu form.
3. **Focus về trường lỗi đầu tiên** (`[aria-invalid="true"]`) sau lần render kế tiếp (`afterNextRender`). Nhóm radio lỗi: focus nút đầu tiên của nhóm.
4. Cảnh báo **không** chặn lưu và không tính vào số trường cần sửa.
5. Không tô xanh mọi trường đã hợp lệ.
6. Lưu xong: thông báo ngắn "Đã lưu hồ sơ …" và trở về trang xem. Lưu lỗi từ máy chủ: [Alert](/components/alert) đầu form, giữ nguyên dữ liệu đã nhập.
7. Có thay đổi chưa lưu mà người dùng rời trang / đóng drawer: hỏi lại bằng [Dialog](/components/dialog) xác nhận.

Đặt `novalidate` trên `<form>` để tắt bong bóng lỗi của trình duyệt.

## Trạng thái của form

| Trạng thái | Hiển thị |
|------------|----------|
| Đang tải hồ sơ | Khung xương (skeleton) theo đúng lưới trường, không hiện form trống |
| Lỗi tải | Thông báo nguyên nhân + "Thử lại"; không mở form sửa |
| Không có quyền sửa | Chỉ trang xem, không có nút "Sửa" |
| Đang lưu | Nút **Lưu** ở trạng thái `loading`, giữ nguyên kích thước; không khoá các trường |
| Form hỗn hợp | Trường không sửa được ở bước này dùng `readonly` + lý do trong `hint` |

## Bàn phím

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Đi theo thứ tự trường (thứ tự DOM = thứ tự đọc của lưới, theo hàng); trường chỉ đọc vẫn dừng, trường bị khoá bị bỏ qua |
| <kbd>Enter</kbd> trong ô một dòng | Gửi form (Lưu) |
| Mũi tên trong nhóm radio | Đổi phương án (nhóm là một điểm dừng Tab) |
| <kbd>Esc</kbd> trong drawer / dialog | Đóng; có thay đổi chưa lưu thì hỏi lại |
| <kbd>Ctrl</kbd>+<kbd>S</kbd> | Khuyến nghị cho form dài trên trang: Lưu (chặn hộp lưu trang của trình duyệt) |

## Responsive

- Lưới tự đổi số cột theo bề rộng form (container query), nên form dùng lại được trong trang, drawer và dialog.
- Thứ tự DOM của trường là thứ tự đọc theo hàng (chữ Z): khi lưới về 1 cột, thứ tự vẫn đúng.
- Nhãn dài tiếng Việt tự xuống dòng, không cắt; không dùng nhãn cạnh trường.

## Component dùng

- [Form field](/components/form-field): nhãn, `*`, gợi ý, trạng thái giá trị, chỉ đọc, bộ đếm, `nxtInput numeric`.
- [Date picker](/components/date-picker), [Combobox](/components/combobox), [Value help](/components/value-help): đặt trong Form field.
- [Radio group](/components/radio-group), [Checkbox](/components/checkbox), [Switch](/components/switch), [Segmented](/components/segmented).
- [Grid](/components/grid) (`nxt-grid`, `nxtSpan`), [Descriptions](/components/descriptions), [Button](/components/button), [Card](/components/card), [Drawer](/components/drawer), [Dialog](/components/dialog).
- Mẫu màn hình: form thêm / sửa trong drawer của [Danh mục](/templates/catalog).

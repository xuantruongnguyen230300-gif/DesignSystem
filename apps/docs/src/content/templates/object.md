---
title: Hồ sơ nhân viên
description: Trang chi tiết một nhân viên — khối tóm tắt co lại khi cuộn, thanh neo, xem và sửa trên cùng bố cục, thanh chân dính với Huỷ / Lưu, nhân bản thành hồ sơ mới, đang tải bằng skeleton.
status: beta
order: 4.5
keywords:
  - ho so nhan vien
  - trang chi tiet
  - chi tiet doi tuong
  - object page
  - sua ho so
  - che do sua
  - ban nhap
  - nhan ban
  - thanh neo
  - skeleton
  - dang tai
---

# Hồ sơ nhân viên

Chuyên viên nhân sự mở hồ sơ một nhân viên để **tra một thông tin, cập nhật vài trường** (số điện thoại, địa chỉ, quản lý trực tiếp) hoặc làm một việc trên cả hồ sơ (nhân bản cho người mới cùng vị trí, ngừng làm việc). Mẫu này theo pattern [Trang chi tiết đối tượng](/patterns/object-page), dựng bằng [Object page](/components/object-page).

::example{template-object}

## Thử nhanh

- Cuộn xuống: khối tóm tắt (avatar, chức danh, mã, thâm niên) cuộn đi, thanh neo dính lại và hiện dòng "NV-00123 · Trưởng nhóm Kế toán tổng hợp…"; neo đổi theo phần đang đọc. Bấm **Hợp đồng** trên thanh neo: trang cuộn tới đó, focus lên tiêu đề "Hợp đồng".
- Bấm nút ghim ở cuối thanh neo: khối tóm tắt đứng yên khi cuộn. Bấm ⌃ để thu gọn hẳn.
- Bấm **Sửa**: các phần chuyển thành form tại chỗ, bố cục giữ nguyên; thanh chân "Chưa có thay đổi · Huỷ · Lưu" dính đáy. Sửa số điện thoại: chỉ báo đổi thành "Bản nháp · đã lưu lúc 14:32".
- Xoá trống số điện thoại rồi bấm **Lưu**: focus nhảy vào ô điện thoại, lỗi nằm dưới ô, thanh chân ghi "1 trường cần sửa".
- Đang sửa mà bấm **Danh sách nhân viên** trên breadcrumb: hộp thoại "Rời trang khi chưa lưu?" (Lưu thay đổi / Bỏ thay đổi / Ở lại). Bấm **Huỷ**: hỏi "Bỏ mọi thay đổi?" trước khi bỏ.
- Menu ⋯ → **Nhân bản**: hồ sơ mới mang tiêu đề "Nhân viên mới", giữ chức danh, phòng ban; các trường cá nhân để trống, focus ở Họ và tên. Gõ tên: tiêu đề đổi theo.
- Menu ⋯ → **Tải lại hồ sơ**: nội dung cũ giữ nguyên trong 1 giây đầu, sau đó khối tóm tắt và các phần chuyển sang skeleton cho tới khi tải xong.

## Cấu trúc

| Vùng | Nội dung |
|------|----------|
| Topbar (hàng tiêu đề) | Breadcrumb Nhân sự › Danh sách nhân viên › tên; tiêu đề là tên nhân viên; tag trạng thái ("Đang làm việc"); ⋯ (Nhân bản, Tải lại hồ sơ, Ngừng làm việc…) và **Sửa** (primary, ở cuối). Khi đang sửa: không có nút nào (hành động kết thúc ở thanh chân) |
| Thông báo | Một vùng `role="status"` ngay dưới topbar: "Đã lưu thay đổi hồ sơ …" kèm Hoàn tác |
| Khối tóm tắt | Avatar, chức danh, phòng ban · nơi làm việc; Mã nhân viên, Ngày vào làm, Thâm niên, Quản lý trực tiếp, Loại nhân viên. Không sửa trong khối này |
| Thanh neo | Thông tin chung · Công việc · Hợp đồng · Lịch sử; nút thu gọn, nút ghim |
| Thông tin chung | Khối con "Thông tin cá nhân" (họ tên, ngày sinh, giới tính, CCCD, hôn nhân) và "Liên hệ" (điện thoại, email, địa chỉ) — `dl nxtDescriptions` khi xem, `nxt-form-field` khi sửa |
| Công việc | Chức danh, cấp bậc, phòng ban, nơi làm việc, quản lý, loại nhân viên, ngày vào làm (chỉ đọc khi sửa, kèm lý do) |
| Hợp đồng | Bảng nhỏ (3 hợp đồng): số, loại, từ – đến, lương cơ bản, trạng thái. Không sửa trong hồ sơ: ghi chú chỉ sang phân hệ Hợp đồng lao động |
| Lịch sử | `nxt-timeline`: bổ nhiệm, chứng chỉ, ký hợp đồng, điều chuyển, vào làm |
| Thanh chân (khi sửa / tạo) | Trái: "Chưa có thay đổi" / "Bản nháp · đã lưu lúc 14:32" / "2 trường cần sửa". Phải: **Huỷ**, **Lưu** (hoặc **Tạo hồ sơ**) |

## Quyết định UX

- **Topbar là hàng tiêu đề, không lặp lại trong trang.** Tên, trạng thái và Sửa luôn thấy dù cuộn tới đâu; khối tóm tắt chỉ đặt ngữ cảnh và được phép cuộn đi.
- **Thanh neo, không phải tab**, vì người dùng thường đọc hồ sơ liền mạch và các phần ngắn; bảng hợp đồng chỉ vài dòng. Hồ sơ có bảng dài (quá trình đào tạo, bảng công) thì chuyển sang `navigation="tabs"`.
- **Sửa toàn bộ, cùng bố cục.** Bấm Sửa không mở trang khác hay drawer: các phần đổi thành form tại chỗ, người dùng không mất định hướng. Trường không sửa được ở đây (ngày vào làm, email công ty, hợp đồng) vẫn hiện, chỉ đọc, kèm lý do.
- **Hành động kết thúc ở thanh chân dính đáy**, không ở topbar: Huỷ / Lưu luôn thấy, kể cả ở màn hẹp nơi page header về lại trong trang.
- **Focus ban đầu khi sửa**: trường bắt buộc còn trống đầu tiên, không có thì trường sửa được đầu tiên. Lưu xong focus về tiêu đề trang; Huỷ xong focus về nút Sửa.
- **Lỗi kiểm khi bấm Lưu**, không chặn người dùng giữa chừng; focus vào trường lỗi đầu tiên, thanh chân đếm số trường cần sửa.
- **Không làm mất dữ liệu**: Huỷ khi có thay đổi phải hỏi; rời trang khi có thay đổi mở hộp thoại ba lựa chọn (giống trình sửa [Quy trình duyệt](/templates/workflow)); đóng tab hoặc tải lại trang thì trình duyệt tự hỏi (`beforeunload`).
- **Nhân bản không tạo bản ghi rác**: chỉ khi bấm "Tạo hồ sơ" mới có hồ sơ mới; tiêu đề tạm "Nhân viên mới" cho tới khi có tên.
- **Ngừng làm việc hỏi trước** (hộp xác nhận, nêu tên người và hệ quả: khoá tài khoản, tính công đến hết ngày) vì ảnh hưởng ra ngoài trang; lưu thay đổi thường thì có Hoàn tác thay cho hỏi.
- **Đang tải**: dữ liệu cũ giữ nguyên trong khoảng 1 giây đầu; quá 1 giây mới thay bằng skeleton đúng hình (avatar, các cặp nhãn–giá trị), giữ tối thiểu 0,5 giây; tiêu đề và thanh neo vẫn dùng được. Câu "Đang tải lại hồ sơ…" / "Đã tải xong hồ sơ." đọc qua `role="status"`.

## Components dùng

`nxt-page-header` (`placement="topbar"`, `nxtPageMeta`, `nxtPageActions`) · `nxt-object-page` + `nxt-object-page-section` + `nxt-object-page-subsection` + `[nxtObjectPageHeader]` / `[nxtObjectPageSummary]` / `[nxtObjectPageFooter]` · `nxt-skeleton` + `nxtDeferredLoading` · `dl[nxtDescriptions]` · `nxt-form-field` + `nxtInput` · `table[nxtTable]` + `nxt-table-scroll` · `nxt-timeline` · `nxt-avatar` · `nxt-tag` · `nxtMenuTriggerFor` · `nxt-alert` + `nxtLiveRegion` · `NxtDialog.confirm()` · `nxtIconButton` + `nxtTooltip`

## Accessibility

| Phím | Hành vi |
|------|---------|
| <kbd>Tab</kbd> | Topbar (breadcrumb, ⋯, Sửa) → thanh neo (mỗi neo một điểm dừng) → nút thu gọn, ghim → nội dung các phần → thanh chân (khi sửa) |
| <kbd>Enter</kbd> trên neo | Cuộn tới phần đó, focus lên tiêu đề phần |
| <kbd>←</kbd> / <kbd>→</kbd> trên neo | Chuyển giữa các neo |
| <kbd>Esc</kbd> trong hộp thoại Huỷ / rời trang | Ở lại, tiếp tục sửa |

- Trang có một `h1` (tên nhân viên trên topbar); mỗi phần là vùng có tên với tiêu đề `h2`; khối con `h3`.
- Trường đang focus không bị thanh neo dính hay thanh chân che: trang tự cuộn vừa đủ.
- Trạng thái và lỗi luôn có chữ ("Đang làm việc", "1 trường cần sửa"), không chỉ màu.
- Bảng hợp đồng có tiêu đề hàng (số hợp đồng) và vùng cuộn ngang có tên, dùng được bằng bàn phím.

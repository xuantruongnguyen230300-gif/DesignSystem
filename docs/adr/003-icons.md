# ADR-003: Bộ icon

- **Trạng thái:** Đã áp dụng, chờ xác nhận
- **Ngày:** 2026-10-19 (đề xuất ban đầu 2026-10-16: Lucide)

## Bối cảnh
Docs từng dùng vài icon stroke tự vẽ. Menu thu gọn, nút chỉ có icon, trạng thái và mẫu màn hình cần một bộ icon nhất quán, theme được bằng `currentColor`, an toàn với CSP và gõ sai tên thì báo lỗi lúc build.

## Phương án
| Phương án | Ưu | Nhược |
|-----------|----|-------|
| Lucide (ISC) | Nét đều, phổ biến | Ít khái niệm nghiệp vụ/HR hơn (thẻ nhân viên, báo cáo, con dấu…) |
| **Tabler Icons (MIT)** | Hơn 5.000 icon outline cùng lưới 24px, nhiều khái niệm doanh nghiệp, có biến thể filled | Bộ lớn, phải chọn lọc |
| Bộ icon riêng NXT | Nhận diện riêng | Tốn công vẽ và duy trì, chưa cần ở giai đoạn này |

## Quyết định
**Tabler Icons outline**, bọc trong entry `@nxt/ui/icon`:
- Chỉ đưa vào **danh sách chọn lọc** ở `packages/ui/icon/icons.json` (259 icon, nhóm theo chủ đề). `npm run icons:build` (`tools/icons/build.mjs`) đọc `@tabler/icons` và sinh `icons.generated.ts`.
- Icon lưu dưới dạng path data và render qua template (`<path [attr.d]>`), không dùng `innerHTML`, nên an toàn với CSP.
- `NxtIconName` là union các tên trong danh sách: gõ sai tên thì lỗi biên dịch.
- Kích thước `sm`/`md`/`lg` theo `semantic.size.icon.*`, hoặc kế thừa `--nxt-icon-size` từ component cha (button, menu, sidenav). Độ dày nét `size.icon.stroke` (1,75). Màu `currentColor`.
- Icon mặc định là trang trí (`aria-hidden`). Icon mang nghĩa một mình thì truyền `label` (role `img`). Nút chỉ có icon dùng `nxtIconButton` + `aria-label`.

## Hệ quả
- Thêm icon: thêm tên vào `icons.json` rồi chạy `npm run icons:build`. Tên không có trong Tabler thì script dừng và báo lỗi.
- Cả danh sách nằm trong một module (khoảng 40 KB mã nguồn) và được nạp cùng component đầu tiên dùng icon. Đây là đánh đổi để có kiểu tên chặt và cách dùng đơn giản (`<nxt-icon name="…">`). Nếu bundle trở thành vấn đề, chuyển sang đăng ký icon theo từng file (tree-shake được) mà không đổi API của `nxt-icon`.
- Giấy phép MIT của Tabler cần ghi trong NOTICE khi phát hành `@nxt/ui` (xem `nxt-release`).

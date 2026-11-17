# ADR-012: Ngôn ngữ giao diện kiểu iOS ("kiểu C")

- **Trạng thái:** Thay thế một phần bởi [ADR-013](013-heroui-flat-look.md) (bo góc, bóng, mật độ, chữ).
- **Ngày:** 2026-11-16

## Bối cảnh
NXT ban đầu là giao diện nghiệp vụ gọn và phẳng: bo 6–8px, viền 1px, gần như không bóng. Chủ sản phẩm muốn giao diện giống iOS (bo tròn, bóng mềm, đơn giản), dễ nhìn hơn, và muốn dùng NXT cho nhiều loại web chứ không chỉ phần mềm nhân sự. Hình mẫu đã duyệt: `docs/superpowers/specs/assets/2026-11-16-style-c-demo.html`. Thiết kế đầy đủ: `docs/superpowers/specs/2026-11-16-ios-refactor-design.md`.

## Phương án
| Phương án | Mô tả |
|-----------|-------|
| A | Giữ giao diện hiện tại |
| B | iOS mềm: bo 12–18px, bóng mờ, mật độ vừa |
| **C** | iOS đậm bo: nút viên thuốc, bo tới 28–32px, bóng rộng, control cao hơn |

## Quyết định
Chọn **C**, thể hiện hoàn toàn qua token:
- Bo góc: `semantic.radius.control` 14px (input, select, ô tìm); `container` 28px (card, panel, bảng); `overlay` 32px (dialog, popover, menu); button, tag, segmented, switch, ô tìm dùng `pill`.
- Bóng: `primitive.shadow.2` (hai lớp, mềm) cho card, menu, popover; `shadow.3` cho dialog, drawer; có bản tối riêng (`dark-2`, `dark-3`); `semantic.elevation.card` mới.
- Chiều cao control md theo mật độ: gọn 28, vừa (mặc định) 40, rộng 46px. Hàng bảng: gọn 32 (giữ như cũ cho dữ liệu dày), vừa 48, rộng 56px; đường kẻ giữa hàng dùng `border.subtle`.
- Không viền ở card và button. **Ngoại lệ có chủ đích (chủ repo chọn, 2026-11-16):** viền ô nhập, checkbox và track switch tắt chuyển sang màu mềm (`border.input` = neutral.300 ở chế độ sáng, ≈1,6:1 với nền; neutral.700 ở chế độ tối), vì viền ≥ 3:1 trông nặng, không giống iOS. Hệ quả: ranh giới control không còn đạt WCAG 1.4.11. Bù lại: nhãn luôn hiển thị, vòng focus vẫn ≥ 3:1, lỗi/cảnh báo có màu viền và nền riêng, hover đổi sang viền đậm. Các cặp tương phản của `border.input` trong `tokens.config.json` hạ từ 3 xuống 1,3 (chỉ đảm bảo còn nhìn thấy). Muốn quay lại chuẩn chặt, đổi `border.input` về neutral.500 và đặt lại `min: 3`.
- Giữ Plus Jakarta Sans (ADR-010) và thang chữ hiện tại.
- Nút primary dùng bóng trung tính, không dùng bóng tông màu accent: màu accent là brand slot, một bóng literal sẽ không đi theo brand của sản phẩm.

Luật anti-pattern trong `docs/design/principles.md` được viết lại cho chính xác: **cho phép** bo lớn và các bóng đã định nghĩa trong token; **vẫn cấm** kính mờ (`backdrop-filter`), gradient trang trí, glow và hoạt ảnh trên `box-shadow`.

## Hệ quả
- Mọi component đổi diện mạo qua token component; API, hành vi và keyboard map không đổi.
- Các quyết định về grid, toolbar và nút trên toolbar (`apps/docs/src/content/patterns/list-page.md`) giữ nguyên; card bo lớn vẫn nằm trong chuỗi lấp đầy màn hình.
- Control cao hơn ở mật độ mặc định: ứng dụng cần dữ liệu dày hơn đặt `data-nxt-density="compact"`.
- Token component được tách theo từng component để app chỉ tải thứ nó dùng (xem `tools/tokens/build.mjs`, `docs/PLAN.md`).

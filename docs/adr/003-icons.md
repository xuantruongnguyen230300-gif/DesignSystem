# ADR-003: Bộ icon

- **Trạng thái:** Đề xuất
- **Ngày:** 2026-10-16

## Bối cảnh
Hiện docs dùng vài icon stroke tự vẽ (`apps/docs/src/app/shell/icons.ts`). Component cần một bộ icon nhất quán, tree-shake được, theme được bằng `currentColor`.

## Đề xuất
**Lucide** (giấy phép ISC, hơn 1.500 icon, nét stroke đều, phù hợp giao diện nghiệp vụ), bọc thành `@nxt/icons`:
- Mỗi icon là một hằng số SVG path, kèm component `nxt-icon [name]`, có tree-shaking.
- Kích thước lấy từ `semantic.size.icon.*`, màu dùng `currentColor`.
- Icon trang trí luôn `aria-hidden`; icon mang nghĩa phải có nhãn ở control bao quanh.

## Cần chốt
Giữ nguyên Lucide hay dùng bộ icon riêng của thương hiệu NXT.

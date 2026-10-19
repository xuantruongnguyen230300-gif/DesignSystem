# ADR-007: Vai trò của Figma

- **Trạng thái:** Đề xuất
- **Ngày:** 2026-10-16

## Bối cảnh
Team design có thể làm việc trên Figma. Nếu hai nguồn token (Figma Variables và DTCG JSON) cùng được sửa, chúng sẽ lệch nhau.

## Đề xuất
- **Token DTCG trong repo là nguồn sự thật duy nhất.** Mọi thay đổi đi qua PR + validator (tier, mode, brand, tương phản).
- Figma nhận token **một chiều** từ repo: sinh Figma Variables từ `@nxt/tokens/json`. Có thể làm sau bằng skill `nxt-figma-sync` qua Figma MCP (`get_variable_defs`).
- Thư viện component trên Figma tham chiếu SPEC.md của từng component.

## Cần chốt
Team có dùng Figma không, và dùng gói nào (Dev Mode/MCP cần gói trả phí).

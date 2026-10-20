# ADR-008: Engine build token tự viết thay Style Dictionary

- **Trạng thái:** Đã áp dụng, chờ xác nhận
- **Ngày:** 2026-10-16

## Bối cảnh
Kế hoạch ban đầu dùng Style Dictionary. Khi dựng, gặp ba vấn đề:
1. **Mode lồng nhau.** Một alias như `--nxt-button-bg: var(--nxt-color-bg-primary)` được tính tại phần tử khai báo nó. Nếu chỉ khai báo ở `:root`, một vùng `[data-nxt-color="dark"]` lồng bên trong sẽ đổi được semantic nhưng component token vẫn giữ giá trị cũ. Muốn mode và brand hoạt động tới từng phần tử, mỗi khối mode/brand phải **khai báo lại bao đóng phụ thuộc** của những gì nó thay đổi, kèm tính toán specificity riêng cho tổ hợp brand × mode.
2. **Định dạng DTCG 2025.10.** Màu dạng object `{ colorSpace: "oklch", components, hex }` và dimension dạng `{ value, unit }` cần transform riêng.
3. **Validator đã có sẵn bộ resolve token** (`tools/lib/tokens.mjs`). Viết build trên chính bộ đó thì luật kiểm và luật sinh không thể lệch nhau.

## Quyết định
`tools/tokens/build.mjs` (khoảng 300 dòng, không dependency) sinh ra:
- `css/nxt.css` gồm `:root` và các khối mode, mỗi khối khai báo lại các phụ thuộc;
- `css/brands/<b>.css` và `css/brands/all.css`;
- `scss/_breakpoints.scss`;
- `js/index.js` + `.d.ts`;
- `json/tokens.json` cho docs.

Validator có thêm luật *mode axes must stay independent* để bảo đảm CSS sinh ra đúng ở mọi tổ hợp lồng nhau. Đã kiểm trên bản render: vùng tối lồng trong trang sáng, bên trong lại có brand khác ở mật độ gọn, đều đúng.

## Hệ quả
- Muốn xuất cho iOS/Android/Figma thì phải viết thêm formatter, hoặc chuyển sang Style Dictionary dùng chung `tools/lib/tokens.mjs` làm parser.
- Team phải tự bảo trì engine: ở mức hiện tại là một file và đã có fixture test trong lịch sử phát triển.

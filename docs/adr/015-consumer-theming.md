# ADR-015: Dự án dùng NXT tự đổi màu thương hiệu (không cần sửa repo, không build lại)

- **Trạng thái:** Đã áp dụng, chờ xác nhận.
- **Ngày:** 2026-11-17

## Bối cảnh
Trước đây muốn đổi màu chủ đạo phải thêm một brand vào repo NXT (`npm run ds:palette`, ghi file token, build lại). Dự án ngoài repo import gói đã build thì không làm được, trong khi các thư viện UI cùng loại (HeroUI, MUI…) cho đổi màu bằng một dòng cấu hình.

## Quyết định
Màu chủ đạo là **một slot** (thang `--nxt-color-brand-50 … 950`) và dự án tự đặt được bằng ba cách. Ba cách dùng cùng một thuật toán sinh thang (OKLCH, `tools/lib/palette.mjs`):

1. **`provideNxt({ primary })`** (khuyến nghị) và service **`NxtTheme`** (`setPrimary`, `resetPrimary`, signal `primary`). `primary` là màu gốc (`#hex`, `rgb()`, `oklch()`) hoặc thang đầy đủ 11 bậc. Giá trị ghi vào `<html>` bằng CSSOM (`style.setProperty`), không chèn thẻ `<style>`: chạy được khi dự án bật CSP nghiêm và thắng mọi stylesheet.
2. **`npx nxt-palette "<màu>"`** (gói `@nxt/tokens`): in khối `:root { … }` để dán vào CSS, cho dự án không muốn tính lúc chạy. Dùng đúng file `color.mjs`/`palette.mjs` mà build token chép vào `dist/lib/`.
3. **File brand** trong repo NXT (giữ nguyên): cần khi một vùng con phải có màu khác, hoặc khi sản phẩm nằm trong repo.

Quy tắc không đổi: dự án **không** đổi màu trạng thái (lỗi, thành công, cảnh báo, thông tin) và không thêm token mới (luật 5 của `CLAUDE.md`).

## Cách bảo đảm đạt WCAG 2.2 AA
- Mọi thang sinh ra có cùng độ sáng ở mỗi bậc, nên chữ trắng trên bậc 600 (nút), link bậc 700, link tối bậc 400 đạt 4,5:1 với **mọi** màu gốc. Test quét hơn 1000 tổ hợp sắc độ × độ đậm × độ sáng (`theme/scale.spec.ts`).
- Màu gốc rơi đúng vào bậc gần nhất; nút chính luôn dùng bậc 600. Màu gốc sáng (vàng) cho nút đậm hơn màu đã nhập, đó là cái giá của chữ trắng đạt AA.
- Thang do designer tự làm (`primary: { 50: …, 950: … }`) được kiểm cùng các vai trò đó; vi phạm thì `console.warn` ở chế độ dev và vẫn áp dụng.

## Hệ quả
- Bản TypeScript của thuật toán (`packages/ui/src/theme/`) song song với bản `tools/lib/*.mjs`. Test so từng màu của 12 seed giữa hai bản để không lệch.
- Cách 1 và 2 đổi cho cả ứng dụng. Ghi đè thang trên một phần tử con **không** đổi nút trong vùng đó (token phụ thuộc đã được tính ở `<html>`); vùng con khác màu phải dùng brand (cách 3), nơi build khai báo lại token phụ thuộc.
- `primary` thắng `brand` khi cùng đặt.
- Dự án phải chạy trình duyệt hỗ trợ CSS custom property (mọi trình duyệt Angular 21 hỗ trợ).

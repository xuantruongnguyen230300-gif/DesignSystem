---
name: nxt-theme
description: Dựng hoặc chỉnh theme (brand) cho một sản phẩm dùng NXT — sinh thang màu thương hiệu OKLCH từ màu gốc, map vào các brand slot cho phép, kiểm tương phản ở light/dark × density, đăng ký sản phẩm trên docs. Dùng khi user nói 'theme cho sản phẩm', 'màu thương hiệu', 'brand mới', 'đổi màu chủ đạo', 'tạo palette', 'product theme', 'thêm sản phẩm vào design system', 'dark mode cho brand'. Không dùng cho thay đổi token lẻ (dùng nxt-tokens).
argument-hint: "<product-slug> <màu-gốc> [font] [radius preset]"
---

# nxt-theme — brand cho từng sản phẩm

Một sản phẩm chỉ được khác core ở **brand slot** ([token-architecture.md §5](../../../docs/design/token-architecture.md)). Hệ thống giữ được nhất quán chính nhờ giới hạn này. Không có tuỳ chọn "kính mờ", "aurora" hay mười lăm biến thể màu.

## Đầu vào cần có
| Thông tin | Bắt buộc | Nếu thiếu |
|-----------|----------|-----------|
| `product` slug (kebab-case, ví dụ `hrm`) | ✓ | Hỏi user |
| Màu gốc thương hiệu (hex/oklch) | ✓ | Hỏi user. Không tự chọn màu |
| Font | — | Giữ font core |
| Radius preset (`default` \| `rounded`) | — | `default` |

## Quy trình

### 1. Sinh thang màu
```bash
npm run ds:palette -- --name brand --seed "<màu-gốc>"
```
Đọc bảng in ra:
- **`Suggested solid fill`**: bước làm nền nút primary (chữ trắng ≥ 4.5:1).
- Bước có cờ `gamut-clipped`: màu đã bị giảm chroma để nằm trong sRGB. Báo cho user nếu đó là bước fill.
- Nếu không bước ≥ 500 nào đạt 4.5:1 với chữ trắng thì đề xuất user làm tối màu gốc, hoặc dùng chữ tối trên fill. Không tự đổi màu thương hiệu.

### 2. Ghi file brand
Tạo `packages/tokens/src/brands/<product>/brand.tokens.json`:
- Override `primitive.color.brand.50…950` bằng thang vừa sinh. Dùng `--json` để lấy DTCG, rồi giữ nguyên path `primitive.color.brand`.
- Override slot semantic **chỉ khi** bước fill khác bước mặc định của core (`semantic.color.bg.primary*` và `text.on-primary` trong `brand.light.tokens.json` / `brand.dark.tokens.json`).

Dark mode: fill thường lên 1–2 bước sáng hơn (400–500). Phải kiểm cặp `text.on-primary` / `bg.primary` ở dark.

### 3. Font (nếu có)
Font phải có đủ glyph tiếng Việt (bảng Latin Extended Additional U+1EA0–1EF9) và dấu chồng không bị cắt ở `line-height` 1.4. Kiểm bằng chuỗi `Ặ ặ Ỗ ỗ Ữ ữ Ỷ ỷ — Nguyễn Thị Ngọc Diệp`. Font đạt yêu cầu thì override `semantic.font-family.sans`.

### 4. Validate
```bash
npm run ds:tokens
```
Validator chạy mọi `contrastPairs` cho `brand=<product>` ở mọi mode. Phải đạt 0 error.

### 5. Đăng ký & preview
- Tạo `apps/docs/src/content/products/<product>.md`: mục đích, brand slot đã đổi, ảnh/ghi chú cho light và dark.
- Nếu docs app đã chạy: preview bằng `?brand=<product>&color=dark&density=compact`, chụp so sánh bằng `nxt-ui-review`.

### 6. Báo cáo
- Bảng thang màu: bước, hex, tương phản với trắng và với ink. Đánh dấu bước fill.
- Các slot đã override.
- Kết quả validator.
- Rủi ro, ví dụ fill bị gamut-clipped, hoặc màu brand gần màu `danger` / `success` dễ gây nhầm trạng thái.

## Không được làm
- Override màu status (danger/success/warning/info).
- Thêm token mới trong thư mục brand. Validator sẽ chặn; nếu cần slot mới thì đề xuất sửa core.
- Hạ `min` của contrastPairs để "cho qua".

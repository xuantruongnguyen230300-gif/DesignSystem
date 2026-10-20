---
name: nxt-tokens
description: Thêm, sửa, đổi tên hoặc deprecate design token của NXT (W3C DTCG JSON trong packages/tokens), rồi chạy validator kiểm tier, mode, brand và tương phản. Dùng khi user nói 'thêm token', 'sửa màu', 'đổi spacing', 'token cho component', 'dark mode bị lệch màu', 'đổi tên token', 'design token', 'tokens.json', hoặc khi component cần một giá trị chưa có token. Không dùng để dựng theme cho một sản phẩm mới — việc đó thuộc nxt-theme.
argument-hint: "[mô tả thay đổi token]"
---

# nxt-tokens — thay đổi token an toàn

Token là API công khai của NXT. Mọi thay đổi đi qua đúng một quy trình và kết thúc bằng validator sạch.

**Đọc trước khi sửa:** [docs/design/token-architecture.md](../../../docs/design/token-architecture.md) (tier, tên gọi, bộ semantic chuẩn, mode, brand).

## Luật cứng
1. Literal màu chỉ được nằm ở tier `primitive`.
2. `component.*` chỉ alias `semantic.*` hoặc `component.*`; không bao giờ alias `primitive.*`.
3. Token trong file mode (`*.light|dark|compact|… .tokens.json`) phải được sửa ở **mọi** mode cùng trục, trong cùng một lần sửa.
4. Mỗi token semantic và component phải có `$description` nói rõ **dùng khi nào**, không chỉ nhắc lại tên.
5. Không xoá, không đổi tên trực tiếp token đang dùng. Đánh dấu `$deprecated` trước (xem §Đổi tên).
6. Kết thúc bằng `npm run ds:tokens` với 0 error. Không báo "xong" khi validator còn lỗi.

## Quy trình

### 1. Tái sử dụng trước khi tạo mới
Tìm token sẵn có theo vai trò, không theo giá trị:
```bash
grep -rn '"<từ-khoá-vai-trò>"' packages/tokens/src
```
Nếu một semantic token đã đúng vai trò thì dùng nó. Chỉ tạo token mới khi vai trò thật sự mới.

### 2. Chọn tier
| Câu hỏi | Có → tier |
|---------|-----------|
| Là giá trị thô mới (một màu trong thang, một bước spacing)? | `primitive` |
| Là vai trò dùng ở ≥ 2 component, hoặc phải đổi theo mode/brand? | `semantic` |
| Chỉ một component dùng, để người dùng override riêng component đó? | `component` |

### 3. Sửa file
- `primitive`: `packages/tokens/src/primitive/<category>.tokens.json`. Thang màu mới sinh bằng `npm run ds:palette -- --name <tên> --seed <màu>`, không tự bịa các bước.
- `semantic`: `packages/tokens/src/semantic/<category>[.<mode>].tokens.json`.
- `component`: `packages/tokens/src/component/<component>.tokens.json`.
- Đặt `$type` ở group nếu cả nhóm cùng loại.

### 4. Bảo vệ tương phản
Nếu thêm cặp màu chữ/nền hoặc viền/nền mới thì thêm cặp đó vào `contrastPairs` trong `packages/tokens/tokens.config.json`:
- chữ: `min` 4.5;
- chữ lớn, viền và UI non-text: `min` 3.

Kiểm nhanh một cặp: `npm run ds:contrast -- "<fg>" "<bg>"`.

### 5. Validate và build
```bash
npm run ds:tokens             # đọc lỗi theo path, sửa đến khi 0 error
npm run ds:tokens -- --json   # khi cần xử lý tự động
npm run tokens:build          # sinh packages/tokens/dist (CSS theo mode/brand, JS, JSON cho docs)
```
Thang màu core sinh từ seed: sửa `packages/tokens/palettes.json` rồi chạy `npm run tokens:palettes`. Không sửa tay `src/primitive/color.tokens.json`.
Bảng lỗi thường gặp và cách sửa: [references/validator-errors.md](references/validator-errors.md).

### 6. Báo cáo cho user
| Path | Mode/Brand | Trước | Sau | Lý do |
|------|-----------|-------|-----|-------|

Kèm dòng kết quả validator (`Result: 0 error(s), N warning(s)`) và danh sách component bị ảnh hưởng:
```bash
grep -rn -- "<css-var-name>" packages apps
```

## Đổi tên / ngừng dùng
1. Tạo token mới đúng tên.
2. Token cũ: đặt `"$value": "{<token mới>}"` và `"$deprecated": "Dùng {<token mới>} — sẽ xoá ở v<major+1>"`.
3. Thay mọi chỗ dùng trong `packages/` sang token mới. Validator sẽ cảnh báo nếu còn chỗ trỏ tới token cũ.
4. Ghi changeset `minor` kèm ghi chú migration (skill `nxt-release`).

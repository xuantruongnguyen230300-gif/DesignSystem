# Lỗi validator thường gặp (`tools/tokens/validate.mjs`)

| Thông báo | Nguyên nhân | Cách sửa |
|-----------|-------------|----------|
| `top-level group must be a tier` | Nhóm gốc không phải `primitive`, `semantic` hay `component` | Bọc token vào đúng nhóm tier |
| `name segment "X" must be lowercase kebab-case` | Tên có chữ hoa, `_` hoặc khoảng trắng | Đổi sang kebab-case, ví dụ `onPrimary` → `on-primary` |
| `has no $type` | Thiếu `$type` ở token và ở mọi group cha | Thêm `$type` ở group gần nhất |
| `references {x} which does not exist` | Gõ sai path, hoặc token đích chưa được tạo | Sửa path; nếu thật sự thiếu thì tạo token đích trước |
| `… which does not exist in this context` | Token đích chỉ có ở một số mode/brand | Định nghĩa token đích ở mọi mode của trục đó |
| `component token may not reference primitive token` | Component trỏ thẳng tới thang màu | Tìm hoặc tạo semantic token có đúng vai trò, rồi alias tới nó |
| `semantic color must alias a token, not a literal value` | Có hex hoặc oklch nằm ngoài primitive | Đưa giá trị vào primitive (dùng `ds:palette` nếu là thang mới), rồi alias |
| `missing in mode "dark"` | Thêm token vào một mode mà quên mode còn lại | Thêm token vào mọi file mode cùng trục |
| `defined both in a base file and in "<axis>" mode files` | Một token vừa nằm ở base vừa nằm ở file mode | Chọn một: phụ thuộc mode thì chỉ để trong các file mode |
| `brand "x" overrides a token that does not exist` | Brand thêm token mới | Brand chỉ được override. Nếu cần slot mới thì thêm vào core trước và cập nhật token-architecture §5 |
| `circular reference a -> b -> a` | Alias vòng tròn | Một trong hai phải trỏ xuống tier thấp hơn |
| `CSS variable --nxt-… collides with …` | Hai path sinh ra cùng một tên CSS var | Đổi tên một trong hai |
| `ratio 3.9:1 < 4.5:1 [brand=hrm, color=dark, …]` | Cặp màu không đạt ở đúng tổ hợp được ghi trong ngoặc | Chọn bước khác trong thang (palette in sẵn bảng tương phản từng bước); không hạ `min` |
| `WARN … lack $description` | Thiếu mô tả | Viết rõ "dùng khi nào", ví dụ "Nền của vùng đang được chọn trong list/table" |
| `WARN component token uses a literal` | Component có dimension hoặc duration literal | Alias semantic (`space.*`, `size.*`, `radius.*`, `motion.*`) |

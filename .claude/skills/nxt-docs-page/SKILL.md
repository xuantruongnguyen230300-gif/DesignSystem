---
name: nxt-docs-page
description: Viết hoặc cập nhật trang docs của NXT (apps/docs) cho component, pattern, foundation hoặc sản phẩm — đúng cấu trúc chuẩn, ví dụ chạy được, bảng API/token sinh tự động, mục accessibility và UX writing tiếng Việt, kèm bản máy đọc cho AI agent (llms.txt). Dùng khi user nói 'viết docs', 'tài liệu component', 'trang hướng dẫn', 'cập nhật styleguide', 'docs page', 'usage guideline', 'khi nào dùng', hoặc khi component chuyển status sang beta/stable.
argument-hint: "<components|patterns|foundations|products>/<slug>"
---

# nxt-docs-page: docs giúp người dùng chọn đúng và dùng đúng

So với trang tham chiếu, docs NXT phải trả lời được câu "**nên dùng cái nào**", không chỉ trưng ví dụ. Mỗi trang là nguồn cho cả người đọc lẫn AI agent ở repo sản phẩm.

## Cấu trúc theo loại trang
| Loại | Đường dẫn | Mục bắt buộc (theo thứ tự) |
|------|-----------|----------------------------|
| Component | `apps/docs/src/content/components/<slug>.md` | Mô tả 1 câu · Khi nào dùng · Khi nào không dùng (kèm thay thế) · Ví dụ · Anatomy · Hành vi & trạng thái · Accessibility (bảng phím) · Nội dung (Nên/Không nên) · API · Tokens · Changelog |
| Pattern | `apps/docs/src/content/patterns/<slug>.md` | Bài toán người dùng · Anatomy trang · Ví dụ đầy đủ · Luật (từ catalog `nxt-pattern`) · Trạng thái · Phím tắt · Responsive · Component dùng |
| Foundation | `apps/docs/src/content/foundations/<slug>.md` | Nguyên tắc · Thang/giá trị (sinh từ token) · Cách dùng trong code · Nên/Không nên |
| Product | `apps/docs/src/content/products/<slug>.md` | Mục đích sản phẩm · Brand slot đã đổi · Pattern riêng · Liên hệ owner |

Khung component có sẵn ở `tools/scaffold/templates/component/docs.md.tpl`.

## Luật nội dung
1. **Lấy nguồn từ SPEC.md** (`packages/ui/<slug>/SPEC.md`). Docs không được mâu thuẫn với spec. Khi phát hiện spec sai, báo user rồi sửa spec trước.
2. **Bảng API và bảng Tokens không viết tay.** Chèn placeholder để docs app sinh từ source (`<!-- API -->`, `<!-- TOKENS -->`) theo cách docs app quy định.
3. **Mỗi ví dụ là một file** `apps/docs/src/examples/<slug>/<slug>-<case>.example.ts`, nhúng bằng `::example{<slug>-<case>}`. Không dán code ví dụ thẳng vào markdown.
4. Mục "Khi nào không dùng" phải nêu component thay thế bằng link.
5. **Tiếng Việt chuẩn.** Viết sentence case, câu ngắn. Thuật ngữ kỹ thuật giữ tiếng Anh khi không có từ tương đương phổ biến (token, focus, variant). Giọng văn theo [principles §5](../../../docs/design/principles.md).
6. Dữ liệu ví dụ hư cấu nhưng thực tế (tên người Việt, phòng ban, số tiền VND). Không dùng dữ liệu người thật, không dùng "Lorem ipsum".
7. Accessibility lấy nguyên bảng phím từ SPEC §6, thêm ghi chú cho người dùng screen reader nếu có.

## Bản cho AI agent
Mỗi trang component hoặc pattern phải có thêm một mục trong `apps/docs/src/content/llms.txt` (một dòng):
```
- [<Title>](/components/<slug>.md): <khi nào dùng, 1 câu> · import '@nxt/ui/<slug>'
```
Docs app xuất raw markdown ở `/<path>.md` để agent đọc trực tiếp (giống `ui.shadcn.com/docs/*.md`).

## Kiểm tra trước khi báo xong
- [ ] Đủ mục bắt buộc theo loại trang, đúng thứ tự.
- [ ] Mọi `::example{…}` trỏ tới file có thật.
- [ ] Frontmatter `status` khớp với `SPEC.md`.
- [ ] Có dòng trong `llms.txt`.
- [ ] Nếu docs app đã chạy: build docs không lỗi (`npx ng build docs`) và mở trang kiểm ở dark + compact.

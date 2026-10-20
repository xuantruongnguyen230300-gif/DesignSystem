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

## Frontmatter và directive (do `tools/docs/generate.mjs` đọc)
```md
---
title: Button
description: 1 câu — dùng trong llms.txt và đầu trang
status: beta            # draft | beta | stable | deprecated (component/foundation)
group: Hành động        # nhóm trong menu Components
order: 1                # thứ tự trong section/nhóm
package: "@nxt/ui/button"
keywords:               # từ khoá tìm kiếm, nên có tiếng Việt không dấu
  - nut
---
# Tiêu đề (H1 bị bỏ khi render; title lấy từ frontmatter)

::example{button-variants}       ← component trong apps/docs/src/examples/**/button-variants.example.ts
::api{button}                    ← bảng API sinh từ packages/ui/button/src
::tokens{component.button}       ← bảng token (giá trị theo mode) sinh từ @nxt/tokens
```
Directive phải nằm **một mình trên một dòng**. Example hoặc API không tồn tại thì `npm run docs:generate` báo lỗi và build dừng.

## Luật nội dung
1. **Lấy nguồn từ SPEC.md** (`packages/ui/<slug>/SPEC.md`). Docs không được mâu thuẫn với spec. Khi phát hiện spec sai, báo user rồi sửa spec trước.
2. **Bảng API và bảng Tokens không viết tay.** Dùng `::api{}` và `::tokens{}`. Mô tả trong bảng API lấy từ JSDoc của input trong source, nên muốn sửa mô tả thì sửa JSDoc.
3. **Mỗi ví dụ là một file** `apps/docs/src/examples/<slug>/<slug>-<case>.example.ts`. Dòng đầu của JSDoc ngay trên `@Component` là tiêu đề hiển thị. Không dán code ví dụ thẳng vào markdown.
4. Mục "Khi nào không dùng" phải nêu component thay thế bằng link.
5. **Tiếng Việt chuẩn.** Viết sentence case, câu ngắn. Thuật ngữ kỹ thuật giữ tiếng Anh khi không có từ tương đương phổ biến (token, focus, variant). Giọng văn theo [principles §5](../../../docs/design/principles.md).
6. Dữ liệu ví dụ hư cấu nhưng thực tế (tên người Việt, phòng ban, số tiền VND). Không dùng dữ liệu người thật, không dùng "Lorem ipsum".
7. Accessibility lấy nguyên bảng phím từ SPEC §6, thêm ghi chú cho người dùng screen reader nếu có.

## Bản cho AI agent
`/llms.txt` và bản markdown thô `/<section>/<slug>.md` được **sinh tự động** từ frontmatter (`title`, `description`, `package`). Vì vậy `description` phải là một câu "khi nào dùng" thật sự hữu ích, không lặp lại tên.

## Kiểm tra trước khi báo xong
- [ ] Đủ mục bắt buộc theo loại trang, đúng thứ tự.
- [ ] `npm run docs:generate` không lỗi.
- [ ] Frontmatter `status` khớp với `SPEC.md`.
- [ ] `npm run build && npm run test:a11y` đạt. Test tự phủ trang mới ở sáng/tối và mọi example mới.
- [ ] Mở trang ở dark + compact (`node tools/docs/serve-static.mjs`, thêm `?color=dark&density=compact`) và xem bằng mắt: bảng không tràn, ví dụ đọc được.

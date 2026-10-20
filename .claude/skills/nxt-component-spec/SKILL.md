---
name: nxt-component-spec
description: Viết SPEC.md cho một component NXT trước khi code — mục đích, anatomy, API Angular, variants, ma trận trạng thái, keyboard map theo WAI-ARIA APG, token, density và i18n tiếng Việt, tiêu chí nghiệm thu. Dùng khi user nói 'component mới', 'thiết kế component', 'spec component', 'thêm <tên> vào design system', 'đặc tả component', 'API của component', hoặc trước khi chạy nxt-component-build cho component chưa có SPEC.md. Cũng dùng khi đổi hành vi/API của component có sẵn.
argument-hint: "<component-name> [mô tả nhu cầu]"
---

# nxt-component-spec: spec trước, code sau

Spec là nguồn sự thật về hành vi. Code, test và docs đều kiểm theo spec. Output là `packages/ui/<name>/SPEC.md`, theo khung `tools/scaffold/templates/component/SPEC.md.tpl`.

**Đọc trước:**
- [docs/design/principles.md](../../../docs/design/principles.md): register Operate, quality floor.
- [docs/design/component-conventions.md](../../../docs/design/component-conventions.md): quy ước API.

## Quy trình

### 1. Có cần component mới không?
- Liệt kê component đã có: `ls packages/ui`. Tìm component trùng vai trò.
- Nếu nhu cầu giải quyết được bằng variant, hoặc bằng cách ghép component sẵn có thì đề xuất phương án đó và **dừng**. Ghép nhiều component thành luồng nghiệp vụ là việc của skill `nxt-pattern`.
- Ghi vào §1: vấn đề người dùng, khi nào dùng, khi nào **không** dùng và dùng gì thay thế.

### 2. Chọn APG pattern
Ghi rõ pattern trong frontmatter `apg-pattern`, ví dụ `button`, `checkbox`, `combobox`, `dialog-modal`, `disclosure`, `grid`, `listbox`, `menu-button`, `radio-group`, `slider`, `switch`, `tabs`, `tooltip`, `tree-view`. Keyboard map ở §6 lấy theo pattern này, không tự nghĩ ra. Bảng tóm tắt các pattern hay dùng: [references/apg-keyboard.md](references/apg-keyboard.md).

### 3. API nhất quán toàn hệ thống
- Dùng đúng tên chung: `variant`, `size` (`sm|md|lg`), `disabled`, `readonly`, `loading`, `invalid`. Two-way dùng `model()`, ví dụ `value`, `open`, `checked`.
- Variant đặt theo **ý nghĩa** (`primary`, `secondary`, `ghost`, `danger`), không theo màu (`blue`).
- Tối đa khoảng 4 variant. Mỗi variant phải có hàng "Dùng khi / Không dùng khi" ở §4.
- Không có input nhận màu hoặc kích thước tự do.

### 4. Ma trận trạng thái
Điền đủ 10 cột ở §5. Trạng thái không áp dụng thì ghi lý do. Các trạng thái hay bị quên:
- `loading` (giữ kích thước, không nhảy layout);
- `read-only` (khác `disabled`: vẫn focus và copy được);
- `error` (kèm text, không chỉ đổi màu viền);
- disabled có giải thích lý do.

### 5. Token
- Liệt kê component token cần có. Mỗi token alias một semantic token **đã có** trong bộ semantic chuẩn ([token-architecture.md §3](../../../docs/design/token-architecture.md)).
- Thiếu vai trò semantic thì ghi `❓ cần semantic mới: …` để xử lý bằng `nxt-tokens`. Không tự chế giá trị.

### 6. Density, responsive, tiếng Việt
- Ghi những gì thay đổi ở compact và spacious, và hit area tối thiểu 24×24 ở compact.
- Thử nội dung dài thật: "Phòng Quản trị Nguồn nhân lực & Phát triển Tổ chức", "Nguyễn Thị Ngọc Diệp". Quyết định wrap, truncate kèm tooltip, hay giới hạn số dòng.
- Thử số, tiền, ngày: `1.250.000 ₫`, `31/12/2026`.

### 7. Nghiệm thu
Giữ checklist §10 của template, bổ sung tiêu chí riêng của component nếu có.

### 8. Chốt với user
- Mọi điểm chưa chắc ghi `❓` kèm phương án đề xuất. Liệt kê chúng cho user, không tự quyết.
- Giữ `status: draft` cho tới khi user duyệt. Sau đó chuyển sang `nxt-component-build`.

## Tạo khung nhanh
Nếu chưa có thư mục component thì tạo đủ bộ file (SPEC, ts, css, spec test, tokens, docs, example):
```bash
npm run ds:new -- <name>               # element selector <nxt-name>
npm run ds:new -- <name> --attribute   # button[nxtName], cho phần tử native
```

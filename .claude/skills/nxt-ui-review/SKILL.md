---
name: nxt-ui-review
description: Review UI/UX theo chuẩn NXT — chạy detector token/hard-code, chấm quality floor, anti-pattern register Operate, heuristic usability cho màn hình dữ liệu dày, UX writing tiếng Việt; trả về finding xếp hạng P0–P3 kèm file:line và cách sửa; chỉ sửa khi user yêu cầu (polish). Dùng khi user nói 'review UI', 'review UX', 'kiểm tra giao diện', 'màn này ổn chưa', 'polish', 'làm đẹp lại', 'critique', 'design review', 'so với design system', hoặc trước khi đổi status component/pattern sang beta/stable.
argument-hint: "[đường dẫn | component | pattern | diff] [--fix]"
---

# nxt-ui-review: review có căn cứ, không chấm theo cảm tính

Mỗi finding phải dựa trên một trong ba nguồn: **kết quả detector**, **một mục cụ thể** trong [docs/design/principles.md](../../../docs/design/principles.md), hoặc **SPEC/PATTERN**. Không có nguồn thì không ghi finding.

## Phạm vi
- Không có tham số: review các file UI trong diff hiện tại (`git diff --name-only HEAD`).
- Có tham số: component (`packages/ui/<name>`), pattern, trang docs, hoặc ảnh chụp màn hình.

## Quy trình

### 1. Xác định register
Register là Operate, Read hoặc Welcome (principles §1). Register quyết định mức chấm: Operate chấm nghiêm về mật độ, phím tắt và trạng thái.

### 2. Detector (bắt buộc, chạy trước)
```bash
npm run ds:hardcoded -- <paths>       # literal màu = P1, còn lại = P3
npm run ds:tokens                      # nếu diff đụng packages/tokens
```

### 3. Đọc code và example
Với từng file, đối chiếu:
- **Quality floor** (principles §3): mỗi mục trượt là một finding.
- **Anti-pattern** (principles §4).
- **SPEC.md / PATTERN.md:** state, variant hoặc phím nào thiếu.
- **Heuristic cho dữ liệu dày:** [references/heuristics.md](references/heuristics.md).
- **UX writing** (principles §5): nhãn, thông báo lỗi, thuật ngữ.

### 4. Xem bản render
- `npm run build`, rồi `node tools/docs/serve-static.mjs` (cổng 4300).
- Mở `/examples/<id>?color=dark&density=compact` hoặc trang docs. Chụp ảnh bằng Playwright (`page.screenshot`) và đọc ảnh, ở 1440px, 390px và zoom 200%.
- Lỗi thực tế đã bắt được nhờ xem ảnh mà test tự động bỏ sót:
  - cột bảng bị giá trị dài chiếm hết chỗ;
  - tiêu đề example lấy nhầm JSDoc;
  - nút mất tên truy cập trên mobile.
- Không chạy được thì ghi rõ "chưa kiểm bản render" trong báo cáo, không đoán.

### 5. Second opinion (khi phạm vi lớn: ≥ 5 file hoặc một pattern)
Gọi agent `nxt-design-reviewer` với cùng phạm vi và **không** gửi kèm finding của mình. Gộp kết quả: finding cả hai cùng ghi được giữ; finding chỉ một bên ghi thì kiểm lại nguồn rồi mới giữ.

## Mức độ
| Mức | Nghĩa | Ví dụ |
|-----|-------|-------|
| P0 | Chặn người dùng hoặc mất dữ liệu | Không thao tác được bằng bàn phím; không cảnh báo khi rời trang chưa lưu; xoá hàng loạt không xác nhận |
| P1 | Sai chuẩn a11y/token hoặc sai SPEC | Tương phản < 4.5:1; literal màu; thiếu state error; focus không thấy |
| P2 | Usability kém rõ rệt | Hai hành động primary trong một vùng; empty state không có hướng đi tiếp; lỗi form nằm xa field |
| P3 | Polish | px literal, căn chỉnh lệch, câu chữ chưa gọn |

## Output
```
## UI review: <phạm vi> · register <Operate|Read|Welcome>
Detector: hardcoded <n errors/m warnings> · tokens <kết quả hoặc "không áp dụng"> · render: <đã kiểm ở … | chưa kiểm>

| # | Mức | Vị trí | Vấn đề | Nguồn | Cách sửa |
|---|-----|--------|--------|-------|----------|
| 1 | P1 | packages/ui/select/src/select.css:42 | … | principles §3 Accessibility | … |

Tóm tắt: <số finding theo mức> · Đạt quality floor: <có/không>
```

## Sửa (chỉ khi user yêu cầu, hoặc có `--fix`)
- Sửa theo thứ tự P0 → P3. Mỗi sửa đổi phải giữ đúng SPEC.
- Không thêm hiệu ứng, gradient hay animation để "đẹp hơn". Polish trong NXT nghĩa là bớt đi, căn lại và làm rõ.
- Sau khi sửa: chạy lại detector và test liên quan, cập nhật bảng finding với cột kết quả `fixed` / `skipped` (kèm lý do).

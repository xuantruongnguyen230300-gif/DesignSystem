---
name: nxt-a11y-audit
description: Audit accessibility WCAG 2.2 AA cho component, pattern hoặc trang của NXT — kiểm tương phản token ở mọi mode×brand, keyboard map so với SPEC/WAI-ARIA APG, role/name/state, focus, vùng chạm, reduced motion, zoom 200%, chạy axe qua Playwright khi có docs app; báo cáo theo tiêu chí WCAG kèm file:line. Dùng khi user nói 'kiểm tra a11y', 'accessibility', 'WCAG', 'screen reader', 'keyboard navigation', 'tương phản', 'axe', 'audit truy cập', hoặc trước khi component lên beta/stable.
argument-hint: "<component | pattern | đường dẫn> [--fix]"
---

# nxt-a11y-audit: WCAG 2.2 AA, có bằng chứng

Mặc định chỉ audit. Chỉ sửa khi user yêu cầu hoặc có `--fix`.

**Nguồn:**
- [references/wcag-checklist.md](references/wcag-checklist.md): các tiêu chí áp dụng cho UI component.
- `packages/ui/<name>/SPEC.md` §5–§6.
- [apg-keyboard.md](../nxt-component-spec/references/apg-keyboard.md).

## Quy trình

### 1. Tương phản (tự động)
```bash
npm run ds:tokens       # chạy mọi contrastPairs ở mọi mode × brand
```
- Component dùng cặp màu chưa có trong `contrastPairs` thì thêm cặp vào config (skill `nxt-tokens`) và chạy lại.
- Kiểm một cặp lẻ: `npm run ds:contrast -- "<fg>" "<bg>"`.

### 2. Keyboard & focus (đọc code + test)
- Mỗi dòng keyboard map trong SPEC §6 phải có test tương ứng trong `<name>.spec.ts`. Thiếu test là finding.
- Kiểm thêm:
  - focus trap / restore (dialog, drawer);
  - roving tabindex (widget phức hợp);
  - `Esc` đóng overlay;
  - focus không bị sticky element che (2.4.11).

### 3. Semantics (đọc template)
- Ưu tiên phần tử native. Role, `aria-*` khớp APG pattern.
- Mọi control có accessible name: label, `aria-label`, hoặc `aria-labelledby`.
- Lỗi và helper text được liên kết bằng `aria-describedby`; trạng thái lỗi có `aria-invalid`.
- Thay đổi động (toast, kết quả lọc, lưu xong) được announce qua `LiveAnnouncer` hoặc live region.

### 4. Tự động trên bản render
`apps/docs/e2e/a11y.spec.ts` tự chạy axe (`wcag2a/aa`, `wcag21a/aa`, `wcag22aa`) trên **mọi** example ở sáng/tối/gọn, trên mọi trang docs ở sáng/tối, kèm test bàn phím:
```bash
npm run build                                   # cần bản build mới nhất
npm run test:a11y -- -g "<example-id hoặc tên>" # lọc theo tên; bỏ -g để chạy hết
```
- Component chưa có example thì chưa được kiểm, nên phải viết example trước (skill `nxt-component-build` §6).
- Thêm test hành vi riêng (focus trap, Esc, roving tabindex) vào `describe('keyboard')` trong cùng file.
- Không chạy được thì ghi rõ "chưa chạy axe" và lý do.

axe không bắt được mọi lỗi. Ví dụ thực tế: nút tìm kiếm của docs mất tên truy cập trên mobile, vì nhãn bị `display:none`, nhưng axe ở viewport desktop vẫn báo đạt. Luôn kiểm cả viewport 390px.

### 5. Kiểm thủ công cần người
Ghi các mục sau thành checklist cho user, **không** tự đánh dấu là đạt:
- đọc bằng NVDA + Chrome, VoiceOver + Safari;
- zoom 200% / 400% reflow;
- Windows High Contrast (`forced-colors`).

## Output
```
## A11y audit: <phạm vi> · WCAG 2.2 AA
Tự động: tokens contrast <x/y pass> · axe <n vi phạm | chưa chạy: lý do> · keyboard tests <x/y dòng SPEC có test>

| # | Mức | WCAG SC | Vị trí | Vấn đề | Cách sửa |
|---|-----|---------|--------|--------|----------|
| 1 | P1 | 1.4.11 Non-text Contrast | packages/ui/checkbox/src/checkbox.css:18 | Viền 2.1:1 ở dark | Dùng --nxt-checkbox-border → semantic.color.border.input |

Cần kiểm thủ công: [ ] NVDA  [ ] VoiceOver  [ ] Zoom 400%  [ ] forced-colors
Kết luận: Đạt / Không đạt AA (đếm P0+P1)
```
Mức độ giống `nxt-ui-review`: P0 là chặn hoàn toàn (không dùng được bằng bàn phím hoặc screen reader), P1 là vi phạm một tiêu chí AA.

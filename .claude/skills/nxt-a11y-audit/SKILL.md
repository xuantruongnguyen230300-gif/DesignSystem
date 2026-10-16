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

### 4. Tự động trên bản render (khi `apps/docs` chạy được)
Chạy test a11y Playwright cho example của component, ở light/dark × 3 density:
```bash
npx playwright test --grep "@a11y <name>"
```
Test dùng `@axe-core/playwright` với tag `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa`. Chưa có test thì viết theo mẫu ở [references/wcag-checklist.md §Mẫu test](references/wcag-checklist.md).

Không chạy được thì ghi rõ "chưa chạy axe" và lý do.

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

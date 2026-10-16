---
name: nxt-component-build
description: Implement hoặc sửa một component NXT trong packages/ui theo SPEC.md đã duyệt — Angular 21 standalone, signals, OnPush, hành vi headless từ Angular CDK/Aria, style chỉ dùng token, unit test keyboard map, example cho docs. Dùng khi user nói 'code component', 'implement <tên>', 'build component', 'sửa component', 'thêm variant', 'fix bug component', hoặc sau khi nxt-component-spec đã được duyệt. Nếu component chưa có SPEC.md thì chạy nxt-component-spec trước.
argument-hint: "<component-name>"
---

# nxt-component-build: từ SPEC đến code đạt DoD

**Đọc trước:**
- `packages/ui/<name>/SPEC.md`: bắt buộc. Nếu thiếu, hoặc status vẫn là `draft` mà còn mục `❓`, thì dừng và chuyển sang `nxt-component-spec`.
- [docs/design/component-conventions.md](../../../docs/design/component-conventions.md): API, CDK/Aria, style, test.
- Skill `angular-developer` ([angular/skills](https://github.com/angular/skills)) nếu đã cài, cho kiến thức Angular tổng quát. Không lặp lại kiến thức đó ở đây.

## Điều kiện tiên quyết
- Repo phải có `angular.json` và `packages/ui/ng-package.json` (Phase 0 trong [docs/PLAN.md](../../../docs/PLAN.md)). Nếu chưa có thì báo user rằng workspace Angular chưa được dựng và dừng.
- Các semantic token mà SPEC §7 cần phải tồn tại. Thiếu thì làm `nxt-tokens` trước.

## Quy trình

### 1. Khung
```bash
npm run ds:new -- <name> [--attribute]   # bỏ qua file đã có, không ghi đè
```

### 2. Token component
- Điền `packages/tokens/src/component/<name>.tokens.json` theo SPEC §7.
- Chỉ alias semantic. Mỗi token có `$description`.
- Chạy `npm run ds:tokens`.

### 3. Logic
Khung chuẩn nằm ở `tools/scaffold/templates/component/component.ts.tpl`.
- `input()`, `model()`, `output()`, `computed()`. Không dùng decorator `@Input` / `@Output` / `@HostBinding`.
- Hành vi bàn phím, overlay và focus lấy từ CDK/Aria theo bảng trong conventions §3. Nếu phải tự viết keyboard handling thì ghi lý do vào SPEC.
- Phản ánh state ra `data-*` hoặc `aria-*` trên host. CSS chỉ chọn qua các attribute đó.
- Form control implement `ControlValueAccessor`.
- Không dùng `NgZone` và `setTimeout` để "đợi render". Dùng `afterNextRender` hoặc `effect`.

### 4. Style
- Rule nằm trong `@layer nxt.components`, scope `.nxt-<name>`, chỉ dùng `var(--nxt-<name>-*)` cùng `--nxt-focus-ring-*` và `--nxt-motion-*`.
- Dùng logical properties; dùng container query nếu SPEC §8 yêu cầu.
- Trước khi sang bước sau, phải sạch `npm run ds:hardcoded`.

### 5. Test
Viết trong `src/<name>.spec.ts` (Vitest + TestBed):
- Mỗi dòng keyboard map SPEC §6 là một test.
- Mỗi state SPEC §5 phản ánh đúng `aria-*` và `data-*`.
- Form control: tương tác với `FormControl` (set value, disabled, touched).

Viết thêm harness `packages/ui/<name>/testing/<name>-harness.ts` khi component tương tác được.

### 6. Example
Viết `apps/docs/src/examples/<name>/*.example.ts`:
- Ít nhất một example cho **mỗi** variant và mỗi state quan trọng (loading, error, disabled, nội dung dài).
- Dữ liệu tiếng Việt thực tế, hư cấu, không lấy dữ liệu người thật.
- Example cũng là fixture cho test a11y và visual, nên không chứa random hay ngày giờ hiện tại.

### 7. Kiểm tra cuối
```bash
npm run ds:check            # tokens + hard-code
npx ng test ui --watch=false
npx ng build ui
```
Chạy thêm `nxt-a11y-audit` cho component. Sau đó cập nhật SPEC §10 (đánh dấu từng mục) và docs (skill `nxt-docs-page`).

## Báo cáo
- File đã tạo/sửa.
- Bảng SPEC §10 với trạng thái từng mục.
- Lệnh đã chạy kèm kết quả thật. Lệnh nào chưa chạy được thì nói rõ lý do; không ghi "pass" khi chưa chạy.

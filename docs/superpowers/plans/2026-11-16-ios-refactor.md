# NXT iOS (kiểu C) refactor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đổi diện mạo mọi component NXT sang kiểu iOS "C", tách CSS theo component, đóng gói để project Angular khác cài là dùng.

**Architecture:** Gần như toàn bộ diện mạo đi qua token (3 tầng): sửa primitive/semantic/component token, CSS component chỉ đổi khi token không đủ (switch, segmented, form-field, shell). Build token được mở rộng để sinh lõi + token theo từng component. Lưới/toolbar giữ nguyên cấu trúc và hành vi.

**Tech Stack:** Angular 21 standalone/signals/CDK, W3C DTCG tokens, ng-packagr, Vitest, Playwright + axe.

**Spec:** [docs/superpowers/specs/2026-11-16-ios-refactor-design.md](../specs/2026-11-16-ios-refactor-design.md) (mockup: `../specs/assets/2026-11-16-style-c-demo.html`)

## Global Constraints

- Angular `>=21.0.0 <23.0.0`; không hạ phiên bản; npm ≥ 11.
- Không hard-code màu, px (trừ 0/1px), z-index, font-family trong `packages/` và `apps/`; chỉ `var(--nxt-…)`. `npm run ds:check` phải sạch sau mỗi task.
- Token đi 3 tầng component → semantic → primitive; literal màu chỉ ở primitive.
- Không sửa file sinh tự động: `packages/tokens/dist/`, `packages/tokens/src/primitive/color.tokens.json`, `apps/docs/src/generated/`, `dist/`.
- WCAG 2.2 AA: chữ ≥ 4.5:1, ranh giới control và vòng focus ≥ 3:1, ở mọi mode × brand × density. Không nới `tokens.config.json`.
- Kiểu C: control radius 14px, button/tag/segmented/search/switch viên thuốc, card 28px, dialog/popover 32px; control md cao gọn 28 · vừa 36 · rộng 46px; font Plus Jakarta Sans giữ nguyên; không `backdrop-filter`, không gradient trang trí, không animate `box-shadow`.
- Giữ nguyên mọi quyết định grid/toolbar ở mục 4 của spec (thứ tự toolbar, hành động trên toolbar, tab trên toolbar, thanh hàng loạt thay toolbar, lưới lấp đầy + cuộn trong lưới, hàng không có cột thao tác, drawer chi tiết, luật chọn hàng).
- Không tự commit/push. Không đặt tên "vnr". Chỉ ghi "pass" cho lệnh đã chạy thật.

## Review Focus

- Chữ trắng trên nút primary và chữ tag trên nền nhạt ở dark: phải ≥ 4.5:1 (test: `ds:tokens` 0 lỗi).
- Mật độ gọn: control 28px không bị phình, hàng bảng không cao hơn hiện tại (test: unit token mật độ).
- Lưới ít hàng và nhiều hàng vẫn chạm đáy và hai mép card, cuộn ngang trong lưới ở điện thoại (test: e2e `fill` sẵn có, đo theo mép card).
- Selection/Shift-range/checkbox không đổi hành vi sau restyle (test: spec sẵn có của table và checkbox pass).
- Component import đơn lẻ (`@nxt/ui/button`) vẫn hiển thị đúng khi chỉ có CSS lõi + token của chính nó (test: build thư viện + kiểm file token theo entry).

---

### Task 1: Token lõi kiểu C

**Files:** Modify `packages/tokens/src/primitive/dimension.tokens.json` (radius), `packages/tokens/src/primitive/static.tokens.json` (shadow), `packages/tokens/src/semantic/base.tokens.json` (radius, elevation), `packages/tokens/src/semantic/density.{compact,comfortable,spacious}.tokens.json` (size), `packages/tokens/src/semantic/color.{light,dark}.tokens.json` (canvas, field, border.input, status), `packages/palettes.json` nếu cần accent.

**Interfaces:** Produces: `primitive.radius.{14,28,32}`; `semantic.radius.{control=14,container=28,overlay=32,pill}`; `semantic.size.control.{sm,md,lg}` theo 28·36·46; `semantic.elevation.{raised,overlay}` theo bóng kiểu C (sáng + tối); accent `semantic.color.bg.primary` đạt ≥ 4.5:1 với `text.on-primary`.

- [ ] Step 1: Thêm primitive radius 14/28/32 và bóng kiểu C (sáng và tối) theo mục 3 của spec.
- [ ] Step 2: Trỏ semantic radius/elevation vào primitive mới; density: compact md=28 (giữ), comfortable md=36 (sm 32, lg 44), spacious md=46 (sm 40, lg 54); hàng bảng giữ nguyên.
- [ ] Step 3: Chọn accent gần `#007AFF` mà đạt 4.5:1 (`npm run ds:palette`/`ds:contrast`), cập nhật palette; canvas gần `#F2F2F7`; ranh giới ô nhập/track switch/checkbox đạt 3:1 nhưng kín đáo.
- [ ] Step 4: Run `npm run ds:tokens` — Expected: 0 error, mọi cặp contrast pass.

### Task 2–6: Component theo nhóm (chạy song song, mỗi nhóm một agent)

Mỗi nhóm: cập nhật `packages/tokens/src/component/<tên>.tokens.json` (radius pill/28, bỏ viền, bóng), `packages/ui/<tên>/src/*.css` chỉ khi token không đủ, `SPEC.md` (mục diện mạo), `*.spec.ts` nếu giá trị kiểm thử đổi, example docs nếu hiển thị lệch. **Không** đổi API, hành vi, keyboard map.

- Task 2 hành động: button (+icon button), menu, segmented, action-bar.
- Task 3 nhập liệu: form-field, checkbox, radio-group, switch (51×31), search, filter, combobox, date-picker, calendar, value-help.
- Task 4 phản hồi/lớp phủ: alert, toast, tooltip, popover, dialog, drawer, progress, skeleton, empty-state.
- Task 5 dữ liệu: table (+ scroll, selection; hàng chọn bo hai đầu), card, stat, tag, badge, avatar (màu chỉ thị), descriptions, timeline, pagination (tròn).
- Task 6 điều hướng/khuôn trang: app-shell, sidenav, topbar (viên thuốc, nổi nếu giữ được chuỗi `nxtFill`), page-header, tabs, object-page, view-manager.

**Interfaces:** Consumes token của Task 1. Mỗi agent chạy `npm run ds:check` và `node tools/test/unit.mjs` cho entry của mình; không chạy `tokens:build`/`build` (tranh chấp `dist`).

### Task 7: Mẫu màn hình và docs

**Files:** `apps/docs/src/examples/templates/*`, `apps/docs/src/content/**`.
- [ ] Làm lại 6 mẫu (Tổng quan, Danh mục, Phê duyệt, Quy trình duyệt, Đăng nhập, Hồ sơ nhân viên) trên diện mạo mới, giữ luật mục 4.
- [ ] Cập nhật trang foundation (màu, bo góc/bóng, mật độ), `docs/design/principles.md` (cho phép bo lớn + bóng đã định nghĩa, vẫn cấm kính mờ/gradient/glow), ADR-012 (diện mạo iOS), `docs/PLAN.md`.

### Task 8: Tách CSS theo component + cổng kích thước

**Files:** Modify `tools/tokens/build.mjs`; Create `tools/size/report.mjs`, `tools/size/budgets.json`; Modify `package.json` (script `size:check`), `packages/ui/*/src/*.ts` (nạp token riêng) hoặc cơ chế tương đương.
**Interfaces:** Produces: `packages/tokens/dist/css/nxt.core.css` (lõi: primitive+semantic+mode/density/motion/brand), `dist/css/components/<name>.css` (token component, kèm khối mode cần thiết), `dist/css/nxt.css` (gộp, giữ cho prototype); `npm run size:check` fail khi vượt `budgets.json`.
- [ ] Step 1: Mở rộng `build.mjs` để sinh lõi + từng component (khối mode chỉ chứa token của component đó).
- [ ] Step 2: Mỗi component nạp file token của mình khi được import; `nxt.css` gộp vẫn dùng được.
- [ ] Step 3: Viết `size:check` đo gzip theo entry và lõi; ngưỡng = số đo sau refactor không vượt baseline 124.769 B của file gộp.
- [ ] Step 4: Run `npm run tokens:build && npm run size:check` — Expected: lõi < 1/3 file gộp, exit 0.

### Task 9: Đóng gói

**Files:** Modify `packages/ui/package.json`, `packages/tokens/package.json` (peer `>=21 <23`, `publishConfig` GitHub Packages, `repository`, `license`), Create `packages/ui/src/provide-nxt.ts` + export, `.github/workflows/publish.yml`, docs "Cài đặt".
**Interfaces:** Produces: `provideNxt(options?: { brand?: string; mode?: 'light'|'dark'|'auto'; density?: 'comfortable'|'compact'|'spacious' }): EnvironmentProviders` đặt thuộc tính `data-nxt-*` lên `<html>`; mặc định chạy được khi không truyền.
- [ ] Viết unit test `provideNxt` (mặc định, truyền tuỳ chọn, SSR-safe), cài đặt, đóng gói `npm pack`, ghi hướng dẫn `.npmrc` + bí danh `"@nxt/ui": "npm:@<scope>/ui@^x"`.

### Task 10: Kiểm chứng và báo cáo

- [ ] Run `npm run ds:check`, `npm test`, `npm run build`, `npm run size:check`, `npm run test:a11y` (nếu chạy được); ghi kết quả thật và số đo trước/sau vào `docs/PLAN.md`.
- [ ] Báo cáo cho chủ repo: đã làm, chưa làm, chưa chạy, việc cần test thủ công.

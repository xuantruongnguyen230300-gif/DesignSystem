# NXT Design: hướng dẫn cho AI agent

NXT Design là design system đa sản phẩm cho phần mềm nghiệp vụ dữ liệu dày. Stack: **Angular 21 standalone + Angular CDK (headless)**, token **W3C DTCG**. Tiếng Việt là ngôn ngữ chính.

- Kế hoạch, lộ trình và trạng thái: [docs/PLAN.md](docs/PLAN.md)
- Nguồn sự thật thiết kế: [docs/design/](docs/design/), gồm `principles.md`, `token-architecture.md`, `component-conventions.md`
- Quyết định kiến trúc: [docs/adr/](docs/adr/)

## Luật cứng
1. **Không hard-code giá trị** trong `packages/` và `apps/`: màu, px (trừ 0/1px), z-index, font-family. Chỉ dùng `var(--nxt-…)`. Hook PostToolUse (`.claude/settings.json`) chạy detector sau mỗi lần sửa file. Khi hook báo lỗi (exit 2) thì phải sửa ngay.
2. **Token đi qua 3 tầng.** `component` → `semantic` → `primitive`. Literal màu chỉ nằm ở primitive. Thang màu primitive **sinh từ** `packages/tokens/palettes.json`.
3. **Spec trước, code sau.** Component mới hoặc thay đổi hành vi phải có `packages/ui/<name>/SPEC.md` được duyệt trước.
4. **A11y là điều kiện tối thiểu.** WCAG 2.2 AA, keyboard map theo WAI-ARIA APG, tương phản đạt ở mọi mode × brand. Mỗi example đều được kiểm bằng axe.
5. **Brand chỉ override slot cho phép.** Không thêm token và không đổi màu status theo sản phẩm.
6. **Không đặt tên "vnr".** Trang vnrpromax chỉ là tham chiếu; mọi thứ ở đây dùng prefix `nxt`.
7. **Báo kết quả thật.** Chỉ ghi "pass" cho lệnh đã thực sự chạy.
8. **Không sửa file sinh tự động:** `packages/tokens/dist/`, `packages/tokens/src/primitive/color.tokens.json`, `apps/docs/src/generated/`, `dist/`.

## Lệnh (npm ≥ 11; npm 10.8 lỗi khi cài, xem ADR-009)
| Lệnh | Mục đích |
|------|----------|
| `npm start` | Build token, sinh dữ liệu docs (watch), `ng serve docs` |
| `npm run build` | Token → dữ liệu docs → `@nxt/ui` (dist/ui) → docs (dist/docs) |
| `npm test` | Unit test `@nxt/ui` (Vitest) |
| `npm run test:a11y` | Playwright + axe trên mọi example × sáng/tối/gọn, mọi trang docs, test bàn phím (cần `npm run build` trước) |
| `npm run ds:check` | Validator token + detector hard-code. Chạy trước khi báo xong mọi việc đụng UI/token |
| `npm run ds:tokens [-- --json]` | Validate token (tier, mode, brand, tương phản, độc lập giữa trục mode) |
| `npm run tokens:build` | Sinh `packages/tokens/dist` (CSS theo mode/brand, SCSS, JS, JSON) |
| `npm run tokens:palettes` | Sinh lại thang màu core từ `palettes.json` |
| `npm run icons:build` | Sinh `packages/ui/icon/src/icons.generated.ts` từ danh sách chọn lọc `packages/ui/icon/icons.json` (Tabler, ADR-003) |
| `npm run docs:generate` | Sinh `apps/docs/src/generated` (nội dung, example, API, llms.txt) |
| `npm run ds:palette -- --name <x> --seed "<màu>"` | Thang màu OKLCH + bảng tương phản (dùng cho brand mới) |
| `npm run ds:contrast -- "<fg>" "<bg>"` | Tương phản WCAG cho một cặp màu |
| `npm run ds:new -- <name> [--attribute]` | Tạo khung component (không ghi đè) |
| `node tools/docs/serve-static.mjs` | Phục vụ `dist/docs/browser` ở cổng 4300 để xem hoặc chụp ảnh bản render |

## Skill, chọn theo việc
| Việc | Skill |
|------|-------|
| Thêm/sửa/đổi tên token | `nxt-tokens` |
| Theme cho một sản phẩm | `nxt-theme` |
| Đặc tả component | `nxt-component-spec` |
| Code component | `nxt-component-build` (mẫu: `packages/ui/button`, `packages/ui/layout`) |
| Ghép luồng nghiệp vụ (list, form, phê duyệt…) | `nxt-pattern` |
| Viết docs | `nxt-docs-page` |
| Review / polish UI | `nxt-ui-review`; second opinion dùng agent `nxt-design-reviewer` |
| Audit accessibility | `nxt-a11y-audit` |
| Phát hành | `nxt-release` |
| Dùng NXT trong repo sản phẩm | `nxt-use` |

Kiến thức Angular tổng quát lấy từ skill `angular-developer` ([angular/skills](https://github.com/angular/skills)) nếu đã cài; skill NXT chỉ chứa phần riêng của NXT.

## Cấu trúc
```
packages/tokens   @nxt/tokens: palettes.json, tokens.config.json, src/{primitive,semantic,component,brands/<product>} → dist/
packages/ui       @nxt/ui: styles/nxt.css + mỗi entry point một thư mục (SPEC.md, public-api.ts, src/):
                  hành động: button (+ nxtIconButton), menu, segmented · nhập liệu: form-field, checkbox
                  bố cục: layout · điều hướng: app-shell (shell, topbar, sidenav), page-header, tabs, pagination
                  dữ liệu: table, card (+ stat), tag (+ badge), avatar, progress, timeline, icon
                  phản hồi/lớp phủ: tooltip, drawer, empty-state
apps/docs         docs site: src/content/<section>/*.md, src/examples/**/*.example.ts, e2e/a11y.spec.ts
                  mẫu màn hình thật (HRM): src/examples/templates/ (dashboard, danh mục, phê duyệt, đăng nhập)
tools/            lib/ (color, palette, tokens), tokens/ (validate, build, palette, contrast), lint/, docs/, scaffold/, hooks/
docs/             PLAN, ADR, design principles
.claude/          skills/, agents/, settings.json (hook)
.github/          workflows/ci.yml
```

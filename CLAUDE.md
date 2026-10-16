# NXT Design: hướng dẫn cho AI agent

NXT Design là design system đa sản phẩm cho phần mềm nghiệp vụ dữ liệu dày. Stack: **Angular 21 standalone + Angular CDK/Aria (headless)** và token **W3C DTCG**. Tiếng Việt là ngôn ngữ chính.

- Kế hoạch & lộ trình: [docs/PLAN.md](docs/PLAN.md)
- Nguồn sự thật thiết kế: [docs/design/](docs/design/), gồm `principles.md`, `token-architecture.md`, `component-conventions.md`

## Luật cứng
1. **Không hard-code giá trị** trong `packages/` và `apps/`: màu, px (trừ 0/1px), z-index, font-family. Chỉ dùng `var(--nxt-…)`.
2. **Token đi qua 3 tầng.** `component` → `semantic` → `primitive`. Component không bao giờ alias primitive. Literal màu chỉ nằm ở primitive.
3. **Spec trước, code sau.** Component mới hoặc thay đổi hành vi phải có `packages/ui/<name>/SPEC.md` được duyệt trước.
4. **A11y là điều kiện tối thiểu.** WCAG 2.2 AA, keyboard map theo WAI-ARIA APG, tương phản đạt ở mọi mode × brand.
5. **Brand chỉ override slot cho phép.** Không thêm token và không đổi màu status theo sản phẩm.
6. **Không đặt tên "vnr".** Trang vnrpromax chỉ là tham chiếu; mọi thứ ở đây dùng prefix `nxt`.
7. **Báo kết quả thật.** Chỉ ghi "pass" cho lệnh đã thực sự chạy. Lệnh chưa chạy được thì nói rõ lý do.

## Lệnh
| Lệnh | Mục đích |
|------|----------|
| `npm run ds:check` | Validator token + detector hard-code. Chạy trước khi báo xong mọi việc đụng UI/token |
| `npm run ds:tokens [-- --json]` | Validate token (tier, mode, brand, tương phản) |
| `npm run ds:hardcoded [-- <paths>]` | Bắt giá trị bỏ qua token, in `file:line` |
| `npm run ds:palette -- --name <x> --seed "<màu>"` | Sinh thang màu OKLCH dạng DTCG + bảng tương phản |
| `npm run ds:contrast -- "<fg>" "<bg>"` | Tương phản WCAG cho một cặp màu |
| `npm run ds:new -- <name> [--attribute]` | Tạo khung component (không ghi đè) |

Workspace Angular (`angular.json`, `packages/*`, `apps/docs`) được dựng ở Phase 0 của PLAN. Khi chưa có thì các lệnh `ng …` chưa chạy được; nói rõ điều đó, đừng giả lập kết quả.

## Skill, chọn theo việc
| Việc | Skill |
|------|-------|
| Thêm/sửa/đổi tên token | `nxt-tokens` |
| Theme cho một sản phẩm | `nxt-theme` |
| Đặc tả component | `nxt-component-spec` |
| Code component | `nxt-component-build` |
| Ghép luồng nghiệp vụ (list, form, phê duyệt…) | `nxt-pattern` |
| Viết docs | `nxt-docs-page` |
| Review / polish UI | `nxt-ui-review`; second opinion dùng agent `nxt-design-reviewer` |
| Audit accessibility | `nxt-a11y-audit` |
| Phát hành | `nxt-release` |
| Dùng NXT trong repo sản phẩm | `nxt-use` |

Kiến thức Angular tổng quát lấy từ skill `angular-developer` ([angular/skills](https://github.com/angular/skills)) nếu đã cài; skill NXT chỉ chứa phần riêng của NXT.

## Cấu trúc
```
packages/tokens   DTCG JSON (src/primitive|semantic|component|brands/<product>) + tokens.config.json
packages/ui       @nxt/ui/<name>: SPEC.md, src/<name>.ts|css|spec.ts
packages/patterns @nxt/patterns
packages/icons    @nxt/icons
apps/docs         docs site + examples (fixture cho test a11y/visual)
tools/            script dùng chung cho skill và CI (Node ≥ 20, không dependency)
docs/             PLAN, ADR, design principles
.claude/          skills/ + agents/
```

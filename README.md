# NXT Design

NXT Design là design system đa sản phẩm cho phần mềm nghiệp vụ, xây trên Angular 21, Angular CDK (headless) và token W3C DTCG.

- **Kế hoạch:** [docs/PLAN.md](docs/PLAN.md)
- **Nguyên tắc thiết kế:** [docs/design/principles.md](docs/design/principles.md)
- **Kiến trúc token:** [docs/design/token-architecture.md](docs/design/token-architecture.md)
- **Quy ước component:** [docs/design/component-conventions.md](docs/design/component-conventions.md)
- **Hướng dẫn cho AI agent và danh mục skill:** [CLAUDE.md](CLAUDE.md)

## Công cụ (Node ≥ 20.19, không cần cài dependency)

```bash
npm run ds:check                                   # validate token + bắt giá trị hard-code
npm run ds:palette -- --name brand --seed "#2563EB"  # sinh thang màu OKLCH + bảng tương phản
npm run ds:contrast -- "#6B7280" "#FFFFFF"           # tương phản WCAG
npm run ds:new -- date-picker                        # tạo khung component
```

## Trạng thái

Repo đang ở **Phase 0 (nền móng)**. Đã có kế hoạch, nguyên tắc thiết kế, bộ skill agent và tooling. Workspace Angular sẽ được dựng tiếp theo.

---
component: {{name}}
status: draft        # draft → beta → stable → deprecated
owner: ""
updated: {{date}}
apg-pattern: ""      # WAI-ARIA APG pattern, e.g. button, combobox, dialog-modal, grid
---

# {{title}} — Spec

> Viết spec TRƯỚC khi code (skill `nxt-component-spec`). Mọi mục bắt buộc phải có nội dung hoặc ghi rõ "Không áp dụng — lý do".

## 1. Mục đích
- Vấn đề người dùng giải quyết:
- Khi nào dùng:
- Khi nào KHÔNG dùng (dùng gì thay thế):

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Container | ✓ | |

## 3. API (Angular)
| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `variant` | `'default'` | `'default'` | |
| input | `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Theo density |
| input | `disabled` | `boolean` | `false` | |
| output | | | | |
| content slot | | | | |

## 4. Variants & sizes
| Variant | Dùng khi | Không dùng khi |
|---------|----------|----------------|

## 5. States
Đánh dấu từng trạng thái: ✓ có · — không áp dụng (ghi lý do).
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|

## 6. Keyboard & ARIA
APG pattern: (link)
| Phím | Hành vi |
|------|---------|
| Tab | |

- Role / thuộc tính ARIA:
- Quản lý focus (vào/ra, trả focus):
- Thông báo cho screen reader (LiveAnnouncer):

## 7. Tokens
Component tokens (`packages/tokens/src/component/{{name}}.tokens.json`) — chỉ alias semantic:
| Token | Alias semantic | Ghi chú |
|-------|----------------|---------|

## 8. Density, responsive, RTL/i18n
- Compact / comfortable / spacious:
- Container query breakpoints (nếu có):
- Nội dung tiếng Việt dài, có dấu, xuống dòng / truncate:

## 9. Content guidelines
- Nhãn, độ dài tối đa, viết hoa, giọng văn:

## 10. Acceptance (Definition of Done)
- [ ] Mọi trạng thái ở §5 có trong docs example
- [ ] Unit test phủ keyboard map §6
- [ ] axe: 0 vi phạm ở light/dark × 3 density
- [ ] `npm run ds:check` sạch (tokens + hardcoded)
- [ ] Docs page đủ mục (skill `nxt-docs-page`)

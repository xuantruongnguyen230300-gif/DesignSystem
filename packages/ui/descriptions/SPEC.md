---
component: descriptions
status: beta
owner: "NXT core"
updated: 2026-10-19
apg-pattern: none (HTML description list `dl` / `dt` / `dd`)
---

# Descriptions: Spec

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** đọc nhanh thông tin của một bản ghi ở dạng nhãn – giá trị (mã, tên, phòng ban, ngày hiệu lực…) trong màn chi tiết, drawer xem nhanh, thẻ.
- **Khi nào dùng:** xem chi tiết bản ghi (chỉ đọc), tóm tắt trước khi xác nhận, phần thông tin của đơn phê duyệt.
- **Khi nào KHÔNG dùng:**
  - Sửa dữ liệu: dùng form (`nxt-form-field`).
  - So sánh nhiều bản ghi theo cùng cột: dùng bảng.
  - Số liệu chính cần nổi bật: dùng `nxt-stat`.

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | `dl[nxtDescriptions]` | ✓ | Lưới các mục, tự chia cột theo bề rộng |
| 2 | `div[nxtDescription]` | ✓ | Một mục: `dt` (nhãn) + `dd` (giá trị chiếu vào) |
| 3 | Nhãn | ✓ | Chữ phụ, nằm trên giá trị |
| 4 | Giá trị | ✓ | Văn bản, tag, link, avatar…; giá trị trống ghi "—" |

## 3. API (Angular)
Entry: `@nxt/ui/descriptions`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| `nxtDescriptions` input | `columns` | `'auto' \| 1 \| 2 \| 3` | `'auto'` | `auto`: số cột tự co theo bề rộng (mỗi cột ≥ `layout.item-min-sm`) |
| `nxtDescription` input | `label` | `string` | (bắt buộc) | Nhãn (`dt`) |
| `nxtDescription` input | `full` | `boolean` | `false` | Chiếm cả hàng (mô tả, lý do, ghi chú dài) |
| `nxtDescription` content | (default) | bất kỳ | | Giá trị (`dd`) |

## 4. Variants & sizes
Một kích thước; khoảng cách theo density (`space.gap.*`).

## 5. States
| Rest | Hover | Focus-visible | Active | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|--------|----------|----------|---------|-------|-----------|-------|
| ✓ | — | — (nội dung tương tác bên trong tự có focus) | — | — | — | — (trang dùng skeleton) | — | ✓ (bản chất chỉ đọc) | ✓ nơi dùng ghi "—" |

## 6. Keyboard & ARIA
- HTML gốc: `dl` > `div` > `dt` + `dd` (cấu trúc hợp lệ, axe `definition-list` đạt). Không thêm role.
- Không có tương tác riêng.

## 7. Tokens
`packages/tokens/src/component/descriptions.tokens.json`:

| Token | Alias semantic |
|-------|----------------|
| `label-text` | `color.text.subtle` |
| `value-text` | `color.text.default` |

Dùng thẳng semantic: `space.gap.*`, `typography.label-sm`, `typography.body-md`, `layout.item-min-sm`.

## 8. Density, responsive, i18n
- Số cột `auto` co theo bề rộng của chính danh sách (không theo viewport), nên đúng cả trong drawer hẹp.
- Giá trị dài xuống dòng; mã dùng `tabular-nums`; ngày `dd/MM/yyyy`, tiền `1.250.000 ₫` do nơi dùng định dạng.

## 9. Content guidelines
- Nhãn là danh từ ngắn: "Mã", "Phòng ban", "Ngày hiệu lực". Không thêm dấu hai chấm.
- Cặp từ – đến gộp một mục: "Thời gian: 20/10/2026 – 22/10/2026".

## 10. Acceptance (Definition of Done)
- [x] Unit test: cấu trúc `dl > div > dt + dd`, `full`, `columns`
- [x] axe: 0 vi phạm ở sáng/tối/gọn (Playwright, `npm run test:a11y`)
- [x] `npm run ds:check` sạch
- [x] Docs page đủ mục (skill `nxt-docs-page`)

---
name: nxt-release
description: Chuẩn bị phát hành các gói NXT (@nxt/tokens, @nxt/ui, @nxt/patterns, @nxt/icons) — phân loại semver cho thay đổi token/component, viết changeset và changelog tiếng Việt, ghi chú migration, chính sách deprecate, chạy release gate (tokens, hard-code, unit, a11y, visual, build). Dùng khi user nói 'release', 'phát hành', 'publish', 'changeset', 'changelog', 'tăng version', 'breaking change', 'migration guide', 'deprecate component', 'ng update'.
argument-hint: "[patch|minor|major] [phạm vi]"
---

# nxt-release: phát hành không làm vỡ sản phẩm

NXT phục vụ nhiều sản phẩm cùng lúc. Một thay đổi nhỏ trong token có thể đổi giao diện mọi sản phẩm, nên mọi thay đổi phải được phân loại và ghi lại.

## 1. Phân loại semver
| Thay đổi | Mức |
|----------|-----|
| Xoá hoặc đổi tên token, component, input, output, CSS class công khai mà **không** để alias deprecated | **major** |
| Đổi hành vi mặc định (ví dụ density mặc định, giá trị mặc định của input) | **major** |
| Thêm token, component, variant, input mới | minor |
| Deprecate (có alias, vẫn chạy) | minor |
| Đổi giá trị token làm thay đổi giao diện rõ rệt (màu fill, radius, spacing) | minor, kèm ghi chú "Thay đổi giao diện" và ảnh trước/sau |
| Sửa bug, sửa a11y, chỉnh giá trị token rất nhỏ (≤ 1 bước, cùng vai trò) | patch |

Không chắc thì chọn mức **cao hơn**.

## 2. Changeset
Dùng [Changesets](https://github.com/changesets/changesets): `npx changeset`. Mỗi PR có một changeset, viết bằng tiếng Việt, hướng tới người dùng sản phẩm:
```md
---
'@nxt/ui': minor
'@nxt/tokens': minor
---

Select: thêm `searchable` để lọc lựa chọn (không phân biệt dấu).
Token: thêm `semantic.color.bg.selected`; deprecate `semantic.color.bg.active` → dùng `semantic.color.bg.selected` (xoá ở v3).
```

## 3. Deprecation
- Token: dùng `$deprecated` và alias sang token mới (xem `nxt-tokens` §Đổi tên).
- Component/input: thêm JSDoc `@deprecated <thay thế> — xoá ở v<N+1>`. Khi chạy dev mode thì `console.warn` một lần.
- Giữ ít nhất **một minor** trước khi xoá ở major kế tiếp.
- Đổi tên hoặc chuyển API ở major thì viết **schematic `ng update`** trong `packages/ui/schematics/migrations/` để sửa code sản phẩm tự động khi làm được.

## 4. Release gate
Chạy theo thứ tự và dừng ở bước đầu tiên lỗi:
```bash
npm run ds:check                           # tokens + hard-code
npx ng test ui --watch=false                # unit + keyboard
npx ng build tokens && npx ng build ui      # build gói
npx playwright test --grep @a11y            # axe mọi example
npx playwright test --grep @visual          # visual regression
npx ng build docs                           # docs build
```
- Visual diff có thay đổi thì từng ảnh phải được xác nhận là **có chủ đích** và đã ghi trong changeset. Không cập nhật snapshot hàng loạt.
- Bước nào chưa có hạ tầng (ví dụ chưa có Playwright) thì ghi "chưa áp dụng" trong báo cáo, không ghi "pass".

## 5. Báo cáo phát hành
- Danh sách gói và version mới.
- Kết quả từng bước gate (lệnh thật đã chạy).
- Breaking changes và migration guide (link). Nếu có thay đổi giao diện thì nêu sản phẩm nào cần kiểm lại.
- Việc sau phát hành: thông báo cho các team sản phẩm, cập nhật trang Changelog trên docs.

Không tự `npm publish` hay push tag khi user chưa xác nhận rõ.

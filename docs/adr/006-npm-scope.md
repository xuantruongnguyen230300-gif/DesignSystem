# ADR-006: Scope npm và nơi publish

- **Trạng thái:** Đề xuất
- **Ngày:** 2026-10-16

## Bối cảnh
Code đang dùng scope `@nxt/*` (`@nxt/tokens`, `@nxt/ui`). Trên npmjs.com, scope `@nxt` có thể đã thuộc về người khác.

## Đề xuất
- Publish lên registry nội bộ (GitHub Packages theo tài khoản hoặc tổ chức sở hữu repo, hoặc Verdaccio) và giữ tên `@nxt/*`.
- Nếu cần publish công khai: kiểm tra quyền sở hữu scope trước. Nếu không có, đổi sang scope của tổ chức (một lần `find/replace` trong `packages/*/package.json`, tsconfig paths và docs).

## Cần chốt
Registry đích và tổ chức sở hữu.

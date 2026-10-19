# Architecture Decision Records

Mỗi quyết định kiến trúc được ghi thành một file `NNN-ten.md` gồm Bối cảnh, Phương án, Quyết định và Hệ quả. Quyết định đã ghi thì không sửa nội dung; khi đổi ý, viết ADR mới với trạng thái *Thay thế ADR-NNN*.

| ADR | Chủ đề | Trạng thái |
|-----|--------|-----------|
| [001](001-font.md) | Font mặc định: Inter | Đã áp dụng, chờ xác nhận |
| [002](002-data-grid.md) | Lưới dữ liệu nâng cao | Đề xuất |
| [003](003-icons.md) | Bộ icon: Tabler Icons (chọn lọc) | Đã áp dụng, chờ xác nhận |
| [004](004-angular-aria.md) | Dùng `@angular/aria` hay chỉ CDK | Đề xuất |
| [005](005-docs-site.md) | Docs: app Angular tự dựng thay Storybook | Đã áp dụng, chờ xác nhận |
| [006](006-npm-scope.md) | Scope npm và nơi publish | Đề xuất |
| [007](007-figma.md) | Vai trò của Figma | Đề xuất |
| [008](008-token-build.md) | Engine build token tự viết thay Style Dictionary | Đã áp dụng, chờ xác nhận |
| [009](009-workspace.md) | Workspace: Angular CLI + npm 11, chưa dùng pnpm/Nx | Đã áp dụng, chờ xác nhận |

**Trạng thái:**
- *Đề xuất*: chưa áp dụng, cần chốt.
- *Đã áp dụng, chờ xác nhận*: đã có trong code, đổi được nếu chủ sản phẩm quyết khác.
- *Chấp nhận*: đã chốt.
- *Thay thế*: đã bị một ADR mới thay.

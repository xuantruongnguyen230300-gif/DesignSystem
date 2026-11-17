# Architecture Decision Records

Mỗi quyết định kiến trúc được ghi thành một file `NNN-ten.md` gồm Bối cảnh, Phương án, Quyết định và Hệ quả. Quyết định đã ghi thì không sửa nội dung; khi đổi ý, viết ADR mới với trạng thái *Thay thế ADR-NNN*.

| ADR | Chủ đề | Trạng thái |
|-----|--------|-----------|
| [001](001-font.md) | Font mặc định: Inter | Thay thế bởi 010 |
| [002](002-data-grid.md) | Lưới dữ liệu nâng cao | Đề xuất |
| [003](003-icons.md) | Bộ icon: Tabler Icons (chọn lọc) | Đã áp dụng, chờ xác nhận |
| [004](004-angular-aria.md) | Dùng `@angular/aria` hay chỉ CDK | Đề xuất |
| [005](005-docs-site.md) | Docs: app Angular tự dựng thay Storybook | Đã áp dụng, chờ xác nhận |
| [006](006-npm-scope.md) | Scope npm và nơi publish: GitHub Packages của tài khoản chứa repo, MIT, cài bằng alias | Đã áp dụng, chờ xác nhận |
| [007](007-figma.md) | Vai trò của Figma | Đề xuất |
| [008](008-token-build.md) | Engine build token tự viết thay Style Dictionary | Đã áp dụng, chờ xác nhận |
| [009](009-workspace.md) | Workspace: Angular CLI + npm 11, chưa dùng pnpm/Nx | Đã áp dụng, chờ xác nhận |
| [010](010-font-plus-jakarta-sans.md) | Font mặc định: Plus Jakarta Sans (thay 001) | Đã áp dụng, chờ xác nhận |
| [011](011-sap-fiori-behaviour.md) | Hành vi và khuôn trang theo SAP Fiori, giao diện giữ của NXT | Đã áp dụng, chờ xác nhận |
| [012](012-ios-visual-language.md) | Ngôn ngữ giao diện kiểu iOS ("kiểu C"): bo tròn, bóng mềm | Thay thế một phần bởi 013 |
| [013](013-heroui-flat-look.md) | Giao diện phẳng theo HeroUI: viền hairline, chữ nhỏ gọn, bóng nhẹ | Thay thế một phần bởi 014 |
| [014](014-apple-hig-default.md) | Giao diện mặc định theo Apple HIG (xanh Apple, nút tô nhạt, font hệ thống) | Đã áp dụng, chờ xác nhận |
| [015](015-consumer-theming.md) | Dự án dùng NXT tự đổi màu thương hiệu: `provideNxt({ primary })`, `NxtTheme`, `nxt-palette` | Đã áp dụng, chờ xác nhận |

**Trạng thái:**
- *Đề xuất*: chưa áp dụng, cần chốt.
- *Đã áp dụng, chờ xác nhận*: đã có trong code, đổi được nếu chủ sản phẩm quyết khác.
- *Chấp nhận*: đã chốt.
- *Thay thế*: đã bị một ADR mới thay.

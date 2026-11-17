# Nhật ký thay đổi

Hai gói `@nxt/ui` và `@nxt/tokens` phát hành cùng một số phiên bản ([semver](https://semver.org/lang/vi/)). Thẻ phát hành có dạng `v<phiên bản>`; workflow `.github/workflows/publish.yml` chỉ chạy khi thẻ khớp phiên bản trong `package.json` (`npm run release:check`).

## 0.1.0

Phiên bản đầu tiên (chưa phát hành).

- **Giao diện mặc định theo Apple HIG** (ADR-014): bo góc, nút tô nhạt, ô nhập nền xám, font hệ thống; sáng/tối và ba mật độ.
- **Hơn 40 component** Angular 21 standalone, signals, OnPush, hành vi headless từ Angular CDK; mỗi component một entry point `@nxt/ui/<tên>` và một file token riêng, nên ứng dụng chỉ trả giá cho phần nó import.
- **Đổi màu thương hiệu không cần build lại** (ADR-015): `provideNxt({ primary })`, `NxtTheme`, và lệnh `npx nxt-palette` của `@nxt/tokens`. Mọi màu gốc đều cho thang đạt WCAG 2.2 AA.
- **Cài là dùng**: `provideNxt()` một dòng cho brand, chế độ sáng/tối, mật độ, chuyển động; peer Angular `>=21 <23`.
- **Đóng gói**: GitHub Packages theo tài khoản chứa repo; dự án dùng cài bằng npm alias để giữ tên `@nxt/*` (xem trang "Cài đặt" của docs). Giấy phép MIT.

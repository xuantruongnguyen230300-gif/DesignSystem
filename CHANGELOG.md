# Nhật ký thay đổi

Hai gói `@nxt/ui` và `@nxt/tokens` phát hành cùng một số phiên bản ([semver](https://semver.org/lang/vi/)). Thẻ phát hành có dạng `v<phiên bản>`; workflow `.github/workflows/publish.yml` chỉ chạy khi thẻ khớp phiên bản trong `package.json` (`npm run release:check`).

## Chưa phát hành

Tài liệu (không đổi code, sẽ có trên trang gói ở lần phát hành sau): hoàn thiện README của `@nxt/ui` thành tài liệu chính khi chưa có web docs: mục "Bắt đầu nhanh" chạy được (form, nút, bảng; được biên dịch và chạy axe trong CI), bảng cấu hình `provideNxt`, dùng token trong CSS và chỉnh một component, danh mục 40 entry point sinh từ repo kèm liên kết tới `SPEC.md` của từng component, khả năng tiếp cận, hiệu năng và phạm vi hỗ trợ (kể cả những gì chưa kiểm). Liên kết trong README trỏ tới nhánh `main`.

## 0.1.2

Mở rộng README của `@nxt/ui` thành hướng dẫn cài đặt đầy đủ cho một dự án Angular khác (không đổi code): tạo token, đặt biến môi trường (bash và PowerShell), `.npmrc`, cài bằng alias, `app.config.ts`, cập nhật phiên bản, CI và bảng lỗi thường gặp.

## 0.1.1

Sửa tài liệu đi kèm gói (không đổi code): README của hai gói và README gốc nay tự đủ các bước cài đặt, và nói rõ lệnh `npm install @<tài-khoản>/ui` mà trang gói của GitHub gợi ý **không dùng được**, phải cài bằng alias.

## 0.1.0

Phiên bản đầu tiên, phát hành 2026-11-17.

- **Giao diện mặc định theo Apple HIG** (ADR-014): bo góc, nút tô nhạt, ô nhập nền xám, font hệ thống; sáng/tối và ba mật độ.
- **Hơn 40 component** Angular 21 standalone, signals, OnPush, hành vi headless từ Angular CDK; mỗi component một entry point `@nxt/ui/<tên>` và một file token riêng, nên ứng dụng chỉ trả giá cho phần nó import.
- **Đổi màu thương hiệu không cần build lại** (ADR-015): `provideNxt({ primary })`, `NxtTheme`, và lệnh `npx nxt-palette` của `@nxt/tokens`. Mọi màu gốc đều cho thang đạt WCAG 2.2 AA.
- **Cài là dùng**: `provideNxt()` một dòng cho brand, chế độ sáng/tối, mật độ, chuyển động; peer Angular `>=21 <23`.
- **Đóng gói**: GitHub Packages theo tài khoản chứa repo; dự án dùng cài bằng npm alias để giữ tên `@nxt/*` (xem trang "Cài đặt" của docs). Giấy phép MIT.

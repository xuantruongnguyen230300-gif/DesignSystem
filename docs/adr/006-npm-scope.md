# ADR-006: Scope npm và nơi publish

- **Trạng thái:** Đã áp dụng, chờ xác nhận.
- **Ngày:** 2026-10-16, cập nhật 2026-11-17.

## Bối cảnh
Code dùng scope `@nxt/*` (`@nxt/tokens`, `@nxt/ui`). Trên npmjs.com, scope `@nxt` có thể đã thuộc về người khác (chưa kiểm). Chủ sản phẩm chọn phát hành ở **chính tài khoản chứa repo**, cho người ngoài dùng.

## Quyết định
- Phát hành công khai lên **GitHub Packages** của tài khoản chứa repo (`xuantruongnguyen230300-gif`), giấy phép **MIT**. GitHub Packages bắt scope trùng tên tài khoản, nên tên gói thật là `@xuantruongnguyen230300-gif/ui` và `@xuantruongnguyen230300-gif/tokens`.
- **Code, docs và import nội bộ giữ nguyên `@nxt/*`.** 39 file trong gói `@nxt/ui` đã build tự import lẫn nhau bằng `@nxt/ui/<entry>`, nên chỉ đổi tên trong `package.json` làm hỏng gói. Người dùng cài bằng **npm alias** để thư mục trong `node_modules` vẫn là `@nxt`:
  `npm install @nxt/ui@npm:@<tài-khoản>/ui @nxt/tokens@npm:@<tài-khoản>/tokens`
- `tools/release/stage.mjs` (lệnh `npm run release:prepare`) chép hai gói ra `dist/publish/{ui,tokens}` rồi chỉ sửa bản chép: đổi tên, đổi peer `tokens` sang tên thật và đánh dấu **tuỳ chọn** (không tự cài thêm bản thứ hai của tokens bên cạnh alias), thêm `publishConfig`, `LICENSE`, và `NOTICE` (Tabler Icons, MIT) cho gói ui. `dist/ui` không bị đổi.
- Phát hành bằng `.github/workflows/publish.yml` khi đẩy thẻ `v<phiên bản>`; trước đó `npm run release:check` bảo đảm hai gói, `NXT_UI_VERSION`, peer và CHANGELOG cùng phiên bản.
- `npm run consumer:smoke:registry` chạy lệnh cài ở trên bằng npm thật trên một registry cục bộ, build và chạy một app Angular với gói đã cài. Bước này nằm trong `ci.yml` và `publish.yml`.

## Hệ quả
- Người ngoài vẫn cần một token đọc (`read:packages`) vì GitHub Packages bắt đăng nhập cả với gói công khai; đây là cái giá của việc dùng GitHub Packages thay cho npmjs.com. Muốn bỏ bước token thì phát hành thêm lên npmjs.com (cần giữ được một scope trên npmjs.com, và cần `NPM_TOKEN` trong workflow).
- Gói liên kết với repo qua `repository.url` nên thừa hưởng quyền hiển thị của repo: repo phải công khai thì gói mới công khai.
- Alias đã kiểm với npm; pnpm và yarn chưa thử.
- Một phiên bản chỉ phát hành được một lần; sửa lỗi phải tăng phiên bản.

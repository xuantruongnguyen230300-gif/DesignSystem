---
title: Đăng nhập
description: Màn hình đăng nhập — form ngắn, lỗi nói cách sửa, hiện/ẩn mật khẩu, đăng nhập một lần (SSO).
status: beta
order: 4
keywords:
  - dang nhap
  - login
  - sign in
  - sso
  - mat khau
---

# Đăng nhập

Màn hình người dùng thấy nhiều nhất và muốn rời đi nhanh nhất. Mục tiêu: **đăng nhập được ngay lần đầu**, và khi sai thì biết sai ở đâu.

::example{template-login}

## Quyết định UX

- **Nhãn luôn hiển thị** phía trên ô nhập; placeholder chỉ là ví dụ định dạng (`ten@congty.vn`).
- **`autocomplete="username"` và `current-password`** để trình quản lý mật khẩu của Windows/Edge/Chrome điền tự động.
- **Nút hiện/ẩn mật khẩu** là `nxtIconButton` với `aria-pressed`, nhãn đổi theo trạng thái ("Hiện mật khẩu" / "Ẩn mật khẩu").
- **Lỗi từng trường** hiện khi bấm Đăng nhập, không hiện khi đang gõ.
- **Lỗi xác thực chung** dùng `role="alert"` và không nói rõ email hay mật khẩu sai (tránh dò tài khoản), nhưng gợi ý việc nên làm: kiểm tra Caps Lock, dùng "Quên mật khẩu?".
- **Nút đang xử lý** giữ nguyên kích thước và chặn bấm lặp (`loading`).
- **Đăng nhập bằng tài khoản Microsoft** là lựa chọn ngang hàng, đặt dưới form với nút secondary.
- **Panel thương hiệu** chỉ hiện khi đủ rộng (container query 900px); màn hẹp chỉ còn form.

## Components dùng

`nxt-form-field` + `nxtInput` (prefix/suffix) · `nxtButton` · `nxtIconButton` · `nxt-checkbox` · `nxt-icon`

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Email hoặc mật khẩu chưa đúng. Kiểm tra Caps Lock… | Đăng nhập thất bại |
| Email chưa đúng định dạng, ví dụ ten@congty.vn. | Email không hợp lệ |
| Đăng nhập bằng tài khoản Microsoft | SSO |

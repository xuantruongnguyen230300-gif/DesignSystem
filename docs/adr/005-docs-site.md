# ADR-005: Docs là app Angular tự dựng, không dùng Storybook

- **Trạng thái:** Đã áp dụng, chờ xác nhận
- **Ngày:** 2026-10-16

## Bối cảnh
Cần một nơi vừa là tài liệu cho người dùng (chọn đúng, dùng đúng), vừa là môi trường kiểm thử component (a11y, visual).

## Phương án
1. Storybook 10 (Angular) + MDX.
2. App Angular tự dựng (`apps/docs`), trong đó mỗi example là một component dùng làm fixture cho test.

## Quyết định
Chọn phương án 2.
- Docs dùng chính component và token của NXT, nên mọi lỗi UX của hệ thống lộ ra ngay trên docs.
- Nội dung là markdown tiếng Việt với directive `::example{}`, `::tokens{}`, `::api{}`. Bảng API và token **sinh từ source**, không viết tay.
- Mỗi example có trang riêng `/examples/<id>?color=&density=&brand=`. Playwright + axe chạy trên toàn bộ example ở 3 ngữ cảnh.
- Có `llms.txt` và markdown thô cho AI agent.

## Hệ quả
- Không có addon của Storybook (controls, interactions); bù lại bằng bộ chuyển màu/mật độ trên từng example.
- Docs đang là SPA. Khi cần SEO hoặc tải nhanh lần đầu thì bổ sung prerender (`@angular/ssr`).

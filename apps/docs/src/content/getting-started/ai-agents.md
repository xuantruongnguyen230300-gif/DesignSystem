---
title: Dùng với AI agent
description: Bộ skill nxt-* cho Claude Code, llms.txt và các công cụ kiểm tra giúp agent tạo UI đúng chuẩn.
order: 4
keywords:
  - ai
  - agent
  - claude
  - skill
  - llms
---

# Dùng với AI agent

NXT được thiết kế để AI agent làm việc **đúng chuẩn ngay từ đầu**, chứ không phải sửa sau. Có ba lớp hỗ trợ.

## 1. Skill cho Claude Code

Repo có sẵn bộ skill trong `.claude/skills/`. Mỗi skill là một quy trình có luật cứng và lệnh kiểm tra:

| Skill | Dùng khi |
|-------|----------|
| `nxt-tokens` | Thêm, sửa, đổi tên token |
| `nxt-theme` | Dựng brand cho một sản phẩm |
| `nxt-component-spec` | Viết đặc tả component trước khi code |
| `nxt-component-build` | Code component theo đặc tả |
| `nxt-pattern` | Ghép luồng nghiệp vụ: danh sách, form, phê duyệt… |
| `nxt-docs-page` | Viết trang tài liệu |
| `nxt-ui-review` | Review hoặc chỉnh lại giao diện |
| `nxt-a11y-audit` | Kiểm tra accessibility WCAG 2.2 AA |
| `nxt-release` | Phát hành phiên bản |
| `nxt-use` | Dựng màn hình trong repo **sản phẩm** |

Bộ skill được mô hình hoá theo các repo công khai như anthropics/skills, pbakaus/impeccable, ui-ux-pro-max và vercel-labs/agent-skills. Riêng phần nội dung được viết lại cho phần mềm nghiệp vụ dày dữ liệu.

## 2. Tài liệu máy đọc được

- [`/llms.txt`](/llms.txt): mục lục toàn bộ tài liệu, mỗi trang một dòng kèm câu "khi nào dùng".
- Mỗi trang có bản markdown thô tại cùng đường dẫn thêm `.md`, ví dụ [`/components/button.md`](/components/button.md).

## 3. Công cụ chặn sai sót

| Lệnh | Chặn |
|------|------|
| `npm run ds:tokens` | Token sai tầng, thiếu mode, brand thêm token, tương phản không đạt |
| `npm run ds:hardcoded` | Màu viết cứng (lỗi); px, z-index, font-family, `!important`, `::ng-deep` (cảnh báo) |
| `npm test` | Keyboard map và trạng thái của component |
| `npm run test:a11y` | Vi phạm axe ở mọi ví dụ × sáng/tối × mật độ |

Hook của Claude Code chạy `ds:hardcoded` ngay sau mỗi lần agent sửa file CSS, HTML hoặc TS trong `packages/` và `apps/`.

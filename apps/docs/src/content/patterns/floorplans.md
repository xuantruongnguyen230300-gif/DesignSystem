---
title: Chọn khuôn trang
description: Bắt đầu mọi màn hình ở đây — từ việc người dùng cần làm chọn ra khuôn trang (danh sách, hàng đợi việc, chi tiết đối tượng, nhiều bước, tổng quan), rồi mới tới template và component.
status: beta
order: 0
keywords:
  - khuon trang
  - floorplan
  - bo cuc trang
  - chon man hinh
  - list report
  - worklist
  - object page
  - wizard
  - overview
  - danh sach
  - hang doi
  - chi tiet
  - nhieu buoc
  - tong quan
  - danh sach chi tiet
---

# Chọn khuôn trang

Mỗi màn hình nghiệp vụ là một **khuôn trang** (floorplan): một cách điền cố định các vùng của trang cho một loại việc. Chọn khuôn **trước**, rồi mới chọn component. Hai sản phẩm làm cùng một loại việc thì dùng cùng một khuôn, nên người dùng chuyển phân hệ mà không phải học lại.

Mọi khuôn dựng trên cùng một khung (theo Dynamic Page của SAP Fiori): **hàng tiêu đề** trên topbar (`nxt-page-header placement="topbar"`, luôn hiện), **nội dung**, và khi cần, **thanh chân** dính đáy cho hành động kết thúc.

## Từ việc của người dùng tới khuôn

| Người dùng cần… | Khuôn NXT | Theo Fiori | Template NXT | Component chính |
|-----------------|-----------|-----------|--------------|-----------------|
| Tìm trong nhiều bản ghi rồi thao tác (sửa, xuất, thêm mới) | **Danh sách** | List Report | [Danh mục](/templates/catalog), danh sách của [Quy trình duyệt](/templates/workflow) | `nxt-search`, `nxt-filter`, `table[nxtTable]`, `nxt-pagination`, `NxtDrawer` |
| Xử lý lần lượt một tập việc đã định sẵn (đơn chờ duyệt) | **Hàng đợi việc** | Worklist | [Phê duyệt](/templates/approval) | `nxt-tabs` (tab lọc có số đếm), danh sách \| chi tiết, `nxt-timeline` |
| Xem, sửa, tạo **một** đối tượng có nhiều phần | **Chi tiết đối tượng** | Object Page | [Hồ sơ nhân viên](/templates/object), trình sửa của [Quy trình duyệt](/templates/workflow) | `nxt-object-page`, `dl[nxtDescriptions]`, `nxt-form-field` |
| Tạo / làm một việc dài hoặc lạ theo các bước (3–8 bước, có bước xem lại) | **Nhiều bước** | Wizard | Chưa có | Chưa có component bước (dùng `nxt-progress` + `nxt-dialog` tạm thời) |
| Nắm tình hình và việc cần làm theo vai trò | **Tổng quan** | Overview Page | [Tổng quan](/templates/dashboard) | `nxt-card`, `nxt-stat`, bảng / danh sách ngắn |

Các khuôn Fiori NXT chưa dùng: Analytical List Page (phân tích drill-down bằng biểu đồ + bảng) và Initial Page (một ô nhập mã để mở đúng một bản ghi). Khi cần, ghép từ Danh sách + biểu đồ, hoặc ô tìm kiếm toàn cục.

## Cây quyết định nhanh

1. Người dùng làm việc với **nhiều** bản ghi? → **Danh sách**. Tập việc đã định sẵn, xử lý lần lượt, ít cần lọc? → **Hàng đợi việc**.
2. Làm việc với **một** bản ghi:
   - Khoảng 8 trường trở xuống, một cột, không có bảng con → **drawer** (hoặc dialog) mở từ danh sách, không làm trang riêng.
   - Nhiều phần, có bảng con, có lịch sử → **Chi tiết đối tượng**.
   - Tạo mới mà phải dẫn qua nhiều bước, có rẽ nhánh → **Nhiều bước**.
3. Nắm tình hình, không thao tác sâu → **Tổng quan**, mỗi thẻ dẫn sang khuôn tương ứng.

## Luật

- **Không lồng khuôn.** Không nhét cả một khuôn vào vùng nội dung của khuôn khác: không đặt tiêu đề + thanh lọc của một danh sách vào giữa trang chi tiết, không đặt trang chi tiết thứ hai bên trong section. Bảng con trong trang chi tiết là **bảng**, không phải một trang danh sách thu nhỏ: quá dài thì "Xem tất cả (x)" mở trang danh sách riêng.
- **Một hàng tiêu đề mỗi trang**, luôn ở topbar. Không lặp tiêu đề trang trong nội dung; nội dung chỉ chứa phần riêng của khuôn (tóm tắt, tab, thanh công cụ).
- **Hành động kết thúc** (Lưu, Tạo, Gửi duyệt, Duyệt / Từ chối) nằm ở thanh chân dính đáy của khuôn, hoặc ở chân drawer / dialog. Topbar chỉ giữ hành động không kết thúc (Sửa, Xuất, ⋯).
- **Đặt tên khuôn thống nhất** trong SPEC, template và trao đổi: Danh sách, Hàng đợi việc, Chi tiết đối tượng, Nhiều bước, Tổng quan.
- **Focus ban đầu theo khuôn**: danh sách → ô tìm kiếm (hoặc bảng khi mở từ link đã lọc); hàng đợi → tab / mục đầu; chi tiết xem → tiêu đề trang; sửa / tạo → trường bắt buộc còn trống đầu tiên; nhiều bước → control đầu của bước.

## Toàn màn hình hay danh sách | chi tiết

| | Toàn màn hình | Danh sách \| chi tiết |
|--|---------------|----------------------|
| Mỗi lúc thấy | Một trang | Danh sách bên trái, chi tiết bên phải (tối đa 2 cột) |
| Hợp khi | Bản ghi nhiều phần, sửa lâu; người dùng đi sâu vào một bản ghi | Duyệt lần lượt nhiều bản ghi, mỗi bản ghi xem nhanh rồi quyết định |
| Ví dụ NXT | [Hồ sơ nhân viên](/templates/object), [Danh mục](/templates/catalog) (drawer) | [Phê duyệt](/templates/approval) |
| Lưu ý | Mở từ danh sách thì có nút quay lại và bản ghi trước / sau | Không để cột chi tiết trống; xử lý xong tự sang mục kế; dưới 1024px xếp chồng |

Chọn **một** cách cho cả ứng dụng ở mỗi loại việc, không đổi qua lại giữa các phân hệ.

## Drawer, dialog hay trang riêng

| Nội dung | Dùng |
|---------|------|
| Xem nhanh / sửa bản ghi phẳng, khoảng 8 trường trở xuống | [Drawer](/components/drawer) mở từ danh sách |
| Một câu hỏi, một quyết định, form rất ngắn | [Dialog](/components/dialog) |
| Bản ghi nhiều phần, có bảng con, cần link chia sẻ được | Trang riêng theo khuôn Chi tiết đối tượng |

## Components dùng

[Page header](/components/page-header) · [Object page](/components/object-page) · [Table](/components/table) · [Filter](/components/filter) · [Search](/components/search) · [Tabs](/components/tabs) · [Drawer](/components/drawer) · [Dialog](/components/dialog) · [Card](/components/card) · [App shell](/components/app-shell)

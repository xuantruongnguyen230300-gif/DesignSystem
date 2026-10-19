# Catalog pattern NXT (register Operate)

## Mục lục
1. List page (CRUD)
2. Lọc & tìm kiếm
3. Bulk action
4. Master-detail
5. Form & validation
6. Quy trình phê duyệt
7. Dashboard vận hành
8. Import / Export
9. Trạng thái hệ thống (empty / error / permission)
10. App shell & điều hướng

---

## 1. List page (CRUD)
- **Anatomy:**
  - Page header: breadcrumb, tiêu đề + mô tả. **Không** đặt nút hành động của danh sách (Thêm mới, Nhập, Xuất) trên header.
  - Tab (khi một nhóm danh mục/phạm vi dùng chung màn): ngay dưới tiêu đề, **trên** toolbar; tab không vừa dồn vào "Xem thêm". Quá ~7 tab thì tách mục trong menu trái.
  - Thanh công cụ ngay trên bảng: trái `nxt-search` + `nxt-filter` ("Bộ lọc"), không đặt select/segmented lọc nhanh; phải: nút icon "Nhập … từ Excel" (`file-upload`), "Xuất … ra Excel" (`file-download`) có tooltip, vạch ngăn, nút primary **"Thêm mới"** ngoài cùng (`aria-label="Thêm mới <đối tượng>"`). Màn hẹp thì nhóm nút xuống dòng; ô tìm và Thêm mới không bao giờ ẩn. Chọn hàng thì thanh hàng loạt thay thanh công cụ.
  - Bảng.
  - Phân trang hoặc virtual scroll.
- Hành động trên từng dòng: tối đa 2 nút hiện sẵn, phần còn lại vào menu `⋯`. Hành động phá huỷ luôn nằm cuối menu và có màu danger.
- Trạng thái bảng (filter, sort, page, cột) nằm trên URL query. Bấm Back phải trả về đúng trạng thái.
- Header bảng sticky; cột định danh (mã, tên) sticky trái khi cuộn ngang.
- Ô số căn phải, dùng `tabular-nums`; ô trạng thái dùng tag gồm icon và text.
- Bấm vào dòng (hoặc nút tên trong ô tiêu đề hàng) mở drawer xem chi tiết chỉ đọc; checkbox chỉ để chọn. Drawer có bản ghi trước/sau (Alt+↑/↓) theo thứ tự đang xem, "Sửa" mở form. Bản ghi phức tạp mở trang chi tiết.
- Lưới lấp đầy màn hình: `nxtFill` → `nxt-card fill` → `nxt-table-scroll fill`; chỉ lưới cuộn (dọc, ngang), header bảng dính, thanh công cụ và phân trang đứng yên.

## 2. Lọc & tìm kiếm
- Tìm kiếm không phân biệt dấu (`nxtMatches`), áp dụng ngay với dữ liệu tại máy, `debounce` ~250ms khi gọi máy chủ. Esc xoá nội dung. Phím tắt một ký tự (như `/`) chỉ thêm khi tắt được (WCAG 2.1.4).
- Bộ lọc đang áp dụng hiện thành chip dưới toolbar (`nxt-filter-chips`), cuối hàng "Xoá bộ lọc" (không ghi "Xoá tất cả": dễ hiểu nhầm là xoá dữ liệu). Số kết quả đọc qua `role="status"`.
- **Mọi** tiêu chí lọc nằm trong panel của `nxt-filter`, áp dụng bằng "Áp dụng" (Enter); Esc/Huỷ không áp dụng. Không trộn lọc áp dụng ngay với lọc có nút Áp dụng. Trên ~8 trường hoặc điều kiện lồng nhau: drawer lọc nâng cao.
- Lọc ra 0 kết quả thì hiện empty state "Không có kết quả phù hợp" kèm nút xoá lọc. Không dùng chung empty state lần đầu.
- Cho phép lưu bộ lọc (saved view) với danh sách hay dùng.

## 3. Bulk action
- Chọn ≥ 1 dòng thì action bar thay thế toolbar (hoặc nổi ở đáy), hiện "Đã chọn 12" và các hành động áp dụng được.
- Hỗ trợ "Chọn tất cả 1.284 kết quả", không chỉ trang hiện tại. Luôn ghi rõ phạm vi được chọn.
- Shift+click (hoặc Shift+Space) trên checkbox chọn cả dải từ hàng vừa chọn, như Gmail/Windows Explorer: `NxtSelection.select(key, checked, { range: shiftKey, order })` với `nxt-checkbox (toggled)`.
- Hoàn tác thay cho hộp xác nhận với thao tác đảo ngược được; bản ghi đang được dùng không xoá được (khoá kèm lý do, gợi ý "Ngừng sử dụng").
- Hành động phá huỷ hàng loạt dùng dialog xác nhận ghi số lượng và đối tượng. Từ 50 mục trở lên thì yêu cầu gõ xác nhận.
- Kết quả hiện bằng tóm tắt: thành công / thất bại, kèm danh sách lỗi tải về được.

## 4. Master-detail
- Màn rộng (≥ xl): danh sách bên trái và chi tiết bên phải, có splitter kéo được. Màn hẹp: chi tiết mở thành trang hoặc drawer.
- `↑↓` chuyển bản ghi trong danh sách thì chi tiết cập nhật. Đang có thay đổi chưa lưu thì hỏi trước khi chuyển.
- Mỗi bản ghi chi tiết có URL riêng để chia sẻ được.

## 5. Form & validation
- **Label:**
  - Label nằm trên field (mặc định).
  - Label bên trái chỉ dùng cho form xem/sửa nhanh có ≤ 8 field.
  - Field bắt buộc đánh dấu `*` kèm chú thích; nếu đa số field bắt buộc thì đánh dấu "(không bắt buộc)" cho phần còn lại.
- **Bố cục:**
  - Form dài chia section có tiêu đề. Từ 3 section trở lên thì có mục lục (anchor) dạng sticky.
  - Tối đa 2 cột ở desktop, 1 cột ở mobile (container query).
- **Validation:**
  - Validate khi blur và khi submit, không validate khi đang gõ.
  - Submit lỗi thì focus field lỗi đầu tiên; form dài thêm tóm tắt lỗi.
- **Hành động:**
  - Footer sticky: "Lưu" (primary) và "Huỷ".
  - Phím `Ctrl+S` lưu.
  - Có thay đổi chưa lưu thì cảnh báo khi rời trang.
- **Field đặc thù Việt Nam:**
  - Tiền: `1.250.000 ₫`, gõ được "1250000".
  - Ngày: `dd/MM/yyyy`, gõ được "311226".
  - Số điện thoại: `0912 345 678`.
  - CCCD: 12 số.
  - Mã số thuế: 10 hoặc 13 số.

## 6. Quy trình phê duyệt
- Trạng thái quy trình hiện bằng stepper hoặc timeline: ai, khi nào, ý kiến gì.
- Hành động của người duyệt (Duyệt / Từ chối / Trả lại) đặt cố định ở footer. "Từ chối" và "Trả lại" bắt buộc nhập lý do.
- Có hàng đợi "Chờ tôi duyệt" kèm bulk approve cho các mục cùng loại.
- Sau khi thao tác thì tự chuyển sang mục kế tiếp trong hàng đợi (có thể tắt).

## 7. Dashboard vận hành
- Phần đầu là việc cần làm ("12 hợp đồng sắp hết hạn"), không phải hero metric.
- Stat strip gọn: giá trị, so sánh kỳ trước và đơn vị. Mỗi stat bấm vào được để mở danh sách đã lọc.
- Chart dùng `semantic.color.data.*`, luôn có tiêu đề, đơn vị và bảng dữ liệu thay thế cho screen reader.
- Mỗi widget có loading và error riêng; một widget lỗi không làm hỏng cả trang.

## 8. Import / Export
- Import trong drawer, hai bước: (1) tải file mẫu + kéo-thả/chọn file, báo ngay sai định dạng/thiếu cột; (2) "N dòng hợp lệ · M dòng lỗi" + bảng lỗi (dòng, cột, cách sửa), "Nhập N dòng" nhập phần hợp lệ. Kết quả ở `role="status"` kèm Hoàn tác.
- Lỗi chỉ rõ dòng, cột và cách sửa. Cho tải về file lỗi.
- Export xuất đúng phạm vi đang xem (tìm kiếm + bộ lọc, mọi trang); tooltip ghi số lượng ("Xuất 7 chức danh đang lọc ra Excel"); đang chọn hàng thì "Xuất N" ở thanh hàng loạt. Export lớn chạy nền, báo khi xong.

## 9. Trạng thái hệ thống
| Trạng thái | Nội dung bắt buộc |
|-----------|-------------------|
| Empty lần đầu | Giải thích đối tượng là gì, kèm hành động tạo đầu tiên và link hướng dẫn |
| Empty do lọc | "Không có kết quả phù hợp" + nút xoá lọc |
| Error tải dữ liệu | Nguyên nhân dễ hiểu, nút "Thử lại", mã lỗi ở dạng phụ (copy được) |
| No permission | Ai có quyền, cách xin quyền; không ẩn trang khiến người dùng tưởng lỗi |
| Partial | Đánh dấu phần thiếu dữ liệu, không hiển thị "0" giả |
| Stale / offline | Thời điểm cập nhật cuối, nút làm mới |

## 10. App shell & điều hướng
- Người dùng đăng nhập chỉ hiện **một lần**: avatar + menu tài khoản ở góc phải topbar. Không lặp ở chân sidenav.
- Sidebar có hai trạng thái, mở 256px và thu gọn 72px (`semantic.layout.*`). Người dùng chọn trạng thái và hệ thống ghi nhớ.
- Tối đa 2 cấp menu. Cấp thứ 3 chuyển thành tab trong trang.
- Command palette `Ctrl+K`: tìm trang, bản ghi gần đây, hành động.
- Breadcrumb cho trang từ cấp 2 trở xuống. Tiêu đề tab trình duyệt có dạng "<Trang> · <Sản phẩm>".
- Chuyển sản phẩm (đa sản phẩm) đặt ở góc trên trái, giữ nguyên ngữ cảnh tổ chức/công ty đang chọn.

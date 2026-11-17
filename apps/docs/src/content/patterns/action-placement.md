---
title: Vị trí hành động
description: Mỗi loại hành động nằm ở đâu (topbar, page header, thanh công cụ của bảng, hàng, action bar, footer drawer/dialog), theo thứ tự nào và kiểu nút gì; một primary cho cả trang.
status: beta
order: 6
keywords:
  - vi tri hanh dong
  - action placement
  - thu tu nut
  - nut primary
  - footer
  - action bar
  - toolbar
  - an nut
  - disable
---

# Vị trí hành động

Người dùng tìm nút ở chỗ quen thuộc. Khi mọi phân hệ đặt "Lưu" ở cùng một chỗ, cùng một thứ tự, họ bấm mà không phải nhìn. Trang này gom các luật trước đây rải ở Button, Dialog, Drawer, Page header và Trang danh sách vào **một bảng**.

Hai nguyên tắc (theo SAP Fiori, phần action placement):

1. **Hành động nằm gần thứ nó tác động.** Hành động của bản ghi ở đầu trang cạnh tiêu đề; hành động kết thúc quy trình (Lưu, Gửi duyệt) ở cuối, sau khi người dùng đã xem/nhập xong; hành động của một bảng ở thanh công cụ của bảng đó; hành động của một trường ở cạnh trường.
2. **Hành động căn phải, điều hướng bên trái.** Breadcrumb, nút quay lại, tab ở đầu dòng; nút hành động dồn về cuối dòng.

::example{action-bar-states}

## Vùng → hành động → thứ tự → kiểu nút

| Vùng | Hành động gì | Thứ tự (trái → phải) | Kiểu nút |
|------|--------------|----------------------|----------|
| Thanh trên cùng (topbar) | Toàn ứng dụng: trợ giúp, thông báo, tài khoản | Trợ giúp · Thông báo · Tài khoản | Nút icon `ghost` + tooltip |
| Page header, **trang danh sách** | Không có nút | — | — |
| Page header, **trang chi tiết** (chế độ xem) | Hành động của bản ghi, **không kết thúc**: Sửa, Nhân bản, Xuất, Xoá | Menu ⋯ (Nhân bản, Xuất, Xoá) · **Sửa** | Phụ `secondary`/`ghost`, ⋯ là `ghost`; "Sửa" `primary` khi trang không có primary khác |
| Thanh công cụ của bảng (trang danh sách) | Tìm, lọc, nhập/xuất, tạo | Tìm kiếm · Bộ lọc · (khoảng trống) · Nhập · Xuất · vạch · **Thêm mới** | Nhập/Xuất: nút icon + tooltip; "Thêm mới" `primary` |
| Thanh thao tác hàng loạt ("Đã chọn N") | Trên các hàng đã chọn | Đã chọn N · Chọn tất cả N · (khoảng trống) · hành động phụ · Xuất N · Xoá N · Bỏ chọn | `secondary`; xoá là `danger` ("Xoá 3"); "Bỏ chọn" `ghost`; không có `primary` |
| Hàng của bảng | Tối đa **một** hành động hiện trực tiếp + menu ⋯ | Sửa · ⋯ ở mép phải hàng | Nút `ghost` `sm`, chỉ icon (có tooltip) **hoặc** chỉ chữ |
| Cạnh một trường | Chỉ tác động trường đó: Sao chép, Tạo mã, Xem lịch sử | Ngay sau trường | `ghost` `sm` hoặc nút icon |
| Thanh toolbar của khối/bảng con trong trang sửa | Thêm dòng, Xoá dòng đã chọn | Phụ trước, "Thêm" cuối | `secondary`/`ghost`: trang đã có primary ở action bar |
| [Action bar](/components/action-bar) (trang **sửa/tạo**) | Hành động **kết thúc**: Lưu, Lưu nháp, Gửi duyệt, Áp dụng, Huỷ | Nút thông báo (trái) · trạng thái · phụ · **Huỷ** · **primary cuối** | Một `primary`; "Huỷ" `ghost` |
| Thanh quyết định (trang duyệt) | Duyệt, Trả lại, Từ chối | Từ chối · Trả lại · **Duyệt đơn** | "Duyệt đơn" `primary` cuối; còn lại `secondary` |
| Footer [Drawer](/components/drawer) / [Dialog](/components/dialog) | Kết thúc nội dung trong lớp phủ | Lựa chọn thứ ba (trái) · · · **Huỷ** · **primary cuối** | Một `primary` (hoặc `danger`); "Huỷ" `ghost`; chỉ có "Đóng" thì `secondary` |
| Footer [Popover](/components/popover) | Xác nhận nhanh | Huỷ (nếu có) · hành động cuối | `primary` hoặc `danger` `sm` |

## Một primary cho cả trang

- Tính **chung** page header, thanh công cụ, các khối và action bar: cả trang chỉ có **một** nút `primary`.
- Trang sửa/tạo: primary nằm ở action bar ("Lưu", "Lưu và gửi duyệt"). Nút "Thêm dòng" của bảng con hạ xuống `secondary`/`ghost`.
- Trang chi tiết ở chế độ xem: primary là "Sửa" trên page header (nếu có).
- Có cặp quyết định (Duyệt / Từ chối): chỉ "Duyệt" là primary, "Từ chối" là `secondary` (không đỏ: từ chối không phá huỷ dữ liệu).
- `danger` thay chỗ primary cho hành động phá huỷ; không có cả primary lẫn danger trong cùng một nhóm.

## Hành động kết thúc ở đâu

Hành động kết thúc (Lưu, Áp dụng, Gửi duyệt, Huỷ) **luôn ở action bar dính đáy**, không ở page header. Lý do: dưới 1024px page header về lại trong trang và cuộn mất, còn action bar luôn thấy; người dùng xem/nhập xong rồi mới kết thúc, nên nút ở cuối đúng hướng đọc. Page header chỉ giữ hành động không kết thúc (Sửa, Xuất, ⋯).

## Ẩn hay khoá (disable)

| Lý do không dùng được | Làm gì |
|------------------------|--------|
| **Thiếu quyền** (người dùng không bao giờ làm được) | **Ẩn** nút. Không hiện thứ người dùng không thể dùng |
| **Sai trạng thái** (làm được khi trạng thái đổi: đơn đã duyệt, chưa chọn hàng, bản ghi đang được dùng) | **Khoá** (`disabled`, vẫn focus được) **kèm lý do**: tooltip hoặc chữ gần nút ("Chức danh đang được dùng ở 4 hồ sơ") |
| Tính năng đang tắt cho cả sản phẩm | Ẩn |
| Hành động hàng loạt không áp được cho mục nào đã chọn | Khoá + lý do ("Các chức danh đã chọn đều đang ngừng sử dụng") |
| Áp được cho một phần | Bật; khi chạy thì làm phần làm được và báo rõ phần còn lại |

Nút khoá dùng `aria-disabled`, nên vẫn nhận focus và đọc được lý do.

## Thứ tự trong nhóm

- Trong một nhóm nút căn phải: **hành động quan trọng nhất ngoài cùng bên phải**, đường lui ("Huỷ") ngay bên trái nó, lựa chọn thứ ba khác loại dạt hẳn sang trái.
- Thiếu chỗ: hành động phụ lần lượt dồn vào menu ⋯ theo độ ưu tiên (ít dùng vào trước). **Primary không bao giờ vào menu.**
- Xoá đứng cuối menu ⋯, có `tone="danger"`.

### Khác SAP Fiori có chủ đích

SAP Fiori đặt nút nhấn mạnh **đầu** nhóm (bên trái) và "Huỷ" ở cuối. NXT giữ **primary cuối** vì:

- khớp quy ước Windows, Microsoft 365 và các form HRM người dùng đã quen (OK/Lưu ở góc dưới phải);
- khớp chính Fiori ở footer wizard (bước tiếp ở bên phải);
- một luật cho mọi vùng: footer dialog, drawer, popover, action bar, thanh công cụ.

Sản phẩm dựng bằng thư viện khác (PrimeNG, Material…) **theo thứ tự NXT**, không trộn hai kiểu trong cùng một sản phẩm.

## Kiểu nút

| Kiểu | Khi nào | Không dùng khi |
|------|---------|----------------|
| `primary` | Hành động chính của trang (một) | Có hai hành động ngang hàng |
| `secondary` | Hành động phụ, cặp quyết định phía tiêu cực, "Đóng" một mình | Đây là hành động chính |
| `ghost` | "Huỷ", hành động ít quan trọng, nút trên hàng, nút icon | Đứng một mình dễ lẫn với chữ |
| `danger` | Phá huỷ, ghi rõ đối tượng: "Xoá 3 chức danh" | Từ chối đơn (không phá huỷ) |
| Toggle (`pressed`) | Bật/tắt chế độ xem trên thanh công cụ | Cài đặt (dùng switch), lựa chọn cần Lưu (checkbox) |
| Nút icon | Hành động quen thuộc, chỗ hẹp; luôn có `aria-label` + tooltip | Hành động kết thúc, hành động nghiệp vụ chính (luôn có chữ) |

## Trạng thái

| Trạng thái | Vị trí hành động |
|------------|------------------|
| Trang chi tiết, xem | Page header: Sửa + ⋯; không có action bar |
| Trang chi tiết, sửa / tạo | Page header: không có Sửa; action bar: Huỷ · Lưu |
| Đang chọn hàng | Thanh "Đã chọn N" thay thanh công cụ |
| Đang lưu | Nút Lưu `loading`; các nút khác vẫn hiện, "Huỷ" khoá |
| Không có quyền sửa | Ẩn Sửa, Xoá; trang chỉ xem |

## Phím tắt

| Phím | Làm gì |
|------|--------|
| <kbd>Tab</kbd> | Thứ tự Tab trùng thứ tự nhìn (trái → phải, trên → dưới); action bar ở cuối trang |
| <kbd>Enter</kbd> trong ô nhập của form | Gửi form (nút Lưu `type="submit"` + `form`) |
| <kbd>Esc</kbd> | Đóng lớp phủ (hỏi trước nếu còn thay đổi chưa lưu) |

## Responsive

- Nhóm nút xuống dòng, vẫn căn phải; không thu nhỏ chữ, không cắt nhãn.
- Ô tìm kiếm và "Thêm mới" không bao giờ bị ẩn; Nhập/Xuất có thể vào menu ⋯.
- Dưới 1024px: hành động kết thúc ở action bar (page header cuộn mất).

## Components dùng

`nxtButton` / `nxtIconButton` (`variant`, `pressed`) · `nxt-page-header` (`[nxtPageActions]`) · `nxt-action-bar` · `nxtMenuTriggerFor` · `NxtDrawer` / `NxtDialog` (footer) · `nxt-popover` · `nxtTooltip` · `td[nxtRowActions]`

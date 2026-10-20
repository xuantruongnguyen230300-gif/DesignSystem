---
title: Search
description: Ô tìm kiếm cho danh sách và panel chọn — gõ có dấu hay không dấu đều tìm được, Esc xoá nội dung, có debounce khi mỗi lần gõ gọi máy chủ.
status: beta
group: Nhập liệu
order: 7
package: "@nxt/ui/search"
keywords:
  - tim kiem
  - o tim kiem
  - search
  - tim nhanh
  - khong dau
  - bo dau
  - loc danh sach
  - debounce
---

# Search

## Khi nào dùng

- Ô tìm kiếm trên toolbar của trang danh sách hoặc danh mục: "Tìm chức danh", "Tìm nhân viên".
- Ô tìm trong panel chọn: chọn nhân viên, chọn phòng ban trong drawer.
- Ô tìm trong thư viện có nhiều mục: icon, mẫu biểu, báo cáo.

## Khi nào không dùng

- **Tìm toàn hệ thống** (trang, bản ghi gần đây, hành động): dùng command palette <kbd>Ctrl</kbd>+<kbd>K</kbd> trên header ứng dụng (đang có trong [Roadmap](/roadmap), chưa có component).
- **Trường nhập liệu có giá trị được lưu** (mã, tên, ghi chú): dùng [Form field](/components/form-field) với `nxtInput`.
- **Chọn một giá trị từ danh sách gợi ý để lưu vào form**: cần combobox (chưa có trong NXT).
- **Thu hẹp danh sách theo tiêu chí có sẵn** (trạng thái, phòng ban): dùng [Filter](/components/filter) đặt ngay cạnh ô tìm kiếm.

## Ô tìm kiếm

`label` là bắt buộc và là tên truy cập của ô; mặc định nhãn bị ẩn bằng `nxt-visually-hidden` vì icon kính lúp và vị trí trên toolbar đã đủ rõ với người nhìn. Trong form hoặc panel có nhiều trường, bật `showLabel` để nhãn hiện phía trên.

::example{search-basic}

- **Placeholder nói tìm theo gì**: "Mã, họ tên hoặc email", không chỉ "Tìm kiếm". Placeholder biến mất khi gõ, nên không đặt thông tin bắt buộc phải nhớ vào đó.
- **Nút xoá** chỉ hiện khi ô có nội dung. Nút không nằm trong thứ tự Tab (`tabindex="-1"`): người dùng bàn phím xoá bằng <kbd>Esc</kbd>, nên ô tìm kiếm chỉ là một điểm dừng Tab. Chuột và cảm ứng vẫn bấm được.
- **<kbd>Esc</kbd>** xoá nội dung và giữ focus trong ô. Khi ô đã trống, Esc không bị chặn, để nó đóng drawer hoặc panel đang chứa ô tìm kiếm.
- `value` là two-way (`[(value)]`). Đặt `value` từ ngoài (ví dụ nút "Xoá tìm kiếm và bộ lọc") thì ô cập nhật theo.
- `size="md"` (mặc định) cho toolbar; `size="sm"` cho panel lọc, menu, bảng nhỏ trong drawer. Bề rộng do layout cha quyết định: trên toolbar ô co giãn, tối thiểu `layout.item-min-sm`.

## Lọc danh sách tại máy

Dữ liệu đã có sẵn ở trình duyệt (vài trăm dòng trở xuống) thì lọc ngay khi gõ, `debounce` để mặc định là `0`. Dùng hàm `nxtMatches(query, ...fields)` đi kèm:

- **Không phân biệt dấu và hoa thường**: "nguyen van" tìm ra "Nguyễn Văn An"; "duc" tìm ra "Hoàng Văn Đức" (`đ` được coi là `d`). Người dùng chưa bật bộ gõ tiếng Việt vẫn tìm được.
- **Mọi từ đều phải khớp, thứ tự tuỳ ý**, trong ít nhất một field: "ke toan" khớp phòng "Kế toán", "an nguyen" vẫn khớp "Nguyễn Văn An".
- Mỗi từ khớp theo **chuỗi con**, nên "van" khớp cả "Văn" và "Vân". Với tìm kiếm trên danh sách, tìm thừa một chút tốt hơn bỏ sót.
- Query rỗng khớp mọi dòng, nên không cần nhánh riêng cho trường hợp chưa gõ.

::example{search-list}

- Thông báo **số kết quả** ở một phần tử `role="status"` của trang ("Tìm thấy 4 / 15 nhân viên"). Component không tự thông báo, vì chỉ trang biết số kết quả.
- Khi không có kết quả, dùng [Empty state](/components/empty-state) nói cách thử lại và có nút "Xoá tìm kiếm". Nút biến mất cùng empty state, nên gọi `focus()` của `nxt-search` để focus không rơi về đầu trang.
- `nxtFold(text)` trả về chữ thường đã bỏ dấu ("Nguyễn Đức" → "nguyen duc"), dùng khi cần tự so khớp hoặc tạo khoá sắp xếp.

## Tìm trên máy chủ

Khi mỗi lần tìm phải gọi API, đặt `debounce="250"`: `value` (và `valueChange`) chỉ cập nhật sau khi người dùng ngừng gõ 250 ms, nên gõ "ke toan" chỉ gửi một yêu cầu thay vì bảy.

::example{search-debounce}

- **<kbd>Enter</kbd>** phát `submitted` và cập nhật `value` ngay, không chờ hết debounce. Dùng `submitted` khi máy chủ chậm tới mức chỉ nên tìm khi người dùng bấm Enter. Nếu nghe cả `valueChange` lẫn `submitted` như ví dụ, bỏ qua lần gọi lặp lại cùng một từ khoá.
- **Huỷ yêu cầu cũ** khi có từ khoá mới (`switchMap` nếu dùng RxJS), để kết quả của từ khoá cũ không về sau và đè lên kết quả mới.
- Báo "Đang tìm…" và kết quả ở cùng một vùng `role="status"`. Không đặt `aria-busy` lên vùng này: một số screen reader sẽ không đọc gì cho tới khi hết busy.
- Huỷ timer và subscription khi component bị huỷ (`DestroyRef`).

## Accessibility

| Phím | Hành vi |
|------|---------|
| Gõ | Lọc theo `debounce` |
| <kbd>Esc</kbd> | Có nội dung: xoá nội dung, giữ focus. Không có nội dung: không chặn, để Esc đóng drawer/panel bao quanh |
| <kbd>Enter</kbd> | Phát `submitted` |
| <kbd>Tab</kbd> | Nút xoá **không** nằm trong thứ tự Tab: Esc làm cùng việc, ô tìm kiếm giữ một điểm dừng Tab |

- `input type="search"` native có `<label for>` thật; không thêm `role="searchbox"` vì native đã có.
- Icon kính lúp có `aria-hidden`. Nút xoá có tên "Xoá nội dung tìm kiếm" và vùng chạm ≥ 24×24px ở mọi mật độ.
- Nút xoá mặc định của trình duyệt bị ẩn, để chỉ có một nút xoá nhất quán ở mọi trình duyệt.
- Khung ô có viền `border.input` (≥ 3:1 với nền) và vòng focus `focus.ring.*` khi ô được focus.
- Bọc toolbar trong landmark `search` (`<search>` hoặc `role="search"`) là quyết định của trang, khi trang có một vùng tìm kiếm chính. Component không tự thêm landmark, vì một trang có thể có nhiều ô tìm kiếm nhỏ.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| `label="Tìm chức danh"` (động từ + đối tượng) | `label="Search"`, hoặc không có nhãn |
| Placeholder "Mã hoặc tên chức danh" | Placeholder "Tìm kiếm..." khi còn chỗ để nói rõ hơn |
| Tìm thấy 4 chức danh | Có 4 kết quả được tìm thấy |
| Không có chức danh khớp "kế toán". Thử gõ ít chữ hơn. | Không có dữ liệu |

## API

::api{search}

| Hàm | Mô tả |
|-----|-------|
| `nxtFold(text: string): string` | Chữ thường, bỏ dấu tiếng Việt, `đ` → `d` |
| `nxtMatches(query: string, ...fields): boolean` | Mọi từ của `query` có trong ít nhất một field, không phân biệt dấu, thứ tự tuỳ ý. Field `null`, `undefined`, `''` bị bỏ qua; số được đổi sang chuỗi |
| `focus()` (method của `NxtSearch`) | Đưa focus vào ô, ví dụ sau khi xoá bộ lọc làm mất nút đang focus |

## Token

::tokens{component.search}

## Changelog

- **0.1.0**: phát hành beta: `nxt-search` với `label` bắt buộc, `showLabel`, `size`, `debounce`, model `value`, output `submitted`, nút xoá và Esc; hàm `nxtFold`, `nxtMatches` tìm không dấu.

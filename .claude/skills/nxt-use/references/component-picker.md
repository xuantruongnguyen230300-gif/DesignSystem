# Cần gì → dùng gì

Tên component theo kế hoạch trong docs/PLAN.md. Component chưa phát hành có status `draft` trên docs.

| Cần | Dùng | Không dùng |
|-----|------|-----------|
| Thực hiện hành động | `button[nxtButton]` (primary, secondary, ghost, danger) | Link giả làm nút; `div (click)` |
| Hành động chỉ có icon | `button[nxtIconButton]` + `aria-label` + tooltip | Icon trần có `(click)` |
| Điều hướng sang trang khác | `a[nxtLink]` / `a[nxtButton]` | `button` + `router.navigate` |
| Chọn 1 trong ≤ 5 lựa chọn, nhìn thấy hết | `nxt-radio-group` hoặc `nxt-segmented` (đổi chế độ xem) | Select |
| Chọn 1 trong nhiều lựa chọn | `nxt-select`; có tìm kiếm khi > 10 mục | Radio dài |
| Chọn nhiều | `nxt-select multiple`, `nxt-checkbox-group` (≤ 7 mục) | Nhiều select lẻ |
| Gợi ý khi gõ (nhân viên, đơn vị) | `nxt-combobox` (async, không phân biệt dấu) | Select tải toàn bộ danh sách |
| Bật/tắt có hiệu lực ngay | `nxt-switch` | Checkbox (dùng khi cần bấm Lưu) |
| Ngày / khoảng ngày | `nxt-date-picker` / `nxt-date-range-picker` | Input text tự parse |
| Số tiền | `nxt-number-input format="currency"` | Input text |
| Chọn trong cây (đơn vị, phòng ban) | `nxt-tree-select` | Cascader nhiều cấp |
| Danh sách dữ liệu dạng bảng | `nxt-table` (sort, chọn, sticky, virtual) | Tự dựng bảng HTML có style riêng |
| Phân tích dữ liệu nặng (pivot, group) | Adapter lưới nâng cao (xem ADR-002) | `nxt-table` cố gánh pivot |
| Thông tin dạng cặp nhãn–giá trị | `nxt-description-list` | Bảng 2 cột |
| Trạng thái của bản ghi | `nxt-status-tag` (icon + text) | Chấm màu trần |
| Thông báo trong ngữ cảnh | `nxt-alert` (inline) | Toast cho lỗi cần xử lý |
| Phản hồi sau thao tác | `NxtToast` service, có undo | Alert chặn màn hình |
| Xác nhận thao tác phá huỷ | `NxtConfirm` dialog ghi rõ đối tượng | `window.confirm` |
| Nội dung phụ, không rời trang | `nxt-drawer` | Modal chồng modal |
| Tác vụ ngắn, chặn | `nxt-dialog` | Trang mới |
| Gợi ý ngắn khi hover/focus | `nxt-tooltip` | `title` attribute |
| Nội dung tương tác khi bấm | `nxt-popover` | Tooltip chứa nút |
| Chia nội dung cùng cấp | `nxt-tabs` | Nhiều trang con |
| Quy trình nhiều bước | `nxt-steps` | Tabs |
| Đang tải | `nxt-skeleton` (khối), `nxt-spinner` (nút, vùng nhỏ) | Spinner toàn trang |
| Không có dữ liệu | `nxt-empty-state` (lần đầu / do lọc) | Text "Không có dữ liệu" trần |
| Bố cục | `nxt-stack`, `nxt-inline`, `nxt-grid`, `nxt-page` | Margin tay giữa phần tử |

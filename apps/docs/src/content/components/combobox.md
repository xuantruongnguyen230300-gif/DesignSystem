---
title: Combobox
description: Chọn một hoặc nhiều giá trị trong danh sách 13–200 mục bằng cách gõ vài chữ, có dấu hay không dấu, theo tên hoặc mã; lưu khoá, chặn giá trị tự nhập, chạy trong nxt-form-field và Angular forms.
status: beta
group: Nhập liệu
order: 9
package: "@nxt/ui/combobox"
keywords:
  - combobox
  - chon gia tri
  - danh sach chon
  - autocomplete
  - goi y
  - dropdown co tim kiem
  - select co tim kiem
  - chon nhieu
  - multi select
  - token
  - phong ban
  - ky nang
  - khong dau
---

# Combobox

`nxt-combobox` là ô chọn giá trị có gõ để lọc (WAI-ARIA combobox, list autocomplete). Người dùng gõ "ke toan" hoặc "kt01", thấy "Phòng Kế toán" nổi lên đầu danh sách, nhấn <kbd>Enter</kbd>. Giá trị lưu là **khoá** (`KT`), không phải chữ đã gõ. Chế độ `multiple` cho chọn nhiều, mỗi giá trị là một token bỏ được.

## Khi nào dùng

- Chọn **một** mục trong 13–200 mục mà người dùng nhận ra bằng tên, có thể kèm mã: phòng ban, chức danh, chi nhánh, loại hợp đồng.
- Chọn **nhiều** mục trong danh sách định sẵn và muốn thấy lựa chọn ngay trong ô: kỹ năng, phòng ban áp dụng chính sách.
- Danh sách lớn hơn nằm trên máy chủ: gợi ý theo chữ gõ (`searchMode="server"`), kèm nút mở [Value help](/components/value-help) để tìm theo nhiều cột.

## Khi nào không dùng

- **≤ 5 lựa chọn ngắn, cần thấy hết**: [Segmented](/components/segmented) hoặc [Radio group](/components/radio-group).
- **≤ ~12 lựa chọn, không cần gõ**: `select[nxtInput]` native trong [Form field](/components/form-field). Trình duyệt lo bàn phím, điện thoại và screen reader.
- **> 200 mục, hoặc phải thấy ≥ 3 thuộc tính mới phân biệt được** (nhân viên trùng tên): combobox gợi ý kèm nút [Value help](/components/value-help), hoặc chỉ value help.
- **Chọn nhiều trong ≤ ~7 mục**: nhóm [Checkbox](/components/checkbox), thấy hết và chọn bằng một lần bấm.
- **Lọc danh sách của trang**, không lưu giá trị: [Search](/components/search).
- **Giá trị tự nhập vẫn hợp lệ** (email ngoài danh bạ): chưa hỗ trợ. Combobox luôn chặn chữ không có trong danh sách.

## Chọn control chọn giá trị

Một bộ ngưỡng cho mọi sản phẩm (theo SAP Fiori: chọn control theo số mục × số thuộc tính cần thấy để nhận ra mục):

| Tình huống | Dùng | Ví dụ HRM |
|------------|------|-----------|
| Chọn một, ≤ 5 lựa chọn ngắn, cần thấy hết | [Segmented](/components/segmented) (đổi ngay) hoặc [Radio group](/components/radio-group) (trong form) | Kỳ báo cáo, giới tính, cách duyệt |
| Chọn một, ≤ ~12 lựa chọn, không cần gõ | `select[nxtInput]` native trong [Form field](/components/form-field) | Loại hợp đồng, trình độ học vấn |
| Chọn một, 13–200 lựa chọn, 1–2 thuộc tính (tên, mã) | `nxt-combobox` | Phòng ban, chức danh, chi nhánh |
| > 200 mục, hoặc cần ≥ 3 thuộc tính / tìm theo nhiều cột | `nxt-combobox searchMode="server" valueHelp` + [Value help](/components/value-help) | Nhân viên, người phê duyệt, quản lý trực tiếp |
| Chọn nhiều, ≤ ~7 mục | Nhóm [Checkbox](/components/checkbox) | Ngày làm việc trong tuần, loại nghỉ áp dụng |
| Chọn nhiều, nhiều mục | `nxt-combobox multiple` (danh sách lớn: thêm `valueHelp`) | Kỹ năng, phòng ban áp dụng, nhân viên áp dụng |

Danh sách nào có thể lớn dần theo thời gian (nhân viên, khách hàng) thì chọn ngay từ đầu kiểu dành cho danh sách lớn.

## Ví dụ

### Một giá trị trong form

Đặt trong `nxt-form-field`: field lo nhãn, dấu `*`, hướng dẫn, lỗi và các trạng thái giá trị; combobox lo danh sách. Lựa chọn có `group` thì chia nhóm với tiêu đề không bấm được; `description` (mã) hiện ở cuối hàng và cũng được tìm.

::example{combobox-basic}

- Gõ để lọc: mọi từ phải khớp, ở đâu cũng được, không phân biệt dấu ("phong ke" khớp "Phòng Kế toán"). Phần khớp được tô đậm.
- Rời ô khi chữ không khớp lựa chọn nào: chữ trở về tên của giá trị đang có. Chữ trùng đúng tên hoặc mã của một lựa chọn ("kt01"): chọn lựa chọn đó. Xoá trống ô: giá trị là `null`.
- Sắp xếp `options` theo `Intl.Collator('vi')` trước khi truyền vào; lựa chọn cùng nhóm phải liền nhau.

### Nhiều giá trị

`multiple` + `[(values)]` (mảng khoá, theo thứ tự chọn). <kbd>Enter</kbd> hoặc bấm chuột chọn / bỏ chọn một mục mà danh sách vẫn mở để chọn tiếp; chữ đang gõ được xoá để thấy lại cả danh sách.

::example{combobox-multiple}

### Trạng thái

Lỗi đi qua `error` của form field (viền, icon, chữ, `aria-invalid`). `clearable` thêm nút × cho trường không bắt buộc. Trường bị khoá ghi lý do trong `hint`. `readonly` của form field (hoặc của combobox) giữ ô focus và copy được nhưng không mở danh sách. Đứng một mình (thanh công cụ), combobox tự vẽ khung và cần `label`.

::example{combobox-states}

### Gợi ý từ máy chủ

`searchMode="server"`: combobox không tự lọc mà hiện nguyên `options`. Output `query` phát ngay khi danh sách mở, rồi 250 ms (`debounce`) sau khi người dùng ngừng gõ; nơi dùng tải lại `options` và bật `loading` trong lúc chờ. Bỏ kết quả của lần gọi cũ về muộn.

::example{combobox-server}

- Đưa lựa chọn của **giá trị hiện có** vào `options` lần đầu (và sau khi chọn từ value help), để ô hiện được tên trước lần tìm đầu tiên. Combobox nhớ tên của mọi lựa chọn đã thấy, nên giá trị đã chọn không đổi thành mã khi kết quả tìm thay đổi.
- Giới hạn số gợi ý (khoảng 8–10). Muốn xem hết thì dùng nút value help, xem [Value help](/components/value-help).

## Anatomy

1. **Khung**: của form field (hoặc của combobox khi đứng một mình).
2. **Token** (chỉ `multiple`): mỗi giá trị một viên, nút × "Bỏ <tên>", xuống dòng khi hết chỗ.
3. **Ô gõ** `role="combobox"`.
4. **Nút xoá** (`clearable`), **nút mở danh sách** (icon), **nút value help** (`valueHelp`).
5. **Popup**: dòng thông báo ("Đang tải…", "Không có kết quả phù hợp"), listbox, nhóm, lựa chọn (dấu ✓ hoặc ô check, tên, mã).

## Hành vi & trạng thái

| Trạng thái | Hiển thị |
|------------|----------|
| Mở | Popup rộng bằng khung, mở xuống dưới, thiếu chỗ thì lật lên; cao tối đa 8,5 lựa chọn |
| Mục đang tô | Nền hover + vòng focus bên trong (chỉ ra bằng `aria-activedescendant`; focus thật vẫn ở ô gõ) |
| Đã chọn | Một giá trị: dấu ✓. Nhiều giá trị: ô check đã tick + token |
| Đang tải | Dòng "Đang tải…" với icon quay; listbox `aria-busy` |
| Không có kết quả | "Không có kết quả phù hợp", đọc lên một lần |
| Lỗi / cảnh báo / thông tin | Do form field |
| Bị khoá | Ô gõ `disabled`, không có nút, token không có nút bỏ |
| Chỉ đọc | Không mở danh sách, không có nút, vẫn focus và copy được |

Không có lựa chọn bị khoá: mục không chọn được thì không đưa vào `options`.

## Accessibility

| Phím | Hành vi |
|------|---------|
| Gõ | Mở danh sách, lọc, tô mục khớp đầu tiên |
| <kbd>↓</kbd> | Đóng: mở và tô mục đã chọn (hoặc mục đầu). Mở: mục kế, vòng về đầu |
| <kbd>↑</kbd> | Đóng: mở và tô mục cuối. Mở: mục trước, vòng về cuối |
| <kbd>Alt</kbd>+<kbd>↓</kbd> / <kbd>Alt</kbd>+<kbd>↑</kbd> | Mở danh sách / đóng danh sách, không chọn |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | Khi mở: lùi / tới 10 mục |
| <kbd>Enter</kbd> | Chọn mục đang tô. Một giá trị: đóng. Nhiều giá trị: chọn / bỏ, giữ danh sách mở |
| <kbd>Esc</kbd> | Mở: đóng danh sách. Đóng mà có chữ: xoá chữ (một giá trị: bỏ giá trị). Trống: để Esc đóng drawer / dialog bao quanh |
| <kbd>Tab</kbd> | Một giá trị: chọn mục đang tô rồi rời ô. Nhiều giá trị: rời ô. Nút mở danh sách và nút xoá ngoài thứ tự Tab; nút value help trong thứ tự Tab |
| <kbd>Backspace</kbd> (ô trống, nhiều giá trị) | Bỏ token cuối |
| <kbd>←</kbd> (ô trống, nhiều giá trị) | Tới token cuối |
| <kbd>←</kbd> / <kbd>→</kbd> trên token | Token trước / sau; → ở token cuối về ô gõ |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> trên token | Bỏ token, focus token kế / token trước |

- Ô gõ: `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` và `aria-activedescendant` khi mở. Tên lấy từ nhãn của form field (`label[for]`), hoặc `label` khi đứng một mình.
- Listbox có tên (nhãn của field); `aria-multiselectable` khi chọn nhiều. Nhóm là `role="group"` có tên từ tiêu đề nhóm.
- Danh sách token là danh sách có tên "Đã chọn"; nút bỏ token tên "Bỏ Angular". Chọn / bỏ chọn nhiều giá trị được thông báo ("Đã thêm Tiếng Nhật", "Đã bỏ Docker").
- Popup nằm trong overlay; khi combobox ở trong drawer / dialog, popup được modal "sở hữu" (`aria-owns`) trong lúc mở để screen reader không bỏ qua nó.
- Không tự điền nốt chữ trong ô khi gõ, vì dễ phá chữ đang gõ bằng Telex / VNI; phím bấm trong lúc bộ gõ đang soạn chữ được bỏ qua.

## Nội dung

| Nên | Không nên |
|-----|-----------|
| Nhãn là danh từ: "Phòng ban", "Người phê duyệt" | "Chọn phòng ban:" làm nhãn |
| Placeholder nói cách tìm: "Gõ tên hoặc mã phòng ban" | Placeholder lặp lại nhãn, hoặc thay nhãn |
| Tên đầy đủ + mã ở `description`: "Phòng Kế toán" · "KT01" | Nhét mã vào nhãn: "KT01 - Phòng Kế toán" |
| Người có thể trùng tên: thêm mã và phòng ban vào `description` | Chỉ hiện họ tên |
| Để trống khi chưa chọn; trường không bắt buộc dùng `clearable` | Thêm lựa chọn "(Chưa chọn)" vào danh sách |
| Lỗi: "Hãy chọn một phòng ban trong danh sách." | "Giá trị không hợp lệ" |

## API

::api{combobox}

`NxtComboboxOption<K>`: `{ key: K; label: string; description?: string; group?: string; keywords?: string }`. `keywords` chỉ để tìm (tên cũ, tên tiếng Anh).

`texts` (i18n): `toggle`, `clear`, `valueHelp`, `noResults`, `loading`, `selected`, và các hàm `remove(label)`, `added(label)`, `removed(label)`. Thiếu khoá nào thì dùng tiếng Việt mặc định.

Hàm `nxtHighlight(text, query)` tách chữ thành các đoạn `{ text, match }` theo cùng luật với `nxtMatches` (không phân biệt dấu), dùng được cho bảng kết quả tìm kiếm.

Forms: dùng `formControl` / `formControlName` / `ngModel`. Giá trị là khoá, hoặc mảng khoá khi `multiple`. Giá trị chỉ đổi khi chọn, bỏ token hoặc xoá; gõ chữ không đổi giá trị.

## Token

::tokens{component.combobox}

## Changelog

- **Chưa phát hành**: thêm `nxt-combobox` (một / nhiều giá trị, token, nhóm, mô tả phụ, lọc không dấu, chặn giá trị tự nhập, `searchMode="server"`, `loading`, `clearable`, nút value help, `texts`) và hàm `nxtHighlight`.

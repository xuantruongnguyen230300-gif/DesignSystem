---
component: combobox
status: beta
owner: "NXT core"
updated: 2026-11-06
apg-pattern: combobox (editable, list autocomplete, popup listbox)
---

# Combobox: Spec

Entry `@nxt/ui/combobox` gồm `nxt-combobox` (chọn **một** giá trị, hoặc **nhiều** giá trị hiện thành token khi `multiple`) và hàm `nxtHighlight` (tách chữ thành đoạn khớp / không khớp, không phân biệt dấu). Lọc dùng `nxtMatches` của `@nxt/ui/search`.

## 1. Mục đích
- **Vấn đề người dùng giải quyết:** chọn đúng một (hoặc vài) mục trong danh sách vài chục đến vài trăm mục mà không phải cuộn: gõ vài chữ, có dấu hay không dấu, theo tên hoặc mã, rồi chọn bằng phím hoặc chuột. Giá trị lưu là **khoá** (mã), không phải chữ người dùng gõ.
- **Khi nào dùng:**
  - 13–200 mục, nhận ra mục bằng 1–2 thuộc tính (tên + mã): phòng ban, chức danh, chi nhánh, loại hợp đồng.
  - Chọn nhiều mục từ danh sách định sẵn (`multiple`): kỹ năng, phòng ban áp dụng, người nhận thông báo trong một nhóm nhỏ.
  - Danh sách lớn tải từ máy chủ theo chữ gõ (`searchMode="server"`), kèm nút mở [Value help](../value-help/SPEC.md) để tìm theo nhiều cột.
- **Khi nào KHÔNG dùng:**
  - ≤ 5 lựa chọn, cần thấy hết ngay: `nxt-segmented` / nhóm radio.
  - ≤ ~12 lựa chọn, không cần gõ: `select[nxtInput]` native trong `nxt-form-field` (bàn phím, điện thoại, screen reader do trình duyệt lo).
  - > 200 mục, hoặc người dùng phải thấy ≥ 3 thuộc tính mới phân biệt được (nhân viên trùng tên): combobox gợi ý + nút value help, hoặc chỉ value help.
  - Chọn nhiều trong ≤ ~7 mục: nhóm `nxt-checkbox` (thấy hết, một lần bấm).
  - Ô tìm kiếm không lưu giá trị (lọc danh sách): `nxt-search`.
  - Nhập chữ tự do có gợi ý (giá trị không có trong danh sách vẫn hợp lệ): chưa hỗ trợ, xem §11.

Theo SAP Fiori: chọn control chọn giá trị theo số mục × số thuộc tính (Combo Box 13–200 mục, chặn giá trị tự nhập; Multi-Combo Box cho chọn nhiều; Input + gợi ý + dialog chọn khi > 200 mục hoặc nhiều thuộc tính). NXT chốt một bộ ngưỡng duy nhất, ghi ở docs `combobox.md` mục "Chọn control chọn giá trị".

## 2. Anatomy
| # | Phần tử | Bắt buộc | Ghi chú |
|---|---------|----------|---------|
| 1 | Host `nxt-combobox` | ✓ | Trong `nxt-form-field`: lấp khung control của field (nhãn, viền, trạng thái giá trị do field lo). Đứng một mình: tự vẽ khung (`data-framed`) |
| 2 | Token `.nxt-combobox__token` | — | Chỉ khi `multiple`: một viên cho mỗi giá trị, theo **thứ tự chọn**, nằm trước ô gõ, xuống dòng khi hết chỗ |
| 3 | Nút bỏ token `.nxt-combobox__token-remove` | — | Icon `x`, tên "Bỏ <nhãn>"; không có khi `disabled` / `readonly` |
| 4 | Ô gõ `input[nxtInput]` | ✓ | `role="combobox"`; một giá trị: hiện nhãn mục đã chọn; nhiều giá trị: chỉ chứa chữ đang gõ |
| 5 | Nút xoá `.nxt-combobox__clear` | — | Khi `clearable`, một giá trị, đang có giá trị; ngoài thứ tự Tab |
| 6 | Nút mở danh sách `.nxt-combobox__toggle` | ✓ | Icon `selector`; ngoài thứ tự Tab (Alt+↓ làm cùng việc) |
| 7 | Nút value help `.nxt-combobox__help` | — | Khi `valueHelp`; icon `list-details`, **có** trong thứ tự Tab, có tooltip |
| 8 | Popup `.nxt-combobox__popup` | ✓ | Overlay CDK neo vào khung field, rộng bằng khung, mở xuống dưới, thiếu chỗ thì lật lên |
| 9 | Dòng thông báo `.nxt-combobox__message` | — | "Đang tải…" (`loading`) hoặc "Không có kết quả phù hợp"; nằm **ngoài** listbox |
| 10 | Listbox `role="listbox"` | ✓ | Cuộn dọc, cao tối đa 8,5 mục |
| 11 | Nhóm `role="group"` + tiêu đề nhóm | — | Khi option có `group`; tiêu đề không tương tác |
| 12 | Option `role="option"` | ✓ | [ô check / dấu ✓] + nhãn (đoạn khớp in đậm) + mô tả phụ căn cuối (mã) |

## 3. API (Angular)
Selector: `nxt-combobox`. Generic `NxtCombobox<K = string>` (kiểu khoá). Export type `NxtComboboxOption<K>`, `NxtComboboxTexts`, `NxtHighlightPart`; hàm `nxtHighlight(text, query)`.

| Loại | Tên | Kiểu | Mặc định | Mô tả |
|------|-----|------|----------|-------|
| input | `options` | `readonly NxtComboboxOption<K>[]` | `[]` | Danh sách lựa chọn, **đã sắp xếp** (nơi dùng sắp bằng `Intl.Collator('vi')`); option cùng nhóm phải liền nhau |
| input | `multiple` | `boolean` | `false` | Chọn nhiều, hiện token |
| model | `value` | `K \| null` | `null` | Giá trị khi chọn một (two-way) |
| model | `values` | `K[]` | `[]` | Giá trị khi `multiple` (two-way), theo thứ tự chọn |
| input | `placeholder` | `string` | `''` | Ví dụ giá trị; ẩn khi đã có token |
| input | `label` | `string` | `undefined` | Tên truy cập khi **không** đặt trong `nxt-form-field` (`aria-label`) |
| input | `size` | `'sm' \| 'md'` | `'md'` | Chỉ khi đứng một mình; trong field thì theo `size` của field |
| input | `disabled` | `boolean` | `false` | Cũng nhận từ Angular forms (`setDisabledState`) |
| input | `readonly` | `boolean` | `false` | Focus và copy được, không mở danh sách, không bỏ token. `readonly` của `nxt-form-field` cũng được tôn trọng |
| input | `loading` | `boolean` | `false` | Đang tải option: dòng "Đang tải…", `aria-busy` trên listbox |
| input | `searchMode` | `'local' \| 'server'` | `'local'` | `local`: lọc `options` bằng `nxtMatches` (nhãn, mô tả, `keywords`). `server`: hiện nguyên `options`, nơi dùng tải lại theo output `query` |
| input | `debounce` | `number` (ms) | `250` | Độ trễ trước khi phát `query` khi gõ (không ảnh hưởng lọc tại máy) |
| input | `clearable` | `boolean` | `false` | Nút xoá giá trị (chỉ khi chọn một). Không cần cho trường bắt buộc |
| input | `valueHelp` | `boolean` | `false` | Hiện nút mở danh sách đầy đủ (value help) |
| input | `texts` | `Partial<NxtComboboxTexts>` | tiếng Việt | Mọi chuỗi hiển thị / đọc lên (i18n) |
| output | `query` | `string` | | Chữ người dùng gõ, sau `debounce`; phát ngay chữ hiện tại khi mở danh sách. Dùng để tải option từ máy chủ |
| output | `valueHelpRequested` | `string` | | Bấm nút value help; mang chữ người dùng **đã gõ** (không phải nhãn đã chọn) để chuyển sang ô tìm của value help |
| method | `focus()` | | | Đưa focus vào ô gõ (sau khi value help đóng, sau khi xoá) |
| method | `open()` / `close()` | | | Mở / đóng danh sách |

`NxtComboboxOption<K>`: `{ key: K; label: string; description?: string; group?: string; keywords?: string }`. `description` là thông tin phụ ngắn (mã, viết tắt), hiện căn cuối và cũng được tìm. `keywords` chỉ để tìm (tên cũ, tên tiếng Anh). **Không có option bị khoá**: mục không chọn được thì không đưa vào `options` (theo SAP Fiori).

`NxtComboboxTexts`: `toggle` ("Hiện danh sách"), `clear` ("Xoá lựa chọn"), `valueHelp` ("Mở danh sách đầy đủ"), `noResults` ("Không có kết quả phù hợp"), `loading` ("Đang tải…"), `selected` ("Đã chọn", tên của danh sách token), `remove(label)` ("Bỏ <nhãn>"), `added(label)` ("Đã thêm <nhãn>"), `removed(label)` ("Đã bỏ <nhãn>").

Forms: implement `ControlValueAccessor`. Giá trị là khoá (`K | null`) hoặc mảng khoá (`K[]`) khi `multiple`. `onChange` chỉ phát khi giá trị **đổi thật** (chọn, bỏ token, xoá); gõ chữ không đổi giá trị. `onTouched` khi rời ô.

**Trong `nxt-form-field`:** ô gõ là `input[nxtInput]`, nên field tự nối nhãn (`label[for]`), `aria-describedby` (thông điệp, hướng dẫn), `aria-invalid`, `aria-required` và style trạng thái giá trị (lỗi / cảnh báo / thông tin / thành công) như mọi trường khác. Popup neo vào khung `.nxt-form-field__control` để rộng bằng khung.

**Vì sao hai model `value` / `values`:** kiểu rõ ràng với `strictTemplates` (`[(value)]` gắn với `signal<string | null>`, `[(values)]` với `signal<string[]>`), không phải ép kiểu union.

## 4. Variants & sizes
| Chế độ | Dùng khi | Không dùng khi |
|--------|----------|----------------|
| Một giá trị (mặc định) | Chọn một trong 13–200 mục | ≤ 12 mục không cần gõ (select native) |
| `multiple` | Chọn nhiều trong danh sách định sẵn, lựa chọn hiện thành token | ≤ ~7 mục (nhóm checkbox); cần nhập giá trị tự do (chưa có) |
| `searchMode="server"` | > 200 mục, tải theo chữ gõ | Danh sách nhỏ đã có sẵn tại máy |
| `valueHelp` | Cần tìm theo nhiều cột hoặc xem đủ thuộc tính trước khi chọn | Danh sách ngắn, 1–2 thuộc tính là đủ |

| Size (đứng một mình) | comfortable | compact | spacious |
|----------------------|-------------|---------|----------|
| `sm` | 28px | 24px | 32px |
| `md` | 32px | 28px | 40px |

Không có variant màu.

## 5. States
| Rest | Hover | Focus-visible | Active/Pressed | Selected | Disabled | Loading | Error | Read-only | Empty |
|------|-------|---------------|----------------|----------|----------|---------|-------|-----------|-------|
| ✓ | ✓ viền `border-hover` (khung riêng) hoặc của field; option hover nền `option-bg-hover` | ✓ ring trên khung (`:focus-within`); option đang tô (`aria-activedescendant`) có nền + vòng focus bên trong; token đang focus có ring | — (chọn là đóng / đổi trạng thái ngay) | ✓ một giá trị: dấu ✓ ở option đã chọn, `aria-selected` theo mục đang tô (APG); nhiều: ô check, `aria-selected="true"`, token | ✓ ô gõ `disabled`, không có nút, token không có nút bỏ | ✓ `loading`: dòng "Đang tải…" + `aria-busy`; giữ kích thước popup | ✓ do `nxt-form-field` (`error` → `aria-invalid`, viền, icon + chữ) | ✓ `readonly`: không mở, không nút, token không có nút bỏ, vẫn focus / copy được | ✓ placeholder; popup "Không có kết quả phù hợp" (đọc qua LiveAnnouncer) |

**Chặn giá trị tự nhập (mặc định, theo SAP Fiori):** rời ô (một giá trị) mà chữ không trùng nhãn hoặc mã của option nào thì chữ **trở về** nhãn của giá trị đang có; ô trống thì giá trị là `null`. Chữ trùng đúng một nhãn / mã (không phân biệt dấu, hoa thường) thì chọn mục đó. Nhiều giá trị: rời ô thì bỏ chữ đang gõ dở (token là thứ duy nhất được lưu, nên không có gì bị mất âm thầm).

## 6. Keyboard & ARIA
APG pattern: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/ (editable combobox, list autocomplete, popup listbox). Focus DOM luôn ở ô gõ; mục đang tô chỉ ra bằng `aria-activedescendant`.

| Phím | Hành vi |
|------|---------|
| Gõ | Mở danh sách, lọc (không phân biệt dấu, mọi từ khớp ở đâu cũng được), tô mục khớp đầu tiên; phát `query` sau `debounce` |
| <kbd>↓</kbd> | Đóng: mở và tô mục đã chọn (hoặc mục đầu). Mở: tô mục kế (vòng về đầu) |
| <kbd>↑</kbd> | Đóng: mở và tô mục cuối. Mở: tô mục trước (vòng về cuối) |
| <kbd>Alt</kbd>+<kbd>↓</kbd> | Mở danh sách, không đổi mục đang tô |
| <kbd>Alt</kbd>+<kbd>↑</kbd> | Đóng danh sách, không chọn |
| <kbd>PageUp</kbd> / <kbd>PageDown</kbd> | Khi mở: tô lùi / tới 10 mục |
| <kbd>Enter</kbd> | Có mục đang tô: một giá trị → chọn, đóng; nhiều giá trị → chọn / bỏ chọn mục đó, xoá chữ đang gõ, **giữ** danh sách mở. Đóng: một giá trị → chốt chữ đang gõ như khi rời ô; không chặn submit của form |
| <kbd>Esc</kbd> | Mở: đóng danh sách. Đóng mà có chữ: xoá chữ (một giá trị: giá trị thành `null`). Đóng và trống: không chặn, để Esc đóng drawer / dialog bao quanh |
| <kbd>Tab</kbd> | Một giá trị: có mục đang tô thì chọn mục đó rồi rời ô (APG). Nhiều giá trị: rời ô, không chọn. Nút mở danh sách và nút xoá **không** nằm trong thứ tự Tab; nút value help **có** |
| <kbd>Backspace</kbd> (nhiều giá trị, ô gõ trống) | Bỏ token cuối |
| <kbd>←</kbd> (nhiều giá trị, ô gõ trống) | Focus token cuối |
| <kbd>←</kbd> / <kbd>→</kbd> (trên token) | Token trước / token sau; → ở token cuối về ô gõ |
| <kbd>Delete</kbd> (trên token) | Bỏ token, focus token kế (hết thì về ô gõ) |
| <kbd>Backspace</kbd> (trên token) | Bỏ token, focus token trước (không còn thì token kế / ô gõ) |
| <kbd>Enter</kbd> / <kbd>Space</kbd> (trên token) | Bỏ token (nút native), focus như Delete |

- Ô gõ: `role="combobox"`, `aria-autocomplete="list"`, `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls` (chỉ khi mở, trỏ tới listbox), `aria-activedescendant` (chỉ khi có mục đang tô), `autocomplete="off"`. Tên: `label[for]` của field, hoặc `aria-label` = input `label` khi đứng một mình.
- Listbox: `role="listbox"`, `aria-label` = nhãn của field / `label`; `aria-multiselectable="true"` khi `multiple`; `aria-busy` khi `loading`. Option `role="option"`, id ổn định; `aria-selected`: một giá trị → `true` ở mục đang tô (APG), nhiều giá trị → trạng thái đã chọn. Nhóm: `role="group"` + `aria-labelledby` trỏ tới tiêu đề nhóm (`role="presentation"`), như ví dụ APG.
- Danh sách token: `ul role="list"` có tên "Đã chọn"; nút bỏ token có tên "Bỏ <nhãn>" (`tabindex="-1"`: tới bằng ← từ ô gõ, giữ một điểm dừng Tab cho cả trường).
- Thông báo (CDK `LiveAnnouncer`, polite): "Đã thêm <nhãn>" / "Đã bỏ <nhãn>" khi chọn nhiều; "Không có kết quả phù hợp" khi lọc ra rỗng.
- Popup nằm trong overlay CDK (ngoài DOM của drawer / dialog). Khi combobox ở trong phần tử `aria-modal="true"`, id của popup được thêm vào `aria-owns` của phần tử đó trong lúc mở, để screen reader coi popup là một phần của modal (cách Angular Material làm).
- Bấm chuột vào option / nút không làm ô gõ mất focus (`mousedown` bị chặn mặc định).
- **Hành vi bàn phím từ CDK:** `ListKeyManager` của `@angular/cdk/a11y` (lớp cơ sở của `ActiveDescendantKeyManager`) giữ mục đang tô (↑/↓ vòng, PageUp/PageDown); `aria-activedescendant` tính từ mục đó. Phần tự viết: Alt+↓/↑, Enter, Esc, Tab, Backspace và ←/→ giữa token, vì CDK không có combobox / tokenizer ổn định (`@angular/aria` chưa cài, ADR-004).
- **Không tự điền nốt chữ trong ô (inline autocomplete):** với bộ gõ Telex / VNI, điền nốt khi đang gõ dễ phá chữ có dấu; NXT chỉ tô mục khớp đầu tiên. Phím Enter / phím đang trong lúc soạn chữ (`isComposing`) bị bỏ qua.

## 7. Tokens
`packages/tokens/src/component/combobox.tokens.json`:

| Token | Alias semantic | Ghi chú |
|-------|----------------|---------|
| `bg`, `bg-disabled` | `color.bg.muted`, `color.bg.disabled` | Khung khi đứng một mình: nền đặc kiểu iOS |
| `bg-focus`, `border-focus`, `focus-halo` | `color.bg.surface`, `color.border.selected`, `color.bg.selected-hover` | Focus của khung riêng: viền accent 2px + vòng mờ tĩnh (trong form-field thì khung của field lo) |
| `button-bg-hover` | `color.border.default` | Hover nút xoá / mở danh sách (đậm hơn nền khung; `icon.subtle` đạt 3,5:1 sáng / 4,0:1 tối) |
| `text`, `placeholder` | `color.text.strong`, `color.text.subtle` | |
| `border`, `border-hover` | `color.border.input`, `color.border.input-hover` | ≥ 3:1 với nền |
| `radius` | `radius.control` | |
| `height`, `height-sm` | `size.control.md`, `size.control.sm` | |
| `icon` | `color.icon.subtle` | Nút mở / xoá / value help |
| `popup-bg`, `popup-border`, `popup-radius` | `color.bg.surface-raised`, `color.border.default`, `radius.overlay` | |
| `option-height` | `size.control.md` | |
| `option-text`, `option-description` | `color.text.default`, `color.text.subtle` | |
| `option-bg-hover` | `color.bg.surface-hover` | Hover và mục đang tô (mục đang tô có thêm vòng focus) |
| `option-check` | `color.icon.primary` | Dấu ✓ mục đã chọn (một giá trị) |
| `check-border`, `check-bg`, `check-mark` | `color.border.input`, `color.bg.primary`, `color.text.on-primary` | Ô check trong option (nhiều giá trị) |
| `match-text` | `color.text.strong` | Đoạn khớp (cùng `typography.label-md`) |
| `group-text` | `color.text.subtle` | Tiêu đề nhóm |
| `message-text` | `color.text.subtle` | "Đang tải…", "Không có kết quả phù hợp" |
| `token-bg`, `token-bg-hover` | `color.bg.selected`, `color.bg.selected-hover` | |
| `token-text`, `token-border` | `color.text.default`, `color.border.transparent` | Token không viền (nền accent nhạt); chữ giữ `text.default` vì `text.link` / `bg.selected-hover` dưới 4.5:1 ở dark khi hover nút × |
| `token-radius` | `radius.pill` | |

Dùng thẳng semantic: `space.inset.{xs,sm,md}`, `space.gap.xs`, `size.icon.sm`, `size.control.sm`, `border-width.default`, `elevation.overlay`, `typography.{body-md,body-sm,label-md,label-sm}`, `focus.ring.*`, `motion.duration.fast`, `motion.duration.loop` (icon "Đang tải" quay; vẫn quay chậm khi giảm chuyển động), `motion.ease.{standard,enter}`. Cặp `text.default` / `bg.selected` có sẵn trong `contrastPairs`.

## 8. Density, responsive, i18n
- Chiều cao khung, option và token theo density; token cao bằng khung trừ 2 × `space.inset.xs`, nên một hàng token không làm khung cao lên.
- Nhiều token: xuống dòng trong khung (khung cao dần); token dài cắt "…" kèm `title`.
- Popup rộng bằng khung field; nhãn option dài xuống dòng, mô tả phụ không xuống dòng.
- Tìm kiếm không phân biệt dấu (`nxtMatches`): "ke toan" khớp "Phòng Kế toán", "kt01" khớp mã. Đoạn khớp tô đậm tính trên chữ đã bỏ dấu (`nxtHighlight`), nên "nguyen" vẫn tô "Nguyễn".
- Sắp xếp do nơi dùng (`Intl.Collator('vi')`); > 8 mục thì theo bảng chữ cái.

## 9. Content guidelines
- Nhãn field là danh từ: "Phòng ban", "Kỹ năng", "Người phê duyệt".
- Placeholder là ví dụ hoặc gợi ý cách tìm: "Gõ tên hoặc mã phòng ban", không lặp lại nhãn.
- Option: nhãn là tên đầy đủ ("Phòng Quản trị Nguồn nhân lực"), `description` là mã / viết tắt ("HR01"). Người có thể trùng tên: thêm mã nhân viên hoặc phòng ban vào `description`.
- Không đưa option "(Chưa chọn)" vào danh sách: ô trống là chưa chọn; trường tuỳ chọn dùng `clearable`.
- Lỗi do nơi dùng truyền vào field: "Hãy chọn một phòng ban trong danh sách." (nói cách sửa).

## 10. Acceptance (Definition of Done)
- [x] Docs example: một giá trị trong form field (`combobox-basic`), nhóm + mô tả + `clearable` + lỗi (`combobox-states`), nhiều giá trị (`combobox-multiple`), tải từ máy chủ + `loading` + value help (`combobox-server`); disabled / readonly trong `combobox-states`
- [x] Unit test phủ từng dòng keyboard map §6, ARIA của ô gõ / listbox / option, chặn giá trị tự nhập, CVA với `FormControl` (một và nhiều giá trị, disabled, touched), `nxtHighlight` (`src/combobox.spec.ts`; 34/34 pass, 2026-11-06)
- [ ] axe: 0 vi phạm ở sáng/tối/gọn (cần `npm run build && npm run test:a11y`, phiên chính chạy)
- [x] `npm run ds:check` sạch (tokens + hardcoded; 2026-11-06, 810/810 cặp tương phản)
- [x] Docs page đủ mục (`apps/docs/src/content/components/combobox.md`)

## 11. Việc còn mở
- Giá trị tự nhập (`allowCustom`: một giá trị là chữ; nhiều giá trị tạo token từ chữ + hàm validate) và dán nhiều dòng từ Excel thành nhiều token: P2.
- Nhãn "+N" gom token khi khung không đủ chỗ (hiện tại token xuống dòng): P2.
- Ctrl+A chọn tất cả / Shift+↑↓ chọn dải trong danh sách nhiều giá trị: P2 (Ctrl+A trong ô gõ đang là chọn chữ).
- Màn hẹp: popup chưa chuyển sang dạng toàn màn có tiêu đề "Chọn <đối tượng>".
- Style chỉ đọc của `nxt-form-field` chọn `:has(> .nxt-input[readonly])` (con trực tiếp); ô gõ của combobox nằm trong host nên `readonly` đặt trên combobox (không qua field) chưa có style chỉ đọc của field. Đề xuất cho form-field: chọn theo hậu duệ `:has(.nxt-input[readonly])`.
- `nxt-form-field` ghi đè `aria-describedby` của ô gõ (chỉ giữ id tĩnh), nên combobox chưa thêm được câu hướng dẫn ẩn ("Nhấn ← để tới các mục đã chọn").
- Cặp tương phản `combobox.check-border` / `bg.surface-raised` và `token-border` / `bg.surface` chưa có trong `contrastPairs` (file cấu hình dùng chung).

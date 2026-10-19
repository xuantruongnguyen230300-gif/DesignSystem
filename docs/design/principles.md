# NXT Design: nguyên tắc, quality floor và anti-pattern

> Tài liệu nguồn cho mọi skill `nxt-*`. Khi có mâu thuẫn, thứ tự ưu tiên là: **a11y > tính đúng của dữ liệu > nhất quán > thẩm mỹ**.

## 1. NXT phục vụ ai, ở register nào

Sản phẩm dùng NXT là phần mềm nghiệp vụ (HRM, quản trị nhân tài, vận hành…). Người dùng làm việc nhiều giờ mỗi ngày, xử lý dữ liệu dày, thao tác lặp lại nhiều lần.

| Register | Bề mặt | Ưu tiên |
|----------|--------|---------|
| **Operate** (mặc định) | Danh sách, form, bảng, dashboard, quy trình phê duyệt | Rõ ràng, tốc độ thao tác, nhất quán, mật độ có kiểm soát. Không phô diễn. |
| **Read** | Docs site, trang hướng dẫn, báo cáo dạng văn bản | Dễ đọc: độ rộng dòng 60–75ch, phân cấp heading rõ. |
| **Welcome** | Login, onboarding, trang trống lần đầu | Được phép có điểm nhấn thương hiệu, nhưng vẫn theo token. |

Mọi đề xuất UI phải ghi rõ đang ở register nào. Không đem thẩm mỹ của trang marketing vào màn hình Operate.

## 2. Bảy nguyên tắc

1. **Rõ trước đẹp.** Mỗi vùng màn hình có đúng một hành động chính. Phân cấp bằng typography và khoảng trắng trước, màu sắc sau.
2. **Mật độ có kiểm soát.** Có ba density: `compact`, `comfortable` (mặc định) và `spacious`. Density chỉ đổi space, control height và row height; không bao giờ làm nhỏ chữ dưới 12px.
3. **Bàn phím là công dân hạng nhất.** Mọi luồng chính phải làm được không cần chuột. Focus luôn nhìn thấy được, có phím tắt cho thao tác lặp, có command palette.
4. **Trạng thái đầy đủ.** Mỗi màn hình, mỗi component phải thiết kế đủ các trạng thái: loading (skeleton, không spinner toàn trang), empty (giải thích + hành động tiếp theo), error (nguyên nhân + cách sửa), partial, no-permission, offline/stale.
5. **Không làm mất dữ liệu của người dùng.** Cảnh báo khi rời trang có thay đổi chưa lưu. Ưu tiên undo hơn confirm. Thao tác phá huỷ phải ghi rõ đối tượng ("Xoá 3 nhân viên"), không hỏi chung chung "Bạn chắc chứ?".
6. **Nhất quán xuyên sản phẩm.** Mỗi sản phẩm chỉ được đổi các brand slot đã định nghĩa (xem [token-architecture.md §5](token-architecture.md)). Cấu trúc, hành vi và vị trí không đổi theo sản phẩm.
7. **Tiếng Việt là ngôn ngữ chính.**
   - Font hiển thị dấu chồng (ặ, ỗ, ữ) không bị cắt ở line-height nhỏ.
   - Tìm kiếm không phân biệt dấu ("nguyen" khớp "Nguyễn").
   - Sắp xếp theo collation `vi`.
   - Định dạng `dd/MM/yyyy`, tiền `1.250.000 ₫`, số thập phân dấu phẩy.
   - Tên người dài phải truncate có tooltip.
8. **Dùng được ở mọi mức độ.** Mặc định đơn giản, sức mạnh có sẵn khi cần (progressive disclosure). Không bắt người mới học phím tắt, không bắt người thạo đi đường vòng.
   - *Người mới:* nút có chữ ở hành động chính ("Bộ lọc", "Thêm mới"); icon luôn có tooltip và tên truy cập; empty state nói bước tiếp theo; lỗi nói cách sửa; hoàn tác được.
   - *Người dùng thường xuyên:* trạng thái hiện rõ (chip bộ lọc, số tiêu chí, số đã chọn); màn hình nhớ lựa chọn (tab, bộ lọc, thu gọn menu); thao tác hàng loạt.
   - *Người thạo:* bàn phím xuyên suốt theo quy ước Windows (Esc xoá/đóng, Enter áp dụng, mũi tên di chuyển, Shift+click chọn dải, Ctrl+K tìm); mật độ Gọn; "Chọn tất cả N kết quả".

## 3. Quality floor (không có ngoại lệ)

Skill `nxt-ui-review` và `nxt-a11y-audit` chấm theo danh sách này. Mỗi mục trượt là một finding.

**Accessibility (WCAG 2.2 AA)**
- [ ] Tương phản chữ ≥ 4.5:1, chữ lớn ≥ 3:1, viền/icon/trạng thái UI ≥ 3:1. Áp dụng ở **mọi** mode × brand.
- [ ] Focus nhìn thấy được (`:focus-visible`, ring ≥ 2px, tương phản ≥ 3:1) và không bị che bởi sticky header/footer (2.4.11).
- [ ] Vùng chạm ≥ 24×24px (2.5.8); ở density compact vẫn giữ hit area bằng padding/pseudo-element.
- [ ] Không truyền đạt thông tin chỉ bằng màu: trạng thái luôn có thêm icon hoặc text.
- [ ] Role, name và state đúng theo WAI-ARIA APG; ưu tiên phần tử HTML native.
- [ ] Tôn trọng `prefers-reduced-motion` (motion mode `reduced`) và zoom 200% không vỡ layout.

**Trạng thái & dữ liệu**
- [ ] Hover, focus, active, disabled, loading, error, empty đều được thiết kế.
- [ ] Disabled control giải thích *vì sao* (tooltip/helper text) khi lý do không hiển nhiên.
- [ ] Lỗi form nằm cạnh field, dùng ngôn ngữ người dùng, nói cách sửa; tóm tắt lỗi ở đầu form dài.
- [ ] Số liệu căn phải, dùng `font-variant-numeric: tabular-nums`; tiền/ngày theo locale.
- [ ] Nội dung dài (tên, địa chỉ, tên phòng ban) không làm vỡ layout.

**Token & code**
- [ ] Không có giá trị hard-code: `npm run ds:check` phải sạch.
- [ ] Component chỉ dùng component token của chính nó cùng các semantic token toàn cục (focus, motion).
- [ ] Hoạt động đúng ở light/dark × 3 density × mọi brand.

## 4. Anti-pattern (cấm trong register Operate)

| Anti-pattern | Vì sao cấm | Làm gì thay thế |
|---|---|---|
| Card lồng card, mọi thứ đều là card | Tốn không gian, phân cấp giả | Section + divider/khoảng trắng |
| Gradient, glassmorphism, blur nền, glow | Giảm tương phản, rối mắt khi dùng lâu | Surface phẳng + elevation token |
| Hero metric khổng lồ trên dashboard nghiệp vụ | Đẩy dữ liệu cần thao tác xuống dưới | Stat strip gọn + bảng/biểu đồ có ngữ cảnh |
| Spinner toàn trang | Mất ngữ cảnh, cảm giác chậm | Skeleton đúng hình khối, loading cục bộ |
| Modal chồng modal | Mất định hướng, kẹt focus | Drawer, hoặc chia bước trong cùng một modal |
| Toast cho lỗi cần xử lý | Biến mất trước khi kịp đọc | Inline alert gần chỗ lỗi |
| Icon-only button không có tên truy cập | Không dùng được với screen reader, khó đoán | `aria-label` + tooltip, hoặc icon + text |
| Placeholder thay cho label | Mất label khi đang gõ | Label luôn hiển thị |
| Màu "trang trí" tự chọn cho từng màn | Phá nhất quán đa sản phẩm | Chỉ dùng semantic token (status, accent) |
| Viết hoa toàn bộ, letter-spacing rộng cho nhãn | Khó đọc tiếng Việt có dấu | Sentence case |
| Animation vào trang cho mọi phần tử | Làm chậm thao tác lặp | Motion chỉ để giải thích thay đổi trạng thái |
| Emoji làm icon | Không nhất quán, không theme được | Bộ icon `@nxt/icons` |
| Nhiều theme "phong cách" tự do (kính mờ, aurora…) | Không đảm bảo tương phản, khó QA | Brand slot + light/dark + density |

## 5. Giọng văn (UX writing tiếng Việt)

- Viết ngắn, chủ động, gọi đúng tên đối tượng: "Lưu hồ sơ", không viết "OK" hay "Xác nhận".
- Nhãn nút là động từ, kèm đối tượng nếu cần: "Gửi duyệt", "Xoá 3 nhân viên".
- Nút tạo ở page header của trang danh sách luôn là **"Thêm mới"**: tiêu đề trang hoặc tab đang chọn đã nói đối tượng, và nhãn giống nhau ở mọi phân hệ. Tên truy cập có thể đủ hơn (`aria-label="Thêm mới chức danh"`); tiêu đề drawer ghi rõ "Thêm chức danh". Màn có nhiều loại đối tượng tạo được thì ghi rõ từng nút.
- Thông báo lỗi trả lời ba câu hỏi: chuyện gì xảy ra, vì sao, làm gì tiếp. Ví dụ: "Không lưu được hợp đồng vì ngày kết thúc trước ngày bắt đầu. Hãy chọn lại ngày kết thúc."
- Không đổ lỗi cho người dùng và không dùng mã lỗi kỹ thuật làm nội dung chính.
- Dùng thống nhất thuật ngữ trong glossary của sản phẩm, ví dụ "nhân viên" chứ không lẫn với "người lao động", trừ khi luật yêu cầu.

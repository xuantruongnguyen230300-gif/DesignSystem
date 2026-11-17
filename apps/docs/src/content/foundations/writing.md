---
title: Cách viết
description: Dùng khi đặt nhãn nút, tiêu đề, viết thông báo, xác nhận, lỗi trường hay review chữ trên giao diện tiếng Việt; có bảng từ chuẩn cho hành động và luật xuống dòng, cắt chữ.
order: 9
status: beta
keywords:
  - cach viet
  - ux writing
  - noi dung
  - giong van
  - nhan nut
  - tu chuan
  - thuat ngu
  - thong bao
  - xac nhan
  - viet hoa
  - dau cau
  - xuong dong
  - cat chu
  - truncate
---

# Cách viết

## Nguyên tắc

- **Ngắn, chủ động, gọi đúng tên đối tượng.** "Lưu hồ sơ", "Gửi duyệt đơn nghỉ phép". Không "OK", không "Xác nhận".
- **Một khái niệm, một từ, ở mọi phân hệ.** Bảng [từ chuẩn](#tu-chuan-cho-hanh-dong) dưới đây áp cho mọi sản phẩm dùng NXT; glossary của sản phẩm chỉ thay khi đã thống nhất và dùng nhất quán.
- **Chữ là một phần của thiết kế.** Nhãn, thông báo, tooltip và tên truy cập (`aria-label`) đều được review như giao diện.
- **Viết để dịch được.** Tiếng Việt là ngôn ngữ chính, nhưng mỗi câu là một chuỗi hoàn chỉnh có tham số, để sản phẩm thêm ngôn ngữ khác mà không viết lại.

Các luật ở đây áp cho chữ **trên giao diện sản phẩm**. Định dạng ngày, số, tiền tệ nằm ở trang [Định dạng](/foundations/formatting).

## Viết hoa

- **Chỉ viết hoa chữ cái đầu** của nhãn, tiêu đề, nút, mục menu, tab, tiêu đề cột, và chữ đầu câu: "Thêm người phụ thuộc", không "Thêm Người Phụ Thuộc".
- **Tên riêng viết hoa theo chính tả**: tên người, tổ chức, địa danh, tên văn bản pháp quy ("Bộ luật Lao động"). Tên phân hệ và màn hình là danh từ chung: "Hợp đồng lao động", "Quy trình duyệt".
- **Không viết hoa toàn bộ**, kể cả tiêu đề cột, tag, badge: chữ hoa có dấu rất khó đọc.
- **Viết tắt**: viết đủ ("Số lượng", không "SL"; "Ngày bắt đầu", không "Ngày BĐ"). Chỉ dùng viết tắt nằm trong danh sách được phép của glossary sản phẩm; với HRM: BHXH, BHYT, BHTN, TNCN, MST, CCCD. Không viết tắt để nhét vừa chỗ.
- **Đặt dấu thanh thống nhất** theo kiểu NXT đang dùng: "Xoá", "Huỷ", "hoà", "thuỷ". Dữ liệu người dùng nhập (tên riêng) giữ nguyên.

## Dấu câu

| Dấu | Luật | Nên | Không nên |
|-----|------|-----|-----------|
| Chấm `.` | Câu đủ có dấu chấm, kể cả thông báo một câu và lỗi trường. Nhãn, nút, tiêu đề, mục menu, tag, placeholder và tiêu đề trạng thái rỗng **không** có dấu chấm | "Đã lưu hồ sơ của Lê Minh Anh." · "Nhập năm sinh." · tiêu đề "Chưa có ca làm việc nào" | "Lưu hồ sơ." trên nút · tag "Đã duyệt." |
| Hai chấm `:` | Không có khoảng trắng trước. Nhãn trường **không** có dấu hai chấm (nhãn nằm trên control). Không đặt sau tiêu đề. Dùng trong câu để dẫn giá trị | "Lý do: thiếu chứng từ gốc." · "Người tạo: Trần Thu Hà" | "Họ và tên:" trên form · "Lý do :" |
| Ba chấm `…` | Một ký tự `…` (U+2026). Chỉ cho chữ đang chờ và mục menu dẫn tới một lựa chọn tiếp theo. Không thêm vào nút mở drawer/dialog, nút menu (đã có mũi tên), placeholder | "Đang tải…" · "Đang lưu…" | "Thêm mới…" · "Xuất..." (ba dấu chấm) |
| Ngoặc kép `“ ”` | Ngoặc cong. Bọc tên hoặc giá trị **do người dùng nhập** và nhãn giao diện được nhắc tới. **Không** bọc mã và ngày do hệ thống sinh | "Đã thêm người phụ thuộc “Nguyễn Minh Khang”." · "Chọn “Gửi duyệt” khi đã kiểm tra xong." · "Đã xoá hợp đồng HĐ-2024-0311." | "Đã xoá hợp đồng “HĐ-2024-0311”." · ngoặc thẳng `"…"` |
| Ngoặc đơn `( )` | Chú thích ngắn, đơn vị trong tiêu đề, mục "chưa chọn" của danh sách | "Quỹ lương (triệu ₫)" · "(Chưa phân công)" | "Quỹ lương tính bằng triệu đồng" trong tiêu đề |
| Gạch chéo `/` | Hai khái niệm riêng: **có** khoảng trắng hai bên. Cùng bổ nghĩa một từ: **không** khoảng trắng. Có chỗ thì viết đủ hai nhãn | "Loại bảo hiểm / Thuế suất" · "Hiệu lực từ/đến" · "Chi phí kế hoạch/thực tế" | "Loại bảo hiểm/Thuế suất" |
| Gạch ngang `–` | Khoảng số dùng gạch ngang (U+2013), không khoảng trắng. Khoảng ngày theo [Định dạng](/foundations/formatting) | "2–12 ký tự" · "3–5 ngày" | "2-12 ký tự" |
| Chấm phẩy `;` | Tránh trong thông báo: tách thành hai câu | "Không gửi được bảng công. Kết nối bị gián đoạn." | "Không gửi được bảng công; kết nối bị gián đoạn" |
| Chấm than `!` | Không dùng | "Đã gửi duyệt đơn nghỉ phép." | "Gửi thành công!" |

**Ký hiệu.** Không dùng ký hiệu toán học hay kỹ thuật (`<`, `>`, `=`, `#`) trong nhãn và câu: "Đến hạn trong 5 ngày", không "Đến hạn < 5 ngày"; "Số hợp đồng", không "# HĐ". `%` dùng được. Trong câu viết "và"; `&` chỉ chấp nhận trong nhãn ngắn ở chỗ hẹp (mục menu, tiêu đề mục).

**Không ép xuống dòng** bằng `<br>`, dấu gạch nối hay khoảng trắng thừa trong nhãn; vị trí xuống dòng do bố cục quyết định.

## Số và số đếm

- Số trong câu viết bằng chữ số: "Xoá 3 nhân viên", "còn 2 ngày phép".
- Tiếng Việt không đổi danh từ theo số: "1 nhân viên", "3 nhân viên". Không viết "nhân viên(s)", không thêm "các" trước số ("3 các nhân viên").
- **Số 0 viết thành câu**: "Chưa có nhân viên nào", không "0 nhân viên". Trong bảng số liệu, 0 vẫn là 0.
- Nhãn của số đếm bắt đầu bằng "Số": "Số người phụ thuộc", "Số ngày phép còn lại".
- Khi sản phẩm có i18n, chuỗi có số đếm dùng cú pháp số nhiều của thư viện dịch (ICU `plural`) dù tiếng Việt chỉ có một dạng.
- Ngày, giờ, số, tiền tệ (một hay nhiều loại tiền trên một màn): theo [Định dạng](/foundations/formatting).

## Biến trong chuỗi

- **Một câu là một chuỗi có tham số đặt tên**: `Đã xoá hợp đồng {code}.` Không ghép `'Đã xoá ' + loại + ' ' + mã`.
- **Không dùng biến cho loại đối tượng.** Viết riêng "Đã xoá hợp đồng {code}." và "Đã xoá đơn nghỉ phép {code}.": từ loại đối tượng đổi trật tự và cách nói khi dịch.
- Nhãn và giá trị ghép trong câu cũng là một chuỗi: `Người tạo: {name}`.
- Tooltip và tên truy cập theo cùng luật: `Xuất {count} chức danh đang lọc ra Excel`.
- Thử với giá trị dài nhất có thật: "Nguyễn Thị Ngọc Diệp", "Phòng Quản trị Nguồn nhân lực và Phát triển Tổ chức".

## Giọng văn

- **Chỉ dẫn dùng động từ trực tiếp**: "Nhập số CCCD.", "Chọn phòng ban." Không mở đầu bằng "Vui lòng".
- **"Vui lòng" chỉ khi hệ thống gây phiền cho người dùng**: lỗi phía hệ thống, bảo trì. "Hệ thống đang bảo trì. Vui lòng thử lại sau 15 phút."
- **Kết quả viết bằng "Đã …"**: "Đã lưu hồ sơ.", không "Lưu hồ sơ thành công". Chữ "thành công" thừa vì "Đã" đã nói việc xong.
- **Không đổ lỗi**: "Mã số thuế gồm 10 hoặc 13 chữ số.", không "Bạn đã nhập sai mã số thuế".
- Gọi người dùng là "bạn" khi cần chủ ngữ ("Bạn không có quyền xem trang này."); thường lược chủ ngữ.
- Không emoji, không chấm than, không viết hoa để nhấn mạnh ("KHẨN").

## Từ chuẩn cho hành động

Nhãn nút là **động từ**, kèm đối tượng khi đứng riêng dễ hiểu sai. Tên truy cập được đầy đủ hơn nhãn: nút "Sửa" trên một hàng có `aria-label="Sửa hồ sơ Nguyễn Văn An"`.

### Tạo, thêm, nhân bản

| Nhãn | Dùng khi | Không nhầm với | Thông báo sau khi xong |
|------|----------|----------------|------------------------|
| **Thêm mới** | Nút tạo bản ghi mới, ngoài cùng bên phải thanh công cụ trang danh sách. Tiêu đề drawer ghi rõ: "Thêm chức danh" | "Tạo mới", "Thêm" trơn trên thanh công cụ | "Đã thêm chức danh “Kế toán tổng hợp”." |
| **Thêm** + mục | Thêm một mục con mới ngay trong form: "Thêm người phụ thuộc", "Thêm bước" | — | — |
| **Thêm vào** + đích, **Gán** | Đưa bản ghi **đã có** vào một tập: "Thêm nhân viên vào nhóm", "Gán người duyệt" | "Thêm mới" (không tạo bản ghi mới) | "Đã thêm 3 nhân viên vào đợt đánh giá Q4/2026." |
| **Tạo** + đối tượng, **Tạo từ mẫu** | Hệ thống sinh đối tượng từ dữ liệu khác: "Tạo bảng lương kỳ 11/2026", "Tạo từ mẫu". Bản ghi chưa có tên gọi tạm là "<Loại> mới" ("Chức danh mới") | "Tạo mới" (thừa chữ) | "Đã tạo bảng lương kỳ 11/2026." |
| **Nhân bản** | Tạo bản ghi mới từ một bản có sẵn rồi sửa. Tiêu đề "Nhân bản chức danh “Kế toán tổng hợp”"; tên điền sẵn thêm hậu tố "(bản sao)"; mã để trống; bản ghi chỉ được tạo khi bấm Lưu | **Sao chép** | "Đã thêm chức danh “Kế toán tổng hợp (bản sao)”." |
| **Sao chép** | Chép chữ hoặc giá trị vào bộ nhớ tạm: "Sao chép mã" | Nhân bản (tạo bản ghi) | "Đã sao chép HĐ-2024-0311." |

### Lưu, gửi

| Nhãn | Dùng khi | Không nhầm với | Thông báo sau khi xong |
|------|----------|----------------|------------------------|
| **Lưu** | Ghi thay đổi, không kích hoạt quy trình. "Lưu" + đối tượng khi trang có nhiều phần lưu riêng | "Cập nhật", "Đồng ý" | "Đã lưu hồ sơ." |
| **Lưu nháp** | Lưu bản chưa hoàn chỉnh; chỉ kiểm các trường tối thiểu | — | "Đã lưu nháp." |
| **Lưu và thêm tiếp** | Lưu rồi mở form trống để nhập bản ghi tiếp theo | — | "Đã thêm chức danh “Kế toán tổng hợp”." |
| **Gửi duyệt** | Đưa bản ghi vào quy trình phê duyệt | "Gửi" trơn | "Đã gửi duyệt đơn nghỉ phép." |
| **Gửi** | Gửi cho một người cụ thể, không qua quy trình duyệt: "Gửi bảng công cho quản lý" | Gửi duyệt | "Đã gửi bảng công cho Trần Thu Hà." |
| **Xong** | Đóng phần con đang sửa và ghi vào bản đang sửa (chưa lưu xuống hệ thống) | Áp dụng, Lưu | — |
| **Áp dụng** | Áp bộ lọc; phát hành cấu hình, chính sách để có hiệu lực ("Áp dụng phiên bản 4") | Lưu | "Đã áp dụng phiên bản 4." |

### Sửa

| Nhãn | Dùng khi | Không nhầm với | Thông báo sau khi xong |
|------|----------|----------------|------------------------|
| **Sửa** | Mở chế độ sửa. Tiêu đề drawer: "Sửa hồ sơ Nguyễn Văn An" | "Chỉnh sửa", "Cập nhật" cho cùng việc | — |
| **Sửa tiếp** | Mở lại bản nháp đang dở | — | — |

### Xoá, bỏ, gỡ, huỷ, đóng

| Nhãn | Dùng khi | Không nhầm với | Thông báo sau khi xong |
|------|----------|----------------|------------------------|
| **Xoá** | Xoá bản ghi **đã lưu**: "Xoá chức danh", "Xoá 3 nhân viên" | Gỡ (bản ghi vẫn còn) | "Đã xoá 3 nhân viên." kèm "Hoàn tác" khi được |
| **Bỏ thay đổi** | Bỏ thay đổi **chưa lưu** | "Xoá thay đổi" | "Đã bỏ thay đổi." |
| **Bỏ bản nháp** | Bỏ bản nháp của một bản ghi đang tạo | Xoá | "Đã bỏ bản nháp." |
| **Gỡ khỏi** + đích | Gỡ tham chiếu, bản ghi vẫn còn: "Gỡ khỏi nhóm", "Gỡ người duyệt" | Xoá (người dùng sợ mất bản ghi) | "Đã gỡ Lê Minh Anh khỏi nhóm." |
| **Bỏ chọn** | Bỏ các hàng đang chọn | Bỏ thay đổi | — |
| **Huỷ** | Đường lui: đóng form hoặc dialog mà không làm gì. Mỗi vùng một nút "Huỷ" | Huỷ + đối tượng | — |
| **Huỷ** + đối tượng | Hành động nghiệp vụ huỷ một bản ghi đã gửi hoặc đang hiệu lực: "Huỷ đơn", "Huỷ hợp đồng". Luôn kèm đối tượng | Huỷ (đường lui) | "Đã huỷ đơn nghỉ phép NP-2026-0412." |
| **Đóng** | Đóng dialog, drawer, panel chỉ để xem; nút duy nhất của hộp báo lỗi hay thông tin | "OK" | — |
| **Ở lại** / **Rời trang** | Hộp hỏi khi rời trang có thay đổi chưa lưu: "Lưu nháp" · "Bỏ thay đổi" · "Ở lại". Không có nháp: "Rời trang" · "Ở lại" | "Có" / "Không" | — |

**Huỷ trùng nghĩa.** Khi hành động là "Huỷ đơn", nút an toàn của dialog xác nhận **không** được là "Huỷ": người dùng không biết "Huỷ" là huỷ đơn hay huỷ thao tác. Dùng **"Không huỷ"** hoặc **"Đóng"**.

### Hiệu lực

| Nhãn | Dùng khi | Thông báo sau khi xong |
|------|----------|------------------------|
| **Ngừng sử dụng** / **Dùng lại** | Bản ghi danh mục (chức danh, phòng ban): không cho chọn mới, dữ liệu cũ giữ nguyên | "Đã ngừng sử dụng 2 chức danh." |
| **Ngừng áp dụng** / **Áp dụng lại** | Chính sách, quy trình, cấu hình có hiệu lực | "Đã ngừng áp dụng quy trình duyệt tăng ca." |

### Phê duyệt

| Nhãn | Dùng khi | Không nhầm với |
|------|----------|----------------|
| **Duyệt** (+ đối tượng) | Đồng ý một đơn hoặc yêu cầu: "Duyệt đơn", "Duyệt 5 đơn". Tên màn hình dùng "Phê duyệt" | "Đồng ý", "OK" |
| **Từ chối** | Không đồng ý, kết thúc đơn; bắt buộc nhập lý do | Trả lại |
| **Trả lại** | Trả về người gửi để sửa rồi gửi lại; đơn vẫn còn | Từ chối |
| **Chuyển tiếp** | Chuyển cho người khác xử lý | Gán |
| **Chấp nhận** / **Từ chối** | Lời mời, phân công việc | Duyệt |
| **Chốt** | Ghi nhận chính thức theo glossary HRM: "Chốt công" | Lưu |

### Nhập, xuất, xem, điều hướng

| Nhãn | Dùng khi |
|------|----------|
| **Xuất Excel** · **Xuất PDF** | Xuất dữ liệu ra tệp. Tên truy cập và tooltip nói phạm vi: "Xuất 7 chức danh đang lọc ra Excel" |
| **Nhập từ Excel** | Nhập dữ liệu từ tệp: "Nhập chức danh từ Excel" |
| **Xem chi tiết** · **Xem thêm** / **Thu gọn** · **Xem tất cả** | Mở chi tiết; mở rộng hoặc thu chữ dài tại chỗ; mở toàn bộ danh sách |
| **Quay lại** · **Bước tiếp theo** · **Bước trước** | Điều hướng. "Tiếp" và "Trước" luôn kèm bổ ngữ: "Nhân viên tiếp theo", "Trang trước" |
| **Lọc** · **Bộ lọc** · **Xoá bộ lọc** | Tooltip của nút icon, nút mở panel lọc, bỏ mọi tiêu chí lọc |
| **Hoàn tác** · **Thử lại** · **Bỏ qua** · **Kiểm tra** · **Chia sẻ** | Hoàn tác thay đổi vừa làm; chạy lại việc vừa lỗi; bỏ qua một mục cần xem xét; kiểm tra mà chưa lưu; chia sẻ |
| **Đăng nhập** · **Đăng xuất** | Không "Login", "Thoát" |

"Xoá" trong "Xoá bộ lọc" và "Xoá giá trị" là cụm cố định cho việc làm trống ô nhập hay tiêu chí; luôn có đối tượng đi kèm nên không lẫn với xoá bản ghi.

## Thông báo & xác nhận

### Dialog xác nhận

- **Tiêu đề là câu hỏi ngắn nêu hành động và đối tượng**: "Xoá 3 hồ sơ?", "Huỷ đơn nghỉ phép NP-2026-0412?", "Rời trang khi chưa lưu?". Dialog chứa form thì tiêu đề là tên hành động: "Từ chối đơn nghỉ phép".
- **Thân nói hậu quả**, nhất là phần không đảo ngược được: "Hồ sơ đã xoá không khôi phục được." Không lặp lại tiêu đề.
- **Nút là động từ lặp lại hành động của tiêu đề**: "Xoá 3 hồ sơ" · "Huỷ". Nút an toàn là "Huỷ"; "Không huỷ" hoặc "Đóng" khi hành động chính là "Huỷ …"; "Ở lại" cho hộp rời trang.
- **Cấm** "Có" / "Không", "OK" / "Huỷ", "Đồng ý", "Xác nhận", "Bạn chắc chứ?", "Bạn có thực sự muốn …": người dùng phải đọc hết câu mới biết bấm gì.
- Ưu tiên hoàn tác hơn hỏi xác nhận khi thao tác đảo ngược được.

### Hộp báo lỗi, thông tin

- Một nút **"Đóng"**. Không "OK".
- Tiêu đề là câu nói việc: "Không gửi được bảng công". Khi chỉ cần nhãn loại, dùng đúng bốn từ: **Lỗi**, **Cảnh báo**, **Thông tin**, **Thành công**.
- Chi tiết kỹ thuật (mã lỗi, mã yêu cầu) để ở phần chi tiết sao chép được, không làm nội dung chính.

### Thông báo kết quả

- **Kết quả đứng đầu**, thì quá khứ, có đối tượng và con số: "Đã duyệt 17 trong 20 đơn. 3 đơn quá hạn nộp nên chưa được duyệt."
- Thông báo lỗi trả lời ba câu hỏi: chuyện gì xảy ra, vì sao, làm gì tiếp. "Không lưu được hợp đồng vì ngày kết thúc trước ngày bắt đầu. Chọn lại ngày kết thúc."
- Kết quả hiện tại chỗ (alert gần vùng vừa thao tác) và đọc qua live region; lỗi cần xử lý không dùng thông báo tự biến mất. Xem [Alert](/components/alert).

### Lỗi và các trạng thái khác của trường

- **Lỗi nói cách sửa, dạng mệnh lệnh có tên trường**: "Nhập họ và tên.", "Chọn phòng ban.", "Mã gồm 2–12 ký tự, chỉ chữ không dấu, số và gạch ngang." Không "Giá trị không hợp lệ", không "Đây là trường bắt buộc".
- **Cảnh báo nói điều bất thường và hệ quả**, không ra lệnh: "Ngày 02/09/2026 là ngày lễ, ngày này không tính phép."
- **Thông tin nói nguồn của giá trị**: "Lấy theo hợp đồng HĐ-2026-0142. Sửa nếu đã có phụ lục."
- Khi cần cho thấy giá trị cũ: "Trước đó: {giá trị cũ}".
- Khi nào dùng trạng thái nào: [Trạng thái › Trạng thái giá trị](/foundations/states#trang-thai-gia-tri).

### Trạng thái rỗng

- Tiêu đề nêu **tên đối tượng**, không dấu chấm: "Chưa có ca làm việc nào", "Không tìm thấy nhân viên nào". Không "Không có dữ liệu".
- Mô tả tối đa ba câu, hướng tới bước tiếp theo: "Thử đổi từ khoá hoặc xoá bộ lọc."

### Danh sách chọn

- Cần thể hiện "chưa chọn gì": mục **ở đầu danh sách, trong ngoặc đơn**, cụ thể theo ngữ cảnh: "(Chưa chọn)", "(Chưa phân công)", "(Chưa chọn quản lý)". Không để mục trống.
- Danh sách dùng để **lọc** cần "mọi giá trị": mục **"Tất cả"** ở đầu.

### Placeholder, tooltip, chữ chờ

- **Placeholder** chỉ gợi ý thêm (ví dụ định dạng), không lặp nhãn, không thay nhãn, không dấu chấm hay ba chấm. Email mẫu dùng tên miền `example.com`: "ten@example.com".
- **Tooltip** chỉ cho ba việc: tên của nút không có chữ (động từ: "Thu gọn menu"), lý do một hành động bị vô hiệu hoá (một câu), toàn văn của chữ bị cắt trên phần tử focus được. Không dùng tooltip để giải thích dài, lặp nhãn đã có, hay bù cho nhãn viết tắt. Nút bật/tắt giữ một nhãn hành động cho cả hai trạng thái ("Ghim cột") và dùng `aria-pressed`.
- **Chữ chờ**: "Đang tải…", "Đang lưu…", "Đang gửi…"; việc dài nêu đúng việc đang làm: "Đang tính lương kỳ 11/2026…".
- **Tên bước** của form nhiều bước là danh từ ("Thông tin chung", "Người phụ thuộc", "Xác nhận"); câu hướng dẫn của bước là mệnh lệnh: "Nhập thông tin tài khoản ngân hàng."

## Nhãn trường quản trị

Các trường có ở hầu hết bản ghi dùng cùng một nhãn ở mọi phân hệ, trong bảng lẫn trang chi tiết:

| Nhãn | Nghĩa | Ghi chú |
|------|-------|---------|
| **Người tạo** | Người tạo bản ghi | Không "Người lập", "Tạo bởi" |
| **Ngày tạo** | Ngày tạo bản ghi | Giờ quan trọng thì "Ngày giờ tạo" |
| **Người sửa** | Người sửa gần nhất | Không "Người cập nhật", "Người chỉnh sửa" |
| **Ngày sửa** | Ngày sửa gần nhất | Giờ quan trọng thì "Ngày giờ sửa" |
| **Hiệu lực từ** / **Hiệu lực đến** | Khoảng thời gian có hiệu lực | Một nhãn cho cả hai giá trị: "Hiệu lực từ/đến" |

Nhãn và giá trị ghép trong câu là một chuỗi: `Người sửa: {name}`.

## Xuống dòng & cắt chữ

Chữ tiếng Việt dài (tên người, tên phòng ban, chức danh) là lỗi hay gặp nhất. Luôn thử với chuỗi dài thật và ở zoom 200%.

### Ưu tiên không cắt

1. **Xuống dòng là mặc định**, nhất là khi: thông tin quan trọng; người dùng phải đọc hết (lý do từ chối, điều khoản); không chắc phần nào quan trọng; nhãn, trạng thái, tiêu đề; thông báo lỗi.
2. **Không xuống dòng, không cắt**: nhãn nút (nhãn quá dài là lỗi nội dung, viết ngắn lại); cụm số và đơn vị ("1.250.000 ₫" không bị tách hai dòng).
3. **Bảng dữ liệu** giữ ô một dòng **mà không cắt**: cột rộng theo nội dung, bảng cuộn ngang; cột văn bản tự do dùng `.nxt-table__wrap` để xuống dòng. Xem [Table](/components/table).
4. **Cắt một dòng** chỉ khi component được thiết kế một dòng để tiết kiệm chiều cao (nhãn sidenav, chip bộ lọc, tag trong cột hẹp) hoặc chữ là thông tin phụ có chỗ xem đầy đủ khác.
5. **Cắt sau N dòng** cho mô tả, ghi chú, đoạn mở đầu của văn bản dài, luôn kèm nút "Xem thêm" / "Thu gọn" (`button` có `aria-expanded`).

### Nếu cắt, phải xem đủ được

Toàn văn phải xem được **bằng một thao tác**, bằng chuột, **bàn phím và cảm ứng**. Chọn ít nhất một trong ba cách:

- **Cơ chế có sẵn của component**: mở danh sách thấy tên đầy đủ; tab tràn dồn vào menu "Xem thêm".
- **Màn chi tiết**: drawer hoặc trang chi tiết mở từ hàng hiện giá trị đầy đủ, xuống dòng.
- **Mở rộng tại chỗ**: "Xem thêm" / "Thu gọn".

Tooltip chỉ là cách **bổ sung** cho chuột và bàn phím, và chỉ trên phần tử nhận focus được: tooltip không có trên cảm ứng, nên không bao giờ là cách duy nhất. **Thuộc tính `title` là không đủ**: bàn phím không mở được, cảm ứng không có, screen reader đọc không nhất quán.

::example{tag-long}

Thêm vài luật:

- Cắt bằng CSS (`text-overflow: ellipsis`, `line-clamp`), **không cắt chuỗi bằng code**: chữ đầy đủ luôn nằm trong DOM cho screen reader và tìm trong trang (Ctrl+F).
- Dấu cắt là "…" ở cuối. Thứ tự focus không thay đổi vì cắt chữ.
- Tiếng Việt ngắt dòng ở khoảng trắng giữa các âm tiết; không bật `hyphens`. Chuỗi không có khoảng trắng (mã, email, URL) dùng `overflow-wrap: anywhere` để không tràn khung.

### Mặc định theo component

| Component | Chữ dài | Xem đủ bằng |
|-----------|---------|-------------|
| [Button](/components/button) | Không xuống dòng, không cắt | Viết ngắn lại |
| [Tag](/components/tag) | Cắt "…" trong chỗ hẹp; `wrap` ở màn chi tiết | Màn chi tiết; tooltip khi thật sự bị cắt |
| [Table](/components/table) | Không cắt; bảng cuộn ngang; `.nxt-table__wrap` cho cột văn bản | Không cần |
| [Tabs](/components/tabs) | Không cắt; tab tràn dồn vào "Xem thêm" | Menu "Xem thêm" |
| [Page header](/components/page-header) | Tiêu đề và breadcrumb xuống dòng | Không cần |
| [Alert](/components/alert), [Descriptions](/components/descriptions), [Timeline](/components/timeline) | Xuống dòng | Không cần |

## Nên và không nên

| Nên | Không nên |
|-----|-----------|
| "Đã lưu hồ sơ." | "Lưu hồ sơ thành công!" |
| "Nhập số CCCD." | "Vui lòng nhập số CCCD" |
| Nút "Xoá 3 hồ sơ" · "Huỷ" | Nút "Có" · "Không" |
| "Huỷ đơn nghỉ phép NP-2026-0412?" · "Huỷ đơn" · "Không huỷ" | "Huỷ đơn nghỉ phép NP-2026-0412?" · "Huỷ đơn" · "Huỷ" |
| "Gỡ khỏi nhóm" (nhân viên vẫn còn) | "Xoá" khi chỉ gỡ khỏi nhóm |
| "Thêm nhân viên vào đợt đánh giá" | "Thêm mới" khi chọn nhân viên có sẵn |
| "Chưa có nhân viên nào" | "0 nhân viên" |
| `Đã xoá hợp đồng {code}.` | `'Đã xoá ' + type + ' ' + code` |
| "(Chưa phân công)" ở đầu danh sách | Mục trống ở đầu danh sách |
| Tên dài cắt "…", hàng mở drawer chi tiết hiện đủ | Tên dài cắt "…", chỉ có `title` |

Tham khảo: SAP Fiori for Web 1.154, các trang UI text guidelines, UX writing for notifications, Wrapping and truncation; luật đã chuyển sang tiếng Việt (tiếng Việt không có title case, dùng ngoặc cong).

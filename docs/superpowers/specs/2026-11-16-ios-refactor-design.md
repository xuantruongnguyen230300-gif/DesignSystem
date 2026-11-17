# Thiết kế: refactor NXT sang giao diện iOS (kiểu C), tối ưu hiệu năng, cài là dùng

> Trạng thái: **đã duyệt** (2026-11-16). Chủ repo chốt: Angular 21, GitHub cá nhân, tên gói qua bí danh npm, test thủ công sau, làm một lượt rồi báo cáo. Chưa có dòng code sản phẩm nào được sửa.
> Hình mẫu đã duyệt: [assets/2026-11-16-style-c-demo.html](assets/2026-11-16-style-c-demo.html) (mở bằng trình duyệt; 3 tab: Component, Đăng nhập, Danh mục; có chế độ tối). Đây là mockup HTML dựng tay, không phải code NXT.

## 1. Vì sao làm

NXT hiện là design system nghiệp vụ gọn, phẳng (bo 6–8px, viền 1px, gần như không bóng). Chủ repo muốn:

1. Đổi diện mạo sang **kiểu iOS**: bo tròn lớn, bóng mềm, đơn giản.
2. Học cách làm của **HeroUI** (thư viện component dựng sẵn, theme bằng biến CSS, cài từng phần) nhưng cho **Angular**.
3. Để **các project sau chỉ cần cài và import là dùng được**, không phải tự cấu hình token, CSS hay theme.
4. Về lâu dài, dùng được cho **nhiều loại web** (không chỉ phần mềm nhân sự).

## 2. Mục tiêu, ngoài phạm vi, điều không được xảy ra

**Mục tiêu (đợt này)**
- G1. Mọi component hiện có trong `packages/ui` mang diện mạo kiểu C, ở light và dark, đủ 3 mật độ.
- G2. **Giữ nguyên** các quyết định về grid, toolbar và nút trên toolbar (mục 4). Chỉ đổi lớp vẻ ngoài, không đổi cấu trúc hay hành vi.
- G3. Hiệu năng đo được và có ngưỡng chặn trong CI (mục 5).
- G4. Một project Angular mới cài `@nxt/ui` và `@nxt/tokens` là chạy được, với tối đa một dòng cấu hình và một dòng import CSS (mục 6).
- G5. Docs site, SPEC, ADR, PLAN cập nhật theo diện mạo mới.

**Ngoài phạm vi (làm sau, mỗi việc một thiết kế riêng)**
- N1. Thêm component mới cho các loại web khác (landing, thương mại điện tử, blog…). Đợt này chỉ chuẩn bị nền (token, đóng gói); danh sách component mới bàn sau khi diện mạo mới ổn định. *(Quyết định của tôi để giữ đợt này làm xong được.)*
- N2. Figma, visual regression đầy đủ, bộ icon mới.
- N3. Đổi stack (vẫn Angular 21 + CDK + token DTCG).

**Điều không được xảy ra (anti-goal)**
- Làm giảm accessibility: WCAG 2.2 AA phải còn đạt ở mọi mode × brand × density; test axe vẫn sạch.
- Lưới mất khả năng lấp đầy màn hình và cuộn trong lưới.
- Thêm giá trị hard-code vào `packages/` hoặc `apps/` (luật cứng #1).
- Dùng kính mờ (backdrop blur), gradient trang trí, glow ngoài các bóng đã định nghĩa.

## 3. Diện mạo kiểu C (đã duyệt)

Giá trị lấy từ mockup; builder chuyển thành token đúng 3 tầng (primitive → semantic → component), không đặt thẳng vào CSS component.

| Yếu tố | Kiểu C |
|--------|--------|
| Nền trang / bề mặt | `#F2F2F7` / trắng. Tối: `#000000` / `#1C1C1E` |
| Bo góc | control 14px; **button, tag, segmented, search, switch: viên thuốc (full)**; card/panel 28px; dialog/popover 32px; avatar tròn |
| Bóng | `raised`: `0 2px 4px rgba(20,30,60,.04), 0 14px 36px rgba(20,30,60,.10)`; `overlay`: `0 24px 64px rgba(20,30,60,.24)`; nút primary có bóng tông màu accent (`0 8px 20px` accent 35%). Bản tối có bộ bóng riêng |
| Viền | Bỏ viền ở card, field, button. Dùng nền và bóng để tách lớp. Đường kẻ mảnh `rgba(60,60,67,.14)` chỉ giữa các hàng danh sách/bảng |
| Field | Nền đặc (`field`), không viền. Focus: viền 2px accent + vòng 4px accent nhạt. Lỗi/cảnh báo: viền màu trạng thái + nền nhạt |
| Chiều cao control (md) | Gọn 28px (giữ như hiện nay) · **Vừa (mặc định) 36px** · Rộng 46px (đúng mockup). Chiều cao hàng bảng và cỡ sm/lg đi theo cùng tỉ lệ; builder đề xuất bảng đầy đủ, giữ nguyên nguyên tắc "mặc định vẫn đủ dày cho dữ liệu" |
| Switch / segmented / checkbox | Switch 51×31 kiểu iOS; segmented dạng viên thuốc có "thanh trượt" nổi; checkbox bo 8px |
| Accent | Xanh iOS làm mặc định, **nhưng phải đạt tương phản** (xem R1) |

**Quyết định về tương phản (chủ repo giao cho tôi, 2026-11-16: "chỉ muốn học theo giao diện iOS cho đẹp").** Tôi **giữ** luật WCAG 2.2 AA của repo (luật cứng #4) và `ds:check` không bị nới. Kiểu C vẫn bỏ viền ở card và button; riêng ô nhập, checkbox và track switch tắt giữ một ranh giới đủ 3:1 theo cách ít lộ nhất (viền mảnh trong suốt dần, hoặc nền/ viền đậm hơn một bậc), để trông vẫn mềm như iOS. Builder đưa các biến thể ra cho chủ repo xem trên docs trước khi chốt giá trị.

**R1. Rủi ro tương phản đã biết.** `#007AFF` chữ trắng trên nền xanh chỉ khoảng 4.0:1, không đạt 4.5:1 cho chữ nhỏ. Builder dùng `npm run ds:palette` / `ds:contrast` để chọn bậc accent gần màu iOS nhất mà vẫn ≥ 4.5:1 (chữ) và ≥ 3:1 (vòng focus, viền control). Tương tự cho chữ tag trên nền nhạt, chữ phụ `#6E6E73` trên `#F2F2F7`, và toàn bộ cặp ở dark. `ds:check` phải sạch; nếu màu iOS nguyên bản không đạt thì dùng màu đạt và ghi vào ADR.

## 4. Quyết định về grid, toolbar, nút: GIỮ NGUYÊN

Nguồn sự thật: [apps/docs/src/content/patterns/list-page.md](../../../apps/docs/src/content/patterns/list-page.md) và SPEC của table, filter, view-manager, page-header. Builder không đổi các điểm sau; chỉ đổi cách chúng trông:

- **Thứ tự toolbar:** ô tìm kiếm · Bộ lọc · khoảng trống · [nghiệp vụ phụ] · Nhập · Xuất · **Cài đặt bảng (luôn cuối nhóm)** · vạch ngăn · **Thêm mới (primary, ngoài cùng)**. Mỗi vùng tối đa một nút primary. Tìm kiếm, Bộ lọc, Thêm mới không bao giờ bị ẩn khi màn hẹp.
- **Hành động nằm trên toolbar**, không nằm trên page header của trang danh sách. Header chỉ có breadcrumb + tiêu đề (trang chi tiết một bản ghi mới có hành động trên header).
- Nhập/xuất Excel là **nút icon có tooltip**; "Thêm mới" là nhãn chuẩn, có `aria-label` đầy đủ đối tượng.
- **Tab nằm trên toolbar**, mỗi tab giữ riêng tìm kiếm, bộ lọc, chế độ xem, sắp xếp, cột, trang, lựa chọn. Tab tràn vào "Xem thêm".
- **Hàng chế độ xem + số bản ghi** nằm trên toolbar; chip bộ lọc + "Xoá bộ lọc" nằm dưới toolbar; khi chọn hàng, **thanh thao tác hàng loạt thay chỗ toolbar**.
- **Lưới lấp đầy màn hình:** chỉ lưới cuộn, cuộn dọc và ngang nằm trong lưới, header bảng dính, cột định danh cố định khi cuộn ngang, vùng cuộn tối thiểu 240px (`layout.scroll-region-min`), chuỗi `nxtFill` → `nxt-card fill` → `nxt-table-scroll fill` giữ nguyên.
- **Thao tác của hàng không chiếm cột** (`nxtRowActions`, hiện khi hover hoặc Tab tới); bấm tên hoặc chỗ trống của hàng mở drawer chi tiết có bản ghi trước/sau (Alt+↑/↓); hàng đang mở (`aria-current`).
- **Chọn hàng:** Shift+click chọn dải, không disable checkbox, giữ chọn sau thao tác, luật xử lý một phần, luật bỏ chọn khi kết quả đổi, hoàn tác thay hộp xác nhận.
- Toàn bộ trạng thái bắt buộc (đang tải, rỗng, không kết quả, đang lọc, đã sửa chế độ xem, lỗi) và luật quyền (ẩn khi thiếu quyền, disable kèm lý do khi sai trạng thái).

**Điểm giao thoa giữa kiểu C và lưới (quyết định của tôi, builder kiểm chứng):**
- Mockup đặt lưới trong card bo 28px có đệm. Card bo lớn **vẫn nằm trong chuỗi lấp đầy**; bo góc chỉ áp lên card ngoài, vùng cuộn bên trong vẫn chạm hết mép dưới và hai bên của card. Các e2e hiện kiểm "lưới chạm đáy và hai mép vùng nội dung" được cập nhật để đo theo mép card, **không được gỡ**.
- Chiều cao hàng bảng và control trên toolbar vẫn do **token mật độ** quyết định (gọn 28 · vừa 36 · rộng 46 cho control md). Mật độ gọn không phình theo kiểu C (giữ dữ liệu dày là lý do tồn tại của lưới). Nút Thêm mới trên toolbar dùng cỡ control theo mật độ, không dùng cỡ `lg`.
- Hàng đang chọn tô nền accent nhạt với hai đầu bo (như mockup) nhưng vẫn kèm dấu hiệu không chỉ dựa vào màu (checkbox + `aria-selected`).

## 5. Hiệu năng

"Giống HeroUI" được hiểu là các thuộc tính kỹ thuật cụ thể, không phải con số quảng cáo (HeroUI không công bố benchmark; chúng ta tự đặt ngưỡng đo được).

**Hiện trạng cần đo trước khi sửa (builder làm bước đầu tiên):**
- `packages/tokens/dist/css/nxt.css` ~ 124 KB, nạp một lần cho mọi component dù app chỉ dùng vài cái.
- CSS khởi tạo của docs vượt ngân sách 600 kB thô (PLAN ghi nhận).
- Component đã standalone, signals, OnPush (38/43 file nguồn), zoneless, mỗi component một entry point `@nxt/ui/<tên>`.

**Việc phải đạt:**
- P1. **Tách `nxt.css` theo component (chủ repo đã xác nhận hướng này, 2026-11-16).** Số đo hiện tại: `nxt.css` 124.769 byte, 2.186 khai báo `--nxt-*`; trong đó nhóm token component chiếm phần lớn (button 104, combobox 95, action-bar 88, form-field 87, table 77, tag 76, calendar 67…), còn lõi dùng chung (color 449, space 62, size 58…) nhỏ hơn nhiều. App chỉ import `@nxt/ui/button` không được phải tải token của calendar, table, combobox… Cách chia:
  - **Lõi** (một file nhỏ): primitive + semantic theo mode/density/motion/brand, reset, focus, utilities.
  - **Token theo component:** mỗi entry point `@nxt/ui/<tên>` mang theo đúng token component của nó (file riêng hoặc gắn vào style của entry), nạp tự động khi component được import, người dùng không phải khai báo thêm.
  - Token component hiện tham chiếu token semantic nên phần lớn không phụ thuộc mode; builder xác nhận điều này trước khi chia. Selector `:root`, `[data-nxt-color]`, `[data-nxt-density]`, `[data-nxt-motion]` giữ nguyên cho lõi.
  - Cổng CI ở P5 đo cả hai bên: lõi và từng entry.
  - Giữ một file gộp `nxt.css` đầy đủ cho ai muốn nạp một lần (không bắt buộc, dùng cho docs và prototype).
- P2. **Bóng và bo lớn không làm chậm.** Không dùng `backdrop-filter`. Không animate `box-shadow`; chuyển trạng thái chỉ animate `transform`, `opacity`, màu (phần tuỳ chọn compositor). Giảm lớp bóng khi `prefers-reduced-motion`/mật độ gọn nếu đo thấy tốn.
- P3. **Lưới có phân trang (chủ repo xác nhận).** Lưới luôn phân trang, tối đa 100 hàng mỗi trang (`pageSizeOptions` 10/20/50/100), nên **không đo 1.000 / 10.000 hàng và không dùng virtual scroll**. Chỉ đo ở cỡ trang lớn nhất (100 hàng × số cột của template Danh mục): thời gian render lần đầu, thời gian đổi trang, độ mượt khi cuộn trong lưới và khi hover hiện thao tác hàng, với diện mạo mới (bo lớn, bóng). Không được tệ hơn baseline. Nếu đo thấy tệ đi thì giảm chi phí vẽ (bóng, `contain`) trước, không đổi cấu trúc lưới. Giữ nguyên header dính, cột cố định, chọn dải Shift, a11y.
- P4. **Không chi phí chạy thừa:** không `ResizeObserver`/listener toàn cục khi component không hiển thị; effect/computed gọn; không đổi detection strategy.
- P5. **Cổng CI:** báo cáo kích thước theo từng entry point (JS và CSS, nén gzip) và **fail khi vượt ngưỡng**. Ngưỡng đặt = số đo baseline của đợt này (trước khi sửa) cộng biên độ do builder đề xuất; mục tiêu là sau refactor mỗi entry **không nặng hơn** baseline, riêng CSS lõi và CSS khởi tạo docs **giảm**, và ngân sách 600 kB của docs hết cảnh báo.
- P6. Bảng số đo trước/sau được ghi vào PLAN, kèm lệnh đã chạy thật (luật cứng #7).

## 6. "Cài là dùng"

**Chấp nhận khi** một project Angular 21 mới, tạo bằng `ng new`, làm được toàn bộ sau chỉ với các bước sau:

1. `npm i @nxt/ui @nxt/tokens` (cùng peer dependency Angular/CDK, được liệt kê rõ).
2. Một dòng import stylesheet (ví dụ `@import '@nxt/ui/styles/nxt.css'` hoặc khai báo trong `angular.json`).
3. Tối đa một provider cấu hình, ví dụ `provideNxt({ brand, mode, density })` (builder quyết tên và hình dạng); mặc định chạy được khi không truyền gì.
4. `import { NxtButton } from '@nxt/ui/button'` rồi dùng; chế độ tối/mật độ đổi bằng thuộc tính trên phần tử gốc theo docs.

Kiểm chứng tự động: một **app tiêu thụ mẫu** trong repo (hoặc script CI) cài từ gói `npm pack`, dựng và chạy smoke test + axe; không dùng đường dẫn tương đối vào `packages/`.

**Phiên bản Angular: phát triển và build trên Angular 21, không hạ xuống 20 (chủ repo chốt lại 2026-11-16, thay cho quyết định "build từ 20" trước đó).** Peer dependency khai báo `>=21.0.0 <23.0.0` cho Angular và CDK; mỗi lần Angular ra bản mới chỉ thêm một mục vào ma trận kiểm. Project dùng Angular 20 trở xuống chưa được hỗ trợ; nếu sau này cần thì làm thành một việc riêng. Không có spike hạ phiên bản. Hệ quả kỹ thuật builder phải xử lý: thư viện Angular biên dịch bằng phiên bản nào thì chỉ chạy trên cùng hoặc **mới hơn**, nên muốn chạy được trên Angular 20 thì gói phát hành phải biên dịch bằng toolchain Angular 20 (hoặc cách tương đương, đã kiểm chứng) và không dùng API chỉ có từ Angular 21. Workspace docs có thể vẫn ở 21. Kiểm chứng bằng **hai app tiêu thụ mẫu** (Angular 20 và 21) trong CI.

**Phát hành (chủ repo chốt: dùng chính tài khoản GitHub đang chứa repo này).** Dùng GitHub Packages (npm registry) của tài khoản `xuantruongnguyen230300-gif`, publish từ chính repo này. Hai hệ quả tôi chưa kiểm chứng và builder phải làm rõ trước khi chốt tên gói:
- Scope gói trên GitHub Packages phải trùng tên tài khoản hoặc tổ chức sở hữu, nên tên `@nxt/ui` chỉ dùng được nếu tạo một tổ chức GitHub tên `nxt` (có thể đã bị người khác dùng). Nếu không, tên gói phải đổi (ví dụ theo tên tài khoản hoặc một tổ chức mới), kéo theo đổi đường dẫn import `@nxt/...` trong toàn repo.
- Người cài thường cần một token đọc trong `.npmrc`, kể cả với gói công khai. Điều này làm "cài là dùng" thêm một bước; docs phải ghi rõ bước đó. Nếu chủ repo muốn bước này biến mất thì phương án thay thế là npm công khai (npmjs.com).

## 7. Cách làm (thứ tự đề xuất, chi tiết do builder lập kế hoạch)

1. Đo baseline hiệu năng (mục 5) và chụp ảnh các trang docs làm mốc.
2. Token: bộ giá trị kiểu C (primitive/semantic/component), accent đạt tương phản, bóng sáng/tối; `ds:check` sạch.
3. Component theo nhóm (hành động → nhập liệu → phản hồi/lớp phủ → dữ liệu → điều hướng/khuôn trang); mỗi nhóm: cập nhật SPEC → CSS → unit test → example → axe.
4. Grid/toolbar/template: khôi phục đủ hành vi mục 4 trên diện mạo mới; làm lại 6 mẫu màn hình HRM có sẵn trên diện mạo mới; Đăng nhập và Danh mục theo sát mockup nhưng giữ luật mục 4.
5. Tối ưu: tách CSS theo entry, đo lưới lớn, cổng kích thước CI.
6. Đóng gói và app tiêu thụ mẫu.
7. Docs, ADR mới (diện mạo iOS; sửa luật "không bóng/blur" trong `docs/design/principles.md` thành luật chính xác: cho phép bo lớn và bóng đã định nghĩa, vẫn cấm kính mờ, gradient trang trí, glow), PLAN.

## 8. Câu hỏi mở và việc để builder quyết

**Đã được chủ repo trả lời (2026-11-16):**
- O1. Phát hành qua GitHub cá nhân (xem mục 6 về scope và token đọc).
- O2. Hỗ trợ Angular 20 trở lên (xem mục 6).
- O3. Refactor trước, commit sau. Hệ quả: working tree hiện có 193 mục chưa commit (đợt Fiori, gồm 13 component mới như switch, calendar, combobox, view-manager) là **đối tượng được refactor và là baseline đo**; "component hiện có" nghĩa là mọi component có trong working tree. Diff của refactor sẽ lẫn với đợt Fiori, nên builder ghi lại bảng số đo baseline và danh sách file đã đụng; không tự commit.
- CoreAndSkill (PrimeNG): **không liên quan đợt này**. Token và API có thể đổi tên hoặc xoá khi cần (gói đang ở 0.x); không làm lớp ghi đè PrimeNG; ghi các thay đổi phá vỡ vào ghi chú migration cho project dùng sau.
- Tương phản: chủ repo giao tôi quyết; xem mục 3.
- Chiều cao theo mật độ: theo đề xuất 28 · 36 · 46.

**Quyết định của tôi (chủ repo có thể đổi):**
- Đợt này không thêm component mới (N1).
- Giữ bóng tông màu cho nút primary như mockup đã duyệt, và sửa văn bản luật cấm "glow" cho khớp (mục 7.7).
- Chiều cao theo mật độ, card bo lớn nằm trong chuỗi lấp đầy (mục 4).
- **Mockup là chuẩn về diện mạo; khi mâu thuẫn với luật thì luật thắng.** Cụ thể: avatar dùng màu chỉ thị `color.indication` thay vì gradient; không lồng card trong card (các khối trong mockup là section/divider khi nằm trong card); màu trạng thái (xanh, cam, đỏ) và màu switch-on lấy từ token trạng thái, chỉnh gần tông iOS nhưng đạt tương phản; toast và tooltip dùng bề mặt đảo (tối) cả ở chế độ sáng nếu đạt tương phản; phân trang tròn và shell nổi (sidenav bo, topbar viên thuốc, có khoảng hở) làm theo mockup nhưng **không được phá chuỗi lấp đầy và các e2e lưới** (mục 4).
- **Chữ giữ nguyên:** Plus Jakarta Sans và thang chữ hiện tại (ADR-010 không bị thay). Mockup dùng font hệ thống chỉ vì chưa nạp font. "Cài là dùng" gồm cả font: gói tự mang font hoặc rơi về font hệ thống, không bắt người dùng cài thêm.
- **Hai mẫu màn hình có sẵn được làm lại, không dựng thêm trang mới:** `templates/login.md` và `templates/catalog.md` đổi diện mạo theo mockup, giữ nội dung và luật mục 4 (mockup đặt Nhập/Xuất/Thêm mới ở page header chỉ là bản minh hoạ, luật mục 4 thắng: các nút này nằm trên toolbar). Làm lại cả 6 mẫu hiện có (Tổng quan, Danh mục, Phê duyệt, Quy trình duyệt, Đăng nhập, Hồ sơ nhân viên).
- **SPEC:** duyệt bản thiết kế này là duyệt luôn các thay đổi SPEC thuần diện mạo (token, bo góc, bóng, kích thước). SPEC nào đổi hành vi, API hoặc keyboard map thì builder dừng lại hỏi chủ repo.

**Các việc tôi thêm sau khi rà rủi ro (chủ repo có thể bỏ):**
- Chủ repo đã bỏ hai việc tôi đề xuất: **không sao lưu** working tree trước khi sửa, **không làm ảnh chụp mốc**; chủ repo tự test thủ công sau khi nhận báo cáo. Lệnh kiểm của repo (`ds:check`, `npm test`, `npm run build`) vẫn chạy để báo kết quả thật; test axe/e2e chạy được thì chạy, không thì ghi rõ chưa chạy.
- **Chạy một lượt:** chủ repo muốn làm hết trong một lần rồi nhận một báo cáo cuối, không dừng ở giữa chừng để hỏi, trừ khi gặp SPEC đổi hành vi hoặc cản trở không tự giải quyết được.
- **Tên gói:** hướng ưu tiên giữ `@nxt/*` trong repo và code; gói phát hành mang scope theo tài khoản GitHub, người dùng cài bằng bí danh npm (`"@nxt/ui": "npm:@<scope>/ui@^x"`). Builder phải kiểm chứng việc này chạy được với peer dependency giữa `ui` và `tokens`; nếu không chạy được thì đổi tên theo scope thật.

**Để builder quyết:** tên và hình dạng provider cấu hình; cách tách CSS theo entry point; có dùng virtual scroll hay không; cách chọn accent đạt tương phản; ngưỡng kích thước CI; có thêm `ng add` hay không.

## 9. Kiểm chứng khi xong

Chỉ ghi "pass" cho lệnh đã chạy thật: `npm run ds:check`, `npm test`, `npm run build`, `npm run test:a11y`, báo cáo kích thước entry point, smoke test app tiêu thụ mẫu cài từ `npm pack`, kèm bảng đo hiệu năng trước/sau.

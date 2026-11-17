# @nxt/ui

Component Angular 21 của NXT Design cho phần mềm nghiệp vụ dữ liệu dày: 40 entry point component (nút, form, bảng, lịch, hộp thoại, khung trang…), giao diện theo Apple HIG, chế độ sáng/tối, ba mức mật độ. Tiếng Việt là ngôn ngữ chính: định dạng `vi-VN`, tìm kiếm không dấu. Standalone, signals, OnPush, hành vi headless từ Angular CDK. Style chỉ dùng token `--nxt-*`. Mỗi component là một entry point (`@nxt/ui/button`, `@nxt/ui/table`…), nên ứng dụng chỉ trả giá cho phần nó import. Giấy phép MIT.

**Mục lục:** [Cài đặt](#cài-vào-dự-án-angular-của-bạn) · [Bắt đầu nhanh](#bắt-đầu-nhanh) · [Cấu hình](#cấu-hình-với-providenxt) · [Đổi màu thương hiệu](#đổi-màu-thương-hiệu) · [Token trong CSS](#dùng-token-trong-css-của-bạn) · [Danh mục component](#danh-mục-component) · [Khả năng tiếp cận](#khả-năng-tiếp-cận) · [Hiệu năng](#hiệu-năng) · [Hỗ trợ và phiên bản](#hỗ-trợ-và-phiên-bản) · [Lỗi thường gặp](#lỗi-thường-gặp)

## Cài vào dự án Angular của bạn

Yêu cầu: Angular `>=21 <23`, Node ≥ 20.19, npm. Gói nằm trên GitHub Packages; GitHub bắt đăng nhập kể cả khi đọc gói công khai, nên cần một token đọc, tạo một lần.

**1. Tạo token.** Vào [Personal access token (classic)](https://github.com/settings/tokens), tạo token với quyền `read:packages` và chép giá trị đó.

**2. Đặt token vào biến môi trường `GITHUB_TOKEN`** (không ghi token vào file nào của project):

```bash
# macOS / Linux (thêm vào ~/.bashrc hoặc ~/.zshrc để giữ lâu dài)
export GITHUB_TOKEN=<token>
```

```powershell
# Windows PowerShell: chỉ phiên hiện tại
$env:GITHUB_TOKEN = "<token>"
# Windows: giữ lâu dài (mở terminal mới sau khi chạy)
setx GITHUB_TOKEN "<token>"
```

**3. Tạo file `.npmrc`** ở thư mục gốc project (cạnh `package.json`). File này không chứa token nên commit được:

```ini
@xuantruongnguyen230300-gif:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

**4. Cài bằng alias.** Đừng chạy lệnh `npm install @xuantruongnguyen230300-gif/ui` mà trang gói gợi ý: các file bên trong gói tự import nhau bằng `@nxt/ui/...`, nên thư mục trong `node_modules` phải tên `@nxt`, và alias làm đúng việc đó.

```bash
npm install @nxt/ui@npm:@xuantruongnguyen230300-gif/ui @nxt/tokens@npm:@xuantruongnguyen230300-gif/tokens @angular/cdk
```

`package.json` sẽ có `"@nxt/ui": "npm:@xuantruongnguyen230300-gif/ui@^…"`; trong code vẫn viết `@nxt/...`.

**5. Nạp style** trong `src/styles.css`:

```css
@import '@nxt/tokens/css/core.css';
@import '@nxt/ui/styles/nxt.css';
```

Xong. `provideNxt()` ở [mục Cấu hình](#cấu-hình-với-providenxt) không bắt buộc, chỉ cần khi muốn chế độ tối, mật độ hay màu thương hiệu riêng.

### Cập nhật phiên bản

```bash
npm update @nxt/ui @nxt/tokens
```

Thay đổi từng phiên bản ở [CHANGELOG](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/CHANGELOG.md).

### CI của project dùng NXT

`npm ci` cần cùng hai thứ: file `.npmrc` ở trên và biến `GITHUB_TOKEN`. Lưu một token có quyền `read:packages` thành secret của CI rồi truyền vào biến đó (ví dụ GitHub Actions: `env: GITHUB_TOKEN: ${{ secrets.NXT_READ_TOKEN }}`).

## Bắt đầu nhanh

Một màn hình đủ ba thứ hay gặp nhất: form, nút và bảng. Chép vào `src/app/quickstart.ts`, rồi đặt `<app-quickstart />` vào template của một component hay route.

```ts quickstart
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtGrid, NxtSpan, NxtStack } from '@nxt/ui/layout';
import { NxtTable } from '@nxt/ui/table';
import { NxtTag } from '@nxt/ui/tag';

@Component({
  selector: 'app-quickstart',
  imports: [NxtButton, NxtFormField, NxtInput, NxtGrid, NxtSpan, NxtStack, NxtTable, NxtTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-stack gap="md">
      <nxt-grid gap="md">
        <nxt-form-field label="Họ và tên" required [nxtSpan]="{ base: 12, md: 6 }">
          <input nxtInput autocomplete="off" />
        </nxt-form-field>
        <nxt-form-field label="Email công ty" [nxtSpan]="{ base: 12, md: 6 }">
          <input nxtInput type="email" autocomplete="off" />
        </nxt-form-field>
      </nxt-grid>

      <div>
        <button nxtButton variant="primary" type="button" (click)="saved.set(true)">Lưu hồ sơ</button>
        @if (saved()) {
          <nxt-tag tone="success">Đã lưu</nxt-tag>
        }
      </div>

      <div class="table-wrap" role="region" aria-label="Danh sách nhân viên" tabindex="0">
        <table nxtTable>
          <caption>Nhân viên phòng Kế toán</caption>
          <thead>
            <tr>
              <th scope="col">Mã NV</th>
              <th scope="col">Họ và tên</th>
              <th scope="col" class="nxt-table__num">Ngày công</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows; track row.code) {
              <tr>
                <td>{{ row.code }}</td>
                <th scope="row">{{ row.name }}</th>
                <td class="nxt-table__num">{{ row.days }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </nxt-stack>
  `,
  styles: `
    .table-wrap {
      overflow-x: auto;
    }
    .table-wrap:focus-visible {
      outline: var(--nxt-focus-ring-width) solid var(--nxt-focus-ring-color);
      outline-offset: var(--nxt-focus-ring-offset);
    }
  `,
})
export class Quickstart {
  protected readonly saved = signal(false);
  protected readonly rows = [
    { code: 'NV001', name: 'Nguyễn Thị Ngọc Diệp', days: 22 },
    { code: 'NV002', name: 'Trần Văn Bình', days: 21 },
  ];
}
```

Đoạn mã này được biên dịch và chạy axe trong CI (một app Angular riêng cài gói như bước trên), nên nó luôn chạy được với phiên bản hiện tại.

## Cấu hình với `provideNxt`

Một dòng khi khởi động ứng dụng, trong `src/app/app.config.ts`. Mọi tuỳ chọn đều không bắt buộc:

```ts
import { ApplicationConfig } from '@angular/core';
import { provideNxt } from '@nxt/ui';

export const appConfig: ApplicationConfig = {
  providers: [provideNxt({ color: 'auto', density: 'comfortable', primary: '#0f766e' })],
};
```

| Tuỳ chọn | Giá trị | Mặc định | Ghi chú |
|----------|---------|----------|---------|
| `color` | `'light'` · `'dark'` · `'auto'` | sáng | `auto` theo cài đặt của hệ điều hành |
| `density` | `'comfortable'` · `'compact'` · `'spacious'` | `comfortable` | Chiều cao control và hàng bảng; cỡ chữ không đổi. Màn cảm ứng nên dùng `spacious` (vùng chạm 44px) |
| `motion` | `'full'` · `'reduced'` | theo `prefers-reduced-motion` | Thời lượng chuyển động |
| `primary` | màu gốc hoặc thang 11 bậc | xanh mặc định | Màu thương hiệu, xem mục dưới |
| `brand` | tên file brand | không | Chỉ cho brand dựng sẵn trong gói (hiện có `sample`); thường dùng `primary` thay cho nó |

`provideNxt` chỉ ghi các thuộc tính `data-nxt-color`, `data-nxt-density`, `data-nxt-motion`, `data-nxt-brand` lên `<html>`. Cùng các thuộc tính đó đặt được trên **bất kỳ phần tử nào**, ví dụ một vùng tối hay một bảng gọn trong trang sáng:

```html
<section data-nxt-color="dark" data-nxt-density="compact">…</section>
```

## Đổi màu thương hiệu

Màu chủ đạo là một thang 11 bậc `--nxt-color-brand-50 … 950`. Nút chính, link, mục được chọn, vòng focus, slider… đều lấy từ thang này, ở cả chế độ sáng và tối. Màu trạng thái (lỗi, thành công, cảnh báo, thông tin) **không đổi** theo sản phẩm. Không cần build lại thư viện; có ba cách:

```ts
provideNxt({ primary: '#0f766e' });          // 1. lúc khởi động
inject(NxtTheme).setPrimary('#e11d48');      // 2. lúc chạy (người dùng chọn màu); resetPrimary() để về mặc định
```

```bash
npx nxt-palette "#0f766e" > brand.css        # 3. CSS tĩnh, nạp sau core.css
```

- `primary` nhận một màu gốc (`#rrggbb`, `rgb()`, `oklch()`) hoặc một thang đầy đủ `{ 50: '…', … 950: '…' }`.
- Với **mọi** màu gốc, chữ trắng trên nút và màu link đạt WCAG 2.2 AA (4,5:1) ở cả sáng và tối; một test quét hơn 1000 màu chứng minh điều đó. Màu gốc sáng (vàng) cho nút đậm hơn màu đã nhập một chút, để chữ trắng đọc được.
- Cách 1 và 2 đổi cho **cả ứng dụng**. Một vùng con khác màu cần file brand riêng.
- Thang tự làm không được bảo đảm tương phản; ở chế độ dev, `NxtTheme` cảnh báo trong console cặp màu không đạt (thang vẫn được áp dụng).

Chi tiết và lý do thiết kế: [ADR-015](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/docs/adr/015-consumer-theming.md).

## Dùng token trong CSS của bạn

Mọi giá trị giao diện là biến CSS `--nxt-*`. Trong CSS của ứng dụng, dùng chúng thay cho màu, cỡ và z-index viết cứng: đổi chế độ sáng/tối, mật độ hay màu thương hiệu thì phần của bạn đổi theo.

```css
.summary-card {
  padding: var(--nxt-space-inset-md);
  color: var(--nxt-color-text-default);
  background: var(--nxt-color-bg-surface);
  border: 1px solid var(--nxt-color-border-default);
  border-radius: var(--nxt-radius-container);
  box-shadow: var(--nxt-elevation-card);
}
```

| Nhóm | Biến thường dùng |
|------|------------------|
| Nền | `--nxt-color-bg-canvas`, `--nxt-color-bg-surface`, `--nxt-color-bg-primary`, `--nxt-color-bg-danger` |
| Chữ | `--nxt-color-text-default`, `--nxt-color-text-subtle`, `--nxt-color-text-link`, `--nxt-color-text-danger` |
| Viền | `--nxt-color-border-default`, `--nxt-color-border-input`, `--nxt-color-border-selected`, `--nxt-focus-ring-color` |
| Khoảng cách | `--nxt-space-1` … `--nxt-space-12`, `--nxt-space-inset-sm`, `--nxt-space-inset-md` |
| Bo góc, độ nổi | `--nxt-radius-control`, `--nxt-radius-container`, `--nxt-elevation-card`, `--nxt-elevation-overlay` |
| Chữ (font shorthand) | `--nxt-typography-body-md`, `--nxt-typography-heading-md`, `--nxt-font-family-sans` |
| Lớp, chuyển động | `--nxt-z-sticky`, `--nxt-z-modal`, `--nxt-duration-150` |

Danh sách đầy đủ nằm trong `node_modules/@nxt/tokens/css/core.css`; `@nxt/tokens/json/tokens.json` có cùng dữ liệu dạng JSON. Có sẵn vài class tiện ích: `nxt-text-body-md`, `nxt-text-heading-md`, `nxt-text-strong`, `nxt-text-subtle`, `nxt-tabular-nums`, `nxt-truncate`, `nxt-visually-hidden`.

**Chỉnh một component** bằng cách ghi đè token của chính nó trên phần tử cha, không cần `::ng-deep` hay `!important`. CSS của ứng dụng viết ngoài các `@layer` của NXT luôn thắng:

```css
.approval-bar {
  --nxt-button-primary-bg: var(--nxt-color-bg-danger); /* mọi nút chính trong .approval-bar thành màu nguy hiểm */
}
```

## Danh mục component

Mỗi component có `SPEC.md`: mục đích, khi nào dùng, API, bàn phím, token, tiêu chí nghiệm thu. Bấm tên entry point để mở.

<!-- nxt-components:begin (generated by tools/docs/readme-catalog.mjs; run: npm run readme:catalog) -->

**Hành động**

| Entry point | Import | Dùng để |
|-------------|--------|---------|
| [`@nxt/ui/button`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/button/SPEC.md) | `NxtButton` | Kích hoạt một hành động trên trang hiện tại — lưu, gửi duyệt, xoá, mở dialog |
| [`@nxt/ui/menu`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/menu/SPEC.md) | `NxtMenu` | Danh sách lệnh nổi mở từ một nút — thao tác trên một hồ sơ, lựa chọn hiển thị, menu tài khoản |
| [`@nxt/ui/segmented`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/segmented/SPEC.md) | `NxtSegmented` | Chọn một trong 2–5 lựa chọn luôn hiển thị — kỳ báo cáo, kiểu hiển thị, loại đơn — có hiệu lực ngay |

**Nhập liệu**

| Entry point | Import | Dùng để |
|-------------|--------|---------|
| [`@nxt/ui/form-field`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/form-field/SPEC.md) | `NxtFormField` | Nhãn, ô nhập, gợi ý và trạng thái giá trị (lỗi, cảnh báo, thông tin, thành công) trong một khối; có chế độ chỉ đọc cho form hỗn hợp và tự nối id, aria-describedby, aria-invalid, aria-required |
| [`@nxt/ui/checkbox`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/checkbox/SPEC.md) | `NxtCheckbox` | Chọn một hoặc nhiều mục độc lập, có nhóm với lỗi cấp nhóm, ô xác nhận bắt buộc, chỉ đọc, indeterminate cho "chọn tất cả" và chạy được với Angular forms |
| [`@nxt/ui/radio-group`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/radio-group/SPEC.md) | `NxtRadioGroup` | Chọn đúng một trong 3–8 phương án luôn hiển thị trong form — hình thức làm việc, loại hợp đồng — có lỗi cấp nhóm, chỉ đọc và chạy với Angular forms |
| [`@nxt/ui/switch`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/switch/SPEC.md) | `NxtSwitch` | Bật/tắt một thiết lập có hiệu lực ngay, không cần bấm Lưu — nhận thông báo, tự chuyển đơn kế tiếp; nhãn đứng trước hoặc trên, không chữ trong rãnh |
| [`@nxt/ui/stepper`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/stepper/SPEC.md) | `NxtStepper` | Chỉnh một con số trong khoảng hẹp bằng nút − / + hoặc gõ thẳng — số ngày nghỉ, số lượng cần tuyển, hệ số lương; mũi tên và Page Up / Page Down trên ô giá trị, kẹp vào khoảng cho phép *(bản nháp)* |
| [`@nxt/ui/slider`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/slider/SPEC.md) | `NxtSlider` | Chọn một giá trị trong khoảng bằng cách kéo hoặc bấm lên thanh — ngưỡng cảnh báo, tỉ trọng, mức ưu tiên; nhãn hoặc icon hai đầu, giá trị hiện bên cạnh, mũi tên và Page Up / Page Down trên thanh *(bản nháp)* |
| [`@nxt/ui/combobox`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/combobox/SPEC.md) | `NxtCombobox` | Chọn một hoặc nhiều giá trị trong danh sách 13–200 mục bằng cách gõ vài chữ, có dấu hay không dấu, theo tên hoặc mã; lưu khoá, chặn giá trị tự nhập, chạy trong nxt-form-field và Angular forms |
| [`@nxt/ui/date-picker`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/date-picker/SPEC.md) | `NxtDatePicker` | Ô nhập ngày (một ngày hoặc một khoảng) gõ được `06112026` hay `6/11/2026` hoặc chọn trên lịch; lưu ISO `yyyy-MM-dd`, hiển thị `dd/MM/yyyy`, không bao giờ đọc nhầm tháng trước ngày |
| [`@nxt/ui/calendar`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/calendar/SPEC.md) | `NxtCalendar` | Lưới lịch tháng luôn hiển thị để chọn một ngày hoặc một khoảng khi người dùng cần thấy thứ trong tuần, ngày lễ và ngày nghỉ; tuần bắt đầu Thứ Hai, phím theo WAI-ARIA APG |
| [`@nxt/ui/search`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/search/SPEC.md) | `NxtSearch` | Ô tìm kiếm cho danh sách và panel chọn — gõ có dấu hay không dấu đều tìm được, Esc xoá nội dung, có debounce khi mỗi lần gõ gọi máy chủ |
| [`@nxt/ui/filter`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/filter/SPEC.md) | `NxtFilter` | Nút "Bộ lọc" mở panel chứa mọi tiêu chí lọc của danh sách, áp dụng bằng "Áp dụng", kèm hàng chip cho biết đang lọc gì và bỏ từng tiêu chí bằng một cú bấm |
| [`@nxt/ui/value-help`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/value-help/SPEC.md) | `NxtValueHelp` | Chọn một hoặc nhiều bản ghi từ danh mục lớn có nhiều thuộc tính (nhân viên > 1.000) bằng ô tìm trên mọi cột và bảng kết quả; đặt trong dialog khi trường ở trang, hoặc làm một bước ngay trong drawer |
| [`@nxt/ui/view-manager`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/view-manager/SPEC.md) | `NxtViewManager` | Lưu cách xem một danh sách (tìm kiếm, bộ lọc, sắp xếp, cột, số dòng) thành "chế độ xem" có tên để mở lại bằng một cú bấm, kèm dấu "Đã sửa" khi màn hình lệch chế độ xem đã lưu |

**Bố cục và khung trang**

| Entry point | Import | Dùng để |
|-------------|--------|---------|
| [`@nxt/ui/layout`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/layout/SPEC.md) | `NxtFill, NxtGrid, NxtInline, NxtSpan, NxtStack` | Xếp dọc có khoảng cách đều theo mật độ (`nxt-stack`), xếp ngang tự xuống dòng (`nxt-inline`), lưới 12 cột phản hồi theo bề rộng của chính nó (`nxt-grid`, `nxtSpan`), thay cho margin viết tay |
| [`@nxt/ui/app-shell`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/app-shell/SPEC.md) | `NxtAppShell` | Khung của ứng dụng nghiệp vụ — điều hướng bên trái, thanh trên cùng, vùng nội dung — tự thành ngăn kéo trên màn hình hẹp |
| [`@nxt/ui/page-header`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/page-header/SPEC.md) | `NxtPageHeader` | Đầu trang — vị trí trong cây trang, tiêu đề, mô tả, trạng thái và các hành động chính của trang |
| [`@nxt/ui/object-page`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/object-page/SPEC.md) | `NxtObjectPage` | Khuôn trang chi tiết một đối tượng có nhiều phần (hồ sơ, hợp đồng, đơn) — khối tóm tắt co lại khi cuộn, thanh neo theo phần đang xem hoặc tab, thanh chân dính đáy cho Huỷ / Lưu |
| [`@nxt/ui/action-bar`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/action-bar/SPEC.md) | `NxtActionBar` | Thanh dính đáy vùng nội dung cho hành động kết thúc của trang sửa/tạo (Lưu, Huỷ, Gửi duyệt), kèm nút thông báo đếm lỗi mở danh sách và đưa tới đúng trường |
| [`@nxt/ui/card`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/card/SPEC.md) | `NxtCard` | Bề mặt trắng gom một nhóm nội dung trên nền canvas xám; trên trang tổng quan là thẻ có bộ đếm, chỉ số và liên kết tới danh sách đã lọc sẵn |
| [`@nxt/ui/descriptions`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/descriptions/SPEC.md) | `NxtDescriptions` | Danh sách nhãn – giá trị chỉ đọc cho màn chi tiết và drawer xem nhanh; số cột tự co theo bề rộng |

**Điều hướng**

| Entry point | Import | Dùng để |
|-------------|--------|---------|
| [`@nxt/ui/tabs`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/tabs/SPEC.md) | `NxtTabs` | Chia nội dung của một trang thành các phần ngang hàng, hoặc làm bộ lọc chính phía trên danh sách |
| [`@nxt/ui/pagination`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/pagination/SPEC.md) | `NxtPagination` | Chia danh sách dài thành trang — tóm tắt "Hiển thị 1–20 trong 1.284", số dòng mỗi trang, trang trước/sau và số trang |

**Hiển thị dữ liệu**

| Entry point | Import | Dùng để |
|-------------|--------|---------|
| [`@nxt/ui/table`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/table/SPEC.md) | `NxtTable` | Bảng dữ liệu trên thẻ table native, có header dính, sắp xếp theo cột với aria-sort, chọn nhiều hàng, tô sáng hàng, hàng đang mở, cố định cột định danh, tuỳ biến cột, đổi độ rộng cột và trạng thái đang tải |
| [`@nxt/ui/tag`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/tag/SPEC.md) | `NxtTag` | Tag gắn nhãn trạng thái hoặc phân loại bằng chữ; badge đếm số mục cần chú ý. Màu chỉ hỗ trợ, không bao giờ là tín hiệu duy nhất |
| [`@nxt/ui/avatar`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/avatar/SPEC.md) | `NxtAvatar` | Ảnh đại diện, hoặc chữ cái đầu theo Họ + Tên trên nền màu cố định theo tên, để cùng một người luôn có cùng một màu |
| [`@nxt/ui/progress`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/progress/SPEC.md) | `NxtProgress` | Thanh hoặc vòng tiến độ cho tỉ lệ hoàn thành, hạn mức đã dùng, cơ cấu theo nhóm, hoặc tác vụ chưa biết còn bao lâu; luôn có tên và giá trị đọc được |
| [`@nxt/ui/timeline`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/timeline/SPEC.md) | `NxtTimeline` | Danh sách các mốc theo thời gian, như các bước của một quy trình duyệt, lịch sử thay đổi hồ sơ hay luồng hoạt động |
| [`@nxt/ui/icon`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/icon/SPEC.md) | `NxtIcon` | Bộ 259 icon nét (Tabler, MIT) có kiểu tên chặt — trang trí mặc định, tự lấy kích thước từ component chứa nó |
| [`@nxt/ui/skeleton`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/skeleton/SPEC.md) | `NxtSkeleton` | Khối giữ chỗ đúng hình nội dung sắp có (dòng chữ, tiêu đề, ô nhập, avatar, khối) khi tải lâu hơn khoảng 1 giây — thay cho spinner toàn trang |

**Phản hồi và lớp phủ**

| Entry point | Import | Dùng để |
|-------------|--------|---------|
| [`@nxt/ui/alert`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/alert/SPEC.md) | `NxtAlert` | Thông báo trong trang về kết quả của thao tác vừa làm, kèm nút làm tiếp như "Hoàn tác", "Thử lại"; lỗi cấp trang; lưu ý thường trực |
| [`@nxt/ui/toast`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/toast/SPEC.md) | `NxtToast` | Xác nhận ngắn rằng thao tác vừa làm đã thành công ("Đã lưu hồ sơ"), hiện ở đáy vùng nội dung rồi tự ẩn, không ngắt người dùng; không dùng cho lỗi |
| [`@nxt/ui/dialog`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/dialog/SPEC.md) | `NxtDialog` | Hộp thoại giữa màn hình để xác nhận việc không hoàn tác được, cảnh báo rời trang khi chưa lưu, hỏi một câu ngắn, hoặc báo một tin người dùng phải đọc (lỗi hệ thống, số quyết định) |
| [`@nxt/ui/drawer`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/drawer/SPEC.md) | `NxtDrawer` | Panel trượt ra từ cạnh cuối màn hình để xem nhanh chi tiết hoặc tạo, sửa một bản ghi mà không rời trang danh sách |
| [`@nxt/ui/popover`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/popover/SPEC.md) | `NxtPopover` | Panel nổi neo vào một nút để xem nhanh hoặc làm một việc nhỏ gắn với phần tử đó (thẻ nhân viên, danh sách thông báo, xác nhận nhanh) mà không rời trang và không khoá trang |
| [`@nxt/ui/tooltip`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/tooltip/SPEC.md) | `NxtTooltip` | Gợi ý ngắn hiện khi rê chuột hoặc focus vào một phần tử, chủ yếu để gọi tên nút chỉ có icon |
| [`@nxt/ui/empty-state`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/empty-state/SPEC.md) | `NxtEmptyState` | Thay cho vùng dữ liệu trống, giải thích vì sao chưa có gì để hiện và đưa ra bước tiếp theo |

**Tiện ích**

| Entry point | Import | Dùng để |
|-------------|--------|---------|
| [`@nxt/ui/format`](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/packages/ui/format/SPEC.md) | `(pipe, hàm)` | Luật hiển thị ngày, giờ, số, tiền, phần trăm, đơn vị và giá trị rỗng theo vi-VN, kèm hàm và pipe của @nxt/ui/format để mọi màn hình viết giống nhau |

<!-- nxt-components:end -->

## Khả năng tiếp cận

- WCAG 2.2 AA là điều kiện tối thiểu; bàn phím theo WAI-ARIA APG, vùng chạm theo mật độ.
- CI chạy axe trên **mọi** ví dụ ở chế độ sáng, tối và gọn, cùng các bài kiểm tra bàn phím (hiện 660 bài), và kiểm tương phản của mọi tổ hợp chế độ × brand (hơn 1100 phép).
- Ngoại lệ có chủ đích: viền ô nhập và checkbox nhạt (khoảng 1,6:1, thấp hơn 3:1 của WCAG 1.4.11) để giữ giao diện phẳng kiểu Apple; vòng focus vẫn đạt. Lý do và đánh đổi: [ADR-012](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/docs/adr/012-ios-visual-language.md).

## Hiệu năng

- Token của một component đi cùng chính component đó: import `@nxt/ui/button` thì mới nạp token của nút. `core.css` khoảng 4,4 KB nén gzip; token của một component tối đa khoảng 0,7 KB gzip.
- Một app Angular mẫu, build production (số đo chưa nén, đã gồm Angular): 5 component cho 294 KB JS; thêm cả màn hình "Bắt đầu nhanh" ở trên (form, lưới, bảng) thì 349 KB JS; CSS 35 KB trong cả hai trường hợp.
- Kích thước từng entry point bị chặn bởi ngân sách trong CI (`npm run size:check`).

## Hỗ trợ và phiên bản

- Angular `>=21 <23` (đã thử trên 21.2), Node ≥ 20.19.
- Đã thử cài bằng **npm**. pnpm và yarn hỗ trợ cú pháp alias `npm:` nhưng chưa thử.
- **Render phía máy chủ (SSR) chưa được kiểm.** Vài component (`toast`, `object-page`, `popover`, `action-bar`) dùng `window`/`document` trực tiếp.
- Phiên bản `0.x`: API có thể đổi giữa các bản minor; mọi thay đổi ghi trong [CHANGELOG](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/CHANGELOG.md).

## Lỗi thường gặp

| Triệu chứng | Nguyên nhân thường gặp | Cách sửa |
|-------------|------------------------|----------|
| `E401` hoặc `E403` khi cài | Token thiếu, hết hạn hoặc không có quyền `read:packages` | Tạo lại token (classic) với quyền đó |
| `E404` với `@xuantruongnguyen230300-gif/ui` | `.npmrc` thiếu dòng `registry`, hoặc `.npmrc` không nằm ở thư mục gốc project | Kiểm tra bước 3 |
| `Failed to replace env in config: ${GITHUB_TOKEN}` | Biến `GITHUB_TOKEN` chưa được đặt trong terminal đang chạy | Làm lại bước 2 và mở terminal mới |
| Build báo `Could not resolve "@nxt/ui/…"` | Đã cài thẳng theo tên scope, không qua alias | Gỡ gói đó (`npm uninstall @xuantruongnguyen230300-gif/ui @xuantruongnguyen230300-gif/tokens`) rồi cài lại bằng bước 4 |
| Cảnh báo thiếu peer `@angular/cdk` | Chưa cài CDK | `npm install @angular/cdk` |
| Giao diện không có style | Quên bước 5 (nạp hai file CSS) | Thêm hai dòng `@import` vào `src/styles.css` |

## Đóng góp và giấy phép

Phát triển thư viện (clone, `npm start`, test, phát hành): xem [README của repo](https://github.com/xuantruongnguyen230300-gif/DesignSystem#readme) và [quy ước component](https://github.com/xuantruongnguyen230300-gif/DesignSystem/blob/main/docs/design/component-conventions.md). Docs của chính thư viện (ví dụ chạy thật, bảng API) chạy bằng `npm start` trong repo.

Giấy phép MIT; `NOTICE` ghi giấy phép của Tabler Icons (dữ liệu icon).

# ADR-004: `@angular/aria` hay chỉ Angular CDK

- **Trạng thái:** Đề xuất
- **Ngày:** 2026-10-16

## Bối cảnh
Angular 21 có `@angular/aria`: các directive headless theo WAI-ARIA APG (combobox, listbox, tabs, tree, grid, menu, toolbar). Gói này đang ở **developer preview**, nên API còn có thể đổi. CDK (`a11y`, `overlay`, `listbox`, `menu`, `dialog`) đã ổn định.

## Đề xuất
- Button và layout primitives (đã làm) không cần thư viện headless nào.
- Đợt B (combobox, select, tabs, tree): mỗi component thử `@angular/aria` trước. Phải **bọc sau API của NXT**, không lộ directive của aria ra ngoài, để có thể đổi sang CDK mà ứng dụng sản phẩm không phải sửa.
- Nếu một pattern của aria chưa đạt keyboard map trong SPEC, dùng CDK (`ListKeyManager`, `cdk/listbox`, `cdk/menu`).

## Cần chốt
Trước khi bắt đầu đợt B, kiểm tra `@angular/aria` ở bản 21.2.x đã ra khỏi developer preview chưa.

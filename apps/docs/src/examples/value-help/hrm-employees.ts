import { NxtComboboxOption } from '@nxt/ui/combobox';
import { NxtValueHelpColumn } from '@nxt/ui/value-help';
import { nxtMatches } from '@nxt/ui/search';

/** Shared fictional data for the combobox / value help examples: 1.250 employees, built deterministically. */
export interface HrmEmployee {
  code: string;
  name: string;
  dept: string;
  title: string;
}

const FAMILY = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
const MALE = {
  middle: ['Văn', 'Minh', 'Quốc', 'Đức', 'Hoàng', 'Thành'],
  given: ['An', 'Bình', 'Cường', 'Dũng', 'Hùng', 'Khoa', 'Long', 'Nam', 'Phúc', 'Quân', 'Sơn', 'Tuấn', 'Hải', 'Khang'],
};
const FEMALE = {
  middle: ['Thị', 'Ngọc', 'Thu', 'Thanh', 'Mai', 'Bích'],
  given: ['Anh', 'Chi', 'Diệp', 'Hà', 'Hương', 'Lan', 'Linh', 'Ngân', 'Nhung', 'Thảo', 'Trang', 'Vân', 'Yến', 'My'],
};
const DEPARTMENTS = [
  { name: 'Phòng Kế toán', titles: ['Kế toán tổng hợp', 'Kế toán thanh toán', 'Kế toán thuế'] },
  { name: 'Phòng Nhân sự', titles: ['Chuyên viên tuyển dụng', 'Chuyên viên C&B', 'Trưởng phòng Nhân sự'] },
  { name: 'Phòng Kinh doanh', titles: ['Nhân viên kinh doanh', 'Trưởng nhóm kinh doanh'] },
  { name: 'Phòng Công nghệ thông tin', titles: ['Lập trình viên', 'Kỹ sư hệ thống', 'Trưởng nhóm phát triển'] },
  { name: 'Phòng Pháp chế', titles: ['Chuyên viên pháp chế'] },
  { name: 'Kho vận', titles: ['Thủ kho', 'Nhân viên giao nhận'] },
  { name: 'Phòng Marketing', titles: ['Chuyên viên truyền thông', 'Thiết kế đồ hoạ'] },
  { name: 'Ban Giám đốc', titles: ['Giám đốc điều hành', 'Phó giám đốc'] },
];

export const HRM_EMPLOYEES: readonly HrmEmployee[] = Array.from({ length: 1250 }, (_, i) => {
  const names = i % 2 ? FEMALE : MALE;
  const dept = DEPARTMENTS[(i * 3) % DEPARTMENTS.length];
  return {
    code: `NV-${String(i + 1).padStart(4, '0')}`,
    name: `${FAMILY[(i * 7) % FAMILY.length]} ${names.middle[(i * 5) % names.middle.length]} ${names.given[(i * 3 + Math.floor(i / 14)) % names.given.length]}`,
    dept: dept.name,
    title: dept.titles[i % dept.titles.length],
  };
});

/** Columns of the value help: code and name first, at most 4. */
export const EMPLOYEE_COLUMNS: NxtValueHelpColumn<HrmEmployee>[] = [
  { id: 'code', header: 'Mã NV', value: (e) => e.code },
  { id: 'name', header: 'Họ và tên', value: (e) => e.name, rowHeader: true },
  { id: 'dept', header: 'Phòng ban', value: (e) => e.dept },
  { id: 'title', header: 'Chức danh', value: (e) => e.title },
];

export const employeeKey = (e: HrmEmployee) => e.code;
/** Names repeat in a large company: the code tells them apart. */
export const employeeLabel = (e: HrmEmployee) => `${e.name} (${e.code})`;
/** A combobox choice: name, then code and department to tell people with the same name apart. */
export const employeeOption = (e: HrmEmployee): NxtComboboxOption => ({ key: e.code, label: e.name, description: `${e.code} · ${e.dept}` });

export function findEmployees(query: string, limit: number): { items: HrmEmployee[]; total: number } {
  const all = HRM_EMPLOYEES.filter((e) => nxtMatches(query, e.code, e.name, e.dept, e.title));
  return { items: all.slice(0, limit), total: all.length };
}

/** Stand-in for a server call: answers after a fixed delay (no randomness). */
export function fetchEmployees(query: string, limit: number): Promise<{ items: HrmEmployee[]; total: number }> {
  return new Promise((resolve) => setTimeout(() => resolve(findEmployees(query, limit)), 300));
}

export const employeeByCode = (code: string) => HRM_EMPLOYEES.find((e) => e.code === code);

// Fictional data of the "Hồ sơ nhân viên" template. No randomness, no current date: "today" is fixed.

export const TODAY = { day: 6, month: 11, year: 2026 };
/** Fixed time shown by the draft indicator ("Bản nháp · đã lưu lúc 14:32"). */
export const DRAFT_SAVED_AT = '14:32';

export type EmployeeStatus = 'active' | 'probation' | 'left';

export const STATUS_META: Record<EmployeeStatus, { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  active: { label: 'Đang làm việc', tone: 'success' },
  probation: { label: 'Đang thử việc', tone: 'warning' },
  left: { label: 'Đã nghỉ việc', tone: 'neutral' },
};

/** Fields an HR officer edits on the profile (same keys in the form). */
export interface EmployeeForm {
  name: string;
  birthDate: string;
  gender: string;
  idNumber: string;
  marital: string;
  phone: string;
  personalEmail: string;
  address: string;
  title: string;
  grade: string;
  department: string;
  location: string;
  manager: string;
  startDate: string;
}

export interface Employee extends EmployeeForm {
  code: string;
  status: EmployeeStatus;
  workEmail: string;
  type: string;
  confirmedDate: string;
}

export interface Contract {
  number: string;
  type: string;
  from: string;
  to: string;
  salary: number;
  current: boolean;
}

export interface HistoryEntry {
  title: string;
  time: string;
  icon: 'user-star' | 'arrows-exchange' | 'file-certificate' | 'user-plus' | 'certificate';
  tone: 'neutral' | 'success' | 'brand';
  note?: string;
}

export const GENDERS = ['Nữ', 'Nam', 'Khác'];
export const MARITAL = ['Độc thân', 'Đã kết hôn', 'Ly hôn'];
export const TITLES = [
  'Kế toán tổng hợp',
  'Kế toán thanh toán',
  'Trưởng nhóm Kế toán tổng hợp',
  'Phó phòng Tài chính – Kế toán',
  'Chuyên viên Phân tích tài chính',
];
export const GRADES = ['Chuyên viên (bậc 2)', 'Chuyên viên (bậc 3)', 'Chuyên viên chính (bậc 4)', 'Chuyên viên cao cấp (bậc 5)'];
export const DEPARTMENTS = [
  'Phòng Tài chính – Kế toán',
  'Phòng Quản trị Nguồn nhân lực & Phát triển Tổ chức',
  'Phòng Công nghệ thông tin',
  'Phòng Kinh doanh miền Bắc',
];
export const LOCATIONS = ['Văn phòng Hà Nội', 'Văn phòng TP. Hồ Chí Minh', 'Chi nhánh Đà Nẵng'];
export const MANAGERS = ['Trần Văn Bình', 'Phạm Thị Lan', 'Đỗ Minh Thư'];

export const EMPLOYEE: Employee = {
  code: 'NV-00123',
  status: 'active',
  name: 'Nguyễn Thị Ngọc Diệp',
  birthDate: '08/09/1990',
  gender: 'Nữ',
  idNumber: '001190012345',
  marital: 'Đã kết hôn',
  phone: '0912 345 678',
  personalEmail: 'ngocdiep.nguyen@gmail.com',
  address: 'Số 18 ngõ 42 Trần Duy Hưng, phường Trung Hoà, quận Cầu Giấy, Hà Nội',
  title: 'Trưởng nhóm Kế toán tổng hợp',
  grade: 'Chuyên viên chính (bậc 4)',
  department: 'Phòng Tài chính – Kế toán',
  location: 'Văn phòng Hà Nội',
  manager: 'Trần Văn Bình',
  startDate: '15/03/2019',
  workEmail: 'diep.ntn@nxt.vn',
  type: 'Chính thức',
  confirmedDate: '15/05/2019',
};

export const CONTRACTS: Contract[] = [
  { number: 'HĐ-2021-0789', type: 'Không xác định thời hạn', from: '15/05/2021', to: '', salary: 18_500_000, current: true },
  { number: 'HĐ-2019-0456', type: 'Xác định thời hạn 24 tháng', from: '15/05/2019', to: '14/05/2021', salary: 12_500_000, current: false },
  { number: 'HĐ-2019-0123', type: 'Thử việc', from: '15/03/2019', to: '14/05/2019', salary: 9_000_000, current: false },
];

export const HISTORY: HistoryEntry[] = [
  { title: 'Bổ nhiệm Trưởng nhóm Kế toán tổng hợp', time: '01/07/2024', icon: 'user-star', tone: 'brand', note: 'Quyết định số 112/QĐ-NXT' },
  { title: 'Hoàn thành chứng chỉ Kế toán trưởng', time: '20/11/2023', icon: 'certificate', tone: 'success' },
  { title: 'Ký hợp đồng không xác định thời hạn', time: '15/05/2021', icon: 'file-certificate', tone: 'success', note: 'HĐ-2021-0789' },
  { title: 'Điều chuyển từ Phòng Kinh doanh miền Bắc', time: '01/03/2020', icon: 'arrows-exchange', tone: 'neutral' },
  { title: 'Vào làm, vị trí Kế toán thanh toán', time: '15/03/2019', icon: 'user-plus', tone: 'neutral' },
];

const money = new Intl.NumberFormat('vi-VN');
export const formatMoney = (value: number) => `${money.format(value)} ₫`;

export function formFrom(e: EmployeeForm): EmployeeForm {
  return {
    name: e.name,
    birthDate: e.birthDate,
    gender: e.gender,
    idNumber: e.idNumber,
    marital: e.marital,
    phone: e.phone,
    personalEmail: e.personalEmail,
    address: e.address,
    title: e.title,
    grade: e.grade,
    department: e.department,
    location: e.location,
    manager: e.manager,
    startDate: e.startDate,
  };
}

export function sameForm(a: EmployeeForm, b: EmployeeForm): boolean {
  return (Object.keys(a) as (keyof EmployeeForm)[]).every((k) => a[k].trim() === b[k].trim());
}

/** "Nhân bản": copy the job, leave every personal field empty. */
export function copyForm(e: Employee): EmployeeForm {
  return {
    ...formFrom(e),
    name: '',
    birthDate: '',
    gender: '',
    idNumber: '',
    marital: '',
    phone: '',
    personalEmail: '',
    address: '',
    startDate: '',
  };
}

/** dd/MM/yyyy → parts, or null when it is not a real date. */
export function parseDate(text: string): { day: number; month: number; year: number } | null {
  const m = text.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [day, month, year] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day ? { day, month, year } : null;
}

/** Whole years and months from a dd/MM/yyyy date to the fixed "today": "7 năm 7 tháng". */
export function seniority(start: string): string {
  const s = parseDate(start);
  if (!s) return '—';
  let months = (TODAY.year - s.year) * 12 + (TODAY.month - s.month) - (TODAY.day < s.day ? 1 : 0);
  if (months < 0) return 'Chưa vào làm';
  const years = Math.floor(months / 12);
  months %= 12;
  if (!years) return `${months} tháng`;
  return months ? `${years} năm ${months} tháng` : `${years} năm`;
}

function ageOn(birth: { day: number; month: number; year: number }): number {
  return TODAY.year - birth.year - (TODAY.month < birth.month || (TODAY.month === birth.month && TODAY.day < birth.day) ? 1 : 0);
}

export type FormErrors = Partial<Record<keyof EmployeeForm, string>>;

/** Messages say what is wrong and how to fix it (principles §5). */
export function validate(f: EmployeeForm, creating: boolean): FormErrors {
  const errors: FormErrors = {};
  if (!f.name.trim()) errors.name = 'Nhập họ và tên nhân viên.';
  const birth = parseDate(f.birthDate);
  if (!f.birthDate.trim()) errors.birthDate = 'Nhập ngày sinh theo dạng ngày/tháng/năm, ví dụ 08/09/1990.';
  else if (!birth) errors.birthDate = 'Ngày sinh không đúng dạng ngày/tháng/năm. Ví dụ: 08/09/1990.';
  else if (ageOn(birth) < 15) errors.birthDate = 'Nhân viên phải đủ 15 tuổi. Kiểm tra lại năm sinh.';
  if (!/^\d{12}$/.test(f.idNumber.trim())) errors.idNumber = 'Số CCCD gồm đúng 12 chữ số.';
  const digits = f.phone.replace(/\s/g, '');
  if (!digits) errors.phone = 'Nhập số điện thoại để Phòng Nhân sự liên hệ khi cần.';
  else if (!/^0\d{9,10}$/.test(digits)) errors.phone = 'Số điện thoại gồm 10–11 chữ số, bắt đầu bằng 0. Ví dụ: 0912 345 678.';
  if (f.personalEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.personalEmail.trim())) {
    errors.personalEmail = 'Email chưa đúng dạng, ví dụ ten.ho@gmail.com. Có thể để trống.';
  }
  if (creating) {
    if (!f.startDate.trim()) errors.startDate = 'Nhập ngày vào làm theo dạng ngày/tháng/năm.';
    else if (!parseDate(f.startDate)) errors.startDate = 'Ngày vào làm không đúng dạng ngày/tháng/năm. Ví dụ: 01/12/2026.';
  }
  return errors;
}

/** Order of fields on the page: the first error in this order gets focus. */
export const FIELD_ORDER: (keyof EmployeeForm)[] = [
  'name',
  'birthDate',
  'gender',
  'idNumber',
  'marital',
  'phone',
  'personalEmail',
  'address',
  'title',
  'grade',
  'department',
  'location',
  'manager',
  'startDate',
];

/** Section of the object page that holds each field (to reveal it in tabs mode). */
export const FIELD_SECTION: Record<keyof EmployeeForm, 'general' | 'job'> = {
  name: 'general',
  birthDate: 'general',
  gender: 'general',
  idNumber: 'general',
  marital: 'general',
  phone: 'general',
  personalEmail: 'general',
  address: 'general',
  title: 'job',
  grade: 'job',
  department: 'job',
  location: 'job',
  manager: 'job',
  startDate: 'job',
};

export const REQUIRED: (keyof EmployeeForm)[] = ['name', 'birthDate', 'idNumber', 'phone'];

/** Fictional data for the catalog template: several master-data catalogs that share one screen. */

export type FieldType = 'select' | 'number' | 'money';

/** A catalog-specific column / form field / filter (beyond code, name, description, status). */
export interface CatalogField {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  /** Offered as a checkbox group in the filter panel. */
  filter?: boolean;
  /** Rows with a value > 0 are in use and cannot be deleted (e.g. employees holding the job title). */
  usage?: boolean;
}

export interface CatalogItem {
  code: string;
  name: string;
  description?: string;
  active: boolean;
  /** dd/MM/yyyy */
  updated: string;
  extra: Record<string, string | number>;
}

export interface CatalogDef {
  id: string;
  /** Tab label. */
  label: string;
  /** Lowercase noun used in sentences: "Thêm chức danh", "Đã xoá 3 chức danh". */
  noun: string;
  codeHint: string;
  fields: CatalogField[];
  items: CatalogItem[];
}

/** "Today" for the demo, so relative filters ("30 ngày qua") give stable results. */
export const TODAY = '19/10/2026';

/** "15/10/2026" → 20261015 for sorting. */
export const dateKey = (d: string) => Number(d.split('/').reverse().join(''));

export function daysBetween(from: string, to: string): number {
  const toDate = (d: string) => {
    const [day, month, year] = d.split('/').map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((toDate(to) - toDate(from)) / 86_400_000);
}

export const JOB_GROUPS = ['Quản lý', 'Chuyên môn', 'Hỗ trợ'];
export const JOB_LEVELS = ['L1 · Nhân viên', 'L2 · Chuyên viên', 'L3 · Chuyên viên chính', 'L4 · Trưởng nhóm', 'L5 · Trưởng phòng', 'L6 · Giám đốc khối'];

const job = (code: string, name: string, group: string, level: number, headcount: number, active: boolean, updated: string): CatalogItem => ({
  code,
  name,
  active,
  updated,
  extra: { group, level: JOB_LEVELS[level - 1], headcount },
});

const item = (code: string, name: string, extra: Record<string, string | number>, updated: string, active = true, description?: string): CatalogItem => ({
  code,
  name,
  description,
  active,
  updated,
  extra,
});

export const CATALOGS: CatalogDef[] = [
  {
    id: 'chuc-danh',
    label: 'Chức danh',
    noun: 'chức danh',
    codeHint: 'Viết hoa, không dấu, ví dụ KT-TH.',
    fields: [
      { key: 'group', label: 'Nhóm', type: 'select', options: JOB_GROUPS, filter: true },
      { key: 'level', label: 'Cấp bậc', type: 'select', options: JOB_LEVELS, filter: true },
      { key: 'headcount', label: 'Nhân sự', type: 'number', usage: true },
    ],
    items: [
      job('GD-KD', 'Giám đốc khối Kinh doanh', 'Quản lý', 6, 1, true, '02/09/2026'),
      job('GD-CN', 'Giám đốc khối Công nghệ', 'Quản lý', 6, 1, true, '02/09/2026'),
      job('TP-NS', 'Trưởng phòng Nhân sự', 'Quản lý', 5, 1, true, '15/08/2026'),
      job('TP-KT', 'Trưởng phòng Kế toán', 'Quản lý', 5, 1, true, '15/08/2026'),
      job('TP-KD', 'Trưởng phòng Kinh doanh', 'Quản lý', 5, 6, true, '11/10/2026'),
      job('TN-PM', 'Trưởng nhóm Phát triển phần mềm', 'Quản lý', 4, 18, true, '07/10/2026'),
      job('TN-CSKH', 'Trưởng nhóm Chăm sóc khách hàng', 'Quản lý', 4, 5, true, '20/09/2026'),
      job('KT-TH', 'Kế toán tổng hợp', 'Chuyên môn', 3, 4, true, '15/10/2026'),
      job('KT-TT', 'Kế toán thanh toán', 'Chuyên môn', 2, 6, true, '15/10/2026'),
      job('KT-THUE', 'Kế toán thuế', 'Chuyên môn', 2, 2, true, '03/07/2026'),
      job('NS-TD', 'Chuyên viên tuyển dụng', 'Chuyên môn', 2, 7, true, '28/09/2026'),
      job('NS-CB', 'Chuyên viên C&B', 'Chuyên môn', 3, 4, true, '28/09/2026'),
      job('NS-DT', 'Chuyên viên đào tạo', 'Chuyên môn', 2, 3, true, '12/06/2026'),
      job('LTV-BE', 'Lập trình viên Backend', 'Chuyên môn', 2, 96, true, '09/10/2026'),
      job('LTV-FE', 'Lập trình viên Frontend', 'Chuyên môn', 2, 74, true, '09/10/2026'),
      job('KS-QA', 'Kỹ sư kiểm thử', 'Chuyên môn', 2, 38, true, '09/10/2026'),
      job('KS-DEVOPS', 'Kỹ sư DevOps', 'Chuyên môn', 3, 12, true, '01/10/2026'),
      job('PT-NV', 'Chuyên viên phân tích nghiệp vụ', 'Chuyên môn', 3, 21, true, '25/09/2026'),
      job('TK-UX', 'Chuyên viên thiết kế trải nghiệm', 'Chuyên môn', 3, 9, true, '25/09/2026'),
      job('NV-KD', 'Nhân viên kinh doanh', 'Chuyên môn', 1, 214, true, '14/10/2026'),
      job('NV-CSKH', 'Nhân viên chăm sóc khách hàng', 'Chuyên môn', 1, 62, true, '30/09/2026'),
      job('NV-MKT', 'Chuyên viên marketing số', 'Chuyên môn', 2, 23, true, '18/09/2026'),
      job('NV-PL', 'Chuyên viên pháp chế', 'Chuyên môn', 3, 3, true, '05/05/2026'),
      job('HC-LT', 'Lễ tân', 'Hỗ trợ', 1, 4, true, '10/04/2026'),
      job('HC-TX', 'Lái xe', 'Hỗ trợ', 1, 9, true, '10/04/2026'),
      job('HC-BV', 'Bảo vệ', 'Hỗ trợ', 1, 0, false, '01/03/2026'),
      job('HC-TV', 'Tạp vụ', 'Hỗ trợ', 1, 6, true, '01/03/2026'),
      job('NV-KHO', 'Nhân viên kho', 'Hỗ trợ', 1, 41, true, '22/08/2026'),
      job('NV-DL', 'Nhân viên nhập liệu', 'Hỗ trợ', 1, 0, false, '17/01/2026'),
    ],
  },
  {
    id: 'cap-bac',
    label: 'Cấp bậc',
    noun: 'cấp bậc',
    codeHint: 'Ví dụ L1, L2.',
    fields: [
      { key: 'coefficient', label: 'Hệ số lương', type: 'number' },
      { key: 'headcount', label: 'Nhân sự', type: 'number', usage: true },
    ],
    items: [
      item('L1', 'Nhân viên', { coefficient: 1, headcount: 336 }, '02/01/2026', true, 'Mới vào nghề hoặc công việc theo hướng dẫn.'),
      item('L2', 'Chuyên viên', { coefficient: 1.4, headcount: 283 }, '02/01/2026'),
      item('L3', 'Chuyên viên chính', { coefficient: 1.9, headcount: 57 }, '02/01/2026'),
      item('L4', 'Trưởng nhóm', { coefficient: 2.5, headcount: 23 }, '02/01/2026'),
      item('L5', 'Trưởng phòng', { coefficient: 3.2, headcount: 9 }, '02/01/2026'),
      item('L6', 'Giám đốc khối', { coefficient: 4.5, headcount: 2 }, '02/01/2026'),
    ],
  },
  {
    id: 'phong-ban',
    label: 'Phòng ban',
    noun: 'phòng ban',
    codeHint: 'Viết hoa, không dấu, ví dụ P-NS.',
    fields: [
      { key: 'division', label: 'Khối', type: 'select', options: ['Kinh doanh', 'Công nghệ', 'Vận hành', 'Hỗ trợ'], filter: true },
      { key: 'headcount', label: 'Nhân sự', type: 'number', usage: true },
    ],
    items: [
      item('P-KD-MB', 'Kinh doanh miền Bắc', { division: 'Kinh doanh', headcount: 128 }, '11/10/2026'),
      item('P-KD-MN', 'Kinh doanh miền Nam', { division: 'Kinh doanh', headcount: 142 }, '11/10/2026'),
      item('P-MKT', 'Marketing', { division: 'Kinh doanh', headcount: 31 }, '18/09/2026'),
      item('P-CSKH', 'Chăm sóc khách hàng', { division: 'Kinh doanh', headcount: 67 }, '30/09/2026'),
      item('P-PM', 'Phát triển sản phẩm', { division: 'Công nghệ', headcount: 188 }, '09/10/2026'),
      item('P-HT', 'Hạ tầng & bảo mật', { division: 'Công nghệ', headcount: 24 }, '01/10/2026'),
      item('P-KHO', 'Kho vận', { division: 'Vận hành', headcount: 41 }, '22/08/2026'),
      item('P-MH', 'Mua hàng', { division: 'Vận hành', headcount: 12 }, '22/08/2026'),
      item('P-NS', 'Nhân sự', { division: 'Hỗ trợ', headcount: 18 }, '28/09/2026'),
      item('P-KT', 'Kế toán', { division: 'Hỗ trợ', headcount: 14 }, '15/10/2026'),
      item('P-PC', 'Pháp chế', { division: 'Hỗ trợ', headcount: 4 }, '05/05/2026'),
      item('P-HC', 'Hành chính', { division: 'Hỗ trợ', headcount: 0 }, '01/03/2026', false, 'Đã gộp vào phòng Nhân sự từ 03/2026.'),
    ],
  },
  {
    id: 'loai-hop-dong',
    label: 'Loại hợp đồng',
    noun: 'loại hợp đồng',
    codeHint: 'Ví dụ HD-XDTH.',
    fields: [
      { key: 'months', label: 'Thời hạn (tháng)', type: 'number' },
      { key: 'headcount', label: 'Đang áp dụng', type: 'number', usage: true },
    ],
    items: [
      item('HD-KXDTH', 'Không xác định thời hạn', { months: 0, headcount: 812 }, '02/01/2026', true, 'Thời hạn 0 nghĩa là không xác định.'),
      item('HD-XDTH-12', 'Xác định thời hạn 12 tháng', { months: 12, headcount: 236 }, '02/01/2026'),
      item('HD-XDTH-36', 'Xác định thời hạn 36 tháng', { months: 36, headcount: 171 }, '02/01/2026'),
      item('HD-TV', 'Thử việc', { months: 2, headcount: 49 }, '02/01/2026'),
      item('HD-CTV', 'Cộng tác viên', { months: 6, headcount: 16 }, '20/09/2026'),
    ],
  },
  {
    id: 'ca-lam-viec',
    label: 'Ca làm việc',
    noun: 'ca làm việc',
    codeHint: 'Ví dụ CA-HC.',
    fields: [{ key: 'hours', label: 'Số giờ', type: 'number' }],
    items: [],
  },
  {
    id: 'ly-do-nghi-viec',
    label: 'Lý do nghỉ việc',
    noun: 'lý do nghỉ việc',
    codeHint: 'Ví dụ LD-LUONG.',
    fields: [{ key: 'kind', label: 'Loại', type: 'select', options: ['Tự nguyện', 'Không tự nguyện'], filter: true }],
    items: [
      item('LD-LUONG', 'Thu nhập chưa phù hợp', { kind: 'Tự nguyện' }, '14/02/2026'),
      item('LD-PTSN', 'Cơ hội phát triển tốt hơn', { kind: 'Tự nguyện' }, '14/02/2026'),
      item('LD-GD', 'Lý do gia đình', { kind: 'Tự nguyện' }, '14/02/2026'),
      item('LD-SK', 'Sức khoẻ', { kind: 'Tự nguyện' }, '14/02/2026'),
      item('LD-DC', 'Chuyển nơi sinh sống', { kind: 'Tự nguyện' }, '14/02/2026'),
      item('LD-KLHD', 'Hết hạn hợp đồng, không tái ký', { kind: 'Không tự nguyện' }, '14/02/2026'),
      item('LD-KL', 'Vi phạm kỷ luật', { kind: 'Không tự nguyện' }, '14/02/2026'),
      item('LD-TCCT', 'Tái cơ cấu tổ chức', { kind: 'Không tự nguyện' }, '30/06/2026', false),
    ],
  },
  {
    id: 'dia-diem',
    label: 'Địa điểm làm việc',
    noun: 'địa điểm làm việc',
    codeHint: 'Ví dụ HN-01.',
    fields: [
      { key: 'province', label: 'Tỉnh/thành', type: 'select', options: ['Hà Nội', 'Đà Nẵng', 'TP. Hồ Chí Minh', 'Cần Thơ'], filter: true },
      { key: 'headcount', label: 'Nhân sự', type: 'number', usage: true },
    ],
    items: [
      item('HN-01', 'Trụ sở chính · Cầu Giấy', { province: 'Hà Nội', headcount: 612 }, '02/01/2026'),
      item('DN-01', 'Chi nhánh Đà Nẵng', { province: 'Đà Nẵng', headcount: 96 }, '02/01/2026'),
      item('HCM-01', 'Chi nhánh Quận 7', { province: 'TP. Hồ Chí Minh', headcount: 538 }, '02/01/2026'),
      item('CT-01', 'Văn phòng đại diện Cần Thơ', { province: 'Cần Thơ', headcount: 38 }, '20/09/2026'),
    ],
  },
  {
    id: 'phu-cap',
    label: 'Phụ cấp',
    noun: 'phụ cấp',
    codeHint: 'Ví dụ PC-AN.',
    fields: [{ key: 'amount', label: 'Mức hằng tháng', type: 'money' }],
    items: [
      item('PC-AN', 'Phụ cấp ăn trưa', { amount: 730000 }, '02/01/2026'),
      item('PC-XANG', 'Phụ cấp xăng xe', { amount: 500000 }, '02/01/2026'),
      item('PC-DT', 'Phụ cấp điện thoại', { amount: 300000 }, '02/01/2026'),
      item('PC-TN', 'Phụ cấp trách nhiệm', { amount: 2000000 }, '15/08/2026', true, 'Cho trưởng nhóm trở lên.'),
      item('PC-DH', 'Phụ cấp độc hại', { amount: 1200000 }, '03/07/2026', false),
    ],
  },
];

const number = new Intl.NumberFormat('vi-VN');
const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });

export function formatValue(field: CatalogField, value: string | number | undefined): string {
  if (value === undefined || value === '') return '—';
  if (field.type === 'money') return money.format(Number(value));
  if (field.type === 'number') return number.format(Number(value));
  return String(value);
}

export function usageOf(def: CatalogDef, row: CatalogItem): number {
  const field = def.fields.find((f) => f.usage);
  return field ? Number(row.extra[field.key] ?? 0) : 0;
}

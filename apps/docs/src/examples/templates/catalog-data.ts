export type JobGroup = 'Quản lý' | 'Chuyên môn' | 'Hỗ trợ';

export interface JobTitle {
  code: string;
  name: string;
  group: JobGroup;
  level: string;
  headcount: number;
  active: boolean;
  /** dd/MM/yyyy */
  updated: string;
  description?: string;
}

export const JOB_GROUPS: JobGroup[] = ['Quản lý', 'Chuyên môn', 'Hỗ trợ'];
export const JOB_LEVELS = ['L1 · Nhân viên', 'L2 · Chuyên viên', 'L3 · Chuyên viên chính', 'L4 · Trưởng nhóm', 'L5 · Trưởng phòng', 'L6 · Giám đốc khối'];

const row = (code: string, name: string, group: JobGroup, level: number, headcount: number, active: boolean, updated: string): JobTitle => ({
  code,
  name,
  group,
  level: JOB_LEVELS[level - 1],
  headcount,
  active,
  updated,
});

/** Fictional catalog data for the template. */
export const JOB_TITLES: JobTitle[] = [
  row('GD-KD', 'Giám đốc khối Kinh doanh', 'Quản lý', 6, 1, true, '02/09/2026'),
  row('GD-CN', 'Giám đốc khối Công nghệ', 'Quản lý', 6, 1, true, '02/09/2026'),
  row('TP-NS', 'Trưởng phòng Nhân sự', 'Quản lý', 5, 1, true, '15/08/2026'),
  row('TP-KT', 'Trưởng phòng Kế toán', 'Quản lý', 5, 1, true, '15/08/2026'),
  row('TP-KD', 'Trưởng phòng Kinh doanh', 'Quản lý', 5, 6, true, '11/10/2026'),
  row('TN-PM', 'Trưởng nhóm Phát triển phần mềm', 'Quản lý', 4, 18, true, '07/10/2026'),
  row('TN-CSKH', 'Trưởng nhóm Chăm sóc khách hàng', 'Quản lý', 4, 5, true, '20/09/2026'),
  row('KT-TH', 'Kế toán tổng hợp', 'Chuyên môn', 3, 4, true, '15/10/2026'),
  row('KT-TT', 'Kế toán thanh toán', 'Chuyên môn', 2, 6, true, '15/10/2026'),
  row('KT-THUE', 'Kế toán thuế', 'Chuyên môn', 2, 2, true, '03/07/2026'),
  row('NS-TD', 'Chuyên viên tuyển dụng', 'Chuyên môn', 2, 7, true, '28/09/2026'),
  row('NS-CB', 'Chuyên viên C&B', 'Chuyên môn', 3, 4, true, '28/09/2026'),
  row('NS-DT', 'Chuyên viên đào tạo', 'Chuyên môn', 2, 3, true, '12/06/2026'),
  row('LTV-BE', 'Lập trình viên Backend', 'Chuyên môn', 2, 96, true, '09/10/2026'),
  row('LTV-FE', 'Lập trình viên Frontend', 'Chuyên môn', 2, 74, true, '09/10/2026'),
  row('KS-QA', 'Kỹ sư kiểm thử', 'Chuyên môn', 2, 38, true, '09/10/2026'),
  row('KS-DEVOPS', 'Kỹ sư DevOps', 'Chuyên môn', 3, 12, true, '01/10/2026'),
  row('PT-NV', 'Chuyên viên phân tích nghiệp vụ', 'Chuyên môn', 3, 21, true, '25/09/2026'),
  row('TK-UX', 'Chuyên viên thiết kế trải nghiệm', 'Chuyên môn', 3, 9, true, '25/09/2026'),
  row('NV-KD', 'Nhân viên kinh doanh', 'Chuyên môn', 1, 214, true, '14/10/2026'),
  row('NV-CSKH', 'Nhân viên chăm sóc khách hàng', 'Chuyên môn', 1, 62, true, '30/09/2026'),
  row('NV-MKT', 'Chuyên viên marketing số', 'Chuyên môn', 2, 23, true, '18/09/2026'),
  row('NV-PL', 'Chuyên viên pháp chế', 'Chuyên môn', 3, 3, true, '05/05/2026'),
  row('HC-LT', 'Lễ tân', 'Hỗ trợ', 1, 4, true, '10/04/2026'),
  row('HC-TX', 'Lái xe', 'Hỗ trợ', 1, 9, true, '10/04/2026'),
  row('HC-BV', 'Bảo vệ', 'Hỗ trợ', 1, 14, false, '01/03/2026'),
  row('HC-TV', 'Tạp vụ', 'Hỗ trợ', 1, 6, true, '01/03/2026'),
  row('NV-KHO', 'Nhân viên kho', 'Hỗ trợ', 1, 41, true, '22/08/2026'),
  row('NV-DL', 'Nhân viên nhập liệu', 'Hỗ trợ', 1, 0, false, '17/01/2026'),
];

/** "15/10/2026" → 20261015 for sorting. */
export const dateKey = (d: string) => Number(d.split('/').reverse().join(''));

/** Lowercase without Vietnamese diacritics. */
export const fold = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase();

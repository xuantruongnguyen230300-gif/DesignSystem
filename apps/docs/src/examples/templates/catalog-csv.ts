import { CatalogDef, CatalogItem, TODAY } from './catalog-data';

/** Minimal CSV for the demo (quotes, commas and newlines inside quotes). Real products parse .xlsx on the server. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const src = text.replace(/^﻿/, '');
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

export function toCsv(rows: (string | number)[][]): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  // BOM so Excel opens UTF-8 Vietnamese correctly.
  return '﻿' + rows.map((r) => r.map(esc).join(',')).join('\r\n');
}

export function download(fileName: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url));
}

export const fileDate = () => TODAY.replace(/\//g, '-');

/** Column headers, in order — the same for the template file, export and import. */
export function headers(def: CatalogDef): string[] {
  return ['Mã', 'Tên', ...def.fields.map((f) => f.label), 'Mô tả', 'Trạng thái'];
}

export function itemsToRows(def: CatalogDef, items: CatalogItem[]): (string | number)[][] {
  return [
    headers(def),
    ...items.map((r) => [r.code, r.name, ...def.fields.map((f) => r.extra[f.key] ?? ''), r.description ?? '', r.active ? 'Đang dùng' : 'Ngừng dùng']),
  ];
}

export interface ImportIssue {
  /** Row number as the user sees it in Excel (header is row 1). */
  row: number;
  column: string;
  message: string;
}

export interface ImportResult {
  total: number;
  valid: CatalogItem[];
  issues: ImportIssue[];
  /** File-level problem (wrong columns) — nothing can be imported. */
  error?: string;
}

const CODE = /^[A-Z0-9-]{2,12}$/;

/** Validate rows against the catalog: required fields, code format and uniqueness, allowed values. */
export function validateImport(def: CatalogDef, rows: string[][], existingCodes: string[]): ImportResult {
  const [head = [], ...body] = rows;
  const names = head.map((h) => h.trim().toLowerCase());
  const col = (label: string) => names.indexOf(label.toLowerCase());
  const missing = ['Mã', 'Tên'].filter((h) => col(h) < 0);
  if (missing.length) {
    return { total: body.length, valid: [], issues: [], error: `File thiếu cột ${missing.join(', ')}. Hãy dùng file mẫu để có đúng tên cột.` };
  }
  const seen = new Set(existingCodes);
  const valid: CatalogItem[] = [];
  const issues: ImportIssue[] = [];
  body.forEach((cells, i) => {
    const rowNo = i + 2;
    const get = (label: string) => (col(label) >= 0 ? (cells[col(label)] ?? '').trim() : '');
    const rowIssues: ImportIssue[] = [];
    const code = get('Mã').toUpperCase();
    const name = get('Tên');
    if (!code) rowIssues.push({ row: rowNo, column: 'Mã', message: 'Thiếu mã. Nhập mã 2–12 ký tự.' });
    else if (!CODE.test(code)) rowIssues.push({ row: rowNo, column: 'Mã', message: `Mã “${code}” sai định dạng: chỉ dùng chữ không dấu, số và dấu gạch ngang, 2–12 ký tự.` });
    else if (seen.has(code)) rowIssues.push({ row: rowNo, column: 'Mã', message: `Mã ${code} đã tồn tại${existingCodes.includes(code) ? '' : ' ở một dòng phía trên trong file'}. Đổi mã khác hoặc xoá dòng này.` });
    if (!name) rowIssues.push({ row: rowNo, column: 'Tên', message: 'Thiếu tên. Nhập tên đầy đủ.' });
    const extra: Record<string, string | number> = {};
    for (const f of def.fields) {
      const raw = get(f.label);
      if (f.type === 'select') {
        if (raw && !f.options?.includes(raw)) rowIssues.push({ row: rowNo, column: f.label, message: `“${raw}” không có trong danh sách. Chọn một trong: ${f.options?.join(', ')}.` });
        extra[f.key] = raw || f.options?.[0] || '';
      } else {
        const n = raw === '' ? 0 : Number(raw.replace(/\./g, '').replace(',', '.'));
        if (Number.isNaN(n) || n < 0) rowIssues.push({ row: rowNo, column: f.label, message: `“${raw}” không phải số hợp lệ. Nhập số không âm, ví dụ 12.` });
        extra[f.key] = Number.isNaN(n) ? 0 : n;
      }
    }
    const status = get('Trạng thái');
    if (status && !['Đang dùng', 'Ngừng dùng'].includes(status)) {
      rowIssues.push({ row: rowNo, column: 'Trạng thái', message: `“${status}” không hợp lệ. Ghi “Đang dùng” hoặc “Ngừng dùng”, hoặc để trống.` });
    }
    if (code) seen.add(code);
    if (rowIssues.length) issues.push(...rowIssues);
    else valid.push({ code, name, description: get('Mô tả') || undefined, active: status !== 'Ngừng dùng', updated: TODAY, extra });
  });
  return { total: body.length, valid, issues };
}

/** A realistic file for trying the import without preparing one: mostly valid rows plus typical mistakes. */
export function sampleCsv(def: CatalogDef): string {
  const existing = def.items[0]?.code ?? 'TRUNG-MA';
  const extras = (i: number) =>
    def.fields.map((f) => (f.type === 'select' ? (f.options?.[i % (f.options.length || 1)] ?? '') : f.type === 'money' ? 450000 + i * 50000 : i % 5));
  const rows: (string | number)[][] = [headers(def)];
  const names =
    def.id === 'chuc-danh'
      ? ['Chuyên viên quan hệ lao động', 'Chuyên viên tiền lương', 'Kỹ sư dữ liệu', 'Kỹ sư bảo mật', 'Chuyên viên mua hàng', 'Thủ kho', 'Điều phối vận tải', 'Chuyên viên truyền thông nội bộ', 'Trợ lý giám đốc', 'Nhân viên hành chính']
      : Array.from({ length: 10 }, (_, i) => `${def.label} mới ${i + 1}`);
  names.forEach((name, i) => rows.push([`NEW-${String(i + 1).padStart(2, '0')}`, name, ...extras(i), '', 'Đang dùng']));
  rows.push([existing, 'Trùng mã với dữ liệu đang có', ...extras(1), '', 'Đang dùng']);
  rows.push(['NEW-11', '', ...extras(2), '', 'Đang dùng']);
  if (def.fields.some((f) => f.type === 'select')) {
    rows.push(['NEW-12', 'Giá trị ngoài danh sách', ...def.fields.map((f) => (f.type === 'select' ? 'Khác' : 1)), '', 'Đang dùng']);
  }
  return toCsv(rows);
}

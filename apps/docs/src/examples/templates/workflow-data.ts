import { NxtSegmentedOption } from '@nxt/ui/segmented';
import { NxtTone } from '@nxt/ui/tag';
import { TODAY } from './catalog-data';

export { TODAY };
/** The signed-in HR admin of the demo (top bar). */
export const ME = 'Đặng Anh';

// ---------- vocabulary ----------

export type WorkflowStatus = 'active' | 'draft' | 'inactive';
export const STATUS_META: Record<WorkflowStatus, { label: string; tone: NxtTone }> = {
  active: { label: 'Đang áp dụng', tone: 'success' },
  draft: { label: 'Bản nháp', tone: 'warning' },
  inactive: { label: 'Ngừng áp dụng', tone: 'neutral' },
};

export const REQUEST_TYPES = ['Nghỉ phép', 'Tăng ca', 'Công tác', 'Tạm ứng', 'Thay đổi thông tin'] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

export type ApproverKind = 'manager' | 'head' | 'director' | 'hr' | 'person';
export const APPROVERS: { value: ApproverKind; label: string }[] = [
  { value: 'manager', label: 'Quản lý trực tiếp' },
  { value: 'head', label: 'Trưởng phòng' },
  { value: 'director', label: 'Giám đốc khối' },
  { value: 'hr', label: 'Phòng Nhân sự' },
  { value: 'person', label: 'Người cụ thể' },
];

export interface Person {
  id: string;
  name: string;
  title: string;
}
export const PEOPLE: Person[] = [
  { id: 'ceo', name: 'Lương Văn Hùng', title: 'Tổng Giám đốc' },
  { id: 'cfo', name: 'Vũ Hải Yến', title: 'Giám đốc Tài chính' },
  { id: 'chief-accountant', name: 'Ngô Thị Lan', title: 'Kế toán trưởng' },
  { id: 'hr-head', name: 'Đặng Anh', title: 'Trưởng phòng Nhân sự' },
  { id: 'cb', name: 'Phạm Thu Hà', title: 'Chuyên viên C&B' },
  { id: 'admin-head', name: 'Kiều Thanh Bình', title: 'Trưởng phòng Hành chính' },
];

export type ApproveMode = 'any' | 'all';
export const MODES: NxtSegmentedOption<ApproveMode>[] = [
  { value: 'any', label: 'Một người là đủ' },
  { value: 'all', label: 'Tất cả cùng duyệt' },
];
export const MODE_SUMMARY: Record<ApproveMode, string> = { any: '1 người duyệt là đủ', all: 'Tất cả cùng duyệt' };

export type OverdueAction = 'remind' | 'escalate' | 'auto';
export const OVERDUE: { value: OverdueAction; label: string }[] = [
  { value: 'remind', label: 'Nhắc lại người duyệt' },
  { value: 'escalate', label: 'Chuyển lên cấp trên' },
  { value: 'auto', label: 'Tự động duyệt' },
];

export type ConditionField = 'days' | 'hours' | 'tripDays' | 'amount';
export const CONDITION_FIELDS: Record<ConditionField, { label: string; unit: string; example: string }> = {
  days: { label: 'Số ngày nghỉ', unit: 'ngày', example: '3' },
  hours: { label: 'Số giờ tăng ca', unit: 'giờ', example: '4' },
  tripDays: { label: 'Số ngày công tác', unit: 'ngày', example: '3' },
  amount: { label: 'Số tiền tạm ứng', unit: '₫', example: '5000000' },
};
/** Numbers a request of each type carries — what a condition can test and what the simulation asks for. */
export const FIELDS_BY_TYPE: Record<RequestType, ConditionField[]> = {
  'Nghỉ phép': ['days'],
  'Tăng ca': ['hours'],
  'Công tác': ['tripDays', 'amount'],
  'Tạm ứng': ['amount'],
  'Thay đổi thông tin': [],
};

export type Operator = '>' | '>=' | '<' | '<=' | '=';
export const OPERATORS: { value: Operator; symbol: string; label: string }[] = [
  { value: '>', symbol: '>', label: '> lớn hơn' },
  { value: '>=', symbol: '≥', label: '≥ từ … trở lên' },
  { value: '<', symbol: '<', label: '< nhỏ hơn' },
  { value: '<=', symbol: '≤', label: '≤ không quá' },
  { value: '=', symbol: '=', label: '= bằng' },
];

// ---------- organisation (who an approver role resolves to) ----------

export interface Department {
  name: string;
  block: string;
  /** Quản lý trực tiếp of a typical employee there. */
  manager: string;
  head: string;
}
export const BLOCK_DIRECTORS: Record<string, string> = {
  'Khối Kinh doanh': 'Lê Hoàng Phúc',
  'Khối Vận hành': 'Hoàng Minh Tuấn',
  'Khối Hỗ trợ': 'Trần Quốc Bảo',
};
export const BLOCKS = Object.keys(BLOCK_DIRECTORS);
export const DEPARTMENTS: Department[] = [
  { name: 'Kinh doanh miền Bắc', block: 'Khối Kinh doanh', manager: 'Lý Hoàng Nam', head: 'Nguyễn Đức Thắng' },
  { name: 'Kinh doanh miền Nam', block: 'Khối Kinh doanh', manager: 'Nguyễn Thị Ngọc Diệp', head: 'Phan Thanh Tùng' },
  { name: 'Chăm sóc khách hàng', block: 'Khối Kinh doanh', manager: 'Võ Thành Nam', head: 'Đinh Thu Trang' },
  { name: 'Kho vận', block: 'Khối Vận hành', manager: 'Mai Xuân Phúc', head: 'Hồ Quang Vinh' },
  { name: 'Phòng Kế toán', block: 'Khối Hỗ trợ', manager: 'Trần Thị Mai', head: 'Ngô Thị Lan' },
  { name: 'Phòng Nhân sự', block: 'Khối Hỗ trợ', manager: 'Phạm Thu Hà', head: 'Đặng Anh' },
  { name: 'Phòng Công nghệ thông tin', block: 'Khối Hỗ trợ', manager: 'Cao Minh Quân', head: 'Tạ Hữu Lộc' },
];
export const COMPANY = 'Toàn công ty';
const HR_TEAM = 'Phạm Thu Hà, Bùi Khánh Linh';

export const inScope = (dept: Department, scope: string) => scope === COMPANY || dept.block === scope || dept.name === scope;

// ---------- model ----------

export interface StepCondition {
  field: ConditionField;
  op: Operator;
  /** As typed; parsed with parseNumber. */
  value: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  approver: ApproverKind;
  /** PEOPLE id when approver is 'person'. */
  person: string;
  mode: ApproveMode;
  /** Deadline in working hours, as typed. */
  hours: string;
  overdue: OverdueAction;
  /** Off keeps the condition values, so ticking the box again restores them. */
  conditional: boolean;
  condition: StepCondition;
  canReturn: boolean;
  canReject: boolean;
  canDelegate: boolean;
}

/** What the editor changes. */
export interface WorkflowConfig {
  name: string;
  type: RequestType;
  scope: string;
  steps: WorkflowStep[];
}

export interface Workflow extends WorkflowConfig {
  id: string;
  status: WorkflowStatus;
  /** Last applied version; 0 = never applied. New requests use it; requests already sent keep theirs. */
  version: number;
  updated: string;
  updatedBy: string;
  /** Saved with "Lưu nháp" on an applied workflow: the applied version stays in force until "Áp dụng". */
  draft?: WorkflowConfig & { saved: string };
}

let stepSeq = 0;
let workflowSeq = 100;
export const newWorkflowId = () => `wf-${++workflowSeq}`;

export function defaultStepName(approver: ApproverKind, person = ''): string {
  if (approver === 'person') {
    const p = PEOPLE.find((x) => x.id === person);
    return p ? `${p.title} duyệt` : 'Người được chỉ định duyệt';
  }
  return `${APPROVERS.find((a) => a.value === approver)!.label} duyệt`;
}

export function newStep(type: RequestType, approver: ApproverKind = 'head', more: Partial<WorkflowStep> = {}): WorkflowStep {
  return {
    id: `step-${++stepSeq}`,
    name: defaultStepName(approver),
    approver,
    person: '',
    mode: 'any',
    hours: '24',
    overdue: 'escalate',
    conditional: false,
    condition: { field: FIELDS_BY_TYPE[type][0] ?? 'days', op: '>', value: '' },
    canReturn: true,
    canReject: true,
    canDelegate: false,
    ...more,
  };
}

export const cloneConfig = (c: WorkflowConfig): WorkflowConfig => ({
  name: c.name,
  type: c.type,
  scope: c.scope,
  steps: c.steps.map((s) => ({ ...s, condition: { ...s.condition } })),
});

/** What the editor starts from: the saved draft if there is one, otherwise the applied configuration. */
export const editableConfig = (w: Workflow): WorkflowConfig => cloneConfig(w.draft ?? w);

export const sameConfig = (a: WorkflowConfig, b: WorkflowConfig) => JSON.stringify(a) === JSON.stringify(b);

// ---------- formatting ----------

/** "5.000.000", "5000000", "2,5" → number; empty or not a number → NaN. */
export function parseNumber(raw: string): number {
  const text = raw.trim().replace(/\s/g, '');
  if (!text) return NaN;
  return Number(text.replace(/\./g, '').replace(',', '.'));
}

export const formatNumber = (n: number) => n.toLocaleString('vi-VN');

export function formatValue(field: ConditionField, raw: string): string {
  const n = parseNumber(raw);
  const text = Number.isNaN(n) ? raw.trim() || '…' : formatNumber(n);
  return field === 'amount' ? `${text} ₫` : text;
}

export const stepName = (s: WorkflowStep) => s.name.trim() || 'Bước chưa đặt tên';

export function conditionText(c: StepCondition): string {
  const op = OPERATORS.find((o) => o.value === c.op)!.symbol;
  return `Chỉ khi ${CONDITION_FIELDS[c.field].label.toLowerCase()} ${op} ${formatValue(c.field, c.value)}`;
}

export function approverText(s: WorkflowStep): string {
  if (s.approver !== 'person') return APPROVERS.find((a) => a.value === s.approver)!.label;
  const p = PEOPLE.find((x) => x.id === s.person);
  return p ? `${p.name} (${p.title})` : 'Chưa chọn người duyệt';
}

export function deadlineText(s: WorkflowStep): string {
  const h = parseNumber(s.hours);
  const overdue = OVERDUE.find((o) => o.value === s.overdue)!.label.toLowerCase();
  return `${Number.isNaN(h) ? '…' : formatNumber(h)} giờ · quá hạn: ${overdue}`;
}

/** Longest path: every step used up to its deadline (steps with an invalid deadline count 0). */
export function totalHours(steps: WorkflowStep[]): number {
  return steps.reduce((sum, s) => {
    const h = parseNumber(s.hours);
    return sum + (h > 0 ? h : 0);
  }, 0);
}

// ---------- validation ----------

export type StepField = 'name' | 'person' | 'hours' | 'value';
export type StepErrors = Partial<Record<StepField, string>>;
/** Short form for the flow and the summary: "Bước 3 cần chọn người duyệt". */
export const STEP_NEEDS: Record<StepField, string> = {
  name: 'cần tên bước',
  person: 'cần chọn người duyệt',
  hours: 'cần thời hạn xử lý hợp lệ',
  value: 'cần giá trị cho điều kiện',
};

export function stepErrors(s: WorkflowStep, type: RequestType): StepErrors {
  const errors: StepErrors = {};
  if (!s.name.trim()) errors.name = 'Nhập tên bước, ví dụ “Trưởng phòng duyệt”.';
  if (s.approver === 'person' && !s.person) errors.person = 'Chọn người sẽ duyệt ở bước này.';
  const hours = parseNumber(s.hours);
  if (!(hours > 0)) errors.hours = 'Nhập số giờ lớn hơn 0, ví dụ 24.';
  else if (hours > 720) errors.hours = 'Thời hạn tối đa 720 giờ (30 ngày). Bước cần lâu hơn thì chia thành nhiều bước.';
  if (s.conditional && FIELDS_BY_TYPE[type].length) {
    const value = parseNumber(s.condition.value);
    if (Number.isNaN(value) || value < 0) errors.value = `Nhập một số không âm, ví dụ ${CONDITION_FIELDS[s.condition.field].example}.`;
  }
  return errors;
}

// ---------- simulation ----------

export interface SimStep {
  step: WorkflowStep;
  index: number;
  applies: boolean;
  who: string;
  /** Why the step is skipped, with the simulated value: "Chỉ khi số ngày nghỉ > 3 (đơn này: 2)". */
  reason?: string;
}

function compare(a: number, op: Operator, b: number): boolean {
  switch (op) {
    case '>':
      return a > b;
    case '>=':
      return a >= b;
    case '<':
      return a < b;
    case '<=':
      return a <= b;
    default:
      return a === b;
  }
}

export function resolveApprover(s: WorkflowStep, dept: Department): string {
  switch (s.approver) {
    case 'manager':
      return `${dept.manager} · quản lý trực tiếp`;
    case 'head':
      return `${dept.head} · trưởng phòng, ${dept.name}`;
    case 'director':
      return `${BLOCK_DIRECTORS[dept.block] ?? '—'} · giám đốc ${dept.block}`;
    case 'hr':
      return `${HR_TEAM} · Phòng Nhân sự`;
    default:
      return approverText(s);
  }
}

/** The path a request with these numbers, from this department, would take. */
export function simulate(config: WorkflowConfig, values: Partial<Record<ConditionField, number>>, dept: Department): SimStep[] {
  const fields = FIELDS_BY_TYPE[config.type];
  return config.steps.map((step, index) => {
    const who = resolveApprover(step, dept);
    if (!step.conditional || !fields.includes(step.condition.field)) return { step, index, applies: true, who };
    const limit = parseNumber(step.condition.value);
    const value = values[step.condition.field] ?? 0;
    // An unfinished condition does not skip anything: the step stays on the path until the rule is complete.
    const applies = Number.isNaN(limit) || compare(value, step.condition.op, limit);
    const shown = step.condition.field === 'amount' ? `${formatNumber(value)} ₫` : formatNumber(value);
    return { step, index, applies, who, reason: applies ? undefined : `${conditionText(step.condition)} (đơn này: ${shown})` };
  });
}

// ---------- demo data ----------

const when = (field: ConditionField, op: Operator, value: number): Partial<WorkflowStep> => ({
  conditional: true,
  condition: { field, op, value: String(value) },
});
const person = (id: string): Partial<WorkflowStep> => ({ approver: 'person', person: id, name: defaultStepName('person', id) });

export const WORKFLOWS: Workflow[] = [
  {
    id: 'wf-01',
    name: 'Nghỉ phép · toàn công ty',
    type: 'Nghỉ phép',
    scope: COMPANY,
    status: 'active',
    version: 3,
    updated: '12/10/2026',
    updatedBy: 'Phạm Thu Hà',
    steps: [
      newStep('Nghỉ phép', 'manager'),
      newStep('Nghỉ phép', 'head', when('days', '>', 3)),
      newStep('Nghỉ phép', 'hr', { name: 'Phòng Nhân sự ghi nhận', hours: '8', overdue: 'remind', canReject: false }),
    ],
  },
  {
    id: 'wf-02',
    name: 'Nghỉ phép · Khối Kinh doanh',
    type: 'Nghỉ phép',
    scope: 'Khối Kinh doanh',
    status: 'active',
    version: 2,
    updated: '03/09/2026',
    updatedBy: 'Phạm Thu Hà',
    steps: [
      newStep('Nghỉ phép', 'manager', { hours: '12' }),
      newStep('Nghỉ phép', 'director', when('days', '>=', 5)),
      newStep('Nghỉ phép', 'hr', { name: 'Phòng Nhân sự ghi nhận', hours: '8', overdue: 'remind', canReject: false }),
    ],
  },
  {
    id: 'wf-03',
    name: 'Tăng ca · toàn công ty',
    type: 'Tăng ca',
    scope: COMPANY,
    status: 'active',
    version: 4,
    updated: '28/09/2026',
    updatedBy: 'Đặng Anh',
    steps: [newStep('Tăng ca', 'manager', { hours: '8' }), newStep('Tăng ca', 'head', { hours: '8', ...when('hours', '>', 4) })],
  },
  {
    id: 'wf-04',
    name: 'Tăng ca · Khối Vận hành',
    type: 'Tăng ca',
    scope: 'Khối Vận hành',
    status: 'draft',
    version: 0,
    updated: '15/10/2026',
    updatedBy: 'Đặng Anh',
    steps: [
      newStep('Tăng ca', 'manager', { hours: '4', overdue: 'auto' }),
      newStep('Tăng ca', 'head', { hours: '8', ...when('hours', '>=', 3) }),
      newStep('Tăng ca', 'director', { hours: '24', ...when('hours', '>', 6) }),
    ],
  },
  {
    id: 'wf-05',
    name: 'Công tác trong nước',
    type: 'Công tác',
    scope: COMPANY,
    status: 'active',
    version: 2,
    updated: '20/08/2026',
    updatedBy: 'Phạm Thu Hà',
    steps: [
      newStep('Công tác', 'head'),
      newStep('Công tác', 'director', when('tripDays', '>', 3)),
      newStep('Công tác', 'person', { ...person('admin-head'), name: 'Phòng Hành chính đặt vé, khách sạn', hours: '16', overdue: 'remind', canReject: false }),
    ],
  },
  {
    id: 'wf-06',
    name: 'Công tác · quy trình 2025',
    type: 'Công tác',
    scope: COMPANY,
    status: 'inactive',
    version: 5,
    updated: '30/06/2026',
    updatedBy: 'Đặng Anh',
    steps: [
      newStep('Công tác', 'head', { hours: '48' }),
      newStep('Công tác', 'director', { hours: '48' }),
      newStep('Công tác', 'person', { ...person('ceo'), hours: '72', overdue: 'remind' }),
      newStep('Công tác', 'hr', { name: 'Phòng Nhân sự làm thủ tục', hours: '24', overdue: 'remind', canReject: false }),
    ],
  },
  {
    id: 'wf-07',
    name: 'Tạm ứng công tác phí',
    type: 'Tạm ứng',
    scope: COMPANY,
    status: 'active',
    version: 3,
    updated: '01/10/2026',
    updatedBy: 'Ngô Thị Lan',
    steps: [
      newStep('Tạm ứng', 'head'),
      newStep('Tạm ứng', 'person', { ...person('chief-accountant'), name: 'Kế toán trưởng kiểm tra chứng từ', overdue: 'remind' }),
      newStep('Tạm ứng', 'person', { ...person('cfo'), hours: '48', overdue: 'remind', canDelegate: true, ...when('amount', '>', 20000000) }),
    ],
  },
  {
    id: 'wf-08',
    name: 'Tạm ứng tiếp khách · Khối Kinh doanh',
    type: 'Tạm ứng',
    scope: 'Khối Kinh doanh',
    status: 'active',
    version: 1,
    updated: '16/10/2026',
    updatedBy: 'Đặng Anh',
    steps: [
      newStep('Tạm ứng', 'manager', { hours: '12' }),
      newStep('Tạm ứng', 'director', when('amount', '>=', 10000000)),
      newStep('Tạm ứng', 'person', { ...person('chief-accountant'), name: 'Kế toán trưởng duyệt chi', overdue: 'remind' }),
    ],
  },
  {
    id: 'wf-09',
    name: 'Thay đổi thông tin cá nhân',
    type: 'Thay đổi thông tin',
    scope: COMPANY,
    status: 'active',
    version: 2,
    updated: '10/07/2026',
    updatedBy: 'Phạm Thu Hà',
    steps: [
      newStep('Thay đổi thông tin', 'hr', { name: 'Phòng Nhân sự xác minh giấy tờ', overdue: 'remind' }),
      newStep('Thay đổi thông tin', 'person', { ...person('hr-head'), overdue: 'auto', canReturn: false }),
    ],
  },
  {
    id: 'wf-10',
    name: 'Nghỉ phép · Phòng Công nghệ thông tin',
    type: 'Nghỉ phép',
    scope: 'Phòng Công nghệ thông tin',
    status: 'draft',
    version: 0,
    updated: '18/10/2026',
    updatedBy: 'Đặng Anh',
    steps: [
      newStep('Nghỉ phép', 'manager', { hours: '8' }),
      newStep('Nghỉ phép', 'head', when('days', '>', 2)),
      newStep('Nghỉ phép', 'director', when('days', '>', 10)),
      newStep('Nghỉ phép', 'hr', { name: 'Phòng Nhân sự ghi nhận', mode: 'all', hours: '8', overdue: 'remind', canReject: false }),
    ],
  },
];

// "Lưu nháp" on an applied workflow: lower the director threshold, not in force yet.
const wf08 = WORKFLOWS[7];
wf08.draft = { ...cloneConfig(wf08), saved: '17/10/2026' };
wf08.draft.steps[1].condition.value = '5000000';

/** "Thêm mới": a draft with one default step, not in the list until it is saved. */
export function blankWorkflow(): Workflow {
  return {
    id: newWorkflowId(),
    name: 'Quy trình mới',
    type: 'Nghỉ phép',
    scope: COMPANY,
    status: 'draft',
    version: 0,
    updated: TODAY,
    updatedBy: ME,
    steps: [newStep('Nghỉ phép', 'manager')],
  };
}

/** "Nhân bản": the version in force (what the list shows), new ids, a draft that was never applied. */
export function copyOf(w: Workflow): Workflow {
  const config = cloneConfig(w);
  return {
    ...config,
    id: newWorkflowId(),
    name: `${config.name} (bản sao)`,
    status: 'draft',
    version: 0,
    updated: TODAY,
    updatedBy: ME,
    steps: config.steps.map((s) => ({ ...s, id: `step-${++stepSeq}`, condition: { ...s.condition } })),
  };
}

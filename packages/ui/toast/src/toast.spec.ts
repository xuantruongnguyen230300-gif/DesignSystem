import { LiveAnnouncer } from '@angular/cdk/a11y';
import { TestBed } from '@angular/core/testing';
import { NxtToast, NxtToastDismissReason, nxtToastDuration } from './toast';

const toastEl = () => document.querySelector<HTMLElement>('.nxt-toast');

describe('NxtToast', () => {
  let announced: [string, string | undefined][];

  beforeEach(() => {
    vi.useFakeTimers();
    announced = [];
    TestBed.configureTestingModule({
      providers: [{ provide: LiveAnnouncer, useValue: { announce: (m: string, p?: string) => (announced.push([m, p]), Promise.resolve()) } }],
    });
  });

  afterEach(() => {
    TestBed.inject(NxtToast).clear();
    vi.useRealTimers();
    document.querySelectorAll('.cdk-overlay-container').forEach((c) => (c.innerHTML = ''));
  });

  function show(message = 'Đã lưu hồ sơ Nguyễn Văn An.', options = {}) {
    const ref = TestBed.inject(NxtToast).show(message, options);
    const reasons: NxtToastDismissReason[] = [];
    ref.afterDismissed.subscribe((r) => reasons.push(r));
    return { ref, reasons };
  }

  it('duration follows the text length: 3–5 s, 10 s with an action', () => {
    expect(nxtToastDuration('Đã lưu.')).toBe(3000);
    expect(nxtToastDuration('Đã lưu hồ sơ Nguyễn Thị Ngọc Diệp và gửi thông báo cho quản lý trực tiếp.')).toBe(5000);
    const mid = 'Đã gửi duyệt đơn nghỉ phép của Lê Minh Anh.';
    expect(nxtToastDuration(mid)).toBe(1000 + 60 * mid.length);
    expect(nxtToastDuration('Đã xoá.', true)).toBe(10000);
  });

  it('shows the message with a success icon, without taking focus, and announces it politely', () => {
    const before = document.activeElement;
    show();
    expect(toastEl()!.textContent).toContain('Đã lưu hồ sơ Nguyễn Văn An.');
    expect(toastEl()!.querySelector('nxt-icon svg')!.getAttribute('aria-hidden')).toBe('true');
    expect(toastEl()!.hasAttribute('role')).toBe(false);
    expect(document.activeElement).toBe(before);
    expect(announced).toEqual([['Đã lưu hồ sơ Nguyễn Văn An.', 'polite']]);
  });

  it('announcement can differ from the visible text', () => {
    show('Đã xoá 3 chức danh.', { action: 'Hoàn tác', announcement: 'Đã xoá 3 chức danh. Khôi phục trong mục Thùng rác.' });
    expect(announced[0][0]).toBe('Đã xoá 3 chức danh. Khôi phục trong mục Thùng rác.');
  });

  it('hides itself when the time runs out', () => {
    const { reasons } = show();
    vi.advanceTimersByTime(2999);
    expect(toastEl()).not.toBeNull();
    vi.advanceTimersByTime(1);
    expect(toastEl()).toBeNull();
    expect(reasons).toEqual(['timeout']);
  });

  it('never shows for less than 3 s, even when asked to', () => {
    show('Đã sao chép.', { duration: 500 });
    vi.advanceTimersByTime(2000);
    expect(toastEl()).not.toBeNull();
    vi.advanceTimersByTime(1000);
    expect(toastEl()).toBeNull();
  });

  it('one toast at a time: the next waits in the queue', () => {
    const a = show('Đã lưu hồ sơ.');
    const b = show('Đã gửi duyệt.');
    expect(document.querySelectorAll('.nxt-toast').length).toBe(1);
    expect(toastEl()!.textContent).toContain('Đã lưu hồ sơ.');
    vi.advanceTimersByTime(3000);
    expect(a.reasons).toEqual(['timeout']);
    expect(toastEl()!.textContent).toContain('Đã gửi duyệt.');
    expect(b.reasons).toEqual([]);
  });

  it('pauses while the pointer is on it, then resumes', () => {
    show();
    vi.advanceTimersByTime(2000);
    toastEl()!.dispatchEvent(new MouseEvent('mouseenter'));
    vi.advanceTimersByTime(10000);
    expect(toastEl()).not.toBeNull();
    toastEl()!.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(1000);
    expect(toastEl()).toBeNull();
  });

  it('pauses while focus is inside; the action runs, hides the toast and gives focus back', () => {
    const page = document.createElement('button');
    document.body.appendChild(page);
    page.focus();
    let acted = 0;
    const { ref, reasons } = show('Đã ngừng sử dụng 3 chức danh.', { action: 'Hoàn tác' });
    ref.onAction.subscribe(() => acted++);
    const action = toastEl()!.querySelector<HTMLButtonElement>('button')!;
    expect(action.textContent!.trim()).toBe('Hoàn tác');
    action.focus();
    action.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: page }));
    vi.advanceTimersByTime(60000);
    expect(toastEl()).not.toBeNull();
    action.click();
    expect(acted).toBe(1);
    expect(reasons).toEqual(['action']);
    expect(toastEl()).toBeNull();
    expect(document.activeElement).toBe(page);
    page.remove();
  });

  it('Escape inside the toast hides it', () => {
    const { reasons } = show('Đã ngừng sử dụng 3 chức danh.', { action: 'Hoàn tác' });
    const action = toastEl()!.querySelector<HTMLButtonElement>('button')!;
    action.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(toastEl()).toBeNull();
    expect(reasons).toEqual(['dismiss']);
  });

  it('dismiss() on a queued toast drops it; clear() drops everything', () => {
    show('Một');
    const two = show('Hai');
    const three = show('Ba');
    two.ref.dismiss();
    expect(two.reasons).toEqual(['dismiss']);
    TestBed.inject(NxtToast).clear();
    expect(three.reasons).toEqual(['dismiss']);
    expect(toastEl()).toBeNull();
  });
});

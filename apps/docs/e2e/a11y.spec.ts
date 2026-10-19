import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

const read = (file: string): string[] => JSON.parse(readFileSync(new URL(`../src/generated/${file}`, import.meta.url), 'utf8'));
const EXAMPLES = read('examples.json');
const PAGES = read('pages.json');
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const MODES = [
  { color: 'light', density: 'comfortable' },
  { color: 'dark', density: 'comfortable' },
  { color: 'light', density: 'compact' },
];

async function axe(page: Page, include?: string) {
  let builder = new AxeBuilder({ page }).withTags(WCAG);
  if (include) builder = builder.include(include);
  const { violations } = await builder.analyze();
  // Readable failure: rule, impact, and the first offending nodes.
  return violations.map((v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n    ')}`);
}

test.describe('@a11y examples', () => {
  for (const id of EXAMPLES) {
    for (const m of MODES) {
      test(`${id} · ${m.color}/${m.density}`, async ({ page }) => {
        await page.goto(`/examples/${id}?color=${m.color}&density=${m.density}`);
        await page.locator('docs-example-page[data-ready]').waitFor();
        await page.waitForLoadState('networkidle');
        expect(await axe(page, '[data-example-root]')).toEqual([]);
      });
    }
  }
});

test.describe('@a11y pages', () => {
  for (const path of PAGES) {
    for (const color of ['light', 'dark']) {
      test(`${path} · ${color}`, async ({ page }) => {
        await page.goto(`${path}?color=${color}`);
        await page.getByRole('main').waitFor();
        await page.waitForLoadState('networkidle');
        expect(await axe(page)).toEqual([]);
      });
    }
  }
});

test.describe('keyboard', () => {
  test('first Tab reaches the skip link, which moves focus to main', async ({ page }) => {
    await page.goto('/foundations/layout');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Bỏ qua tới nội dung' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('main')).toBeFocused();
  });

  test('Ctrl+K search is diacritic-insensitive and keyboard operable', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+k');
    const input = page.getByRole('combobox', { name: 'Tìm trong tài liệu' });
    await expect(input).toBeFocused();
    await input.fill('nut');
    await expect(page.getByRole('option').first()).toContainText('Button');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/components\/button$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Button' })).toBeVisible();
  });

  test('Escape closes the results first, then clears the search box (Windows convention)', async ({ page }) => {
    await page.goto('/');
    const search = page.getByRole('combobox', { name: 'Tìm trong tài liệu' });
    await search.click();
    await search.fill('mau');
    await expect(search).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('option').first()).toContainText('Màu');
    await page.keyboard.press('Escape');
    await expect(search).toHaveAttribute('aria-expanded', 'false');
    await expect(search).toHaveValue('mau');
    await expect(search).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(search).toHaveValue('');
  });

  test('disabled button stays focusable and does not activate', async ({ page }) => {
    await page.goto('/examples/button-states');
    const approve = page.getByRole('button', { name: 'Phê duyệt' });
    await approve.focus();
    await expect(approve).toBeFocused();
    await expect(approve).toHaveAttribute('aria-disabled', 'true');
    await expect(approve).toHaveAccessibleDescription(/thiếu 2 tài liệu/);
  });
});

test.describe('content', () => {
  test('every roadmap link points to an existing docs page', async ({ page }) => {
    await page.goto('/roadmap');
    const hrefs = await page.locator('.docs-roadmap__list a').evaluateAll((links) => links.map((a) => a.getAttribute('href')));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(PAGES, `${href} is not a docs page`).toContain(href);
  });
});

test.describe('shell', () => {
  test('sidenav collapses to an icon rail, keeps link names, and remembers the choice', async ({ page }) => {
    await page.goto('/foundations/color');
    const nav = page.getByRole('navigation', { name: 'Điều hướng tài liệu' });
    const toggle = nav.getByRole('button', { name: 'Thu gọn menu' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await toggle.click();
    const expand = nav.getByRole('button', { name: 'Mở rộng menu' });
    await expect(expand).toHaveAttribute('aria-expanded', 'false');
    await expect(nav.getByRole('link', { name: 'Trang chủ' })).toBeVisible();
    await page.reload();
    await expect(nav.getByRole('button', { name: 'Mở rộng menu' })).toBeVisible();
    expect(await axe(page)).toEqual([]);
  });

  test('below 1024px the navigation is a modal drawer: focus moves in, page is inert, Esc returns focus', async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 900 });
    await page.goto('/foundations/color');
    const menu = page.getByRole('button', { name: 'Mở menu điều hướng' });
    await expect(page.getByRole('navigation', { name: 'Điều hướng tài liệu' })).toBeHidden();
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    const nav = page.getByRole('navigation', { name: 'Điều hướng tài liệu' });
    await expect(nav).toBeVisible();
    await expect(nav.locator(':focus')).toHaveCount(1);
    await expect(page.locator('.nxt-app-shell__frame')).toHaveAttribute('inert', '');
    await page.keyboard.press('Escape');
    await expect(nav).toBeHidden();
    await expect(menu).toBeFocused();
    // Touch screen-reader users have no Escape: the drawer is a named modal dialog with its own close button.
    await menu.click();
    const dialog = page.getByRole('dialog', { name: 'Menu điều hướng' });
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await expect(page.getByRole('link', { name: 'Bỏ qua tới nội dung' })).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Đóng menu điều hướng' }).click();
    await expect(nav).toBeHidden();
    await expect(menu).toBeFocused();
  });

  test('light/dark switch is an icon radio group with names', async ({ page }) => {
    await page.goto('/');
    const dark = page.getByRole('radio', { name: 'Giao diện tối' });
    await dark.check({ force: true });
    await expect(page.locator('html')).toHaveAttribute('data-nxt-color', 'dark');
    await page.getByRole('radio', { name: 'Giao diện sáng' }).check({ force: true });
    await expect(page.locator('html')).toHaveAttribute('data-nxt-color', 'light');
  });
});

test.describe('templates', () => {
  test('approval: reject needs a comment, then moves on to the next pending request', async ({ page }) => {
    await page.goto('/examples/template-approval');
    await page.locator('docs-example-page[data-ready]').waitFor();
    const list = page.getByRole('list', { name: 'Danh sách đơn' });
    await expect(list.locator('[aria-current="true"]')).toContainText('Lê Minh Anh');
    await page.getByRole('button', { name: 'Từ chối' }).click();
    const comment = page.getByRole('textbox', { name: 'Ý kiến của bạn' });
    await expect(comment).toHaveAttribute('aria-invalid', 'true');
    await expect(comment).toBeFocused();
    await comment.fill('Trùng lịch kiểm toán, đổi sang tuần sau.');
    await page.getByRole('button', { name: 'Từ chối' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Đã từ chối' })).toContainText('Lê Minh Anh');
    await expect(list.locator('[aria-current="true"]')).toContainText('Phạm Thu Hà');
    await list.locator('[aria-current="true"]').focus();
    await page.keyboard.press('ArrowDown');
    await expect(list.locator('[aria-current="true"]')).toContainText('Võ Thành Nam');
    await expect(list.locator('[aria-current="true"]')).toBeFocused();
  });

  test('catalog: search ignores diacritics; "Thêm mới" opens a form that validates on save', async ({ page }) => {
    await page.goto('/examples/template-catalog');
    await page.locator('docs-example-page[data-ready]').waitFor();
    const search = page.getByRole('searchbox', { name: 'Tìm chức danh' });
    await search.fill('ke toan');
    const rows = page.getByRole('table').getByRole('rowheader');
    await expect(rows).toHaveCount(4);
    await expect(rows.first()).toContainText('Kế toán');
    await search.press('Escape');
    await expect(search).toHaveValue('');
    const add = page.getByRole('button', { name: 'Thêm mới chức danh' });
    await expect(add).toHaveText(/Thêm mới/);
    await add.click();
    const dialog = page.getByRole('dialog', { name: 'Thêm chức danh' });
    await dialog.getByRole('button', { name: 'Lưu' }).click();
    const code = dialog.getByRole('textbox', { name: /^Mã/ });
    await expect(code).toBeFocused();
    await expect(code).toHaveAttribute('aria-invalid', 'true');
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(add).toBeFocused();
  });

  test('catalog: list actions are on the toolbar, not the page header; the user appears once, top right', async ({ page }) => {
    await page.goto('/examples/template-catalog');
    await page.locator('docs-example-page[data-ready]').waitFor();
    const header = page.locator('nxt-page-header');
    await expect(header.getByRole('button', { name: /Thêm mới|Nhập|Xuất/ })).toHaveCount(0);
    const toolbar = page.locator('.bar');
    await expect(toolbar.getByRole('button', { name: 'Thêm mới chức danh' })).toBeVisible();
    await expect(toolbar.getByRole('button', { name: 'Nhập chức danh từ Excel' })).toBeVisible();
    await expect(toolbar.getByRole('button', { name: /^Xuất \d+ chức danh/ })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Điều hướng NXT HRM' })).not.toContainText('Đặng Anh');
    await expect(page.getByRole('button', { name: 'Tài khoản: Đặng Anh' })).toHaveCount(1);
  });

  test('catalog: every filter lives in the "Bộ lọc" panel; applied filters become chips', async ({ page }) => {
    await page.goto('/examples/template-catalog');
    await page.locator('docs-example-page[data-ready]').waitFor();
    const filter = page.getByRole('button', { name: /^Bộ lọc/ });
    await filter.click();
    const panel = page.getByRole('dialog', { name: 'Lọc chức danh' });
    await panel.getByRole('checkbox', { name: 'Quản lý' }).check();
    await panel.getByRole('button', { name: 'Huỷ' }).click();
    await expect(panel).toHaveCount(0);
    await expect(filter).toBeFocused();
    await expect(page.getByRole('table').getByRole('rowheader')).toHaveCount(10);

    await filter.click();
    await expect(panel.getByRole('checkbox', { name: 'Quản lý' })).not.toBeChecked();
    await panel.getByRole('checkbox', { name: 'Quản lý' }).check();
    await panel.getByRole('radio', { name: 'Đang sử dụng' }).check();
    await panel.getByRole('button', { name: 'Áp dụng' }).click();
    await expect(filter).toHaveAccessibleName(/đang áp dụng 2/);
    await expect(page.getByRole('table').getByRole('rowheader')).toHaveCount(7);
    const chips = page.getByRole('group', { name: 'Bộ lọc đang áp dụng' });
    await chips.getByRole('button', { name: 'Bỏ lọc Trạng thái: Đang sử dụng' }).click();
    await expect(chips.getByRole('button', { name: 'Bỏ lọc Nhóm: Quản lý' })).toBeFocused();
    await chips.getByRole('button', { name: 'Bỏ lọc Nhóm: Quản lý' }).click();
    await expect(chips).toHaveCount(0);
    await expect(filter).toBeFocused();
    expect(await axe(page, '[data-example-root]')).toEqual([]);
  });

  test('catalog: Shift selects a range; rows in use are not deleted; deletion can be undone', async ({ page }) => {
    await page.goto('/examples/template-catalog');
    await page.locator('docs-example-page[data-ready]').waitFor();
    const box = (name: string) => page.getByRole('checkbox', { name: `Chọn ${name}` });
    await box('Giám đốc khối Kinh doanh').check();
    await box('Lái xe').click({ modifiers: ['Shift'] });
    await expect(page.getByText('Đã chọn 5')).toBeVisible();
    await expect(box('Bảo vệ')).toBeChecked();
    await page.getByRole('button', { name: 'Xoá 5' }).click();
    const notice = page.locator('.notice');
    await expect(notice).toContainText('Đã xoá 1 chức danh.');
    await expect(notice).toContainText('4 chức danh đang được dùng nên chưa xoá');
    await expect(page.getByRole('table').getByRole('rowheader', { name: 'Bảo vệ' })).toHaveCount(0);
    await notice.getByRole('button', { name: 'Hoàn tác' }).click();
    await expect(page.getByRole('table').getByRole('rowheader', { name: 'Bảo vệ' })).toHaveCount(1);
  });

  test('catalog: import reviews every row before importing; export downloads what is shown', async ({ page }) => {
    await page.goto('/examples/template-catalog');
    await page.locator('docs-example-page[data-ready]').waitFor();
    await page.getByRole('button', { name: 'Nhập chức danh từ Excel' }).click();
    const dialog = page.getByRole('dialog', { name: 'Nhập chức danh từ Excel' });
    const csv = '﻿Mã,Tên,Nhóm,Cấp bậc,Mô tả,Trạng thái\nKT-NB,Kiểm toán nội bộ,Chuyên môn,L3 · Chuyên viên chính,,Đang dùng\nKT-TH,Trùng mã,Chuyên môn,L2 · Chuyên viên,,\n,Thiếu mã,Hỗ trợ,L1 · Nhân viên,,\n';
    await dialog.locator('input[type="file"]').setInputFiles({ name: 'chuc-danh.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
    await expect(dialog.getByRole('status')).toContainText('1 dòng hợp lệ');
    await expect(dialog.getByRole('status')).toContainText('2 dòng lỗi');
    await expect(dialog.getByRole('region', { name: 'Danh sách lỗi' })).toContainText('Mã KT-TH đã tồn tại');
    expect(await axe(page, '.cdk-overlay-container')).toEqual([]);
    await dialog.getByRole('button', { name: 'Nhập 1 dòng' }).click();
    await expect(page.locator('.notice')).toContainText('Đã nhập 1 chức danh.');
    await expect(page.getByRole('tab', { name: /Chức danh/ })).toContainText('30');

    await page.getByRole('searchbox', { name: 'Tìm chức danh' }).fill('ke toan');
    const exportButton = page.getByRole('button', { name: 'Xuất 4 chức danh đang lọc ra Excel' });
    const [download] = await Promise.all([page.waitForEvent('download'), exportButton.click()]);
    expect(download.suggestedFilename()).toBe('chuc-danh-19-10-2026.csv');
    const text = (await (await download.createReadStream()).toArray()).join('');
    expect(text.split(/\r\n/)).toHaveLength(5);
    expect(text).toContain('Kế toán tổng hợp');
  });

  test('catalog: tabs that do not fit go under "Xem thêm"; an empty catalog offers the first actions', async ({ page }) => {
    await page.setViewportSize({ width: 900, height: 800 });
    await page.goto('/examples/template-catalog');
    await page.locator('docs-example-page[data-ready]').waitFor();
    const more = page.getByRole('button', { name: /^Xem thêm \d+ tab$/ });
    await expect(more).toBeVisible();
    await more.click();
    await page.getByRole('menuitem', { name: /Phụ cấp/ }).click();
    const tab = page.getByRole('tab', { name: /Phụ cấp/ });
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(tab).toBeFocused();
    await expect(page.getByRole('button', { name: 'Thêm mới phụ cấp' })).toBeVisible();
    await page.keyboard.press('Home');
    await expect(page.getByRole('tab', { name: /Chức danh/ })).toBeFocused();
    await page.getByRole('tab', { name: /Ca làm việc/ }).or(page.getByRole('button', { name: /^Xem thêm/ })).first().click();
    if (await page.getByRole('menuitem', { name: /Ca làm việc/ }).isVisible()) await page.getByRole('menuitem', { name: /Ca làm việc/ }).click();
    await expect(page.getByRole('heading', { name: 'Chưa có ca làm việc nào' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Nhập từ Excel' })).toBeVisible();
  });

  test('approval: search + "Bộ lọc" narrow the queue, with chips', async ({ page }) => {
    await page.goto('/examples/template-approval');
    await page.locator('docs-example-page[data-ready]').waitFor();
    const list = page.getByRole('list', { name: 'Danh sách đơn' });
    await page.getByRole('button', { name: /^Bộ lọc/ }).click();
    await page.getByRole('dialog', { name: 'Lọc đơn' }).getByRole('checkbox', { name: 'Tăng ca' }).check();
    await page.keyboard.press('Enter');
    await expect(list.getByRole('listitem')).toHaveCount(2);
    await expect(page.getByRole('group', { name: 'Bộ lọc đang áp dụng' })).toContainText('Loại đơn: Tăng ca');
    await page.getByRole('searchbox', { name: 'Tìm đơn' }).fill('kiem ke');
    await expect(list.getByRole('listitem')).toHaveCount(1);
    await expect(list).toContainText('Hoàng Văn Đức');
  });
});

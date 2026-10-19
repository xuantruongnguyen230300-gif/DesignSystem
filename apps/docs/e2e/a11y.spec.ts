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

  test('catalog: search ignores diacritics and the form drawer validates on save', async ({ page }) => {
    await page.goto('/examples/template-catalog');
    await page.locator('docs-example-page[data-ready]').waitFor();
    await page.getByRole('searchbox', { name: 'Tìm chức danh' }).fill('ke toan');
    const rows = page.getByRole('table').getByRole('rowheader');
    await expect(rows).toHaveCount(4);
    await expect(rows.first()).toContainText('Kế toán');
    await page.getByRole('button', { name: 'Thêm chức danh' }).click();
    const dialog = page.getByRole('dialog', { name: 'Thêm chức danh' });
    await dialog.getByRole('button', { name: 'Lưu chức danh' }).click();
    await expect(dialog.getByRole('textbox', { name: /Mã chức danh/ })).toBeFocused();
    await expect(dialog.getByRole('textbox', { name: /Mã chức danh/ })).toHaveAttribute('aria-invalid', 'true');
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Thêm chức danh' })).toBeFocused();
  });
});

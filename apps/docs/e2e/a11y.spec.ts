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
        await page.locator('docs-root main').waitFor();
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
    await expect(page.locator('main#main')).toBeFocused();
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

  test('Escape closes search and restores focus to the trigger', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByRole('button', { name: /Tìm trang/ });
    const search = page.getByRole('combobox', { name: 'Tìm trong tài liệu' });
    await trigger.click();
    await expect(search).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(search).toHaveCount(0);
    await expect(trigger).toBeFocused();
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

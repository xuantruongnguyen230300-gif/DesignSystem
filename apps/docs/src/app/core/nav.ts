import type { NxtNavItem } from '@nxt/ui/app-shell';
import type { NxtIconName } from '@nxt/ui/icon';
// Only the minimal nav list: full page metadata (generated/content.ts) stays out of the initial bundle.
import { NAV_PAGES } from '../../generated/nav';
import type { DocStatus } from './types';

const SECTION_ICON: Record<string, NxtIconName> = {
  'getting-started': 'rocket',
  foundations: 'palette',
  components: 'components',
  templates: 'template',
  patterns: 'layers-subtract',
};

export interface ReadingItem {
  title: string;
  path: string;
}

/**
 * Side navigation derived from content frontmatter: every page appears exactly once,
 * sections are collapsible groups with icons, component groups become headings.
 */
function buildNav(): NxtNavItem[] {
  const items: NxtNavItem[] = [{ label: 'Trang chủ', icon: 'home', link: '/', exact: true }];
  const sections = new Map<string, { title: string; groups: Map<string | null, NxtNavItem[]> }>();
  for (const page of NAV_PAGES) {
    if (!sections.has(page.section)) sections.set(page.section, { title: page.sectionTitle, groups: new Map() });
    const groups = sections.get(page.section)!.groups;
    if (!groups.has(page.group)) groups.set(page.group, []);
    groups.get(page.group)!.push({ label: page.title, link: page.path });
  }
  for (const [key, s] of sections) {
    const children = [...s.groups].flatMap(([group, links]) => (group ? [{ label: group, heading: true }, ...links] : links));
    items.push({ label: s.title, icon: SECTION_ICON[key] ?? 'folder', children });
  }
  items.push({ label: 'Tài nguyên', icon: 'map-2', children: [{ label: 'Roadmap & trạng thái', link: '/roadmap' }] });
  return items;
}

export const NAV: NxtNavItem[] = buildNav();

/** Flat reading order for previous/next links. */
export const READING_ORDER: ReadingItem[] = [
  ...NAV_PAGES.map((p) => ({ title: p.title, path: p.path })),
  { title: 'Roadmap & trạng thái', path: '/roadmap' },
];

export const STATUS_LABEL: Record<DocStatus, string> = {
  draft: 'Draft',
  beta: 'Beta',
  stable: 'Stable',
  deprecated: 'Deprecated',
};

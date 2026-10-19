import { PAGES } from '../../generated/content';
import type { DocPage, DocStatus } from './types';

export interface NavItem {
  title: string;
  path: string;
  status: DocStatus | null;
}
export interface NavGroup {
  title: string | null;
  items: NavItem[];
}
export interface NavSection {
  key: string;
  title: string;
  groups: NavGroup[];
}

const toItem = (p: DocPage): NavItem => ({ title: p.title, path: p.path, status: p.status });

/** Navigation is derived from content frontmatter: every page appears exactly once. */
export function buildNav(): NavSection[] {
  const sections: NavSection[] = [];
  for (const page of PAGES) {
    let section = sections.find((s) => s.key === page.section);
    if (!section) {
      section = { key: page.section, title: page.sectionTitle, groups: [] };
      sections.push(section);
    }
    let group = section.groups.find((g) => g.title === page.group);
    if (!group) {
      group = { title: page.group, items: [] };
      section.groups.push(group);
    }
    group.items.push(toItem(page));
  }
  sections.push({
    key: 'resources',
    title: 'Tài nguyên',
    groups: [{ title: null, items: [{ title: 'Roadmap & trạng thái', path: '/roadmap', status: null }] }],
  });
  return sections;
}

export const NAV = buildNav();

/** Flat reading order for previous/next links. */
export const READING_ORDER: NavItem[] = NAV.flatMap((s) => s.groups.flatMap((g) => g.items));

export const STATUS_LABEL: Record<DocStatus, string> = {
  draft: 'Draft',
  beta: 'Beta',
  stable: 'Stable',
  deprecated: 'Deprecated',
};

import type { NxtIconName } from '@nxt/ui/icon';
import { PAGES } from '../../generated/content';
import { fold } from '../core/tokens-data';

/**
 * Search index for the header search. Loaded on demand (dynamic import from docs-search.ts), never in the
 * initial bundle: it pulls in every page's description, keywords and table of contents (generated/content.ts).
 */
export interface SearchItem {
  key: string;
  title: string;
  meta: string;
  icon: NxtIconName;
  path: string;
  fragment?: string;
  /** Diacritic-folded text the query is matched against ("nut" finds "Nút"). */
  haystack: string;
  rank: number;
}

const SECTION_ICON: Record<string, NxtIconName> = {
  'getting-started': 'rocket',
  foundations: 'palette',
  components: 'components',
  templates: 'template',
};

export const SEARCH_INDEX: readonly SearchItem[] = [
  ...PAGES.map((p) => ({
    key: p.path,
    title: p.title,
    meta: p.sectionTitle,
    icon: SECTION_ICON[p.section] ?? 'file-text',
    path: p.path,
    haystack: fold([p.title, ...(p.keywords ?? []), p.description].join(' ')),
    rank: 0,
  })),
  ...PAGES.flatMap((p) =>
    p.toc.map((t) => ({
      key: `${p.path}#${t.id}`,
      title: t.text,
      meta: p.title,
      icon: 'corner-down-left' as NxtIconName,
      path: p.path,
      fragment: t.id,
      haystack: fold(`${t.text} ${p.title}`),
      rank: 1,
    })),
  ),
  { key: '/roadmap', title: 'Roadmap & trạng thái', meta: 'Tài nguyên', icon: 'map-2', path: '/roadmap', haystack: fold('roadmap trang thai ke hoach lo trinh'), rank: 0 },
];

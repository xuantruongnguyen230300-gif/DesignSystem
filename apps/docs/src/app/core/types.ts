import type { Type } from '@angular/core';

export type DocStatus = 'draft' | 'beta' | 'stable' | 'deprecated';

export type DocSegment =
  | { kind: 'html'; html: string }
  | { kind: 'example'; id: string }
  | { kind: 'tokens'; prefix: string }
  | { kind: 'api'; entry: string };

export interface DocPage {
  section: string;
  sectionTitle: string;
  slug: string;
  path: string;
  title: string;
  description: string;
  status: DocStatus | null;
  group: string | null;
  order: number;
  package: string | null;
  /** Extra search terms, e.g. Vietnamese names: "nút" for Button. */
  keywords: string[];
  segments: DocSegment[];
  toc: { id: string; text: string }[];
}

export interface ExampleEntry {
  id: string;
  title: string;
  source: string;
  load: () => Promise<Type<unknown>>;
}

export interface ApiMember {
  kind: 'input' | 'model' | 'output';
  name: string;
  type: string;
  default: string;
  description: string;
}

export interface ApiClass {
  name: string;
  kind: 'component' | 'directive';
  selector: string;
  description: string;
  members: ApiMember[];
}

export interface ApiEntry {
  entry: string;
  importPath: string;
  classes: ApiClass[];
}

export interface TokenRecord {
  path: string;
  cssVar: string;
  tier: 'primitive' | 'semantic' | 'component';
  type: string;
  description: string | null;
  deprecated: string | boolean | null;
  axis: string | null;
  alias: string | null;
  values: Record<string, string>;
}

export interface TokenContrast {
  fg: string;
  bg: string;
  context: string;
  ratio: number;
  min: number;
  ok: boolean;
}

export interface TokenData {
  prefix: string;
  modes: Record<string, string[]>;
  defaultSelection: Record<string, string>;
  brands: string[];
  contexts: { label: string; brand: string | null; axis: string | null; mode: string | null }[];
  contrast: TokenContrast[];
  tokens: TokenRecord[];
}

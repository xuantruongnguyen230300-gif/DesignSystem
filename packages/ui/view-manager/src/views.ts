import { Signal, WritableSignal, computed, signal, untracked } from '@angular/core';
import { NxtFilterState } from '@nxt/ui/filter';
import type { NxtColumnsState, NxtColumnsValue, NxtSortState } from '@nxt/ui/table';

/**
 * Everything a saved view restores on a list page. One shape for filters, table personalisation and the URL.
 * Not in it (session state): the current page, the selection, the open row, the tab.
 */
export interface NxtViewState<F = Record<string, unknown>> {
  /** Search box text. */
  query: string;
  /** Applied filter values (`NxtFilterState.applied()`). */
  filters: F;
  sort: NxtSortState;
  /** Column order and hidden columns (`NxtColumnsState.value()`), when the table has column settings. */
  columns?: NxtColumnsValue;
  /** Rows per page. */
  pageSize?: number;
}

export interface NxtSavedView<F = Record<string, unknown>> {
  id: string;
  name: string;
  state: NxtViewState<F>;
  /** Shipped with the product ("Tiêu chuẩn"): cannot be overwritten, renamed or deleted. */
  standard?: boolean;
}

/** What a store keeps: the views the user created, and which view opens by default. */
export interface NxtViewData<F = Record<string, unknown>> {
  views: NxtSavedView<F>[];
  defaultId?: string | null;
}

/** Where views live (server, localStorage…). The product provides it; sync or async. */
export interface NxtViewStore<F = Record<string, unknown>> {
  load(): NxtViewData<F> | null | undefined | Promise<NxtViewData<F> | null | undefined>;
  save(data: NxtViewData<F>): void | Promise<void>;
}

/** In-memory store: examples, tests, or a page that keeps views for the session only. */
export class NxtMemoryViewStore<F = Record<string, unknown>> implements NxtViewStore<F> {
  constructor(private data: NxtViewData<F> | null = null) {}

  load(): NxtViewData<F> | null {
    return this.data ? structuredClone(this.data) : null;
  }

  save(data: NxtViewData<F>) {
    this.data = structuredClone(data);
  }
}

export interface NxtViewsOptions<F = Record<string, unknown>> {
  /** Reads the state on screen (signals: tracked, so `modified` updates live). */
  current: () => NxtViewState<F>;
  /** Puts a view's state on screen (search, filters, sort, columns, rows per page; back to page 1). */
  apply: (state: NxtViewState<F>) => void;
  /** Where the user's views and the default are kept. Without it, views last for the session. */
  store?: NxtViewStore<F>;
  /** Views shipped with the product. Default: one "Tiêu chuẩn" view = `current()` when created. */
  standard?: NxtSavedView<F>[];
  /** Name of the automatic standard view. */
  standardName?: string;
}

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi');

function sameValue(a: unknown, b: unknown, asSet: boolean): boolean {
  if (a === b) return true;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    if (!asSet) return a.every((x, i) => sameValue(x, b[i], asSet));
    return a.every((x) => b.some((y) => sameValue(x, y, asSet)));
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a as object);
    const kb = Object.keys(b as object);
    return ka.length === kb.length && ka.every((k) => sameValue((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], asSet));
  }
  return false;
}

/** Column widths the user set: none and an empty record are the same layout. */
function sameWidths(a?: Readonly<Record<string, number>>, b?: Readonly<Record<string, number>>): boolean {
  const x = a ?? {};
  const y = b ?? {};
  const keys = Object.keys(x);
  return keys.length === Object.keys(y).length && keys.every((k) => x[k] === y[k]);
}

/**
 * Same view state? Filter arrays compare as sets (checkbox order does not count as a change); column order
 * compares in order; `columns` and `pageSize` only when both sides have them; the query ignores outer spaces.
 */
export function nxtViewEqual<F>(a: NxtViewState<F>, b: NxtViewState<F>): boolean {
  const sortOf = (s: NxtSortState) => (s.direction ? `${s.active}:${s.direction}` : '');
  return (
    a.query.trim() === b.query.trim() &&
    sortOf(a.sort) === sortOf(b.sort) &&
    sameValue(a.filters, b.filters, true) &&
    (!a.columns || !b.columns || (sameValue(a.columns.order, b.columns.order, false) && sameValue(a.columns.hidden, b.columns.hidden, true) && sameWidths(a.columns.widths, b.columns.widths))) &&
    (a.pageSize === undefined || b.pageSize === undefined || a.pageSize === b.pageSize)
  );
}

let nextId = 0;
const newId = () => `view-${Date.now().toString(36)}-${(nextId++).toString(36)}`;

/**
 * Saved views of one list (plain signals; `nxt-view-manager` is its UI). The standard view(s) come first and
 * are locked; the user's views follow in creation order; one view is the default when the page opens.
 *
 *   readonly views = new NxtViews({ ...nxtViewTargets({ query: this.query, filters: this.filters, sort: this.sort, columns: this.columns, page: this.page }), store });
 */
export class NxtViews<F = Record<string, unknown>> {
  private readonly standardViews: NxtSavedView<F>[];
  private readonly userViews = signal<NxtSavedView<F>[]>([]);
  private readonly selectedIdValue: WritableSignal<string>;
  private readonly defaultIdValue: WritableSignal<string>;

  /** Standard views first, then the user's. */
  readonly views: Signal<NxtSavedView<F>[]>;
  readonly selectedId: Signal<string>;
  readonly selected: Signal<NxtSavedView<F>>;
  /** The view that opens by default (exactly one). */
  readonly defaultId: Signal<string>;
  /** What is on screen differs from the selected view as saved. */
  readonly modified: Signal<boolean>;
  /** Loaded from the store (and the default view applied when it is not the first standard one). */
  readonly ready: Promise<void>;

  constructor(private readonly options: NxtViewsOptions<F>) {
    const standard = options.standard?.length
      ? options.standard
      : [{ id: 'standard', name: options.standardName ?? 'Tiêu chuẩn', state: untracked(() => options.current()) }];
    this.standardViews = standard.map((v) => ({ ...v, standard: true }));
    this.selectedIdValue = signal(this.standardViews[0].id);
    this.defaultIdValue = signal(this.standardViews[0].id);
    this.views = computed(() => [...this.standardViews, ...this.userViews()]);
    this.selectedId = this.selectedIdValue.asReadonly();
    this.defaultId = this.defaultIdValue.asReadonly();
    this.selected = computed(() => this.views().find((v) => v.id === this.selectedIdValue()) ?? this.standardViews[0]);
    this.modified = computed(() => !nxtViewEqual(options.current(), this.selected().state));
    this.ready = this.load();
  }

  /** Apply a view now. */
  select(id: string) {
    const view = this.views().find((v) => v.id === id);
    if (!view) return;
    this.selectedIdValue.set(id);
    this.options.apply(structuredClone(view.state));
  }

  /** Overwrite the selected view with what is on screen. Standard views cannot be overwritten. */
  async save(): Promise<void> {
    const view = this.selected();
    if (view.standard) throw new Error('A standard view cannot be overwritten; use saveAs().');
    const state = structuredClone(untracked(() => this.options.current()));
    this.userViews.update((list) => list.map((v) => (v.id === view.id ? { ...v, state } : v)));
    await this.persist();
  }

  /** New view from what is on screen; it becomes the selected one (and the default if asked). */
  async saveAs(name: string, options: { makeDefault?: boolean } = {}): Promise<NxtSavedView<F>> {
    const view: NxtSavedView<F> = { id: newId(), name: name.trim().replace(/\s+/g, ' '), state: structuredClone(untracked(() => this.options.current())) };
    this.userViews.update((list) => [...list, view]);
    this.selectedIdValue.set(view.id);
    if (options.makeDefault) this.defaultIdValue.set(view.id);
    await this.persist();
    return view;
  }

  /**
   * "Quản lý" in one go: rename (`names` by id; standard views keep their name), delete (`removed`), choose the
   * default. Deleting the selected view switches to the default (or the first standard view) and applies it.
   */
  async manage(changes: { names?: Record<string, string>; removed?: string[]; defaultId?: string }): Promise<void> {
    const removed = new Set(changes.removed ?? []);
    const names = changes.names ?? {};
    this.userViews.update((list) =>
      list.filter((v) => !removed.has(v.id)).map((v) => (names[v.id]?.trim() ? { ...v, name: names[v.id].trim().replace(/\s+/g, ' ') } : v)),
    );
    const exists = (id: string | undefined) => !!id && this.views().some((v) => v.id === id);
    const nextDefault = exists(changes.defaultId) ? changes.defaultId! : exists(this.defaultIdValue()) ? this.defaultIdValue() : this.standardViews[0].id;
    this.defaultIdValue.set(nextDefault);
    if (!exists(this.selectedIdValue())) this.select(nextDefault);
    await this.persist();
  }

  /** A view already has this name (case and extra spaces ignored). */
  nameTaken(name: string, exceptId?: string): boolean {
    const n = normalizeName(name);
    return this.views().some((v) => v.id !== exceptId && normalizeName(v.name) === n);
  }

  private async load() {
    const data = await this.options.store?.load();
    if (!data) return;
    const standardIds = new Set(this.standardViews.map((v) => v.id));
    this.userViews.set((data.views ?? []).filter((v) => !standardIds.has(v.id)).map((v) => ({ ...v, standard: false })));
    if (data.defaultId && this.views().some((v) => v.id === data.defaultId)) {
      this.defaultIdValue.set(data.defaultId);
      if (data.defaultId !== this.selectedIdValue()) this.select(data.defaultId);
    }
  }

  private async persist() {
    await this.options.store?.save({ views: this.userViews().map(({ standard: _, ...v }) => v), defaultId: this.defaultIdValue() });
  }
}

/** The pieces of a list page a view restores. */
export interface NxtViewTargets<F extends object> {
  query?: WritableSignal<string>;
  filters?: NxtFilterState<F>;
  sort?: WritableSignal<NxtSortState>;
  columns?: NxtColumnsState;
  pageSize?: WritableSignal<number>;
  /** Set back to 1 when a view is applied. */
  page?: WritableSignal<number>;
}

/** `current` + `apply` for `NxtViews`, wired to the usual list page signals and state classes. */
export function nxtViewTargets<F extends object>(targets: NxtViewTargets<F>): Pick<NxtViewsOptions<F>, 'current' | 'apply'> {
  const { query, filters, sort, columns, pageSize, page } = targets;
  return {
    current: () => ({
      query: query?.() ?? '',
      filters: (filters?.applied() ?? {}) as F,
      sort: sort?.() ?? { active: '', direction: '' },
      ...(columns ? { columns: columns.value() } : {}),
      ...(pageSize ? { pageSize: pageSize() } : {}),
    }),
    apply: (state) => {
      query?.set(state.query ?? '');
      if (filters) {
        // An older view may miss criteria added since: they take their "no filter" value.
        const values = { ...filters.defaults, ...state.filters };
        filters.applied.set(values);
        filters.draft.set(values);
      }
      if (sort) sort.set(state.sort ?? { active: '', direction: '' });
      columns?.set(state.columns ?? null);
      if (pageSize && state.pageSize) pageSize.set(state.pageSize);
      page?.set(1);
    },
  };
}

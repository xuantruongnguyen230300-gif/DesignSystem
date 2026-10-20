import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

/** Spacing step — maps to semantic.space.gap.* (density-aware). */
export type NxtGap = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type NxtStackAlign = 'start' | 'center' | 'end' | 'stretch';
export type NxtInlineAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch';
export type NxtInlineJustify = 'start' | 'center' | 'end' | 'between';
export type NxtGridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'auto';
export type NxtGridMinItem = 'sm' | 'md' | 'lg';
export type NxtSpanValue = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';
/** Responsive span: keys are breakpoints of the grid's *own* width (container query), not the viewport. */
export interface NxtResponsiveSpan {
  base?: NxtSpanValue;
  sm?: NxtSpanValue;
  md?: NxtSpanValue;
  lg?: NxtSpanValue;
  xl?: NxtSpanValue;
}

/** Vertical flow with consistent, density-aware spacing. Replaces ad-hoc margins between siblings. */
@Component({
  selector: 'nxt-stack',
  template: '<ng-content />',
  styleUrl: './layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-stack',
    '[attr.data-gap]': 'gap()',
    '[attr.data-align]': 'align()',
  },
})
export class NxtStack {
  /** Space between children. */
  readonly gap = input<NxtGap>('md');
  /** Cross-axis (horizontal) alignment of children. */
  readonly align = input<NxtStackAlign>('stretch');
}

/**
 * Takes the free height of its flex-column parent (the app-shell content area, an `nxt-stack`, another
 * `nxtFill`, an `nxt-card fill`) and lays out its own children in a column. Chain it down to the one
 * region that should scroll — a table, a list — so the page fits the screen and only that region scrolls.
 */
@Directive({
  selector: '[nxtFill]',
  host: { class: 'nxt-fill' },
})
export class NxtFill {}

/** Horizontal row that wraps: toolbars, tag lists, button groups. */
@Component({
  selector: 'nxt-inline',
  template: '<ng-content />',
  styleUrl: './layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-inline',
    '[attr.data-gap]': 'gap()',
    '[attr.data-align]': 'align()',
    '[attr.data-justify]': 'justify()',
    '[attr.data-nowrap]': 'wrap() ? null : ""',
  },
})
export class NxtInline {
  /** Space between children (both axes when wrapping). */
  readonly gap = input<NxtGap>('sm');
  /** Vertical alignment of children. */
  readonly align = input<NxtInlineAlign>('center');
  /** Horizontal distribution; `between` pushes the first and last child to the edges. */
  readonly justify = input<NxtInlineJustify>('start');
  /** Wrap to the next line when space runs out. */
  readonly wrap = input(true, { transform: booleanAttribute });
}

/**
 * 12-column grid that responds to its **own width** (container query), so it lays out correctly
 * inside drawers, split panes and cards — not only at page level.
 */
@Component({
  selector: 'nxt-grid',
  template: '<div class="nxt-grid__track"><ng-content /></div>',
  styleUrl: './layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-grid',
    '[attr.data-columns]': 'columns()',
    '[attr.data-min-item]': 'columns() === "auto" ? minItem() : null',
    '[attr.data-gap]': 'gap()',
    '[style.--_columns]': 'columns() === "auto" ? null : columns()',
  },
})
export class NxtGrid {
  /** Number of columns, or `auto` to fit as many `minItem`-wide columns as the width allows. */
  readonly columns = input<NxtGridColumns>(12);
  /** Minimum item width when `columns="auto"`. */
  readonly minItem = input<NxtGridMinItem>('md');
  /** `gutter` = 16/24/32px by grid width (page layout); other steps follow the density scale. */
  readonly gap = input<NxtGap | 'gutter'>('gutter');
}

/** How many grid columns an item spans — a number, `full`, or a responsive object. */
@Directive({
  selector: '[nxtSpan]',
  host: {
    '[attr.data-span]': 'spans().base',
    '[attr.data-span-sm]': 'spans().sm',
    '[attr.data-span-md]': 'spans().md',
    '[attr.data-span-lg]': 'spans().lg',
    '[attr.data-span-xl]': 'spans().xl',
  },
})
export class NxtSpan {
  readonly nxtSpan = input.required<NxtSpanValue | NxtResponsiveSpan>();
  protected readonly spans = computed(() => {
    const value = this.nxtSpan();
    const s: NxtResponsiveSpan = typeof value === 'object' ? value : { base: value };
    return { base: s.base ?? null, sm: s.sm ?? null, md: s.md ?? null, lg: s.lg ?? null, xl: s.xl ?? null };
  });
}

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Signal,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
  untracked,
} from '@angular/core';

/** Keep in sync with packages/ui/skeleton/SPEC.md → "Variants". */
export type NxtSkeletonVariant = 'text' | 'heading' | 'block' | 'control' | 'circle';
/** Width steps relative to the container: 100% / 75% / 50% / 25%. */
export type NxtSkeletonWidth = 'full' | 'long' | 'medium' | 'short';

/**
 * Loading placeholder in the shape of the content that is coming (lines of text, heading, block, input, avatar).
 * Always `aria-hidden`: the container being loaded carries `aria-busy` and a live region says "Đang tải …".
 */
@Component({
  selector: 'nxt-skeleton',
  template: `
    @if (variant() === 'text') {
      @for (line of lineList(); track line) {
        <span class="nxt-skeleton__line"></span>
      }
    }
  `,
  styleUrl: './skeleton.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'nxt-skeleton',
    'aria-hidden': 'true',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': "variant() === 'circle' ? size() : null",
    '[attr.data-width]': "variant() === 'circle' ? null : width()",
    '[attr.data-lines]': "variant() === 'text' && lineList().length > 1 ? 'multi' : null",
  },
})
export class NxtSkeleton {
  /** Shape of the content being loaded. */
  readonly variant = input<NxtSkeletonVariant>('text');
  /** Number of text lines (`text`); the last one is shorter when there are several. */
  readonly lines = input(1, { transform: numberAttribute });
  /** Avatar size for `circle`, same steps as `nxt-avatar`. */
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  /** Width step relative to the container (not used by `circle`). */
  readonly width = input<NxtSkeletonWidth>('full');

  protected readonly lineList = computed(() => {
    const n = Math.max(1, Math.floor(Number(this.lines()) || 1));
    return Array.from({ length: n }, (_, i) => i);
  });
}

export interface NxtDeferredLoadingOptions {
  /** Wait this long (ms) before showing anything; loads that finish sooner show no indicator. Default 1000. */
  delay?: number;
  /** Once shown, keep it at least this long (ms) so it does not flash. Default 500. */
  minDuration?: number;
}

/**
 * Timing rule for loading indicators (SAP Fiori Timing / busy handling): `true` only when `loading` lasts longer
 * than `delay`; once shown it stays at least `minDuration`. Call in an injection context (component field or
 * constructor); timers are cleared when the component is destroyed.
 *
 *   readonly showSkeleton = nxtDeferredLoading(this.loading);
 */
export function nxtDeferredLoading(loading: Signal<boolean>, options: NxtDeferredLoadingOptions = {}): Signal<boolean> {
  const delay = options.delay ?? 1000;
  const minDuration = options.minDuration ?? 500;
  const shown = signal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  let shownAt = 0;
  const clear = () => {
    if (timer !== undefined) clearTimeout(timer);
    timer = undefined;
  };
  inject(DestroyRef).onDestroy(clear);

  effect(() => {
    const isLoading = loading();
    untracked(() => {
      clear();
      if (isLoading) {
        if (shown()) return;
        timer = setTimeout(() => {
          timer = undefined;
          shownAt = Date.now();
          shown.set(true);
        }, delay);
        return;
      }
      if (!shown()) return;
      const left = minDuration - (Date.now() - shownAt);
      if (left <= 0) {
        shown.set(false);
        return;
      }
      timer = setTimeout(() => {
        timer = undefined;
        shown.set(false);
      }, left);
    });
  });

  return shown.asReadonly();
}

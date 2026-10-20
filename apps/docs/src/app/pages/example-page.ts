import { NgComponentOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, Type, computed, effect, input, signal } from '@angular/core';
import { EXAMPLES } from '../../generated/examples';
import type { ExampleEntry } from '../core/types';

/** Bare example for Playwright (a11y/visual) — theme comes from ?color=&density=&brand= on <html>. */
@Component({
  selector: 'docs-example-page',
  imports: [NgComponentOutlet],
  template: `
    <main class="docs-example-page" [class.docs-example-page--screen]="id().startsWith('template-')" data-example-root [attr.data-example-id]="id()">
      <h1 class="nxt-visually-hidden">Ví dụ: {{ entry()?.title ?? id() }}</h1>
      @if (component(); as c) {
        <ng-container *ngComponentOutlet="c" />
      } @else if (!entry()) {
        <p role="alert">Không có ví dụ “{{ id() }}”.</p>
      }
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[attr.data-ready]': 'component() ? "" : null' },
})
export class ExamplePage {
  readonly id = input.required<string>();
  protected readonly entry = computed<ExampleEntry | undefined>(() => EXAMPLES[this.id()]);
  protected readonly component = signal<Type<unknown> | null>(null);

  constructor() {
    effect(() => {
      void this.entry()?.load().then((c) => this.component.set(c));
    });
  }
}

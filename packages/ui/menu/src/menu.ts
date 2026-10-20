import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { CdkMenu, CdkMenuGroup, CdkMenuItem, CdkMenuItemRadio, CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, Directive, ViewEncapsulation, input } from '@angular/core';

/**
 * Menus on top of Angular CDK Menu (WAI-ARIA menu pattern: arrow keys, type-ahead, Escape returns focus).
 *
 *   <button nxtButton [nxtMenuTriggerFor]="actions">Thao tác</button>
 *   <ng-template #actions>
 *     <div nxtMenu>
 *       <button nxtMenuItem>Sửa</button>
 *       <button nxtMenuItem tone="danger">Xoá</button>
 *     </div>
 *   </ng-template>
 */
@Directive({
  selector: '[nxtMenuTriggerFor]',
  hostDirectives: [{ directive: CdkMenuTrigger, inputs: ['cdkMenuTriggerFor: nxtMenuTriggerFor', 'cdkMenuPosition: nxtMenuPosition'] }],
})
export class NxtMenuTrigger {}

@Component({
  selector: '[nxtMenu]',
  template: '<ng-content />',
  styleUrl: './menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [CdkMenu],
  // CdkMenu does not provide its own selection dispatcher (only CdkMenuGroup does), so without this every
  // radio item in the app would share one root dispatcher and uncheck items in other menus.
  providers: [{ provide: UniqueSelectionDispatcher, useClass: UniqueSelectionDispatcher }],
  host: { class: 'nxt-menu' },
})
export class NxtMenu {}

/**
 * Groups radio items into one single-choice set (role="group"). Use one group per setting:
 *
 *   <div nxtMenuLabel>Mật độ</div>
 *   <div nxtMenuGroup label="Mật độ">…nxtMenuItemRadio…</div>
 */
@Directive({
  selector: '[nxtMenuGroup]',
  hostDirectives: [CdkMenuGroup],
  host: { class: 'nxt-menu__group', '[attr.aria-label]': 'label() || null' },
})
export class NxtMenuGroup {
  /** Accessible name of the group, usually the same text as the visible `nxtMenuLabel` above it. */
  readonly label = input<string>();
}

@Directive({
  selector: '[nxtMenuItem]',
  hostDirectives: [{ directive: CdkMenuItem, inputs: ['cdkMenuItemDisabled: disabled'], outputs: ['cdkMenuItemTriggered: triggered'] }],
  host: { class: 'nxt-menu__item', '[attr.data-tone]': 'tone()' },
})
export class NxtMenuItem {
  /** `danger` for destructive actions (kept at the end of the menu). */
  readonly tone = input<'default' | 'danger'>('default');
}

/** Single-choice item (density, sort order…). */
@Directive({
  selector: '[nxtMenuItemRadio]',
  hostDirectives: [
    { directive: CdkMenuItemRadio, inputs: ['cdkMenuItemChecked: checked', 'cdkMenuItemDisabled: disabled'], outputs: ['cdkMenuItemTriggered: triggered'] },
  ],
  host: { class: 'nxt-menu__item nxt-menu__item--radio' },
})
export class NxtMenuItemRadio {}

/** Non-interactive group caption inside a menu. */
@Directive({
  selector: '[nxtMenuLabel]',
  host: { class: 'nxt-menu__label', role: 'presentation' },
})
export class NxtMenuLabel {}

@Directive({
  selector: '[nxtMenuSeparator]',
  host: { class: 'nxt-menu__separator', role: 'separator' },
})
export class NxtMenuSeparator {}

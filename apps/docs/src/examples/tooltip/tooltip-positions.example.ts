import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtInline } from '@nxt/ui/layout';
import { NxtTooltip } from '@nxt/ui/tooltip';

/** Bốn vị trí; tooltip tự lật sang phía đối diện khi không đủ chỗ */
@Component({
  selector: 'example-tooltip-positions',
  imports: [NxtButton, NxtInline, NxtTooltip],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nxt-inline gap="md" justify="center">
      <button nxtButton nxtTooltip="Hiện phía trên (mặc định)" nxtTooltipPosition="top">Trên (top)</button>
      <button nxtButton nxtTooltip="Hiện phía dưới" nxtTooltipPosition="bottom">Dưới (bottom)</button>
      <button nxtButton nxtTooltip="Hiện ở phía đầu dòng, bên trái khi đọc trái sang phải" nxtTooltipPosition="start">Đầu dòng (start)</button>
      <button nxtButton nxtTooltip="Hiện ở phía cuối dòng, bên phải khi đọc trái sang phải" nxtTooltipPosition="end">Cuối dòng (end)</button>
      <button nxtButton nxtTooltip="Hiện ngay, không chờ" [nxtTooltipDelay]="0">Hiện ngay (delay 0)</button>
    </nxt-inline>
  `,
})
export class TooltipPositionsExample {}

import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { NxtAppShell, NxtSidenav, NxtTopbar } from '@nxt/ui/app-shell';
import { NxtButton } from '@nxt/ui/button';
import { NxtIcon } from '@nxt/ui/icon';
import { NxtMenu, NxtMenuGroup, NxtMenuItemRadio, NxtMenuLabel, NxtMenuSeparator, NxtMenuTrigger } from '@nxt/ui/menu';
import { NxtSegmented, NxtSegmentedOption } from '@nxt/ui/segmented';
import { NxtTooltip } from '@nxt/ui/tooltip';
import { BRANDS } from '../generated/brands';
import { STATS } from '../generated/stats';
import { NAV } from './core/nav';
import { ColorPref, DensityPref, ThemeService } from './core/theme';
import { DocsSearch } from './shell/docs-search';

const NAV_KEY = 'nxt-docs-nav-collapsed';

@Component({
  selector: 'docs-root',
  imports: [
    RouterOutlet,
    RouterLink,
    NxtAppShell,
    NxtSidenav,
    NxtTopbar,
    NxtButton,
    NxtIcon,
    NxtSegmented,
    NxtTooltip,
    NxtMenu,
    NxtMenuGroup,
    NxtMenuItemRadio,
    NxtMenuLabel,
    NxtMenuSeparator,
    NxtMenuTrigger,
    DocsSearch,
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  protected readonly nav = NAV;
  protected readonly version = STATS.version;
  protected readonly brands = BRANDS;
  protected readonly bare = signal(false);
  protected readonly collapsed = signal(readCollapsed());

  protected readonly colorOptions: NxtSegmentedOption<ColorPref>[] = [
    { value: 'light', label: 'Giao diện sáng', icon: 'sun' },
    { value: 'dark', label: 'Giao diện tối', icon: 'moon' },
    { value: 'auto', label: 'Theo hệ thống', icon: 'device-desktop' },
  ];
  protected readonly densityOptions: { value: DensityPref; label: string }[] = [
    { value: 'compact', label: 'Gọn' },
    { value: 'comfortable', label: 'Vừa (mặc định)' },
    { value: 'spacious', label: 'Rộng' },
  ];

  constructor() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) this.bare.set(e.urlAfterRedirects.startsWith('/examples/'));
    });
    effect(() => {
      try {
        localStorage.setItem(NAV_KEY, String(this.collapsed()));
      } catch {
        /* storage unavailable — not remembered */
      }
    });
  }
}

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(NAV_KEY) === 'true';
  } catch {
    return false;
  }
}

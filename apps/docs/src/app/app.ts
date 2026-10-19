import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NxtButton } from '@nxt/ui/button';
import { ColorPref, DensityPref, ThemeService } from './core/theme';
import { NAV } from './core/nav';
import { BRANDS } from '../generated/brands';
import { ChoiceGroup, Choice } from './shell/choice-group';
import { DocsIcon } from './shell/icons';
import { SearchDialog } from './shell/search-dialog';
import { StatusBadge } from './shell/status-badge';

@Component({
  selector: 'docs-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NxtButton, ChoiceGroup, DocsIcon, StatusBadge],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown)': 'onGlobalKey($event)',
  },
})
export class App {
  protected readonly theme = inject(ThemeService);
  private readonly dialog = inject(Dialog);
  private readonly router = inject(Router);

  protected readonly nav = NAV;
  protected readonly navOpen = signal(false);
  protected readonly bare = signal(false);
  protected readonly brands = BRANDS;

  protected readonly colorOptions: Choice<ColorPref>[] = [
    { value: 'light', label: 'Sáng' },
    { value: 'dark', label: 'Tối' },
    { value: 'auto', label: 'Theo hệ thống' },
  ];
  protected readonly densityOptions: Choice<DensityPref>[] = [
    { value: 'compact', label: 'Gọn' },
    { value: 'comfortable', label: 'Vừa' },
    { value: 'spacious', label: 'Rộng' },
  ];

  constructor() {
    this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        this.navOpen.set(false);
        this.bare.set(e.urlAfterRedirects.startsWith('/examples/'));
      }
    });
  }

  protected openSearch() {
    if (this.dialog.openDialogs.length) return;
    this.dialog.open(SearchDialog, {
      ariaLabel: 'Tìm kiếm tài liệu',
      panelClass: 'docs-search-panel',
      backdropClass: 'docs-backdrop',
      autoFocus: '#docs-search-input',
      restoreFocus: true,
    });
  }

  protected onGlobalKey(event: KeyboardEvent) {
    if (event.key === 'Escape' && this.navOpen()) {
      this.navOpen.set(false);
      document.getElementById('docs-menu-toggle')?.focus();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.openSearch();
    }
  }

  protected skipToMain(event: Event) {
    event.preventDefault();
    const main = document.getElementById('main');
    main?.focus();
    main?.scrollIntoView();
  }

  protected setBrand(event: Event) {
    this.theme.brand.set((event.target as HTMLSelectElement).value);
  }
}

import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { NxtButton } from '@nxt/ui/button';
import { NxtCheckbox } from '@nxt/ui/checkbox';
import { NxtFormField, NxtInput } from '@nxt/ui/form-field';
import { NxtIcon, NxtIconName } from '@nxt/ui/icon';

/** Đăng nhập — form rõ ràng, lỗi nói cách sửa, hiện/ẩn mật khẩu, đăng nhập bằng tài khoản Microsoft */
@Component({
  selector: 'example-template-login',
  imports: [NxtButton, NxtCheckbox, NxtFormField, NxtInput, NxtIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="login">
      <section class="brand" aria-labelledby="login-brand">
        <div class="brand__logo"><span class="brand__mark" aria-hidden="true"><nxt-icon name="users-group" /></span>NXT HRM</div>
        <div class="brand__copy">
          <p id="login-brand" class="brand__headline">Quản trị nhân sự cho doanh nghiệp Việt</p>
          <ul class="brand__points" role="list">
            @for (p of points; track p.text) {
              <li><nxt-icon [name]="p.icon" />{{ p.text }}</li>
            }
          </ul>
        </div>
        <p class="brand__foot">© 2026 Công ty CP NXT</p>
      </section>

      <section class="panel" aria-labelledby="login-title">
        <div class="panel__inner">
          <div class="panel__head">
            <h1 id="login-title" class="panel__title">Đăng nhập</h1>
            <p class="panel__text">Dùng tài khoản công ty để tiếp tục.</p>
          </div>

          @if (failed()) {
            <div class="alert" role="alert">
              <nxt-icon name="alert-circle" />
              <span>Email hoặc mật khẩu chưa đúng. Kiểm tra lại bàn phím (Caps Lock), hoặc chọn “Quên mật khẩu?”.</span>
            </div>
          }

          <form class="form" novalidate (submit)="submit($event)">
            <nxt-form-field label="Email công ty" [error]="emailError()">
              <nxt-icon nxtPrefix name="mail" />
              <input nxtInput type="email" autocomplete="username" placeholder="ten@congty.vn" [value]="email()" (input)="email.set(value($event))" />
            </nxt-form-field>
            <nxt-form-field label="Mật khẩu" [error]="passwordError()">
              <nxt-icon nxtPrefix name="lock" />
              <input nxtInput autocomplete="current-password" [type]="show() ? 'text' : 'password'" [value]="password()" (input)="password.set(value($event))" />
              <button
                nxtSuffix
                nxtIconButton
                variant="ghost"
                size="sm"
                type="button"
                [attr.aria-label]="show() ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                [attr.aria-pressed]="show()"
                (click)="show.set(!show())"
              >
                <nxt-icon [name]="show() ? 'eye-off' : 'eye'" />
              </button>
            </nxt-form-field>
            <div class="form__row">
              <nxt-checkbox label="Ghi nhớ đăng nhập trên máy này" />
              <a href="#quen-mat-khau">Quên mật khẩu?</a>
            </div>
            <button nxtButton variant="primary" size="lg" type="submit" class="form__submit" [loading]="loading()">Đăng nhập</button>
          </form>

          <div class="divider"><span>hoặc</span></div>
          <button nxtButton size="lg" type="button" class="form__submit"><nxt-icon name="building" />Đăng nhập bằng tài khoản Microsoft</button>
          <p class="panel__help">Cần hỗ trợ? Liên hệ phòng IT · <a href="tel:02873000000">028 7300 0000</a></p>
        </div>
      </section>
    </div>
  `,
  styles: `
    /* The host is the query container: @container rules only apply to its descendants. */
    :host {
      display: block;
      block-size: 100%;
      container-type: inline-size;
    }
    .login {
      display: grid;
      grid-template-columns: minmax(0, 1fr);
      min-block-size: 100%;
      background: var(--nxt-color-bg-surface);
    }
    @container (min-width: 900px) {
      .login {
        grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
      }
    }
    .brand {
      display: none;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--nxt-space-section-md);
      padding: var(--nxt-space-section-lg);
      background: var(--nxt-color-bg-primary);
      color: var(--nxt-color-text-on-primary);
    }
    @container (min-width: 900px) {
      .brand {
        display: flex;
      }
    }
    .brand__logo {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
      font: var(--nxt-typography-heading-sm);
    }
    .brand__mark {
      display: inline-grid;
      place-items: center;
      inline-size: var(--nxt-size-control-lg);
      block-size: var(--nxt-size-control-lg);
      border: var(--nxt-border-width-default) solid currentColor;
      border-radius: var(--nxt-radius-container);
    }
    .brand__copy {
      display: grid;
      gap: var(--nxt-space-section-sm);
    }
    .brand__headline {
      max-inline-size: 18ch;
      font: var(--nxt-typography-display);
    }
    .brand__points {
      display: grid;
      gap: var(--nxt-space-gap-md);
      margin: 0;
      padding: 0;
      list-style: none;
      font: var(--nxt-typography-body-lg);
    }
    .brand__points li {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-sm);
    }
    .brand__foot {
      font: var(--nxt-typography-caption);
    }
    .panel {
      display: grid;
      place-items: center;
      padding: var(--nxt-space-section-md) var(--nxt-space-inset-lg);
    }
    .panel__inner {
      display: grid;
      gap: var(--nxt-space-gap-lg);
      inline-size: min(100%, var(--nxt-size-400));
    }
    .panel__head {
      display: grid;
      gap: var(--nxt-space-gap-xs);
    }
    .panel__title {
      color: var(--nxt-color-text-strong);
      font: var(--nxt-typography-heading-lg);
    }
    .panel__text,
    .panel__help {
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-body-md);
    }
    .alert {
      display: flex;
      align-items: flex-start;
      gap: var(--nxt-space-gap-sm);
      padding: var(--nxt-space-inset-md);
      border-radius: var(--nxt-radius-container);
      background: var(--nxt-color-bg-danger-subtle);
      color: var(--nxt-color-text-danger);
      font: var(--nxt-typography-body-sm);
    }
    .form {
      display: grid;
      gap: var(--nxt-space-gap-md);
    }
    .form__row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: var(--nxt-space-gap-sm);
      font: var(--nxt-typography-body-md);
    }
    .form__submit {
      inline-size: 100%;
    }
    .divider {
      display: flex;
      align-items: center;
      gap: var(--nxt-space-gap-md);
      color: var(--nxt-color-text-subtle);
      font: var(--nxt-typography-caption);
    }
    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      border-block-start: var(--nxt-border-width-default) solid var(--nxt-color-border-default);
    }
  `,
})
export class TemplateLoginExample {
  protected readonly points: { icon: NxtIconName; text: string }[] = [
    { icon: 'id-badge-2', text: 'Hồ sơ nhân viên số hoá, tra cứu tức thì' },
    { icon: 'clipboard-check', text: 'Duyệt đơn từ mọi nơi, không cần giấy tờ' },
    { icon: 'report-analytics', text: 'Báo cáo nhân sự cập nhật theo thời gian thực' },
  ];
  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly show = signal(false);
  protected readonly loading = signal(false);
  protected readonly failed = signal(false);
  protected readonly emailError = signal<string | null>(null);
  protected readonly passwordError = signal<string | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  protected value(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  protected submit(event: Event) {
    event.preventDefault();
    const email = this.email().trim();
    this.emailError.set(!email ? 'Nhập email công ty.' : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : 'Email chưa đúng định dạng, ví dụ ten@congty.vn.');
    this.passwordError.set(this.password() ? null : 'Nhập mật khẩu.');
    this.failed.set(false);
    if (this.emailError() || this.passwordError()) return;
    this.loading.set(true);
    // Demo: there is no server — show how a failed sign-in is communicated.
    this.timer = setTimeout(() => {
      this.loading.set(false);
      this.failed.set(true);
    }, 900);
  }
}

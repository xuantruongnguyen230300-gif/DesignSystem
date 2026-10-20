import { Injectable, signal } from '@angular/core';
import type { TokenData, TokenRecord } from './types';

/** Loads packages/tokens/dist/json/tokens.json (served at /data/tokens.json) once, on demand. */
@Injectable({ providedIn: 'root' })
export class TokensData {
  readonly data = signal<TokenData | null>(null);
  readonly error = signal<string | null>(null);
  private loading: Promise<void> | null = null;

  load(): Promise<void> {
    this.loading ??= fetch('data/tokens.json')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<TokenData>;
      })
      .then((d) => this.data.set(d))
      .catch((e: unknown) => this.error.set(`Không tải được dữ liệu token (${String(e)}). Chạy npm run tokens:build.`));
    return this.loading;
  }

  byPrefix(prefix: string): TokenRecord[] {
    return (this.data()?.tokens ?? []).filter((t) => t.path === prefix || t.path.startsWith(`${prefix}.`));
  }

  /** Resolved value in a context such as "core, color=dark, density=comfortable, motion=full". */
  value(token: TokenRecord, axis: string | null = null, mode: string | null = null): string {
    const data = this.data();
    if (!data) return '';
    const ctx = data.contexts.find((c) => c.brand === null && c.axis === axis && c.mode === mode) ?? data.contexts[0];
    return token.values[ctx.label] ?? '';
  }
}

/** Lowercase, strip Vietnamese diacritics: "Nguyễn Đức" → "nguyen duc". */
export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase();
}

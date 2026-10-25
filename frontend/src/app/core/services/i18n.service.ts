import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

export type Lang = 'ro' | 'en';

export const SUPPORTED_LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: 'ro', label: 'Română', flag: '🇷🇴' },
  { code: 'en', label: 'English', flag: '🇬🇧' }
];

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly translate = inject(TranslateService);
  private readonly storage = inject(StorageService);

  readonly current = signal<Lang>('ro');

  init(): void {
    this.translate.addLangs(SUPPORTED_LANGS.map((l) => l.code));
    this.translate.setDefaultLang('ro');
    this.use(this.detect());
  }

  use(lang: Lang): void {
    this.translate.use(lang);
    this.current.set(lang);
    this.storage.set(environment.storageKeys.lang, lang);
    document.documentElement.lang = lang;
  }

  toggle(): void {
    this.use(this.current() === 'ro' ? 'en' : 'ro');
  }

  instant(key: string, params?: Record<string, unknown>): string {
    return this.translate.instant(key, params) as string;
  }

  private detect(): Lang {
    const saved = this.storage.get(environment.storageKeys.lang);
    if (saved === 'ro' || saved === 'en') return saved;
    return navigator.language?.toLowerCase().startsWith('ro') ? 'ro' : 'en';
  }
}

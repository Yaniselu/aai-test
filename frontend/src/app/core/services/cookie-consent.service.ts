import { Injectable, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';

export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  decidedAt: string;
  version: number;
}

/** Versiunea politicii: incrementeaz-o când se schimbă categoriile, pentru re-consimțământ. */
export const CONSENT_VERSION = 1;

@Injectable({ providedIn: 'root' })
export class CookieConsentService {
  private readonly storage = inject(StorageService);
  private readonly _consent = signal<CookieConsent | null>(this.read());

  readonly consent = this._consent.asReadonly();
  readonly needsDecision = computed(() => this._consent() === null);
  readonly analyticsAllowed = computed(() => this._consent()?.analytics === true);
  readonly marketingAllowed = computed(() => this._consent()?.marketing === true);

  acceptAll(): void {
    this.save({ analytics: true, marketing: true });
  }

  rejectAll(): void {
    this.save({ analytics: false, marketing: false });
  }

  saveCustom(analytics: boolean, marketing: boolean): void {
    this.save({ analytics, marketing });
  }

  /** Cerință GDPR: consimțământul trebuie să fie la fel de ușor de retras ca de acordat. */
  reset(): void {
    this.storage.remove(environment.storageKeys.cookies);
    this._consent.set(null);
  }

  private save(partial: { analytics: boolean; marketing: boolean }): void {
    const consent: CookieConsent = {
      necessary: true,
      ...partial,
      decidedAt: new Date().toISOString(),
      version: CONSENT_VERSION
    };
    this.storage.setJson(environment.storageKeys.cookies, consent);
    this._consent.set(consent);
  }

  private read(): CookieConsent | null {
    const stored = this.storage.getJson<CookieConsent>(environment.storageKeys.cookies);
    if (!stored || stored.version !== CONSENT_VERSION) return null;
    return stored;
  }
}

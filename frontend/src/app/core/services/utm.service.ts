import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid'
] as const;

const STORAGE_KEY = 'aia.utm';

/**
 * Capturează parametrii UTM la prima vizită și îi atașează formularelor de
 * înscriere/contact, ca sursa lead-ului să nu se piardă între pagini.
 */
@Injectable({ providedIn: 'root' })
export class UtmService {
  private readonly storage = inject(StorageService);

  capture(): void {
    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) found[key] = value;
    }
    if (Object.keys(found).length === 0) return;

    found['landing_page'] = window.location.pathname;
    found['referrer'] = document.referrer || 'direct';
    found['captured_at'] = new Date().toISOString();
    this.storage.setJson(STORAGE_KEY, found);
  }

  get(): Record<string, string> {
    return this.storage.getJson<Record<string, string>>(STORAGE_KEY) ?? {};
  }

  clear(): void {
    this.storage.remove(STORAGE_KEY);
  }
}

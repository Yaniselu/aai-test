import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CookieConsentService } from '../../core/services/cookie-consent.service';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Banner GDPR.
 * Reguli respectate: refuzul este la fel de accesibil ca acceptul (buton egal,
 * nu link ascuns), nimic non-esential nu se incarca inainte de decizie, iar
 * consimtamantul poate fi retras oricand din footer.
 */
@Component({
  selector: 'aia-cookie-banner',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (consent.needsDecision()) {
      <div
        class="fixed inset-x-0 bottom-0 z-[140] p-3 sm:p-5"
        [style.backgroundColor]="'color-mix(in srgb, var(--aia-bg) 88%, transparent)'"
        [style.backdropFilter]="'blur(18px)'"
        [style.borderTop]="'1px solid var(--aia-border)'"
        style="animation: aia-cookie-in .5s cubic-bezier(.16,1,.3,1)"
        role="dialog"
        aria-modal="false"
        aria-labelledby="aia-cookie-title"
      >
        <div class="aia-container">
          <div class="flex flex-col gap-3 sm:gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div class="max-w-2xl">
              <h2 id="aia-cookie-title" class="font-display text-lg sm:text-xl">{{ 'cookies.title' | translate }}</h2>
              <p class="mt-1.5 text-xs leading-relaxed sm:mt-2 sm:text-sm" [style.color]="'var(--aia-text-muted)'">
                {{ 'cookiesBanner.text' | translate }}
                <a routerLink="/legal/cookies" class="ml-1 underline hover:text-[var(--aia-cyan)]">
                  {{ 'cookiesBanner.policy' | translate }}
                </a>
              </p>

              @if (showDetails()) {
                <div class="mt-5 space-y-3">
                  <label class="flex items-start gap-3 opacity-60">
                    <input type="checkbox" checked disabled class="mt-1 accent-[var(--aia-blood)]" />
                    <span>
                      <span class="block font-heading text-sm uppercase tracking-wide">{{ 'cookiesBanner.necessary' | translate }}</span>
                      <span class="text-sm" [style.color]="'var(--aia-text-muted)'">
                        {{ 'cookiesBanner.necessaryText' | translate }}
                      </span>
                    </span>
                  </label>

                  <label class="flex items-start gap-3">
                    <input
                      type="checkbox"
                      class="mt-1 accent-[var(--aia-blood)]"
                      [checked]="analytics()"
                      (change)="analytics.set($any($event.target).checked)"
                    />
                    <span>
                      <span class="block font-heading text-sm uppercase tracking-wide">{{ 'cookiesBanner.analytics' | translate }}</span>
                      <span class="text-sm" [style.color]="'var(--aia-text-muted)'">
                        {{ 'cookiesBanner.analyticsText' | translate }}
                      </span>
                    </span>
                  </label>

                  <label class="flex items-start gap-3">
                    <input
                      type="checkbox"
                      class="mt-1 accent-[var(--aia-blood)]"
                      [checked]="marketing()"
                      (change)="marketing.set($any($event.target).checked)"
                    />
                    <span>
                      <span class="block font-heading text-sm uppercase tracking-wide">{{ 'cookiesBanner.marketing' | translate }}</span>
                      <span class="text-sm" [style.color]="'var(--aia-text-muted)'">
                        {{ 'cookiesBanner.marketingText' | translate }}
                      </span>
                    </span>
                  </label>
                </div>
              }
            </div>

            <!-- Pe telefon cele trei actiuni stau pe un rand, ca bannerul sa nu acopere jumatate de ecran. -->
            <div class="cookie-actions grid shrink-0 grid-cols-3 gap-2 sm:flex sm:flex-row lg:flex-col xl:flex-row">
              <button type="button" class="aia-btn aia-btn-primary" (click)="consent.acceptAll()">
                {{ 'cookies.acceptAll' | translate }}
              </button>
              <button type="button" class="aia-btn aia-btn-ghost" (click)="consent.rejectAll()">
                {{ 'cookies.rejectAll' | translate }}
              </button>
              @if (showDetails()) {
                <button type="button" class="aia-btn aia-btn-ghost" (click)="saveChoices()">
                  {{ 'cookies.save' | translate }}
                </button>
              } @else {
                <button type="button" class="aia-btn aia-btn-ghost" (click)="showDetails.set(true)">
                  {{ 'cookies.customize' | translate }}
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      @media (max-width: 639px) {
        .cookie-actions .aia-btn {
          padding: 12px 6px;
          font-size: 10px;
          letter-spacing: 0.08em;
          --aia-cut: 9px;
        }
        .cookie-actions .aia-btn:hover { letter-spacing: 0.08em; }
      }
      @keyframes aia-cookie-in {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }
    `
  ]
})
export class CookieBannerComponent {
  readonly consent = inject(CookieConsentService);

  readonly showDetails = signal(false);
  readonly analytics = signal(false);
  readonly marketing = signal(false);

  saveChoices(): void {
    this.consent.saveCustom(this.analytics(), this.marketing());
  }
}

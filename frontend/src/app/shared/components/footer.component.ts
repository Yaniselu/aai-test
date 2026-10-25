import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ACADEMY } from '../../core/academy.data';
import { CookieConsentService } from '../../core/services/cookie-consent.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../icons/icon.component';
import { LogoComponent } from './logo.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'aia-footer',
  standalone: true,
  imports: [RouterLink, IconComponent, LogoComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="border-t pt-16" [style.borderColor]="'var(--aia-border)'">
      <div class="aia-container">
        <div class="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <!-- Brand -->
          <div>
            <aia-logo />
            <p class="mt-6 max-w-xs text-sm leading-relaxed" [style.color]="'var(--aia-text-muted)'">
              {{ 'footer.tagline' | translate: { city: academy.city } }}
            </p>

            <div class="mt-7 flex gap-2.5">
              @for (social of socials; track social.label) {
                <a
                  [href]="social.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="grid h-11 w-11 place-items-center rounded-full border transition-colors hover:border-[var(--aia-cyan)] hover:text-[var(--aia-cyan)]"
                  [style.borderColor]="'var(--aia-border)'"
                  [attr.aria-label]="social.label"
                >
                  <aia-icon [name]="social.icon" [size]="17" />
                </a>
              }
            </div>
          </div>

          <!-- Navigare -->
          <nav aria-label="Legaturi rapide">
            <h2 class="aia-eyebrow">{{ 'footer.academy' | translate }}</h2>
            <ul class="mt-6 space-y-3 text-sm">
              @for (link of academyLinks; track link.label) {
                <li>
                  <a
                    [routerLink]="link.route"
                    [fragment]="link.fragment"
                    class="transition-colors hover:text-[var(--aia-cyan)]"
                  >
                    {{ link.label }}
                  </a>
                </li>
              }
            </ul>
          </nav>

          <!-- Legal -->
          <nav aria-label="Informatii legale">
            <h2 class="aia-eyebrow">{{ 'footer.legal' | translate }}</h2>
            <ul class="mt-6 space-y-3 text-sm">
              <li><a routerLink="/legal/confidentialitate" class="transition-colors hover:text-[var(--aia-cyan)]">{{ 'footer.privacy' | translate }}</a></li>
              <li><a routerLink="/legal/termeni" class="transition-colors hover:text-[var(--aia-cyan)]">{{ 'footer.terms' | translate }}</a></li>
              <li><a routerLink="/legal/cookies" class="transition-colors hover:text-[var(--aia-cyan)]">{{ 'footer.cookiePolicy' | translate }}</a></li>
              <li>
                <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noopener noreferrer" class="transition-colors hover:text-[var(--aia-cyan)]">
                  ANPC &ndash; SAL
                </a>
              </li>
              <li>
                <!-- GDPR: retragerea consimtamantului trebuie sa fie la fel de simpla ca acordarea lui -->
                <button
                  type="button"
                  class="text-left underline underline-offset-4 transition-colors hover:text-[var(--aia-cyan)]"
                  (click)="resetCookies()"
                >
                  {{ 'footer.resetCookies' | translate }}
                </button>
              </li>
            </ul>
          </nav>

          <!-- Contact -->
          <div>
            <h2 class="aia-eyebrow">{{ 'footer.contact' | translate }}</h2>
            <ul class="mt-6 space-y-4 text-sm">
              <li class="flex gap-3">
                <span class="mt-0.5 shrink-0" [style.color]="'var(--aia-blood)'"><aia-icon name="pin" [size]="15" /></span>
                <span [style.color]="'var(--aia-text-muted)'">
                  {{ academy.address }}<br />{{ academy.postalCode }}, {{ academy.city }}
                </span>
              </li>
              <li class="flex gap-3">
                <span class="mt-0.5 shrink-0" [style.color]="'var(--aia-blood)'"><aia-icon name="phone" [size]="15" /></span>
                <a [href]="'tel:' + academy.phoneHref" class="transition-colors hover:text-[var(--aia-cyan)]">
                  {{ academy.phone }}
                </a>
              </li>
              <li class="flex gap-3">
                <span class="mt-0.5 shrink-0" [style.color]="'var(--aia-blood)'"><aia-icon name="mail" [size]="15" /></span>
                <a [href]="'mailto:' + academy.email" class="break-all transition-colors hover:text-[var(--aia-cyan)]">
                  {{ academy.email }}
                </a>
              </li>
              <li class="flex gap-3">
                <span class="mt-0.5 shrink-0" [style.color]="'var(--aia-blood)'"><aia-icon name="clock" [size]="15" /></span>
                <span [style.color]="'var(--aia-text-muted)'">{{ academy.schedule }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          class="mt-14 flex flex-col gap-3 border-t py-7 text-xs sm:flex-row sm:items-center sm:justify-between"
          [style.borderColor]="'var(--aia-border)'"
          [style.color]="'var(--aia-text-muted)'"
        >
          <p>&copy; {{ year }} {{ academy.name }}. {{ 'footer.rights' | translate }}</p>
          <p>{{ academy.city }} &middot; Romania</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  private readonly consent = inject(CookieConsentService);
  private readonly toast = inject(ToastService);

  readonly academy = ACADEMY;
  readonly year = new Date().getFullYear();

  readonly socials = [
    { label: 'Instagram', icon: 'instagram', url: 'https://instagram.com' },
    { label: 'Facebook', icon: 'facebook', url: 'https://facebook.com' },
    { label: 'YouTube', icon: 'youtube', url: 'https://youtube.com' },
    { label: 'TikTok', icon: 'tiktok', url: 'https://tiktok.com' }
  ];

  readonly academyLinks = [
    { label: 'Poveste', route: '/', fragment: 'despre' },
    { label: 'Grupe', route: '/', fragment: 'grupe' },
    { label: 'Program', route: '/', fragment: 'program' },
    { label: 'Antrenori', route: '/', fragment: 'antrenori' },
    { label: 'Galerie', route: '/', fragment: 'galerie' },
    { label: 'Inscriere', route: '/auth/register', fragment: undefined },
    { label: 'Autentificare', route: '/auth/login', fragment: undefined }
  ];

  resetCookies(): void {
    this.consent.reset();
    this.toast.info('Preferinte resetate', 'Banner-ul de cookie-uri va reaparea imediat.');
  }
}

import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { I18nService } from '../../core/services/i18n.service';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { SearchService } from '../../core/services/search.service';
import { ThemeService } from '../../core/services/theme.service';
import { IconComponent } from '../icons/icon.component';
import { LangToggleComponent } from './lang-toggle.component';
import { LogoComponent } from './logo.component';

/** Header sticky, cu bara care devine "pilula" de sticla la scroll. */
@Component({
  selector: 'aia-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslatePipe, IconComponent, LogoComponent, LangToggleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="fixed inset-x-0 top-0 z-50 transition-all duration-500" [style.paddingTop.px]="shrunk() ? 10 : 20">
      <div class="aia-container">
        <div
          class="bar aia-glass flex items-center justify-between gap-4 px-3 sm:px-4"
          [class.shrunk]="shrunk()"
          [class.hidden-up]="hiddenUp()"
          [style.height.px]="shrunk() ? 62 : 72"
          [style.borderRadius]="'var(--aia-radius-pill)'"
        >
          <a routerLink="/" class="group" [attr.aria-label]="'nav.home' | translate">
            <aia-logo [size]="shrunk() ? 38 : 42" />
          </a>

          <!-- Navigatie desktop -->
          <nav
            class="nav relative hidden items-center gap-1 lg:flex"
            [attr.aria-label]="'nav.main' | translate"
            (pointerleave)="ind.set(null)"
          >
            <span
              class="ind"
              aria-hidden="true"
              [style.opacity]="ind() ? 1 : 0"
              [style.left.px]="ind()?.left ?? 0"
              [style.width.px]="ind()?.width ?? 0"
            ></span>
            @for (item of navItems; track item.labelKey) {
              <a
                (pointerenter)="moveInd($event)"
                (focus)="moveInd($event)"
                [routerLink]="item.route"
                [fragment]="item.fragment"
                (click)="onNav(item.fragment)"
                routerLinkActive="!text-[var(--aia-text)]"
                [routerLinkActiveOptions]="{ exact: item.route === '/' && !item.fragment }"
                class="relative z-[1] rounded-full px-3.5 py-2 text-[13px] transition-colors hover:text-[var(--aia-text)]"
                [style.color]="'var(--aia-text-muted)'"
              >
                {{ item.labelKey | translate }}
              </a>
            }
          </nav>

          <!-- Actiuni -->
          <div class="actions flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              class="hidden h-10 w-10 place-items-center rounded-full border transition-colors hover:border-[var(--aia-cyan)] hover:text-[var(--aia-cyan)] sm:grid"
              [style.borderColor]="'var(--aia-border)'"
              (click)="search.open()"
              [attr.aria-label]="'nav.search' | translate"
            >
              <aia-icon name="search" [size]="16" />
            </button>

            <aia-lang-toggle />

            <button
              type="button"
              class="grid h-10 w-10 place-items-center rounded-full border transition-colors hover:border-[var(--aia-cyan)] hover:text-[var(--aia-cyan)]"
              [style.borderColor]="'var(--aia-border)'"
              (click)="theme.toggle()"
              [attr.aria-label]="'nav.theme' | translate"
              [attr.aria-pressed]="theme.isDark()"
            >
              <aia-icon [name]="theme.isDark() ? 'moon' : 'sun'" [size]="16" />
            </button>

            @if (auth.isLoggedIn()) {
              <a routerLink="/dashboard" class="aia-btn aia-btn-primary hidden !px-5 !py-2.5 lg:inline-flex">
                <span>{{ 'nav.dashboard' | translate }}</span>
              </a>
            } @else {
              <a routerLink="/auth/register" class="aia-btn aia-btn-primary hidden !px-5 !py-2.5 lg:inline-flex">
                <span>{{ 'nav.enroll' | translate }}</span>
              </a>
            }

            <button
              type="button"
              class="grid h-10 w-10 place-items-center rounded-full border lg:hidden"
              [style.borderColor]="'var(--aia-border)'"
              (click)="toggleMenu()"
              [attr.aria-expanded]="menuOpen()"
              aria-controls="aia-mobile-menu"
              [attr.aria-label]="'nav.menu' | translate"
            >
              <span class="relative block h-3 w-4">
                <span
                  class="absolute left-0 block h-[2px] w-4 rounded-full bg-current transition-all duration-300"
                  [style.top]="menuOpen() ? '5px' : '0'"
                  [style.transform]="menuOpen() ? 'rotate(45deg)' : 'none'"
                ></span>
                <span
                  class="absolute left-0 top-[5px] block h-[2px] w-4 rounded-full bg-current transition-opacity duration-200"
                  [style.opacity]="menuOpen() ? 0 : 1"
                ></span>
                <span
                  class="absolute left-0 block h-[2px] w-4 rounded-full bg-current transition-all duration-300"
                  [style.top]="menuOpen() ? '5px' : '10px'"
                  [style.transform]="menuOpen() ? 'rotate(-45deg)' : 'none'"
                ></span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Overlay meniu mobil -->
    @if (menuOpen()) {
      <div
        id="aia-mobile-menu"
        class="mobile-menu fixed inset-0 z-40 flex flex-col overflow-y-auto px-8 pb-10 pt-28 lg:hidden"
        data-lenis-prevent
        style="animation: aia-menu-in .6s cubic-bezier(.16,1,.3,1)"
      >
        <nav class="flex flex-col" [attr.aria-label]="'nav.main' | translate">
          @for (item of navItems; track item.labelKey; let i = $index) {
            <a
              [routerLink]="item.route"
              [fragment]="item.fragment"
              (click)="closeMenu(); onNav(item.fragment)"
              class="border-b py-4 font-display text-4xl transition-colors hover:text-[var(--aia-blood)] sm:py-5"
              [style.borderColor]="'var(--aia-border)'"
              [style.animation]="'aia-item-in .5s cubic-bezier(.16,1,.3,1) both'"
              [style.animationDelay]="60 * i + 'ms'"
            >
              {{ item.labelKey | translate }}
            </a>
          }
        </nav>

        <div class="mt-8 flex flex-col gap-3">
          <button type="button" class="aia-btn aia-btn-ghost w-full" (click)="closeMenu(); search.open()">
            <span>{{ 'nav.search' | translate }}</span>
          </button>
          @if (auth.isLoggedIn()) {
            <a routerLink="/dashboard" (click)="closeMenu()" class="aia-btn aia-btn-primary w-full">
              <span>{{ 'nav.dashboard' | translate }}</span>
            </a>
          } @else {
            <a routerLink="/auth/register" (click)="closeMenu()" class="aia-btn aia-btn-primary w-full">
              <span>{{ 'nav.enroll' | translate }}</span>
            </a>
          }
        </div>

        <div class="mt-8">
          <aia-lang-toggle size="lg" />
        </div>
      </div>
    }
  `,
  styles: [
    `
      .bar {
        transition: height 0.5s var(--aia-ease), transform 0.6s var(--aia-ease), box-shadow 0.5s, background 0.5s;
        --lg-tint: rgba(255, 255, 255, 0.04);
        --lg-tint-2: rgba(255, 255, 255, 0.01);
      }
      .bar.shrunk {
        --lg-tint: rgba(255, 255, 255, 0.1);
        --lg-tint-2: rgba(255, 255, 255, 0.03);
      }
      :host-context(html.light) .bar { --lg-tint: rgba(255, 255, 255, 0.45); --lg-tint-2: rgba(255, 255, 255, 0.2); }
      .bar.hidden-up { transform: translateY(-140%); }
      .ind {
        position: absolute;
        bottom: 4px;
        height: 3px;
        background: var(--aia-blood);
        box-shadow: 0 0 14px var(--aia-blood);
        pointer-events: none;
        clip-path: polygon(3px 0, 100% 0, calc(100% - 3px) 100%, 0 100%);
        transition: left 0.3s var(--aia-snap), width 0.3s var(--aia-snap), opacity 0.2s;
      }
      /* Pe telefoane foarte inguste (320-374px) logo + comutator + tema + meniu
         nu incap la dimensiunea normala: le strangem putin. */
      @media (max-width: 374px) {
        .actions > button { width: 36px; height: 36px; }
        .actions aia-lang-toggle { --w: 30px; }
        :host ::ng-deep .actions aia-lang-toggle .toggle { height: 36px; --w: 30px; }
        :host ::ng-deep aia-logo .logo-text { display: none; }
      }
      .nav a { font-family: 'Oswald', sans-serif; font-size: 14px; letter-spacing: 0.16em; text-transform: uppercase; }
      .nav a:hover { color: var(--aia-text) !important; }
      .bar::after { display: none; }
      .mobile-menu {
        /* Opac: meniul acopera tot ecranul, un blur pe fundal n-ar mai fi vizibil. */
        background: color-mix(in srgb, var(--aia-bg) 96%, transparent);
      }
      @keyframes aia-menu-in {
        from {
          opacity: 0;
          clip-path: circle(0% at 92% 5%);
        }
        to {
          opacity: 1;
          clip-path: circle(150% at 92% 5%);
        }
      }
      @keyframes aia-item-in {
        from {
          opacity: 0;
          transform: translateX(-26px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
    `
  ]
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  readonly i18n = inject(I18nService);
  readonly search = inject(SearchService);

  private readonly router = inject(Router);
  private readonly scroller = inject(SmoothScrollService);
  readonly shrunk = signal(false);
  /** Bara se ascunde la scroll in jos si revine la scroll in sus. */
  readonly hiddenUp = signal(false);
  readonly ind = signal<{ left: number; width: number } | null>(null);
  private lastY = 0;
  readonly menuOpen = signal(false);

  readonly navItems = [
    { route: '/', fragment: undefined, labelKey: 'nav.home' },
    { route: '/', fragment: 'despre', labelKey: 'nav.story' },
    { route: '/', fragment: 'grupe', labelKey: 'nav.groups' },
    { route: '/', fragment: 'program', labelKey: 'nav.schedule' },
    { route: '/', fragment: 'antrenori', labelKey: 'nav.coaches' },
    { route: '/', fragment: 'galerie', labelKey: 'nav.gallery' },
    { route: '/', fragment: 'locatii', labelKey: 'nav.contact' }
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    const y = window.scrollY;
    this.shrunk.set(y > 40);
    if (!this.menuOpen()) this.hiddenUp.set(y > 400 && y > this.lastY + 2);
    if (y < this.lastY - 2 || y < 400) this.hiddenUp.set(false);
    this.lastY = y;
  }

  /**
   * Click pe o ancora cand esti deja pe pagina principala: router-ul nu
   * navigheaza a doua oara spre aceeasi adresa, asa ca derulam noi, lin.
   */
  onNav(fragment: string | undefined): void {
    if (this.router.url.split(/[?#]/)[0] !== '/') return;
    this.scroller.scrollTo(fragment ? '#' + fragment : 0, fragment ? -20 : 0);
  }

  /** Pastila de sticla aluneca sub linkul de sub cursor. */
  moveInd(event: Event): void {
    const el = event.currentTarget as HTMLElement;
    this.ind.set({ left: el.offsetLeft, width: el.offsetWidth });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
    document.body.classList.toggle('aia-locked', this.menuOpen());
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    document.body.classList.remove('aia-locked');
  }
}

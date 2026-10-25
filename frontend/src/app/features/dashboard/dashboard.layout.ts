import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AcademyService } from '../../core/services/academy.service';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/icons/icon.component';

/** Cadrul comun al zonei de sportiv: navigatie laterala + outlet. */
@Component({
  selector: 'aia-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="aia-container py-12">
      <!-- Antet profil -->
      <header class="flex flex-wrap items-end justify-between gap-6 border-b pb-8" [style.borderColor]="'var(--aia-border)'">
        <div class="flex items-center gap-5">
          <div
            class="grid h-16 w-16 shrink-0 place-items-center rounded-[18px] border font-display text-xl"
            [style.borderColor]="'var(--aia-blood)'"
            [style.color]="'var(--aia-blood)'"
            aria-hidden="true"
          >
            {{ initials() }}
          </div>
          <div>
            <p class="aia-eyebrow">{{ roleLabel() }}</p>
            <h1 class="mt-2 font-display text-3xl leading-tight">{{ auth.user()?.name }}</h1>
            <p class="mt-1.5 text-sm" [style.color]="'var(--aia-text-muted)'">
              {{ auth.user()?.xpPoints ?? 0 }} XP &middot; nivel Battle Pass {{ auth.user()?.currentBattlepassLevel ?? 0 }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          @if (auth.isTrainer()) {
            <a routerLink="/antrenor/prezenta" class="aia-btn aia-btn-ghost !px-5 !py-2.5">
              <aia-icon name="check" [size]="16" />
              <span>Panou antrenor</span>
            </a>
          }

          <!-- Adminul trebuie sa vada cererile fara sa caute ruta manual. -->
          @if (auth.isAdmin()) {
            <a routerLink="/antrenor/aprobari" class="aia-btn aia-btn-primary !px-5 !py-2.5">
              <aia-icon name="users" [size]="16" />
              <span>Aprobare conturi</span>
              @if (pendingCount() > 0) {
                <span class="ml-1 rounded-full bg-black/30 px-2 py-0.5 text-[10px] leading-none">{{ pendingCount() }}</span>
              }
            </a>
          }

          <button type="button" class="aia-btn aia-btn-ghost !px-5 !py-2.5" (click)="auth.logout()">
            <aia-icon name="logout" [size]="16" />
            <span>Iesire</span>
          </button>
        </div>
      </header>

      <div class="mt-10 grid gap-10 lg:grid-cols-[230px_1fr]">
        <nav aria-label="Sectiuni profil">
          <ul class="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            @for (link of links; track link.route) {
              <li class="shrink-0 lg:shrink">
                <a
                  [routerLink]="link.route"
                  routerLinkActive="aia-side-active"
                  [routerLinkActiveOptions]="{ exact: link.exact }"
                  class="aia-side flex items-center gap-3 whitespace-nowrap border-l-2 px-4 py-3 font-heading text-[11px] uppercase tracking-[0.18em] transition-colors"
                >
                  <aia-icon [name]="link.icon" [size]="16" />
                  <span>{{ link.label }}</span>
                </a>
              </li>
            }
          </ul>
        </nav>

        <div>
          <router-outlet />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .aia-side {
        border-color: var(--aia-border);
        color: var(--aia-text-muted);
      }
      .aia-side:hover {
        color: var(--aia-text);
      }
      .aia-side-active {
        border-color: var(--aia-blood);
        color: var(--aia-text);
      }
    `
  ]
})
export class DashboardLayout {
  private readonly academy = inject(AcademyService);
  readonly auth = inject(AuthService);

  readonly pendingCount = signal(0);

  readonly links = [
    { route: '/dashboard', label: 'Profil', icon: 'user', exact: true },
    { route: '/dashboard/battlepass', label: 'Battle Pass', icon: 'trophy', exact: false },
    { route: '/dashboard/roata', label: 'Invarte-l pe Birtu', icon: 'wheel', exact: false },
    { route: '/dashboard/stories', label: 'Story-uri', icon: 'image', exact: false },
    { route: '/dashboard/competitii', label: 'Competitii', icon: 'calendar', exact: false },
    { route: '/dashboard/program', label: 'Program', icon: 'clock', exact: false }
  ];

  constructor() {
    if (this.auth.isAdmin()) {
      this.academy.pendingUsers().subscribe({
        next: (users) => this.pendingCount.set(users.length)
      });
    }
  }

  initials(): string {
    const name = this.auth.user()?.name ?? '';
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  roleLabel(): string {
    switch (this.auth.user()?.role) {
      case 'ROLE_ADMIN':
        return 'Administrator';
      case 'ROLE_TRAINER':
        return 'Antrenor';
      default:
        return 'Sportiv';
    }
  }
}

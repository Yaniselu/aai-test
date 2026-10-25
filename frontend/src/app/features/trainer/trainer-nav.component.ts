import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AcademyService } from '../../core/services/academy.service';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/icons/icon.component';

/**
 * Antetul comun al panoului de antrenor/administrator.
 *
 * Exista pentru ca fiecare pagina isi definea propriile legaturi si niciuna nu
 * ducea catre aprobarea conturilor: adminul putea ajunge la /antrenor/aprobari
 * doar tastand adresa manual. Acum sectiunile sunt declarate intr-un singur loc
 * si filtrate dupa rol, iar cererile in asteptare au un contor vizibil.
 */
@Component({
  selector: 'aia-trainer-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="border-b pb-8" [style.borderColor]="'var(--aia-border)'">
      <div class="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p class="aia-eyebrow">{{ auth.isAdmin() ? 'Panou administrator' : 'Panou antrenor' }}</p>
          <h1 class="mt-4 font-display text-3xl leading-tight sm:text-4xl">{{ title() }}</h1>
        </div>

        <a routerLink="/dashboard" class="aia-btn aia-btn-ghost !px-5 !py-2.5">
          <aia-icon name="user" [size]="16" />
          <span>Profilul meu</span>
        </a>
      </div>

      <nav class="mt-8 flex flex-wrap gap-2" aria-label="Sectiuni panou">
        @for (tab of tabs(); track tab.route) {
          <a
            [routerLink]="tab.route"
            routerLinkActive="aia-tab-active"
            class="aia-tab inline-flex items-center gap-2 rounded-full border px-4 py-2.5 font-heading text-[10px] font-bold uppercase tracking-[0.16em] transition-colors"
          >
            <aia-icon [name]="tab.icon" [size]="15" />
            <span>{{ tab.label }}</span>

            @if (tab.route === '/antrenor/aprobari' && pendingCount() > 0) {
              <span
                class="ml-1 min-w-[18px] rounded-full bg-[var(--aia-blood)] px-2 py-0.5 text-center text-[10px] leading-none text-white"
                [attr.aria-label]="pendingCount() + ' conturi in asteptare'"
              >
                {{ pendingCount() }}
              </span>
            }
          </a>
        }
      </nav>
    </header>
  `,
  styles: [
    `
      .aia-tab {
        border-color: var(--aia-border);
        color: var(--aia-text-muted);
      }
      .aia-tab:hover {
        border-color: var(--aia-border-strong);
        color: var(--aia-text);
      }
      .aia-tab-active {
        border-color: var(--aia-blood);
        color: var(--aia-text);
      }
    `
  ]
})
export class TrainerNavComponent {
  private readonly academy = inject(AcademyService);
  readonly auth = inject(AuthService);

  readonly title = input.required<string>();
  readonly pendingCount = signal(0);

  readonly tabs = computed(() => {
    const tabs = [
      { route: '/antrenor/prezenta', label: 'Prezenta', icon: 'check' },
      { route: '/antrenor/competitii', label: 'Competitii', icon: 'calendar' }
    ];

    // Aprobarea conturilor este exclusiv a administratorului.
    if (this.auth.isAdmin()) {
      tabs.push({ route: '/antrenor/aprobari', label: 'Aprobare conturi', icon: 'users' });
    }
    return tabs;
  });

  constructor() {
    if (this.auth.isAdmin()) {
      this.academy.pendingUsers().subscribe({
        next: (users) => this.pendingCount.set(users.length)
      });
    }
  }
}

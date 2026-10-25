import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/icons/icon.component';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * Starea intermediara dintre inregistrare si acces.
 * Utilizatorul are cont, dar niciun administrator nu l-a validat inca.
 */
@Component({
  selector: 'aia-pending',
  standalone: true,
  imports: [RouterLink, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid min-h-[calc(100vh-84px)] place-items-center px-6 py-20">
      <div class="w-full max-w-xl text-center">
        <!-- Pictograma cu puls: comunica "in curs", nu "eroare" -->
        <div class="relative mx-auto grid h-24 w-24 place-items-center">
          <span
            class="absolute inset-0 rounded-full border border-[var(--aia-blood)]"
            style="animation: aia-ring 2.2s ease-out infinite"
          ></span>
          <span
            class="absolute inset-0 rounded-full border border-[var(--aia-blood)]"
            style="animation: aia-ring 2.2s ease-out infinite; animation-delay: .7s"
          ></span>
          <span class="grid h-16 w-16 place-items-center bg-[var(--aia-blood)] text-white" aria-hidden="true">
            <aia-icon name="hourglass" [size]="30" />
          </span>
        </div>

        <p class="aia-eyebrow mt-10">Etapa 2 din 2</p>
        <h1 class="mt-4 font-display text-3xl leading-tight sm:text-4xl">{{ 'auth.pendingTitle' | translate }}</h1>

        <p class="mx-auto mt-6 max-w-md text-base leading-relaxed" [style.color]="'var(--aia-text-muted)'">
          {{ 'auth.pendingMessage' | translate }}
        </p>

        <!-- Pasii procesului, ca asteptarea sa fie inteligibila -->
        <ol class="mx-auto mt-12 max-w-md space-y-4 text-left">
          @for (step of steps; track step.label; let i = $index) {
            <li class="flex items-start gap-4">
              <span
                class="grid h-8 w-8 shrink-0 place-items-center border font-heading text-xs"
                [style.borderColor]="step.done ? 'var(--aia-blood)' : 'var(--aia-border)'"
                [style.backgroundColor]="step.done ? 'var(--aia-blood)' : 'transparent'"
                [style.color]="step.done ? '#fff' : 'var(--aia-text-muted)'"
              >
                @if (step.done) {
                  <aia-icon name="check" [size]="15" [strokeWidth]="2.4" />
                } @else {
                  {{ i + 1 }}
                }
              </span>
              <span>
                <span class="block font-heading text-sm uppercase tracking-wide">{{ step.label }}</span>
                <span class="block text-sm" [style.color]="'var(--aia-text-muted)'">{{ step.detail }}</span>
              </span>
            </li>
          }
        </ol>

        <div class="mt-12 flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" class="aia-btn aia-btn-primary" (click)="recheck()" [disabled]="checking()">
            {{ (checking() ? 'auth.checking' : 'common.retry') | translate }}
          </button>
          <a routerLink="/" class="aia-btn aia-btn-ghost"><span>{{ 'common.back' | translate }}</span></a>
        </div>

        <p class="mt-8 text-xs" [style.color]="'var(--aia-text-muted)'">
          Dureaza prea mult? Scrie-ne la
          <a href="mailto:academiaionandrei&#64;gmail.com" class="underline hover:text-[var(--aia-blood-bright)]">
            academiaionandrei&#64;gmail.com
          </a>
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      @keyframes aia-ring {
        0% {
          transform: scale(0.85);
          opacity: 0.8;
        }
        100% {
          transform: scale(1.5);
          opacity: 0;
        }
      }
    `
  ]
})
export class PendingPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly checking = signal(false);

  readonly steps = [
    { label: 'Cont creat', detail: 'Datele tale au fost inregistrate cu succes.', done: true },
    { label: 'Verificare administrator', detail: 'Un antrenor confirma ca esti sportiv al academiei.', done: false },
    { label: 'Acces complet', detail: 'Profil, Battle Pass, Invarte-l pe Birtu si calendar.', done: false }
  ];

  /** Reincarca profilul: daca adminul a aprobat intre timp, intram direct in dashboard. */
  recheck(): void {
    if (!this.auth.isLoggedIn()) {
      void this.router.navigate(['/auth/login']);
      return;
    }

    this.checking.set(true);
    this.auth.loadProfile().subscribe({
      next: (user) => {
        this.checking.set(false);
        if (user.approved) {
          this.toast.success('Cont aprobat', 'Bine ai venit in academie!');
          void this.router.navigate(['/dashboard']);
        } else {
          this.toast.info('Inca in verificare', 'Contul nu a fost aprobat inca. Mai incearca putin mai tarziu.');
        }
      },
      error: () => this.checking.set(false)
    });
  }
}

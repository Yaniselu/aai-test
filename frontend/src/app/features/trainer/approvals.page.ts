import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AcademyService } from '../../core/services/academy.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models/models';
import { ConfirmModalComponent, LoaderComponent } from '../../shared/components/ui-utilities';
import { TrainerNavComponent } from './trainer-nav.component';

/**
 * Coada de aprobare a conturilor noi.
 * Pana la un click pe "Aproba", contul exista dar nu poate accesa nimic:
 * backend-ul raspunde 403 PENDING_APPROVAL pe orice ruta protejata.
 */
@Component({
  selector: 'aia-approvals',
  standalone: true,
  imports: [LoaderComponent, ConfirmModalComponent, TrainerNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="aia-container py-12">
      <aia-trainer-nav title="APROBARE CONTURI" />

      <p class="mt-6 max-w-2xl text-sm leading-relaxed" [style.color]="'var(--aia-text-muted)'">
        Conturile de mai jos au fost create, dar nu au inca acces la platforma. Aproba doar
        persoanele care sunt intr-adevar sportivi ai academiei.
      </p>

      @if (loading()) {
        <aia-loader label="Se incarca cererile" />
      } @else if (pending().length) {
        <ul class="mt-10 space-y-3">
          @for (user of pending(); track user.id) {
            <li class="aia-card flex flex-wrap items-center justify-between gap-4 p-5">
              <div class="flex min-w-0 items-center gap-4">
                <span
                  class="grid h-12 w-12 shrink-0 place-items-center border font-display text-lg"
                  style="border-color: var(--aia-blood); color: var(--aia-blood)"
                  aria-hidden="true"
                >
                  {{ initials(user.name) }}
                </span>
                <div class="min-w-0">
                  <p class="font-heading text-base uppercase tracking-wide">{{ user.name }}</p>
                  <p class="truncate text-sm" [style.color]="'var(--aia-text-muted)'">{{ user.email }}</p>
                </div>
              </div>

              <div class="flex gap-2">
                <button
                  type="button"
                  class="aia-btn aia-btn-primary !px-5 !py-2.5 !text-[11px]"
                  (click)="approve(user)"
                  [disabled]="busyId() === user.id"
                >
                  {{ busyId() === user.id ? '...' : 'Aproba' }}
                </button>
                <button
                  type="button"
                  class="aia-btn aia-btn-ghost !px-5 !py-2.5 !text-[11px]"
                  (click)="pendingReject.set(user)"
                  [disabled]="busyId() === user.id"
                >
                  Respinge
                </button>
              </div>
            </li>
          }
        </ul>
      } @else {
        <div class="aia-card mt-10 p-12 text-center">
          <p class="font-display text-3xl">NICIO CERERE</p>
          <p class="mt-3 text-sm" [style.color]="'var(--aia-text-muted)'">
            Toate conturile au fost procesate.
          </p>
        </div>
      }
    </div>

    <aia-confirm-modal
      [open]="!!pendingReject()"
      title="Respingi contul?"
      [message]="rejectMessage()"
      confirmLabel="Da, respinge"
      [destructive]="true"
      (confirmed)="reject()"
      (cancelled)="pendingReject.set(null)"
    />
  `
})
export class ApprovalsPage {
  private readonly academy = inject(AcademyService);
  private readonly toast = inject(ToastService);

  readonly pending = signal<User[]>([]);
  readonly loading = signal(true);
  readonly busyId = signal<number | null>(null);
  readonly pendingReject = signal<User | null>(null);

  constructor() {
    this.load();
  }

  private load(): void {
    this.academy.pendingUsers().subscribe({
      next: (users) => {
        this.pending.set(users);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  approve(user: User): void {
    this.busyId.set(user.id);
    this.academy.approveUser(user.id).subscribe({
      next: () => {
        this.pending.update((list) => list.filter((u) => u.id !== user.id));
        this.busyId.set(null);
        this.toast.success('Cont aprobat', `${user.name} are acum acces complet la platforma.`);
      },
      error: () => this.busyId.set(null)
    });
  }

  reject(): void {
    const user = this.pendingReject();
    if (!user) return;
    this.pendingReject.set(null);
    this.busyId.set(user.id);

    this.academy.rejectUser(user.id).subscribe({
      next: () => {
        this.pending.update((list) => list.filter((u) => u.id !== user.id));
        this.busyId.set(null);
        this.toast.info('Cont respins', `Cererea lui ${user.name} a fost stearsa.`);
      },
      error: () => this.busyId.set(null)
    });
  }

  rejectMessage(): string {
    const user = this.pendingReject();
    return user
      ? `Contul lui ${user.name} (${user.email}) va fi sters definitiv. Persoana va trebui sa se inscrie din nou.`
      : '';
  }

  initials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  }
}

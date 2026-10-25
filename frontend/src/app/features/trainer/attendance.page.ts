import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AcademyService } from '../../core/services/academy.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models/models';
import { ConfirmModalComponent, LoaderComponent } from '../../shared/components/ui-utilities';
import { IconComponent } from '../../shared/icons/icon.component';
import { TrainerNavComponent } from './trainer-nav.component';

/**
 * PANOU ANTRENOR - PREZENTA
 * -------------------------
 * Optimizat pentru utilizarea reala: antrenorul deschide telefonul dupa
 * antrenament si bifeaza in 30 de secunde. De aceea: cautare instant,
 * randuri mari de atins cu degetul, si o singura confirmare la final.
 *
 * Salvarea declanseaza in backend acordarea de XP si recalcularea Battle Pass-ului.
 */
@Component({
  selector: 'aia-attendance',
  standalone: true,
  imports: [FormsModule, LoaderComponent, ConfirmModalComponent, IconComponent, TrainerNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="aia-container py-12">
      <aia-trainer-nav title="PREZENTA" />

      @if (loading()) {
        <aia-loader label="Se incarca lista sportivilor" />
      } @else {
        <!-- Controale -->
        <div class="mt-10 flex flex-wrap items-end gap-4">
          <div>
            <label class="aia-label" for="att-date">Data antrenamentului</label>
            <input id="att-date" type="date" class="aia-input" [(ngModel)]="date" [max]="today" />
          </div>

          <div class="min-w-[220px] flex-1">
            <label class="aia-label" for="att-search">Cauta sportiv</label>
            <input
              id="att-search"
              type="search"
              class="aia-input"
              placeholder="Nume sau email"
              [ngModel]="query()"
              (ngModelChange)="query.set($event)"
            />
          </div>

          <div class="flex gap-2">
            <button type="button" class="aia-btn aia-btn-ghost !px-4 !py-3" (click)="selectAll()">
              Toti prezenti
            </button>
            <button type="button" class="aia-btn aia-btn-ghost !px-4 !py-3" (click)="clearAll()">
              Reseteaza
            </button>
          </div>
        </div>

        <!-- Contor -->
        <div
          class="mt-6 flex flex-wrap items-center gap-6 border-y py-4"
          [style.borderColor]="'var(--aia-border)'"
        >
          <p class="font-display text-3xl">
            <span class="text-[var(--aia-blood-bright)]">{{ presentIds().size }}</span>
            <span class="text-lg" [style.color]="'var(--aia-text-muted)'"> / {{ roster().length }} prezenti</span>
          </p>
          <p class="text-sm" [style.color]="'var(--aia-text-muted)'">
            Fiecare sportiv bifat primeste {{ xpPerSession }} XP.
          </p>
        </div>

        <!-- Lista -->
        <ul class="mt-6 space-y-2">
          @for (athlete of filtered(); track athlete.id) {
            <li>
              <button
                type="button"
                class="flex w-full items-center gap-4 border p-4 text-left transition-colors"
                [style.borderColor]="presentIds().has(athlete.id) ? 'var(--aia-blood)' : 'var(--aia-border)'"
                [style.backgroundColor]="presentIds().has(athlete.id) ? 'color-mix(in srgb, var(--aia-blood) 8%, transparent)' : 'transparent'"
                (click)="toggle(athlete.id)"
                [attr.aria-pressed]="presentIds().has(athlete.id)"
              >
                <!-- Checkbox vizual -->
                <span
                  class="grid h-7 w-7 shrink-0 place-items-center border-2 text-sm transition-colors"
                  [style.borderColor]="presentIds().has(athlete.id) ? 'var(--aia-blood)' : 'var(--aia-border)'"
                  [style.backgroundColor]="presentIds().has(athlete.id) ? 'var(--aia-blood)' : 'transparent'"
                  [style.color]="'#fff'"
                  aria-hidden="true"
                >
                  @if (presentIds().has(athlete.id)) {
                    <aia-icon name="check" [size]="16" [strokeWidth]="2.4" />
                  }
                </span>

                <span class="min-w-0 flex-1">
                  <span class="block font-heading text-base uppercase tracking-wide">{{ athlete.name }}</span>
                  <span class="block truncate text-xs" [style.color]="'var(--aia-text-muted)'">
                    {{ athlete.email }} &middot; {{ athlete.xpPoints }} XP &middot; nivel {{ athlete.currentBattlepassLevel }}
                  </span>
                </span>

                @if (athlete.absencesCount > 2) {
                  <span
                    class="shrink-0 border px-2 py-1 font-heading text-[10px] uppercase tracking-wide"
                    style="border-color: var(--aia-blood); color: var(--aia-blood-bright)"
                    title="A depasit limita de absente pe luna curenta"
                  >
                    {{ athlete.absencesCount }} absente
                  </span>
                }
              </button>
            </li>
          } @empty {
            <li class="py-10 text-center" [style.color]="'var(--aia-text-muted)'">
              Niciun sportiv nu corespunde cautarii.
            </li>
          }
        </ul>

        <!-- Bara de actiune, fixata pe mobil ca sa fie mereu la indemana -->
        <div
          class="sticky bottom-0 z-10 mt-8 border-t py-5"
          [style.borderColor]="'var(--aia-border)'"
          [style.backgroundColor]="'var(--aia-bg)'"
        >
          <button
            type="button"
            class="aia-btn aia-btn-primary w-full"
            (click)="confirmOpen.set(true)"
            [disabled]="saving() || presentIds().size === 0"
          >
            {{ saving() ? 'Se salveaza...' : 'Salveaza prezenta (' + presentIds().size + ')' }}
          </button>
        </div>
      }
    </div>

    <aia-confirm-modal
      [open]="confirmOpen()"
      title="Confirmi prezenta?"
      [message]="confirmMessage()"
      confirmLabel="Da, salveaza"
      (confirmed)="save()"
      (cancelled)="confirmOpen.set(false)"
    />
  `
})
export class AttendancePage {
  private readonly academy = inject(AcademyService);
  private readonly toast = inject(ToastService);

  readonly xpPerSession = 50;
  readonly today = new Date().toISOString().slice(0, 10);

  date = this.today;

  readonly roster = signal<User[]>([]);
  readonly presentIds = signal<Set<number>>(new Set());
  readonly query = signal('');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly confirmOpen = signal(false);

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.roster();
    if (!q) return list;
    return list.filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));
  });

  readonly confirmMessage = computed(
    () =>
      `Vei marca ${this.presentIds().size} sportivi ca prezenti pentru ${this.date}. ` +
      `Fiecare primeste ${this.xpPerSession} XP, iar absentii vor avea o absenta inregistrata. ` +
      `Actiunea actualizeaza si progresul Battle Pass.`
  );

  constructor() {
    this.academy.roster().subscribe({
      next: (list) => {
        this.roster.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggle(id: number): void {
    this.presentIds.update((set) => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  selectAll(): void {
    this.presentIds.set(new Set(this.filtered().map((a) => a.id)));
  }

  clearAll(): void {
    this.presentIds.set(new Set());
  }

  save(): void {
    this.confirmOpen.set(false);
    this.saving.set(true);

    this.academy.submitAttendance(this.date, [...this.presentIds()]).subscribe({
      next: (records) => {
        this.saving.set(false);
        this.clearAll();
        this.toast.success(
          'Prezenta salvata',
          `${records.filter((r) => r.status === 'PRESENT').length} sportivi au primit XP.`
        );
      },
      error: () => this.saving.set(false)
    });
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AcademyService } from '../../core/services/academy.service';
import { ToastService } from '../../core/services/toast.service';
import { Competition } from '../../core/models/models';
import { ConfirmModalComponent, LoaderComponent } from '../../shared/components/ui-utilities';
import { TrainerNavComponent } from './trainer-nav.component';

/** Antrenorul adauga competitii in calendarul vizibil intregii academii. */
@Component({
  selector: 'aia-manage-competitions',
  standalone: true,
  imports: [ReactiveFormsModule, LoaderComponent, ConfirmModalComponent, TrainerNavComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="aia-container py-12">
      <aia-trainer-nav title="COMPETITII" />

      <div class="mt-10 grid gap-10 lg:grid-cols-[400px_1fr]">
        <!-- Formular -->
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate class="aia-card h-fit p-7">
          <h2 class="font-display text-3xl">Adauga competitie</h2>

          <div class="mt-6 space-y-5">
            <div>
              <label class="aia-label" for="comp-title">Titlu</label>
              <input id="comp-title" class="aia-input" formControlName="title" />
              @if (invalid('title')) {
                <p class="mt-1.5 text-xs text-[var(--aia-blood-bright)]">Titlul este obligatoriu.</p>
              }
            </div>

            <div>
              <label class="aia-label" for="comp-location">Locatie</label>
              <input id="comp-location" class="aia-input" formControlName="location" />
              @if (invalid('location')) {
                <p class="mt-1.5 text-xs text-[var(--aia-blood-bright)]">Locatia este obligatorie.</p>
              }
            </div>

            <div>
              <label class="aia-label" for="comp-date">Data</label>
              <input id="comp-date" type="date" class="aia-input" formControlName="date" />
              @if (invalid('date')) {
                <p class="mt-1.5 text-xs text-[var(--aia-blood-bright)]">Alege data competitiei.</p>
              }
            </div>

            <div>
              <label class="aia-label" for="comp-desc">Descriere</label>
              <textarea id="comp-desc" rows="4" class="aia-input resize-none" formControlName="description"></textarea>
            </div>
          </div>

          <button type="submit" class="aia-btn aia-btn-primary mt-7 w-full" [disabled]="saving()">
            {{ saving() ? 'Se adauga...' : 'Adauga in calendar' }}
          </button>
        </form>

        <!-- Lista -->
        <div>
          @if (loading()) {
            <aia-loader label="Se incarca competitiile" />
          } @else {
            <ul class="space-y-3">
              @for (comp of competitions(); track comp.id) {
                <li class="aia-card flex flex-wrap items-center justify-between gap-4 p-5">
                  <div class="min-w-0">
                    <h3 class="font-display text-2xl">{{ comp.title }}</h3>
                    <p class="mt-1 text-sm" [style.color]="'var(--aia-text-muted)'">
                      {{ formatDate(comp.date) }} &middot; {{ comp.location }}
                    </p>
                  </div>
                  <button
                    type="button"
                    class="aia-btn aia-btn-ghost !px-4 !py-2 !text-[11px]"
                    (click)="pendingDelete.set(comp)"
                  >
                    Sterge
                  </button>
                </li>
              } @empty {
                <li class="aia-card p-10 text-center" [style.color]="'var(--aia-text-muted)'">
                  Nicio competitie in calendar.
                </li>
              }
            </ul>
          }
        </div>
      </div>
    </div>

    <aia-confirm-modal
      [open]="!!pendingDelete()"
      title="Stergi competitia?"
      [message]="'Competitia \\'' + (pendingDelete()?.title ?? '') + '\\' va disparea din calendarul tuturor sportivilor. Actiunea nu poate fi anulata.'"
      confirmLabel="Da, sterge"
      [destructive]="true"
      (confirmed)="remove()"
      (cancelled)="pendingDelete.set(null)"
    />
  `
})
export class ManageCompetitionsPage {
  private readonly fb = inject(FormBuilder);
  private readonly academy = inject(AcademyService);
  private readonly toast = inject(ToastService);

  readonly competitions = signal<Competition[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly pendingDelete = signal<Competition | null>(null);

  readonly form = this.fb.nonNullable.group({
    title: ['', Validators.required],
    location: ['', Validators.required],
    date: ['', Validators.required],
    description: ['']
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.academy.competitions().subscribe({
      next: (list) => {
        this.competitions.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  invalid(control: string): boolean {
    const ctrl = this.form.get(control);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.academy.createCompetition(this.form.getRawValue()).subscribe({
      next: (comp) => {
        this.competitions.update((list) => [comp, ...list]);
        this.form.reset();
        this.saving.set(false);
        this.toast.success('Competitie adaugata', 'Apare imediat in calendarul sportivilor.');
      },
      error: () => this.saving.set(false)
    });
  }

  remove(): void {
    const comp = this.pendingDelete();
    if (!comp) return;
    this.pendingDelete.set(null);

    this.academy.deleteCompetition(comp.id).subscribe({
      next: () => {
        this.competitions.update((list) => list.filter((c) => c.id !== comp.id));
        this.toast.info('Competitie stearsa');
      }
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AcademyService } from '../../core/services/academy.service';
import { Competition } from '../../core/models/models';
import { LoaderComponent } from '../../shared/components/ui-utilities';
import { IconComponent } from '../../shared/icons/icon.component';

/** Calendarul competitiilor academiei, adaugate de antrenori. */
@Component({
  selector: 'aia-competitions',
  standalone: true,
  imports: [LoaderComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <p class="aia-eyebrow">Calendar</p>
      <h2 class="mt-3 font-display text-4xl leading-none">COMPETITII</h2>
      <p class="mt-4 max-w-2xl text-sm leading-relaxed" [style.color]="'var(--aia-text-muted)'">
        Competitiile la care participa colegii tai de academie. Anunta-l pe antrenor daca vrei
        sa fii inscris.
      </p>

      @if (loading()) {
        <aia-loader label="Se incarca calendarul" />
      } @else {
        <!-- Viitoare -->
        <h3 class="mt-10 font-heading text-sm uppercase tracking-[0.25em] text-[var(--aia-blood-bright)]">
          Urmeaza ({{ upcoming().length }})
        </h3>

        @if (upcoming().length) {
          <ul class="mt-5 space-y-4">
            @for (comp of upcoming(); track comp.id) {
              <li class="aia-card flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
                <!-- Data -->
                <div
                  class="flex shrink-0 flex-col items-center justify-center border p-4 sm:w-24"
                  [style.borderColor]="'var(--aia-border)'"
                >
                  <span class="font-display text-4xl leading-none text-[var(--aia-blood-bright)]">
                    {{ day(comp.date) }}
                  </span>
                  <span class="mt-1 font-heading text-[11px] uppercase tracking-[0.2em]">{{ month(comp.date) }}</span>
                </div>

                <div class="min-w-0 flex-1">
                  <h4 class="font-display text-2xl">{{ comp.title }}</h4>
                  <p class="mt-1 text-sm" [style.color]="'var(--aia-text-muted)'">
                    <aia-icon name="pin" [size]="13" class="mr-1 inline-flex align-[-2px]" />{{ comp.location }} &middot; adaugat de {{ comp.createdByName }}
                  </p>
                  @if (comp.description) {
                    <p class="mt-3 text-sm leading-relaxed" [style.color]="'var(--aia-text-muted)'">
                      {{ comp.description }}
                    </p>
                  }

                  @if (comp.participants.length) {
                    <div class="mt-4 flex flex-wrap gap-2">
                      @for (participant of comp.participants; track participant) {
                        <span
                          class="border px-3 py-1 text-xs"
                          [style.borderColor]="'var(--aia-border)'"
                          [style.color]="'var(--aia-text-muted)'"
                        >
                          {{ participant }}
                        </span>
                      }
                    </div>
                  }
                </div>

                <span
                  class="shrink-0 font-heading text-[11px] uppercase tracking-[0.2em]"
                  [style.color]="'var(--aia-text-muted)'"
                >
                  {{ countdown(comp.date) }}
                </span>
              </li>
            }
          </ul>
        } @else {
          <p class="mt-5 text-sm" [style.color]="'var(--aia-text-muted)'">
            Nicio competitie programata momentan.
          </p>
        }

        <!-- Trecute -->
        @if (past().length) {
          <h3 class="mt-14 font-heading text-sm uppercase tracking-[0.25em]" [style.color]="'var(--aia-text-muted)'">
            Arhiva ({{ past().length }})
          </h3>
          <ul class="mt-5 space-y-3">
            @for (comp of past(); track comp.id) {
              <li
                class="flex flex-wrap items-center justify-between gap-3 border-b pb-3 text-sm"
                [style.borderColor]="'var(--aia-border)'"
                [style.color]="'var(--aia-text-muted)'"
              >
                <span>{{ comp.title }}</span>
                <span>{{ formatDate(comp.date) }} &middot; {{ comp.location }}</span>
              </li>
            }
          </ul>
        }
      }
    </section>
  `
})
export class CompetitionsPage {
  private readonly academy = inject(AcademyService);

  readonly competitions = signal<Competition[]>([]);
  readonly loading = signal(true);

  readonly upcoming = computed(() =>
    this.competitions()
      .filter((c) => new Date(c.date).getTime() >= this.startOfToday())
      .sort((a, b) => a.date.localeCompare(b.date))
  );

  readonly past = computed(() =>
    this.competitions()
      .filter((c) => new Date(c.date).getTime() < this.startOfToday())
      .sort((a, b) => b.date.localeCompare(a.date))
  );

  constructor() {
    this.academy.competitions().subscribe({
      next: (list) => {
        this.competitions.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  private startOfToday(): number {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }

  day(date: string): string {
    return String(new Date(date).getDate()).padStart(2, '0');
  }

  month(date: string): string {
    return new Date(date).toLocaleDateString('ro-RO', { month: 'short' }).toUpperCase();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  countdown(date: string): string {
    const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000);
    if (days <= 0) return 'Astazi';
    if (days === 1) return 'Maine';
    return `in ${days} zile`;
  }
}

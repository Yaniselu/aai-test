import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SCHEDULE, todayIndex } from '../../core/schedule.data';
import { IconComponent } from '../icons/icon.component';

/**
 * Programul saptamanal.
 *
 * Pe ecrane mari e o grila cu sapte coloane; sub `lg` devine o lista de zile
 * cu selector, pentru ca un tabel de sapte coloane pe telefon fie se
 * comprima ilizibil, fie forteaza scroll orizontal.
 */
@Component({
  selector: 'aia-schedule',
  standalone: true,
  imports: [TranslatePipe, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Selector de zi, doar pe ecrane mici -->
    <div class="flex gap-2 overflow-x-auto pb-3 lg:hidden">
      @for (day of schedule; track day.key) {
        <button
          type="button"
          class="aia-chip shrink-0 transition-colors"
          [style.borderColor]="selected() === day.index ? 'var(--aia-blood)' : 'var(--aia-border)'"
          [style.color]="selected() === day.index ? 'var(--aia-text)' : 'var(--aia-text-muted)'"
          (click)="selected.set(day.index)"
        >
          {{ 'schedule.days.' + day.key | translate }}
        </button>
      }
    </div>

    <!-- Lista zilei alese (mobil) -->
    <div class="lg:hidden">
      @if (selectedDay(); as day) {
        @if (day.slots.length) {
          <ul class="space-y-2">
            @for (s of day.slots; track s.time + s.key) {
              <li class="aia-card-flat flex items-center gap-4 px-4 py-3">
                <span class="aia-index shrink-0 text-sm" [style.color]="'var(--aia-cyan)'">{{ s.time }}</span>
                <span class="text-sm">{{ s.label }}</span>
              </li>
            }
          </ul>
        } @else {
          <p class="aia-card-flat px-4 py-6 text-center text-sm" [style.color]="'var(--aia-text-muted)'">
            {{ 'schedule.closed' | translate }}
          </p>
        }
      }
    </div>

    <!-- Grila completa (desktop) -->
    <div class="hidden lg:grid lg:grid-cols-7 lg:gap-3">
      @for (day of schedule; track day.key) {
        <div>
          <div
            class="mb-3 rounded-[12px] border px-3 py-2.5 text-center"
            [style.borderColor]="day.index === today ? 'var(--aia-blood)' : 'var(--aia-border)'"
            [style.backgroundColor]="day.index === today ? 'var(--aia-blood-soft)' : 'transparent'"
          >
            <span class="font-heading text-[11px] font-bold uppercase tracking-[0.12em]">
              {{ 'schedule.days.' + day.key | translate }}
            </span>
          </div>

          <ul class="space-y-2">
            @for (s of day.slots; track s.time + s.key) {
              <li
                class="rounded-[12px] border px-3 py-2.5 transition-colors hover:border-[var(--aia-border-strong)]"
                [style.borderColor]="'var(--aia-border)'"
                [style.backgroundColor]="'var(--aia-bg-elev)'"
              >
                <span class="block text-[12px] leading-snug">{{ s.label }}</span>
                <span class="aia-index mt-1 block text-[11px]" [style.color]="'var(--aia-cyan)'">{{ s.time }}</span>
              </li>
            } @empty {
              <li
                class="rounded-[12px] border border-dashed px-3 py-2.5 text-center text-[11px]"
                [style.borderColor]="'var(--aia-border)'"
                [style.color]="'var(--aia-text-muted)'"
              >
                {{ 'schedule.closed' | translate }}
              </li>
            }
          </ul>
        </div>
      }
    </div>

    @if (showNote()) {
      <p class="mt-6 inline-flex items-center gap-2 text-xs" [style.color]="'var(--aia-text-muted)'">
        <aia-icon name="info" [size]="14" />
        {{ 'schedule.note' | translate }}
      </p>
    }
  `,
  styles: [`:host { display: block; }`]
})
export class ScheduleComponent {
  readonly showNote = input(true);

  readonly schedule = SCHEDULE;
  readonly today = todayIndex();
  /** Pe mobil pornim de la ziua curenta - e informatia cea mai probabil cautata. */
  readonly selected = signal(this.today);

  readonly selectedDay = computed(() => this.schedule.find((d) => d.index === this.selected()));
}

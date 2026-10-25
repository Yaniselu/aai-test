import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ACADEMY } from '../../core/academy.data';
import { ScheduleComponent } from '../../shared/components/schedule.component';
import { IconComponent } from '../../shared/icons/icon.component';

/** Programul saptamanal, in zona de sportiv. */
@Component({
  selector: 'aia-dashboard-schedule',
  standalone: true,
  imports: [ScheduleComponent, IconComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section>
      <p class="aia-eyebrow">{{ 'schedule.eyebrow' | translate }}</p>
      <h2 class="mt-3 font-display text-3xl lg:text-4xl">{{ 'schedule.title' | translate }}</h2>

      <div class="mt-8">
        <aia-schedule />
      </div>

      <div class="aia-card mt-8 flex flex-wrap items-center gap-4 p-5">
        <span [style.color]="'var(--aia-blood)'"><aia-icon name="pin" [size]="18" /></span>
        <span class="text-sm">
          {{ academy.address }}, {{ academy.postalCode }} {{ academy.city }}
        </span>
        <a
          class="aia-btn aia-btn-ghost ml-auto !px-4 !py-2 !text-[10px]"
          [href]="academy.whatsapp"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{{ 'contact.whatsapp' | translate }}</span>
        </a>
      </div>
    </section>
  `
})
export class SchedulePage {
  readonly academy = ACADEMY;
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchService } from '../../core/services/search.service';
import { MeshBackgroundComponent } from '../../shared/motion/mesh-background.component';
import { TranslatePipe } from '@ngx-translate/core';

/** 404 cu tematica de arte martiale: "ai ratat lovitura". */
@Component({
  selector: 'aia-not-found',
  standalone: true,
  imports: [RouterLink, MeshBackgroundComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative grid min-h-[calc(100vh-84px)] place-items-center overflow-hidden px-6 py-20">
      <aia-mesh-background class="opacity-60" />

      <div class="relative text-center">
        <p class="font-display text-[26vw] leading-[0.85] sm:text-[13rem]" aria-hidden="true">
          <span [style.color]="'var(--aia-blood)'">4</span>0<span [style.color]="'var(--aia-cyan)'">4</span>
        </p>

        <h1 class="mt-4 font-display text-3xl leading-tight sm:text-4xl">{{ 'notFound.title' | translate }}</h1>

        <p class="mx-auto mt-6 max-w-md text-base leading-relaxed" [style.color]="'var(--aia-text-muted)'">
          {{ 'notFound.text' | translate }}
        </p>

        <p class="mt-8 font-heading text-[11px] font-bold uppercase tracking-[0.24em]" [style.color]="'var(--aia-cyan)'">
          {{ quote() }}
        </p>

        <div class="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a routerLink="/" class="aia-btn aia-btn-primary"><span>{{ 'notFound.back' | translate }}</span></a>
          <button type="button" class="aia-btn aia-btn-ghost" (click)="search.open()">
            <span>{{ 'notFound.search' | translate }}</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class NotFoundPage {
  readonly search = inject(SearchService);

  private readonly quotes = [
    'Cazi de sapte ori, ridica-te de opt.',
    'Nu conteaza cat de tare lovesti, ci cat de tare poti fi lovit si mergi mai departe.',
    'Centura neagra este o centura alba care nu s-a oprit.',
    'Disciplina bate talentul cand talentul nu are disciplina.'
  ];

  // Alegem un citat la incarcarea paginii, nu la fiecare ciclu de randare.
  readonly quote = signal(this.quotes[Math.floor(Math.random() * this.quotes.length)]);
}

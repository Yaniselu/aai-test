import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../../shared/components/logo.component';
import { TranslatePipe } from '@ngx-translate/core';

/** Layout comun paginilor de autentificare: panou vizual + card de formular. */
@Component({
  selector: 'aia-auth-shell',
  standalone: true,
  imports: [RouterLink, LogoComponent, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grid min-h-[calc(100vh-84px)] lg:grid-cols-2">
      <!-- Panou vizual (ascuns pe mobil ca formularul sa fie imediat vizibil) -->
      <aside
        class="relative hidden overflow-hidden lg:block"
        style="background:
          repeating-linear-gradient(135deg, rgba(255,255,255,.02) 0 2px, transparent 2px 9px),
          var(--aia-bg-elev)"
        aria-hidden="true"
      >
        <div class="flex h-full flex-col justify-between p-14">
          <a routerLink="/"><aia-logo /></a>
          <div>
            <p class="font-display text-5xl leading-[1.06]">
              {{ 'auth.quote1' | translate }}<br />
              <span style="color: var(--aia-blood)">{{ 'auth.quote2' | translate }}</span><br />
              {{ 'auth.quote3' | translate }}
            </p>
            <p class="mt-8 text-xs tracking-[0.28em]" style="color: var(--aia-text-muted)">
              {{ 'auth.motto' | translate }}
            </p>
          </div>
        </div>
      </aside>

      <!-- Formular -->
      <div class="flex items-center justify-center px-6 py-16">
        <div class="w-full max-w-md">
          <p class="aia-eyebrow">{{ eyebrow() }}</p>
          <h1 class="mt-4 font-display text-4xl leading-tight">{{ title() }}</h1>
          <p class="mt-4 text-sm leading-relaxed" style="color: var(--aia-text-muted)">{{ subtitle() }}</p>

          <div class="mt-10">
            <ng-content />
          </div>
        </div>
      </div>
    </div>
  `
})
export class AuthShellComponent {
  readonly eyebrow = input('Cont');
  readonly title = input('AUTENTIFICARE');
  readonly subtitle = input('');
}

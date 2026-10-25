import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslatePipe } from '@ngx-translate/core';
import { ACADEMY } from '../../core/academy.data';
import { CopyButtonComponent } from '../../shared/components/ui-utilities';
import { IconComponent } from '../../shared/icons/icon.component';
import { RevealDirective } from '../../shared/motion/motion.directives';

/**
 * Contactul si harta.
 *
 * Harta este un embed Google Maps in vedere satelit, incarcat lazy: iframe-ul
 * apare abia cand sectiunea se apropie de viewport, ca sa nu coste ~1 MB de
 * resurse terte la fiecare deschidere a paginii principale.
 *
 * Embed-ul clasic nu are nevoie de cheie API, deci harta functioneaza imediat.
 */
@Component({
  selector: 'aia-locations-map',
  standalone: true,
  imports: [CopyButtonComponent, IconComponent, RevealDirective, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="locatii" class="scroll-mt-28 py-20 lg:py-32">
      <div class="aia-container">
        <p class="aia-eyebrow" aiaReveal>{{ 'contact.eyebrow' | translate }}</p>
        <h2 class="aia-section-title mt-5" aiaReveal>{{ 'contact.title' | translate }}</h2>

        <div class="mt-12 grid gap-5 lg:grid-cols-[380px_1fr]">
          <!-- Detalii de contact -->
          <div class="aia-card p-6 lg:p-8">
            <h3 class="font-display text-xl lg:text-2xl">{{ academy.name }}</h3>

            <ul class="mt-6 space-y-5">
              <li class="flex gap-4">
                <span class="mt-0.5 shrink-0" [style.color]="'var(--aia-blood)'">
                  <aia-icon name="pin" [size]="18" />
                </span>
                <span class="min-w-0">
                  <span class="block text-sm">{{ academy.address }}</span>
                  <span class="block text-sm" [style.color]="'var(--aia-text-muted)'">
                    {{ academy.postalCode }}, {{ academy.city }}
                  </span>
                  <span class="mt-3 block">
                    <aia-copy-button [value]="fullAddress" label="adresa" />
                  </span>
                </span>
              </li>

              <li class="flex gap-4">
                <span class="mt-0.5 shrink-0" [style.color]="'var(--aia-blood)'">
                  <aia-icon name="phone" [size]="18" />
                </span>
                <a [href]="'tel:' + academy.phoneHref" class="text-sm transition-colors hover:text-[var(--aia-cyan)]">
                  {{ academy.phone }}
                </a>
              </li>

              <li class="flex gap-4">
                <span class="mt-0.5 shrink-0" [style.color]="'var(--aia-blood)'">
                  <aia-icon name="mail" [size]="18" />
                </span>
                <a
                  [href]="'mailto:' + academy.email"
                  class="break-all text-sm transition-colors hover:text-[var(--aia-cyan)]"
                >
                  {{ academy.email }}
                </a>
              </li>

              <li class="flex gap-4">
                <span class="mt-0.5 shrink-0" [style.color]="'var(--aia-blood)'">
                  <aia-icon name="clock" [size]="18" />
                </span>
                <span class="text-sm" [style.color]="'var(--aia-text-muted)'">{{ academy.schedule }}</span>
              </li>
            </ul>

            <div class="mt-7 flex flex-col gap-2">
              <a
                class="aia-btn aia-btn-primary w-full"
                [href]="academy.whatsapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{{ 'contact.whatsapp' | translate }}</span>
              </a>
              <a
                class="aia-btn aia-btn-ghost w-full"
                [href]="directionsUrl"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>{{ 'contact.maps' | translate }}</span>
                <aia-icon name="arrow-right" [size]="15" />
              </a>
            </div>
          </div>

          <!-- Harta satelit -->
          <div
            #wrapper
            class="relative min-h-[340px] overflow-hidden rounded-[var(--aia-radius)] border sm:min-h-[420px]"
            [style.borderColor]="'var(--aia-border)'"
            [style.backgroundColor]="'var(--aia-bg-elev)'"
          >
            @if (showMap()) {
              <iframe
                [src]="embedUrl"
                class="absolute inset-0 h-full w-full"
                style="border: 0"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                [title]="academy.name + ' - ' + academy.city"
                allowfullscreen
              ></iframe>
            } @else {
              <button
                type="button"
                class="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center"
                (click)="showMap.set(true)"
              >
                <span [style.color]="'var(--aia-blood)'"><aia-icon name="pin" [size]="40" [strokeWidth]="1.3" /></span>
                <span class="font-display text-xl">{{ academy.city }}</span>
                <span class="text-sm" [style.color]="'var(--aia-text-muted)'">{{ fullAddress }}</span>
                <span class="aia-chip mt-2">{{ 'contact.maps' | translate }}</span>
              </button>
            }
          </div>
        </div>
      </div>
    </section>
  `
})
export class LocationsMapComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly academy = ACADEMY;
  /** Harta se randeaza abia la cerere sau cand sectiunea intra in viewport. */
  readonly showMap = signal(false);

  readonly fullAddress = `${ACADEMY.address}, ${ACADEMY.postalCode}, ${ACADEMY.city}`;

  readonly directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${ACADEMY.name}, ${ACADEMY.address}, ${ACADEMY.city}`
  )}`;

  /**
   * Embed clasic Google Maps, cu `t=k` pentru vedere satelit.
   * Nu necesita cheie API si nu incarca SDK-ul complet de Maps.
   */
  readonly embedUrl: SafeResourceUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    `https://www.google.com/maps?q=${ACADEMY.lat},${ACADEMY.lng}&z=17&t=k&output=embed&hl=ro`
  );

  constructor() {
    // Pe conexiuni bune incarcam harta din timp; pe "save-data" o lasam la cerere.
    const connection = (navigator as any).connection;
    if (!connection?.saveData) {
      this.observeViewport();
    }
  }

  private observeViewport(): void {
    queueMicrotask(() => {
      const section = document.getElementById('locatii');
      if (!section) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            observer.disconnect();
            this.showMap.set(true);
          }
        },
        { rootMargin: '400px' }
      );
      observer.observe(section);
    });
  }
}

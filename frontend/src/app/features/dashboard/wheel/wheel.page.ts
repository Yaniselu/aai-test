import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import gsap from 'gsap';
import { AcademyService } from '../../../core/services/academy.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { WheelPrize, WheelSpinResult, WheelStatus } from '../../../core/models/models';
import { IconComponent } from '../../../shared/icons/icon.component';
import { LoaderComponent } from '../../../shared/components/ui-utilities';
import { MagnetDirective } from '../../../shared/motion/motion.directives';

/**
 * "INVARTE-L PE BIRTU"
 * --------------------
 * Premiul e decis de server. Frontend-ul primeste `prizeId`, calculeaza
 * unghiul care aduce acel sector sub indicator si animeaza roata spre el.
 *
 * Desenul se face intr-un `effect` care depinde de canvas-ul din viewChild:
 * canvasul apare in DOM abia dupa ce se incarca statusul, deci orice desenare
 * programata mai devreme (microtask, setTimeout) rateaza elementul si roata
 * ramane goala.
 */
@Component({
  selector: 'aia-wheel',
  standalone: true,
  imports: [LoaderComponent, IconComponent, MagnetDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loading()) {
      <aia-loader label="Se pregateste roata" />
    } @else if (status(); as st) {
      <section class="flex flex-col items-center">
        <p class="aia-eyebrow">Bonus saptamanal</p>
        <h2 class="mt-5 text-center font-display text-4xl leading-[1.1] sm:text-5xl">
          Invarte-l<br />pe <span [style.color]="'var(--aia-blood)'">Birtu</span>
        </h2>

        <div class="mt-12 grid w-full max-w-4xl gap-12 lg:grid-cols-[1fr_260px] lg:items-center">
          <!-- Roata -->
          <div class="relative mx-auto">
            <!-- Indicatorul -->
            <div
              class="absolute left-1/2 top-[-10px] z-10 h-0 w-0 -translate-x-1/2"
              style="border-left: 13px solid transparent; border-right: 13px solid transparent; border-top: 26px solid var(--aia-blood)"
              aria-hidden="true"
            ></div>

            <div
              class="rounded-full p-[6px]"
              [style.border]="'1px solid var(--aia-border-strong)'"
              [style.backgroundColor]="'var(--aia-bg-elev)'"
            >
              <canvas
                #wheel
                width="760"
                height="760"
                class="block h-[min(80vw,400px)] w-[min(80vw,400px)] rounded-full"
                role="img"
                [attr.aria-label]="'Roata cu premii: ' + prizeNames()"
              ></canvas>
            </div>

            <!-- Butonul central -->
            <button
              type="button"
              aiaMagnet
              [magnetStrength]="0.18"
              class="absolute left-1/2 top-1/2 grid h-[23%] w-[23%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 font-display text-base transition-colors duration-300 disabled:cursor-not-allowed"
              [style.borderColor]="canSpin() ? 'var(--aia-blood)' : 'var(--aia-border-strong)'"
              [style.backgroundColor]="canSpin() ? 'var(--aia-blood)' : 'var(--aia-bg-elev-2)'"
              [style.color]="canSpin() ? '#fff' : 'var(--aia-text-muted)'"
              [disabled]="!canSpin() || spinning()"
              (click)="spin()"
            >
              @if (spinning()) {
                <span class="text-xs tracking-widest">...</span>
              } @else {
                <aia-icon name="wheel" [size]="26" />
              }
            </button>
          </div>

          <!-- Legenda cu sanse reale -->
          <div>
            <p class="font-heading text-[11px] uppercase tracking-[0.2em]" [style.color]="'var(--aia-text-muted)'">
              Premii si sanse
            </p>
            <ul class="mt-4 space-y-2.5">
              @for (prize of st.prizes; track prize.id) {
                <li class="aia-card-flat flex items-center gap-3 px-4 py-2.5 text-sm">
                  <span class="h-2.5 w-2.5 shrink-0 rounded-full" [style.backgroundColor]="prize.color" aria-hidden="true"></span>
                  <span class="flex-1 truncate">{{ prize.label }}</span>
                  <span class="aia-index shrink-0 text-xs" [style.color]="'var(--aia-text-muted)'">
                    {{ prize.chancePercent }}%
                  </span>
                </li>
              }
            </ul>
          </div>
        </div>

        <!-- Stare / rezultat -->
        <div class="mt-12 min-h-[130px] w-full max-w-lg text-center">
          @if (result(); as res) {
            <div style="animation: aia-prize-in .55s cubic-bezier(.16,1,.3,1)">
              <p class="aia-eyebrow justify-center">
                {{ res.grantsExtraSpin ? 'Ai noroc' : res.xpAwarded > 0 ? 'Ai castigat' : 'Rezultat' }}
              </p>
              <p class="mt-4 font-display text-4xl" [style.color]="res.xpAwarded > 0 || res.grantsExtraSpin ? 'var(--aia-blood)' : null">
                {{ res.prizeLabel }}
              </p>
              <p class="mt-3 text-sm leading-relaxed" [style.color]="'var(--aia-text-muted)'">{{ res.outcome }}</p>

              @if (res.grantsExtraSpin) {
                <button type="button" class="aia-btn aia-btn-primary mt-6" (click)="againNow()">
                  <span>Invarte din nou</span>
                  <aia-icon name="refresh" [size]="16" />
                </button>
              }
            </div>
          } @else if (!st.canSpin) {
            <p class="font-heading text-[11px] uppercase tracking-[0.2em]" [style.color]="'var(--aia-text-muted)'">
              Urmatoarea invartire
            </p>
            <p class="mt-4 font-display text-3xl">{{ countdown() }}</p>
            @if (st.lastPrizeLabel) {
              <p class="mt-3 text-sm" [style.color]="'var(--aia-text-muted)'">
                Ultimul premiu: {{ st.lastPrizeLabel }}
              </p>
            }
          } @else {
            <p class="font-heading text-[11px] uppercase tracking-[0.2em]" [style.color]="'var(--aia-text-muted)'">
              Ai o invartire disponibila
            </p>
            <p class="mt-3 text-sm" [style.color]="'var(--aia-text-muted)'">
              O invartire pe saptamana. Premiile fizice se ridica de la receptie.
            </p>
          }
        </div>
      </section>
    }
  `,
  styles: [
    `
      @keyframes aia-prize-in {
        from { opacity: 0; transform: translateY(14px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `
  ]
})
export class WheelPage {
  private readonly academy = inject(AcademyService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('wheel');

  readonly status = signal<WheelStatus | null>(null);
  readonly loading = signal(true);
  readonly spinning = signal(false);
  readonly result = signal<WheelSpinResult | null>(null);
  readonly now = signal(Date.now());

  /** Unghiul curent al roții, în grade. Persistă între învârtiri. */
  private rotation = 0;
  private drawn = false;

  readonly canSpin = computed(() => this.status()?.canSpin === true && !this.result());

  readonly prizeNames = computed(() => (this.status()?.prizes ?? []).map((p) => p.label).join(', '));

  readonly countdown = computed(() => {
    const next = this.status()?.nextSpinAvailableAt;
    if (!next) return '—';
    const diff = new Date(next).getTime() - this.now();
    if (diff <= 0) return 'Disponibila acum';

    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    return days > 0 ? `${days}z ${hours}h` : `${hours}h ${minutes}m`;
  });

  constructor() {
    this.academy.wheelStatus().subscribe({
      next: (status) => {
        this.status.set(status);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });

    // Se re-execută când canvasul apare efectiv în DOM.
    effect(() => {
      const canvas = this.canvasRef()?.nativeElement;
      const prizes = this.status()?.prizes;
      if (!canvas || !prizes?.length || this.drawn) return;

      this.drawn = true;
      // Fonturile web încă nu sunt garantat gata; canvasul ar desena cu
      // fallback-ul de sistem și literele ar sări la reîncărcare.
      void document.fonts?.ready.then(() => this.draw(canvas, prizes));
      this.draw(canvas, prizes);
    });

    setInterval(() => this.now.set(Date.now()), 60_000);
  }

  spin(): void {
    const prizes = this.status()?.prizes ?? [];
    if (!prizes.length || this.spinning()) return;

    this.spinning.set(true);

    this.academy.spinWheel().subscribe({
      next: (res) => {
        const index = prizes.findIndex((p) => p.id === res.prizeId);
        this.animateTo(index >= 0 ? index : 0, prizes.length, () => {
          this.spinning.set(false);
          this.result.set(res);

          this.status.update((s) =>
            s
              ? {
                  ...s,
                  canSpin: res.grantsExtraSpin,
                  nextSpinAvailableAt: res.nextSpinAvailableAt,
                  lastPrizeLabel: res.prizeLabel
                }
              : s
          );

          if (res.xpAwarded > 0) {
            const user = this.auth.user();
            this.auth.patchUser({ xpPoints: (user?.xpPoints ?? 0) + res.xpAwarded });
          }
          if (res.absenceForgiven) {
            const user = this.auth.user();
            this.auth.patchUser({ absencesCount: Math.max(0, (user?.absencesCount ?? 0) - 1) });
          }

          if (res.grantsExtraSpin) {
            this.toast.info('Mai ai o invartire', res.outcome);
          } else if (res.xpAwarded > 0 || res.absenceForgiven) {
            this.toast.success(res.prizeLabel, res.outcome);
          } else {
            this.toast.info(res.prizeLabel, res.outcome);
          }
        });
      },
      error: (err) => {
        this.spinning.set(false);
        if (err.status === 429) {
          this.toast.warning('Prea devreme', 'Ai folosit deja invartirea din aceasta saptamana.');
        }
      }
    });
  }

  /** Curăță rezultatul ca butonul central să redevină activ. */
  againNow(): void {
    this.result.set(null);
  }

  private animateTo(index: number, total: number, done: () => void): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) {
      done();
      return;
    }

    const sector = 360 / total;
    // Indicatorul e la 270° în sistemul canvas (unghiul 0 pornește la ora 3).
    const targetCenter = index * sector + sector / 2;
    const current = this.rotation % 360;
    const final = this.rotation + (6 * 360) + (270 - targetCenter) - current;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      this.rotation = final;
      canvas.style.transform = `rotate(${final}deg)`;
      done();
      return;
    }

    const state = { deg: this.rotation };
    gsap.to(state, {
      deg: final,
      duration: 5,
      ease: 'power4.out',
      onUpdate: () => {
        canvas.style.transform = `rotate(${state.deg}deg)`;
      },
      onComplete: () => {
        this.rotation = final;
        done();
      }
    });
  }

  /**
   * Desenează sectoarele și etichetele.
   * Textul e scris pe rază, aliniat la dreapta spre marginea roții, cu o
   * umbră de contur ca să rămână lizibil peste orice culoare de sector.
   */
  private draw(canvas: HTMLCanvasElement, prizes: WheelPrize[]): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 4;
    const sector = (Math.PI * 2) / prizes.length;

    ctx.clearRect(0, 0, size, size);

    prizes.forEach((prize, i) => {
      const start = i * sector;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, start, start + sector);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.14)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

    // Etichetele într-o a doua trecere: altfel conturul unui sector vecin
    // desenat ulterior ar tăia textul deja scris.
    prizes.forEach((prize, i) => {
      const start = i * sector;

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(start + sector / 2);

      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.font = '600 34px Oswald, system-ui, sans-serif';

      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(0,0,0,.55)';
      ctx.strokeText(prize.label.toUpperCase(), radius - 34, 0);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(prize.label.toUpperCase(), radius - 34, 0);

      ctx.restore();
    });

    // Discul central, ca butonul să nu pară lipit peste desen.
    ctx.beginPath();
    ctx.arc(center, center, radius * 0.16, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0a';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.16)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

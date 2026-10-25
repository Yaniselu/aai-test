import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import gsap from 'gsap';
import { ACADEMY } from '../../core/academy.data';
import { AnimationService } from '../../core/services/animation.service';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { PhoneMockupComponent } from '../../shared/components/phone-mockup.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { CountUpComponent } from '../../shared/motion/motion.components';
import { RevealDirective } from '../../shared/motion/motion.directives';

interface MediaItem {
  id: number;
  category: 'competitions' | 'training' | 'performance';
  ui: 'reel' | 'story';
  caption: string;
  likes: number;
  comments: number;
  ago: string;
  image?: string;
  video?: string;
  poster?: string;
}

/**
 * Sectiunea media, gandita ca un "teatru de telefoane":
 *
 *  1. Scena fixata (pin): cinci telefoane urca din jos intr-un pachet, se
 *     desfac in evantai, apoi se aliniaza intr-un coverflow 3D, totul legat
 *     de scroll. In jur apar notificari de sticla si statisticile comunitatii.
 *  2. Caruselul: un sir de telefoane care se trage cu mouse-ul / degetul,
 *     cu inertie; fiecare telefon se roteste in functie de distanta fata de
 *     centru. Filtrele de categorie raman.
 *  3. Lightbox: click pe un telefon il aduce in prim-plan, cu navigare din
 *     sageti, tastatura sau swipe.
 */
@Component({
  selector: 'aia-media-showcase',
  standalone: true,
  imports: [TranslatePipe, PhoneMockupComponent, IconComponent, CountUpComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section id="galerie" class="scroll-mt-0">
      <!-- ═════════ 1. Teatrul fixat ═════════ -->
      <div #theatre class="theatre relative h-[100svh] min-h-[640px] overflow-hidden">
        <div #bigword class="bigword pointer-events-none absolute inset-0 grid place-items-center" aria-hidden="true">
          <span class="font-display aia-text-outline-red whitespace-nowrap text-[30vw] leading-none lg:text-[24vw]">MEDIA</span>
        </div>

        <div #intro class="t-intro aia-container relative z-20 pt-24 lg:pt-28">
          <p class="aia-eyebrow">{{ 'media.eyebrow' | translate }}</p>
          <h2 class="mt-4 max-w-4xl font-display text-[12vw] leading-[0.88] sm:text-[7vw] lg:text-[5.6rem]">
            <span class="aia-glitch" [attr.data-text]="'media.title' | translate">{{ 'media.title' | translate }}</span>
          </h2>
          <p class="mt-4 max-w-md text-sm leading-relaxed sm:text-[15px]" [style.color]="'var(--aia-text-muted)'">
            {{ 'media.subtitle' | translate }}
          </p>
        </div>

        <div class="deck absolute inset-0 z-10" style="perspective: 1600px">
          @for (p of theatrePhones; track p.id; let i = $index) {
            <div class="t-phone" [attr.data-i]="i">
              <aia-phone
                class="phone-w"
                [video]="p.video ?? null"
                [image]="p.image ?? null"
                [poster]="p.poster ?? ''"
                [ui]="p.ui"
                [caption]="p.caption"
                [baseLikes]="p.likes"
                [comments]="p.comments"
                [ago]="p.ago"
                [active]="i === 2"
              />
            </div>
          }
        </div>

        <!-- Notificari de sticla -->
        <div class="notif aia-glass n1" aria-hidden="true">
          <span class="ico" style="background: linear-gradient(135deg,#ff1f3d,#ff6a7a)"><aia-icon name="heart" [size]="14" /></span>
          <span><b>maria.p</b> {{ 'media.notifLike' | translate }}<small>acum</small></span>
        </div>
        <div class="notif aia-glass n2" aria-hidden="true">
          <span class="ico" style="background: linear-gradient(135deg,#ff1f3d,#ff6a7a)"><aia-icon name="medal" [size]="14" /></span>
          <span><b>{{ 'media.notifMedal' | translate }}</b><small>Craiova · 2025</small></span>
        </div>
        <div class="notif aia-glass n3" aria-hidden="true">
          <span class="ico" style="background: linear-gradient(135deg,#7a0010,#ffffff)"><aia-icon name="play" [size]="13" /></span>
          <span><b>{{ 'media.notifNew' | translate }}</b><small>KickBox Copii</small></span>
        </div>
        <div class="notif aia-glass n4" aria-hidden="true">
          <span class="ico" style="background: linear-gradient(135deg,#1a1a1a,#ffffff)"><aia-icon name="users" [size]="14" /></span>
          <span><b>+48</b> {{ 'media.notifFollow' | translate }}<small>săptămâna asta</small></span>
        </div>

        <div #stats class="t-stats absolute inset-x-0 bottom-6 z-20 lg:bottom-10">
          <div class="aia-container flex justify-center">
            <dl class="aia-glass grid grid-cols-3 gap-2 rounded-[26px] px-4 py-3 sm:gap-8 sm:px-8 sm:py-4">
              @for (s of mediaStats; track s.key) {
                <div class="text-center">
                  <dd class="font-display text-lg text-[var(--aia-blood-bright)] sm:text-2xl">
                    <aia-count-up [value]="s.value" [suffix]="s.suffix" />
                  </dd>
                  <dt class="mt-1 text-[9px] uppercase tracking-[0.14em] sm:text-[10px]" [style.color]="'var(--aia-text-muted)'">
                    {{ s.key | translate }}
                  </dt>
                </div>
              }
            </dl>
          </div>
        </div>
      </div>

      <!-- ═════════ 2. Caruselul de telefoane ═════════ -->
      <div class="relative py-16 lg:py-24">
        <div class="aia-container flex flex-wrap items-end justify-between gap-5">
          <div class="flex flex-wrap gap-2" aiaReveal>
            @for (filter of filters; track filter) {
              <button
                type="button"
                class="aia-chip"
                [style.borderColor]="activeFilter() === filter ? 'var(--aia-blood)' : 'var(--aia-border)'"
                [style.color]="activeFilter() === filter ? 'var(--aia-text)' : 'var(--aia-text-muted)'"
                [style.boxShadow]="activeFilter() === filter ? '0 0 24px -6px var(--aia-blood), inset 0 1px 0 var(--lg-inner)' : null"
                (click)="setFilter(filter)"
              >
                {{ 'gallery.' + filter | translate }}
              </button>
            }
          </div>

          <div class="flex items-center gap-3" aiaReveal>
            <span class="hidden items-center gap-2 text-xs sm:inline-flex" [style.color]="'var(--aia-text-muted)'">
              <aia-icon name="drag" [size]="14" /> {{ 'media.hint' | translate }}
            </span>
            <button type="button" class="aia-btn aia-btn-ghost h-12 w-12 !px-0" (click)="nudge(-1)" [attr.aria-label]="'media.prev' | translate">
              <aia-icon name="chevron-left" [size]="18" />
            </button>
            <button type="button" class="aia-btn aia-btn-ghost h-12 w-12 !px-0" (click)="nudge(1)" [attr.aria-label]="'media.next' | translate">
              <aia-icon name="chevron-right" [size]="18" />
            </button>
          </div>
        </div>

        <div
          #viewport
          class="reel-viewport relative mt-10 select-none overflow-hidden py-10"
          [attr.data-cursor]="'media.drag' | translate"
          (pointerdown)="onDown($event)"
          (wheel)="onWheel($event)"
          style="perspective: 1400px; touch-action: pan-y"
        >
          <div #track class="reel-track flex w-max gap-5 sm:gap-8" style="transform-style: preserve-3d">
            @for (item of visible(); track item.id; let i = $index) {
              <div class="reel-item" [attr.data-index]="i">
                <aia-phone
                  class="reel-phone"
                  [video]="item.video ?? null"
                  [image]="item.image ?? null"
                  [poster]="item.poster ?? ''"
                  [ui]="item.ui"
                  [caption]="item.caption"
                  [baseLikes]="item.likes"
                  [comments]="item.comments"
                  [ago]="item.ago"
                />
                <button type="button" class="open-btn aia-chip" (click)="open(i)" [attr.aria-label]="('media.open' | translate) + ' ' + item.caption">
                  <aia-icon name="plus" [size]="12" /> {{ 'media.open' | translate }}
                </button>
              </div>
            }
          </div>
        </div>

        <!-- Indicator de progres al caruselului -->
        <div class="aia-container mt-4">
          <div class="mx-auto h-[3px] max-w-xs overflow-hidden rounded-full" [style.backgroundColor]="'var(--aia-border)'">
            <div #bar class="h-full origin-left rounded-full" style="background: linear-gradient(90deg, var(--aia-blood), var(--aia-violet), var(--aia-cyan)); transform: scaleX(0)"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═════════ 3. Lightbox ═════════ -->
    @if (lightbox() !== null) {
      <div
        class="lb fixed inset-0 z-[180] flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="current()?.caption"
        (click)="bgClick()"
        (pointerdown)="lbDown($event)"
        (pointerup)="lbUp($event)"
      >
        <div class="lb-bg absolute inset-0" aria-hidden="true">
          @if (current()?.image || current()?.poster) {
            <img [src]="current()?.image ?? current()?.poster" alt="" class="h-full w-full scale-125 object-cover opacity-50 blur-3xl" />
          }
        </div>

        <button type="button" class="aia-btn aia-btn-ghost absolute right-5 top-5 z-10 h-12 w-12 !px-0" (click)="close()" [attr.aria-label]="'media.close' | translate">
          <aia-icon name="close" [size]="18" />
        </button>

        <button type="button" class="aia-btn aia-btn-ghost absolute left-3 top-1/2 z-10 h-14 w-14 -translate-y-1/2 !px-0 sm:left-8" (click)="step(-1); $event.stopPropagation()" [attr.aria-label]="'media.prev' | translate">
          <aia-icon name="chevron-left" [size]="20" />
        </button>
        <button type="button" class="aia-btn aia-btn-ghost absolute right-3 top-1/2 z-10 h-14 w-14 -translate-y-1/2 !px-0 sm:right-8" (click)="step(1); $event.stopPropagation()" [attr.aria-label]="'media.next' | translate">
          <aia-icon name="chevron-right" [size]="20" />
        </button>

        @for (item of lbList(); track item.id) {
          <div class="lb-phone relative" (click)="$event.stopPropagation()">
            <aia-phone
              class="lb-phone-w"
              [video]="item.video ?? null"
              [image]="item.image ?? null"
              [poster]="item.poster ?? ''"
              [ui]="item.ui"
              [caption]="item.caption"
              [baseLikes]="item.likes"
              [comments]="item.comments"
              [ago]="item.ago"
              [active]="true"
            />
          </div>
        }

        <div class="aia-glass absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-3 rounded-full px-5 py-2.5 text-xs">
          <span class="aia-index" [style.color]="'var(--aia-cyan)'">{{ (lightbox() ?? 0) + 1 }} / {{ visible().length }}</span>
          <span class="max-w-[50vw] truncate" [style.color]="'var(--aia-text-muted)'">{{ current()?.caption }}</span>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host { display: block; }

      .phone-w { width: min(40vw, 23svh); pointer-events: auto; }
      @media (min-width: 768px) { .phone-w { width: min(16vw, 22svh); } }

      /* Fiecare telefon sta centrat intr-un strat cat scena. Fara translate(-50%)
         in CSS: GSAP l-ar contopi in x si centrarea s-ar pierde la primul tween. */
      .t-phone {
        position: absolute;
        inset: 16% 0 0 0;
        display: grid;
        place-items: center;
        pointer-events: none;
        transform-style: preserve-3d;
        will-change: transform;
      }
      @media (min-width: 768px) { .t-phone { inset: 12% 0 0 0; } }

      .notif {
        position: absolute;
        z-index: 15;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px 10px 10px;
        border-radius: 20px;
        font-size: 12px;
        line-height: 1.25;
        max-width: 250px;
      }
      .notif b { font-weight: 600; }
      .notif small { display: block; opacity: 0.6; font-size: 10px; margin-top: 2px; }
      .notif .ico {
        display: grid;
        place-items: center;
        width: 32px;
        height: 32px;
        flex-shrink: 0;
        border-radius: 11px;
        color: #fff;
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.5);
      }
      .n1 { left: 6%; top: 40%; }
      .n2 { right: 6%; top: 30%; }
      .n3 { left: 10%; bottom: 20%; }
      .n4 { right: 9%; bottom: 24%; }
      @media (max-width: 767px) {
        .notif { font-size: 10px; max-width: 170px; padding: 7px 10px 7px 7px; }
        .notif .ico { width: 24px; height: 24px; border-radius: 8px; }
        .n1 { left: 3%; top: auto; bottom: 22%; }
        .n2 { right: 3%; top: auto; bottom: 34%; }
        .n3, .n4 { display: none; }
      }

      /* Track-ul e un plan 3D: telefoanele impinse in spate (translateZ negativ) ar
         ajunge "sub" el la hit-testing. Il scoatem din hit-testing, telefoanele raman. */
      .reel-track { pointer-events: none; }
      .reel-item {
        pointer-events: auto;
        position: relative;
        flex-shrink: 0;
        will-change: transform;
        transform-style: preserve-3d;
      }
      .reel-phone { width: clamp(170px, 46vw, 210px); pointer-events: auto; }
      @media (min-width: 1024px) { .reel-phone { width: clamp(200px, 17vw, 250px); } }
      .reel-viewport { cursor: grab; }
      .reel-viewport.dragging { cursor: grabbing; }
      .reel-viewport.dragging aia-phone { pointer-events: none; }

      .open-btn {
        position: absolute;
        left: 50%;
        bottom: -18px;
        transform: translateX(-50%) translateY(8px);
        opacity: 0;
        transition: opacity 0.35s, transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        color: var(--aia-text) !important;
      }
      .reel-item:hover .open-btn,
      .open-btn:focus-visible { opacity: 1; transform: translateX(-50%) translateY(0); }
      @media (hover: none) { .open-btn { opacity: 1; transform: translateX(-50%); } }

      .lb {
        -webkit-backdrop-filter: blur(30px) saturate(160%);
        backdrop-filter: blur(30px) saturate(160%);
        background: rgba(4, 4, 10, 0.55);
        animation: lb-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .lb-phone { animation: lb-phone-in 0.9s cubic-bezier(0.16, 1, 0.3, 1); perspective: 1200px; }
      .lb-phone-w { width: min(78vw, calc(80svh * 9 / 19.3)); }
      @keyframes lb-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes lb-phone-in {
        from { opacity: 0; transform: translateY(80px) scale(0.7) rotateX(25deg) rotateY(-20deg); filter: blur(12px); }
        to { opacity: 1; transform: none; filter: blur(0); }
      }
    `
  ]
})
export class MediaShowcaseComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly anim = inject(AnimationService);
  private readonly scroller = inject(SmoothScrollService);

  private readonly theatre = viewChild.required<ElementRef<HTMLElement>>('theatre');
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly bar = viewChild.required<ElementRef<HTMLElement>>('bar');

  readonly filters = ['all', 'competitions', 'training', 'performance'] as const;
  readonly activeFilter = signal<string>('all');
  readonly lightbox = signal<number | null>(null);

  readonly mediaStats = [
    { value: 340, suffix: '+', key: 'media.stat1' },
    { value: 120, suffix: 'K', key: 'media.stat2' },
    { value: 290, suffix: '+', key: 'media.stat3' }
  ];

  private readonly items: MediaItem[] = [
    { id: 1, category: 'training', ui: 'reel', caption: 'Antrenament de seară · combinații la sac', likes: 2310, comments: 142, ago: '1h', video: 'media/karate-video2.mp4', poster: 'media/karate-video2-poster.webp' },
    { id: 2, category: 'competitions', ui: 'story', caption: 'Ziua competiției · echipa e gata', likes: 1840, comments: 96, ago: '3h', image: ACADEMY.photos.competition },
    { id: 3, category: 'training', ui: 'reel', caption: 'Tehnică, viteză, control', likes: 980, comments: 41, ago: '5h', image: ACADEMY.photos.training },
    { id: 4, category: 'performance', ui: 'reel', caption: 'Echipa academiei · mândri de fiecare sportiv', likes: 3120, comments: 210, ago: '1z', image: ACADEMY.photos.team },
    { id: 5, category: 'training', ui: 'reel', caption: 'Karate · kata înainte de turneu', likes: 1560, comments: 77, ago: '1z', video: 'media/karate-video1.mp4', poster: 'media/karate-video1-poster.webp' },
    { id: 6, category: 'performance', ui: 'story', caption: 'Grupa de karate · nivel avansat', likes: 1205, comments: 58, ago: '2z', image: ACADEMY.photos.karate },
    { id: 7, category: 'competitions', ui: 'reel', caption: 'Cei mici, primul lor turneu', likes: 4280, comments: 305, ago: '3z', image: ACADEMY.photos.kids },
    { id: 8, category: 'training', ui: 'story', caption: 'KickBox adulți · forță și rezistență', likes: 890, comments: 34, ago: '4z', image: ACADEMY.photos.adults }
  ];

  /** Cele cinci telefoane din scena fixata. */
  readonly theatrePhones = [this.items[1], this.items[2], this.items[0], this.items[3], this.items[6]];

  readonly visible = computed(() => {
    const f = this.activeFilter();
    return f === 'all' ? this.items : this.items.filter((i) => i.category === f);
  });

  readonly current = computed(() => {
    const i = this.lightbox();
    return i === null ? null : this.visible()[i] ?? null;
  });

  /** Lista cu un singur element: schimbarea lui re-creeaza telefonul, deci reporneste animatia de intrare. */
  readonly lbList = computed(() => (this.current() ? [this.current()!] : []));

  private ctx?: gsap.Context;
  private raf?: number;
  private readonly reel = { recenter: true, target: 0, current: 0, max: 0, velocity: 0, dragging: false, startX: 0, startTarget: 0, moved: 0, lastX: 0 };
  private resizeObs?: ResizeObserver;
  private lbStartX = 0;
  private lbSwiped = false;

  constructor() {
    // Re-masuram caruselul cand se schimba filtrul (alt numar de telefoane).
    effect(() => {
      this.visible();
      requestAnimationFrame(() => this.measure());
    });
  }

  ngAfterViewInit(): void {
    this.buildTheatre();
    this.startReel();
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    if (this.raf) cancelAnimationFrame(this.raf);
    this.resizeObs?.disconnect();
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);
    if (this.lightbox() !== null) this.scroller.start();
  }

  // ------------------------------------------------------------ teatrul
  private buildTheatre(): void {
    if (this.anim.reducedMotion) return;
    const root = this.theatre().nativeElement;

    this.ctx = gsap.context(() => {
      const phones = gsap.utils.toArray<HTMLElement>('.t-phone', root);
      const mid = (phones.length - 1) / 2;
      const mobile = window.innerWidth < 768;
      // Pe mobil telefoanele sunt mult mai late fata de ecran: evantaiul se
      // strange, iar coverflow-ul se rasfira peste margini.
      const fan = mobile ? 1.1 : 1;
      const flow = mobile ? 2.1 : 1;

      // Scena nu porneste goala: pachetul e deja vizibil in partea de jos,
      // aplecat spre camera, iar scroll-ul il ridica.
      gsap.set(phones, {
        y: '38vh',
        rotateX: 40,
        rotateZ: (i) => (i - mid) * 3,
        opacity: 1
      });
      gsap.set('.notif', { scale: 0, opacity: 0 });
      gsap.set('.t-stats', { y: 60, opacity: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: mobile ? '+=180%' : '+=260%',
          pin: true,
          scrub: 1,
          anticipatePin: 1
        }
      });

      // 1. Pachetul urca din jos
      tl.to(phones, { y: 0, rotateX: 0, opacity: 1, stagger: 0.06, duration: 1, ease: 'power3.out' })
        .fromTo('.bigword span', { scale: 1.5, opacity: 0.35 }, { scale: 1, opacity: 1, duration: 1.2 }, 0)

        // 2. Evantai
        .to(phones, {
          x: (i) => `${(i - mid) * 9 * fan}vw`,
          y: (i) => `${Math.abs(i - mid) * 4}vh`,
          rotateZ: (i) => (i - mid) * 9,
          duration: 1
        })
        .to('.n1, .n2', { scale: 1, opacity: 1, stagger: 0.15, ease: 'back.out(2)', duration: 0.5 }, '<0.3')

        // 3. Coverflow 3D
        .to(phones, {
          x: (i) => `${(i - mid) * 19 * flow}vw`,
          y: 0,
          z: (i) => -Math.abs(i - mid) * 160,
          rotateZ: 0,
          rotateY: (i) => -(i - mid) * 24,
          scale: (i) => (i === mid ? 1.14 : 0.92),
          duration: 1.2
        })
        .to('.bigword span', { scale: 0.85, xPercent: -8, duration: 1.2 }, '<')
        .to('.n3, .n4', { scale: 1, opacity: 1, stagger: 0.15, ease: 'back.out(2)', duration: 0.5 }, '<0.4')
        .to('.t-stats', { y: 0, opacity: 1, duration: 0.6 }, '<0.2')
        .to('.t-intro', { y: -30, opacity: 0.25, duration: 0.8 }, '<')

        // 4. Mica respiratie la final, ca scena sa nu se rupa brusc
        .to(phones, { rotateY: (i) => -(i - mid) * 18, duration: 0.6, ease: 'none' });

      // Notificarile plutesc permanent, independent de scroll.
      gsap.utils.toArray<HTMLElement>('.notif', root).forEach((n, i) => {
        gsap.to(n, { y: i % 2 ? 14 : -14, duration: 2.4 + i * 0.3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      });
    }, this.host.nativeElement);
  }

  // ------------------------------------------------------------ caruselul
  private startReel(): void {
    this.resizeObs = new ResizeObserver(() => this.measure());
    this.resizeObs.observe(this.viewport().nativeElement);

    const loop = () => {
      const r = this.reel;
      if (!r.dragging) {
        r.target += r.velocity;
        r.velocity *= 0.92;
        if (Math.abs(r.velocity) < 0.05) r.velocity = 0;
      }
      r.target = Math.max(-80, Math.min(r.max + 80, r.target));
      // Elastic la capete: se intoarce in interval cand utilizatorul da drumul.
      if (!r.dragging) {
        if (r.target < 0) r.target += (0 - r.target) * 0.15;
        if (r.target > r.max) r.target += (r.max - r.target) * 0.15;
      }
      const prev = r.current;
      r.current += (r.target - r.current) * (this.anim.reducedMotion ? 1 : 0.1);
      const speed = r.current - prev;

      this.render(speed);
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  private measure(): void {
    const vp = this.viewport()?.nativeElement;
    const track = this.track()?.nativeElement;
    if (!vp || !track) return;
    // Padding lateral = jumatate de viewport minus jumatate de telefon, ca primul si
    // ultimul telefon sa poata ajunge in centru (unde rotatia e zero).
    const first = track.querySelector<HTMLElement>('.reel-item');
    const itemW = first?.offsetWidth ?? 220;
    const pad = Math.max(vp.clientWidth / 2 - itemW / 2, 16);
    track.style.paddingLeft = `${pad}px`;
    track.style.paddingRight = `${pad}px`;
    this.reel.max = Math.max(track.scrollWidth - vp.clientWidth, 0);
    // Pornim cu telefonul din mijloc centrat, ca ambele laturi sa fie pline.
    if (this.reel.recenter) {
      this.reel.recenter = false;
      const n = track.children.length;
      const step = itemW + (parseFloat(getComputedStyle(track).columnGap) || 0);
      this.reel.target = this.reel.current = Math.min(Math.floor((n - 1) / 2) * step, this.reel.max);
    }
    this.reel.target = Math.min(this.reel.target, this.reel.max);
  }

  private render(speed: number): void {
    const vp = this.viewport()?.nativeElement;
    const track = this.track()?.nativeElement;
    if (!vp || !track) return;

    track.style.transform = `translate3d(${-this.reel.current}px, 0, 0)`;
    const center = vp.getBoundingClientRect().left + vp.clientWidth / 2;
    const half = vp.clientWidth / 2;
    const skew = Math.max(-12, Math.min(12, speed * 0.5));

    for (const item of Array.from(track.children) as HTMLElement[]) {
      const rect = item.getBoundingClientRect();
      const d = Math.max(-1.6, Math.min(1.6, (rect.left + rect.width / 2 - center) / half));
      const ad = Math.abs(d);
      if (this.anim.reducedMotion) continue;
      item.style.transform =
        `translateZ(${-ad * 140}px) rotateY(${-d * 32}deg) skewX(${-skew}deg) scale(${1 - Math.min(ad, 1) * 0.1})`;
      item.style.opacity = String(1 - Math.min(ad, 1.4) * 0.4);
      item.style.zIndex = String(100 - Math.round(ad * 10));
    }

    const progress = this.reel.max ? this.reel.current / this.reel.max : 0;
    this.bar().nativeElement.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
  }

  onDown(e: PointerEvent): void {
    if ((e.target as HTMLElement).closest('button')) return;
    const r = this.reel;
    r.dragging = true;
    r.startX = e.clientX;
    r.lastX = e.clientX;
    r.startTarget = r.target;
    r.moved = 0;
    r.velocity = 0;
    window.addEventListener('pointermove', this.onMove);
    window.addEventListener('pointerup', this.onUp);
  }

  private readonly onMove = (e: PointerEvent) => {
    const r = this.reel;
    const dx = e.clientX - r.startX;
    r.moved = Math.max(r.moved, Math.abs(dx));
    if (r.moved > 6) this.viewport().nativeElement.classList.add('dragging');
    r.target = r.startTarget - dx * 1.2;
    r.velocity = -(e.clientX - r.lastX) * 1.2;
    r.lastX = e.clientX;
  };

  private readonly onUp = (e: PointerEvent) => {
    const r = this.reel;
    r.dragging = false;
    this.viewport().nativeElement.classList.remove('dragging');
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerup', this.onUp);

    // Un click fara tragere deschide telefonul de sub cursor.
    if (r.moved < 6) {
      const item = (e.target as HTMLElement).closest<HTMLElement>('.reel-item');
      if (item?.dataset['index']) this.open(Number(item.dataset['index']));
    }
  };

  onWheel(e: WheelEvent): void {
    // Doar scroll-ul orizontal (trackpad / shift) misca caruselul; cel vertical ramane al paginii.
    const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
    if (!dx) return;
    e.preventDefault();
    this.reel.target += dx;
  }

  nudge(dir: number): void {
    const first = this.track().nativeElement.querySelector<HTMLElement>('.reel-item');
    const step = (first?.offsetWidth ?? 220) + 32;
    this.reel.velocity = 0;
    this.reel.target = Math.round((this.reel.target + dir * step) / step) * step;
  }

  setFilter(f: string): void {
    this.activeFilter.set(f);
    this.reel.recenter = true;
    this.reel.velocity = 0;
  }

  // ------------------------------------------------------------ lightbox
  open(i: number): void {
    this.lightbox.set(i);
    this.scroller.stop();
    document.body.classList.add('aia-locked');
  }

  close(): void {
    if (this.lightbox() === null) return;
    this.lightbox.set(null);
    this.scroller.start();
    document.body.classList.remove('aia-locked');
  }

  step(dir: number): void {
    const n = this.visible().length;
    this.lightbox.update((i) => (i === null ? i : (i + dir + n) % n));
  }

  bgClick(): void {
    // Un swipe pe fundal se termina tot cu un click; nu vrem sa inchida.
    if (this.lbSwiped) {
      this.lbSwiped = false;
      return;
    }
    this.close();
  }

  lbDown(e: PointerEvent): void {
    this.lbStartX = e.clientX;
    this.lbSwiped = false;
  }

  lbUp(e: PointerEvent): void {
    const dx = e.clientX - this.lbStartX;
    if (Math.abs(dx) > 60) {
      this.lbSwiped = true;
      this.step(dx < 0 ? 1 : -1);
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKey(e: KeyboardEvent): void {
    if (this.lightbox() === null) return;
    if (e.key === 'Escape') this.close();
    if (e.key === 'ArrowRight') this.step(1);
    if (e.key === 'ArrowLeft') this.step(-1);
  }
}

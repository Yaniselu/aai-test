import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ACADEMY } from '../../core/academy.data';
import { AnimationService } from '../../core/services/animation.service';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { IconComponent } from '../../shared/icons/icon.component';
import { ScheduleComponent } from '../../shared/components/schedule.component';
import { VideoTileComponent } from '../../shared/components/video-tile.component';
import { MeshBackgroundComponent } from '../../shared/motion/mesh-background.component';
import {
  CountUpComponent,
  ScrambleTextComponent,
  VelocityMarqueeComponent
} from '../../shared/motion/motion.components';
import {
  MagnetDirective,
  RevealDirective,
  SplitTextDirective,
  SpotlightDirective,
  TiltDirective
} from '../../shared/motion/motion.directives';
import { ContactFormComponent } from './contact-form.component';
import { LocationsMapComponent } from './locations-map.component';

interface GalleryItem {
  id: number;
  titleKey: string;
  category: string;
  year: number;
  wide: boolean;
  image?: string;
  video?: string;
  poster?: string;
}

@Component({
  selector: 'aia-home',
  standalone: true,
  imports: [
    RouterLink,
    TranslatePipe,
    IconComponent,
    ScheduleComponent,
    LocationsMapComponent,
    ContactFormComponent,
    MeshBackgroundComponent,
    VideoTileComponent,
    CountUpComponent,
    ScrambleTextComponent,
    VelocityMarqueeComponent,
    SplitTextDirective,
    MagnetDirective,
    RevealDirective,
    SpotlightDirective,
    TiltDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- ═══════════════ HERO ═══════════════ -->
    <section class="relative flex min-h-[92svh] items-center overflow-hidden">
      <div class="absolute inset-0" aria-hidden="true">
        <img
          [src]="heroBg()"
          alt=""
          class="absolute inset-0 h-full w-full object-cover"
          fetchpriority="high"
          loading="eager"
          decoding="sync"
          (error)="onHeroBgError()"
        />
        <div
          class="absolute inset-0"
          style="background:
            linear-gradient(90deg, var(--aia-bg) 2%, rgba(5,5,5,.74) 44%, rgba(5,5,5,.34) 100%),
            linear-gradient(180deg, rgba(5,5,5,.45), transparent 45%, rgba(5,5,5,.85))"
        ></div>
      </div>

      <aia-mesh-background class="opacity-50" />

      <div class="aia-container relative z-10 grid items-center gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
        <div>
          <p class="aia-eyebrow">
            <aia-scramble [text]="'hero.eyebrow' | translate" />
          </p>

          <h1
            aiaSplitText
            splitBy="word"
            [splitStagger]="0.06"
            class="mt-6 font-display text-[8.5vw] leading-[1.06] sm:text-[6vw] lg:text-[3.9rem]"
          >
            {{ 'hero.title' | translate }}
          </h1>

          <p class="mt-6 max-w-md text-[15px] leading-relaxed" [style.color]="'var(--aia-text-muted)'">
            {{ 'hero.subtitle' | translate }}
          </p>

          <div class="mt-8 flex flex-wrap gap-3">
            <a routerLink="/auth/register" aiaMagnet class="aia-btn aia-btn-primary">
              <span>{{ 'hero.cta' | translate }}</span>
              <aia-icon name="arrow-right" [size]="16" />
            </a>
            <button type="button" class="aia-btn aia-btn-ghost" (click)="scrollTo('#grupe')">
              <span>{{ 'hero.groups' | translate }}</span>
            </button>
          </div>

          <dl class="mt-12 grid grid-cols-3 gap-3 sm:gap-4">
            @for (stat of stats; track stat.key; let i = $index) {
              <div class="aia-card p-4 sm:p-5" aiaSpotlight aiaReveal [revealDelay]="i * 0.08">
                <dd class="font-display text-2xl text-[var(--aia-blood)] sm:text-3xl">
                  <aia-count-up [value]="stat.value" suffix="+" />
                </dd>
                <dt class="mt-2 text-[10px] leading-snug sm:text-[11px]" [style.color]="'var(--aia-text-muted)'">
                  {{ stat.key | translate }}
                </dt>
              </div>
            }
          </dl>
        </div>

        <!-- Colaj video, doar pe ecrane late: pe mobil ar impinge continutul -->
        <div class="hidden justify-center gap-5 lg:flex" aria-hidden="true">
          <aia-video-tile
            class="mt-16 h-[290px] w-[165px] rounded-[22px] border"
            [style.borderColor]="'var(--aia-border-strong)'"
            [style.boxShadow]="'var(--aia-shadow)'"
            [src]="videos[0].src"
            [poster]="videos[0].poster"
            style="animation: aia-float 11s ease-in-out infinite"
          />
          <aia-video-tile
            class="h-[340px] w-[190px] rounded-[26px] border"
            [style.borderColor]="'var(--aia-border-strong)'"
            [style.boxShadow]="'var(--aia-shadow)'"
            [src]="videos[1].src"
            [poster]="videos[1].poster"
            style="animation: aia-float 13s ease-in-out infinite reverse"
          />
        </div>
      </div>
    </section>

    <aia-velocity-marquee [items]="['DISCIPLINA', 'PERFORMANTA', 'MENTALITATE', 'RESPECT']" />

    <!-- ═══════════════ SPIRIT ═══════════════ -->
    <section id="despre" class="scroll-mt-28 py-20 lg:py-32">
      <div class="aia-container">
        <p class="aia-eyebrow" aiaReveal>{{ 'about.eyebrow' | translate }}</p>
        <h2 class="aia-section-title mt-5 max-w-3xl" aiaSplitText>{{ 'about.title' | translate }}</h2>

        <div class="mt-12 grid gap-5 md:grid-cols-3">
          @for (pillar of pillars; track pillar.key; let i = $index) {
            <article class="aia-card p-7 lg:p-8" aiaSpotlight aiaTilt [tiltMax]="5" aiaReveal [revealDelay]="i * 0.09">
              <span
                class="inline-flex h-12 w-12 items-center justify-center rounded-[14px]"
                [style.backgroundColor]="'var(--aia-blood-soft)'"
                [style.color]="'var(--aia-blood-bright)'"
              >
                <aia-icon [name]="pillar.icon" [size]="22" />
              </span>
              <h3 class="mt-6 font-display text-lg lg:text-xl">{{ 'about.' + pillar.key | translate }}</h3>
              <p class="mt-3 text-sm leading-relaxed" [style.color]="'var(--aia-text-muted)'">
                {{ 'about.' + pillar.key + 'Text' | translate }}
              </p>
            </article>
          }
        </div>

        <ol class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (step of journey; track step; let i = $index) {
            <li class="aia-card-flat p-5 lg:p-6" aiaReveal [revealDelay]="i * 0.07">
              <span class="aia-index text-xs" [style.color]="'var(--aia-cyan)'">0{{ i + 1 }}</span>
              <h3 class="mt-3 font-display text-base">{{ 'about.journey.' + step | translate }}</h3>
              <p class="mt-2 text-[13px] leading-relaxed" [style.color]="'var(--aia-text-muted)'">
                {{ 'about.journey.' + step + 'Text' | translate }}
              </p>
            </li>
          }
        </ol>
      </div>
    </section>

    <!-- ═══════════════ GRUPE ═══════════════ -->
    <section id="grupe" class="scroll-mt-28 py-20 lg:py-32" [style.backgroundColor]="'var(--aia-bg-soft)'">
      <div class="aia-container">
        <p class="aia-eyebrow" aiaReveal>{{ 'groups.eyebrow' | translate }}</p>
        <h2 class="aia-section-title mt-5" aiaSplitText>{{ 'groups.title' | translate }}</h2>

        <div class="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          @for (group of groups; track group.name; let i = $index) {
            <article class="aia-card group overflow-hidden" aiaSpotlight aiaReveal [revealDelay]="i * 0.09">
              <div class="relative aspect-[16/10] w-full overflow-hidden">
                <img
                  [src]="group.image"
                  [alt]="group.name"
                  class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <span class="aia-chip absolute left-4 top-4 !border-white/25 !bg-black/50 !text-white">
                  {{ group.ageKey | translate }}
                </span>
              </div>

              <div class="p-6 lg:p-7">
                <h3 class="font-display text-xl lg:text-2xl">{{ group.name }}</h3>
                <p class="mt-3 text-sm leading-relaxed" [style.color]="'var(--aia-text-muted)'">
                  {{ group.textKey | translate }}
                </p>
                <a routerLink="/auth/register" class="aia-btn aia-btn-ghost mt-6 w-full !py-3">
                  <span>{{ 'groups.enroll' | translate }}</span>
                  <aia-icon name="arrow-right" [size]="15" />
                </a>
              </div>
            </article>
          }
        </div>
      </div>
    </section>

    <!-- ═══════════════ PROGRAM ═══════════════ -->
    <section id="program" class="scroll-mt-28 py-20 lg:py-32">
      <div class="aia-container">
        <p class="aia-eyebrow" aiaReveal>{{ 'schedule.eyebrow' | translate }}</p>
        <h2 class="aia-section-title mt-5" aiaSplitText>{{ 'schedule.title' | translate }}</h2>

        <div class="mt-12" aiaReveal>
          <aia-schedule />
        </div>
      </div>
    </section>

    <!-- ═══════════════ ANTRENORI ═══════════════ -->
    <section id="antrenori" class="scroll-mt-28 py-20 lg:py-32" [style.backgroundColor]="'var(--aia-bg-soft)'">
      <div class="aia-container">
        <p class="aia-eyebrow" aiaReveal>{{ 'coaches.eyebrow' | translate }}</p>
        <h2 class="aia-section-title mt-5 max-w-3xl" aiaSplitText>{{ 'coaches.title' | translate }}</h2>

        <div class="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          @for (coach of coaches; track coach.name; let i = $index) {
            <article class="aia-card overflow-hidden" aiaTilt [tiltMax]="4" aiaReveal [revealDelay]="i * 0.09">
              <img
                [src]="coach.image"
                [alt]="coach.name"
                class="aspect-[4/5] w-full object-cover"
                loading="lazy"
                decoding="async"
              />
              <div class="p-6 lg:p-7">
                <h3 class="font-display text-lg lg:text-xl">{{ coach.name }}</h3>
                <p class="mt-2 text-[11px] uppercase tracking-[0.14em]" [style.color]="'var(--aia-cyan)'">
                  {{ coach.role }}
                </p>
                <p class="mt-4 text-sm" [style.color]="'var(--aia-text-muted)'">{{ coach.focus }}</p>
              </div>
            </article>
          }
        </div>
      </div>
    </section>

    <!-- ═══════════════ REVIEW-URI ═══════════════ -->
    <section class="py-20 lg:py-32">
      <div class="aia-container">
        <p class="aia-eyebrow" aiaReveal>{{ 'reviews.eyebrow' | translate }}</p>
        <h2 class="aia-section-title mt-5" aiaSplitText>{{ 'reviews.title' | translate }}</h2>

        <div class="mt-12 flex items-stretch gap-4">
          <button
            type="button"
            class="aia-btn aia-btn-ghost hidden h-12 w-12 shrink-0 self-center !px-0 sm:inline-flex"
            (click)="prevReview()"
            [attr.aria-label]="'reviews.previous' | translate"
          >
            <aia-icon name="chevron-left" [size]="18" />
          </button>

          <figure class="aia-card flex-1 p-7 sm:p-10 lg:p-12" aiaSpotlight>
            <div class="flex gap-1" [style.color]="'var(--aia-blood)'" aria-label="5/5">
              @for (star of stars; track star) {
                <aia-icon name="star" [size]="15" />
              }
            </div>

            <blockquote class="mt-5 text-base leading-relaxed sm:text-xl lg:text-2xl">
              &laquo;{{ reviews[reviewIndex()].text }}&raquo;
            </blockquote>
            <figcaption class="mt-5 text-sm" [style.color]="'var(--aia-text-muted)'">
              &mdash; {{ reviews[reviewIndex()].author }}
            </figcaption>

            <div class="mt-7 flex gap-2">
              @for (r of reviews; track r.author; let i = $index) {
                <button
                  type="button"
                  class="h-1 rounded-full transition-all duration-500"
                  [style.width.px]="i === reviewIndex() ? 34 : 14"
                  [style.backgroundColor]="i === reviewIndex() ? 'var(--aia-blood)' : 'var(--aia-border-strong)'"
                  (click)="reviewIndex.set(i)"
                  [attr.aria-label]="'Review ' + (i + 1)"
                ></button>
              }
            </div>
          </figure>

          <button
            type="button"
            class="aia-btn aia-btn-ghost hidden h-12 w-12 shrink-0 self-center !px-0 sm:inline-flex"
            (click)="nextReview()"
            [attr.aria-label]="'reviews.next' | translate"
          >
            <aia-icon name="chevron-right" [size]="18" />
          </button>
        </div>
      </div>
    </section>

    <!-- ═══════════════ GALERIE ═══════════════ -->
    <section id="galerie" class="scroll-mt-28 pb-20 lg:pb-32" [style.backgroundColor]="'var(--aia-bg-soft)'">
      <div class="aia-container pt-20 lg:pt-32">
        <div class="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p class="aia-eyebrow" aiaReveal>{{ 'gallery.eyebrow' | translate }}</p>
            <h2 class="aia-section-title mt-5" aiaSplitText>{{ 'gallery.title' | translate }}</h2>
          </div>

          <div class="flex flex-wrap gap-2 pb-2">
            @for (filter of galleryFilters; track filter) {
              <button
                type="button"
                class="aia-chip transition-colors"
                [style.borderColor]="activeFilter() === filter ? 'var(--aia-blood)' : 'var(--aia-border)'"
                [style.color]="activeFilter() === filter ? 'var(--aia-text)' : 'var(--aia-text-muted)'"
                (click)="activeFilter.set(filter)"
              >
                {{ 'gallery.' + filter | translate }}
              </button>
            }
          </div>
        </div>

        <div class="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          @for (item of visibleGallery(); track item.id) {
            <figure
              class="group relative overflow-hidden rounded-[16px] border"
              [style.borderColor]="'var(--aia-border)'"
              [class.lg:col-span-2]="item.wide"
              aiaReveal
              [revealY]="24"
            >
              @if (item.video) {
                <aia-video-tile
                  class="h-full min-h-[170px] w-full sm:min-h-[190px]"
                  [src]="item.video"
                  [poster]="item.poster ?? ''"
                  [label]="item.titleKey | translate"
                />
              } @else {
                <img
                  [src]="item.image"
                  [alt]="item.titleKey | translate"
                  class="h-full min-h-[170px] w-full object-cover transition-transform duration-[900ms] group-hover:scale-105 sm:min-h-[190px]"
                  loading="lazy"
                  decoding="async"
                />
              }

              <figcaption
                class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:p-4"
                style="background: linear-gradient(to top, rgba(0,0,0,.85), transparent)"
              >
                <span class="text-[10px] uppercase tracking-[0.12em] text-white sm:text-[11px]">
                  {{ item.titleKey | translate }}
                </span>
                <span class="aia-index text-[10px] text-white/50 sm:text-[11px]">{{ item.year }}</span>
              </figcaption>
            </figure>
          }
        </div>
      </div>
    </section>

    <aia-locations-map />
    <aia-contact-form />
  `,
  styles: [
    `
      :host {
        display: block;
      }
      @keyframes aia-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-18px); }
      }
    `
  ]
})
export class HomePage implements OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly scroller = inject(SmoothScrollService);
  private readonly translate = inject(TranslateService);

  /** WebP intai, JPG ca rezerva, apoi gradientul de dedesubt. */
  private readonly heroCandidates = ['media/hero-bg.webp', 'media/hero-bg.jpg', ''];
  private readonly heroIndex = signal(0);
  readonly heroBg = computed(() => this.heroCandidates[this.heroIndex()]);

  readonly activeFilter = signal('all');
  readonly reviewIndex = signal(0);

  readonly stars = [1, 2, 3, 4, 5];
  readonly galleryFilters = ['all', 'competitions', 'training', 'performance'];

  readonly stats = ACADEMY.stats;
  readonly groups = ACADEMY.groups;
  readonly coaches = ACADEMY.coaches;
  readonly reviews = ACADEMY.reviews;

  readonly videos = [
    { src: 'media/karate-video1.mp4', poster: 'media/karate-video1-poster.webp' },
    { src: 'media/karate-video2.mp4', poster: 'media/karate-video2-poster.webp' }
  ];

  readonly pillars = [
    { key: 'discipline', icon: 'shield' },
    { key: 'performance', icon: 'trophy' },
    { key: 'mindset', icon: 'flame' }
  ];

  readonly journey = ['beginner', 'evolution', 'competition', 'champion'];

  private readonly gallery: GalleryItem[] = [
    { id: 1, titleKey: 'gallery.training', category: 'training', year: 2025, wide: true, video: 'media/karate-video2.mp4', poster: 'media/karate-video2-poster.webp' },
    { id: 2, titleKey: 'gallery.competitions', category: 'competitions', year: 2025, wide: false, image: ACADEMY.photos.competition },
    { id: 3, titleKey: 'gallery.training', category: 'training', year: 2025, wide: false, image: ACADEMY.photos.training },
    { id: 4, titleKey: 'gallery.performance', category: 'performance', year: 2025, wide: false, image: ACADEMY.photos.team },
    { id: 5, titleKey: 'gallery.training', category: 'training', year: 2025, wide: false, video: 'media/karate-video1.mp4', poster: 'media/karate-video1-poster.webp' },
    { id: 6, titleKey: 'gallery.performance', category: 'performance', year: 2025, wide: true, image: ACADEMY.photos.karate },
    { id: 7, titleKey: 'gallery.competitions', category: 'competitions', year: 2024, wide: false, image: ACADEMY.photos.kids },
    { id: 8, titleKey: 'gallery.training', category: 'training', year: 2025, wide: false, image: ACADEMY.photos.adults }
  ];

  visibleGallery(): GalleryItem[] {
    const filter = this.activeFilter();
    return filter === 'all' ? this.gallery : this.gallery.filter((g) => g.category === filter);
  }

  onHeroBgError(): void {
    if (this.heroIndex() < this.heroCandidates.length - 1) {
      this.heroIndex.update((i) => i + 1);
    }
  }

  nextReview(): void {
    this.reviewIndex.update((i) => (i + 1) % this.reviews.length);
  }

  prevReview(): void {
    this.reviewIndex.update((i) => (i - 1 + this.reviews.length) % this.reviews.length);
  }

  scrollTo(selector: string): void {
    this.scroller.scrollTo(selector);
  }

  ngOnDestroy(): void {
    this.anim.killAll();
  }
}

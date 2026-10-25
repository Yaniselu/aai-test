import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ACADEMY } from '../../core/academy.data';
import { AnimationService } from '../../core/services/animation.service';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';
import { PhoneMockupComponent } from '../../shared/components/phone-mockup.component';
import { ScheduleComponent } from '../../shared/components/schedule.component';
import { IconComponent } from '../../shared/icons/icon.component';
import { SectionDotsComponent } from '../../shared/motion/liquid.components';
import { MeshBackgroundComponent } from '../../shared/motion/mesh-background.component';
import {
  CountUpComponent,
  ScrambleTextComponent,
  VelocityMarqueeComponent
} from '../../shared/motion/motion.components';
import {
  ClipRevealDirective,
  MagnetDirective,
  ParallaxDirective,
  RevealDirective,
  SplitTextDirective,
  TiltDirective
} from '../../shared/motion/motion.directives';
import { ContactFormComponent } from './contact-form.component';
import { LocationsMapComponent } from './locations-map.component';
import { MediaShowcaseComponent } from './media-showcase.component';

/** Desparte un text in cuvinte si litere, pentru animatii controlate din template. */
function toWords(text: string | undefined): { word: string; chars: string[] }[] {
  return (text ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({ word, chars: Array.from(word) }));
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
    MediaShowcaseComponent,
    MeshBackgroundComponent,
    PhoneMockupComponent,
    SectionDotsComponent,
    CountUpComponent,
    ScrambleTextComponent,
    VelocityMarqueeComponent,
    SplitTextDirective,
    MagnetDirective,
    RevealDirective,
    TiltDirective,
    ParallaxDirective,
    ClipRevealDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aia-section-dots [sections]="dots()" />

    <!-- ═══════════════ HERO ═══════════════ -->
    <section id="acasa" #hero class="hero relative -mt-[92px] overflow-hidden pt-[92px] lg:h-[100svh] lg:min-h-[720px]">
      <div #heroBg class="hero-bg absolute inset-0" aria-hidden="true">
        <img
          [src]="heroBgSrc()"
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
            radial-gradient(ellipse at 70% 40%, rgba(255,31,61,.18), transparent 55%),
            linear-gradient(90deg, var(--aia-bg) 4%, color-mix(in srgb, var(--aia-bg) 70%, transparent) 46%, color-mix(in srgb, var(--aia-bg) 30%, transparent) 100%),
            linear-gradient(180deg, color-mix(in srgb, var(--aia-bg) 40%, transparent), transparent 40%, var(--aia-bg) 98%)"
        ></div>
      </div>

      <aia-mesh-background class="opacity-40" />

      <!-- Sfere de sticla care plutesc, cu adancimi diferite la cursor -->
      <span class="orb aia-glass o1" data-depth="0.6" aria-hidden="true"></span>
      <span class="orb aia-glass o2" data-depth="1.2" aria-hidden="true"></span>
      <span class="orb aia-glass o3" data-depth="0.9" aria-hidden="true"></span>
      <span class="orb aia-glass o4" data-depth="1.6" aria-hidden="true"></span>

      <div class="aia-container relative z-10 grid h-full items-center gap-10 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:py-0">
        <div #heroText class="hero-text">
          <p class="hero-in aia-chip !gap-3 !py-2.5 !pl-3 !text-[var(--aia-text)]">
            <span class="live-dot"></span>
            <aia-scramble [text]="'hero.eyebrow' | translate" />
          </p>

          <h1
            class="hero-title mt-7 font-display text-[10vw] leading-[1.02] sm:text-[7vw] lg:text-[4.6rem] xl:text-[5.2rem]"
            [attr.aria-label]="'hero.title' | translate"
          >
            @for (w of titleWords(); track $index; let wi = $index; let last = $last) {
              <span class="word" aria-hidden="true" [class.accent]="wi >= titleWords().length - 2">
                @for (c of w.chars; track $index; let ci = $index) {
                  <span class="ch" [style.color]="wi >= titleWords().length - 2 ? accentColor(ci, w.chars.length) : null">{{ c }}</span>
                }
              </span>{{ last ? '' : ' ' }}
            }
          </h1>

          <p class="hero-in mt-7 max-w-md text-[15px] leading-relaxed sm:text-base" [style.color]="'var(--aia-text-muted)'">
            {{ 'hero.subtitle' | translate }}
          </p>

          <div class="hero-in mt-9 flex flex-wrap gap-3">
            <a routerLink="/auth/register" aiaMagnet class="aia-btn aia-btn-primary !px-8 !py-4">
              <span>{{ 'hero.cta' | translate }}</span>
              <aia-icon name="arrow-right" [size]="16" />
            </a>
            <button type="button" aiaMagnet [magnetStrength]="0.2" class="aia-btn aia-btn-ghost !px-8 !py-4" (click)="scrollTo('#grupe')">
              <span>{{ 'hero.groups' | translate }}</span>
            </button>
          </div>

          <dl class="mt-12 grid max-w-xl grid-cols-3 gap-3 sm:gap-4">
            @for (stat of stats; track stat.key; let i = $index) {
              <div class="hero-in aia-card !rounded-[22px] p-4 sm:p-5" aiaTilt [tiltMax]="10">
                <dd class="font-display text-2xl text-[var(--aia-blood-bright)] sm:text-3xl">
                  <aia-count-up [value]="stat.value" suffix="+" />
                </dd>
                <dt class="mt-2 text-[10px] leading-snug sm:text-[11px]" [style.color]="'var(--aia-text-muted)'">
                  {{ stat.key | translate }}
                </dt>
              </div>
            }
          </dl>
        </div>

        <!-- Scena cu telefoane 3D -->
        <div #stage class="stage relative mx-auto h-[520px] w-full max-w-[560px] sm:h-[600px] lg:h-[680px]" aria-hidden="true">
          <div #stageInner class="stage-inner absolute inset-0">
            <!-- .hp = scroll, .hp-in = intrare, .pose = pozitie 3D statica, aia-phone = plutire.
                 Fiecare strat are propriul transform, ca animatiile sa nu se suprascrie. -->
            <div class="hp hp-left"><div class="hp-in"><div class="pose">
              <aia-phone class="hp-w" [image]="photos.competition" ui="story" caption="Ziua competiției" ago="3h" />
            </div></div></div>
            <div class="hp hp-right"><div class="hp-in"><div class="pose">
              <aia-phone class="hp-w" [video]="videos[1].src" [poster]="videos[1].poster" caption="Kata · pregătire pentru turneu" [baseLikes]="1560" />
            </div></div></div>
            <div class="hp hp-center"><div class="hp-in"><div class="pose">
              <aia-phone
                class="hp-w-lg"
                [video]="videos[0].src"
                [poster]="videos[0].poster"
                caption="Antrenament de seară · disciplina înainte de toate"
                [baseLikes]="2310"
                [comments]="142"
                [active]="true"
              />
            </div></div></div>

            <div class="badges">
            <div class="badge aia-glass b-live">
              <span class="live-dot"></span>
              <span class="font-heading text-[10px] font-bold uppercase tracking-[0.18em]">{{ 'hero.live' | translate }}</span>
            </div>
            <div class="badge aia-glass b-medal">
              <span class="b-ico" style="background: linear-gradient(135deg,#f5b400,#ffe27a)"><aia-icon name="trophy" [size]="16" /></span>
              <span>
                <b class="font-display text-lg leading-none">17</b>
                <small>{{ 'hero.badgeMedals' | translate }}</small>
              </span>
            </div>
            <div class="badge aia-glass b-new">
              <span class="b-ico" style="background: linear-gradient(135deg,#ff1f3d,#8b5cff)"><aia-icon name="play" [size]="14" /></span>
              <span>
                <b>{{ 'hero.badgeNew' | translate }}</b>
                <small>{{ 'hero.badgeNewSub' | translate }}</small>
              </span>
            </div>
            <div class="badge aia-glass b-heart">
              <aia-icon name="heart" [size]="18" />
              <b class="aia-index">+2.3K</b>
            </div>
            </div>
          </div>
        </div>
      </div>

      <button type="button" class="scroll-cue absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-3 lg:flex" (click)="scrollTo('#despre')">
        <span class="mouse"><i></i></span>
        <span class="font-heading text-[9px] font-bold uppercase tracking-[0.4em]" [style.color]="'var(--aia-text-muted)'">{{ 'hero.scroll' | translate }}</span>
      </button>
    </section>

    <!-- ═══════════════ MARQUEE DUBLU ═══════════════ -->
    <div class="relative z-10 -my-4 overflow-hidden py-14">
      <div class="aia-glass -mx-4 rotate-[-2.5deg] rounded-none border-y py-1" [style.borderColor]="'var(--aia-border)'">
        <aia-velocity-marquee [items]="['DISCIPLINĂ', 'PERFORMANȚĂ', 'MENTALITATE', 'RESPECT']" />
      </div>
      <div class="-mx-4 mt-2 rotate-[1.5deg] opacity-60">
        <aia-velocity-marquee
          [reverse]="true"
          [items]="['KICKBOX', 'KARATE', 'CRAIOVA', 'CAMPIONI']"
          klass="font-display aia-text-outline text-4xl uppercase leading-none tracking-wide sm:text-6xl"
        />
      </div>
    </div>

    <!-- ═══════════════ SPIRIT ═══════════════ -->
    <section id="despre" class="relative scroll-mt-28 py-24 lg:py-36">
      <div class="aia-container">
        <p class="aia-eyebrow" aiaReveal>{{ 'about.eyebrow' | translate }}</p>
        <h2 class="aia-section-title mt-5 max-w-4xl" aiaSplitText>{{ 'about.title' | translate }}</h2>

        <!-- Manifest care se aprinde cuvant cu cuvant la scroll -->
        <p #manifesto class="manifesto mt-14 max-w-5xl font-display text-[6.4vw] font-semibold normal-case leading-[1.18] tracking-[0.01em] sm:text-[4vw] lg:text-[2.9rem]">
          @for (w of manifestoWords(); track $index) {
            <span class="mw">{{ w.word }}</span>{{ ' ' }}
          }
        </p>

        <div #pillarsEl class="mt-20 grid gap-5 md:grid-cols-3" style="perspective: 1200px">
          @for (pillar of pillars; track pillar.key; let i = $index) {
            <article class="pillar aia-card p-8 lg:p-10" aiaTilt [tiltMax]="9">
              <div class="flex items-start justify-between">
                <span class="pillar-ico aia-glass">
                  <aia-icon [name]="pillar.icon" [size]="26" />
                </span>
                <span class="font-display aia-text-outline text-6xl leading-none" aiaParallax [parallaxSpeed]="0.8">0{{ i + 1 }}</span>
              </div>
              <h3 class="mt-10 font-display text-xl lg:text-2xl">{{ 'about.' + pillar.key | translate }}</h3>
              <p class="mt-3 text-sm leading-relaxed" [style.color]="'var(--aia-text-muted)'">
                {{ 'about.' + pillar.key + 'Text' | translate }}
              </p>
            </article>
          }
        </div>

        <!-- Traseul sportivului: linia se deseneaza odata cu scroll-ul -->
        <div #journeyEl class="journey relative mt-24">
          <div class="track absolute" aria-hidden="true">
            <div class="fill"></div>
          </div>
          <ol class="relative grid gap-10 lg:grid-cols-4 lg:gap-6">
            @for (step of journey; track step; let i = $index) {
              <li class="j-step relative pl-14 lg:pl-0 lg:pt-16" [class.on]="journeyStep() >= i">
                <span class="node" aria-hidden="true"><i></i></span>
                <div class="aia-card-flat p-5 lg:p-6">
                  <span class="aia-index text-xs" [style.color]="'var(--aia-cyan)'">0{{ i + 1 }}</span>
                  <h3 class="mt-3 font-display text-base">{{ 'about.journey.' + step | translate }}</h3>
                  <p class="mt-2 text-[13px] leading-relaxed" [style.color]="'var(--aia-text-muted)'">
                    {{ 'about.journey.' + step + 'Text' | translate }}
                  </p>
                </div>
              </li>
            }
          </ol>
        </div>
      </div>
    </section>

    <!-- ═══════════════ GRUPE — carduri care se stivuiesc ═══════════════ -->
    <section id="grupe" class="relative scroll-mt-20 py-24 lg:py-32">
      <div class="aia-container">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p class="aia-eyebrow" aiaReveal>{{ 'groups.eyebrow' | translate }}</p>
            <h2 class="aia-section-title mt-5" aiaSplitText>{{ 'groups.title' | translate }}</h2>
          </div>
          <p class="aia-chip" aiaReveal><aia-icon name="arrow-down" [size]="12" /> {{ 'groups.pick' | translate }}</p>
        </div>

        <div #stackEl class="stack mt-14 pb-[6vh]">
          @for (group of groups; track group.name; let i = $index) {
            <!-- .stack-card = lipit + micsorat la scroll; .stack-inner = intrare + sticla -->
            <div class="stack-card" [style.top.px]="100 + i * 26">
            <article class="stack-inner aia-card h-full overflow-hidden">
              <div class="stack-dim pointer-events-none absolute inset-0 z-20 rounded-[inherit] bg-black opacity-0" aria-hidden="true"></div>
              <div class="grid h-full lg:grid-cols-[1.1fr_0.9fr]">
                <div class="relative h-[260px] overflow-hidden sm:h-[340px] lg:h-full">
                  <img
                    [src]="group.image"
                    [alt]="group.name"
                    class="stack-img absolute inset-0 h-[120%] w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div class="absolute inset-0" style="background: linear-gradient(90deg, transparent 50%, rgba(4,4,10,.55)), linear-gradient(0deg, rgba(4,4,10,.6), transparent 40%)"></div>
                  <span class="aia-chip absolute left-5 top-5 !text-white">{{ group.ageKey | translate }}</span>
                </div>

                <div class="relative flex flex-col justify-center p-7 sm:p-10 lg:p-14">
                  <span class="font-display aia-text-outline pointer-events-none absolute right-6 top-4 text-[90px] leading-none lg:text-[140px]">0{{ i + 1 }}</span>
                  <h3 class="relative font-display text-3xl lg:text-5xl">{{ group.name }}</h3>
                  <p class="relative mt-5 max-w-md text-[15px] leading-relaxed" [style.color]="'var(--aia-text-muted)'">
                    {{ group.textKey | translate }}
                  </p>
                  <div class="relative mt-6 flex flex-wrap gap-2">
                    @for (tag of groupTags[i]; track tag) {
                      <span class="aia-chip !text-[9px]">{{ tag }}</span>
                    }
                  </div>
                  <a routerLink="/auth/register" aiaMagnet [magnetStrength]="0.25" class="aia-btn aia-btn-primary relative mt-9 self-start">
                    <span>{{ 'groups.enroll' | translate }}</span>
                    <aia-icon name="arrow-right" [size]="15" />
                  </a>
                </div>
              </div>
            </article>
            </div>
          }
        </div>
      </div>
    </section>

    <!-- ═══════════════ PROGRAM ═══════════════ -->
    <section id="program" class="relative scroll-mt-28 py-24 lg:py-32">
      <div class="aia-container">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p class="aia-eyebrow" aiaReveal>{{ 'schedule.eyebrow' | translate }}</p>
            <h2 class="aia-section-title mt-5" aiaSplitText>{{ 'schedule.title' | translate }}</h2>
          </div>
          <div class="aia-glass flex items-center gap-3 rounded-full px-5 py-3" aiaReveal>
            <aia-icon name="clock" [size]="16" />
            <span class="aia-index text-lg">{{ clock() }}</span>
            <span class="text-[10px] uppercase tracking-[0.2em]" [style.color]="'var(--aia-text-muted)'">Craiova</span>
          </div>
        </div>

        <div class="aia-card mt-12 p-4 sm:p-6 lg:p-8" aiaClipReveal clipFrom="center">
          <aia-schedule />
        </div>
      </div>
    </section>

    <!-- ═══════════════ ANTRENORI — panouri care se extind ═══════════════ -->
    <section id="antrenori" class="relative scroll-mt-28 py-24 lg:py-32">
      <div class="aia-container">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p class="aia-eyebrow" aiaReveal>{{ 'coaches.eyebrow' | translate }}</p>
            <h2 class="aia-section-title mt-5 max-w-3xl" aiaSplitText>{{ 'coaches.title' | translate }}</h2>
          </div>
          <p class="hidden text-xs lg:block" [style.color]="'var(--aia-text-muted)'" aiaReveal>{{ 'coaches.hover' | translate }} &rarr;</p>
        </div>

        <div class="coaches mt-12 flex flex-col gap-4 lg:h-[600px] lg:flex-row" aiaReveal>
          @for (coach of coaches; track coach.name; let i = $index) {
            <article
              class="coach aia-card overflow-hidden"
              [class.open]="activeCoach() === i"
              (pointerenter)="activeCoach.set(i)"
              (focusin)="activeCoach.set(i)"
              tabindex="0"
            >
              <img [src]="coach.image" [alt]="coach.name" class="coach-img absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
              <div class="absolute inset-0" style="background: linear-gradient(180deg, transparent 30%, rgba(4,4,10,.92))"></div>

              <span class="coach-vert font-display" aria-hidden="true">{{ coach.name }}</span>

              <div class="coach-body absolute inset-x-0 bottom-0 p-6 lg:p-8">
                <div class="aia-glass rounded-[22px] p-5 lg:p-6">
                  <p class="text-[10px] uppercase tracking-[0.18em]" [style.color]="'var(--aia-cyan)'">{{ coach.role }}</p>
                  <h3 class="mt-2 font-display text-xl text-white lg:text-3xl">{{ coach.name }}</h3>
                  <p class="mt-2 text-sm text-white/70">{{ coach.focus }}</p>
                </div>
              </div>
            </article>
          }
        </div>
      </div>
    </section>

    <!-- ═══════════════ REVIEW-URI — pachet de carti 3D ═══════════════ -->
    <section class="relative py-24 lg:py-32">
      <div class="aia-container grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p class="aia-eyebrow" aiaReveal>{{ 'reviews.eyebrow' | translate }}</p>
          <h2 class="aia-section-title mt-5" aiaSplitText>{{ 'reviews.title' | translate }}</h2>
          <div class="mt-8 flex gap-3" aiaReveal>
            <button type="button" aiaMagnet class="aia-btn aia-btn-ghost h-14 w-14 !px-0" (click)="prevReview()" [attr.aria-label]="'reviews.previous' | translate">
              <aia-icon name="chevron-left" [size]="18" />
            </button>
            <button type="button" aiaMagnet class="aia-btn aia-btn-ghost h-14 w-14 !px-0" (click)="nextReview()" [attr.aria-label]="'reviews.next' | translate">
              <aia-icon name="chevron-right" [size]="18" />
            </button>
          </div>
        </div>

        <div
          class="deck relative h-[380px] sm:h-[340px]"
          (pointerenter)="reviewPaused.set(true)"
          (pointerleave)="reviewPaused.set(false)"
          (pointerdown)="deckDown($event)"
          (pointerup)="deckUp($event)"
          data-cursor="Swipe"
          style="perspective: 1400px; touch-action: pan-y"
        >
          @for (r of reviews; track r.author; let i = $index) {
            <figure class="review aia-card absolute inset-0 flex flex-col p-7 sm:p-10" [style]="reviewStyle(i)" [attr.aria-hidden]="i !== reviewIndex()">
              <span class="quote font-display" aria-hidden="true">&ldquo;</span>
              <div class="flex gap-1" [style.color]="'#f5b400'" aria-label="5/5">
                @for (star of stars; track star) {
                  <aia-icon name="star" [size]="15" />
                }
              </div>
              <blockquote class="mt-5 text-lg leading-relaxed sm:text-2xl">{{ r.text }}</blockquote>
              <figcaption class="mt-auto flex items-center gap-3 pt-6 text-sm" [style.color]="'var(--aia-text-muted)'">
                <span class="grid h-10 w-10 place-items-center rounded-full font-display text-xs text-white" style="background: linear-gradient(135deg,var(--aia-blood),var(--aia-violet))">{{ r.author.charAt(0) }}</span>
                {{ r.author }}
              </figcaption>
              @if (i === reviewIndex()) {
                <span class="progress" [class.paused]="reviewPaused()" (animationend)="nextReview()" aria-hidden="true"></span>
              }
            </figure>
          }
        </div>
      </div>
    </section>

    <!-- ═══════════════ MEDIA ═══════════════ -->
    <aia-media-showcase />

    <!-- ═══════════════ CTA cu lentila ═══════════════ -->
    <section class="relative py-24 lg:py-36">
      <div class="aia-container">
        <div
          #lensEl
          class="lens-wrap aia-card relative overflow-hidden px-6 py-20 text-center sm:px-12 lg:py-28"
          (pointermove)="onLens($event)"
          (pointerleave)="lensOn.set(false)"
          (pointerenter)="lensOn.set(true)"
        >
          <p class="aia-eyebrow justify-center">{{ 'cta.eyebrow' | translate }}</p>
          <div class="relative mt-6">
            <h2 class="font-display text-[11vw] leading-[0.95] sm:text-[8vw] lg:text-[6.6rem]">{{ 'cta.title' | translate }}</h2>
            <h2
              class="lens-layer pointer-events-none absolute inset-0 font-display text-[11vw] leading-[0.95] sm:text-[8vw] lg:text-[6.6rem]"
              [class.on]="lensOn()"
              aria-hidden="true"
            >
              {{ 'cta.title' | translate }}
            </h2>
          </div>
          <p class="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed" [style.color]="'var(--aia-text-muted)'">{{ 'cta.text' | translate }}</p>
          <a routerLink="/auth/register" aiaMagnet class="aia-btn aia-btn-primary mt-10 !px-10 !py-5">
            <span>{{ 'cta.button' | translate }}</span>
            <aia-icon name="arrow-right" [size]="16" />
          </a>
          <span class="lens-ring aia-refract" [class.on]="lensOn()" aria-hidden="true"></span>
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

      /* ---------- hero ---------- */
      .hero-title .word {
        display: inline-block;
        white-space: nowrap;
        perspective: 600px;
      }
      .hero-title .ch {
        display: inline-block;
        transform-origin: 50% 100%;
        will-change: transform;
      }
      .hero-title .accent .ch { text-shadow: 0 0 40px currentColor; }
      .live-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--aia-blood);
        box-shadow: 0 0 10px var(--aia-blood);
        animation: aia-pulse-dot 1.6s ease-out infinite;
        flex-shrink: 0;
      }

      .orb {
        position: absolute;
        border-radius: 50%;
        z-index: 1;
        pointer-events: none;
        background: radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.04) 45%, rgba(255, 31, 61, 0.12) 100%);
      }
      .o1 { width: 140px; height: 140px; left: 46%; top: 14%; animation: aia-float 9s ease-in-out infinite; }
      .o2 { width: 64px; height: 64px; left: 6%; bottom: 14%; animation: aia-float 7s ease-in-out infinite reverse; }
      .o3 { width: 220px; height: 220px; right: -60px; bottom: 6%; animation: aia-float 12s ease-in-out infinite; }
      .o4 { width: 34px; height: 34px; left: 40%; bottom: 22%; animation: aia-float 6s ease-in-out infinite; }
      @media (max-width: 1023px) { .o1, .o3 { display: none; } }

      .stage { perspective: 1500px; }
      .stage-inner { transform-style: preserve-3d; will-change: transform; pointer-events: none; }
      .hp {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        pointer-events: none;
        transform-style: preserve-3d;
      }
      .hp aia-phone { pointer-events: auto; }
      .hp-in,
      .pose { transform-style: preserve-3d; }
      .badges { position: absolute; inset: 0; translate: 0 0 120px; transform-style: preserve-3d; pointer-events: none; }
      .hp-w { width: 190px; }
      .hp-w-lg { width: 236px; }
      @media (min-width: 640px) {
        .hp-w { width: 210px; }
        .hp-w-lg { width: 262px; }
      }
      @media (min-width: 1280px) {
        .hp-w-lg { width: 280px; }
      }
      .hp-left .pose { transform: translate3d(-86%, 5%, -200px) rotateY(28deg) rotateZ(-8deg); }
      .hp-right .pose { transform: translate3d(86%, -3%, -200px) rotateY(-28deg) rotateZ(8deg); }
      .hp-center .pose { transform: translate3d(0, 0, 40px); }
      .pose > aia-phone { animation: aia-float 8s ease-in-out infinite; }
      .hp-left .pose > aia-phone { animation-duration: 10s; animation-delay: -2s; }
      .hp-right .pose > aia-phone { animation-duration: 11s; animation-delay: -5s; }

      .badge {
        position: absolute;
        z-index: 5;
        display: flex;
        align-items: center;
        gap: 10px;
        border-radius: 20px;
        padding: 10px 14px;
        font-size: 12px;
        line-height: 1.2;
      }
      .badge small { display: block; opacity: 0.65; font-size: 10px; margin-top: 3px; }
      .b-ico { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 12px; color: #fff; box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.5); }
      .b-live { left: 2%; top: 10%; border-radius: 999px; }
      .b-medal { right: 0; top: 22%; }
      .b-new { left: -2%; bottom: 18%; max-width: 220px; }
      .b-heart { right: 6%; bottom: 10%; color: var(--aia-blood-bright); border-radius: 999px; font-size: 14px; }
      @media (max-width: 639px) {
        .b-new { display: none; }
        .badge { font-size: 10px; padding: 8px 11px; }
      }

      .scroll-cue .mouse {
        width: 24px;
        height: 38px;
        border-radius: 14px;
        border: 1.5px solid var(--aia-border-strong);
        display: grid;
        justify-items: center;
        padding-top: 7px;
      }
      .scroll-cue .mouse i {
        width: 3px;
        height: 8px;
        border-radius: 3px;
        background: var(--aia-blood);
        animation: cue 1.8s cubic-bezier(0.16, 1, 0.3, 1) infinite;
      }
      @keyframes cue {
        0% { transform: translateY(0); opacity: 1; }
        100% { transform: translateY(14px); opacity: 0; }
      }

      /* ---------- spirit ---------- */
      .manifesto .mw { display: inline-block; }
      .pillar-ico {
        display: grid;
        place-items: center;
        width: 64px;
        height: 64px;
        border-radius: 22px;
        color: var(--aia-blood-bright);
        transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .pillar:hover .pillar-ico { transform: rotate(-12deg) scale(1.12); }

      .journey .track {
        left: 22px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--aia-border);
        border-radius: 2px;
      }
      .journey .fill {
        position: absolute;
        inset: 0;
        transform-origin: top;
        transform: scaleY(0);
        background: linear-gradient(180deg, var(--aia-blood), var(--aia-violet), var(--aia-cyan));
        box-shadow: 0 0 16px var(--aia-blood);
        border-radius: inherit;
      }
      @media (min-width: 1024px) {
        .journey .track { left: 0; right: 0; top: 22px; bottom: auto; width: auto; height: 2px; }
        .journey .fill { transform-origin: left; transform: scaleX(0); }
      }
      .node {
        position: absolute;
        left: 8px;
        top: 12px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: var(--aia-bg);
        border: 2px solid var(--aia-border-strong);
        transition: border-color 0.5s, box-shadow 0.5s, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .node i { width: 10px; height: 10px; border-radius: 50%; background: var(--aia-border-strong); transition: background 0.5s; }
      @media (min-width: 1024px) { .node { left: 0; top: 8px; } }
      .j-step.on .node { border-color: var(--aia-blood); box-shadow: 0 0 24px var(--aia-blood); transform: scale(1.15); }
      .j-step.on .node i { background: var(--aia-blood-bright); }
      .j-step .aia-card-flat { transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s; opacity: 0.45; transform: translateY(14px); }
      .j-step.on .aia-card-flat { opacity: 1; transform: none; }

      /* ---------- grupe ---------- */
      .stack-card {
        position: sticky;
        min-height: 520px;
        perspective: 1400px;
        margin-bottom: 8vh;
        transform-origin: 50% 0;
        will-change: transform;
      }
      @media (min-width: 1024px) {
        .stack-card { height: min(620px, 74vh); }
      }

      /* ---------- antrenori ---------- */
      .coach {
        position: relative;
        min-height: 420px;
        flex: 1;
        cursor: pointer;
        transition: flex 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        outline-offset: 4px;
      }
      .coach-img {
        filter: grayscale(1) brightness(0.65);
        transform: scale(1.12);
        transition: filter 0.8s, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .coach.open .coach-img { filter: grayscale(0) brightness(1); transform: scale(1); }
      .coach-vert {
        position: absolute;
        left: 50%;
        bottom: 36px;
        z-index: 2;
        display: none;
        font-size: 22px;
        color: #fff;
        white-space: nowrap;
        writing-mode: vertical-rl;
        transform: translateX(-50%) rotate(180deg);
        transition: opacity 0.4s;
      }
      .coach-body { z-index: 2; transition: opacity 0.6s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
      @media (min-width: 1024px) {
        .coach { min-height: 0; }
        .coach.open { flex: 3.2; }
        .coach-vert { display: block; }
        .coach.open .coach-vert { opacity: 0; }
        .coach:not(.open) .coach-body { opacity: 0; transform: translateY(30px); pointer-events: none; }
        .coach.open .coach-body { transition-delay: 0.25s; }
      }

      /* ---------- review-uri ---------- */
      .review {
        transition: transform 0.9s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.7s, filter 0.7s;
        transform-origin: 50% 100%;
      }
      .quote {
        position: absolute;
        right: 26px;
        top: -10px;
        font-size: 180px;
        line-height: 1;
        color: var(--aia-blood);
        opacity: 0.18;
      }
      .progress {
        position: absolute;
        left: 28px;
        right: 28px;
        bottom: 16px;
        height: 2px;
        border-radius: 2px;
        background: linear-gradient(90deg, var(--aia-blood), var(--aia-cyan));
        transform-origin: left;
        animation: review-progress 6s linear forwards;
      }
      .progress.paused { animation-play-state: paused; }
      @keyframes review-progress {
        from { transform: scaleX(0); }
        to { transform: scaleX(1); }
      }

      /* ---------- CTA cu lentila ---------- */
      .lens-wrap { --lx: 50%; --ly: 50%; }
      .lens-layer {
        clip-path: circle(0px at var(--lx) var(--ly));
        transition: clip-path 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        color: transparent;
        background: linear-gradient(120deg, var(--aia-blood-bright), var(--aia-violet), var(--aia-cyan));
        -webkit-background-clip: text;
        background-clip: text;
        transform: scale(1.04);
      }
      .lens-layer.on { clip-path: circle(110px at var(--lx) var(--ly)); transition: clip-path 0.35s; }
      .lens-ring {
        position: absolute;
        left: var(--lrx, 50%);
        top: var(--lry, 50%);
        z-index: 3;
        width: 220px;
        height: 220px;
        margin: -110px 0 0 -110px;
        border-radius: 50%;
        pointer-events: none;
        border: 1px solid rgba(255, 255, 255, 0.4);
        box-shadow: inset 0 2px 2px rgba(255, 255, 255, 0.5), inset 0 -10px 30px rgba(255, 255, 255, 0.06), 0 20px 50px rgba(0, 0, 0, 0.35);
        opacity: 0;
        transform: scale(0.4);
        transition: opacity 0.4s, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .lens-ring.on { opacity: 1; transform: scale(1); }
      @media (hover: none) { .lens-ring { display: none; } }
    `
  ]
})
export class HomePage implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly anim = inject(AnimationService);
  private readonly scroller = inject(SmoothScrollService);
  private readonly translate = inject(TranslateService);

  private readonly hero = viewChild.required<ElementRef<HTMLElement>>('hero');
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly stageInner = viewChild.required<ElementRef<HTMLElement>>('stageInner');
  private readonly lensEl = viewChild.required<ElementRef<HTMLElement>>('lensEl');

  /** WebP intai, JPG ca rezerva, apoi gradientul de dedesubt. */
  private readonly heroCandidates = ['media/hero-bg.webp', 'media/hero-bg.jpg', ''];
  private readonly heroIndex = signal(0);
  readonly heroBgSrc = computed(() => this.heroCandidates[this.heroIndex()]);

  private readonly titleText = toSignal(this.translate.stream('hero.title'));
  private readonly manifestoText = toSignal(this.translate.stream('hero.manifesto'));
  readonly titleWords = computed(() => toWords(this.titleText()));
  readonly manifestoWords = computed(() => toWords(this.manifestoText()));

  private readonly navLabels = toSignal(
    this.translate.stream(['nav.home', 'nav.story', 'nav.groups', 'nav.schedule', 'nav.coaches', 'nav.gallery', 'nav.contact'])
  );
  readonly dots = computed(() => {
    const l = (this.navLabels() ?? {}) as Record<string, string>;
    return [
      { id: 'acasa', label: l['nav.home'] ?? '' },
      { id: 'despre', label: l['nav.story'] ?? '' },
      { id: 'grupe', label: l['nav.groups'] ?? '' },
      { id: 'program', label: l['nav.schedule'] ?? '' },
      { id: 'antrenori', label: l['nav.coaches'] ?? '' },
      { id: 'galerie', label: l['nav.gallery'] ?? '' },
      { id: 'locatii', label: l['nav.contact'] ?? '' }
    ];
  });

  readonly reviewIndex = signal(0);
  readonly reviewPaused = signal(false);
  readonly activeCoach = signal(0);
  readonly journeyStep = signal(-1);
  readonly lensOn = signal(false);
  readonly clock = signal(this.now());

  readonly stars = [1, 2, 3, 4, 5];
  readonly stats = ACADEMY.stats;
  readonly groups = ACADEMY.groups;
  readonly coaches = ACADEMY.coaches;
  readonly reviews = ACADEMY.reviews;
  readonly photos = ACADEMY.photos;

  readonly groupTags = [
    ['Coordonare', 'Respect', 'Joc & tehnică'],
    ['Forță', 'Cardio', 'Sparring'],
    ['Kata', 'Kumite', 'Competiții']
  ];

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

  private ctx?: gsap.Context;
  private mm?: gsap.MatchMedia;
  private raf?: number;
  private clockTimer?: number;
  private deckStartX = 0;
  private readonly tilt = { x: 0, y: 0, tx: 0, ty: 0 };

  ngAfterViewInit(): void {
    this.clockTimer = setInterval(() => this.clock.set(this.now()), 1000) as unknown as number;
    if (this.anim.reducedMotion) {
      this.journeyStep.set(3);
      return;
    }

    this.ctx = gsap.context(() => {
      this.buildHeroIntro();
      this.buildHeroScroll();
      this.buildSpirit();
      this.buildStack();
    }, this.host.nativeElement);

    this.startStageTilt();
    // Fonturile si imaginile schimba inaltimile dupa primul layout.
    setTimeout(() => ScrollTrigger.refresh(), 600);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    this.mm?.revert();
    if (this.raf) cancelAnimationFrame(this.raf);
    clearInterval(this.clockTimer);
    window.removeEventListener('pointermove', this.onPointer);
    this.anim.killAll();
  }

  // ------------------------------------------------------------- hero
  private buildHeroIntro(): void {
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });

    tl.from('.hero-title .ch', {
      yPercent: 120,
      rotateX: -100,
      opacity: 0,
      duration: 1.5,
      stagger: 0.022
    })
      .from('.hero-in', { y: 40, opacity: 0, filter: 'blur(10px)', duration: 1.2, stagger: 0.09 }, 0.25)
      .from(
        '.hp-in',
        {
          y: 500,
          rotateX: 50,
          opacity: 0,
          duration: 1.9,
          stagger: { each: 0.14, from: 'center' }
        },
        0.1
      )
      .from('.badge', { scale: 0, opacity: 0, duration: 1, ease: 'back.out(2.2)', stagger: 0.12 }, 0.9)
      .from('.orb', { opacity: 0, filter: 'blur(20px)', duration: 1.6, stagger: 0.1 }, 0.4)
      .from('.scroll-cue', { opacity: 0, y: 20, duration: 1 }, 1.2);

    // Pozitiile de start se aplica imediat; timeline-ul porneste odata cu usile intro-ului.
    tl.progress(0);
    this.anim.afterIntro(() => tl.play());
  }

  private buildHeroScroll(): void {
    const hero = this.hero().nativeElement;
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 };

    gsap.to('.hero-bg img', { scale: 1.3, yPercent: 12, ease: 'none', scrollTrigger: st });
    gsap.to('.hero-text', { y: -140, opacity: 0, filter: 'blur(8px)', ease: 'none', scrollTrigger: { ...st, end: '80% top' } });
    // Telefoanele "explodeaza" in afara cadrului cand iesi din hero.
    gsap.to('.hp-left', { x: -220, y: -80, rotate: -16, ease: 'none', scrollTrigger: st });
    gsap.to('.hp-right', { x: 220, y: -160, rotate: 16, ease: 'none', scrollTrigger: st });
    gsap.to('.hp-center', { y: -120, scale: 1.08, ease: 'none', scrollTrigger: st });
    gsap.to('.badges', { y: -160, opacity: 0, ease: 'none', scrollTrigger: st });
  }

  /** Scena se inclina dupa cursor, iar sferele se misca pe adancimi diferite. */
  private startStageTilt(): void {
    if (window.matchMedia('(hover: none)').matches) return;
    window.addEventListener('pointermove', this.onPointer, { passive: true });
    const inner = this.stageInner().nativeElement;
    const orbs = Array.from(this.host.nativeElement.querySelectorAll('.orb')) as HTMLElement[];
    const hero = this.hero().nativeElement;

    const loop = () => {
      const t = this.tilt;
      t.x += (t.tx - t.x) * 0.06;
      t.y += (t.ty - t.y) * 0.06;
      // Nu calculam nimic cand hero-ul a iesit din ecran.
      if (hero.getBoundingClientRect().bottom > 0) {
        inner.style.transform = `rotateY(${t.x * 16}deg) rotateX(${-t.y * 12}deg)`;
        for (const o of orbs) {
          const d = Number(o.dataset['depth'] ?? 1);
          o.style.translate = `${t.x * 40 * d}px ${t.y * 40 * d}px`;
        }
      }
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  private readonly onPointer = (e: PointerEvent) => {
    this.tilt.tx = e.clientX / innerWidth - 0.5;
    this.tilt.ty = e.clientY / innerHeight - 0.5;
  };

  // ------------------------------------------------------------- spirit
  private buildSpirit(): void {
    gsap.fromTo(
      '.manifesto .mw',
      { opacity: 0.1, filter: 'blur(5px)' },
      {
        opacity: 1,
        filter: 'blur(0px)',
        stagger: 0.1,
        ease: 'none',
        scrollTrigger: { trigger: '.manifesto', start: 'top 80%', end: 'bottom 40%', scrub: 0.6 }
      }
    );

    gsap.from('.pillar', {
      y: 140,
      rotateX: -45,
      opacity: 0,
      duration: 1.4,
      ease: 'expo.out',
      stagger: 0.14,
      scrollTrigger: { trigger: '.pillar', start: 'top 88%', once: true }
    });

    this.mm = gsap.matchMedia();
    this.mm.add({ desktop: '(min-width: 1024px)', mobile: '(max-width: 1023px)' }, (c) => {
      const desktop = c.conditions?.['desktop'];
      gsap.to('.journey .fill', {
        [desktop ? 'scaleX' : 'scaleY']: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.journey',
          start: 'top 75%',
          end: desktop ? 'bottom 55%' : 'bottom 60%',
          scrub: 0.5,
          onUpdate: (self) => this.journeyStep.set(self.progress > 0.01 ? Math.min(3, Math.floor(self.progress * 4)) : -1)
        }
      });
    });
  }

  // ------------------------------------------------------------- grupe
  private buildStack(): void {
    const cards = gsap.utils.toArray<HTMLElement>('.stack-card');
    cards.forEach((card, i) => {
      const img = card.querySelector('.stack-img');
      if (img) {
        gsap.fromTo(img, { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'top top', scrub: true } });
      }
      gsap.from(card.querySelector('.stack-inner'), {
        y: 120,
        rotateX: -12,
        opacity: 0,
        duration: 1.2,
        ease: 'expo.out',
        scrollTrigger: { trigger: card, start: 'top 92%', once: true }
      });

      const next = cards[i + 1];
      if (!next) return;
      // Cardul de dedesubt se micsoreaza si se stinge cand urmatorul il acopera.
      // Stingerea e un strat negru, nu `filter`: un filtru pe parinte ar rupe
      // backdrop-filter-ul sticlei din interior.
      const st = { trigger: next, start: 'top 85%', end: 'top 20%', scrub: true };
      gsap.to(card, { scale: 0.9 - (cards.length - i) * 0.015, ease: 'none', scrollTrigger: st });
      gsap.to(card.querySelector('.stack-dim'), { opacity: 0.55, ease: 'none', scrollTrigger: { ...st } });
    });
  }

  // ------------------------------------------------------------- review-uri
  reviewStyle(i: number): Record<string, string> {
    const n = this.reviews.length;
    const offset = (i - this.reviewIndex() + n) % n;
    const z = n - offset;
    return {
      transform: `translate3d(${offset * 26}px, ${offset * -22}px, ${-offset * 90}px) rotateZ(${offset * 2.5}deg)`,
      opacity: String(offset === 0 ? 1 : 0.75 - offset * 0.2),
      filter: offset === 0 ? 'none' : `blur(${offset * 1.5}px)`,
      zIndex: String(z),
      pointerEvents: offset === 0 ? 'auto' : 'none'
    };
  }

  nextReview(): void {
    this.reviewIndex.update((i) => (i + 1) % this.reviews.length);
  }

  prevReview(): void {
    this.reviewIndex.update((i) => (i - 1 + this.reviews.length) % this.reviews.length);
  }

  deckDown(e: PointerEvent): void {
    this.deckStartX = e.clientX;
  }

  deckUp(e: PointerEvent): void {
    const dx = e.clientX - this.deckStartX;
    if (Math.abs(dx) > 50) dx < 0 ? this.nextReview() : this.prevReview();
  }

  // ------------------------------------------------------------- CTA
  onLens(e: PointerEvent): void {
    const el = this.lensEl().nativeElement;
    const r = el.getBoundingClientRect();
    const title = el.querySelector('.lens-layer') as HTMLElement | null;
    el.style.setProperty('--lrx', `${e.clientX - r.left}px`);
    el.style.setProperty('--lry', `${e.clientY - r.top}px`);
    if (title) {
      const tr = title.getBoundingClientRect();
      title.style.setProperty('--lx', `${e.clientX - tr.left}px`);
      title.style.setProperty('--ly', `${e.clientY - tr.top}px`);
    }
  }

  /** Culoarea fiecarei litere din cuvintele accentuate: rosu -> violet -> cyan. */
  accentColor(i: number, n: number): string {
    const stops = [
      [255, 77, 94],
      [139, 92, 255],
      [94, 242, 255]
    ];
    const t = n > 1 ? i / (n - 1) : 0;
    const seg = t < 0.5 ? 0 : 1;
    const local = seg === 0 ? t * 2 : (t - 0.5) * 2;
    const [a, b] = [stops[seg], stops[seg + 1]];
    const c = a.map((v, k) => Math.round(v + (b[k] - v) * local));
    return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
  }

  // ------------------------------------------------------------- utilitare
  onHeroBgError(): void {
    if (this.heroIndex() < this.heroCandidates.length - 1) {
      this.heroIndex.update((i) => i + 1);
    }
  }

  scrollTo(selector: string): void {
    this.scroller.scrollTo(selector);
  }

  private now(): string {
    return new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}

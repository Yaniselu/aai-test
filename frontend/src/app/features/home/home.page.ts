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
  VelocityMarqueeComponent
} from '../../shared/motion/motion.components';
import {
  MagnetDirective,
  ParallaxDirective,
  RevealDirective,
  TiltDirective
} from '../../shared/motion/motion.directives';
import {
  ImpactDirective,
  KineticTextComponent,
  PauseOffscreenDirective,
  SlashComponent,
  WipeDirective
} from '../../shared/motion/aggressive.motion';
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
    VelocityMarqueeComponent,
    ImpactDirective,
    KineticTextComponent,
    SlashComponent,
    WipeDirective,
    PauseOffscreenDirective,
    MagnetDirective,
    RevealDirective,
    TiltDirective,
    ParallaxDirective
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aia-section-dots [sections]="dots()" />

    <!-- ═══════════════ HERO ═══════════════ -->
    <section id="acasa" #hero aiaPauseOffscreen class="hero relative -mt-[92px] overflow-hidden pt-[92px] lg:h-[100svh] lg:min-h-[720px]">
      <div #heroBg class="hero-bg absolute inset-0" aria-hidden="true">
        <img
          [src]="heroBgSrc()"
          alt=""
          class="hero-img aia-flicker absolute inset-0 h-full w-full object-cover"
          fetchpriority="high"
          loading="eager"
          decoding="sync"
          (error)="onHeroBgError()"
        />
        <div
          class="absolute inset-0"
          style="background:
            radial-gradient(ellipse at 72% 45%, rgba(255,0,25,.35), transparent 50%),
            linear-gradient(90deg, var(--aia-bg) 4%, color-mix(in srgb, var(--aia-bg) 70%, transparent) 46%, color-mix(in srgb, var(--aia-bg) 30%, transparent) 100%),
            linear-gradient(180deg, color-mix(in srgb, var(--aia-bg) 40%, transparent), transparent 40%, var(--aia-bg) 98%)"
        ></div>
      </div>

      <aia-mesh-background class="opacity-50" />
      <div class="hero-spot-wrap" aria-hidden="true"><span #spot class="hero-spot"></span></div>

      <!-- Linii de viteza si unde de soc care pornesc din spatele telefoanelor -->
      <div class="hero-fx" aria-hidden="true">
        <span class="shock"></span>
        <span class="shock s2"></span>
        @for (l of speedLines; track l.a) {
          <i class="speed" [style.--a]="l.a + 'deg'" [style.--i]="l.i"></i>
        }
      </div>

      <!-- Cuvantul urias din spate, contur rosu care palpaie ca un stroboscop -->
      <div class="hero-word font-display aia-text-outline-red" aria-hidden="true">{{ 'hero.bigword' | translate }}</div>

      <!-- Taieturi rosii care trec prin cadru la intrare -->
      <span class="hero-slash s1" aria-hidden="true"></span>
      <span class="hero-slash s2" aria-hidden="true"></span>

      <!-- HUD de camera: colturi de vizor, REC, timecode, coordonate -->
      <div class="hud pointer-events-none absolute inset-0 z-[5]" aria-hidden="true">
        <span class="hud-scan"></span>
        <i class="hc tl"></i><i class="hc tr"></i><i class="hc bl"></i><i class="hc br"></i>
        <div class="hud-rec font-heading"><span class="rec-dot"></span>REC <span class="aia-index">{{ timecode() }}</span></div>
        <div class="hud-geo font-heading">44.3182°N · 23.7684°E · CRAIOVA</div>
        <div class="hud-side font-heading">ACADEMIA ION ANDREI — KICKBOX — KARATE — EST. 2020</div>
        <div class="hud-iso font-heading">ISO 3200 · 1/250 · F1.8</div>
      </div>

      <!-- Benzi letterbox, cinemascope -->
      <span class="lb-bar lb-top" aria-hidden="true"></span>
      <span class="lb-bar lb-bot" aria-hidden="true"></span>

      <div class="aia-container relative z-10 grid h-full items-center gap-10 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:py-0">
        <div #heroText class="hero-text">
          <h1
            class="hero-title font-display text-[16vw] leading-[0.86] sm:text-[11vw] lg:text-[6.2rem] xl:text-[7rem] 2xl:text-[8.6rem]"
            [attr.aria-label]="'hero.title' | translate"
            [attr.data-text]="'hero.title' | translate"
          >
            @for (w of titleWords(); track $index; let wi = $index; let last = $last) {
              <span class="word" aria-hidden="true" [class.accent]="wi >= titleWords().length - 2">
                @for (c of w.chars; track $index; let ci = $index) {
                  <span class="ch">{{ c }}</span>
                }
              </span>{{ last ? '' : ' ' }}
            }
          </h1>

          <p class="hero-in mt-7 max-w-md text-[15px] leading-relaxed sm:text-base" [style.color]="'var(--aia-text-muted)'">
            {{ 'hero.subtitle' | translate }}
          </p>

          <div class="hero-in mt-8 grid grid-cols-1 gap-3 sm:flex sm:flex-wrap">
            <a routerLink="/auth/register" aiaMagnet class="aia-btn aia-btn-primary !px-8 !py-4">
              <span>{{ 'hero.cta' | translate }}</span>
              <aia-icon name="arrow-right" [size]="16" />
            </a>
            <button type="button" aiaMagnet [magnetStrength]="0.2" class="aia-btn aia-btn-ghost !px-8 !py-4" (click)="scrollTo('#grupe')">
              <span>{{ 'hero.groups' | translate }}</span>
            </button>
          </div>

          <dl class="mt-9 grid max-w-xl grid-cols-3 gap-3 sm:gap-4">
            @for (stat of stats; track stat.key; let i = $index) {
              <div class="hero-in aia-card p-4 sm:p-5" aiaTilt [tiltMax]="10">
                <span class="aia-corner"></span>
                <dd class="font-display text-3xl text-[var(--aia-blood)] sm:text-4xl">
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
        <div #stage class="stage relative mx-auto h-[520px] w-full max-w-[560px] sm:h-[600px] lg:h-[680px] 2xl:h-[820px] 2xl:max-w-[720px]" aria-hidden="true">
          <div #stageInner class="stage-inner absolute inset-0">
            <!-- .hp = scroll, .hp-in = intrare, .pose = pozitie 3D statica, aia-phone = plutire.
                 Fiecare strat are propriul transform, ca animatiile sa nu se suprascrie. -->
            <div class="hp hp-left"><div class="hp-in"><div class="pose">
              <aia-phone class="hp-w" [image]="photos.competition" ui="story" [caption]="'hero.phone1' | translate" ago="3h" />
            </div></div></div>
            <div class="hp hp-right"><div class="hp-in"><div class="pose">
              <aia-phone class="hp-w" [video]="videos[1].src" [poster]="videos[1].poster" [caption]="'hero.phone2' | translate" [baseLikes]="1560" />
            </div></div></div>
            <div class="hp hp-center"><div class="hp-in"><div class="pose">
              <aia-phone
                class="hp-w-lg"
                [video]="videos[0].src"
                [poster]="videos[0].poster"
                [caption]="'hero.phone3' | translate"
                [baseLikes]="2310"
                [comments]="142"
                [active]="true"
              />
            </div></div></div>

            <div class="badges">
            <div class="badge aia-glass-lite b-live">
              <span class="live-dot"></span>
              <span class="font-heading text-[10px] font-bold uppercase tracking-[0.18em]">{{ 'hero.live' | translate }}</span>
            </div>
            <div class="badge aia-glass-lite b-medal">
              <span class="b-ico" style="background: linear-gradient(135deg,#ff1f3d,#ffb3bb)"><aia-icon name="trophy" [size]="16" /></span>
              <span>
                <b class="font-display text-lg leading-none">17</b>
                <small>{{ 'hero.badgeMedals' | translate }}</small>
              </span>
            </div>
            <div class="badge aia-glass-lite b-new">
              <span class="b-ico" style="background: linear-gradient(135deg,#ff1f3d,#7a0010)"><aia-icon name="play" [size]="14" /></span>
              <span>
                <b>{{ 'hero.badgeNew' | translate }}</b>
                <small>{{ 'hero.badgeNewSub' | translate }}</small>
              </span>
            </div>
            <div class="badge aia-glass-lite b-heart">
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
      <div class="mq-band aia-tape -mx-4 h-3 rotate-[-3deg]"></div>
      <div class="mq-band -mx-4 rotate-[-3deg] bg-[var(--aia-blood)] py-1 text-white">
        <aia-velocity-marquee
          [items]="'marquee.a' | translate"
          klass="font-display text-5xl uppercase leading-none sm:text-7xl"
        />
      </div>
      <div class="mq-band aia-tape -mx-4 h-3 rotate-[-3deg]"></div>
      <div class="mq-band -mx-4 mt-6 rotate-[2deg] bg-black py-1">
        <aia-velocity-marquee
          [reverse]="true"
          [items]="'marquee.b' | translate"
          klass="font-display aia-text-outline text-5xl uppercase leading-none sm:text-7xl"
        />
      </div>
    </div>

    <!-- ═══════════════ SPIRIT ═══════════════ -->
    <section id="despre" class="relative scroll-mt-28 overflow-x-clip py-24 lg:py-36">
      <span class="ghost-num font-display aia-text-outline" aiaParallax [parallaxSpeed]="0.9" aria-hidden="true">01</span>
      <span class="aia-deco-slash left-[-6vw] top-[18%]" aiaParallax [parallaxSpeed]="1.6" aria-hidden="true"></span>
      <span class="aia-deco-slash right-[-8vw] top-[55%] !w-[30vw]" aiaParallax [parallaxSpeed]="-1.2" aria-hidden="true"></span>
      <div class="aia-container">
        <h2 class="aia-section-title max-w-4xl" [aiaImpact]="'about.title' | translate"></h2>

        <!-- Manifest care se aprinde cuvant cu cuvant la scroll -->
        <p #manifesto class="manifesto mt-14 max-w-6xl font-display text-[9vw] uppercase leading-[0.98] sm:text-[6vw] lg:text-[4.4rem]">
          @for (w of manifestoWords(); track $index) {
            <span class="mw">{{ w.word }}</span>{{ ' ' }}
          }
        </p>

        <div #pillarsEl class="mt-20 grid gap-5 md:grid-cols-3" style="perspective: 1200px">
          @for (pillar of pillars; track pillar.key; let i = $index) {
            <article class="pillar aia-card p-8 lg:p-10" aiaTilt [tiltMax]="9">
              <span class="aia-corner"></span>
              <div class="flex items-start justify-between">
                <span class="pillar-ico aia-glass-lite">
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

      </div>
    </section>

    <!-- ═══════════════ CLASH — scena fixata: doua cuvinte se izbesc ═══════════════ -->
    <section class="clash relative overflow-hidden" [attr.aria-label]="'clash.label' | translate">
      <div class="clash-stage absolute inset-0">
        <div class="clash-vs font-display aia-text-outline" aria-hidden="true">{{ 'clash.vs' | translate }}</div>
        <div class="clash-word clash-left font-display" aria-hidden="true">{{ 'clash.left' | translate }}</div>
        <div class="clash-word clash-right font-display aia-text-outline-red" aria-hidden="true">{{ 'clash.right' | translate }}</div>
        <div class="clash-shards" aria-hidden="true">
          @for (sh of shards; track sh) {
            <i class="shard" [attr.data-i]="sh"></i>
          }
        </div>
        <div class="clash-result">
          <p class="clash-res-word font-display">{{ 'clash.result' | translate }}</p>
          <p class="clash-sub font-heading">{{ 'clash.sub' | translate }}</p>
        </div>
      </div>
    </section>

    <!-- ═══════════════ TRASEUL SPORTIVULUI ═══════════════
         Desktop: sectiune fixata, etapele defileaza orizontal odata cu scroll-ul.
         Mobil: lista verticala, linia se deseneaza in jos. -->
    <section class="journey-pin relative overflow-x-clip py-20 lg:py-0" [attr.aria-label]="'about.journeyTitle' | translate">
      <div class="aia-container journey-head flex flex-wrap items-end justify-between gap-4">
        <h2 class="aia-section-title" [aiaImpact]="'about.journeyTitle' | translate"></h2>
        <p class="hidden font-heading text-xs uppercase tracking-[0.3em] lg:block" [style.color]="'var(--aia-text-muted)'">{{ 'journey.hint' | translate }} &rarr;</p>
      </div>
      <div #journeyEl class="journey relative mt-12 lg:mt-16">
        <div class="journey-row relative">
          <div class="track absolute" aria-hidden="true">
            <div class="fill"></div>
          </div>
          <ol class="j-list relative">
            @for (step of journey; track step; let i = $index) {
              <li class="j-step relative" [class.on]="journeyStep() >= i">
                <span class="node" aria-hidden="true"><i></i></span>
                <div class="j-card aia-card-flat">
                  <span class="j-num font-display aia-text-outline-red" aria-hidden="true">0{{ i + 1 }}</span>
                  <h3 class="relative font-display text-2xl lg:text-4xl">{{ 'about.journey.' + step | translate }}</h3>
                  <p class="relative mt-3 text-sm leading-relaxed lg:text-[15px]" [style.color]="'var(--aia-text-muted)'">
                    {{ 'about.journey.' + step + 'Text' | translate }}
                  </p>
                </div>
              </li>
            }
          </ol>
        </div>
      </div>
    </section>

    <aia-kinetic [top]="'kinetic.k1a' | translate" [bottom]="'kinetic.k1b' | translate" />
    <aia-slash [label]="'rounds.r1' | translate" />

    <!-- ═══════════════ GRUPE — carduri care se stivuiesc ═══════════════ -->
    <section id="grupe" class="relative scroll-mt-20 overflow-x-clip py-24 lg:py-32">
      <span class="ghost-num font-display aia-text-outline" aiaParallax [parallaxSpeed]="0.9" aria-hidden="true">02</span>
      <div class="aia-container">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 class="aia-section-title" [aiaImpact]="'groups.title' | translate"></h2>
          </div>
        </div>

        <div #stackEl class="stack mt-14 pb-[6vh]">
          @for (group of groups; track group.id; let i = $index) {
            <!-- .stack-card = lipit + micsorat la scroll; .stack-inner = intrare + sticla -->
            <div class="stack-card" [style.top.px]="100 + i * 26">
            <article class="stack-inner solid aia-card h-full overflow-hidden">
              <span class="aia-corner !z-30" style="--corner: 34px"></span>
              <div class="stack-dim pointer-events-none absolute inset-0 z-20 rounded-[inherit] bg-black opacity-0" aria-hidden="true"></div>
              <div class="grid h-full lg:grid-cols-[1.1fr_0.9fr]">
                <div class="aia-duo relative h-[260px] overflow-hidden sm:h-[340px] lg:h-full" aiaWipe>
                  <img
                    [src]="group.image"
                    [alt]="group.nameKey | translate"
                    class="stack-img absolute inset-0 h-[120%] w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div class="absolute inset-0" style="background: linear-gradient(90deg, transparent 50%, rgba(4,4,10,.55)), linear-gradient(0deg, rgba(4,4,10,.6), transparent 40%)"></div>
                  <span class="aia-chip absolute left-5 top-5 !text-white">{{ group.ageKey | translate }}</span>
                </div>

                <div class="stack-text relative flex flex-col justify-center p-7 pt-24 sm:p-10 sm:pt-28 lg:p-14">
                  <span class="font-display aia-text-outline-red pointer-events-none absolute right-5 top-3 text-[84px] leading-none sm:text-[110px] lg:right-8 lg:top-6 lg:text-[150px]">0{{ i + 1 }}</span>
                  <h3 class="relative font-display text-5xl lg:text-7xl">{{ group.nameKey | translate }}</h3>
                  <p class="relative mt-5 max-w-md text-[15px] leading-relaxed" [style.color]="'var(--aia-text-muted)'">
                    {{ group.textKey | translate }}
                  </p>
                  <div class="relative mt-6 flex flex-wrap gap-2">
                    @for (tag of asList(group.tagsKey | translate); track tag) {
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

    <aia-slash [label]="'rounds.r2' | translate" />

    <!-- ═══════════════ PROGRAM ═══════════════ -->
    <section id="program" class="relative scroll-mt-28 overflow-x-clip py-24 lg:py-32">
      <span class="ghost-num font-display aia-text-outline" aiaParallax [parallaxSpeed]="0.9" aria-hidden="true">03</span>
      <div class="aia-container">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 class="aia-section-title" [aiaImpact]="'schedule.title' | translate"></h2>
          </div>
          <div class="aia-glass-lite flex items-center gap-3 rounded-full px-5 py-3" aiaReveal>
            <aia-icon name="clock" [size]="16" />
            <span class="aia-index text-lg">{{ clock() }}</span>
            <span class="text-[10px] uppercase tracking-[0.2em]" [style.color]="'var(--aia-text-muted)'">Craiova</span>
          </div>
        </div>

        <div class="aia-card mt-12 overflow-hidden p-4 sm:p-6 lg:p-8" aiaWipe>
          <aia-schedule />
        </div>
      </div>
    </section>

    <aia-kinetic [top]="'kinetic.k2a' | translate" [bottom]="'kinetic.k2b' | translate" />

    <!-- ═══════════════ ANTRENORI — panouri care se extind ═══════════════ -->
    <section id="antrenori" class="relative scroll-mt-28 overflow-x-clip py-24 lg:py-32">
      <span class="ghost-num font-display aia-text-outline" aiaParallax [parallaxSpeed]="0.9" aria-hidden="true">04</span>
      <span class="aia-deco-slash right-[-6vw] top-[10%]" aiaParallax [parallaxSpeed]="1.4" aria-hidden="true"></span>
      <div class="aia-container">
        <div class="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 class="aia-section-title max-w-3xl" [aiaImpact]="'coaches.title' | translate"></h2>
          </div>
          <p class="hidden text-xs lg:block" [style.color]="'var(--aia-text-muted)'" aiaReveal>{{ 'coaches.hover' | translate }} &rarr;</p>
        </div>

        <div class="coaches mt-12 flex flex-col gap-4 lg:h-[600px] lg:flex-row" aiaReveal>
          @for (coach of coaches; track coach.id; let i = $index) {
            <article
              class="coach aia-card overflow-hidden"
              aiaWipe
              [wipeDelay]="i * 0.12"
              [class.open]="activeCoach() === i"
              (pointerenter)="activeCoach.set(i)"
              (focusin)="activeCoach.set(i)"
              tabindex="0"
            >
              <img [src]="coach.image" [alt]="coach.nameKey ? (coach.nameKey | translate) : coach.name" class="coach-img absolute inset-0 h-full w-full object-cover" loading="lazy" decoding="async" />
              <div class="absolute inset-0" style="background: linear-gradient(180deg, rgba(255,0,25,.18), transparent 35%)"></div>
              <div class="absolute inset-0" style="background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,.9))"></div>

              <span class="coach-flash" aria-hidden="true"></span>
              <span class="coach-vert font-display" aria-hidden="true">{{ coach.nameKey ? (coach.nameKey | translate) : coach.name }}</span>

              <div class="coach-body absolute inset-x-0 bottom-0 p-6 lg:p-8">
                <div class="aia-glass-lite rounded-[22px] p-5 lg:p-6">
                  <p class="text-[10px] uppercase tracking-[0.18em]" [style.color]="'var(--aia-cyan)'">{{ 'coaches.list.' + coach.id + '.role' | translate }}</p>
                  <h3 class="mt-2 font-display text-xl text-white lg:text-3xl">{{ coach.nameKey ? (coach.nameKey | translate) : coach.name }}</h3>
                  <p class="mt-2 text-sm text-white/70">{{ 'coaches.list.' + coach.id + '.focus' | translate }}</p>
                </div>
              </div>
            </article>
          }
        </div>
      </div>
    </section>

    <aia-slash [label]="'rounds.r3' | translate" />

    <!-- ═══════════════ REVIEW-URI — pachet de carti 3D ═══════════════ -->
    <section class="relative overflow-x-clip py-24 lg:py-32">
      <span class="ghost-num font-display aia-text-outline" aiaParallax [parallaxSpeed]="0.9" aria-hidden="true">05</span>
      <div class="aia-container grid items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 class="aia-section-title" [aiaImpact]="'reviews.title' | translate"></h2>
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
          @for (r of reviews; track r.id; let i = $index) {
            <figure class="review solid aia-card absolute inset-0 flex flex-col p-7 sm:p-10" [style]="reviewStyle(i)" [attr.aria-hidden]="i !== reviewIndex()">
              <span class="quote font-display" aria-hidden="true">&ldquo;</span>
              <div class="flex gap-1" [style.color]="'#ff1f3d'" aria-label="5/5">
                @for (star of stars; track star) {
                  <aia-icon name="star" [size]="15" />
                }
              </div>
              <blockquote class="mt-5 text-lg leading-relaxed sm:text-2xl">{{ 'reviews.list.' + r.id + '.text' | translate }}</blockquote>
              <figcaption class="mt-auto flex items-center gap-3 pt-6 text-sm" [style.color]="'var(--aia-text-muted)'">
                <span class="grid h-10 w-10 place-items-center rounded-full font-display text-xs text-white" style="background: linear-gradient(135deg,var(--aia-blood),var(--aia-violet))">{{ ('reviews.list.' + r.id + '.author' | translate).charAt(0) }}</span>
                {{ 'reviews.list.' + r.id + '.author' | translate }}
              </figcaption>
              @if (i === reviewIndex()) {
                <span class="progress" [class.paused]="reviewPaused()" (animationend)="nextReview()" aria-hidden="true"></span>
                <!-- Lama care taie cardul la fiecare schimbare (elementul e recreat, deci animatia reporneste) -->
                <span class="swap-slash" aria-hidden="true"></span>
              }
            </figure>
          }
        </div>
      </div>
    </section>

    <aia-kinetic [top]="'kinetic.k3a' | translate" [bottom]="'kinetic.k3b' | translate" />

    <!-- ═══════════════ MEDIA ═══════════════ -->
    <aia-media-showcase />

    <!-- ═══════════════ CIFRE — numaratoare legata de scroll ═══════════════ -->
    <section class="stats-band relative overflow-x-clip py-24 lg:py-36">
      <span class="ghost-num font-display aia-text-outline" aiaParallax [parallaxSpeed]="0.9" aria-hidden="true">06</span>
      <span class="aia-deco-slash left-[-10vw] top-[30%] !w-[50vw]" aiaParallax [parallaxSpeed]="1.4" aria-hidden="true"></span>
      <div class="aia-container">
        <h2 class="aia-section-title max-w-4xl" [aiaImpact]="'stats.title' | translate"></h2>
        <div class="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 lg:mt-20 lg:grid-cols-4">
          @for (st of bigStats; track st.key; let i = $index) {
            <div class="stat">
              <div class="flex items-start leading-none">
                <span class="stat-num font-display" [class.aia-text-outline-red]="i % 2 === 1" [attr.data-to]="st.value">{{ st.value }}</span>
                <span class="font-display text-4xl text-[var(--aia-blood)] lg:text-6xl">+</span>
              </div>
              <span class="stat-bar" aria-hidden="true"><i></i></span>
              <p class="mt-4 font-heading text-xs uppercase tracking-[0.3em] lg:text-sm" [style.color]="'var(--aia-text-muted)'">{{ st.key | translate }}</p>
            </div>
          }
        </div>
      </div>
    </section>

    <aia-slash [label]="'rounds.final' | translate" />

    <!-- ═══════════════ CTA cu lentila ═══════════════ -->
    <section class="relative py-24 lg:py-36">
      <div class="aia-container">
        <div
          #lensEl
          aiaPauseOffscreen
          class="lens-wrap aia-card relative overflow-hidden px-6 py-20 text-center sm:px-12 lg:py-28"
          (pointermove)="onLens($event)"
          (pointerleave)="lensOn.set(false)"
          (pointerenter)="lensOn.set(true)"
        >
          <span class="cta-stripes" aria-hidden="true"></span>
          <div class="relative">
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
    <aia-kinetic [top]="'kinetic.k4a' | translate" [bottom]="'kinetic.k4b' | translate" />
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
      .hero-title .accent .ch { color: var(--aia-blood); text-shadow: 0 0 50px rgba(255, 0, 25, 0.55); }
      .hero-title { text-shadow: 0 10px 40px rgba(0, 0, 0, 0.6); }

      .hero-img { filter: grayscale(1) contrast(1.4) brightness(0.7); }
      .hero-spot-wrap { position: absolute; inset: 0; z-index: 1; overflow: hidden; pointer-events: none; }
      .hero-spot {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 70vmax;
        height: 70vmax;
        margin: -35vmax 0 0 -35vmax;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255, 0, 25, 0.28), transparent 62%);
        will-change: transform;
      }
      .hero-bg::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(200deg, rgba(255, 0, 25, 0.3), transparent 55%);
      }

      .hero-word {
        position: absolute;
        z-index: 1;
        right: -4vw;
        top: 50%;
        font-size: 34vw;
        line-height: 0.8;
        transform: translateY(-50%);
        pointer-events: none;
        opacity: 0.55;
        animation: strobe 4s steps(1) infinite;
      }
      /* Un singur clipit scurt la cateva secunde: agresiv, dar fara stroboscop. */
      @keyframes strobe {
        0%, 84%, 100% { opacity: 0.5; }
        86% { opacity: 0.12; }
        88% { opacity: 0.85; }
        92% { opacity: 0.5; }
      }
      @media (max-width: 1023px) { .hero-word { font-size: 52vw; top: 72%; right: -10vw; } }

      .hero-slash {
        position: absolute;
        z-index: 6;
        left: -20%;
        right: -20%;
        height: 14px;
        background: var(--aia-blood);
        box-shadow: 0 0 50px 8px rgba(255, 0, 25, 0.7);
        pointer-events: none;
        transform-origin: left center;
        transform: rotate(-14deg) scaleX(0);
      }
      .s1 { top: 38%; }
      .s2 { top: 62%; height: 4px; transform: rotate(-14deg) scaleX(0); background: #fff; box-shadow: 0 0 30px rgba(255, 255, 255, 0.8); }

      .hc { position: absolute; width: 28px; height: 28px; border: 0 solid var(--aia-text); opacity: 0.7; }
      .hc.tl { left: 18px; top: 104px; border-left-width: 2px; border-top-width: 2px; }
      .hc.tr { right: 18px; top: 104px; border-right-width: 2px; border-top-width: 2px; }
      .hc.bl { left: 18px; bottom: 18px; border-left-width: 2px; border-bottom-width: 2px; }
      .hc.br { right: 18px; bottom: 18px; border-right-width: 2px; border-bottom-width: 2px; }
      .hud-rec, .hud-geo, .hud-side, .hud-iso {
        position: absolute;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.3em;
        color: var(--aia-text);
        opacity: 0.75;
      }
      .hud-rec { left: 56px; top: 108px; display: flex; align-items: center; gap: 10px; color: #fff; }
      .rec-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--aia-blood); box-shadow: 0 0 12px var(--aia-blood); animation: rec 1s steps(1) infinite; }
      @keyframes rec { 50% { opacity: 0; } }
      .hud-geo { left: 56px; bottom: 24px; }
      .hud-iso { right: 56px; bottom: 24px; }
      .hud-side { right: 22px; top: 50%; writing-mode: vertical-rl; transform: translateY(-50%); font-size: 10px; }
      @media (max-width: 1023px) { .hud-side, .hud-iso, .hc.tl, .hc.tr, .hud-rec { display: none; } }

      /* Linia de scanare a camerei, care coboara continuu prin cadru. */
      .hud-scan {
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 120px;
        background: linear-gradient(180deg, transparent, rgba(255, 0, 25, 0.08) 85%, rgba(255, 0, 25, 0.5) 99%, transparent);
        animation: scan 6s linear infinite;
      }
      @keyframes scan {
        from { transform: translateY(-120px); }
        to { transform: translateY(100svh); }
      }
      .lb-bar { position: absolute; left: 0; right: 0; z-index: 7; height: 0; background: #000; pointer-events: none; }
      .lb-top { top: 0; }
      .lb-bot { bottom: 0; }
      .live-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--aia-blood);
        box-shadow: 0 0 10px var(--aia-blood);
        animation: aia-pulse-dot 1.6s ease-out infinite;
        flex-shrink: 0;
      }

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
      @media (min-width: 1536px) {
        .hp-w { width: 250px; }
        .hp-w-lg { width: 330px; }
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

      /* ---------- hero: linii de viteza + unde de soc ---------- */
      .hero-fx {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
        overflow: hidden;
        --cx: 72%;
        --cy: 50%;
      }
      @media (max-width: 1023px) { .hero-fx { --cx: 50%; --cy: 78%; } }
      .shock {
        position: absolute;
        left: var(--cx);
        top: var(--cy);
        width: 64vmin;
        height: 64vmin;
        margin: -32vmin 0 0 -32vmin;
        border: 2px solid var(--aia-blood);
        border-radius: 50%;
        opacity: 0;
        animation: shock 3.2s cubic-bezier(0.16, 1, 0.3, 1) infinite;
      }
      .shock.s2 { animation-delay: 1.6s; border-color: rgba(255, 255, 255, 0.5); }
      @keyframes shock {
        0% { transform: scale(0.12); opacity: 0.9; }
        65% { opacity: 0; }
        100% { transform: scale(2.4); opacity: 0; }
      }
      .speed {
        position: absolute;
        left: var(--cx);
        top: var(--cy);
        width: 55vw;
        height: 2px;
        transform-origin: 0 50%;
        rotate: var(--a);
        background: linear-gradient(90deg, transparent, rgba(255, 0, 25, 0.85) 55%, transparent);
        opacity: 0;
        animation: speed 1.9s cubic-bezier(0.55, 0, 1, 0.45) infinite;
        animation-delay: calc(var(--i) * -0.16s);
      }
      @keyframes speed {
        0% { transform: translateX(8vw) scaleX(0.1); opacity: 0; }
        25% { opacity: 1; }
        100% { transform: translateX(46vw) scaleX(1); opacity: 0; }
      }

      /* ---------- numere fantoma ---------- */
      .ghost-num {
        position: absolute;
        right: -3vw;
        top: 4%;
        z-index: 0;
        font-size: clamp(160px, 34vw, 460px);
        line-height: 0.8;
        opacity: 0.22;
        pointer-events: none;
      }
      /* Sub continutul sectiunii (z-index negativ in contextul lui aia-root). */
      .ghost-num { z-index: -1; }

      /* ---------- clash ---------- */
      .clash { height: 100svh; min-height: 560px; }
      .clash-stage { display: grid; place-items: center; }
      .clash-stage > * { grid-area: 1 / 1; }
      .clash-vs { font-size: clamp(200px, 48vw, 760px); line-height: 0.8; opacity: 0.25; }
      .clash-word {
        font-size: clamp(64px, 15vw, 250px);
        line-height: 0.85;
        white-space: nowrap;
        will-change: transform;
      }
      .clash-left { color: var(--aia-text); }
      .clash-shards { position: relative; width: 0; height: 0; }
      .shard {
        position: absolute;
        left: -14px;
        top: -24px;
        width: 28px;
        height: 48px;
        background: var(--aia-blood);
        clip-path: polygon(50% 0, 100% 100%, 0 70%);
        opacity: 0;
      }
      .shard:nth-child(even) { background: var(--aia-text); width: 18px; height: 30px; }
      .clash-result { text-align: center; }
      .clash-res-word {
        font-size: clamp(72px, 17vw, 280px);
        line-height: 0.85;
        color: var(--aia-blood);
        text-shadow: 0 0 80px rgba(255, 0, 25, 0.55);
      }
      @media (max-width: 767px) {
        .clash-word { font-size: 22vw; }
        .clash-res-word { font-size: 22vw; }
      }
      .clash-sub { margin-top: 18px; font-size: 13px; letter-spacing: 0.5em; text-transform: uppercase; color: var(--aia-text-muted); }

      /* ---------- antrenori: flash la hover ---------- */
      .coach-flash { position: absolute; inset: 0; z-index: 3; background: var(--aia-blood); opacity: 0; pointer-events: none; }
      @media (hover: hover) {
        .coach:hover .coach-flash { animation: coach-flash 0.5s steps(1) 1; }
      }
      @keyframes coach-flash {
        0% { opacity: 0.55; }
        20% { opacity: 0; }
        40% { opacity: 0.3; }
        60%, 100% { opacity: 0; }
      }

      /* ---------- review: lama la schimbare ---------- */
      .swap-slash {
        position: absolute;
        inset: -10% -40%;
        z-index: 5;
        pointer-events: none;
        background: linear-gradient(100deg, transparent 42%, var(--aia-blood) 46%, var(--aia-blood) 54%, transparent 58%);
        transform: translateX(-100%);
        animation: swap-slash 0.6s cubic-bezier(0.85, 0, 0.15, 1) forwards;
      }
      @keyframes swap-slash { to { transform: translateX(100%); } }

      /* ---------- CTA: benzi de avertizare care curg ---------- */
      .cta-stripes {
        position: absolute;
        inset: -50% -10%;
        z-index: 0;
        pointer-events: none;
        opacity: 0.12;
        background: repeating-linear-gradient(-45deg, var(--aia-blood) 0 22px, transparent 22px 44px);
        animation: cta-stripes 1.4s linear infinite;
      }
      @keyframes cta-stripes { to { transform: translate3d(62.2px, 0, 0); } }

      /* ---------- cifre ---------- */
      .stat-num {
        font-size: clamp(76px, 15vw, 210px);
        line-height: 0.85;
        font-variant-numeric: tabular-nums;
        /* Latime fixa pe cifra: numaratoarea nu misca layout-ul in jurul ei. */
        min-width: 1.6ch;
      }
      .stat-bar { display: block; height: 3px; margin-top: 18px; background: var(--aia-border); overflow: hidden; }
      .stat-bar i { display: block; height: 100%; background: var(--aia-blood); transform-origin: left; transform: scaleX(0); }

      /* ---------- traseul sportivului ---------- */
      .j-list { display: grid; gap: 22px; padding: 0 20px 0 64px; }
      .journey .track {
        left: 42px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--aia-border);
      }
      .journey .fill {
        position: absolute;
        inset: 0;
        transform-origin: top;
        transform: scaleY(0);
        background: linear-gradient(180deg, var(--aia-blood), var(--aia-blood-deep));
        box-shadow: 0 0 16px var(--aia-blood);
      }
      .node {
        position: absolute;
        left: -36px;
        top: 26px;
        width: 30px;
        height: 30px;
        display: grid;
        place-items: center;
        background: var(--aia-bg);
        border: 2px solid var(--aia-border-strong);
        rotate: 45deg;
        transition: border-color 0.4s, transform 0.5s var(--aia-spring);
      }
      .node i { width: 10px; height: 10px; background: var(--aia-border-strong); transition: background 0.4s; }
      .j-step.on .node { border-color: var(--aia-blood); transform: scale(1.2); }
      .j-step.on .node i { background: var(--aia-blood-bright); }
      .j-card { position: relative; overflow: hidden; padding: 28px 24px; }
      .j-num {
        position: absolute;
        right: 14px;
        top: -6px;
        font-size: 96px;
        line-height: 1;
        opacity: 0.5;
        /* Fara tranzitie pe transform: transform-ul il conduce GSAP, legat de scroll. */
        transition: opacity 0.4s, translate 0.6s var(--aia-ease);
      }
      .j-step .j-card { transition: opacity 0.5s, transform 0.6s var(--aia-ease); opacity: 0.45; transform: translateY(14px); }
      .j-step.on .j-card { opacity: 1; transform: none; }
      .j-step.on .j-num { opacity: 1; translate: 0 6px; }

      @media (min-width: 1024px) {
        /* Rand orizontal fixat: latimea vine din etape, GSAP il deplaseaza pe X. */
        .journey-pin { min-height: 100svh; display: flex; flex-direction: column; justify-content: center; }
        .journey-row { width: max-content; will-change: transform; }
        .j-list {
          display: flex;
          gap: 3vw;
          padding: 70px max(6vw, calc((100vw - 1280px) / 2)) 0;
        }
        .j-step { width: clamp(340px, 34vw, 540px); }
        .journey .track { left: 0; right: 0; top: 22px; bottom: auto; width: auto; height: 2px; }
        .journey .fill { transform-origin: left; transform: scaleX(0); }
        .node { left: 0; top: -63px; }
        .j-card { padding: 44px 40px 48px; min-height: 340px; display: flex; flex-direction: column; justify-content: flex-end; }
        .j-num { font-size: 180px; top: -20px; right: 22px; }
      }

      /* Cardurile care se suprapun (stiva, pachetul de review-uri) sunt opace:
         prin sticla transparenta s-ar vedea textul cardului de dedesubt. */
      .solid {
        background: linear-gradient(160deg, #161616 0%, #080808 60%, #120206 100%);
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
      }
      :host-context(html.light) .solid { background: linear-gradient(160deg, #ffffff, #ececec); }

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
        filter: grayscale(1) contrast(1.4) brightness(0.55);
        transform: scale(1.12);
        transition: filter 0.8s, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .coach.open .coach-img { filter: grayscale(1) contrast(1.3) brightness(0.95); transform: scale(1); }
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
  private readonly spot = viewChild.required<ElementRef<HTMLElement>>('spot');

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
  readonly timecode = signal('00:00:00:00');
  private readonly tcStart = performance.now();

  readonly stars = [1, 2, 3, 4, 5];
  readonly stats = ACADEMY.stats;
  readonly groups = ACADEMY.groups;
  readonly coaches = ACADEMY.coaches;
  readonly reviews = ACADEMY.reviews;
  readonly photos = ACADEMY.photos;

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

  /** 12 linii de viteza, la unghiuri diferite. */
  readonly speedLines = Array.from({ length: 12 }, (_, i) => ({ a: -170 + i * 28 + (i % 2 ? 9 : -6), i }));
  readonly shards = Array.from({ length: 12 }, (_, i) => i);

  readonly bigStats = [
    { value: 293, key: 'stats.athletes' },
    { value: 17, key: 'stats.medals' },
    { value: 5, key: 'stats.years' },
    { value: 340, key: 'stats.clips' }
  ];

  private ctx?: gsap.Context;
  private mm?: gsap.MatchMedia;
  private raf?: number;
  private clockTimer?: number;
  private tcTimer?: number;
  private deckStartX = 0;
  private readonly tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  private heroIo?: IntersectionObserver;
  private heroVisible = true;
  private tiltLast = 0;
  private readonly cleanups: (() => void)[] = [];

  ngAfterViewInit(): void {
    this.clockTimer = setInterval(() => this.clock.set(this.now()), 1000) as unknown as number;
    this.tcTimer = setInterval(() => {
      const ms = performance.now() - this.tcStart;
      const f = Math.floor((ms / 1000) * 24) % 24;
      const sec = Math.floor(ms / 1000);
      const pad = (n: number) => String(n).padStart(2, '0');
      this.timecode.set(`${pad(Math.floor(sec / 3600))}:${pad(Math.floor(sec / 60) % 60)}:${pad(sec % 60)}:${pad(f)}`);
    }, 42) as unknown as number;
    if (this.anim.reducedMotion) {
      this.journeyStep.set(3);
      return;
    }

    this.ctx = gsap.context(() => {
      this.buildHeroIntro();
      this.buildHeroScroll();
      this.buildSpirit();
      this.buildStack();
      this.buildBatches();
      this.buildStats();
      this.buildClash();
      this.buildVelocitySkew();
      this.buildExtras();
    }, this.host.nativeElement);

    this.startStageTilt();
    // Sectiunile fixate (pin) se calculeaza in ordinea de pe pagina, nu in cea in
    // care au fost create; altfel una de mai jos porneste prea devreme si se
    // suprapune peste cea de deasupra.
    ScrollTrigger.sort();
    // Fonturile si imaginile schimba inaltimile dupa primul layout.
    setTimeout(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    }, 600);
  }

  ngOnDestroy(): void {
    this.ctx?.revert();
    this.mm?.revert();
    if (this.raf) cancelAnimationFrame(this.raf);
    clearInterval(this.clockTimer);
    clearInterval(this.tcTimer);
    window.removeEventListener('pointermove', this.onPointer);
    this.heroIo?.disconnect();
    this.cleanups.forEach((fn) => fn());
    this.anim.killAll();
  }

  // ------------------------------------------------------------- hero
  private buildHeroIntro(): void {
    const hero = this.hero().nativeElement;
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'expo.out' } });

    // Cinemascope: benzile negre intra, apoi se retrag ca o cortina.
    tl.fromTo('.lb-bar', { height: '50vh' }, { height: '9vh', duration: 0.7, ease: 'expo.inOut' }, 0)
      .to('.lb-bar', { height: 0, duration: 1.1, ease: 'expo.inOut' }, 1.9)

      // Taieturile trec prin cadru
      .to('.hero-slash', { scaleX: 1, duration: 0.32, ease: 'expo.in', stagger: 0.08 }, 0.35)
      .to('.hero-slash', { scaleY: 0, opacity: 0, duration: 0.5, ease: 'power2.out', stagger: 0.08 }, 0.75)

      // Literele cad din fata camerei si se infig
      .fromTo(
        '.hero-title .ch',
        {
          opacity: 0,
          scale: () => gsap.utils.random(3, 5),
          rotate: () => gsap.utils.random(-35, 35),
          yPercent: () => gsap.utils.random(-80, 60)
        },
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          yPercent: 0,
          duration: 0.45,
          ease: 'power4.in',
          stagger: { each: 0.03, from: 'random' }
        },
        0.55
      )
      .add(() => {
        const t = this.host.nativeElement.querySelector('.hero-title') as HTMLElement | null;
        const r = t?.getBoundingClientRect();
        if (r) this.anim.flash(r.left + r.width / 2, r.top + r.height / 2, 1);
        // Cutremurul doar pe titlu: un transform pe intreaga sectiune ar forta
        // compozitia unui strat cat tot hero-ul.
        if (t) this.anim.shake(t, 14);
        t?.classList.add('aia-glitch');
      })
      .fromTo('.hero-word', { scale: 1.6, opacity: 0 }, { scale: 1, opacity: 0.55, duration: 0.5, ease: 'power4.in', clearProps: 'opacity' }, '<-0.1')
      .from('.hero-in', { x: -80, skewX: 25, opacity: 0, duration: 0.7, stagger: 0.07 }, '<0.1')
      .from('.hp-in', { y: 600, rotateX: 60, opacity: 0, duration: 1.2, stagger: { each: 0.1, from: 'center' } }, '<')
      .from('.badge', { scale: 0, rotate: () => gsap.utils.random(-20, 20), opacity: 0, duration: 0.6, ease: 'back.out(3)', stagger: 0.08 }, '<0.5')
      .from('.hud > *', { opacity: 0, duration: 0.05, stagger: { each: 0.06, repeat: 3, yoyo: true } }, '<')
      .from('.scroll-cue', { opacity: 0, y: 20, duration: 1 }, '<0.3');

    // Pozitiile de start se aplica imediat; timeline-ul porneste odata cu usile intro-ului.
    tl.progress(0);
    this.anim.afterIntro(() => tl.play());
  }

  private buildHeroScroll(): void {
    const hero = this.hero().nativeElement;
    const st = { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.8 };

    gsap.to('.hero-bg img', { scale: 1.3, yPercent: 12, ease: 'none', scrollTrigger: st });
    gsap.to('.hero-word', { xPercent: -30, scale: 1.4, ease: 'none', scrollTrigger: st });
    gsap.to('.hud', { opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '40% top' } });
    gsap.to('.hero-text', { y: -140, opacity: 0, ease: 'none', scrollTrigger: { ...st, end: '80% top' } });
    // Telefoanele "explodeaza" in afara cadrului cand iesi din hero.
    gsap.to('.hp-left', { x: -220, y: -80, rotate: -16, ease: 'none', scrollTrigger: st });
    gsap.to('.hp-right', { x: 220, y: -160, rotate: 16, ease: 'none', scrollTrigger: st });
    gsap.to('.hp-center', { y: -120, scale: 1.08, ease: 'none', scrollTrigger: st });
    gsap.to('.badges', { y: -160, opacity: 0, ease: 'none', scrollTrigger: st });
    // Cuvintele titlului explodeaza in afara cadrului cand iesi din hero.
    // Pe cuvinte (nu pe litere): literele au deja propriul tween de intrare.
    gsap.to('.hero-title .word', {
      x: (i) => (i % 2 ? 1 : -1) * (140 + i * 60),
      y: (i) => -(90 + ((i * 53) % 180)),
      rotate: (i) => (i % 2 ? 1 : -1) * (12 + i * 7),
      scale: 1.35,
      opacity: 0,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: '65% top', scrub: 0.5 }
    });
  }

  /** Scena se inclina dupa cursor, iar sferele se misca pe adancimi diferite. */
  private startStageTilt(): void {
    if (window.matchMedia('(hover: none)').matches) return;
    const hero = this.hero().nativeElement;
    this.heroIo = new IntersectionObserver(([entry]) => (this.heroVisible = entry.isIntersecting));
    this.heroIo.observe(hero);
    window.addEventListener('pointermove', this.onPointer, { passive: true });
  }

  /** Bucla ruleaza doar cand mouse-ul se misca peste hero si se opreste cand scena s-a asezat. */
  private readonly tiltLoop = (now: number) => {
    const t = this.tilt;
    const dt = this.tiltLast ? Math.min((now - this.tiltLast) / 16.67, 3) : 1;
    this.tiltLast = now;
    const k = 1 - Math.pow(0.92, dt);
    t.x += (t.tx - t.x) * k;
    t.y += (t.ty - t.y) * k;
    this.stageInner().nativeElement.style.transform = `rotateY(${(t.x * 16).toFixed(2)}deg) rotateX(${(-t.y * 12).toFixed(2)}deg)`;
    // Lumina rosie din spate urmareste cursorul, mai lent decat scena.
    this.spot().nativeElement.style.transform = `translate3d(${(t.x * 50).toFixed(1)}vw, ${(t.y * 50).toFixed(1)}vh, 0)`;
    const settled = Math.abs(t.tx - t.x) < 0.001 && Math.abs(t.ty - t.y) < 0.001;
    this.raf = settled || !this.heroVisible ? undefined : requestAnimationFrame(this.tiltLoop);
    if (this.raf === undefined) this.tiltLast = 0;
  };

  private readonly onPointer = (e: PointerEvent) => {
    this.tilt.tx = e.clientX / innerWidth - 0.5;
    this.tilt.ty = e.clientY / innerHeight - 0.5;
    if (this.heroVisible && this.raf === undefined) this.raf = requestAnimationFrame(this.tiltLoop);
  };

  // ------------------------------------------------------------- spirit
  private buildSpirit(): void {
    gsap.fromTo(
      '.manifesto .mw',
      { opacity: 0.1 },
      {
        opacity: 1,
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
    const setStep = (p: number) => this.journeyStep.set(p > 0.01 ? Math.min(3, Math.floor(p * 4)) : -1);

    // Desktop: sectiunea se fixeaza, iar randul de etape defileaza orizontal.
    this.mm.add('(min-width: 1024px)', () => {
      const row = document.querySelector<HTMLElement>('.journey-row');
      if (!row) return;
      const distance = () => Math.max(row.scrollWidth - window.innerWidth, 0);
      gsap
        .timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: '.journey-pin',
            start: 'top top',
            end: () => '+=' + distance(),
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => setStep(self.progress)
          }
        })
        .to(row, { x: () => -distance() }, 0)
        .to('.journey .fill', { scaleX: 1 }, 0)
        .fromTo('.j-num', { xPercent: 30 }, { xPercent: -30, stagger: 0.05 }, 0);
    });

    // Mobil: lista verticala, linia se umple odata cu scroll-ul.
    this.mm.add('(max-width: 1023px)', () => {
      gsap.to('.journey .fill', {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.journey',
          start: 'top 75%',
          end: 'bottom 60%',
          scrub: 0.5,
          onUpdate: (self) => setStep(self.progress)
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

  /**
   * Elementele marunte (celule de program, campuri de formular, linkuri din
   * subsol) apar in rafale: ScrollTrigger.batch le grupeaza pe cele care intra
   * in ecran in acelasi timp si le da un stagger scurt, ca o salva.
   */
  private buildBatches(): void {
    const groups = [
      '#program li',
      'aia-locations-map .aia-card',
      'aia-locations-map li',
      'aia-contact-form .aia-input',
      'aia-contact-form .aia-btn',
      'aia-contact-form li'
    ];
    for (const sel of groups) {
      const els = gsap.utils.toArray<HTMLElement>(sel, document);
      if (!els.length) continue;
      gsap.set(els, { opacity: 0, y: 34, skewY: 3 });
      ScrollTrigger.batch(els, {
        start: 'top 92%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, skewY: 0, duration: 0.7, ease: 'expo.out', stagger: 0.045, overwrite: true, clearProps: 'transform' })
      });
    }
  }

  /**
   * Scena "clash": cele doua cuvinte vin din margini si se izbesc in centru.
   * La impact: flash, cutremur, cioburi care zboara si cuvantul castigator.
   * Totul e legat de scroll (scrub), deci merge si inainte, si inapoi.
   */
  private buildClash(): void {
    const stage = this.host.nativeElement.querySelector('.clash-stage') as HTMLElement | null;
    if (!stage) return;
    const mobile = window.innerWidth < 768;
    const IMPACT = 1.05;
    let prev = 0;
    // Pozitia de start: cuvantul sta la marginea ecranului, cu o bucata vizibila,
    // indiferent cat e de lung (RO si EN au lungimi diferite).
    const offscreen = (sel: string) => innerWidth / 2 + ((stage.querySelector(sel) as HTMLElement).offsetWidth / 2) * 0.55;
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      // Impactul (flash + cutremur) se declanseaza cand animatia insasi trece
      // de momentul ciocnirii, doar la derulare in jos.
      onUpdate: () => {
        const t = tl.time();
        if (prev < IMPACT && t >= IMPACT) {
          const r = stage.getBoundingClientRect();
          this.anim.flash(r.left + r.width / 2, r.top + r.height / 2, 0.85);
          this.anim.shake(stage, 18);
        }
        prev = t;
      },
      scrollTrigger: {
        trigger: '.clash',
        start: 'top top',
        end: mobile ? '+=130%' : '+=170%',
        pin: true,
        scrub: 0.5,
        anticipatePin: 1,
        invalidateOnRefresh: true
      }
    });
    tl.fromTo('.clash-vs', { scale: 2.6, opacity: 0.12, rotate: -12 }, { scale: 1, opacity: 0.25, rotate: 0, duration: 1 }, 0)
      // Cuvintele vin pe doua randuri decalate si se intalnesc in centru.
      .fromTo('.clash-left', { x: () => -offscreen('.clash-left'), yPercent: -58, skewX: 18 }, { x: () => -innerWidth * 0.04, yPercent: -58, skewX: 0, duration: 1, ease: 'power3.in' }, 0)
      .fromTo('.clash-right', { x: () => offscreen('.clash-right'), yPercent: 58, skewX: -18 }, { x: () => innerWidth * 0.04, yPercent: 58, skewX: 0, duration: 1, ease: 'power3.in' }, 0)
      .fromTo('.clash-result', { scale: 0.2, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.7, ease: 'back.out(2.4)' }, IMPACT + 0.1)
      .to('.clash-left', { xPercent: -130, yPercent: -150, rotate: -16, opacity: 0, duration: 1, ease: 'power2.out' }, IMPACT)
      .to('.clash-right', { xPercent: 130, yPercent: 150, rotate: 16, opacity: 0, duration: 1, ease: 'power2.out' }, IMPACT)
      .to('.clash-vs', { scale: 1.6, opacity: 0.08, duration: 1 }, IMPACT)
      // Cioburile: pozitia intr-un tween, opacitatea in altele doua, ca la derularea
      // inapoi sa redevina invizibile (nu sa ramana in centru).
      .fromTo(
        '.shard',
        { x: 0, y: 0, rotate: 0, scale: 0.4 },
        {
          x: (i) => Math.cos((i / 12) * Math.PI * 2) * (mobile ? 46 : 38) + 'vw',
          y: (i) => Math.sin((i / 12) * Math.PI * 2) * (mobile ? 40 : 34) + 'vh',
          rotate: (i) => (i % 2 ? 1 : -1) * (180 + i * 40),
          scale: (i) => 1 + (i % 3) * 0.6,
          duration: 1.1,
          ease: 'power2.out'
        },
        IMPACT
      )
      .fromTo('.shard', { opacity: 0 }, { opacity: 1, duration: 0.04 }, IMPACT)
      .to('.shard', { opacity: 0, duration: 0.5 }, IMPACT + 0.6)
      .to({}, { duration: 0.4 });
  }

  /**
   * Titlurile, benzile de text si marquee-urile se inclina dupa viteza scroll-ului
   * si revin cand scroll-ul se opreste. Un singur ScrollTrigger + quickTo pe fiecare
   * element: GSAP scrie direct transform-ul, fara variabile CSS globale.
   */
  private buildVelocitySkew(): void {
    const targets = gsap.utils.toArray<HTMLElement>('.aia-section-title, aia-kinetic .row, .mq-band, .clash-vs');
    const setters = new Map(targets.map((t) => [t, gsap.quickTo(t, 'skewY', { duration: 0.45, ease: 'power3.out' })]));
    // Doar elementele de pe ecran primesc inclinarea: restul nu costa nimic.
    const visible = new Set<HTMLElement>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          if (e.isIntersecting) visible.add(el);
          else if (visible.delete(el)) gsap.set(el, { skewY: 0 });
        }
      },
      { rootMargin: '10% 0px' }
    );
    targets.forEach((t) => io.observe(t));
    let reset: number | undefined;
    const apply = (v: number) => visible.forEach((el) => setters.get(el)?.(v));
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        apply(gsap.utils.clamp(-8, 8, self.getVelocity() / -280));
        clearTimeout(reset);
        reset = setTimeout(() => apply(0), 140) as unknown as number;
      }
    });
    this.cleanups.push(() => {
      io.disconnect();
      clearTimeout(reset);
    });
  }

  /** Intrari mai violente pentru antrenori si textele din stiva de grupe. */
  private buildExtras(): void {
    gsap.from('.coach', {
      yPercent: -40,
      rotate: (i) => (i - 1) * 7,
      opacity: 0,
      duration: 1.1,
      ease: 'expo.out',
      stagger: 0.12,
      scrollTrigger: { trigger: '.coaches', start: 'top 85%', once: true }
    });
    gsap.utils.toArray<HTMLElement>('.stack-inner').forEach((card) => {
      const text = card.querySelector('.stack-text');
      if (!text) return;
      gsap.fromTo(
        text.children,
        { x: 90, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.06, ease: 'power3.out', scrollTrigger: { trigger: card, start: 'top 85%', end: 'top 35%', scrub: 0.6 } }
      );
    });
  }

  /** Cifrele cresc odata cu scroll-ul (scrub), iar barele de sub ele se umplu. */
  private buildStats(): void {
    const nums = gsap.utils.toArray<HTMLElement>('.stat-num');
    const st = { trigger: '.stats-band', start: 'top 75%', end: 'center 45%', scrub: 0.6 };
    nums.forEach((el) => {
      const to = Number(el.dataset['to'] ?? 0);
      const state = { v: 0 };
      let shown = -1;
      gsap.to(state, {
        v: to,
        ease: 'power1.out',
        scrollTrigger: st,
        onUpdate: () => {
          const v = Math.round(state.v);
          // Scriem in DOM doar cand se schimba cifra, nu la fiecare cadru.
          if (v !== shown) {
            shown = v;
            el.textContent = String(v);
          }
        }
      });
    });
    gsap.to('.stat-bar i', { scaleX: 1, ease: 'none', stagger: 0.08, scrollTrigger: { ...st } });
    gsap.from('.stat', { y: 80, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.stats-band', start: 'top 80%', once: true } });
  }

  // ------------------------------------------------------------- review-uri
  reviewStyle(i: number): Record<string, string> {
    const n = this.reviews.length;
    const offset = (i - this.reviewIndex() + n) % n;
    const z = n - offset;
    return {
      // Cartile din spate urca si se micsoreaza, fara deplasare laterala: pe ecrane
      // inguste orice translatie pe X ar iesi din pagina.
      transform: `translate3d(0, ${offset * -18}px, ${-offset * 90}px) scale(${1 - offset * 0.05}) rotateZ(${offset * -2}deg)`,
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

  /** Pipe-ul translate intoarce cheia (string) pana se incarca fisierul; @for vrea o lista. */
  asList(value: unknown): string[] {
    return Array.isArray(value) ? value : [];
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

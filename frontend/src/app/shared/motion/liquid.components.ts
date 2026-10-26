import { TranslatePipe } from '@ngx-translate/core';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Subscription } from 'rxjs';
import { AnimationService } from '../../core/services/animation.service';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';

/**
 * Filtrele SVG folosite de sticla lichida.
 *
 * `#aia-liquid` deformeaza ce e in spatele sticlei cu un zgomot fin, ca o
 * lentila neregulata. E folosit prin `backdrop-filter: url(#aia-liquid)`
 * (clasa `.aia-refract`), pe care doar Chromium il intelege; restul
 * browserelor raman pe blur simplu.
 */
@Component({
  selector: 'aia-liquid-defs',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute">
      <defs>
        <filter id="aia-liquid" x="0%" y="0%" width="100%" height="100%" color-interpolation-filters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.011 0.016" numOctaves="2" seed="9" result="noise" />
          <feGaussianBlur in="noise" stdDeviation="2.2" result="soft" />
          <feDisplacementMap in="SourceGraphic" in2="soft" scale="46" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="aia-goo">
          <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="goo" />
          <feBlend in="SourceGraphic" in2="goo" />
        </filter>
      </defs>
    </svg>
  `,
  styles: [`:host { display: contents; }`]
})
export class LiquidDefsComponent {}

/**
 * Fundalul ambiental din spatele intregului site: pete mari de culoare care
 * curg lent.
 *
 * Sunt gradienti radiali pe elemente mari, animate doar prin `transform` din
 * CSS: compozitorul le muta fara repaint si fara niciun cod pe firul principal.
 */
@Component({
  selector: 'aia-ambient',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #layer class="layer" aria-hidden="true">
      <span class="blob b1"></span>
      <span class="blob b2"></span>
      <span class="blob b3"></span>
    </div>
    <div class="vignette" aria-hidden="true"></div>
  `,
  styles: [
    `
      :host {
        position: fixed;
        inset: 0;
        /* -1 in contextul lui aia-root: sub tot continutul, peste fundalul body. */
        z-index: -1;
        pointer-events: none;
        overflow: hidden;
      }
      .layer {
        position: absolute;
        inset: -20%;
        contain: strict;
      }
      .blob {
        position: absolute;
        border-radius: 50%;
        will-change: transform;
        opacity: 0.9;
      }
      .b1 {
        width: 60vmax; height: 60vmax; left: -5%; top: 0%;
        background: radial-gradient(circle, rgba(255, 0, 25, 0.38), transparent 62%);
        animation: drift1 26s ease-in-out infinite alternate;
      }
      .b2 {
        width: 55vmax; height: 55vmax; right: -8%; top: 10%;
        background: radial-gradient(circle, rgba(138, 0, 16, 0.45), transparent 62%);
        animation: drift2 32s ease-in-out infinite alternate;
      }
      .b3 {
        width: 50vmax; height: 50vmax; left: 25%; bottom: -10%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.05), transparent 62%);
        animation: drift3 28s ease-in-out infinite alternate;
      }
      .b4 {
        width: 34vmax; height: 34vmax; left: 55%; top: 40%;
        background: radial-gradient(circle, rgba(255, 0, 25, 0.22), transparent 60%);
        animation: drift2 21s ease-in-out infinite alternate-reverse;
      }
      .b5 {
        width: 28vmax; height: 28vmax; left: 10%; top: 55%;
        background: radial-gradient(circle, rgba(90, 0, 10, 0.5), transparent 60%);
        animation: drift1 24s ease-in-out infinite alternate-reverse;
      }
      .vignette {
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, transparent 30%, var(--aia-bg) 92%);
        opacity: 0.95;
      }
      :host-context(html.light) .blob { opacity: 0.55; }
      :host-context(html.light) .vignette { opacity: 0.4; }

      @keyframes drift1 {
        0% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(18vw, 12vh, 0) scale(1.15); }
        100% { transform: translate3d(6vw, 30vh, 0) scale(0.9); }
      }
      @keyframes drift2 {
        0% { transform: translate3d(0, 0, 0) scale(1); }
        50% { transform: translate3d(-20vw, 18vh, 0) scale(0.85); }
        100% { transform: translate3d(-8vw, -10vh, 0) scale(1.2); }
      }
      @keyframes drift3 {
        0% { transform: translate3d(0, 0, 0) scale(1.1); }
        50% { transform: translate3d(-14vw, -20vh, 0) scale(0.9); }
        100% { transform: translate3d(16vw, -6vh, 0) scale(1.05); }
      }
    `
  ]
})
export class AmbientComponent {}

/**
 * Cursor lichid: un punct rosu precis si o lentila de sticla care il urmeaza
 * cu intarziere elastica. Lentila se umfla peste linkuri/butoane si afiseaza
 * eticheta din `data-cursor` ("Play", "Drag", ...).
 *
 * Tot aici, un singur ascultator global hraneste reflexiile: seteaza --sx/--sy
 * pe cardul de sub cursor. Un ascultator pe document in loc de unul pe card.
 * Bucla de animatie ruleaza doar cat timp cursorul se misca.
 */
@Component({
  selector: 'aia-liquid-cursor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (enabled) {
      <div #lens class="reticle" [class.is-hover]="hover()" [class.is-label]="!!label()" [class.is-down]="down()" [class.is-hidden]="hidden()" aria-hidden="true">
        <i class="c tl"></i><i class="c tr"></i><i class="c bl"></i><i class="c br"></i>
        <span class="label">{{ label() }}</span>
      </div>
      <div #dot class="dot" [class.is-hidden]="hidden()" aria-hidden="true"></div>
      @for (w of waves(); track w.id) {
        <span class="wave" [style.left.px]="w.x" [style.top.px]="w.y" aria-hidden="true"></span>
      }
    }
  `,
  styles: [
    `
      :host { display: contents; }
      .reticle,
      .dot {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 400;
        pointer-events: none;
        will-change: transform;
      }
      .reticle {
        width: 44px;
        height: 44px;
        margin: -22px 0 0 -22px;
        display: grid;
        place-items: center;
        transition: width 0.35s var(--aia-snap), height 0.35s var(--aia-snap), margin 0.35s var(--aia-snap), opacity 0.2s;
      }
      .c {
        position: absolute;
        width: 10px;
        height: 10px;
        border: 0 solid #fff;
        transition: border-color 0.25s, transform 0.4s var(--aia-snap);
      }
      .tl { left: 0; top: 0; border-left-width: 2px; border-top-width: 2px; }
      .tr { right: 0; top: 0; border-right-width: 2px; border-top-width: 2px; }
      .bl { left: 0; bottom: 0; border-left-width: 2px; border-bottom-width: 2px; }
      .br { right: 0; bottom: 0; border-right-width: 2px; border-bottom-width: 2px; }
      .reticle.is-hover { width: 64px; height: 64px; margin: -32px 0 0 -32px; }
      .reticle.is-hover .c { border-color: var(--aia-blood); }
      .reticle.is-label { width: 110px; height: 52px; margin: -26px 0 0 -55px; background: var(--aia-blood); clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px); }
      .reticle.is-label .c { opacity: 0; }
      .reticle.is-down { width: 26px; height: 26px; margin: -13px 0 0 -13px; }
      .reticle.is-down .c { border-color: var(--aia-blood); }
      .label {
        font-family: 'Oswald', sans-serif;
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.24em;
        text-transform: uppercase;
        color: #fff;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .is-label .label { opacity: 1; }
      .dot {
        width: 6px;
        height: 6px;
        margin: -3px 0 0 -3px;
        background: var(--aia-blood);
        box-shadow: 0 0 14px 2px var(--aia-blood);
        transition: opacity 0.3s;
      }
      .wave {
        position: fixed;
        z-index: 399;
        width: 16px;
        height: 16px;
        margin: -8px 0 0 -8px;
        pointer-events: none;
        border: 2px solid var(--aia-blood);
        animation: wave 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes wave {
        from { transform: scale(0.4) rotate(45deg); opacity: 1; }
        to { transform: scale(7) rotate(45deg); opacity: 0; border-width: 1px; }
      }
      .is-hidden { opacity: 0 !important; }
    `
  ]
})
export class LiquidCursorComponent implements AfterViewInit, OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly lens = viewChild<ElementRef<HTMLElement>>('lens');
  private readonly dot = viewChild<ElementRef<HTMLElement>>('dot');

  readonly enabled =
    !this.anim.reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  readonly hover = signal(false);
  readonly label = signal('');
  readonly down = signal(false);
  readonly hidden = signal(true);
  readonly waves = signal<{ id: number; x: number; y: number }[]>([]);
  private waveId = 0;

  private raf?: number;
  private readonly pos = { x: -100, y: -100, lx: -100, ly: -100, vx: 0, vy: 0 };
  private glassEl: HTMLElement | null = null;
  private loop: () => void = () => {};
  private glassEvent?: PointerEvent;
  private glassFrame?: number;

  ngAfterViewInit(): void {
    document.addEventListener('pointermove', this.onGlass, { passive: true });
    if (!this.enabled) return;

    document.documentElement.classList.add('aia-has-cursor');
    window.addEventListener('pointermove', this.onMove, { passive: true });
    window.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointerup', this.onUp);
    document.addEventListener('pointerleave', this.onLeaveDoc);
    document.addEventListener('pointerover', this.onOver, { passive: true });

    this.loop = () => {
      const p = this.pos;
      // Arc amortizat: lentila are inertie si "se intinde" pe directia miscarii.
      p.vx += (p.x - p.lx) * 0.18;
      p.vy += (p.y - p.ly) * 0.18;
      p.vx *= 0.62;
      p.vy *= 0.62;
      p.lx += p.vx;
      p.ly += p.vy;
      const speed = Math.min(Math.hypot(p.vx, p.vy), 40);
      // Cu eticheta afisata lentila nu se intinde, altfel textul s-ar roti cu ea.
      const stretch = this.label() ? 1 : 1 + speed / 90;

      const lens = this.lens()?.nativeElement;
      const dot = this.dot()?.nativeElement;
      if (lens) {
        lens.style.transform = `translate3d(${p.lx}px, ${p.ly}px, 0) rotate(${this.hover() || this.label() ? 0 : (stretch - 1) * 90}deg)`;
      }
      if (dot) dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      // Bucla se opreste singura cand lentila a ajuns pe cursor; reporneste la miscare.
      const settled = Math.abs(p.x - p.lx) < 0.1 && Math.abs(p.y - p.ly) < 0.1 && speed < 0.05;
      this.raf = settled ? undefined : requestAnimationFrame(this.loop);
    };
    this.loop();
  }

  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    if (this.glassFrame) cancelAnimationFrame(this.glassFrame);
    document.documentElement.classList.remove('aia-has-cursor');
    document.removeEventListener('pointermove', this.onGlass);
    window.removeEventListener('pointermove', this.onMove);
    window.removeEventListener('pointerdown', this.onDown);
    window.removeEventListener('pointerup', this.onUp);
    document.removeEventListener('pointerleave', this.onLeaveDoc);
    document.removeEventListener('pointerover', this.onOver);
  }

  private readonly onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    this.pos.x = e.clientX;
    this.pos.y = e.clientY;
    if (this.hidden()) {
      this.pos.lx = e.clientX;
      this.pos.ly = e.clientY;
      this.hidden.set(false);
    }
    if (this.raf === undefined) this.raf = requestAnimationFrame(this.loop);
  };

  private readonly onOver = (e: PointerEvent) => {
    const target = e.target as HTMLElement | null;
    const labelled = target?.closest<HTMLElement>('[data-cursor]');
    this.label.set(labelled?.dataset['cursor'] ?? '');
    this.hover.set(!!target?.closest('a, button, [role="button"], input, select, textarea, label'));
  };

  /** Fiecare click lasa o unda patrata rosie: impactul unei lovituri. */
  private readonly onDown = (e: PointerEvent) => {
    this.down.set(true);
    const id = ++this.waveId;
    this.waves.update((w) => [...w, { id, x: e.clientX, y: e.clientY }]);
    setTimeout(() => this.waves.update((w) => w.filter((x) => x.id !== id)), 650);
  };
  private readonly onUp = () => this.down.set(false);
  private readonly onLeaveDoc = () => this.hidden.set(true);

  /** pointermove vine si de 1000 de ori pe secunda pe mouse-uri rapide: procesam doar ultimul, o data pe cadru. */
  private readonly onGlass = (e: PointerEvent) => {
    this.glassEvent = e;
    if (this.glassFrame === undefined) this.glassFrame = requestAnimationFrame(this.updateGlass);
  };

  private readonly updateGlass = () => {
    this.glassFrame = undefined;
    const e = this.glassEvent;
    if (!e) return;
    const target = e.target as HTMLElement | null;
    const glass = target?.closest<HTMLElement>('.aia-card, .aia-glass, .aia-glass-lite') ?? null;

    if (glass !== this.glassEl) {
      this.glassEl?.style.setProperty('--s-opacity', '0');
      this.glassEl = glass;
    }
    if (glass) {
      const r = glass.getBoundingClientRect();
      glass.style.setProperty('--sx', `${e.clientX - r.left}px`);
      glass.style.setProperty('--sy', `${e.clientY - r.top}px`);
      glass.style.setProperty('--s-opacity', '1');
    }
  };
}

export interface SectionDot {
  id: string;
  label: string;
}

/**
 * Index de sectiuni fixat in dreapta (desktop): o coloana de picaturi de
 * sticla; cea activa se alungeste si isi arata eticheta. Click = scroll lin.
 */
@Component({
  selector: 'aia-section-dots',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="dots aia-glass-lite" [attr.aria-label]="'a11y.sections' | translate">
      @for (s of sections(); track s.id; let i = $index) {
        <button
          type="button"
          class="dot"
          [class.on]="active() === i"
          (click)="go(s.id)"
          [attr.aria-label]="s.label"
          [attr.aria-current]="active() === i ? 'true' : null"
        >
          <span class="lbl">{{ s.label }}</span>
        </button>
      }
    </nav>
  `,
  styles: [
    `
      :host {
        position: fixed;
        right: 18px;
        top: 50%;
        z-index: 60;
        transform: translateY(-50%);
        display: none;
      }
      @media (min-width: 1280px) {
        :host { display: block; }
      }
      .dots {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 14px 9px;
        border-radius: 999px;
      }
      .dot {
        position: relative;
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: var(--aia-border-strong);
        transition: height 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.4s;
      }
      .dot:hover { background: var(--aia-text); }
      .dot.on {
        height: 30px;
        background: linear-gradient(var(--aia-blood-bright), var(--aia-blood));
        box-shadow: 0 0 14px var(--aia-blood);
      }
      .lbl {
        position: absolute;
        right: 24px;
        top: 50%;
        transform: translate(8px, -50%);
        white-space: nowrap;
        font-family: 'Oswald', sans-serif;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s, transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        color: var(--aia-text);
      }
      .dot:hover .lbl,
      .dot.on .lbl { opacity: 1; transform: translate(0, -50%); }
      .dot.on .lbl { color: var(--aia-blood-bright); }
    `
  ]
})
export class SectionDotsComponent implements AfterViewInit, OnDestroy {
  private readonly scroller = inject(SmoothScrollService);

  readonly sections = input.required<SectionDot[]>();
  readonly active = signal(0);

  private frame?: number;

  ngAfterViewInit(): void {
    window.addEventListener('scroll', this.onScroll, { passive: true });
    this.onScroll();
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.onScroll);
    if (this.frame) cancelAnimationFrame(this.frame);
  }

  /**
   * Sectiunea activa se calculeaza din pozitia reala a sectiunilor, o data pe
   * cadru: pin-urile GSAP adauga si scot spatiu in pagina, iar niste praguri
   * calculate o singura data ar ramane decalate.
   */
  private readonly onScroll = () => {
    if (this.frame !== undefined) return;
    this.frame = requestAnimationFrame(() => {
      this.frame = undefined;
      const line = window.innerHeight * 0.55;
      let current = 0;
      this.sections().forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = i;
      });
      this.active.set(current);
    });
  };

  go(id: string): void {
    this.scroller.scrollTo('#' + id, -20);
  }
}

/**
 * Stratul de efecte de deasupra intregului site: scanlines CRT, granulatie
 * care fierbe si flash-ul rosu de impact (declansat prin AnimationService.flash).
 * In plus, marginile ecranului se inroșesc cand scroll-ul e rapid.
 */
@Component({
  selector: 'aia-fx-layer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="aia-scanlines" aria-hidden="true"></div>
    <div #flash class="aia-flash" aria-hidden="true"></div>
    <div #rage class="rage" aria-hidden="true"></div>
    <div #curtain class="curtain" aria-hidden="true">
      <span class="curtain-red"></span>
      <span class="curtain-black"></span>
      <span class="curtain-logo font-display">AIA</span>
    </div>
  `,
  styles: [
    `
      :host { display: contents; }
      .rage {
        position: fixed;
        inset: 0;
        z-index: 4;
        pointer-events: none;
        opacity: 0;
        box-shadow: inset 0 0 160px 20px rgba(255, 0, 25, 0.55);
      }
      /* Cortina dintre pagini: o lama rosie urmata de una neagra, in diagonala. */
      .curtain { position: fixed; inset: 0; z-index: 260; pointer-events: none; visibility: hidden; }
      .curtain-red,
      .curtain-black {
        position: absolute;
        inset: -10% -30%;
        transform: skewX(-18deg) scaleX(0);
        transform-origin: left center;
      }
      .curtain-red { background: var(--aia-blood); }
      .curtain-black { background: #000; }
      .curtain-logo {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        font-size: 18vw;
        color: var(--aia-blood);
        opacity: 0;
      }
    `
  ]
})
export class FxLayerComponent implements AfterViewInit, OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly flash = viewChild.required<ElementRef<HTMLElement>>('flash');
  private readonly rage = viewChild.required<ElementRef<HTMLElement>>('rage');
  private readonly curtain = viewChild.required<ElementRef<HTMLElement>>('curtain');
  private readonly router = inject(Router);
  private navSub?: Subscription;
  private covering?: Promise<void>;
  private currentPath = '';

  readonly reduced = this.anim.reducedMotion;
  private raf?: number;
  private lastY = 0;
  private heat = 0;
  private shown = 0;

  ngAfterViewInit(): void {
    this.anim.registerFlash(this.flash().nativeElement);
    if (this.reduced) return;
    this.watchNavigation();
    this.lastY = window.scrollY;
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }

  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener('scroll', this.onScroll);
    this.navSub?.unsubscribe();
  }

  /** Bucla porneste la scroll si se opreste singura cand marginile s-au stins. */
  private readonly onScroll = () => {
    if (this.raf === undefined) this.raf = requestAnimationFrame(this.tick);
  };

  private readonly tick = () => {
    const y = window.scrollY;
    const v = Math.abs(y - this.lastY);
    this.lastY = y;
    this.heat += (Math.min(v / 60, 1) - this.heat) * 0.12;
    if (Math.abs(this.heat - this.shown) > 0.01) {
      this.shown = this.heat;
      this.rage().nativeElement.style.opacity = this.heat.toFixed(2);
    }
    this.raf = this.heat < 0.005 && v === 0 ? undefined : requestAnimationFrame(this.tick);
  };

  /**
   * La schimbarea paginii (nu si la salturi pe ancore in aceeasi pagina),
   * cortina acopera ecranul, iar dupa ce noua pagina e gata se retrage.
   */
  private watchNavigation(): void {
    const root = this.curtain().nativeElement;
    const [red, black, logo] = Array.from(root.children) as HTMLElement[];
    const pathOf = (url: string) => url.split(/[?#]/)[0];
    this.currentPath = pathOf(this.router.url);

    this.navSub = this.router.events.subscribe((e) => {
      if (e instanceof NavigationStart) {
        if (pathOf(e.url) === this.currentPath) return;
        this.currentPath = pathOf(e.url);
        gsap.killTweensOf([red, black, logo]);
        gsap.set(root, { visibility: 'visible' });
        gsap.set([red, black], { transformOrigin: 'left center' });
        this.covering = new Promise((done) => {
          gsap
            .timeline({ onComplete: () => done() })
            .fromTo(red, { scaleX: 0 }, { scaleX: 1, duration: 0.32, ease: 'expo.in' })
            .fromTo(black, { scaleX: 0 }, { scaleX: 1, duration: 0.32, ease: 'expo.in' }, 0.08)
            .fromTo(logo, { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: 0.25, ease: 'power4.in' }, 0.2);
        });
      }
      // Si o navigare anulata (ex. redirect din guard) trebuie sa retraga cortina.
      const settled = e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError;
      if (settled && e instanceof NavigationEnd) this.currentPath = pathOf(e.urlAfterRedirects);
      if (settled && this.covering) {
        const wait = this.covering;
        this.covering = undefined;
        void wait.then(() => {
          gsap.set([red, black], { transformOrigin: 'right center' });
          gsap
            .timeline({ onComplete: () => gsap.set(root, { visibility: 'hidden' }) })
            .to(logo, { opacity: 0, scale: 0.8, duration: 0.2 })
            .to(black, { scaleX: 0, duration: 0.5, ease: 'expo.out' }, 0.05)
            .to(red, { scaleX: 0, duration: 0.5, ease: 'expo.out' }, 0.15);
        });
      }
    });
  }
}

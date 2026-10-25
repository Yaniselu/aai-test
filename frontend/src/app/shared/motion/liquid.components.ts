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
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
 * curg lent, se apleaca spre cursor si se rotesc odata cu scroll-ul.
 *
 * Sunt gradienti radiali pe elemente mari, animate doar prin `transform`:
 * compozitorul le muta fara repaint, deci costul real e aproape zero.
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
      <span class="blob b4"></span>
      <span class="blob b5"></span>
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
        will-change: transform;
      }
      .blob {
        position: absolute;
        border-radius: 50%;
        will-change: transform;
        opacity: 0.9;
      }
      .b1 {
        width: 60vmax; height: 60vmax; left: -5%; top: 0%;
        background: radial-gradient(circle, rgba(255, 31, 61, 0.42), transparent 62%);
        animation: drift1 26s ease-in-out infinite alternate;
      }
      .b2 {
        width: 55vmax; height: 55vmax; right: -8%; top: 10%;
        background: radial-gradient(circle, rgba(139, 92, 255, 0.34), transparent 62%);
        animation: drift2 32s ease-in-out infinite alternate;
      }
      .b3 {
        width: 50vmax; height: 50vmax; left: 25%; bottom: -10%;
        background: radial-gradient(circle, rgba(94, 242, 255, 0.24), transparent 62%);
        animation: drift3 28s ease-in-out infinite alternate;
      }
      .b4 {
        width: 34vmax; height: 34vmax; left: 55%; top: 40%;
        background: radial-gradient(circle, rgba(255, 77, 94, 0.3), transparent 60%);
        animation: drift2 21s ease-in-out infinite alternate-reverse;
      }
      .b5 {
        width: 28vmax; height: 28vmax; left: 10%; top: 55%;
        background: radial-gradient(circle, rgba(94, 160, 255, 0.24), transparent 60%);
        animation: drift1 24s ease-in-out infinite alternate-reverse;
      }
      .vignette {
        position: absolute;
        inset: 0;
        background: radial-gradient(ellipse at center, transparent 40%, var(--aia-bg) 100%);
        opacity: 0.85;
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
export class AmbientComponent implements AfterViewInit, OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly layer = viewChild.required<ElementRef<HTMLElement>>('layer');

  private raf?: number;
  private readonly p = { x: 0, y: 0, tx: 0, ty: 0 };

  ngAfterViewInit(): void {
    if (this.anim.reducedMotion) return;
    window.addEventListener('pointermove', this.onPointer, { passive: true });

    const el = this.layer().nativeElement;
    const loop = () => {
      this.p.x += (this.p.tx - this.p.x) * 0.035;
      this.p.y += (this.p.ty - this.p.y) * 0.035;
      const scroll = window.scrollY / Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      el.style.transform = `translate3d(${this.p.x * 4}vw, ${this.p.y * 4 - scroll * 10}vh, 0) rotate(${scroll * 50}deg)`;
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener('pointermove', this.onPointer);
  }

  private readonly onPointer = (e: PointerEvent) => {
    this.p.tx = e.clientX / innerWidth - 0.5;
    this.p.ty = e.clientY / innerHeight - 0.5;
  };
}

/**
 * Cursor lichid: un punct rosu precis si o lentila de sticla care il urmeaza
 * cu intarziere elastica. Lentila se umfla peste linkuri/butoane si afiseaza
 * eticheta din `data-cursor` ("Play", "Drag", ...).
 *
 * Tot aici, un singur ascultator global hraneste reflexiile: seteaza --sx/--sy
 * pe orice card de sticla si --bx/--by pe butoane, ca picatura de hover sa
 * porneasca exact din punctul in care a intrat cursorul. Un ascultator pe
 * document in loc de unul pe fiecare card.
 */
@Component({
  selector: 'aia-liquid-cursor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (enabled) {
      <div #lens class="lens aia-refract" [class.is-hover]="hover()" [class.is-label]="!!label()" [class.is-down]="down()" [class.is-hidden]="hidden()" aria-hidden="true">
        <span class="label">{{ label() }}</span>
      </div>
      <div #dot class="dot" [class.is-hidden]="hidden()" aria-hidden="true"></div>
    }
  `,
  styles: [
    `
      :host { display: contents; }
      .lens,
      .dot {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 400;
        pointer-events: none;
        border-radius: 50%;
        will-change: transform;
      }
      .lens {
        width: 46px;
        height: 46px;
        margin: -23px 0 0 -23px;
        display: grid;
        place-items: center;
        border: 1px solid rgba(255, 255, 255, 0.35);
        background: radial-gradient(circle at 30% 25%, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.03) 60%);
        box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.6), inset 0 -4px 10px rgba(0, 0, 0, 0.2), 0 8px 24px rgba(0, 0, 0, 0.3);
        transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
          margin 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s, background 0.4s, border-color 0.4s;
      }
      .lens.is-hover { width: 74px; height: 74px; margin: -37px 0 0 -37px; border-color: rgba(255, 77, 94, 0.6); }
      .lens.is-label {
        width: 96px;
        height: 96px;
        margin: -48px 0 0 -48px;
        background: radial-gradient(circle at 30% 25%, rgba(255, 120, 135, 0.55), rgba(255, 31, 61, 0.35) 60%);
        border-color: rgba(255, 255, 255, 0.5);
      }
      .lens.is-down { width: 34px; height: 34px; margin: -17px 0 0 -17px; }
      .label {
        font-family: 'Orbitron', sans-serif;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: #fff;
        opacity: 0;
        transform: scale(0.6);
        transition: opacity 0.3s, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .is-label .label { opacity: 1; transform: scale(1); }
      .dot {
        width: 6px;
        height: 6px;
        margin: -3px 0 0 -3px;
        background: var(--aia-blood);
        box-shadow: 0 0 12px var(--aia-blood);
        transition: opacity 0.3s;
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

  private raf?: number;
  private readonly pos = { x: -100, y: -100, lx: -100, ly: -100, vx: 0, vy: 0 };
  private glassEl: HTMLElement | null = null;

  ngAfterViewInit(): void {
    document.addEventListener('pointermove', this.onGlass, { passive: true });
    if (!this.enabled) return;

    document.documentElement.classList.add('aia-has-cursor');
    window.addEventListener('pointermove', this.onMove, { passive: true });
    window.addEventListener('pointerdown', this.onDown);
    window.addEventListener('pointerup', this.onUp);
    document.addEventListener('pointerleave', this.onLeaveDoc);
    document.addEventListener('pointerover', this.onOver, { passive: true });

    const loop = () => {
      const p = this.pos;
      // Arc amortizat: lentila are inertie si "se intinde" pe directia miscarii.
      p.vx += (p.x - p.lx) * 0.18;
      p.vy += (p.y - p.ly) * 0.18;
      p.vx *= 0.62;
      p.vy *= 0.62;
      p.lx += p.vx;
      p.ly += p.vy;
      const speed = Math.min(Math.hypot(p.vx, p.vy), 40);
      const angle = Math.atan2(p.vy, p.vx);
      // Cu eticheta afisata lentila nu se intinde, altfel textul s-ar roti cu ea.
      const stretch = this.label() ? 1 : 1 + speed / 90;

      const lens = this.lens()?.nativeElement;
      const dot = this.dot()?.nativeElement;
      if (lens) {
        lens.style.transform = `translate3d(${p.lx}px, ${p.ly}px, 0) rotate(${stretch === 1 ? 0 : angle}rad) scale(${stretch}, ${1 / stretch})`;
      }
      if (dot) dot.style.transform = `translate3d(${p.x}px, ${p.y}px, 0)`;
      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
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
  };

  private readonly onOver = (e: PointerEvent) => {
    const target = e.target as HTMLElement | null;
    const labelled = target?.closest<HTMLElement>('[data-cursor]');
    this.label.set(labelled?.dataset['cursor'] ?? '');
    this.hover.set(!!target?.closest('a, button, [role="button"], input, select, textarea, label'));
  };

  private readonly onDown = () => this.down.set(true);
  private readonly onUp = () => this.down.set(false);
  private readonly onLeaveDoc = () => this.hidden.set(true);

  private readonly onGlass = (e: PointerEvent) => {
    const target = e.target as HTMLElement | null;
    const glass = target?.closest<HTMLElement>('.aia-card, .aia-glass') ?? null;

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

    const btn = target?.closest<HTMLElement>('.aia-btn');
    if (btn) {
      const r = btn.getBoundingClientRect();
      btn.style.setProperty('--bx', `${e.clientX - r.left}px`);
      btn.style.setProperty('--by', `${e.clientY - r.top}px`);
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="dots aia-glass" aria-label="Sectiuni">
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
        font-family: 'Orbitron', sans-serif;
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

  private triggers: ScrollTrigger[] = [];

  ngAfterViewInit(): void {
    // Asteptam un cadru: sectiunile fixate (pin) isi adauga spatiul abia dupa init.
    requestAnimationFrame(() => {
      this.sections().forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (!el) return;
        this.triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => self.isActive && this.active.set(i)
          })
        );
      });
    });
  }

  ngOnDestroy(): void {
    this.triggers.forEach((t) => t.kill());
  }

  go(id: string): void {
    this.scroller.scrollTo('#' + id, -20);
  }
}

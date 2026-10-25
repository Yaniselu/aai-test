import { Injectable, signal } from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Punct unic de intrare pentru animațiile GSAP.
 * Respectă `prefers-reduced-motion`: în acel caz elementele sunt afișate direct,
 * fără tranziții, în loc să rămână invizibile.
 */
@Injectable({ providedIn: 'root' })
export class AnimationService {
  readonly reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  /** Devine true cand intro-ul s-a terminat (sau n-a rulat deloc). */
  readonly introDone = signal(false);

  private resizeTimer?: number;
  private introWaiters: (() => void)[] = [];

  constructor() {
    // Fonturile web (Orbitron/Poppins) sosesc dupa primul layout si schimba
    // inaltimile. Fara un refresh, ScrollTrigger ramane cu pozitiile calculate
    // pe fonturile de sistem si unele sectiuni nu s-ar mai anima niciodata.
    void document.fonts?.ready.then(() => ScrollTrigger.refresh());

    window.addEventListener('resize', this.onResize, { passive: true });
  }

  /** Recalcularea e costisitoare; o amanam pana se opreste redimensionarea. */
  private readonly onResize = () => {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200) as unknown as number;
  };

  private flashEl?: HTMLElement;

  registerFlash(el: HTMLElement): void {
    this.flashEl = el;
  }

  /** Flash rosu pe tot ecranul, centrat intr-un punct (impact). */
  flash(x = innerWidth / 2, y = innerHeight / 2, strength = 1): void {
    if (this.reducedMotion || !this.flashEl) return;
    const el = this.flashEl;
    el.style.setProperty('--fx', `${x}px`);
    el.style.setProperty('--fy', `${y}px`);
    gsap.fromTo(el, { opacity: strength }, { opacity: 0, duration: 0.7, ease: 'power2.out', overwrite: true });
  }

  /** Cutremur scurt al unui element, la impact. */
  shake(el: Element, intensity = 10): void {
    if (this.reducedMotion) return;
    gsap.fromTo(
      el,
      { x: 0, y: 0 },
      {
        keyframes: [
          { x: -intensity, y: intensity * 0.4, duration: 0.04 },
          { x: intensity * 0.8, y: -intensity * 0.5, duration: 0.04 },
          { x: -intensity * 0.5, y: intensity * 0.3, duration: 0.04 },
          { x: intensity * 0.3, y: 0, duration: 0.04 },
          { x: 0, y: 0, duration: 0.06 }
        ],
        overwrite: 'auto',
        // Un transform ramas pe o sectiune ar deveni containing block pentru
        // descendentii position: fixed; il stergem dupa cutremur.
        clearProps: 'transform'
      }
    );
  }

  markIntroDone(): void {
    if (this.introDone()) return;
    this.introDone.set(true);
    this.introWaiters.splice(0).forEach((fn) => fn());
  }

  /** Ruleaza `fn` dupa intro, ca animatiile de intrare sa nu se consume sub el. */
  afterIntro(fn: () => void): void {
    this.introDone() ? fn() : this.introWaiters.push(fn);
  }

  get gsap() {
    return gsap;
  }

  /** Apariție pe scroll pentru un element sau o listă de elemente. */
  revealOnScroll(
    targets: gsap.TweenTarget,
    options: { y?: number; stagger?: number; delay?: number; start?: string } = {}
  ): gsap.core.Tween | null {
    const { y = 60, stagger = 0.12, delay = 0, start = 'top 85%' } = options;

    if (this.reducedMotion) {
      gsap.set(targets, { opacity: 1, y: 0, clearProps: 'transform' });
      return null;
    }

    // `fromTo` cu immediateRender:false: elementul ramane vizibil pana cand
    // declansatorul chiar ruleaza. Cu `from` simplu, un ScrollTrigger care nu
    // se declanseaza (pozitii invalidate, container ascuns) ar lasa continutul
    // invizibil permanent - un mod de esec mult mai grav decat lipsa animatiei.
    return gsap.fromTo(
      targets,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        stagger,
        delay,
        immediateRender: false,
        scrollTrigger: { trigger: targets as Element, start, toggleActions: 'play none none none' }
      }
    );
  }

  /** Parallax discret pentru imagini/banner-e. */
  parallax(target: Element, distance = 120): void {
    if (this.reducedMotion) return;
    gsap.to(target, {
      yPercent: distance / 10,
      ease: 'none',
      scrollTrigger: { trigger: target, start: 'top bottom', end: 'bottom top', scrub: true }
    });
  }

  /** Numărător animat pentru statistici (ex. 350+ sportivi). */
  countUp(target: Element, to: number, duration = 2): void {
    if (this.reducedMotion) {
      target.textContent = String(to);
      return;
    }
    const state = { value: 0 };
    gsap.to(state, {
      value: to,
      duration,
      ease: 'power2.out',
      scrollTrigger: { trigger: target, start: 'top 90%' },
      onUpdate: () => {
        target.textContent = Math.round(state.value).toLocaleString('ro-RO');
      }
    });
  }

  /** Curăță ScrollTrigger-ele la distrugerea unei pagini. */
  killAll(): void {
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  }

  refresh(): void {
    ScrollTrigger.refresh();
  }
}

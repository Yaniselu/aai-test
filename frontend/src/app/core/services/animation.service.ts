import { Injectable } from '@angular/core';
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

  private resizeTimer?: number;

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

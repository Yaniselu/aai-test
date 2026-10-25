import { Injectable, inject } from '@angular/core';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimationService } from './animation.service';

/**
 * Scroll cu inertie (Lenis).
 *
 * Doua lucruri trebuie sincronizate manual, altfel animatiile "sar":
 *  1. ScrollTrigger trebuie sa se actualizeze la fiecare eveniment Lenis;
 *  2. Lenis trebuie condus de ticker-ul GSAP, ca sa existe un singur rAF
 *     in toata aplicatia, nu doua care se calca pe picioare.
 *
 * La `prefers-reduced-motion` nu il pornim deloc: scroll-ul cu inertie este
 * exact genul de miscare care provoaca rau de miscare.
 */
@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private readonly anim = inject(AnimationService);
  private lenis?: Lenis;

  init(): void {
    if (this.anim.reducedMotion || this.lenis) return;

    this.lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Pe touch, inertia nativa a sistemului este mai buna decat orice emulare.
      syncTouch: false,
      touchMultiplier: 1.6
    });

    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(this.tick);
    gsap.ticker.lagSmoothing(0);
  }

  /** GSAP da timpul in secunde, Lenis il vrea in milisecunde. */
  private readonly tick = (time: number) => {
    this.lenis?.raf(time * 1000);
  };

  scrollTo(target: string | number | HTMLElement, offset = -80): void {
    if (this.lenis) {
      this.lenis.scrollTo(target, { offset, duration: 1.2 });
      return;
    }

    // Fallback fara Lenis (reduced motion sau initializare esuata).
    if (typeof target === 'number') {
      window.scrollTo({ top: target, behavior: 'auto' });
      return;
    }
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    el?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }

  stop(): void {
    this.lenis?.stop();
  }

  start(): void {
    this.lenis?.start();
  }

  destroy(): void {
    gsap.ticker.remove(this.tick);
    this.lenis?.destroy();
    this.lenis = undefined;
  }
}

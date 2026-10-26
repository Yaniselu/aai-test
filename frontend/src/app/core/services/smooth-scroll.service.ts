import { Injectable, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
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
 *
 * Tot aici se trateaza ancorele (#grupe) si revenirea sus la schimbarea paginii.
 * Router-ul Angular ar face un salt nativ instantaneu, pe langa Lenis, iar Lenis
 * ar ramane cu tinta veche si ar "trage" pagina inapoi - de aici sacadarile.
 */
@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private readonly anim = inject(AnimationService);
  private readonly router = inject(Router);
  private lenis?: Lenis;
  private routed = false;
  private lastPath = '';

  init(): void {
    this.watchRouter();
    if (this.anim.reducedMotion || this.lenis) return;

    this.lenis = new Lenis({
      // Interpolare continua (lerp) in loc de animatii cu durata fixa: cu o durata,
      // fiecare eveniment de roata/trackpad reporneste animatia si scroll-ul pulseaza.
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      // Pe touch, inertia nativa a sistemului este mai buna decat orice emulare.
      syncTouch: false,
      touchMultiplier: 1.5
    });

    this.lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add(this.tick);
    gsap.ticker.lagSmoothing(0);
  }

  private watchRouter(): void {
    if (this.routed) return;
    this.routed = true;
    this.lastPath = this.router.url.split(/[?#]/)[0];
    // Intrare directa pe o adresa cu ancora (ex. link distribuit catre /#program).
    const initial = this.router.parseUrl(this.router.url).fragment;
    if (initial) setTimeout(() => this.scrollTo('#' + initial, -20, true), 700);

    this.router.events.subscribe((e) => {
      if (!(e instanceof NavigationEnd)) return;
      const tree = this.router.parseUrl(e.urlAfterRedirects);
      const path = e.urlAfterRedirects.split(/[?#]/)[0];
      const fragment = tree.fragment;
      const changedPage = path !== this.lastPath;
      this.lastPath = path;

      if (fragment) {
        // Asteptam randarea paginii (si a pin-urilor GSAP) inainte de a masura tinta.
        setTimeout(() => this.scrollTo('#' + fragment, -20, changedPage), changedPage ? 350 : 0);
      } else if (changedPage) {
        this.scrollTo(0, 0, true);
      }
    });
  }

  /** GSAP da timpul in secunde, Lenis il vrea in milisecunde. */
  private readonly tick = (time: number) => {
    this.lenis?.raf(time * 1000);
  };

  scrollTo(target: string | number | HTMLElement, offset = -80, immediate = false): void {
    if (this.lenis) {
      this.lenis.scrollTo(target, { offset, duration: 1.2, immediate, force: true });
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

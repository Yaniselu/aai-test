import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  output,
  signal,
  viewChild
} from '@angular/core';
import gsap from 'gsap';
import { environment } from '../../../environments/environment';
import { AnimationService } from '../../core/services/animation.service';

/**
 * INTRO CINEMATIC
 * ---------------
 * 1. Ecran negru cu scantei; numaratoare 3-2-1-FIGHT izbita cu flash si cutremur.
 * 2. Titlul "ACADEMIA ION ANDREI" cade din fata camerei, cu glitch.
 * 3. O lama rosie taie ecranul pe diagonala, iar cele doua jumatati se despart,
 *    dezvaluind homepage-ul care era deja randat dedesubt.
 *
 * Ruleaza o singura data pe sesiune, ca navigarea ulterioara sa nu devina obositoare.
 */
@Component({
  selector: 'aia-intro',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (visible()) {
      <div #root class="fixed inset-0 z-[200] select-none overflow-hidden" role="presentation" aria-hidden="true">
        <!-- Doua panouri cat ecranul, taiate pe aceeasi diagonala -->
        <div #doorLeft class="door door-l absolute inset-0 bg-black"></div>
        <div #doorRight class="door door-r absolute inset-0 bg-black"></div>

        <canvas #canvas class="absolute inset-0 h-full w-full opacity-80"></canvas>

        <!-- Lama care taie ecranul exact pe linia usilor -->
        <svg class="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line #cut x1="64" y1="-2" x2="36" y2="102" stroke="#ff0019" stroke-width="0.9" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" />
        </svg>

        <!-- Numaratoarea inversa -->
        <div class="pointer-events-none absolute inset-0 grid place-items-center">
          @for (n of countdown; track n) {
            <span class="count font-display" [class.fight]="n === 'FIGHT'">{{ n }}</span>
          }
        </div>

        <!-- Titlul -->
        <div #content class="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
          <div>
            <p #eyebrow class="mb-5 font-heading text-[11px] font-semibold uppercase tracking-[0.6em] text-[#ff0019] sm:text-xs">
              Craiova &middot; Arte Martiale
            </p>
            <h1 #title class="aia-glitch font-display text-[19vw] leading-[0.84] text-white sm:text-[14vw] lg:text-[10rem]" data-text="ACADEMIA ION ANDREI">
              Academia<br /><span class="text-[#ff0019]">Ion Andrei</span>
            </h1>
            <div #line class="mx-auto mt-8 h-[4px] w-0 bg-[#ff0019] shadow-[0_0_30px_#ff0019]"></div>
            <p #motto class="mt-7 font-heading text-xs uppercase tracking-[0.5em] text-white/70 sm:text-sm">
              Disciplina &middot; Performanta &middot; Mentalitate
            </p>
          </div>
        </div>

        <!-- Intro-ul nu trebuie sa fie o inchisoare -->
        <button
          type="button"
          class="aia-btn aia-btn-ghost absolute bottom-8 right-8 z-10 !px-5 !py-2.5 !text-[10px]"
          (click)="skip()"
        >
          <span>Skip intro &rarr;</span>
        </button>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }
      .door-l { clip-path: polygon(0 0, 64% 0, 36% 100%, 0 100%); }
      .door-r { clip-path: polygon(64% 0, 100% 0, 100% 100%, 36% 100%); }
      .count {
        grid-area: 1 / 1;
        font-size: 62vh;
        line-height: 0.8;
        color: #ff0019;
        opacity: 0;
        text-shadow: 0 0 120px rgba(255, 0, 25, 0.6);
      }
      .count.fight { font-size: 30vw; color: #fff; }
    `
  ]
})
export class IntroComponent implements AfterViewInit, OnDestroy {
  private readonly anim = inject(AnimationService);

  readonly finished = output<void>();
  readonly visible = signal(this.shouldPlay());

  private readonly doorLeft = viewChild<ElementRef<HTMLElement>>('doorLeft');
  private readonly doorRight = viewChild<ElementRef<HTMLElement>>('doorRight');
  private readonly content = viewChild<ElementRef<HTMLElement>>('content');
  private readonly title = viewChild<ElementRef<HTMLElement>>('title');
  private readonly eyebrow = viewChild<ElementRef<HTMLElement>>('eyebrow');
  private readonly line = viewChild<ElementRef<HTMLElement>>('line');
  private readonly root = viewChild<ElementRef<HTMLElement>>('root');
  private readonly cut = viewChild<ElementRef<SVGLineElement>>('cut');

  readonly countdown = ['3', '2', '1', 'FIGHT'];
  private readonly motto = viewChild<ElementRef<HTMLElement>>('motto');
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  private timeline?: gsap.core.Timeline;
  private rafId?: number;

  ngAfterViewInit(): void {
    if (!this.visible()) {
      this.anim.markIntroDone();
      this.finished.emit();
      return;
    }

    document.body.classList.add('aia-locked');

    if (this.anim.reducedMotion) {
      // Fara animatii: afisam scurt titlul, apoi intram direct in site.
      setTimeout(() => this.complete(), 700);
      return;
    }

    this.startParticles();
    this.buildTimeline();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  skip(): void {
    this.timeline ? this.timeline.progress(1) : this.complete();
  }

  // ---------------------------------------------------------------- timeline
  private buildTimeline(): void {
    const tl = gsap.timeline({ onComplete: () => this.complete() });
    this.timeline = tl;
    const root = this.root()!.nativeElement;
    const counts = Array.from(root.querySelectorAll<HTMLElement>('.count'));

    // 3 · 2 · 1 · FIGHT — fiecare cifra se izbeste de ecran, cu flash si cutremur.
    counts.forEach((el, i) => {
      const fight = i === counts.length - 1;
      tl.fromTo(
        el,
        { opacity: 0, scale: fight ? 3 : 2.4, filter: 'blur(20px)', rotate: fight ? -8 : 0 },
        { opacity: 1, scale: 1, filter: 'blur(0px)', rotate: fight ? -4 : 0, duration: fight ? 0.28 : 0.2, ease: 'power4.in' },
        i === 0 ? 0.15 : '>'
      )
        .add(() => {
          this.anim.flash(innerWidth / 2, innerHeight / 2, fight ? 1 : 0.6);
          this.anim.shake(root, fight ? 22 : 10);
        })
        .to(el, { opacity: 0, scale: fight ? 1.25 : 0.85, duration: fight ? 0.35 : 0.22, ease: 'power2.in' }, fight ? '+=0.45' : '+=0.3');
    });

    tl.from(this.eyebrow()!.nativeElement, { opacity: 0, letterSpacing: '1.4em', duration: 0.5, ease: 'expo.out' })
      .fromTo(
        this.title()!.nativeElement,
        { opacity: 0, scale: 2.2, filter: 'blur(24px)' },
        { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.35, ease: 'power4.in' },
        '<'
      )
      .add(() => {
        this.anim.flash(innerWidth / 2, innerHeight / 2, 0.8);
        this.anim.shake(root, 14);
      })
      .to(this.line()!.nativeElement, { width: 'min(520px, 80vw)', duration: 0.5, ease: 'expo.out' })
      .from(this.motto()!.nativeElement, { opacity: 0, y: 16, duration: 0.4, ease: 'power2.out' }, '<')
      .to({}, { duration: 0.45 })
      // Lama taie ecranul pe diagonala
      .to(this.cut()!.nativeElement, { attr: { 'stroke-dashoffset': 0 }, duration: 0.25, ease: 'expo.in' })
      .add(() => this.anim.flash(innerWidth / 2, innerHeight / 2, 1))
      .to(this.content()!.nativeElement, { opacity: 0, scale: 1.08, filter: 'blur(10px)', duration: 0.3, ease: 'power2.in' }, '<')
      .to(this.canvasRef()!.nativeElement, { opacity: 0, duration: 0.3 }, '<')
      // Hero-ul isi porneste intrarea odata cu deschiderea usilor.
      .call(() => this.anim.markIntroDone(), [], 'doors')
      .to(this.cut()!.nativeElement, { opacity: 0, duration: 0.3 }, 'doors')
      // Panourile se despart pe diagonala, in directii opuse
      .to(this.doorLeft()!.nativeElement, { xPercent: -75, yPercent: -18, duration: 0.95, ease: 'expo.inOut' }, 'doors')
      .to(this.doorRight()!.nativeElement, { xPercent: 75, yPercent: 18, duration: 0.95, ease: 'expo.inOut' }, 'doors');
  }

  private complete(): void {
    this.cleanup();
    try {
      sessionStorage.setItem(environment.storageKeys.intro, '1');
    } catch {
      /* private mode - intro-ul va rula din nou, acceptabil */
    }
    this.visible.set(false);
    this.anim.markIntroDone();
    this.finished.emit();
  }

  private cleanup(): void {
    this.timeline?.kill();
    this.timeline = undefined;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = undefined;
    document.body.classList.remove('aia-locked');
  }

  // --------------------------------------------------------------- particule
  /** Scantei rosii care urca - evoca cenusa unui foc, nu confetti. */
  private startParticles(): void {
    const canvas = this.canvasRef()?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;

    const count = window.innerWidth < 640 ? 45 : 90;
    const particles = Array.from({ length: count }, () => this.spawn(canvas.width, canvas.height));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.y -= p.speed;
        p.x += Math.sin(p.y * 0.01) * 0.4;
        p.life -= 0.004;

        if (p.life <= 0 || p.y < -10) Object.assign(p, this.spawn(canvas.width, canvas.height));

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * dpr, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + p.tint + ', ' + Math.max(p.life, 0) * 0.85 + ')';
        ctx.fill();
      }
      this.rafId = requestAnimationFrame(draw);
    };
    draw();
  }

  private spawn(width: number, height: number) {
    const warm = Math.random() > 0.35;
    return {
      x: Math.random() * width,
      y: height + Math.random() * height * 0.5,
      radius: Math.random() * 1.8 + 0.4,
      speed: Math.random() * 1.6 + 0.3,
      life: Math.random() * 0.6 + 0.4,
      tint: warm ? '225, 6, 0' : '255, 255, 255'
    };
  }

  // ------------------------------------------------------------------ gating
  private shouldPlay(): boolean {
    // Nu rulam intro-ul daca utilizatorul aterizeaza direct pe o ruta interna.
    if (window.location.pathname !== '/') return false;
    try {
      return sessionStorage.getItem(environment.storageKeys.intro) !== '1';
    } catch {
      return true;
    }
  }
}

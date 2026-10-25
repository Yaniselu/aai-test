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
 * 1. Ecran negru full-screen cu particule pe canvas.
 * 2. Titlul "ACADEMIA ION ANDREI" apare cu efect glitch.
 * 3. Cele doua panouri se despart din mijloc spre exterior (split door),
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
      <div class="fixed inset-0 z-[200] select-none" role="presentation" aria-hidden="true">
        <!-- Panoul stang -->
        <div #doorLeft class="absolute inset-y-0 left-0 w-1/2 overflow-hidden bg-[#050505]">
          <canvas #canvas class="absolute inset-0 h-full w-full opacity-70"></canvas>
          <div class="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-[#E60000] to-transparent"></div>
        </div>

        <!-- Panoul drept -->
        <div #doorRight class="absolute inset-y-0 right-0 w-1/2 overflow-hidden bg-[#050505]">
          <div class="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#E60000] to-transparent"></div>
        </div>

        <!-- Continutul central -->
        <div #content class="pointer-events-none absolute inset-0 grid place-items-center px-6 text-center">
          <div>
            <p #eyebrow class="mb-5 font-heading text-[10px] font-bold uppercase tracking-[0.5em] sm:text-xs" style="color: #00e5ff">
              Craiova &middot; Arte Martiale
            </p>

            <h1
              #title
              class="font-display text-[11vw] leading-[1.05] text-white sm:text-[8vw] lg:text-[5.5rem]"
            >
              Academia<br />Ion Andrei
            </h1>

            <div #line class="mx-auto mt-8 h-[2px] w-0 rounded-full bg-gradient-to-r from-transparent via-[#e10600] to-transparent"></div>

            <p #motto class="mt-7 text-xs tracking-[0.3em] sm:text-sm" style="color: #a5a7b3">
              Disciplina &middot; Performanta &middot; Mentalitate
            </p>
          </div>
        </div>

        <!-- Intro-ul nu trebuie sa fie o inchisoare -->
        <button
          type="button"
          class="absolute bottom-8 right-8 z-10 rounded-full border border-white/15 px-4 py-2 font-heading text-[10px] font-bold uppercase tracking-[0.24em] text-[#a5a7b3] transition-colors hover:border-white/40 hover:text-white"
          (click)="skip()"
        >
          Skip intro &rarr;
        </button>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
      }
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
  private readonly motto = viewChild<ElementRef<HTMLElement>>('motto');
  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  private timeline?: gsap.core.Timeline;
  private rafId?: number;

  ngAfterViewInit(): void {
    if (!this.visible()) {
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

    tl.from(this.eyebrow()!.nativeElement, { opacity: 0, y: 20, duration: 0.7, ease: 'power2.out' })
      .from(
        this.title()!.nativeElement,
        { opacity: 0, scale: 1.25, filter: 'blur(22px)', duration: 1.1, ease: 'power3.out' },
        '-=0.35'
      )
      .to(this.line()!.nativeElement, { width: 'min(420px, 70vw)', duration: 0.8, ease: 'power2.inOut' }, '-=0.5')
      .from(this.motto()!.nativeElement, { opacity: 0, y: 16, duration: 0.6, ease: 'power2.out' }, '-=0.4')
      // Pauza dramatica inainte de deschiderea usilor
      .to({}, { duration: 0.55 })
      .to(this.content()!.nativeElement, { opacity: 0, scale: 0.94, duration: 0.5, ease: 'power2.in' })
      // Split door: panourile ies din cadru simultan
      .to(this.doorLeft()!.nativeElement, { xPercent: -100, duration: 1.15, ease: 'power4.inOut' }, 'doors')
      .to(this.doorRight()!.nativeElement, { xPercent: 100, duration: 1.15, ease: 'power4.inOut' }, 'doors');
  }

  private complete(): void {
    this.cleanup();
    try {
      sessionStorage.setItem(environment.storageKeys.intro, '1');
    } catch {
      /* private mode - intro-ul va rula din nou, acceptabil */
    }
    this.visible.set(false);
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
      tint: warm ? '225, 6, 0' : '0, 229, 255'
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

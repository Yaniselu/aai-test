import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  effect,
  inject,
  input,
  signal,
  viewChild
} from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimationService } from '../../core/services/animation.service';

/**
 * Text care se "descifreaza": literele trec prin caractere aleatorii inainte
 * sa se aseze (DecryptedText). Folosit cu masura, pe etichete scurte.
 */
@Component({
  selector: 'aia-scramble',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="klass()">{{ shown() }}</span>`,
  styles: [`:host { display: inline-block; }`]
})
export class ScrambleTextComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly anim = inject(AnimationService);

  readonly text = input.required<string>();
  readonly klass = input('');
  readonly speed = input(28);

  readonly shown = signal('');

  private frame?: number;
  private trigger?: ScrollTrigger;

  private static readonly GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>*#';

  ngAfterViewInit(): void {
    const final = this.text();

    if (this.anim.reducedMotion) {
      this.shown.set(final);
      return;
    }

    this.shown.set(''.padEnd(final.length, ' '));
    this.trigger = ScrollTrigger.create({
      trigger: this.host.nativeElement,
      start: 'top 92%',
      once: true,
      onEnter: () => this.run(final)
    });
  }

  ngOnDestroy(): void {
    if (this.frame) clearTimeout(this.frame as unknown as number);
    this.trigger?.kill();
  }

  private run(final: string): void {
    let settled = 0;

    const step = () => {
      const output = Array.from(final)
        .map((ch, i) => {
          if (i < settled || ch === ' ') return ch;
          return ScrambleTextComponent.GLYPHS[Math.floor(Math.random() * ScrambleTextComponent.GLYPHS.length)];
        })
        .join('');

      this.shown.set(output);
      settled += 1;

      if (settled <= final.length) {
        this.frame = setTimeout(step, this.speed()) as unknown as number;
      } else {
        this.shown.set(final);
      }
    };

    step();
  }
}

/** Numărător animat, declanșat la intrarea în viewport (CountUp). */
@Component({
  selector: 'aia-count-up',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span #out>0</span>{{ suffix() }}`,
  styles: [`:host { display: inline-block; }`]
})
export class CountUpComponent implements AfterViewInit {
  private readonly anim = inject(AnimationService);
  private readonly out = viewChild.required<ElementRef<HTMLElement>>('out');

  readonly value = input.required<number>();
  readonly suffix = input('');
  readonly duration = input(1.8);

  ngAfterViewInit(): void {
    this.anim.countUp(this.out().nativeElement, this.value(), this.duration());
  }
}

/**
 * Grilă de puncte care reacționează la cursor (DotGrid).
 * Desenată pe canvas: 2000 de puncte în DOM ar face pagina inutilizabilă.
 */
@Component({
  selector: 'aia-dot-grid',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #cv class="block h-full w-full"></canvas>`,
  styles: [`:host { display: block; position: absolute; inset: 0; pointer-events: none; }`]
})
export class DotGridComponent implements AfterViewInit, OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly cv = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');

  readonly gap = input(34);
  readonly radius = input(1.1);
  readonly influence = input(130);

  private raf?: number;
  private observer?: ResizeObserver;
  private pointer = { x: -9999, y: -9999 };

  ngAfterViewInit(): void {
    const canvas = this.cv().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
    };
    resize();
    this.observer = new ResizeObserver(resize);
    this.observer.observe(canvas);

    if (!this.anim.reducedMotion) {
      window.addEventListener('pointermove', this.onPointer, { passive: true });
    }

    const draw = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const gap = this.gap() * dpr;
      const influence = this.influence() * dpr;
      const rect = canvas.getBoundingClientRect();
      const px = (this.pointer.x - rect.left) * dpr;
      const py = (this.pointer.y - rect.top) * dpr;

      for (let x = gap / 2; x < width; x += gap) {
        for (let y = gap / 2; y < height; y += gap) {
          const dist = Math.hypot(x - px, y - py);
          // Punctele de lângă cursor cresc și se colorează; restul rămân discrete.
          const proximity = Math.max(0, 1 - dist / influence);
          const r = (this.radius() + proximity * 1.9) * dpr;
          const alpha = 0.16 + proximity * 0.7;

          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = proximity > 0.05
            ? `rgba(230, 0, 0, ${alpha})`
            : `rgba(140, 140, 140, ${alpha * 0.55})`;
          ctx.fill();
        }
      }

      this.raf = requestAnimationFrame(draw);
    };
    draw();
  }

  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.observer?.disconnect();
    window.removeEventListener('pointermove', this.onPointer);
  }

  private readonly onPointer = (event: PointerEvent) => {
    this.pointer.x = event.clientX;
    this.pointer.y = event.clientY;
  };
}

/** Scântei scurte la click, oriunde în pagină (ClickSpark). */
@Component({
  selector: 'aia-click-spark',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #cv class="pointer-events-none fixed inset-0 z-[190]"></canvas>`,
  styles: [`:host { display: contents; }`]
})
export class ClickSparkComponent implements AfterViewInit, OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly cv = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');

  private raf?: number;
  private sparks: { x: number; y: number; angle: number; life: number }[] = [];
  private startLoop: () => void = () => {};

  ngAfterViewInit(): void {
    if (this.anim.reducedMotion) return;

    const canvas = this.cv().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointerdown', this.onClick);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      this.sparks = this.sparks.filter((s) => s.life > 0);

      // Cand nu mai sunt scantei, oprim bucla in loc sa stergem un canvas cat
      // tot ecranul, la nesfarsit. Se reporneste la urmatorul click.
      if (this.sparks.length === 0) {
        this.raf = undefined;
        return;
      }
      for (const spark of this.sparks) {
        spark.life -= 0.032;
        const eased = 1 - spark.life;
        const dist = 6 + eased * 26;
        const x = spark.x + Math.cos(spark.angle) * dist;
        const y = spark.y + Math.sin(spark.angle) * dist;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(spark.angle) * 7, y + Math.sin(spark.angle) * 7);
        ctx.strokeStyle = `rgba(230, 0, 0, ${Math.max(spark.life, 0)})`;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      this.raf = requestAnimationFrame(draw);
    };

    this.startLoop = () => {
      if (this.raf === undefined) this.raf = requestAnimationFrame(draw);
    };
  }

  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener('pointerdown', this.onClick);
  }

  private readonly onClick = (event: PointerEvent) => {
    // Nu poluăm câmpurile de formular cu efecte vizuale.
    const target = event.target as HTMLElement;
    if (target.closest('input, textarea, select')) return;

    for (let i = 0; i < 8; i++) {
      this.sparks.push({
        x: event.clientX,
        y: event.clientY,
        angle: (Math.PI * 2 * i) / 8 + Math.random() * 0.3,
        life: 1
      });
    }
    this.startLoop();
  };
}

/**
 * Bandă care își schimbă viteza și direcția după viteza de scroll
 * (ScrollVelocity). Înlocuiește marquee-ul cu animație CSS fixă.
 */
@Component({
  selector: 'aia-velocity-marquee',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative flex overflow-hidden py-5 select-none" aria-hidden="true">
      <div #track class="flex shrink-0 items-center gap-10 whitespace-nowrap pr-10">
        @for (pass of passes; track pass) {
          @for (word of items(); track $index) {
            <span class="font-display text-4xl uppercase leading-none tracking-wide sm:text-6xl">{{ word }}</span>
            <span class="h-1.5 w-1.5 shrink-0 rotate-45 bg-[var(--aia-blood)]"></span>
          }
        }
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class VelocityMarqueeComponent implements AfterViewInit, OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');

  readonly items = input<string[]>(['DISCIPLINA', 'FORTA', 'RESPECT', 'VICTORIE']);
  readonly baseSpeed = input(0.7);

  readonly passes = [1, 2, 3];

  private raf?: number;
  private offset = 0;
  private velocity = 0;
  private lastScroll = 0;

  ngAfterViewInit(): void {
    const el = this.track().nativeElement;

    if (this.anim.reducedMotion) {
      return;
    }

    this.lastScroll = window.scrollY;
    window.addEventListener('scroll', this.onScroll, { passive: true });

    const loop = () => {
      const width = el.scrollWidth / this.passes.length;
      // Direcția se inversează când derulezi în sus — banda "simte" scroll-ul.
      const direction = this.velocity < -0.5 ? -1 : 1;
      const speed = this.baseSpeed() + Math.min(Math.abs(this.velocity) * 0.35, 14);

      this.offset += speed * direction;
      if (this.offset > width) this.offset -= width;
      if (this.offset < 0) this.offset += width;

      el.style.transform = `translate3d(${-this.offset}px, 0, 0)`;
      this.velocity *= 0.92;

      this.raf = requestAnimationFrame(loop);
    };
    loop();
  }

  ngOnDestroy(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    window.removeEventListener('scroll', this.onScroll);
  }

  private readonly onScroll = () => {
    const current = window.scrollY;
    this.velocity = current - this.lastScroll;
    this.lastScroll = current;
  };
}

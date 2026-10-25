import {
  AfterViewInit,
  Directive,
  ElementRef,
  OnDestroy,
  inject,
  input
} from '@angular/core';
import gsap from 'gsap';
import { AnimationService } from '../../core/services/animation.service';

/**
 * Primitive de interactiune, in spiritul reactbits.dev, portate in Angular ca
 * directive: se aplica pe elemente existente, fara wrappere suplimentare in DOM.
 *
 * Toate se dezactiveaza singure la `prefers-reduced-motion` si isi curata
 * ascultatorii la distrugere.
 */

/** Text care se compune din cuvinte ce urca si se defocalizeaza (SplitText / BlurText). */
@Directive({
  selector: '[aiaSplitText]',
  standalone: true
})
export class SplitTextDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly anim = inject(AnimationService);

  /**
   * `word` desparte pe cuvinte, `char` pe litere (doar pentru titluri scurte).
   * Input separat de selector: `aiaSplitText` folosit ca atribut simplu ar
   * incerca sa atribuie sirul gol acestui camp.
   */
  readonly splitBy = input<'word' | 'char'>('word');
  readonly splitDelay = input(0);
  readonly splitStagger = input(0.045);

  private tween?: gsap.core.Tween;

  ngAfterViewInit(): void {
    const el = this.host.nativeElement as HTMLElement;
    if (this.anim.reducedMotion) return;

    const text = el.textContent ?? '';
    if (!text.trim()) return;

    const mode = this.splitBy();
    // `split` pastreaza siruri vide la capete; ar produce span-uri fara continut
    // care intra degeaba in stagger si intarzie animatia reala.
    const units = (mode === 'char' ? Array.from(text) : text.split(/(\s+)/)).filter(
      (unit) => unit.length > 0
    );

    // Reconstruim continutul din spans. `aria-label` pastreaza textul intact
    // pentru cititoarele de ecran, care altfel ar citi litera cu litera.
    el.setAttribute('aria-label', text.trim());
    el.textContent = '';

    const spans: HTMLElement[] = [];
    for (const unit of units) {
      if (/^\s+$/.test(unit)) {
        el.appendChild(document.createTextNode(unit));
        continue;
      }
      const span = document.createElement('span');
      span.textContent = unit;
      span.setAttribute('aria-hidden', 'true');
      span.style.display = 'inline-block';
      span.style.willChange = 'transform, opacity, filter';
      el.appendChild(span);
      spans.push(span);
    }

    // La fel ca la reveal: `fromTo` cu immediateRender:false tine textul
    // vizibil daca declansatorul nu apuca sa ruleze.
    this.tween = gsap.fromTo(
      spans,
      { opacity: 0, yPercent: 115, filter: 'blur(10px)' },
      {
        opacity: 1,
        yPercent: 0,
        filter: 'blur(0px)',
        duration: 1.05,
        ease: 'power3.out',
        stagger: this.splitStagger(),
        delay: this.splitDelay(),
        immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 92%', once: true }
      }
    );
  }

  ngOnDestroy(): void {
    this.tween?.scrollTrigger?.kill();
    this.tween?.kill();
  }
}

/** Elementul se apropie usor de cursor si revine elastic la iesire (Magnet). */
@Directive({
  selector: '[aiaMagnet]',
  standalone: true
})
export class MagnetDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly anim = inject(AnimationService);

  /** Cat de mult se deplaseaza, ca fractiune din distanta cursorului. */
  readonly magnetStrength = input(0.32);

  private el!: HTMLElement;
  private active = false;

  ngAfterViewInit(): void {
    if (this.anim.reducedMotion) return;
    // Pe touch nu exista hover: efectul ar bloca primul tap.
    if (window.matchMedia('(hover: none)').matches) return;

    this.el = this.host.nativeElement;
    this.active = true;
    this.el.addEventListener('pointermove', this.onMove);
    this.el.addEventListener('pointerleave', this.onLeave);
  }

  ngOnDestroy(): void {
    if (!this.active) return;
    this.el.removeEventListener('pointermove', this.onMove);
    this.el.removeEventListener('pointerleave', this.onLeave);
    gsap.killTweensOf(this.el);
  }

  private readonly onMove = (event: PointerEvent) => {
    const rect = this.el.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    const strength = this.magnetStrength();

    gsap.to(this.el, {
      x: dx * strength,
      y: dy * strength,
      duration: 0.6,
      ease: 'power3.out'
    });
  };

  private readonly onLeave = () => {
    gsap.to(this.el, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.4)' });
  };
}

/** Halou discret care urmareste cursorul in interiorul cardului (SpotlightCard). */
@Directive({
  selector: '[aiaSpotlight]',
  standalone: true,
  host: { class: 'aia-spotlight' }
})
export class SpotlightDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private el!: HTMLElement;
  private active = false;

  ngAfterViewInit(): void {
    if (window.matchMedia('(hover: none)').matches) return;
    this.el = this.host.nativeElement;
    this.active = true;
    this.el.addEventListener('pointermove', this.onMove);
    this.el.addEventListener('pointerleave', this.onLeave);
  }

  ngOnDestroy(): void {
    if (!this.active) return;
    this.el.removeEventListener('pointermove', this.onMove);
    this.el.removeEventListener('pointerleave', this.onLeave);
  }

  private readonly onMove = (event: PointerEvent) => {
    const rect = this.el.getBoundingClientRect();
    this.el.style.setProperty('--sx', `${event.clientX - rect.left}px`);
    this.el.style.setProperty('--sy', `${event.clientY - rect.top}px`);
    this.el.style.setProperty('--s-opacity', '1');
  };

  private readonly onLeave = () => {
    this.el.style.setProperty('--s-opacity', '0');
  };
}

/** Inclinare 3D usoara la hover (TiltedCard). */
@Directive({
  selector: '[aiaTilt]',
  standalone: true
})
export class TiltDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly anim = inject(AnimationService);

  readonly tiltMax = input(7);

  private el!: HTMLElement;
  private active = false;

  ngAfterViewInit(): void {
    if (this.anim.reducedMotion) return;
    if (window.matchMedia('(hover: none)').matches) return;

    this.el = this.host.nativeElement;
    this.el.style.transformStyle = 'preserve-3d';
    this.active = true;
    this.el.addEventListener('pointermove', this.onMove);
    this.el.addEventListener('pointerleave', this.onLeave);
  }

  ngOnDestroy(): void {
    if (!this.active) return;
    this.el.removeEventListener('pointermove', this.onMove);
    this.el.removeEventListener('pointerleave', this.onLeave);
    gsap.killTweensOf(this.el);
  }

  private readonly onMove = (event: PointerEvent) => {
    const rect = this.el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    const max = this.tiltMax();

    gsap.to(this.el, {
      rotateY: px * max,
      rotateX: -py * max,
      transformPerspective: 900,
      duration: 0.5,
      ease: 'power2.out'
    });
  };

  private readonly onLeave = () => {
    gsap.to(this.el, { rotateX: 0, rotateY: 0, duration: 0.8, ease: 'power3.out' });
  };
}

/** Apariție simplă la scroll, pentru blocuri care nu sunt text. */
@Directive({
  selector: '[aiaReveal]',
  standalone: true
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly anim = inject(AnimationService);

  readonly revealY = input(40);
  readonly revealDelay = input(0);

  private tween?: gsap.core.Tween | null;

  ngAfterViewInit(): void {
    this.tween = this.anim.revealOnScroll(this.host.nativeElement, {
      y: this.revealY(),
      stagger: 0,
      delay: this.revealDelay()
    });
  }

  ngOnDestroy(): void {
    this.tween?.scrollTrigger?.kill();
    this.tween?.kill();
  }
}

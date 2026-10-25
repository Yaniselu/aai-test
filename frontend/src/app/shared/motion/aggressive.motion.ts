import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  OnDestroy,
  inject,
  input,
  viewChild
} from '@angular/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimationService } from '../../core/services/animation.service';

/**
 * Titlu care "loveste" ecranul: literele cad din fata camerei (mari, blurate,
 * rotite) si se infig una dupa alta; la ultima, sectiunea tremura, un flash
 * rosu porneste din titlu, iar textul ramane cu glitch RGB in rafale.
 *
 * Inlocuieste SplitTextDirective pe titlurile de sectiune.
 */
@Directive({
  selector: '[aiaImpact]',
  standalone: true
})
export class ImpactDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly anim = inject(AnimationService);

  readonly impactDelay = input(0);
  /** Fara flash si cutremur (pentru titluri mici sau foarte dese). */
  readonly impactQuiet = input(false);

  private tl?: gsap.core.Timeline;
  private observer?: MutationObserver;

  ngAfterViewInit(): void {
    const el = this.host.nativeElement as HTMLElement;
    const text = (el.textContent ?? '').trim();
    if (!text) return;

    el.setAttribute('data-text', text);
    if (this.anim.reducedMotion) {
      el.classList.add('aia-glitch');
      return;
    }

    el.setAttribute('aria-label', text);
    el.textContent = '';
    const chars: HTMLElement[] = [];
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        el.appendChild(document.createTextNode(' '));
        return;
      }
      const word = document.createElement('span');
      word.style.display = 'inline-block';
      word.style.whiteSpace = 'nowrap';
      word.setAttribute('aria-hidden', 'true');
      for (const ch of Array.from(part)) {
        const c = document.createElement('span');
        c.textContent = ch;
        c.style.display = 'inline-block';
        c.style.willChange = 'transform, opacity, filter';
        word.appendChild(c);
        chars.push(c);
      }
      el.appendChild(word);
    });

    const section = el.closest('section') ?? el.parentElement ?? el;
    this.tl = gsap.timeline({
      delay: this.impactDelay(),
      scrollTrigger: { trigger: el, start: 'top 82%', once: true }
    });
    this.tl
      .fromTo(
        chars,
        {
          opacity: 0,
          scale: () => gsap.utils.random(2.6, 4.2),
          rotate: () => gsap.utils.random(-28, 28),
          yPercent: () => gsap.utils.random(-60, 40),
          filter: 'blur(14px)'
        },
        {
          opacity: 1,
          scale: 1,
          rotate: 0,
          yPercent: 0,
          filter: 'blur(0px)',
          duration: 0.42,
          ease: 'power4.in',
          stagger: { each: 0.028, from: 'random' },
          immediateRender: true
        }
      )
      .add(() => {
        // Glitch-ul porneste abia dupa impact, ca sa nu arate textul inainte.
        el.classList.add('aia-glitch');
        if (this.impactQuiet()) return;
        const r = el.getBoundingClientRect();
        this.anim.flash(r.left + r.width / 2, r.top + r.height / 2, 0.45);
        this.anim.shake(section, 7);
      })
      .fromTo(chars, { color: '#ff0019' }, { color: '', duration: 0.5, stagger: 0.01, ease: 'none', clearProps: 'color' }, '<');

    // Daca se schimba limba, Angular rescrie textul: refacem eticheta de glitch.
    this.observer = new MutationObserver(() => {
      const t = (el.textContent ?? '').trim();
      if (t && el.childElementCount === 0) el.setAttribute('data-text', t);
    });
    this.observer.observe(el, { childList: true, characterData: true, subtree: true });
  }

  ngOnDestroy(): void {
    this.tl?.scrollTrigger?.kill();
    this.tl?.kill();
    this.observer?.disconnect();
  }
}

/**
 * Rand de text urias care aluneca orizontal odata cu scroll-ul (nu in bucla,
 * ca marquee-ul): cititorul il "impinge". Doua randuri, in sensuri opuse,
 * unul plin si unul doar contur rosu.
 */
@Component({
  selector: 'aia-kinetic',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #wrap class="wrap" aria-hidden="true">
      <div class="row r1 font-display">
        @for (n of reps; track n) {
          <span>{{ top() }}</span><i></i>
        }
      </div>
      <div class="row r2 font-display aia-text-outline-red">
        @for (n of reps; track n) {
          <span>{{ bottom() }}</span><i></i>
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host { display: block; overflow: hidden; padding: 4vh 0; }
      .wrap { transform: rotate(-4deg) scale(1.08); }
      .row {
        display: flex;
        align-items: center;
        gap: 4vw;
        white-space: nowrap;
        font-size: clamp(80px, 17vw, 280px);
        line-height: 0.86;
        will-change: transform;
      }
      .r1 { color: var(--aia-text); }
      .row i {
        flex-shrink: 0;
        width: 0.28em;
        height: 0.28em;
        background: var(--aia-blood);
        clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
      }
    `
  ]
})
export class KineticTextComponent implements AfterViewInit, OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly wrap = viewChild.required<ElementRef<HTMLElement>>('wrap');

  readonly top = input('NO PAIN');
  readonly bottom = input('NO GLORY');
  readonly reps = [1, 2, 3, 4];

  private tweens: gsap.core.Tween[] = [];

  ngAfterViewInit(): void {
    if (this.anim.reducedMotion) return;
    const el = this.wrap().nativeElement;
    const [r1, r2] = Array.from(el.children) as HTMLElement[];
    const st = { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.4 };
    this.tweens.push(gsap.fromTo(r1, { xPercent: 0 }, { xPercent: -35, ease: 'none', scrollTrigger: st }));
    this.tweens.push(gsap.fromTo(r2, { xPercent: -40 }, { xPercent: -5, ease: 'none', scrollTrigger: { ...st } }));
  }

  ngOnDestroy(): void {
    this.tweens.forEach((t) => {
      t.scrollTrigger?.kill();
      t.kill();
    });
  }
}

/**
 * Taietura: o lama rosie in diagonala care sfasie ecranul cand intra in
 * viewport, urmata de o linie alba subtire si de scantei. Separator de sectiuni.
 */
@Component({
  selector: 'aia-slash',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #root class="root" aria-hidden="true">
      <span class="blade"></span>
      <span class="line"></span>
      <span class="label font-heading">{{ label() }}</span>
    </div>
  `,
  styles: [
    `
      :host { display: block; position: relative; height: 120px; pointer-events: none; overflow: hidden; }
      .root { position: absolute; inset: 0; transform: rotate(-5deg); }
      .blade,
      .line {
        position: absolute;
        left: -10%;
        right: -10%;
        top: 50%;
        transform-origin: left center;
      }
      .blade {
        height: 26px;
        margin-top: -13px;
        background: var(--aia-blood);
        box-shadow: 0 0 60px 6px rgba(255, 0, 25, 0.6);
        clip-path: polygon(0 40%, 100% 0, 100% 100%, 0 60%);
      }
      .line { height: 1px; margin-top: 22px; background: var(--aia-text); opacity: 0.6; }
      .label {
        position: absolute;
        right: 6%;
        top: 50%;
        margin-top: -46px;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.5em;
        color: var(--aia-blood);
      }
    `
  ]
})
export class SlashComponent implements AfterViewInit, OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  readonly label = input('');
  private tl?: gsap.core.Timeline;
  private st?: ScrollTrigger;

  ngAfterViewInit(): void {
    if (this.anim.reducedMotion) return;
    const el = this.root().nativeElement;
    const blade = el.querySelector('.blade');
    const line = el.querySelector('.line');
    const label = el.querySelector('.label');

    this.tl = gsap
      .timeline({ paused: true })
      .fromTo(blade, { scaleX: 0 }, { scaleX: 1, duration: 0.38, ease: 'expo.in' })
      .add(() => {
        const r = el.getBoundingClientRect();
        this.anim.flash(r.left + r.width * 0.8, r.top + r.height / 2, 0.6);
      })
      .fromTo(blade, { scaleY: 1 }, { scaleY: 0.12, duration: 0.6, ease: 'expo.out' })
      .fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'expo.out' }, '<')
      .fromTo(label, { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.5 }, '<0.1');

    this.st = ScrollTrigger.create({
      trigger: el,
      start: 'top 75%',
      once: true,
      onEnter: () => this.tl?.play()
    });
  }

  ngOnDestroy(): void {
    this.st?.kill();
    this.tl?.kill();
  }
}

/**
 * Un panou rosu acopera elementul si se retrage brusc spre dreapta cand
 * acesta intra in ecran, ca o perdea trasa dintr-o miscare. Gazda trebuie
 * sa fie `position: relative` si `overflow: hidden`.
 */
@Directive({
  selector: '[aiaWipe]',
  standalone: true
})
export class WipeDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly anim = inject(AnimationService);

  readonly wipeDelay = input(0);
  private tl?: gsap.core.Timeline;
  private panel?: HTMLElement;

  ngAfterViewInit(): void {
    if (this.anim.reducedMotion) return;
    const el = this.host.nativeElement as HTMLElement;
    this.panel = document.createElement('div');
    this.panel.className = 'aia-wipe-panel';
    this.panel.setAttribute('aria-hidden', 'true');
    el.appendChild(this.panel);

    this.tl = gsap
      .timeline({ delay: this.wipeDelay(), scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
      .fromTo(this.panel, { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: 0.35, ease: 'expo.in' })
      .set(this.panel, { transformOrigin: 'right center' })
      .to(this.panel, { scaleX: 0, duration: 0.6, ease: 'expo.out' })
      .set(this.panel, { display: 'none' });
  }

  ngOnDestroy(): void {
    this.tl?.scrollTrigger?.kill();
    this.tl?.kill();
    this.panel?.remove();
  }
}

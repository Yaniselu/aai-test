import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal
} from '@angular/core';
import { AnimationService } from '../../core/services/animation.service';
import { IconComponent } from '../icons/icon.component';
import { VideoTileComponent } from './video-tile.component';

type PhoneUi = 'reel' | 'story' | 'none';

interface Burst {
  id: number;
  x: number;
  y: number;
  r: number;
}

/**
 * Mockup de telefon desenat integral in CSS: rama de titan, butoane laterale,
 * Dynamic Island, bara de stare si un ecran care poate rula video sau imagine.
 *
 * Interfata de deasupra imita un reel sau un story, ca materialele din sala
 * sa arate exact cum ajung la parinti pe telefon. E interactiv:
 *  - dublu-click / dublu-tap pe ecran = inima care explodeaza + like numarat;
 *  - hover = Dynamic Island se extinde intr-un "live activity";
 *  - reflexia de pe sticla urmareste cursorul.
 *
 * Dimensiunea vine din exterior (latimea host-ului); totul in interior se
 * scaleaza cu `em`, deci acelasi telefon arata corect si la 140px si la 360px.
 */
@Component({
  selector: 'aia-phone',
  standalone: true,
  imports: [IconComponent, VideoTileComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(pointermove)': 'onMove($event)',
    '(pointerleave)': 'onLeave()'
  },
  template: `
    <div class="phone" [class.phone--active]="active()">
      <span class="btn btn--action" aria-hidden="true"></span>
      <span class="btn btn--vol-up" aria-hidden="true"></span>
      <span class="btn btn--vol-down" aria-hidden="true"></span>
      <span class="btn btn--power" aria-hidden="true"></span>

      <div class="screen" (dblclick)="burst($event)">
        @if (video()) {
          <aia-video-tile class="media" [src]="video()!" [poster]="poster()" [label]="caption()" />
        } @else if (image()) {
          <img class="media" [src]="image()" [alt]="caption()" loading="lazy" decoding="async" draggable="false" />
        } @else {
          <div class="media media--empty"><ng-content /></div>
        }

        <div class="shade" aria-hidden="true"></div>

        <!-- Bara de stare -->
        <div class="status" aria-hidden="true">
          <span class="aia-index">{{ time() }}</span>
          <span class="status__right">
            <span class="bars"><i></i><i></i><i></i><i></i></span>
            <span class="battery"><i></i></span>
          </span>
        </div>

        <!-- Dynamic Island -->
        <div class="island" aria-hidden="true">
          <span class="island__dot"></span>
          <span class="island__text">{{ islandText() }}</span>
          <span class="island__wave"><i></i><i></i><i></i><i></i></span>
        </div>

        @if (ui() === 'story') {
          <div class="story" aria-hidden="true">
            <div class="story__bars">
              @for (b of [0, 1, 2]; track b) {
                <span><i [style.animationDelay]="b * 5 + 's'"></i></span>
              }
            </div>
            <div class="story__who">
              <span class="avatar">AI</span>
              <span>{{ handle() }}</span>
              <span class="muted">· {{ ago() }}</span>
            </div>
          </div>
        }

        @if (ui() === 'reel') {
          <div class="reel">
            <div class="reel__side">
              <button type="button" class="reel__act" [class.liked]="liked()" (click)="toggleLike()" aria-label="Like">
                <aia-icon name="heart" [size]="0" class="ic" />
                <span>{{ likeLabel() }}</span>
              </button>
              <span class="reel__act" aria-hidden="true">
                <aia-icon name="message" [size]="0" class="ic" />
                <span>{{ comments() }}</span>
              </span>
              <span class="reel__act" aria-hidden="true">
                <aia-icon name="send" [size]="0" class="ic" />
              </span>
              <span class="reel__act" aria-hidden="true">
                <aia-icon name="bookmark" [size]="0" class="ic" />
              </span>
              <span class="disc" aria-hidden="true"></span>
            </div>

            <div class="reel__meta" aria-hidden="true">
              <div class="reel__who">
                <span class="avatar">AI</span>
                <b>{{ handle() }}</b>
                <span class="follow">Follow</span>
              </div>
              <p class="reel__caption">{{ caption() }}</p>
              <div class="reel__music">
                <aia-icon name="music" [size]="0" class="ic-s" />
                <span class="reel__track"><span>Academia Ion Andrei · sunet original · Academia Ion Andrei · sunet original ·</span></span>
              </div>
            </div>
          </div>
        }

        @for (b of bursts(); track b.id) {
          <span class="burst" [style.left.px]="b.x" [style.top.px]="b.y" [style.--r]="b.r + 'deg'" aria-hidden="true">
            <aia-icon name="heart" [size]="0" class="ic-burst" />
          </span>
        }

        <div class="glare" aria-hidden="true"></div>
        <div class="home-bar" aria-hidden="true"></div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        position: relative;
        width: 280px;
        container-type: inline-size;
        aspect-ratio: 9 / 19.3;
        --gx: 30%;
        --gy: 20%;
        user-select: none;
        -webkit-user-select: none;
      }

      .phone {
        position: absolute;
        inset: 0;
        /* Toate dimensiunile interne sunt in em: 1em = 1/28 din latimea host-ului. */
        font-size: calc(100cqw / 28);
        border-radius: 4.6em;
        padding: 0.75em;
        background:
          linear-gradient(145deg, #5b5d68 0%, #1d1e24 18%, #3b3d46 40%, #121318 62%, #4a4c56 82%, #1b1c22 100%);
        box-shadow:
          inset 0 0 0 0.14em rgba(255, 255, 255, 0.18),
          inset 0 0 0 0.42em #0b0b0f,
          0 0.15em 0.4em rgba(255, 255, 255, 0.08),
          0 3em 6em -1.6em rgba(0, 0, 0, 0.75),
          0 1.2em 2.4em -0.8em rgba(0, 0, 0, 0.6);
        transition: box-shadow 0.6s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .phone--active,
      :host(:hover) .phone {
        box-shadow:
          inset 0 0 0 0.14em rgba(255, 255, 255, 0.24),
          inset 0 0 0 0.42em #0b0b0f,
          0 0 3em -0.5em rgba(255, 31, 61, 0.5),
          0 3em 6em -1.6em rgba(0, 0, 0, 0.75);
      }

      .btn {
        position: absolute;
        width: 0.28em;
        border-radius: 0.2em;
        background: linear-gradient(90deg, #2a2b31, #5f616c, #2a2b31);
      }
      .btn--action { left: -0.18em; top: 15%; height: 2.4em; }
      .btn--vol-up { left: -0.18em; top: 23%; height: 4.2em; }
      .btn--vol-down { left: -0.18em; top: 32%; height: 4.2em; }
      .btn--power { right: -0.18em; top: 26%; height: 6.4em; }

      .screen {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: 3.9em;
        background: #000;
        isolation: isolate;
        transform: translateZ(0);
        color: #fff;
        font-family: 'Poppins', system-ui, sans-serif;
      }

      .media {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
      }
      .media--empty {
        display: grid;
        place-items: center;
        background: radial-gradient(circle at 30% 20%, #ff1f3d55, transparent 60%), radial-gradient(circle at 70% 80%, #ffffff44, transparent 60%), #08080e;
      }

      .shade {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background: linear-gradient(180deg, rgba(0, 0, 0, 0.55) 0%, transparent 16%, transparent 58%, rgba(0, 0, 0, 0.8) 100%);
      }

      .status {
        position: absolute;
        inset: 0 0 auto 0;
        z-index: 3;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25em 2.2em 0 2.6em;
        font-size: 1.05em;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .status__right { display: flex; gap: 0.4em; align-items: center; }
      .bars { display: flex; gap: 0.12em; align-items: flex-end; height: 0.8em; }
      .bars i { display: block; width: 0.22em; background: #fff; border-radius: 0.1em; }
      .bars i:nth-child(1) { height: 30%; }
      .bars i:nth-child(2) { height: 55%; }
      .bars i:nth-child(3) { height: 80%; }
      .bars i:nth-child(4) { height: 100%; }
      .battery {
        position: relative;
        width: 1.9em;
        height: 0.9em;
        border: 0.1em solid rgba(255, 255, 255, 0.6);
        border-radius: 0.28em;
        padding: 0.1em;
      }
      .battery i { display: block; height: 100%; width: 78%; background: #fff; border-radius: 0.12em; }

      .island {
        position: absolute;
        z-index: 4;
        top: 0.9em;
        left: 50%;
        transform: translateX(-50%);
        height: 2.6em;
        width: 8.6em;
        border-radius: 2em;
        background: #000;
        display: flex;
        align-items: center;
        gap: 0.6em;
        padding: 0 0.9em;
        overflow: hidden;
        box-shadow: 0 0 0 0.05em rgba(255, 255, 255, 0.05);
        transition: width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.7s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .island__dot {
        width: 0.8em;
        height: 0.8em;
        flex-shrink: 0;
        border-radius: 50%;
        background: #ff1f3d;
        box-shadow: 0 0 0.6em #ff1f3d;
        animation: aia-pulse-dot 1.6s ease-out infinite;
        opacity: 0;
        transition: opacity 0.3s;
      }
      .island__text {
        white-space: nowrap;
        font-size: 0.95em;
        font-weight: 600;
        opacity: 0;
        transform: translateY(0.6em);
        transition: opacity 0.3s, transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
      }
      .island__wave { display: flex; gap: 0.16em; margin-left: auto; align-items: center; height: 1em; opacity: 0; transition: opacity 0.3s; }
      .island__wave i {
        display: block;
        width: 0.2em;
        height: 100%;
        border-radius: 0.1em;
        background: #ffffff;
        animation: phone-wave 0.9s ease-in-out infinite;
      }
      .island__wave i:nth-child(2) { animation-delay: 0.15s; }
      .island__wave i:nth-child(3) { animation-delay: 0.3s; }
      .island__wave i:nth-child(4) { animation-delay: 0.45s; }
      .phone--active .island,
      :host(:hover) .island { width: 16.5em; height: 3em; }
      .phone--active .island > *,
      :host(:hover) .island > * { opacity: 1; transform: none; transition-delay: 0.18s; }

      .story { position: absolute; inset: 0 0 auto 0; z-index: 3; padding: 4.4em 1.4em 0; }
      .story__bars { display: flex; gap: 0.35em; }
      .story__bars span { flex: 1; height: 0.22em; border-radius: 1em; background: rgba(255, 255, 255, 0.3); overflow: hidden; }
      .story__bars i {
        display: block;
        height: 100%;
        width: 100%;
        background: #fff;
        transform-origin: left;
        animation: phone-story 15s linear infinite;
      }
      .story__who { display: flex; align-items: center; gap: 0.6em; margin-top: 1em; font-size: 1.1em; font-weight: 600; }

      .avatar {
        display: grid;
        place-items: center;
        width: 2.4em;
        height: 2.4em;
        flex-shrink: 0;
        border-radius: 50%;
        font-size: 0.75em;
        font-family: 'Oswald', sans-serif;
        font-weight: 800;
        background: linear-gradient(135deg, #ff1f3d, #7a0010);
        box-shadow: 0 0 0 0.16em #000, 0 0 0 0.3em #ff4d5e;
      }
      .muted { opacity: 0.6; font-weight: 400; }

      .reel { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
      .reel__side {
        position: absolute;
        right: 1em;
        bottom: 5.2em;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.4em;
      }
      .reel__act {
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25em;
        font-size: 0.95em;
        font-weight: 600;
        color: #fff;
        background: none;
        border: 0;
        padding: 0;
        text-shadow: 0 0.1em 0.4em rgba(0, 0, 0, 0.5);
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .reel__act:active { transform: scale(0.8); }
      .reel__act .ic { width: 2.5em; height: 2.5em; }
      :host ::ng-deep .reel__act .ic svg,
      :host ::ng-deep .ic-s svg,
      :host ::ng-deep .ic-burst svg { width: 100%; height: 100%; }
      .reel__act.liked { color: #ff1f3d; }
      :host ::ng-deep .reel__act.liked svg { fill: #ff1f3d; animation: phone-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
      .disc {
        width: 2.6em;
        height: 2.6em;
        border-radius: 0.7em;
        border: 0.2em solid #fff;
        background: conic-gradient(#ff1f3d, #7a0010, #ffffff, #ff1f3d);
        animation: aia-spin 5s linear infinite;
      }

      .reel__meta { position: absolute; left: 1.4em; right: 5.4em; bottom: 2.8em; }
      .reel__who { display: flex; align-items: center; gap: 0.6em; font-size: 1.05em; }
      .follow {
        border: 0.08em solid rgba(255, 255, 255, 0.7);
        padding: 0.15em 0.7em;
        border-radius: 0.6em;
        font-size: 0.85em;
        font-weight: 600;
      }
      .reel__caption {
        margin: 0.7em 0 0;
        font-size: 1em;
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .reel__music { display: flex; align-items: center; gap: 0.5em; margin-top: 0.7em; font-size: 0.9em; }
      .ic-s { width: 1.1em; height: 1.1em; }
      .reel__track { overflow: hidden; white-space: nowrap; flex: 1; mask: linear-gradient(90deg, #000 80%, transparent); }
      .reel__track span { display: inline-block; animation: phone-track 9s linear infinite; }

      .burst {
        position: absolute;
        z-index: 6;
        width: 7em;
        height: 7em;
        margin: -3.5em 0 0 -3.5em;
        color: #ff1f3d;
        pointer-events: none;
        filter: drop-shadow(0 0.4em 1.2em rgba(255, 31, 61, 0.7));
        animation: phone-burst 0.95s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .ic-burst { width: 100%; height: 100%; }
      :host ::ng-deep .ic-burst svg { fill: #ff1f3d; stroke: none; }

      .glare {
        position: absolute;
        inset: 0;
        z-index: 7;
        pointer-events: none;
        border-radius: inherit;
        background:
          radial-gradient(circle at var(--gx) var(--gy), rgba(255, 255, 255, 0.22), transparent 38%),
          linear-gradient(115deg, transparent 30%, rgba(255, 255, 255, 0.1) 42%, transparent 50%);
        mix-blend-mode: screen;
      }

      .home-bar {
        position: absolute;
        z-index: 8;
        bottom: 0.7em;
        left: 50%;
        width: 9em;
        height: 0.3em;
        transform: translateX(-50%);
        border-radius: 1em;
        background: rgba(255, 255, 255, 0.85);
      }

      @keyframes phone-wave {
        0%, 100% { transform: scaleY(0.3); }
        50% { transform: scaleY(1); }
      }
      @keyframes phone-story {
        from { transform: scaleX(0); }
        to { transform: scaleX(1); }
      }
      @keyframes phone-track {
        from { transform: translateX(0); }
        to { transform: translateX(-50%); }
      }
      @keyframes phone-pop {
        0% { transform: scale(0.4); }
        100% { transform: scale(1); }
      }
      @keyframes phone-burst {
        0% { transform: scale(0) rotate(var(--r)); opacity: 0; }
        20% { transform: scale(1.25) rotate(var(--r)); opacity: 1; }
        40% { transform: scale(0.95) rotate(var(--r)); }
        70% { transform: scale(1) rotate(var(--r)) translateY(0); opacity: 1; }
        100% { transform: scale(1.1) rotate(var(--r)) translateY(-3em); opacity: 0; }
      }
    `
  ]
})
export class PhoneMockupComponent {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly anim = inject(AnimationService);

  readonly video = input<string | null>(null);
  readonly image = input<string | null>(null);
  readonly poster = input('');
  readonly ui = input<PhoneUi>('reel');
  readonly handle = input('academiaionandrei');
  readonly caption = input('Antrenament de seara · disciplina inainte de toate');
  readonly baseLikes = input(1284);
  readonly comments = input(86);
  readonly ago = input('2h');
  readonly islandText = input('LIVE · Sala Craiova');
  readonly time = input('9:41');
  /** Forteaza starea de hover (Dynamic Island deschis, glow) din exterior. */
  readonly active = input(false);

  readonly liked = signal(false);
  readonly extraLikes = signal(0);
  readonly bursts = signal<Burst[]>([]);

  readonly likeLabel = computed(() => {
    const n = this.baseLikes() + this.extraLikes();
    return n >= 1000 ? (n / 1000).toFixed(1).replace('.0', '') + 'K' : String(n);
  });

  private burstId = 0;

  toggleLike(): void {
    this.liked.update((v) => !v);
    this.extraLikes.update((n) => n + (this.liked() ? 1 : -1));
  }

  burst(event: MouseEvent): void {
    const screen = event.currentTarget as HTMLElement;
    const rect = screen.getBoundingClientRect();
    // Pozitia e in pixeli de layout; ecranul poate fi scalat de un transform 3D.
    const scaleX = screen.offsetWidth / rect.width || 1;
    const scaleY = screen.offsetHeight / rect.height || 1;
    const id = ++this.burstId;
    const b: Burst = {
      id,
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
      r: Math.round(Math.random() * 40 - 20)
    };
    this.bursts.update((list) => [...list, b]);
    if (!this.liked()) this.toggleLike();
    setTimeout(() => this.bursts.update((list) => list.filter((x) => x.id !== id)), 1000);
  }

  onMove(event: PointerEvent): void {
    if (this.anim.reducedMotion) return;
    const el = this.host.nativeElement as HTMLElement;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--gx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty('--gy', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  }

  onLeave(): void {
    const el = this.host.nativeElement as HTMLElement;
    el.style.setProperty('--gx', '30%');
    el.style.setProperty('--gy', '20%');
  }
}

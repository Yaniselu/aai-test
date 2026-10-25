import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  inject,
  input,
  viewChild
} from '@angular/core';
import { AnimationService } from '../../core/services/animation.service';

/**
 * Videoclip decorativ, care ruleaza in bucla fara sunet.
 *
 * Doua lucruri il fac corect, nu doar functional:
 *  - se opreste cand iese din viewport, ca sa nu decodeze cadre degeaba si sa
 *    nu consume bateria pe telefon;
 *  - la `prefers-reduced-motion` nu porneste deloc si arata primul cadru,
 *    pentru ca un clip in bucla este exact tipul de miscare care deranjeaza.
 */
@Component({
  selector: 'aia-video-tile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <video
      #video
      class="h-full w-full object-cover"
      [attr.poster]="poster() || null"
      muted
      loop
      playsinline
      preload="metadata"
      [attr.aria-label]="label()"
      disablepictureinpicture
    >
      <source [src]="src()" type="video/mp4" />
    </video>
  `,
  styles: [
    `
      :host {
        display: block;
        overflow: hidden;
      }
    `
  ]
})
export class VideoTileComponent implements AfterViewInit, OnDestroy {
  private readonly anim = inject(AnimationService);
  private readonly videoRef = viewChild.required<ElementRef<HTMLVideoElement>>('video');

  readonly src = input.required<string>();
  readonly poster = input('');
  readonly label = input('Moment din sala de antrenament');

  private observer?: IntersectionObserver;

  ngAfterViewInit(): void {
    const el = this.videoRef().nativeElement;

    // `muted` setat si din cod: unele browsere ignora atributul din markup
    // atunci cand decid daca permit redarea automata.
    el.muted = true;

    if (this.anim.reducedMotion) {
      el.removeAttribute('loop');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            void el.play().catch(() => {
              /* autoplay refuzat de browser - ramane primul cadru */
            });
          } else {
            el.pause();
          }
        }
      },
      { threshold: 0.15 }
    );

    this.observer.observe(el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.videoRef().nativeElement.pause();
  }
}

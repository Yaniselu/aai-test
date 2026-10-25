import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/**
 * Monograma academiei.
 *
 * Foloseste logo-ul oficial din `/media/logo.png`. Daca fisierul lipseste inca,
 * `(error)` comuta pe o monograma SVG desenata, ca antetul sa nu ramana cu o
 * imagine rupta in locul brandului.
 */
@Component({
  selector: 'aia-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="inline-flex items-center gap-3">
      <span
        class="grid shrink-0 place-items-center overflow-hidden rounded-[13px] transition-transform duration-500"
        [style.backgroundColor]="'var(--aia-blood)'"
        [style.width.px]="size()"
        [style.height.px]="size()"
        aria-hidden="true"
      >
        @if (imageOk()) {
          <img
            src="media/logo.png"
            alt=""
            class="object-contain"
            [style.width.px]="size() * 0.62"
            [style.height.px]="size() * 0.62"
            (error)="imageOk.set(false)"
          />
        } @else {
          <svg
            [attr.width]="size() * 0.55"
            [attr.height]="size() * 0.55"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 20 9 4l6 16M5.4 14.5h7.2" />
            <path d="M19.5 4v16" />
          </svg>
        }
      </span>

      @if (showText()) {
        <span class="leading-none">
          <span class="block font-display text-[15px] font-extrabold tracking-[0.1em]">Academia</span>
          <span class="mt-1 block text-[11px] tracking-[0.22em]" [style.color]="'var(--aia-text-muted)'">
            Ion Andrei
          </span>
        </span>
      }
    </span>
  `,
  styles: [`:host { display: inline-flex; }`]
})
export class LogoComponent {
  readonly size = input(42);
  readonly showText = input(true);

  readonly imageOk = signal(true);
}

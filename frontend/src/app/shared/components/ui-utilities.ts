import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { ClipboardService } from '../../core/services/clipboard.service';
import { IconComponent } from '../icons/icon.component';
import { SmoothScrollService } from '../../core/services/smooth-scroll.service';

/** Bara de progres a scroll-ului, fixata in partea de sus a paginii. */
@Component({
  selector: 'aia-scroll-progress',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-x-0 top-0 z-[120] h-[3px] origin-left"
      style="background: linear-gradient(90deg, var(--aia-blood-deep), var(--aia-blood-bright))"
      [style.transform]="'scaleX(' + progress() + ')'"
      role="progressbar"
      aria-label="Progresul citirii paginii"
      [attr.aria-valuenow]="Math.round(progress() * 100)"
      aria-valuemin="0"
      aria-valuemax="100"
    ></div>
  `
})
export class ScrollProgressComponent {
  readonly Math = Math;
  readonly progress = signal(0);

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onScroll(): void {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    this.progress.set(scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0);
  }
}

/** Buton "inapoi sus", vizibil dupa ce utilizatorul a coborat suficient. */
@Component({
  selector: 'aia-back-to-top',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="fixed bottom-24 right-5 z-[130] grid h-12 w-12 place-items-center rounded-full border transition-all duration-300"
      [style.borderColor]="'var(--aia-border)'"
      [style.backgroundColor]="'var(--aia-bg-elev)'"
      [style.opacity]="visible() ? 1 : 0"
      [style.transform]="visible() ? 'translateY(0)' : 'translateY(20px)'"
      [style.pointerEvents]="visible() ? 'auto' : 'none'"
      (click)="toTop()"
      aria-label="Inapoi sus"
    >
      <aia-icon name="arrow-up" [size]="18" />
    </button>
  `
})
export class BackToTopComponent {
  private readonly scroller = inject(SmoothScrollService);
  readonly visible = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.visible.set(window.scrollY > 600);
  }

  toTop(): void {
    // Lenis detine scroll-ul; window.scrollTo ar produce un salt brusc.
    this.scroller.scrollTo(0, 0);
  }
}

/** Buton de copiere in clipboard, cu feedback vizual temporar. */
@Component({
  selector: 'aia-copy-button',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 font-heading text-[10px] font-bold uppercase tracking-[0.14em] transition-colors hover:border-[var(--aia-cyan)]"
      [style.borderColor]="copied() ? 'var(--aia-blood)' : 'var(--aia-border)'"
      (click)="copy()"
      [attr.aria-label]="'Copiaza ' + label()"
    >
      <aia-icon [name]="copied() ? 'check' : 'copy'" [size]="13" />
      <span>{{ copied() ? 'Copiat' : 'Copiaza' }}</span>
    </button>
  `
})
export class CopyButtonComponent {
  private readonly clipboard = inject(ClipboardService);

  readonly value = input.required<string>();
  readonly label = input('textul');
  readonly copied = signal(false);

  async copy(): Promise<void> {
    const ok = await this.clipboard.copy(this.value(), this.label());
    if (!ok) return;
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2200);
  }
}

/** Modal de confirmare pentru actiuni ireversibile sau cu efecte in lant. */
@Component({
  selector: 'aia-confirm-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-[170] grid place-items-center px-4"
        style="background: rgba(0,0,0,.75); backdrop-filter: blur(4px)"
        (click)="cancelled.emit()"
      >
        <div
          class="aia-card w-full max-w-md p-7"
          [style.backgroundColor]="'var(--aia-bg-elev)'"
          [style.borderColor]="'var(--aia-border)'"
          style="animation: aia-confirm-in .28s cubic-bezier(.16,1,.3,1)"
          (click)="$event.stopPropagation()"
          role="alertdialog"
          aria-modal="true"
          [attr.aria-label]="title()"
        >
          <h2 class="font-display text-3xl">{{ title() }}</h2>
          <p class="mt-3 text-sm leading-relaxed" [style.color]="'var(--aia-text-muted)'">{{ message() }}</p>

          <div class="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" class="aia-btn aia-btn-ghost" (click)="cancelled.emit()">
              {{ cancelLabel() }}
            </button>
            <button
              type="button"
              class="aia-btn"
              [class.aia-btn-primary]="!destructive()"
              [style.backgroundColor]="destructive() ? 'var(--aia-blood-deep)' : null"
              [style.color]="destructive() ? '#fff' : null"
              (click)="confirmed.emit()"
            >
              {{ confirmLabel() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      @keyframes aia-confirm-in {
        from {
          opacity: 0;
          transform: scale(0.94);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
    `
  ]
})
export class ConfirmModalComponent {
  readonly open = input(false);
  readonly title = input('Confirmare');
  readonly message = input('Esti sigur ca vrei sa continui?');
  readonly confirmLabel = input('Confirm');
  readonly cancelLabel = input('Anuleaza');
  readonly destructive = input(false);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) this.cancelled.emit();
  }
}

/** Loader tematic: un cerc rotativ cu accent rosu. */
@Component({
  selector: 'aia-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center gap-4 py-16" role="status" aria-live="polite">
      <div class="relative h-14 w-14">
        <span
          class="absolute inset-0 rounded-full border-2 border-transparent"
          style="border-top-color: var(--aia-blood); animation: aia-spin .9s linear infinite"
        ></span>
        <span
          class="absolute inset-2 rounded-full border-2 border-transparent"
          style="border-bottom-color: var(--aia-metal); animation: aia-spin 1.4s linear infinite reverse"
        ></span>
      </div>
      <p class="font-heading text-[11px] uppercase tracking-[0.3em]" [style.color]="'var(--aia-text-muted)'">
        {{ label() }}
      </p>
    </div>
  `,
  styles: [
    `
      @keyframes aia-spin {
        to {
          transform: rotate(360deg);
        }
      }
    `
  ]
})
export class LoaderComponent {
  readonly label = input('Se incarca');
}

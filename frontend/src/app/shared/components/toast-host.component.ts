import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../icons/icon.component';

/** Stiva de notificari. Regiune `polite` ca cititoarele de ecran sa anunte mesajele. */
@Component({
  selector: 'aia-toast-host',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="pointer-events-none fixed bottom-5 right-5 z-[150] flex w-[min(380px,calc(100vw-2.5rem))] flex-col gap-3"
      role="region"
      aria-live="polite"
      aria-label="Notificari"
    >
      @for (toast of toasts.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 rounded-[var(--aia-radius-sm)] border border-l-4 p-4"
          [style.backgroundColor]="'color-mix(in srgb, var(--aia-bg-soft) 94%, transparent)'"
          [style.backdropFilter]="'blur(14px)'"
          [style.borderColor]="'var(--aia-border)'"
          [style.borderLeftColor]="accent(toast.kind)"
          [style.boxShadow]="'var(--aia-shadow)'"
          style="animation: aia-toast-in .35s cubic-bezier(.16,1,.3,1)"
        >
          <span class="mt-0.5" [style.color]="accent(toast.kind)">
            <aia-icon [name]="icon(toast.kind)" [size]="18" />
          </span>

          <div class="min-w-0 flex-1">
            <p class="font-heading text-sm font-semibold uppercase tracking-wide">{{ toast.title }}</p>
            @if (toast.message) {
              <p class="mt-1 break-words text-sm" [style.color]="'var(--aia-text-muted)'">{{ toast.message }}</p>
            }
          </div>

          <button
            type="button"
            class="shrink-0 opacity-50 transition-opacity hover:opacity-100"
            (click)="toasts.dismiss(toast.id)"
            aria-label="Inchide notificarea"
          >
            <aia-icon name="close" [size]="16" />
          </button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      @keyframes aia-toast-in {
        from {
          opacity: 0;
          transform: translateX(40px) scale(0.96);
        }
        to {
          opacity: 1;
          transform: translateX(0) scale(1);
        }
      }
    `
  ]
})
export class ToastHostComponent {
  readonly toasts = inject(ToastService);

  accent(kind: string): string {
    switch (kind) {
      case 'success':
        return '#22c55e';
      case 'error':
        return 'var(--aia-blood-bright)';
      case 'warning':
        return '#f59e0b';
      default:
        return '#3b82f6';
    }
  }

  icon(kind: string): string {
    switch (kind) {
      case 'success':
        return 'check';
      case 'error':
        return 'x-circle';
      case 'warning':
        return 'alert';
      default:
        return 'info';
    }
  }
}

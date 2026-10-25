import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { ACADEMY } from '../../core/academy.data';

/**
 * Butonul flotant de WhatsApp.
 *
 * Pentru o academie locala, WhatsApp este canalul real de inscriere - de aceea
 * sta permanent la indemana, nu ascuns in subsol. Se restrange la o pastila
 * mica dupa ce utilizatorul incepe sa deruleze, ca sa nu acopere continutul.
 */
@Component({
  selector: 'aia-whatsapp-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [href]="academy.whatsapp"
      target="_blank"
      rel="noopener noreferrer"
      class="no-print fixed bottom-5 right-5 z-[135] inline-flex items-center gap-2.5 rounded-full py-3.5 transition-all duration-500"
      [style.paddingLeft.px]="compact() ? 14 : 20"
      [style.paddingRight.px]="compact() ? 14 : 22"
      [style.backgroundColor]="'#25D366'"
      [style.color]="'#08120c'"
      [style.boxShadow]="'var(--aia-shadow)'"
      aria-label="Scrie-ne pe WhatsApp"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path
          d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.83 2.41a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.78.97-.15.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.08.14-1.18-.06-.11-.22-.17-.47-.29z"
        />
      </svg>

      <span
        class="overflow-hidden whitespace-nowrap font-heading text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-500"
        [style.maxWidth.px]="compact() ? 0 : 230"
        [style.opacity]="compact() ? 0 : 1"
      >
        Scrie-ne pe WhatsApp
      </span>
    </a>
  `,
  styles: [`:host { display: contents; }`]
})
export class WhatsappButtonComponent {
  readonly academy = ACADEMY;
  readonly compact = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.compact.set(window.scrollY > 500);
  }
}

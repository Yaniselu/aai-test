import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { Router } from '@angular/router';
import { SearchService, SearchEntry } from '../../core/services/search.service';
import { IconComponent } from '../icons/icon.component';

/** Cautare rapida in site (Ctrl+K / Cmd+K), cu navigare de la tastatura. */
@Component({
  selector: 'aia-search-modal',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (search.isOpen()) {
      <div
        class="fixed inset-0 z-[160] flex items-start justify-center px-4 pt-[12vh]"
        style="background: rgba(0,0,0,.72); backdrop-filter: blur(6px); animation: aia-fade .2s ease"
        (click)="search.close()"
      >
        <div
          class="aia-card w-full max-w-2xl overflow-hidden"
          [style.backgroundColor]="'color-mix(in srgb, var(--aia-bg-soft) 96%, transparent)'"
          style="animation: aia-pop .28s cubic-bezier(.16,1,.3,1)"
          (click)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true"
          aria-label="Cautare in site"
        >
          <div class="flex items-center gap-3 border-b px-5 py-4" [style.borderColor]="'var(--aia-border)'">
            <span class="opacity-50"><aia-icon name="search" [size]="18" /></span>
            <input
              #input
              type="search"
              class="w-full bg-transparent text-lg outline-none"
              placeholder="Cauta pagini, sectiuni, functii..."
              [value]="search.query()"
              (input)="onInput($any($event.target).value)"
              autocomplete="off"
              aria-label="Termen de cautare"
            />
            <kbd class="rounded-md border px-2 py-1 text-[10px] opacity-50" [style.borderColor]="'var(--aia-border)'">ESC</kbd>
          </div>

          <ul class="max-h-[55vh] overflow-y-auto py-2" role="listbox">
            @for (entry of search.results(); track entry.route + (entry.fragment ?? ''); let i = $index) {
              <li>
                <button
                  type="button"
                  class="flex w-full items-center justify-between gap-4 px-5 py-3 text-left transition-colors"
                  [style.backgroundColor]="i === active() ? 'var(--aia-bg-elev-2)' : 'transparent'"
                  (mouseenter)="active.set(i)"
                  (click)="go(entry)"
                  [attr.aria-selected]="i === active()"
                  role="option"
                >
                  <span class="min-w-0">
                    <span class="block font-heading text-sm uppercase tracking-wide">{{ entry.title }}</span>
                    <span class="block truncate text-sm" [style.color]="'var(--aia-text-muted)'">
                      {{ entry.description }}
                    </span>
                  </span>
                  <span class="shrink-0 font-heading text-[10px] font-bold uppercase tracking-[0.18em]" [style.color]="'var(--aia-cyan)'">
                    {{ entry.section }}
                  </span>
                </button>
              </li>
            } @empty {
              <li class="px-5 py-10 text-center" [style.color]="'var(--aia-text-muted)'">
                Niciun rezultat pentru &laquo;{{ search.query() }}&raquo;.
              </li>
            }
          </ul>

          <div
            class="flex items-center gap-4 border-t px-5 py-3 text-[11px]"
            [style.borderColor]="'var(--aia-border)'"
            [style.color]="'var(--aia-text-muted)'"
          >
            <span>&uarr;&darr; navigare</span>
            <span>&crarr; deschide</span>
            <span>ESC inchide</span>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      @keyframes aia-fade {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes aia-pop {
        from {
          opacity: 0;
          transform: translateY(-18px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `
  ]
})
export class SearchModalComponent {
  readonly search = inject(SearchService);
  private readonly router = inject(Router);

  readonly active = signal(0);
  private readonly input = viewChild<ElementRef<HTMLInputElement>>('input');

  constructor() {
    effect(() => {
      if (this.search.isOpen()) {
        this.active.set(0);
        document.body.classList.add('aia-locked');
        // Focusul trebuie mutat dupa ce elementul exista in DOM.
        queueMicrotask(() => this.input()?.nativeElement.focus());
      } else {
        document.body.classList.remove('aia-locked');
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    // Ctrl+K / Cmd+K deschide de oriunde din site.
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.search.toggle();
      return;
    }

    if (!this.search.isOpen()) return;

    const results = this.search.results();
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        this.search.close();
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.active.update((i) => (results.length ? (i + 1) % results.length : 0));
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.active.update((i) => (results.length ? (i - 1 + results.length) % results.length : 0));
        break;
      case 'Enter': {
        event.preventDefault();
        const entry = results[this.active()];
        if (entry) this.go(entry);
        break;
      }
    }
  }

  onInput(value: string): void {
    this.search.query.set(value);
    this.active.set(0);
  }

  go(entry: SearchEntry): void {
    this.search.close();
    void this.router.navigate([entry.route], { fragment: entry.fragment });
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { I18nService } from '../../core/services/i18n.service';

/**
 * Comutator RO / EN: o pastila cu cele doua limbi si un cursor rosu care
 * aluneca sub limba activa. E un singur buton (role="switch"), deci merge si
 * din tastatura si e anuntat corect de cititoarele de ecran.
 */
@Component({
  selector: 'aia-lang-toggle',
  standalone: true,
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      role="switch"
      class="toggle"
      [class.big]="size() === 'lg'"
      [class.en]="isEn()"
      [attr.aria-checked]="isEn()"
      [attr.aria-label]="'nav.language' | translate"
      (click)="i18n.toggle()"
    >
      <span class="thumb" aria-hidden="true"></span>
      <span class="opt" [class.on]="!isEn()" aria-hidden="true">RO</span>
      <span class="opt" [class.on]="isEn()" aria-hidden="true">EN</span>
    </button>
  `,
  styles: [
    `
      :host { display: inline-flex; }
      .toggle {
        --w: 37px;
        position: relative;
        display: grid;
        grid-template-columns: var(--w) var(--w);
        height: 40px;
        padding: 3px;
        border: 1px solid var(--aia-border);
        background: var(--card-base);
        clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
        transition: border-color 0.25s;
      }
      .toggle:hover { border-color: var(--aia-border-strong); }
      .toggle.big { --w: 64px; height: 48px; }
      .thumb {
        position: absolute;
        left: 3px;
        top: 3px;
        bottom: 3px;
        width: var(--w);
        background: var(--aia-blood);
        clip-path: polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px);
        transition: transform 0.45s var(--aia-spring);
      }
      .en .thumb { transform: translateX(var(--w)); }
      .opt {
        position: relative;
        display: grid;
        place-items: center;
        font-family: 'Oswald', sans-serif;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.16em;
        color: var(--aia-text-muted);
        transition: color 0.25s;
      }
      .big .opt { font-size: 13px; }
      .opt.on { color: #fff; }
    `
  ]
})
export class LangToggleComponent {
  readonly i18n = inject(I18nService);
  readonly size = input<'md' | 'lg'>('md');
  readonly isEn = computed(() => this.i18n.current() === 'en');
}

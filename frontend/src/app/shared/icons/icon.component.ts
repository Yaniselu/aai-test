import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Set unic de iconite SVG.
 *
 * Emoji-urile arata diferit pe fiecare sistem de operare si nu pot fi colorate
 * sau aliniate optic. Aici totul e desenat pe grila 24x24, cu `currentColor`,
 * deci iconitele mostenesc culoarea si grosimea contextului.
 */

interface IconDef {
  /** Contururi desenate cu stroke. */
  paths?: string[];
  /** Cercuri: [cx, cy, r]. */
  circles?: [number, number, number][];
  /** Marci care arata corect doar pline (logo-uri social). */
  filled?: boolean;
}

const ICONS: Record<string, IconDef> = {
  // ---- interfata ----
  search: { paths: ['m21 21-4.35-4.35'], circles: [[11, 11, 7.5]] },
  close: { paths: ['M18 6 6 18M6 6l12 12'] },
  check: { paths: ['M20 6 9 17l-5-5'] },
  alert: { paths: ['m10.29 3.86-8.18 14A2 2 0 0 0 3.82 21h16.36a2 2 0 0 0 1.71-3.14l-8.18-14a2 2 0 0 0-3.42 0z', 'M12 9v4', 'M12 17h.01'] },
  info: { paths: ['M12 16v-4', 'M12 8h.01'], circles: [[12, 12, 10]] },
  sun: { paths: ['M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1'], circles: [[12, 12, 4.5]] },
  moon: { paths: ['M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z'] },
  copy: { paths: ['M20 9h-9a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2z', 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'] },
  eye: { paths: ['M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z'], circles: [[12, 12, 3]] },
  'eye-off': { paths: ['M17.9 17.9A10.1 10.1 0 0 1 12 20c-7 0-10-8-10-8a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.1 9.1 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.2 3.2m-6.7-1.1a3 3 0 1 1-4.2-4.2', 'M2 2l20 20'] },
  'arrow-up': { paths: ['M12 19V5M5 12l7-7 7 7'] },
  'arrow-right': { paths: ['M5 12h14M12 5l7 7-7 7'] },
  'arrow-down': { paths: ['M12 5v14M19 12l-7 7-7-7'] },
  'chevron-left': { paths: ['m15 18-6-6 6-6'] },
  'chevron-right': { paths: ['m9 18 6-6-6-6'] },
  menu: { paths: ['M3 12h18M3 6h18M3 18h18'] },
  plus: { paths: ['M12 5v14M5 12h14'] },
  printer: { paths: ['M6 9V2h12v7', 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2', 'M6 14h12v8H6z'] },
  logout: { paths: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'm16 17 5-5-5-5M21 12H9'] },
  upload: { paths: ['M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm17 8-5-5-5 5M12 3v12'] },
  refresh: { paths: ['M23 4v6h-6', 'M20.5 15a9 9 0 1 1-2.1-9.4L23 10'] },
  'x-circle': { paths: ['m15 9-6 6M9 9l6 6'], circles: [[12, 12, 10]] },

  // ---- contact / locatii ----
  pin: { paths: ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'], circles: [[12, 10, 3]] },
  phone: { paths: ['M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z'] },
  mail: { paths: ['M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'm22 6-10 7L2 6'] },
  calendar: { paths: ['M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M16 2v4M8 2v4M3 10h18'] },
  'calendar-check': { paths: ['M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z', 'M16 2v4M8 2v4M3 10h18', 'm9 15 2 2 4-4'] },
  clock: { paths: ['M12 6.5V12l3.5 2'], circles: [[12, 12, 9.5]] },
  hourglass: { paths: ['M6 2h12M6 22h12M6 2v3.5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V2M6 22v-3.5a6 6 0 0 1 6-6 6 6 0 0 1 6 6V22'] },

  // ---- academie ----
  lock: { paths: ['M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z', 'M7.5 11V7a4.5 4.5 0 0 1 9 0v4'] },
  trophy: { paths: ['M8 21h8M12 17.5V21M7 3h10v5.5a5 5 0 0 1-10 0V3z', 'M7 5.5H5a2 2 0 0 0 0 4h2M17 5.5h2a2 2 0 0 1 0 4h-2'] },
  flame: { paths: ['M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.4-.5-2-1-3-1.1-2.1-.2-4 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.2.4-2.3 1-3a2.5 2.5 0 0 0 2.5 2.5z'] },
  star: { paths: ['m12 2.5 2.9 5.9 6.6 1-4.8 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L3.5 9.4l6.6-1L12 2.5z'] },
  shield: { paths: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'] },
  'shield-check': { paths: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'm9 11.5 2 2 4-4'] },
  bolt: { paths: ['M13 2 3.5 14H12l-1 8 9.5-12H12l1-8z'] },
  target: { circles: [[12, 12, 9.5], [12, 12, 5.5], [12, 12, 1.5]] },
  dumbbell: { paths: ['M6.5 6.5v11M17.5 6.5v11M3 9.5v5M21 9.5v5M6.5 12h11'] },
  user: { paths: ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'], circles: [[12, 7, 4]] },
  users: { paths: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8'], circles: [[9, 7, 4]] },
  image: { paths: ['M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z', 'm21 15-5-5L5 21'], circles: [[8.5, 8.5, 1.5]] },
  wheel: { paths: ['M12 2.5v19M2.5 12h19M5.2 5.2l13.6 13.6M18.8 5.2 5.2 18.8'], circles: [[12, 12, 9.5], [12, 12, 2.5]] },

  // ---- echipament (Battle Pass) ----
  shirt: { paths: ['M16 2a4 4 0 0 1-8 0L3.5 4.2 2 8.5l4 1.8V22h12V10.3l4-1.8-1.5-4.3L16 2z'] },
  shorts: { paths: ['M4.5 3h15l1 9.5-.8 8.5h-5.4L12 13l-2.3 8H4.3l-.8-8.5L4.5 3z', 'M4 8.5h16'] },
  wrap: { paths: ['M12 2.5v19M7.5 4.2v15.6M16.5 4.2v15.6'], circles: [[12, 12, 9.5]] },
  'shin-guard': { paths: ['M12 2s7 2 7 7c0 6-7 13-7 13S5 15 5 9c0-5 7-7 7-7z', 'M12 7v9'] },
  glove: { paths: ['M7 11.5V7a4 4 0 0 1 8 0v4.5h1.5a3 3 0 0 1 3 3V17a4.5 4.5 0 0 1-4.5 4.5h-5A4.5 4.5 0 0 1 5.5 17v-3', 'M7 16h11'] },
  gift: { paths: ['M20 12v10H4V12M2 7h20v5H2zM12 22V7', 'M12 7H7.8a2.4 2.4 0 1 1 0-4.8C11 2.2 12 7 12 7zM12 7h4.2a2.4 2.4 0 1 0 0-4.8C13 2.2 12 7 12 7z'] },
  medal: { paths: ['m8 3 2.5 5M16 3l-2.5 5', 'M12 8v0'], circles: [[12, 15, 6.5]] },

  // ---- retele sociale (pline) ----
  instagram: {
    filled: true,
    paths: [
      'M12 2.2c3.2 0 3.6 0 4.9.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.86s0 3.6-.07 4.86c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.86.07s-3.6 0-4.86-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.6 2.2 15.22 2.2 12s0-3.6.07-4.86c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.46 2.21 8.84 2.2 12 2.2zm0 3.13a6.67 6.67 0 1 0 0 13.34 6.67 6.67 0 0 0 0-13.34zm0 11a4.33 4.33 0 1 1 0-8.66 4.33 4.33 0 0 1 0 8.66zm8.48-11.27a1.56 1.56 0 1 1-3.12 0 1.56 1.56 0 0 1 3.12 0z'
    ]
  },
  facebook: { filled: true, paths: ['M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12z'] },
  youtube: { filled: true, paths: ['M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.25 5 12 5 12 5s-6.25 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.75 19 12 19 12 19s6.25 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15.1V8.9l5.2 3.1-5.2 3.1z'] },
  tiktok: { filled: true, paths: ['M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5 2.59 2.59 0 1 1 .77-5.06V9.7a5.66 5.66 0 0 0-.77-.05A5.68 5.68 0 1 0 15.54 15.4V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3a4.29 4.29 0 0 1-3.24-1.48z'] }
};

@Component({
  selector: 'aia-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      [attr.fill]="def().filled ? 'currentColor' : 'none'"
      [attr.stroke]="def().filled ? 'none' : 'currentColor'"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label()"
      focusable="false"
    >
      @for (d of def().paths ?? []; track d) {
        <path [attr.d]="d" />
      }
      @for (c of def().circles ?? []; track c[0] + '-' + c[1] + '-' + c[2]) {
        <circle [attr.cx]="c[0]" [attr.cy]="c[1]" [attr.r]="c[2]" />
      }
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        flex-shrink: 0;
        line-height: 0;
      }
    `
  ]
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input(20);
  readonly strokeWidth = input(1.6);
  /** Setat doar cand iconita transmite informatie, nu cand e decorativa. */
  readonly label = input<string | null>(null);

  readonly def = computed<IconDef>(() => ICONS[this.name()] ?? ICONS['info']);
}

/** Numele disponibile, utile pentru verificari in dezvoltare. */
export const ICON_NAMES = Object.keys(ICONS);

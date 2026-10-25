import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Cadru comun pentru paginile legale, optimizat si pentru tiparire. */
@Component({
  selector: 'aia-legal-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="aia-container max-w-3xl py-16">
      <p class="aia-eyebrow">Document legal</p>
      <h1 class="mt-3 font-display text-5xl leading-none sm:text-6xl">{{ title() }}</h1>
      <p class="mt-4 text-sm" style="color: var(--aia-text-muted)">
        Ultima actualizare: {{ updated() }} &middot; Operator: Academia Ion Andrei S.R.L., CUI 12345678
      </p>

      <div class="legal-body mt-12">
        <ng-content />
      </div>

      <button type="button" class="aia-btn aia-btn-ghost no-print mt-14" (click)="print()">
        Tipareste documentul
      </button>
    </article>
  `,
  styles: [
    `
      .legal-body ::ng-deep h2 {
        font-family: 'Bebas Neue', sans-serif;
        font-size: 1.9rem;
        margin-top: 2.75rem;
        margin-bottom: 0.75rem;
      }
      .legal-body ::ng-deep h3 {
        font-family: 'Oswald', sans-serif;
        font-size: 1rem;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-top: 1.75rem;
        margin-bottom: 0.5rem;
      }
      .legal-body ::ng-deep p,
      .legal-body ::ng-deep li {
        color: var(--aia-text-muted);
        line-height: 1.75;
        font-size: 0.95rem;
      }
      .legal-body ::ng-deep p {
        margin-bottom: 1rem;
      }
      .legal-body ::ng-deep ul {
        list-style: disc;
        padding-left: 1.4rem;
        margin-bottom: 1.25rem;
      }
      .legal-body ::ng-deep li {
        margin-bottom: 0.5rem;
      }
      .legal-body ::ng-deep a {
        color: var(--aia-blood-bright);
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      .legal-body ::ng-deep table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1.5rem;
        font-size: 0.9rem;
      }
      .legal-body ::ng-deep th,
      .legal-body ::ng-deep td {
        border: 1px solid var(--aia-border);
        padding: 0.65rem 0.85rem;
        text-align: left;
      }
      .legal-body ::ng-deep th {
        font-family: 'Oswald', sans-serif;
        text-transform: uppercase;
        font-size: 0.75rem;
        letter-spacing: 0.08em;
      }
    `
  ]
})
export class LegalShellComponent {
  readonly title = input('Document');
  readonly updated = input('1 ianuarie 2026');

  print(): void {
    window.print();
  }
}

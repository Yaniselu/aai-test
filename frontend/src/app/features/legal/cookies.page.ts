import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CookieConsentService } from '../../core/services/cookie-consent.service';
import { ToastService } from '../../core/services/toast.service';
import { LegalShellComponent } from './legal-shell.component';

@Component({
  selector: 'aia-cookies',
  standalone: true,
  imports: [LegalShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aia-legal-shell title="POLITICA DE COOKIE-URI" updated="1 ianuarie 2026">
      <p>
        Cookie-urile sunt fisiere mici salvate in browserul tau. Le folosim ca site-ul sa
        functioneze si, cu acordul tau, ca sa intelegem cum este folosit.
      </p>

      <h2>1. Ce folosim</h2>
      <table>
        <thead>
          <tr>
            <th>Nume</th>
            <th>Categorie</th>
            <th>Scop</th>
            <th>Durata</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>aia.token</td>
            <td>Strict necesar</td>
            <td>Mentine sesiunea autentificata</td>
            <td>Pana la iesirea din cont</td>
          </tr>
          <tr>
            <td>aia.cookie.consent</td>
            <td>Strict necesar</td>
            <td>Retine optiunea ta privind cookie-urile</td>
            <td>12 luni</td>
          </tr>
          <tr>
            <td>aia.theme / aia.lang</td>
            <td>Strict necesar</td>
            <td>Retine tema si limba alese</td>
            <td>12 luni</td>
          </tr>
          <tr>
            <td>aia.intro.seen</td>
            <td>Strict necesar</td>
            <td>Nu reia animatia de intro in aceeasi sesiune</td>
            <td>Durata sesiunii</td>
          </tr>
          <tr>
            <td>aia.utm</td>
            <td>Marketing</td>
            <td>Retine sursa campaniei prin care ai ajuns pe site</td>
            <td>30 de zile</td>
          </tr>
          <tr>
            <td>_ga / _ga_*</td>
            <td>Analiza</td>
            <td>Statistici agregate de trafic</td>
            <td>Pana la 24 de luni</td>
          </tr>
        </tbody>
      </table>

      <h2>2. Controlul tau</h2>
      <p>
        Cookie-urile de analiza si marketing se seteaza doar dupa ce le accepti explicit. Poti
        schimba sau retrage optiunea oricand, folosind butonul de mai jos sau linkul din subsolul
        paginii.
      </p>

      <div class="no-print">
        <button type="button" class="aia-btn aia-btn-primary" (click)="reset()">
          Reseteaza preferintele cookie
        </button>
      </div>

      <h2>3. Setari din browser</h2>
      <p>
        Poti bloca sau sterge cookie-urile si direct din setarile browserului. Retine ca blocarea
        cookie-urilor strict necesare face imposibila autentificarea in platforma.
      </p>
    </aia-legal-shell>
  `
})
export class CookiesPage {
  private readonly consent = inject(CookieConsentService);
  private readonly toast = inject(ToastService);

  reset(): void {
    this.consent.reset();
    this.toast.info('Preferinte resetate', 'Banner-ul de cookie-uri va reaparea imediat.');
  }
}

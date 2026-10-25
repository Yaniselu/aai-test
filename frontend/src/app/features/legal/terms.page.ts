import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LegalShellComponent } from './legal-shell.component';

@Component({
  selector: 'aia-terms',
  standalone: true,
  imports: [LegalShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aia-legal-shell title="TERMENI SI CONDITII" updated="1 ianuarie 2026">
      <p>
        Prin crearea unui cont si utilizarea platformei Academia Ion Andrei accepti termenii de
        mai jos. Daca nu esti de acord cu ei, te rugam sa nu folosesti platforma.
      </p>

      <h2>1. Contul tau</h2>
      <ul>
        <li>Contul se creeaza cu date reale si complete.</li>
        <li>
          Orice cont nou este verificat de un administrator inainte de a primi acces. Verificarea
          confirma ca esti sportiv inscris al academiei.
        </li>
        <li>Esti responsabil pentru pastrarea confidentialitatii parolei tale.</li>
        <li>Un cont apartine unei singure persoane si nu poate fi transferat.</li>
      </ul>

      <h2>2. Prezente si XP</h2>
      <p>
        Prezentele sunt inregistrate exclusiv de antrenori, dupa fiecare antrenament. XP-ul si
        nivelul Battle Pass se calculeaza automat pe baza lor. Contestatiile privind o prezenta
        se rezolva direct cu antrenorul grupei, in termen de 7 zile.
      </p>

      <h2>3. Battle Pass si recompense</h2>
      <ul>
        <li>Recompensele se deblocheaza la atingerea nivelului cerut, cu maximum 2 absente in luna respectiva.</li>
        <li>Recompensele revendicate se ridica fizic de la receptia salii, in termen de 14 zile.</li>
        <li>Recompensele nu pot fi schimbate in bani si nu sunt transferabile.</li>
        <li>Academia poate modifica lista de recompense de la un sezon la altul, anuntand in prealabil.</li>
      </ul>

      <h2>4. Roata norocului</h2>
      <p>
        Fiecare sportiv cu cont aprobat are dreptul la o invartire pe saptamana. Rezultatul este
        determinat pe server, aleatoriu si ponderat, si nu poate fi influentat din browser.
        Incercarile de manipulare duc la suspendarea contului.
      </p>

      <h2>5. Continut incarcat de utilizatori (story-uri)</h2>
      <ul>
        <li>Incarci doar continut propriu sau pentru care ai acordul persoanelor care apar in el.</li>
        <li>Este interzis continutul violent gratuit, discriminatoriu, sexual sau publicitar.</li>
        <li>Story-urile se sterg automat dupa 24 de ore.</li>
        <li>Antrenorii si administratorii pot sterge oricand un continut care incalca regulile.</li>
      </ul>

      <h2>6. Reguli de conduita</h2>
      <p>
        Platforma este o extensie a salii. Se aplica aceleasi reguli de respect fata de colegi,
        antrenori si adversari. Comportamentul abuziv duce la suspendarea contului si poate atrage
        excluderea din academie.
      </p>

      <h2>7. Disponibilitate si limitarea raspunderii</h2>
      <p>
        Depunem eforturi rezonabile pentru ca platforma sa fie disponibila permanent, dar nu
        garantam functionarea neintrerupta. Nu raspundem pentru pierderi indirecte rezultate din
        indisponibilitate temporara. Datele privind prezentele sunt pastrate si in evidenta fizica
        a academiei.
      </p>

      <h2>8. Incetare</h2>
      <p>
        Poti solicita oricand stergerea contului scriindu-ne la
        <a href="mailto:academiaionandrei&#64;gmail.com">academiaionandrei&#64;gmail.com</a>.
        Academia poate suspenda un cont in caz de incalcare a acestor termeni, cu notificare
        prealabila, exceptand situatiile grave.
      </p>

      <h2>9. Legea aplicabila</h2>
      <p>
        Acestor termeni li se aplica legea romana. Eventualele litigii se solutioneaza pe cale
        amiabila sau, in lipsa, de instantele competente din Craiova. Consumatorii se pot adresa
        si platformei SAL a ANPC.
      </p>
    </aia-legal-shell>
  `
})
export class TermsPage {}

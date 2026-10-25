import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LegalShellComponent } from './legal-shell.component';

@Component({
  selector: 'aia-privacy',
  standalone: true,
  imports: [LegalShellComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aia-legal-shell title="POLITICA DE CONFIDENTIALITATE" updated="1 ianuarie 2026">
      <p>
        Aceasta politica explica ce date personale colectam prin platforma Academia Ion Andrei,
        de ce le colectam si ce drepturi ai asupra lor, conform Regulamentului (UE) 2016/679 (GDPR).
      </p>

      <h2>1. Cine suntem</h2>
      <p>
        Operatorul datelor este Academia Ion Andrei, cu sediul in Calea Severinului 2e,
        200222, Craiova. Ne poti contacta pentru orice chestiune legata de datele tale la
        <a href="mailto:academiaionandrei&#64;gmail.com">academiaionandrei&#64;gmail.com</a>
        sau la telefon 0773 869 303.
      </p>

      <h2>2. Ce date colectam si de ce</h2>
      <table>
        <thead>
          <tr>
            <th>Categorie</th>
            <th>Date</th>
            <th>Scop</th>
            <th>Temei legal</th>
            <th>Pastrare</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Cont</td>
            <td>Nume, email, telefon, parola (stocata criptat)</td>
            <td>Crearea si administrarea contului</td>
            <td>Executarea contractului</td>
            <td>Pe durata contului + 3 ani</td>
          </tr>
          <tr>
            <td>Activitate sportiva</td>
            <td>Prezente, XP, nivel Battle Pass, recompense</td>
            <td>Urmarirea progresului si acordarea premiilor</td>
            <td>Executarea contractului</td>
            <td>Pe durata contului</td>
          </tr>
          <tr>
            <td>Story-uri</td>
            <td>Imagini/clipuri incarcate voluntar</td>
            <td>Comunitatea academiei</td>
            <td>Consimtamant</td>
            <td>24 de ore, apoi stergere automata</td>
          </tr>
          <tr>
            <td>Formular de contact</td>
            <td>Nume, email, telefon, mesaj, parametri UTM</td>
            <td>Raspuns la solicitare si atribuirea sursei</td>
            <td>Consimtamant</td>
            <td>12 luni</td>
          </tr>
          <tr>
            <td>Tehnice</td>
            <td>Adresa IP, tip browser, jurnale de acces</td>
            <td>Securitatea platformei</td>
            <td>Interes legitim</td>
            <td>90 de zile</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Minori</h2>
      <p>
        Multi dintre sportivii nostri au sub 16 ani. Pentru acestia, contul se creeaza si se
        administreaza exclusiv de catre parinte sau reprezentantul legal, care isi exprima
        consimtamantul in scris la inscrierea in academie.
      </p>

      <h2>4. Cui divulgam datele</h2>
      <p>
        Nu vindem si nu inchiriem datele tale. Le partajam strict cu furnizorii care ne ajuta sa
        operam platforma, in baza unor contracte de prelucrare:
      </p>
      <ul>
        <li>furnizorul de gazduire a aplicatiei si a bazei de date;</li>
        <li>furnizorul de stocare a fisierelor pentru story-uri;</li>
        <li>furnizorul de servicii de email tranzactional;</li>
        <li>federatiile sportive, atunci cand te inscriem la o competitie.</li>
      </ul>

      <h2>5. Drepturile tale</h2>
      <ul>
        <li>dreptul de acces la datele tale si la o copie a lor;</li>
        <li>dreptul la rectificarea datelor inexacte;</li>
        <li>dreptul la stergere ("dreptul de a fi uitat");</li>
        <li>dreptul la restrictionarea prelucrarii;</li>
        <li>dreptul la portabilitatea datelor;</li>
        <li>dreptul de a te opune prelucrarii bazate pe interes legitim;</li>
        <li>dreptul de a-ti retrage consimtamantul oricand, fara a afecta legalitatea prelucrarii anterioare.</li>
      </ul>
      <p>
        Raspundem oricarei cereri in cel mult 30 de zile. Daca nu esti multumit de raspuns, te poti
        adresa Autoritatii Nationale de Supraveghere a Prelucrarii Datelor cu Caracter Personal
        (<a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer">dataprotection.ro</a>).
      </p>

      <h2>6. Securitate</h2>
      <p>
        Parolele sunt stocate exclusiv sub forma de hash BCrypt. Comunicatia se face prin HTTPS.
        Accesul la datele sportivilor este limitat la antrenorii si administratorii academiei.
      </p>

      <h2>7. Modificari</h2>
      <p>
        Orice modificare a acestei politici va fi anuntata pe site cu cel putin 14 zile inainte de
        intrarea in vigoare.
      </p>
    </aia-legal-shell>
  `
})
export class PrivacyPage {}

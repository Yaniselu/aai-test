# Academia Ion Andrei

Platformă completă pentru academia de arte marțiale din Craiova: site public
cinematic, zonă de sportiv cu gamification (XP, Battle Pass, roata norocului,
story-uri) și panou de antrenor pentru prezențe și competiții.

```
AcademiaIonAndrei/
├── frontend/     Angular 20 (standalone, signals, Tailwind, GSAP, Lenis)
└── backend/      Spring Boot 3.3 + Java 21 + PostgreSQL
                  (include mvnw — nu e nevoie de Maven instalat)
```

---

## 1. Ce conține

**Site public**
- Hero cu fotografie de brand, plasă 3D animată pe canvas și colaj video.
- Grupe, program săptămânal, antrenori, review-uri, galerie filtrabilă.
- Hartă Google Maps în vedere satelit (embed lazy, fără cheie API).
- Formular de contact cu atribuire UTM și buton WhatsApp permanent.
- Română / Engleză, dark & light mode.

**Zonă de sportiv**
- Profil: poză (max. 2 MB), biografie, data nașterii, XP, badge-uri, prezențe.
- Battle Pass cu 5 trepte pe praguri de XP: 1800 / 3600 / 6000 / 9000 / 13000.
- „Învârte-l pe Birtu": roată pe canvas, o învârtire pe săptămână.
- Story-uri de 24 de ore, calendar de competiții, program.

**Panou antrenor / admin**
- Marcarea prezenței (acordă și scade XP într-o singură tranzacție).
- Adăugarea competițiilor.
- Coadă de aprobare a conturilor noi, cu contor de cereri (doar admin).

---

## 2. Reguli de gamification

| Acțiune | Efect |
|---|---|
| Prezență la antrenament | **+50 XP** |
| Absență | **−50 XP** și +1 la contorul lunar |
| Recompensă Battle Pass | necesită pragul de XP **și** cel mult 2 absențe în luna curentă |

La ~13 antrenamente pe lună, tricoul (1800 XP) înseamnă aproximativ trei luni
de prezență constantă, iar mănușile (13000 XP) aproape doi ani.

**Roata**, cu șanse normalizate din ponderi: 50 XP — 33,3% · Necâștigător —
33,3% · 100 XP — 11,1% · Mai dă o dată — 11,1% · Motivare absență — 8,9% ·
Lună gratuită — 2,2%. Premiul e ales pe server cu `SecureRandom`; „Mai dă o
dată" nu consumă învârtirea săptămânală.

---

## 3. Rulare locală

### Backend

Necesită doar **JDK 21** (Maven vine prin wrapper). Profilul `dev` folosește
H2 în memorie, deci nu ai nevoie de PostgreSQL.

```bash
cd backend; .\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
```

Pornește pe `http://localhost:8080`. Admin: `admin@academiaionandrei.ro` / `admin1234`.

### Frontend

```bash
cd frontend; npm install; npm start
```

Pornește pe `http://localhost:4200` și țintește `http://localhost:8080/api`.

---

## 4. Publicare pe GitHub Pages

Workflow-ul din `.github/workflows/deploy-pages.yml` construiește și publică
automat frontend-ul la fiecare push pe `main`.

Activare, o singură dată: **Settings → Pages → Source: GitHub Actions**.

> **GitHub Pages servește doar fișiere statice**, deci nu poate rula backend-ul.
> Site-ul public funcționează integral; zona de cont afișează un mesaj că
> versiunea este un demo static. După ce publici API-ul separat (Render,
> Railway), pune adresa lui în `frontend/src/environments/environment.github.ts`
> și zona de cont începe să funcționeze.

Două detalii pe care workflow-ul le rezolvă și fără de care Pages ar da 404:

- `--base-href /<nume-repo>/`, ca resursele să se rezolve din subdirector;
- `404.html` copiat din `index.html`, ca rutele directe să ajungă la router-ul
  Angular în loc de pagina de eroare GitHub.

---

## 5. Deploy backend

`backend/render.yaml` definește serviciul Docker, baza PostgreSQL și discul
persistent pentru story-uri și avataruri.

1. În Render: **New → Blueprint**, root `backend`.
2. Setează manual `MAIL_HOST`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `SEED_ADMIN_PASSWORD`.
3. După primul deploy, actualizează `CORS_ORIGINS` cu adresa de GitHub Pages.

Variabile importante:

| Variabilă | Note |
|---|---|
| `JWT_SECRET` | minimum 32 de caractere; aplicația refuză să pornească altfel |
| `DATABASE_URL` / `DATABASE_USER` / `DATABASE_PASSWORD` | PostgreSQL |
| `CORS_ORIGINS` | listă separată prin virgulă |
| `STORAGE_PATH` / `AVATAR_PATH` | volume persistente |
| `JPA_DDL_AUTO` | `update` la început, `validate` după ce adaugi Flyway |

---

## 6. Sarcini programate

| Cron | Când | Ce face |
|---|---|---|
| `0 0 * * * *` | orar | Șterge story-urile expirate din DB **și** din stocare |
| `0 5 0 1 * *` | 1 ale lunii, 00:05 | Resetează contorul de absențe, recalculează nivelurile |
| `0 30 3 * * *` | zilnic, 03:30 | Plasă de siguranță pentru story-uri ratate |

> La scalare pe mai multe instanțe, adaugă **ShedLock** pentru resetarea lunară.

---

## 7. Note tehnice

**Aprobarea conturilor.** Contul nou are `approved = false`. Utilizatorul se
poate autentifica, dar `ApprovalFilter` respinge orice rută protejată cu
`403 PENDING_APPROVAL`. Excepțiile sunt `/api/auth/**` și `/api/users/me` —
exact ce îi trebuie ecranului „cont în verificare".

**Prezența** se aplică pe *delta* dintre statusul vechi și cel nou. Re-salvarea
aceleiași ședințe nu dublează XP-ul, iar corectarea unei bife readuce exact
valoarea dinainte.

**Battle Pass-ul** validează absențele din tabelul de prezențe, nu din contorul
de pe `User` — contorul e o optimizare de afișare, dar un `claim` e ireversibil.

**Fișierele** (avataruri, story-uri) se salvează pe disc, nu ca blob în baza de
date: un blob de 2 MB per utilizator ar umfla tabelul și backupurile.

**Programul săptămânal** e date statice în frontend — se schimbă de câteva ori
pe an și nu merită o interogare la fiecare vizită.

**Schema DB.** `ddl-auto: update` e comod la început. Înainte de producție
reală, adaugă Flyway și treci pe `validate`.
# aai-test

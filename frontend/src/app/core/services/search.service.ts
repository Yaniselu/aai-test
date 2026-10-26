import { Injectable, computed, signal } from '@angular/core';

export interface SearchEntry {
  /** Cheia de traducere: search.items.<id>.title / .desc */
  id: string;
  /** Titlul in romana, folosit doar pentru potrivirea cautarii (afisarea e tradusa). */
  title: string;
  description: string;
  route: string;
  fragment?: string;
  /** Cheia sectiunii: search.sections.<section> */
  section: string;
  /** Cuvinte cheie in ambele limbi, ca rezultatele sa apara indiferent de limba aleasa. */
  keywords: string[];
}

/** Index static de căutare (Ctrl/Cmd+K). Alimentează modalul de search. */
const INDEX: SearchEntry[] = [
  { id: 'home', title: 'Acasă', description: 'Pagina principală a academiei', route: '/', section: 'nav', keywords: ['acasa', 'home', 'start', 'principal'] },
  { id: 'groups', title: 'Grupe', description: 'Grupe pentru copii, adulți și karate', route: '/', fragment: 'grupe', section: 'nav', keywords: ['grupe', 'groups', 'copii', 'kids', 'adulti', 'adults', 'karate', 'kickbox'] },
  { id: 'schedule', title: 'Program', description: 'Programul săptămânal al antrenamentelor', route: '/', fragment: 'program', section: 'nav', keywords: ['program', 'schedule', 'orar', 'ore', 'hours'] },
  { id: 'coaches', title: 'Antrenori', description: 'Echipa de antrenori', route: '/', fragment: 'antrenori', section: 'nav', keywords: ['antrenori', 'coach', 'coaches', 'sensei', 'echipa', 'team'] },
  { id: 'gallery', title: 'Galerie', description: 'Fotografii și clipuri din sală și de la competiții', route: '/', fragment: 'galerie', section: 'nav', keywords: ['galerie', 'gallery', 'poze', 'photos', 'video', 'media'] },
  { id: 'location', title: 'Locație', description: 'Sala academiei pe hartă', route: '/', fragment: 'locatii', section: 'nav', keywords: ['locatie', 'location', 'harta', 'map', 'adresa', 'address', 'sala', 'gym'] },
  { id: 'register', title: 'Înscriere', description: 'Creează un cont nou de sportiv', route: '/auth/register', section: 'account', keywords: ['inscriere', 'register', 'cont nou', 'sign up', 'join'] },
  { id: 'login', title: 'Autentificare', description: 'Intră în contul tău', route: '/auth/login', section: 'account', keywords: ['autentificare', 'login', 'sign in', 'conectare'] },
  { id: 'profile', title: 'Profilul meu', description: 'XP, badge-uri și evoluție', route: '/dashboard', section: 'athlete', keywords: ['profil', 'profile', 'xp', 'evolutie', 'progress'] },
  { id: 'battlepass', title: 'Battle Pass', description: 'Recompense deblocate prin prezență', route: '/dashboard/battlepass', section: 'athlete', keywords: ['battle pass', 'recompense', 'rewards', 'premii', 'nivel', 'level', 'claim'] },
  { id: 'wheel', title: 'Învârte-l pe Birtu', description: 'Roata academiei, o învârtire pe săptămână', route: '/dashboard/roata', section: 'athlete', keywords: ['roata', 'wheel', 'spin', 'birtu', 'premii', 'xp'] },
  { id: 'stories', title: 'Story-uri', description: 'Momente din sală, vizibile 24 de ore', route: '/dashboard/stories', section: 'athlete', keywords: ['story', 'stories', 'poze', '24h'] },
  { id: 'competitions', title: 'Calendar competiții', description: 'Competițiile viitoare ale academiei', route: '/dashboard/competitii', section: 'athlete', keywords: ['calendar', 'competitii', 'competitions', 'concurs', 'tournament'] },
  { id: 'attendance', title: 'Prezență', description: 'Panoul antrenorului pentru marcarea prezenței', route: '/antrenor/prezenta', section: 'coach', keywords: ['prezenta', 'attendance', 'catalog'] },
  { id: 'approvals', title: 'Aprobare conturi', description: 'Validarea conturilor noi', route: '/antrenor/aprobari', section: 'admin', keywords: ['aprobare', 'approve', 'approvals', 'conturi', 'accounts'] },
  { id: 'privacy', title: 'Politică de confidențialitate', description: 'Cum prelucrăm datele tale', route: '/legal/confidentialitate', section: 'legal', keywords: ['gdpr', 'privacy', 'confidentialitate', 'date', 'data'] },
  { id: 'terms', title: 'Termeni și condiții', description: 'Regulamentul de utilizare', route: '/legal/termeni', section: 'legal', keywords: ['terms', 'termeni', 'regulament'] },
  { id: 'cookies', title: 'Politica de cookie-uri', description: 'Ce cookie-uri folosim și de ce', route: '/legal/cookies', section: 'legal', keywords: ['cookie', 'cookies', 'consent'] }
];

@Injectable({ providedIn: 'root' })
export class SearchService {
  readonly isOpen = signal(false);
  readonly query = signal('');

  readonly results = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return INDEX.slice(0, 8);

    return INDEX.map((entry) => ({ entry, score: this.score(entry, q) }))
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((r) => r.entry);
  });

  open(): void {
    this.query.set('');
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  private score(entry: SearchEntry, q: string): number {
    const title = entry.title.toLowerCase();
    if (title === q) return 100;
    if (title.startsWith(q)) return 80;
    if (title.includes(q)) return 60;
    if (entry.keywords.some((k) => k.includes(q))) return 40;
    if (entry.description.toLowerCase().includes(q)) return 20;
    return 0;
  }
}

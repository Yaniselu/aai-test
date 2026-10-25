import { Injectable, computed, signal } from '@angular/core';

export interface SearchEntry {
  title: string;
  description: string;
  route: string;
  fragment?: string;
  section: string;
  keywords: string[];
}

/** Index static de căutare (Ctrl/Cmd+K). Alimentează modalul de search. */
const INDEX: SearchEntry[] = [
  { title: 'Acasă', description: 'Pagina principală a academiei', route: '/', section: 'Navigare', keywords: ['home', 'start', 'principal'] },
  { title: 'Programe', description: 'Grupe de inițiere, juniori, seniori și performanță', route: '/', fragment: 'programe', section: 'Navigare', keywords: ['about', 'grupe', 'program', 'varsta'] },
  { title: 'Antrenori', description: 'Echipa de antrenori și palmaresul lor', route: '/', fragment: 'antrenori', section: 'Navigare', keywords: ['coach', 'sensei', 'echipa'] },
  { title: 'Galerie', description: 'Fotografii și clipuri de la competiții', route: '/', fragment: 'galerie', section: 'Navigare', keywords: ['poze', 'video', 'media'] },
  { title: 'Locații', description: 'Sălile academiei pe hartă', route: '/', fragment: 'locatii', section: 'Navigare', keywords: ['harta', 'maps', 'adresa', 'sala'] },
  { title: 'Înscriere', description: 'Creează un cont nou de sportiv', route: '/auth/register', section: 'Cont', keywords: ['register', 'cont nou', 'sign up'] },
  { title: 'Autentificare', description: 'Intră în contul tău', route: '/auth/login', section: 'Cont', keywords: ['login', 'sign in', 'conectare'] },
  { title: 'Profilul meu', description: 'XP, badge-uri și evoluție', route: '/dashboard', section: 'Sportiv', keywords: ['profil', 'xp', 'evolutie'] },
  { title: 'Battle Pass', description: 'Recompense deblocate prin prezență', route: '/dashboard/battlepass', section: 'Sportiv', keywords: ['recompense', 'premii', 'nivel', 'claim'] },
  { title: 'Învârte-l pe Birtu', description: 'Roata academiei, o învârtire pe săptămână', route: '/dashboard/roata', section: 'Sportiv', keywords: ['roata', 'wheel', 'spin', 'birtu', 'premii', 'xp'] },
  { title: 'Story-uri', description: 'Momente din sală, vizibile 24 de ore', route: '/dashboard/stories', section: 'Sportiv', keywords: ['story', 'poze', '24h'] },
  { title: 'Calendar competiții', description: 'Competițiile viitoare ale academiei', route: '/dashboard/competitii', section: 'Sportiv', keywords: ['calendar', 'concurs', 'competitie'] },
  { title: 'Prezență', description: 'Panoul antrenorului pentru marcarea prezenței', route: '/antrenor/prezenta', section: 'Antrenor', keywords: ['prezenta', 'attendance', 'catalog'] },
  { title: 'Aprobare conturi', description: 'Validarea conturilor noi', route: '/antrenor/aprobari', section: 'Admin', keywords: ['approve', 'aprobare', 'conturi'] },
  { title: 'Politică de confidențialitate', description: 'Cum prelucrăm datele tale', route: '/legal/confidentialitate', section: 'Legal', keywords: ['gdpr', 'privacy', 'date'] },
  { title: 'Termeni și condiții', description: 'Regulamentul de utilizare', route: '/legal/termeni', section: 'Legal', keywords: ['terms', 'regulament'] },
  { title: 'Politica de cookie-uri', description: 'Ce cookie-uri folosim și de ce', route: '/legal/cookies', section: 'Legal', keywords: ['cookie', 'consent'] }
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

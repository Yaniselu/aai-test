/**
 * Datele reale ale academiei, intr-un singur loc.
 *
 * Inainte erau duplicate in homepage, footer si harta, iar adresa difera de la
 * o componenta la alta. Orice modificare de contact se face acum aici.
 */
export const ACADEMY = {
  name: 'Academia Ion Andrei',
  address: 'Calea Severinului 2e',
  postalCode: '200222',
  city: 'Craiova',
  phone: '0773 869 303',
  phoneHref: '+40773869303',
  email: 'academiaionandrei@gmail.com',
  schedule: 'Luni – Sambata · 16:00 – 21:00',
  whatsapp: 'https://wa.me/40773869303',
  /** Coordonate aproximative pentru Calea Severinului, Craiova. */
  lat: 44.3182,
  lng: 23.7684,

  stats: [
    { value: 293, key: 'hero.stats.athletes' },
    { value: 17, key: 'hero.stats.medals' },
    { value: 5, key: 'hero.stats.years' }
  ],

  groups: [
    // Textele vizibile sunt chei de traducere (ro.json / en.json), nu text direct.
    { id: 'kids', nameKey: 'groups.names.kids', tagsKey: 'groups.tags.kids', ageKey: 'groups.kidsAge', textKey: 'groups.kidsText', image: 'media/grupa-copii.webp' },
    { id: 'adults', nameKey: 'groups.names.adults', tagsKey: 'groups.tags.adults', ageKey: 'groups.adultsAge', textKey: 'groups.adultsText', image: 'media/grupa-adulti.webp' },
    { id: 'karate', nameKey: 'groups.names.karate', tagsKey: 'groups.tags.karate', ageKey: 'groups.karateAge', textKey: 'groups.karateText', image: 'media/grupa-karate.webp' }
  ],

  /** Fotografii reale din sala, folosite in galerie si pe carduri. */
  photos: {
    training: 'media/antrenament.webp',
    competition: 'media/competitie.webp',
    team: 'media/echipa.webp',
    kids: 'media/grupa-copii.webp',
    adults: 'media/grupa-adulti.webp',
    karate: 'media/grupa-karate.webp'
  },

  coaches: [
    { id: 'ion', name: 'Ion Andrei', nameKey: null, image: 'media/echipa.webp' },
    { id: 'tech', name: 'Antrenor Tehnic', nameKey: 'coaches.list.tech.name', image: 'media/antrenament.webp' },
    { id: 'perf', name: 'Antrenor Performanta', nameKey: 'coaches.list.perf.name', image: 'media/competitie.webp' }
  ],

  /** Textul si autorul fiecarui review sunt in reviews.list.<id> din fisierele de traducere. */
  reviews: [{ id: 'r1' }, { id: 'r2' }, { id: 'r3' }]
} as const;

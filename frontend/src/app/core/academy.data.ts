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
    { name: 'KickBox Copii', ageKey: 'groups.kidsAge', textKey: 'groups.kidsText', image: 'media/grupa-copii.webp' },
    { name: 'KickBox Adulti', ageKey: 'groups.adultsAge', textKey: 'groups.adultsText', image: 'media/grupa-adulti.webp' },
    { name: 'Karate', ageKey: 'groups.karateAge', textKey: 'groups.karateText', image: 'media/grupa-karate.webp' }
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
    {
      name: 'Ion Andrei',
      role: 'Head Coach · Strategie · Competitii',
      focus: 'Leadership, tehnica, performanta',
      image: 'media/echipa.webp'
    },
    {
      name: 'Antrenor Tehnic',
      role: 'Coordonare · Juniori · Progres',
      focus: 'Control, viteza, disciplina',
      image: 'media/antrenament.webp'
    },
    {
      name: 'Antrenor Performanta',
      role: 'Forta · Rezistenta · Focus',
      focus: 'Pregatire pentru nivel avansat',
      image: 'media/competitie.webp'
    }
  ],

  reviews: [
    {
      text: 'Cel mai bun loc pentru copii. Se vede disciplina, seriozitate si grija reala pentru evolutia lor.',
      author: 'Parinte sportiv'
    },
    {
      text: 'Antrenamente puternice, atmosfera premium si foarte multa motivatie. Copilul meu are alta incredere.',
      author: 'Familie din academie'
    },
    {
      text: 'Nu e doar sport. Este formare de caracter. Exact genul de academie de care ai nevoie.',
      author: 'Parinte competitor'
    }
  ]
} as const;

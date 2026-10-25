/**
 * Configuratie pentru GitHub Pages.
 *
 * GitHub Pages serveste doar fisiere statice, deci NU poate rula backend-ul
 * Spring Boot. Site-ul public (prezentare, grupe, program, galerie, contact)
 * functioneaza complet; zona de cont are nevoie de API-ul gazduit separat.
 *
 * Dupa ce publici backend-ul (Render / Railway), pune adresa lui aici si
 * reconstruieste - zona de cont incepe sa functioneze imediat.
 */
export const environment = {
  production: true,
  /** Gol = fara backend. Exemplu: 'https://academia-api.onrender.com/api' */
  apiUrl: '',
  googleMapsApiKey: '',
  storageKeys: {
    token: 'aia.token',
    theme: 'aia.theme',
    lang: 'aia.lang',
    intro: 'aia.intro.seen',
    cookies: 'aia.cookie.consent'
  }
};

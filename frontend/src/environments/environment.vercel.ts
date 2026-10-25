/**
 * Configuratie pentru Vercel.
 *
 * `apiUrl` ramane '/api' pentru ca cererile sa plece catre aceeasi origine, iar
 * `vercel.json` le redirectioneaza (rewrite) catre backend-ul de pe Render.
 * Avantajul fata de un URL absolut: browserul nu vede o cerere cross-origin,
 * deci nu e nevoie de configurare CORS si nu exista preflight.
 *
 * Pana la publicarea backend-ului, rewrite-ul lipseste din vercel.json si
 * `apiUrl` este gol, ca aplicatia sa esueze controlat in loc sa primeasca
 * index.html si sa incerce sa-l parseze ca JSON.
 */
export const environment = {
  production: true,
  /** Rewrite-ul din vercel.json trimite /api catre backend-ul de pe Render. */
  apiUrl: '/api',
  googleMapsApiKey: '',
  storageKeys: {
    token: 'aia.token',
    theme: 'aia.theme',
    lang: 'aia.lang',
    intro: 'aia.intro.seen',
    cookies: 'aia.cookie.consent'
  }
};

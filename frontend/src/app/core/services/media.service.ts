import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Rezolva caile de fisiere returnate de backend.
 *
 * Backend-ul intoarce cai relative ("/uploads/stories/x.png"). In dezvoltare
 * frontend-ul ruleaza pe alt port decat API-ul, deci o cale relativa ar fi
 * ceruta de la serverul de dezvoltare si ar da 404 - exact motivul pentru care
 * imaginile de story nu se vedeau.
 */
@Injectable({ providedIn: 'root' })
export class MediaService {
  /** Originea API-ului, fara sufixul "/api". */
  private readonly origin = environment.apiUrl.replace(/\/api\/?$/, '');

  resolve(path: string | null | undefined): string {
    if (!path) return '';
    if (/^(https?:)?\/\//i.test(path) || path.startsWith('data:')) return path;
    return `${this.origin}${path.startsWith('/') ? '' : '/'}${path}`;
  }
}

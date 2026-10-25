import { Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class ClipboardService {
  private readonly toast = inject(ToastService);

  async copy(text: string, label = 'Text'): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      this.toast.success(`${label} copiat`, text);
      return true;
    } catch {
      // Fallback pentru browsere fără Clipboard API sau context non-secure.
      const el = document.createElement('textarea');
      el.value = text;
      el.setAttribute('readonly', '');
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(el);
      ok
        ? this.toast.success(`${label} copiat`, text)
        : this.toast.error('Copiere eșuată', 'Copiază manual textul.');
      return ok;
    }
  }
}

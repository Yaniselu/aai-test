import { Injectable, signal } from '@angular/core';

export type ToastKind = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  message?: string;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;
  readonly toasts = signal<Toast[]>([]);

  success(title: string, message?: string) { this.push('success', title, message); }
  error(title: string, message?: string) { this.push('error', title, message, 7000); }
  info(title: string, message?: string) { this.push('info', title, message); }
  warning(title: string, message?: string) { this.push('warning', title, message); }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(kind: ToastKind, title: string, message?: string, duration = 4500): void {
    const toast: Toast = { id: ++this.counter, kind, title, message, duration };
    this.toasts.update((list) => [...list, toast]);
    setTimeout(() => this.dismiss(toast.id), duration);
  }
}

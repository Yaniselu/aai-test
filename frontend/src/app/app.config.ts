import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import {
  ApplicationConfig,
  provideZoneChangeDetection,
  provideAppInitializer,
  inject,
  isDevMode
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { catchError, of } from 'rxjs';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { ApiService } from './core/services/api.service';
import { AuthService } from './core/services/auth.service';
import { I18nService } from './core/services/i18n.service';
import { UtmService } from './core/services/utm.service';

export function translateLoaderFactory(http: HttpClient): TranslateLoader {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Fara withViewTransitions(): API-ul de View Transitions intra in conflict
    // cu scroll-ul Lenis si cu montarea/demontarea intro-ului, iar tranzitiile
    // abortate ("Transition was aborted because of invalid state") blocau
    // complet navigarile de router - inclusiv redirectul de dupa autentificare.
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })
    ),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    provideTranslateService({
      defaultLanguage: 'ro',
      loader: {
        provide: TranslateLoader,
        useFactory: translateLoaderFactory,
        deps: [HttpClient]
      }
    }),
    // Bootstrap: limbă, captură UTM și restaurarea sesiunii dintr-un token salvat.
    provideAppInitializer(() => {
      inject(I18nService).init();
      inject(UtmService).capture();

      // Fara backend (build static), nu are rost sa cerem profilul.
      if (!inject(ApiService).available) return;

      const auth = inject(AuthService);
      if (!auth.isLoggedIn()) return;
      return auth.loadProfile().pipe(
        catchError(() => {
          auth.logout(false);
          return of(null);
        })
      );
    })
  ]
};

export const DEV_MODE = isDevMode();

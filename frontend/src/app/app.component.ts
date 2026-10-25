import { AfterViewInit, ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SmoothScrollService } from './core/services/smooth-scroll.service';
import { CookieBannerComponent } from './shared/components/cookie-banner.component';
import { FooterComponent } from './shared/components/footer.component';
import { HeaderComponent } from './shared/components/header.component';
import { IntroComponent } from './shared/components/intro.component';
import { SearchModalComponent } from './shared/components/search-modal.component';
import { ToastHostComponent } from './shared/components/toast-host.component';
import { BackToTopComponent, ScrollProgressComponent } from './shared/components/ui-utilities';
import { WhatsappButtonComponent } from './shared/components/whatsapp-button.component';
import { ClickSparkComponent } from './shared/motion/motion.components';

@Component({
  selector: 'aia-root',
  standalone: true,
  imports: [
    RouterOutlet,
    IntroComponent,
    HeaderComponent,
    FooterComponent,
    ToastHostComponent,
    CookieBannerComponent,
    SearchModalComponent,
    ScrollProgressComponent,
    BackToTopComponent,
    ClickSparkComponent,
    WhatsappButtonComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aia-intro />

    <aia-scroll-progress />
    <aia-header />

    <!-- Continutul este randat sub intro de la inceput, ca "usile" sa dezvaluie
         o pagina deja asezata, nu un ecran gol. -->
    <main id="main-content" class="pt-[92px]" tabindex="-1">
      <router-outlet />
    </main>

    <aia-footer />

    <aia-search-modal />
    <aia-toast-host />
    <aia-cookie-banner />
    <aia-back-to-top />
    <aia-whatsapp-button />
    <aia-click-spark />
  `
})
export class AppComponent implements AfterViewInit, OnDestroy {
  private readonly scroller = inject(SmoothScrollService);

  ngAfterViewInit(): void {
    this.scroller.init();
  }

  ngOnDestroy(): void {
    this.scroller.destroy();
  }
}

package ro.academiaionandrei.api.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import ro.academiaionandrei.api.security.ApprovalFilter;
import ro.academiaionandrei.api.security.JwtAuthenticationFilter;

/**
 * Filtrele de securitate sunt bean-uri (@Component) ca sa primeasca injectie de
 * dependinte, dar Spring Boot le-ar inregistra automat si in lantul servlet
 * general - pe langa lantul de securitate unde le adaugam noi explicit.
 *
 * Rezultatul ar fi rularea de doua ori per cerere, iar ApprovalFilter ar rula
 * prima data inainte ca SecurityContext sa fie populat. Dezactivam aici
 * inregistrarea automata; ele raman active doar in SecurityFilterChain.
 */
@Configuration
public class FilterRegistrationConfig {

    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter> disableJwtFilterAutoRegistration(
            JwtAuthenticationFilter filter) {
        FilterRegistrationBean<JwtAuthenticationFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public FilterRegistrationBean<ApprovalFilter> disableApprovalFilterAutoRegistration(ApprovalFilter filter) {
        FilterRegistrationBean<ApprovalFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }
}

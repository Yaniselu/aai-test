package ro.academiaionandrei.api.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.net.URI;
import java.util.HashMap;
import java.util.Map;

/**
 * Traduce URL-ul de baza de date din formatul platformelor cloud in JDBC.
 *
 * Render, Heroku, Railway si altele expun conexiunea ca
 * {@code postgresql://user:parola@host:port/baza}. Spring Boot asteapta
 * {@code jdbc:postgresql://host:port/baza} plus utilizator si parola separat,
 * asa ca fara conversie pornirea esueaza cu "Failed to determine a suitable
 * driver class".
 *
 * Rulam inainte ca DataSource-ul sa fie construit si punem valorile traduse
 * intr-o sursa de proprietati cu prioritate maxima. Daca URL-ul este deja in
 * format JDBC, nu atingem nimic - configuratia locala ramane valabila.
 */
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String SOURCE_NAME = "academiaDatabaseUrl";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String raw = firstNonBlank(
                environment.getProperty("DATABASE_URL"),
                environment.getProperty("SPRING_DATASOURCE_URL"));

        if (raw == null || !isPlatformUrl(raw)) {
            return;
        }

        try {
            URI uri = URI.create(raw);
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String database = uri.getPath() == null ? "" : uri.getPath().replaceFirst("^/", "");

            Map<String, Object> resolved = new HashMap<>();
            resolved.put("spring.datasource.url",
                    "jdbc:postgresql://" + uri.getHost() + ":" + port + "/" + database);
            resolved.put("spring.datasource.driver-class-name", "org.postgresql.Driver");

            // Credentialele vin de obicei in URL; daca lipsesc, ramane ce e configurat.
            String userInfo = uri.getUserInfo();
            if (userInfo != null && !userInfo.isBlank()) {
                int separator = userInfo.indexOf(':');
                if (separator >= 0) {
                    resolved.put("spring.datasource.username", decode(userInfo.substring(0, separator)));
                    resolved.put("spring.datasource.password", decode(userInfo.substring(separator + 1)));
                } else {
                    resolved.put("spring.datasource.username", decode(userInfo));
                }
            }

            environment.getPropertySources()
                    .addFirst(new MapPropertySource(SOURCE_NAME, resolved));

            // Fara parola in log: adresa e utila la depanare, credentialele nu.
            System.out.println("[academia] DATABASE_URL convertit in JDBC: jdbc:postgresql://"
                    + uri.getHost() + ":" + port + "/" + database);
        } catch (RuntimeException ex) {
            System.err.println("[academia] DATABASE_URL nu a putut fi interpretat: " + ex.getMessage());
        }
    }

    private boolean isPlatformUrl(String url) {
        return url.startsWith("postgres://") || url.startsWith("postgresql://");
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) return value;
        }
        return null;
    }

    private String decode(String value) {
        return java.net.URLDecoder.decode(value, java.nio.charset.StandardCharsets.UTF_8);
    }
}

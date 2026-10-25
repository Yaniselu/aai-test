package ro.academiaionandrei.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Servirea fisierelor incarcate (story-uri).
 *
 * Potrivit pentru o singura instanta. La scalare orizontala, muta fisierele pe
 * S3 / Cloudinary si sterge acest handler.
 */
@Configuration
@EnableAsync
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.storage.local-path:./uploads/stories}")
    private String localPath;

    @Value("${app.storage.avatar-path:./uploads/avatars}")
    private String avatarPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolute = Paths.get(localPath).toAbsolutePath().normalize().toString();
        registry.addResourceHandler("/uploads/stories/**")
                .addResourceLocations("file:" + absolute + "/")
                // Story-urile dispar dupa 24 de ore, deci cache-ul poate fi lung:
                // un URL nu isi schimba niciodata continutul.
                .setCachePeriod(3600);

        String avatars = Paths.get(avatarPath).toAbsolutePath().normalize().toString();
        registry.addResourceHandler("/uploads/avatars/**")
                .addResourceLocations("file:" + avatars + "/")
                // Numele fisierului contine un UUID, deci continutul nu se schimba
                // niciodata la aceeasi adresa: cache lung, fara riscuri.
                .setCachePeriod(86400);
    }
}

package ro.academiaionandrei.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ro.academiaionandrei.api.dto.Dtos.StoryDto;
import ro.academiaionandrei.api.entity.Role;
import ro.academiaionandrei.api.entity.Story;
import ro.academiaionandrei.api.entity.User;
import ro.academiaionandrei.api.exception.BadRequestException;
import ro.academiaionandrei.api.exception.ForbiddenException;
import ro.academiaionandrei.api.exception.NotFoundException;
import ro.academiaionandrei.api.repository.StoryRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Story-uri cu viata de 24 de ore.
 *
 * Stocarea locala de mai jos este intentionat simpla si potrivita pentru un
 * singur server. Pentru deploy pe mai multe instante, inlocuieste
 * {@link #store(MultipartFile)} si {@link #deleteFile(String)} cu S3 / Cloudinary:
 * restul logicii (expirare, permisiuni, cron) ramane neschimbat.
 */
@Service
public class StoryService {

    private static final Logger log = LoggerFactory.getLogger(StoryService.class);

    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp", "video/mp4");
    private static final long MAX_BYTES = 8L * 1024 * 1024;

    private final StoryRepository stories;

    @Value("${app.storage.local-path:./uploads/stories}")
    private String localPath;

    @Value("${app.storage.public-base-url:/uploads/stories}")
    private String publicBaseUrl;

    @Value("${app.stories.lifetime-hours:24}")
    private int lifetimeHours;

    public StoryService(StoryRepository stories) {
        this.stories = stories;
    }

    @Transactional(readOnly = true)
    public List<StoryDto> active() {
        return stories.findActive(Instant.now()).stream().map(StoryDto::from).toList();
    }

    @Transactional
    public StoryDto upload(User author, MultipartFile file, String caption) {
        validate(file);

        String storageKey = store(file);

        Story story = new Story();
        story.setUser(author);
        story.setMediaUrl(publicBaseUrl + "/" + storageKey);
        story.setStorageKey(storageKey);
        story.setCaption(caption != null && !caption.isBlank() ? caption.trim() : null);
        story.setCreatedAt(Instant.now());
        story.setExpiresAt(Instant.now().plus(Duration.ofHours(lifetimeHours)));

        return StoryDto.from(stories.save(story));
    }

    @Transactional
    public void delete(User requester, Long storyId) {
        Story story = stories.findById(storyId)
                .orElseThrow(() -> new NotFoundException("Story-ul nu exista."));

        boolean isOwner = story.getUser().getId().equals(requester.getId());
        boolean isModerator = requester.getRole() == Role.ROLE_TRAINER || requester.getRole() == Role.ROLE_ADMIN;

        if (!isOwner && !isModerator) {
            throw new ForbiddenException("Poti sterge doar propriile story-uri.");
        }

        deleteFile(story.getStorageKey());
        stories.delete(story);
    }

    /**
     * Sterge story-urile expirate impreuna cu fisierele lor.
     * Apelat de cron job; returneaza cate au fost sterse pentru logare.
     */
    @Transactional
    public int purgeExpired() {
        List<Story> expired = stories.findExpired(Instant.now());
        if (expired.isEmpty()) {
            return 0;
        }

        expired.forEach(story -> deleteFile(story.getStorageKey()));
        stories.deleteAll(expired);
        return expired.size();
    }

    // ----------------------------------------------------------------- helpers
    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Fisierul lipseste.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BadRequestException("Fisierul depaseste limita de 8 MB.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new BadRequestException("Format neacceptat. Foloseste JPG, PNG, WEBP sau MP4.");
        }
    }

    private String store(MultipartFile file) {
        try {
            Path directory = Paths.get(localPath).toAbsolutePath().normalize();
            Files.createDirectories(directory);

            // Nume generat, nu cel primit de la client: numele original poate
            // contine "../" sau caractere care sparg calea.
            String extension = switch (file.getContentType()) {
                case "image/png" -> ".png";
                case "image/webp" -> ".webp";
                case "video/mp4" -> ".mp4";
                default -> ".jpg";
            };
            String key = UUID.randomUUID() + extension;

            Path target = directory.resolve(key);
            try (var input = file.getInputStream()) {
                Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
            }
            return key;
        } catch (IOException ex) {
            throw new BadRequestException("Fisierul nu a putut fi salvat: " + ex.getMessage());
        }
    }

    private void deleteFile(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return;
        }
        try {
            Path path = Paths.get(localPath).toAbsolutePath().normalize().resolve(storageKey);
            Files.deleteIfExists(path);
        } catch (IOException ex) {
            // Randul din baza de date se sterge oricum; un fisier ramas orfan
            // este o problema de curatenie, nu una de corectitudine.
            log.warn("Fisierul {} nu a putut fi sters: {}", storageKey, ex.getMessage());
        }
    }
}

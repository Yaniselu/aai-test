package ro.academiaionandrei.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import ro.academiaionandrei.api.dto.Dtos.ProfileUpdateRequest;
import ro.academiaionandrei.api.dto.Dtos.UserDto;
import ro.academiaionandrei.api.entity.User;
import ro.academiaionandrei.api.exception.BadRequestException;
import ro.academiaionandrei.api.repository.UserRepository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

/**
 * Editarea propriului profil: nume, telefon, data nasterii, biografie si avatar.
 *
 * Avatarul se pastreaza ca fisier pe disc, nu ca blob in baza de date. Un blob
 * de 2 MB per utilizator ar umfla tabelul `users`, ar incetini fiecare SELECT
 * care aduce randul complet si ar face backupurile inutil de mari.
 */
@Service
public class ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileService.class);

    private static final Set<String> ALLOWED_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");
    /** 2 MB: suficient pentru o poza de profil, prea putin ca sa doara. */
    private static final long MAX_BYTES = 2L * 1024 * 1024;

    private final UserRepository users;

    @Value("${app.storage.avatar-path:./uploads/avatars}")
    private String avatarPath;

    @Value("${app.storage.avatar-public-url:/uploads/avatars}")
    private String avatarPublicUrl;

    public ProfileService(UserRepository users) {
        this.users = users;
    }

    @Transactional
    public UserDto update(User user, ProfileUpdateRequest request) {
        user.setName(request.name().trim());
        user.setPhone(request.phone());
        user.setBirthDate(request.birthDate());

        String bio = request.bio();
        user.setBio(bio != null && !bio.isBlank() ? bio.trim() : null);

        return UserDto.from(users.save(user));
    }

    @Transactional
    public UserDto uploadAvatar(User user, MultipartFile file) {
        validate(file);

        String previous = user.getAvatarUrl();
        String key = store(file);
        user.setAvatarUrl(avatarPublicUrl + "/" + key);
        users.save(user);

        // Stergem poza veche abia dupa ce noua e salvata cu succes.
        deletePrevious(previous);

        return UserDto.from(user);
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Fisierul lipseste.");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BadRequestException("Poza de profil depaseste limita de 2 MB.");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
            throw new BadRequestException("Format neacceptat. Foloseste JPG, PNG sau WEBP.");
        }
    }

    private String store(MultipartFile file) {
        try {
            Path directory = Paths.get(avatarPath).toAbsolutePath().normalize();
            Files.createDirectories(directory);

            // Nume generat: cel primit de la client poate contine "../".
            String extension = switch (file.getContentType()) {
                case "image/png" -> ".png";
                case "image/webp" -> ".webp";
                default -> ".jpg";
            };
            String key = UUID.randomUUID() + extension;

            try (var input = file.getInputStream()) {
                Files.copy(input, directory.resolve(key), StandardCopyOption.REPLACE_EXISTING);
            }
            return key;
        } catch (IOException ex) {
            throw new BadRequestException("Poza nu a putut fi salvata: " + ex.getMessage());
        }
    }

    private void deletePrevious(String url) {
        if (url == null || !url.startsWith(avatarPublicUrl)) {
            return;
        }
        try {
            String key = url.substring(url.lastIndexOf('/') + 1);
            Files.deleteIfExists(Paths.get(avatarPath).toAbsolutePath().normalize().resolve(key));
        } catch (IOException ex) {
            // Un fisier orfan e o problema de curatenie, nu de corectitudine.
            log.warn("Avatarul vechi nu a putut fi sters: {}", ex.getMessage());
        }
    }
}

package ro.academiaionandrei.api.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import ro.academiaionandrei.api.dto.Dtos.ProfileUpdateRequest;
import ro.academiaionandrei.api.dto.Dtos.UserDto;
import ro.academiaionandrei.api.repository.UserRepository;
import ro.academiaionandrei.api.service.ProfileService;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository users;
    private final ProfileService profiles;

    public UserController(UserRepository users, ProfileService profiles) {
        this.users = users;
        this.profiles = profiles;
    }

    /**
     * Accesibil si conturilor neaprobate (vezi ApprovalFilter): este exact ruta
     * pe care ecranul "cont in verificare" o foloseste ca sa afle daca intre
     * timp a fost aprobat.
     */
    @GetMapping("/me")
    public UserDto me() {
        return UserDto.from(CurrentUser.require(users));
    }

    @PutMapping("/me")
    public UserDto updateMe(@Valid @RequestBody ProfileUpdateRequest request) {
        return profiles.update(CurrentUser.require(users), request);
    }

    @PostMapping(value = "/me/avatar", consumes = "multipart/form-data")
    public UserDto uploadAvatar(@RequestParam("file") MultipartFile file) {
        return profiles.uploadAvatar(CurrentUser.require(users), file);
    }
}

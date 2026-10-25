package ro.academiaionandrei.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import ro.academiaionandrei.api.dto.Dtos.UserDto;
import ro.academiaionandrei.api.entity.Role;
import ro.academiaionandrei.api.entity.User;
import ro.academiaionandrei.api.exception.BadRequestException;
import ro.academiaionandrei.api.exception.NotFoundException;
import ro.academiaionandrei.api.repository.UserRepository;
import ro.academiaionandrei.api.service.MailService;

import java.util.List;

/** Administrarea conturilor: coada de aprobare si schimbarea rolurilor. */
@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository users;
    private final MailService mailService;

    public AdminController(UserRepository users, MailService mailService) {
        this.users = users;
        this.mailService = mailService;
    }

    @GetMapping("/users/pending")
    public List<UserDto> pending() {
        return users.findByApprovedFalseOrderByCreatedAtAsc().stream().map(UserDto::from).toList();
    }

    @GetMapping("/users")
    public List<UserDto> all() {
        return users.findAll().stream().map(UserDto::from).toList();
    }

    /** Deschide accesul in platforma si anunta sportivul pe email. */
    @PostMapping("/users/{id}/approve")
    @Transactional
    public UserDto approve(@PathVariable Long id) {
        User user = users.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilizatorul nu exista."));

        if (user.isApproved()) {
            throw new BadRequestException("Contul este deja aprobat.");
        }

        user.setApproved(true);
        users.save(user);
        mailService.sendAccountApproved(user);

        return UserDto.from(user);
    }

    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void reject(@PathVariable Long id) {
        User user = users.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilizatorul nu exista."));

        // Stergem doar cereri neprocesate. Un cont activ are prezente si
        // recompense legate de el, deci se dezactiveaza, nu se sterge de aici.
        if (user.isApproved()) {
            throw new BadRequestException(
                    "Contul este deja aprobat si nu poate fi sters din coada de aprobare.");
        }

        users.delete(user);
    }

    @PostMapping("/users/{id}/role")
    @Transactional
    public UserDto changeRole(@PathVariable Long id, @RequestParam Role role) {
        User user = users.findById(id)
                .orElseThrow(() -> new NotFoundException("Utilizatorul nu exista."));
        user.setRole(role);
        return UserDto.from(users.save(user));
    }
}

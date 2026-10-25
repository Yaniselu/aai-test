package ro.academiaionandrei.api.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.academiaionandrei.api.dto.Dtos.*;
import ro.academiaionandrei.api.entity.Role;
import ro.academiaionandrei.api.entity.User;
import ro.academiaionandrei.api.exception.ConflictException;
import ro.academiaionandrei.api.repository.UserRepository;
import ro.academiaionandrei.api.security.AppUserDetails;
import ro.academiaionandrei.api.security.JwtService;

import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final MailService mailService;

    public AuthService(UserRepository users,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       MailService mailService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }

    /**
     * Creeaza contul in stare NEAPROBATA. Nu emitem token aici: utilizatorul
     * trebuie sa se autentifice explicit, iar accesul ramane blocat pana cand
     * un administrator apasa "Aproba".
     */
    @Transactional
    public MessageResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();

        if (users.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Exista deja un cont cu aceasta adresa de email.");
        }

        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setPhone(request.phone());
        user.setBirthDate(request.birthDate());
        user.setRole(Role.ROLE_USER);
        user.setApproved(false);
        user.setSignupSource(serializeUtm(request.utm()));

        users.save(user);

        mailService.sendRegistrationPending(user);
        mailService.notifyAdminsOfPendingUser(user);

        return new MessageResponse(
                "Contul tau a fost creat si se afla in curs de verificare de catre un administrator.");
    }

    /**
     * Autentifica utilizatorul si emite token chiar daca nu e aprobat inca:
     * are nevoie de sesiune ca sa-si poata verifica singur statusul.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        var authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().trim().toLowerCase(), request.password()));

        User user = ((AppUserDetails) authentication.getPrincipal()).getUser();
        return new AuthResponse(jwtService.generateToken(user), UserDto.from(user));
    }

    /** Serializam UTM-urile intr-un singur camp; nu avem nevoie de interogari pe ele. */
    private String serializeUtm(Map<String, String> utm) {
        if (utm == null || utm.isEmpty()) return null;
        String joined = utm.entrySet().stream()
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("; "));
        return joined.length() > 500 ? joined.substring(0, 500) : joined;
    }
}

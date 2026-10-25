package ro.academiaionandrei.api.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import ro.academiaionandrei.api.entity.User;
import ro.academiaionandrei.api.exception.ForbiddenException;
import ro.academiaionandrei.api.repository.UserRepository;

/**
 * Acces la utilizatorul autentificat.
 *
 * Reincarcam entitatea din baza de date la fiecare cerere, in loc sa folosim
 * copia din token: XP-ul, absentele si nivelul se schimba des, iar o copie
 * invechita ar duce la decizii gresite (de exemplu un claim aprobat pe date
 * vechi).
 */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static User require(UserRepository users) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ForbiddenException("Sesiune inexistenta.");
        }

        String email = authentication.getName();
        return users.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ForbiddenException("Contul nu mai exista."));
    }
}

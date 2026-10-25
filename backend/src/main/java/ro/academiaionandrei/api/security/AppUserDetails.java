package ro.academiaionandrei.api.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import ro.academiaionandrei.api.entity.User;

import java.util.Collection;
import java.util.List;

/**
 * Adaptorul dintre entitatea User si Spring Security.
 *
 * Nota importanta: NU folosim `isEnabled()` pentru starea de aprobare. Daca am
 * face-o, Spring ar respinge autentificarea cu un mesaj generic, iar utilizatorul
 * nu ar putea nici macar sa-si vada propriul status. In schimb lasam sesiunea sa
 * se creeze si blocam accesul in {@link ApprovalFilter}, cu un cod explicit.
 */
public class AppUserDetails implements UserDetails {

    private final User user;

    public AppUserDetails(User user) {
        this.user = user;
    }

    public User getUser() {
        return user;
    }

    public Long getId() {
        return user.getId();
    }

    public boolean isApproved() {
        return user.isApproved();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPasswordHash();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

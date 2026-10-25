package ro.academiaionandrei.api.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;

/**
 * Poarta de aprobare.
 *
 * Un utilizator autentificat, dar neaprobat de administrator, primeste 403 cu
 * codul PENDING_APPROVAL pe orice ruta protejata. Frontend-ul recunoaste codul
 * si il redirectioneaza catre ecranul "cont in verificare".
 *
 * Exceptiile sunt rutele de care are nevoie chiar si un cont neaprobat:
 * profilul propriu (ca sa poata verifica statusul) si iesirea din cont.
 */
@Component
@Order(1)
public class ApprovalFilter extends OncePerRequestFilter {

    private static final List<String> ALLOWED_WHILE_PENDING = List.of(
            "/api/auth",
            "/api/users/me",
            "/api/public",
            "/api/contact",
            "/actuator/health"
    );

    private final ObjectMapper objectMapper;

    public ApprovalFilter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain chain) throws ServletException, IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth != null && auth.getPrincipal() instanceof AppUserDetails details && !details.isApproved()) {
            String path = request.getRequestURI();
            boolean exempt = ALLOWED_WHILE_PENDING.stream().anyMatch(path::startsWith);

            if (!exempt) {
                writePendingResponse(request, response);
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private void writePendingResponse(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        objectMapper.writeValue(response.getWriter(), Map.of(
                "timestamp", Instant.now().toString(),
                "status", 403,
                "code", "PENDING_APPROVAL",
                "message", "Account pending admin approval",
                "path", request.getRequestURI()
        ));
    }
}

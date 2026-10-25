package ro.academiaionandrei.api.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import ro.academiaionandrei.api.entity.Role;
import ro.academiaionandrei.api.entity.User;
import ro.academiaionandrei.api.repository.UserRepository;

/**
 * Emailuri tranzactionale.
 *
 * Toate metodele sunt asincrone si inghit exceptiile de trimitere: o problema
 * la SMTP nu trebuie sa anuleze inregistrarea unui sportiv sau aprobarea lui.
 * Esecurile sunt logate ca WARN pentru investigare.
 */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;
    private final UserRepository users;

    @Value("${app.mail.from:noreply@academiaionandrei.ro}")
    private String from;

    @Value("${app.mail.enabled:false}")
    private boolean enabled;

    @Value("${app.frontend-url:https://academiaionandrei.ro}")
    private String frontendUrl;

    public MailService(JavaMailSender mailSender, UserRepository users) {
        this.mailSender = mailSender;
        this.users = users;
    }

    @Async
    public void sendRegistrationPending(User user) {
        send(user.getEmail(),
                "Contul tau Academia Ion Andrei a fost creat",
                """
                Salut, %s!

                Contul tau a fost creat cu succes si se afla in curs de verificare
                de catre un administrator al academiei.

                Vei primi un email de confirmare imediat ce accesul este aprobat.
                De regula, verificarea dureaza cel mult o zi lucratoare.

                Pana atunci, poti verifica statusul aici: %s/auth/pending

                Disciplina. Forta. Respect. Victorie.
                Echipa Academia Ion Andrei
                """.formatted(user.getName().split(" ")[0], frontendUrl));
    }

    @Async
    public void sendAccountApproved(User user) {
        send(user.getEmail(),
                "Contul tau a fost aprobat - bine ai venit!",
                """
                Salut, %s!

                Contul tau a fost aprobat. Ai acum acces complet la platforma:
                profilul sportiv, Battle Pass-ul, roata norocului si calendarul
                competitiilor.

                Intra in cont: %s/auth/login

                Ne vedem in sala.
                Echipa Academia Ion Andrei
                """.formatted(user.getName().split(" ")[0], frontendUrl));
    }

    @Async
    public void notifyAdminsOfPendingUser(User pending) {
        users.findByApprovedTrueAndRoleOrderByNameAsc(Role.ROLE_ADMIN).forEach(admin ->
                send(admin.getEmail(),
                        "Cerere noua de cont: " + pending.getName(),
                        """
                        O cerere noua asteapta aprobare.

                        Nume: %s
                        Email: %s
                        Telefon: %s

                        Aproba sau respinge aici: %s/antrenor/aprobari
                        """.formatted(
                                pending.getName(),
                                pending.getEmail(),
                                pending.getPhone() != null ? pending.getPhone() : "-",
                                frontendUrl)));
    }

    @Async
    public void sendContactLead(String toAddress, String body) {
        send(toAddress, "Solicitare noua de pe site", body);
    }

    private void send(String to, String subject, String body) {
        if (!enabled) {
            log.info("[mail dezactivat] Catre {}: {}", to, subject);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (MailException ex) {
            log.warn("Emailul catre {} nu a putut fi trimis: {}", to, ex.getMessage());
        }
    }
}

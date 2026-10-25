package ro.academiaionandrei.api.controller;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import ro.academiaionandrei.api.dto.Dtos.ContactRequest;
import ro.academiaionandrei.api.dto.Dtos.MessageResponse;
import ro.academiaionandrei.api.service.MailService;

import java.util.Map;
import java.util.stream.Collectors;

/** Formularul public de contact, cu atribuirea campaniei (UTM) atasata. */
@RestController
@RequestMapping("/api/contact")
public class ContactController {

    private static final Logger log = LoggerFactory.getLogger(ContactController.class);

    private final MailService mailService;

    @Value("${app.mail.leads-to:contact@academiaionandrei.ro}")
    private String leadsTo;

    public ContactController(MailService mailService) {
        this.mailService = mailService;
    }

    @PostMapping
    public MessageResponse submit(@Valid @RequestBody ContactRequest request) {
        String body = """
                Solicitare noua de pe site.

                Nume:    %s
                Email:   %s
                Telefon: %s
                Grupa:   %s

                Mesaj:
                %s

                --- Atribuire campanie ---
                %s
                """.formatted(
                request.name(),
                request.email(),
                request.phone(),
                request.group(),
                request.message() != null && !request.message().isBlank() ? request.message() : "(fara mesaj)",
                formatUtm(request.utm()));

        mailService.sendContactLead(leadsTo, body);
        log.info("Lead nou din formularul de contact: {} ({})", request.name(), request.email());

        return new MessageResponse("Solicitarea a fost trimisa. Te contactam in maximum 24 de ore.");
    }

    private String formatUtm(Map<String, String> utm) {
        if (utm == null || utm.isEmpty()) {
            return "(trafic direct, fara parametri UTM)";
        }
        return utm.entrySet().stream()
                .map(entry -> "  " + entry.getKey() + ": " + entry.getValue())
                .collect(Collectors.joining("\n"));
    }
}

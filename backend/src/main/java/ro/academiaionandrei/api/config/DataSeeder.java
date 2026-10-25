package ro.academiaionandrei.api.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ro.academiaionandrei.api.entity.BattlePassReward;
import ro.academiaionandrei.api.entity.Role;
import ro.academiaionandrei.api.entity.User;
import ro.academiaionandrei.api.repository.BattlePassRewardRepository;
import ro.academiaionandrei.api.repository.UserRepository;

import java.util.List;

/**
 * Populeaza datele fara de care aplicatia nu are sens la prima pornire:
 * treptele Battle Pass si un cont de administrator.
 *
 * Rularea este idempotenta - la a doua pornire nu se mai creeaza nimic.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final BattlePassRewardRepository rewards;
    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-email:admin@academiaionandrei.ro}")
    private String adminEmail;

    @Value("${app.seed.admin-password:}")
    private String adminPassword;

    public DataSeeder(BattlePassRewardRepository rewards, UserRepository users, PasswordEncoder passwordEncoder) {
        this.rewards = rewards;
        this.users = users;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedRewards();
        seedAdmin();
    }

    /** Cele 5 trepte cerute: tricou, pantaloni, fasa, tibiere, manusi. */
    private void seedRewards() {
        if (rewards.count() > 0) {
            return;
        }

        // Pragurile sunt calibrate pe 50 XP/antrenament si ~13 antrenamente pe
        // luna (~650 XP/luna, daca nu lipsesti). Tricoul cere astfel aproape
        // trei luni de prezenta constanta, iar manusile aproape doi ani.
        List<BattlePassReward> track = List.of(
                reward("Tricou Academia", "Tricou oficial de antrenament. Aproximativ 3 luni de prezenta constanta.", 1, 1800),
                reward("Pantaloni de antrenament", "Pantaloni tehnici pentru sala. Aproximativ 6 luni.", 2, 3600),
                reward("Fasa de box", "Pereche de fase profesionale, 4 metri. Aproximativ 10 luni.", 3, 6000),
                reward("Tibiere", "Aparatori de tibie pentru sparring. Aproximativ 14 luni.", 4, 9000),
                reward("Manusi de competitie", "Manusi omologate pentru competitie. Aproximativ 20 de luni.", 5, 13000)
        );

        rewards.saveAll(track);
        log.info("Seed: {} trepte de Battle Pass au fost create.", track.size());
    }

    private BattlePassReward reward(String name, String description, int level, int requiredXp) {
        BattlePassReward reward = new BattlePassReward();
        reward.setName(name);
        reward.setDescription(description);
        reward.setRequiredLevel(level);
        reward.setRequiredXp(requiredXp);
        reward.setMaxAbsencesAllowed(2);
        return reward;
    }

    private void seedAdmin() {
        if (users.existsByEmailIgnoreCase(adminEmail)) {
            return;
        }

        // Fara parola configurata nu cream contul: un admin cu parola implicita
        // ajuns in productie ar fi o usa deschisa.
        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("Seed: app.seed.admin-password nu este setata, contul de administrator nu a fost creat.");
            return;
        }

        User admin = new User();
        admin.setName("Administrator Academie");
        admin.setEmail(adminEmail.toLowerCase());
        admin.setPasswordHash(passwordEncoder.encode(adminPassword));
        admin.setRole(Role.ROLE_ADMIN);
        admin.setApproved(true);

        users.save(admin);
        log.info("Seed: contul de administrator {} a fost creat.", adminEmail);
    }
}

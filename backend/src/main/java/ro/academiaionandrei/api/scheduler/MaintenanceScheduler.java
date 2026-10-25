package ro.academiaionandrei.api.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ro.academiaionandrei.api.entity.User;
import ro.academiaionandrei.api.repository.StoryRepository;
import ro.academiaionandrei.api.repository.UserRepository;
import ro.academiaionandrei.api.service.BattlePassService;
import ro.academiaionandrei.api.service.StoryService;

import java.time.Instant;
import java.util.List;

/**
 * SARCINI PROGRAMATE
 * ------------------
 * Doua joburi tin baza de date curata si regulile jocului corecte:
 *
 *  1. Purjarea story-urilor expirate - la fiecare ora fixa. Fara el, tabelul
 *     de story-uri si stocarea ar creste la nesfarsit cu continut pe care
 *     nimeni nu-l mai poate vedea.
 *
 *  2. Resetarea lunara a absentelor - in prima zi a lunii, la 00:05. Regula de
 *     Battle Pass e "maximum 2 absente pe luna", deci contorul trebuie sa
 *     porneasca de la zero la fiecare luna noua.
 *
 * Ambele sunt idempotente: o rulare in plus nu strica nimic.
 *
 * ATENTIE la deploy pe mai multe instante: fara un lock distribuit
 * (ex. ShedLock), fiecare instanta ar rula acelasi job. Purjarea ramane sigura
 * (stergerea e idempotenta), dar resetarea lunara ar trebui protejata.
 */
@Component
public class MaintenanceScheduler {

    private static final Logger log = LoggerFactory.getLogger(MaintenanceScheduler.class);

    private final StoryService storyService;
    private final StoryRepository stories;
    private final UserRepository users;
    private final BattlePassService battlePass;

    public MaintenanceScheduler(StoryService storyService,
                                StoryRepository stories,
                                UserRepository users,
                                BattlePassService battlePass) {
        this.storyService = storyService;
        this.stories = stories;
        this.users = users;
        this.battlePass = battlePass;
    }

    /**
     * Ruleaza la fiecare ora fixa (secunda 0, minutul 0).
     * Sterge din baza de date SI din stocare story-urile cu expiresAt trecut.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void purgeExpiredStories() {
        long pending = stories.countByExpiresAtLessThanEqual(Instant.now());
        if (pending == 0) {
            log.debug("Purjare story-uri: nimic de sters.");
            return;
        }

        int deleted = storyService.purgeExpired();
        log.info("Purjare story-uri: {} story-uri expirate au fost sterse.", deleted);
    }

    /**
     * Prima zi a lunii, la 00:05.
     * Reseteaza contorul de absente si re-sincronizeaza nivelurile de Battle Pass.
     */
    @Scheduled(cron = "0 5 0 1 * *")
    @Transactional
    public void resetMonthlyAbsences() {
        int reset = users.resetAllAbsences();
        log.info("Reset lunar: contorul de absente a fost adus la zero pentru {} conturi.", reset);

        List<User> all = users.findAll();
        all.forEach(battlePass::recalculateLevel);
        users.saveAll(all);
        log.info("Reset lunar: nivelurile Battle Pass au fost recalculate pentru {} conturi.", all.size());
    }

    /**
     * Plasa de siguranta zilnica, la 03:30.
     * Prinde story-urile ratate daca aplicatia a fost oprita la ora exacta a
     * unei purjari orare.
     */
    @Scheduled(cron = "0 30 3 * * *")
    public void dailySafetyPurge() {
        int deleted = storyService.purgeExpired();
        if (deleted > 0) {
            log.warn("Purjare zilnica de siguranta: {} story-uri ratate de jobul orar.", deleted);
        }
    }
}

package ro.academiaionandrei.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.academiaionandrei.api.dto.Dtos.WheelPrizeDto;
import ro.academiaionandrei.api.dto.Dtos.WheelSpinResultDto;
import ro.academiaionandrei.api.dto.Dtos.WheelStatusDto;
import ro.academiaionandrei.api.entity.User;
import ro.academiaionandrei.api.entity.WheelSpin;
import ro.academiaionandrei.api.exception.TooManyRequestsException;
import ro.academiaionandrei.api.repository.WheelSpinRepository;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * "INVARTE-L PE BIRTU" - roata academiei.
 *
 * Premiul se alege AICI, pe server, prin selectie ponderata cu SecureRandom.
 * Frontend-ul primeste doar id-ul castigator si anima roata spre el, deci
 * rezultatul nu poate fi influentat din browser.
 *
 * Ponderile primite de la academie insumeaza 90, nu 100. Le tratam ca ponderi
 * relative si le normalizam - `chancePercent()` calculeaza sansa reala afisata
 * sportivului, ca eticheta din interfata sa nu minta.
 */
@Service
public class WheelService {

    /** Ce se intampla efectiv cand cade premiul. */
    public enum PrizeEffect {
        /** Adauga XP pe profil. */
        XP,
        /** Sterge o absenta din luna curenta. */
        ABSENCE_EXCUSE,
        /** Recompensa fizica, se ridica de la receptie. */
        PHYSICAL,
        /** Nimic. */
        NONE,
        /** Nu consuma invartirea saptamanala. */
        RESPIN
    }

    public record Prize(int id, String label, String color, int weight, PrizeEffect effect, int amount) {
    }

    private static final List<Prize> PRIZES = List.of(
            new Prize(1, "50 XP", "#8F0000", 30, PrizeEffect.XP, 50),
            new Prize(2, "Necastigator", "#141414", 30, PrizeEffect.NONE, 0),
            new Prize(3, "100 XP", "#E60000", 10, PrizeEffect.XP, 100),
            new Prize(4, "Mai da o data", "#242424", 10, PrizeEffect.RESPIN, 0),
            new Prize(5, "Motivare absenta", "#B00000", 8, PrizeEffect.ABSENCE_EXCUSE, 1),
            new Prize(6, "Luna gratuita", "#FF2020", 2, PrizeEffect.PHYSICAL, 0)
    );

    private static final int TOTAL_WEIGHT = PRIZES.stream().mapToInt(Prize::weight).sum();

    private final WheelSpinRepository spins;
    private final SecureRandom random = new SecureRandom();

    @Value("${app.gamification.wheel-cooldown-days:7}")
    private int cooldownDays;

    public WheelService(WheelSpinRepository spins) {
        this.spins = spins;
    }

    @Transactional(readOnly = true)
    public WheelStatusDto status(User user) {
        // Cautam ultima invartire care a pornit efectiv un cooldown.
        // Un "Mai da o data" nu conteaza, deci nu blocheaza urmatoarea rotire.
        Optional<WheelSpin> last =
                spins.findTopByUserIdAndCountsForCooldownTrueOrderByLastSpinDateDesc(user.getId());

        String lastLabel = spins.findTopByUserIdOrderByLastSpinDateDesc(user.getId())
                .map(WheelSpin::getRewardWon)
                .orElse(null);

        if (last.isEmpty()) {
            return new WheelStatusDto(true, null, prizeDtos(), lastLabel);
        }

        Instant nextAvailable = last.get().getLastSpinDate().plus(Duration.ofDays(cooldownDays));
        boolean canSpin = Instant.now().isAfter(nextAvailable);

        return new WheelStatusDto(canSpin, canSpin ? null : nextAvailable, prizeDtos(), lastLabel);
    }

    @Transactional
    public WheelSpinResultDto spin(User user) {
        Optional<WheelSpin> last =
                spins.findTopByUserIdAndCountsForCooldownTrueOrderByLastSpinDateDesc(user.getId());

        if (last.isPresent()) {
            Instant nextAvailable = last.get().getLastSpinDate().plus(Duration.ofDays(cooldownDays));
            if (Instant.now().isBefore(nextAvailable)) {
                throw new TooManyRequestsException(
                        "Urmatoarea invartire este disponibila la " + nextAvailable + ".");
            }
        }

        Prize prize = pickWeighted();
        Instant now = Instant.now();
        boolean respin = prize.effect() == PrizeEffect.RESPIN;

        WheelSpin spin = new WheelSpin();
        spin.setUser(user);
        spin.setPrizeId(prize.id());
        spin.setRewardWon(prize.label());
        spin.setLastSpinDate(now);
        spin.setCountsForCooldown(!respin);
        spins.save(spin);

        int xpAwarded = 0;
        boolean absenceForgiven = false;

        switch (prize.effect()) {
            case XP -> {
                xpAwarded = prize.amount();
                user.addXp(xpAwarded);
            }
            case ABSENCE_EXCUSE -> {
                // Nu scadem sub zero: o motivare pe o luna fara absente nu
                // trebuie sa creeze "credit" pentru lunile urmatoare.
                if (user.getAbsencesCount() > 0) {
                    user.setAbsencesCount(user.getAbsencesCount() - prize.amount());
                    absenceForgiven = true;
                }
            }
            case PHYSICAL, NONE, RESPIN -> {
                // Fara efect automat pe profil.
            }
        }

        return new WheelSpinResultDto(
                prize.id(),
                prize.label(),
                describe(prize, absenceForgiven),
                now,
                respin ? null : now.plus(Duration.ofDays(cooldownDays)),
                xpAwarded,
                absenceForgiven,
                respin);
    }

    /** Mesajul afisat sub roata, adaptat la ce s-a intamplat de fapt. */
    private String describe(Prize prize, boolean absenceForgiven) {
        return switch (prize.effect()) {
            case XP -> "Cele " + prize.amount() + " XP au fost adaugate pe profilul tau.";
            case ABSENCE_EXCUSE -> absenceForgiven
                    ? "O absenta din luna aceasta a fost stearsa."
                    : "Nu ai absente luna aceasta, asa ca motivarea ramane nefolosita.";
            case PHYSICAL -> "Anunta antrenorul: luna urmatoare de pregatire este gratuita.";
            case RESPIN -> "Invartirea nu s-a consumat. Mai ai una acum.";
            case NONE -> "Nimic de data asta. Saptamana viitoare incerci din nou.";
        };
    }

    private Prize pickWeighted() {
        int roll = random.nextInt(TOTAL_WEIGHT);
        int cumulative = 0;
        for (Prize prize : PRIZES) {
            cumulative += prize.weight();
            if (roll < cumulative) {
                return prize;
            }
        }
        return PRIZES.get(PRIZES.size() - 1);
    }

    private List<WheelPrizeDto> prizeDtos() {
        return PRIZES.stream()
                .map(p -> new WheelPrizeDto(p.id(), p.label(), p.color(), p.weight(), chancePercent(p)))
                .toList();
    }

    private double chancePercent(Prize prize) {
        return Math.round(prize.weight() * 1000.0 / TOTAL_WEIGHT) / 10.0;
    }
}

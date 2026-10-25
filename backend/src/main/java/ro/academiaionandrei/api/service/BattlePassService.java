package ro.academiaionandrei.api.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.academiaionandrei.api.dto.Dtos.BattlePassRewardDto;
import ro.academiaionandrei.api.dto.Dtos.BattlePassStateDto;
import ro.academiaionandrei.api.entity.*;
import ro.academiaionandrei.api.exception.BadRequestException;
import ro.academiaionandrei.api.exception.NotFoundException;
import ro.academiaionandrei.api.repository.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * BATTLE PASS
 * -----------
 * Fiecare treapta are propriul prag de XP, nu un nivel liniar. Pragurile sunt
 * lungi intentionat: la 50 XP pe antrenament si ~13 antrenamente pe luna,
 * tricoul (1800 XP) inseamna aproximativ trei luni de prezenta constanta.
 * Absentele scad XP, deci cine lipseste des nu doar ca stagneaza - da inapoi.
 *
 * A doua conditie, independenta de XP: cel mult {@code maxAbsencesAllowed}
 * absente in luna curenta. Verificarea se face pe tabelul de prezente, nu pe
 * contorul de pe User: contorul e o optimizare de afisare, dar un claim este
 * ireversibil si trebuie validat pe sursa de adevar.
 */
@Service
public class BattlePassService {

    private final BattlePassRewardRepository rewards;
    private final UserRewardRepository userRewards;
    private final AttendanceRepository attendance;
    private final UserRepository users;

    public BattlePassService(BattlePassRewardRepository rewards,
                             UserRewardRepository userRewards,
                             AttendanceRepository attendance,
                             UserRepository users) {
        this.rewards = rewards;
        this.userRewards = userRewards;
        this.attendance = attendance;
        this.users = users;
    }

    @Transactional(readOnly = true)
    public BattlePassStateDto stateFor(User user) {
        List<BattlePassReward> all = rewards.findAllByOrderByRequiredLevelAsc();
        long absences = absencesThisMonth(user.getId());
        int xp = user.getXpPoints();
        int level = levelFor(xp, all);

        Map<Long, UserReward> claimed = userRewards.findByUserId(user.getId()).stream()
                .collect(Collectors.toMap(ur -> ur.getReward().getId(), Function.identity(), (a, b) -> a));

        List<BattlePassRewardDto> dtos = all.stream()
                .map(reward -> {
                    UserReward claim = claimed.get(reward.getId());
                    boolean unlocked = xp >= reward.getRequiredXp()
                            && absences <= reward.getMaxAbsencesAllowed();
                    return new BattlePassRewardDto(
                            reward.getId(), reward.getName(), reward.getDescription(),
                            reward.getRequiredLevel(), reward.getRequiredXp(), reward.getIconUrl(),
                            reward.getMaxAbsencesAllowed(), unlocked, claim != null,
                            claim != null ? claim.getClaimedAt() : null);
                })
                .toList();

        int nextXp = all.stream()
                .filter(r -> r.getRequiredXp() > xp)
                .mapToInt(BattlePassReward::getRequiredXp)
                .min()
                .orElse(xp);

        return new BattlePassStateDto(level, xp, absences, nextXp, dtos);
    }

    @Transactional
    public BattlePassStateDto claim(User user, Long rewardId) {
        BattlePassReward reward = rewards.findById(rewardId)
                .orElseThrow(() -> new NotFoundException("Recompensa nu exista."));

        if (userRewards.existsByUserIdAndRewardId(user.getId(), rewardId)) {
            throw new BadRequestException("Ai revendicat deja aceasta recompensa.");
        }

        if (user.getXpPoints() < reward.getRequiredXp()) {
            throw new BadRequestException(
                    "Ai nevoie de " + reward.getRequiredXp() + " XP pentru aceasta recompensa. "
                            + "Mai ai " + (reward.getRequiredXp() - user.getXpPoints()) + " XP.");
        }

        long absences = absencesThisMonth(user.getId());
        if (absences > reward.getMaxAbsencesAllowed()) {
            throw new BadRequestException(
                    "Ai " + absences + " absente luna aceasta, iar limita este "
                            + reward.getMaxAbsencesAllowed() + ".");
        }

        UserReward claim = new UserReward();
        claim.setUser(user);
        claim.setReward(reward);
        userRewards.save(claim);

        recalculateLevel(user);
        users.save(user);

        return stateFor(user);
    }

    /** Sincronizeaza nivelul salvat pe User cu XP-ul curent. */
    public void recalculateLevel(User user) {
        user.setCurrentBattlepassLevel(
                levelFor(user.getXpPoints(), rewards.findAllByOrderByRequiredLevelAsc()));
    }

    /** Nivelul = cate praguri a depasit sportivul. */
    private int levelFor(int xp, List<BattlePassReward> all) {
        return (int) all.stream().filter(r -> xp >= r.getRequiredXp()).count();
    }

    private long absencesThisMonth(Long userId) {
        YearMonth month = YearMonth.now();
        LocalDate from = month.atDay(1);
        LocalDate to = month.atEndOfMonth();
        return attendance.countByUserAndStatusBetween(userId, AttendanceStatus.ABSENT, from, to);
    }
}

package ro.academiaionandrei.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ro.academiaionandrei.api.dto.Dtos.AttendanceDto;
import ro.academiaionandrei.api.dto.Dtos.AttendanceRequest;
import ro.academiaionandrei.api.dto.Dtos.UserDto;
import ro.academiaionandrei.api.entity.Attendance;
import ro.academiaionandrei.api.entity.AttendanceStatus;
import ro.academiaionandrei.api.entity.User;
import ro.academiaionandrei.api.repository.AttendanceRepository;
import ro.academiaionandrei.api.repository.UserRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Marcarea prezentei este singurul loc din aplicatie care acorda XP din
 * antrenamente si care actualizeaza nivelul de Battle Pass. Totul se intampla
 * intr-o singura tranzactie: ori se salveaza toata sedinta, ori niciun rand.
 */
@Service
public class AttendanceService {

    private final AttendanceRepository attendance;
    private final UserRepository users;
    private final BattlePassService battlePass;

    @Value("${app.gamification.xp-per-session:50}")
    private int xpPerSession;

    public AttendanceService(AttendanceRepository attendance,
                             UserRepository users,
                             BattlePassService battlePass) {
        this.attendance = attendance;
        this.users = users;
        this.battlePass = battlePass;
    }

    @Transactional(readOnly = true)
    public List<UserDto> roster() {
        return users.findByApprovedTrueOrderByNameAsc().stream().map(UserDto::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceDto> forUser(Long userId) {
        return attendance.findByUserIdOrderByDateDesc(userId).stream().map(AttendanceDto::from).toList();
    }

    /**
     * Inregistreaza sedinta: cei bifati primesc PRESENT si XP, restul ABSENT.
     * Reapelarea pentru aceeasi data suprascrie rezultatul anterior, ca antrenorul
     * sa poata corecta o greseala fara sa creeze duplicate.
     */
    @Transactional
    public List<AttendanceDto> record(AttendanceRequest request, Long trainerId) {
        LocalDate date = request.date();
        Set<Long> present = new HashSet<>(request.presentUserIds());

        List<User> roster = users.findByApprovedTrueOrderByNameAsc();
        List<Attendance> existing = attendance.findByDate(date);
        List<Attendance> saved = new ArrayList<>();

        for (User athlete : roster) {
            boolean isPresent = present.contains(athlete.getId());

            Attendance record = existing.stream()
                    .filter(a -> a.getUser().getId().equals(athlete.getId()))
                    .findFirst()
                    .orElseGet(Attendance::new);

            AttendanceStatus previous = record.getStatus();
            AttendanceStatus current = isPresent ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT;

            record.setUser(athlete);
            record.setDate(date);
            record.setStatus(current);
            record.setMarkedByTrainerId(trainerId);
            saved.add(attendance.save(record));

            applyConsequences(athlete, previous, current);
        }

        // Nivelul se recalculeaza dupa ce toate randurile sunt in baza de date,
        // ca numaratoarea de absente sa fie corecta.
        roster.forEach(battlePass::recalculateLevel);
        users.saveAll(roster);

        return saved.stream().map(AttendanceDto::from).toList();
    }

    /**
     * Aplica diferenta dintre statusul vechi si cel nou.
     *
     * Prezenta adauga XP, absenta il scade cu aceeasi valoare. Tratarea pe
     * delta (nu pe absolut) face corectiile idempotente: daca antrenorul
     * re-salveaza aceeasi sedinta, XP-ul nu se dubleaza, iar corectarea unei
     * bife gresite readuce exact valoarea de dinainte.
     *
     * Delta pentru trecerea ABSENT -> PRESENT este dubla (+2 x xpPerSession):
     * anuleaza penalizarea si acorda recompensa.
     */
    private void applyConsequences(User athlete, AttendanceStatus previous, AttendanceStatus current) {
        if (previous == current) {
            return;
        }

        if (current == AttendanceStatus.PRESENT) {
            athlete.addXp(previous == AttendanceStatus.ABSENT ? xpPerSession * 2 : xpPerSession);
            if (previous == AttendanceStatus.ABSENT) {
                athlete.setAbsencesCount(Math.max(0, athlete.getAbsencesCount() - 1));
            }
        } else {
            athlete.setAbsencesCount(athlete.getAbsencesCount() + 1);
            int penalty = previous == AttendanceStatus.PRESENT ? xpPerSession * 2 : xpPerSession;
            athlete.setXpPoints(Math.max(0, athlete.getXpPoints() - penalty));
        }
    }
}

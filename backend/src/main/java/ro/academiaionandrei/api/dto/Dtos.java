package ro.academiaionandrei.api.dto;

import jakarta.validation.constraints.*;
import ro.academiaionandrei.api.entity.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Toate obiectele de transfer, ca record-uri imutabile.
 * Grupate intr-o clasa container pentru ca fiecare are cateva linii si se
 * citesc mai bine impreuna decat imprastiate in 15 fisiere.
 */
public final class Dtos {

    private Dtos() {
    }

    // ------------------------------------------------------------------ auth
    public record RegisterRequest(
            @NotBlank @Size(min = 3, max = 120) String name,
            @NotBlank @Email @Size(max = 180) String email,
            @NotBlank @Size(min = 8, max = 72) String password,
            @Size(max = 30) String phone,
            @NotNull LocalDate birthDate,
            Map<String, String> utm) {
    }

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password) {
    }

    public record AuthResponse(String token, UserDto user) {
    }

    public record MessageResponse(String message) {
    }

    // ------------------------------------------------------------------ user
    public record UserDto(
            Long id,
            String name,
            String email,
            String role,
            boolean approved,
            int xpPoints,
            int absencesCount,
            int currentBattlepassLevel,
            String phone,
            String avatarUrl,
            String belt,
            LocalDate birthDate,
            String bio) {

        public static UserDto from(User u) {
            return new UserDto(
                    u.getId(), u.getName(), u.getEmail(), u.getRole().name(), u.isApproved(),
                    u.getXpPoints(), u.getAbsencesCount(), u.getCurrentBattlepassLevel(),
                    u.getPhone(), u.getAvatarUrl(), u.getBelt(), u.getBirthDate(), u.getBio());
        }
    }

    /** Campurile pe care sportivul si le poate edita singur. */
    public record ProfileUpdateRequest(
            @NotBlank @Size(min = 3, max = 120) String name,
            @Size(max = 30) String phone,
            @Size(max = 500) String bio,
            LocalDate birthDate) {
    }

    // --------------------------------------------------------------- stories
    public record StoryDto(
            Long id,
            Long userId,
            String userName,
            String userAvatarUrl,
            String mediaUrl,
            String caption,
            Instant createdAt,
            Instant expiresAt) {

        public static StoryDto from(Story s) {
            return new StoryDto(
                    s.getId(), s.getUser().getId(), s.getUser().getName(), s.getUser().getAvatarUrl(),
                    s.getMediaUrl(), s.getCaption(), s.getCreatedAt(), s.getExpiresAt());
        }
    }

    // ------------------------------------------------------------ attendance
    public record AttendanceRequest(
            @NotNull LocalDate date,
            @NotNull List<Long> presentUserIds) {
    }

    public record AttendanceDto(
            Long id,
            Long userId,
            String userName,
            LocalDate date,
            String status,
            Long markedByTrainerId) {

        public static AttendanceDto from(Attendance a) {
            return new AttendanceDto(
                    a.getId(), a.getUser().getId(), a.getUser().getName(),
                    a.getDate(), a.getStatus().name(), a.getMarkedByTrainerId());
        }
    }

    // ----------------------------------------------------------- battle pass
    public record BattlePassRewardDto(
            Long id,
            String name,
            String description,
            int requiredLevel,
            int requiredXp,
            String iconUrl,
            int maxAbsencesAllowed,
            boolean unlocked,
            boolean claimed,
            Instant claimedAt) {
    }

    public record BattlePassStateDto(
            int currentLevel,
            int xpPoints,
            long absencesThisMonth,
            /** Pragul urmator de atins, pentru bara de progres. */
            int nextThresholdXp,
            List<BattlePassRewardDto> rewards) {
    }

    // ----------------------------------------------------------------- wheel
    public record WheelPrizeDto(int id, String label, String color, int weight, double chancePercent) {
    }

    public record WheelStatusDto(
            boolean canSpin,
            Instant nextSpinAvailableAt,
            List<WheelPrizeDto> prizes,
            String lastPrizeLabel) {
    }

    public record WheelSpinResultDto(
            int prizeId,
            String prizeLabel,
            /** Explicatie in limbaj natural a ce s-a intamplat efectiv. */
            String outcome,
            Instant spunAt,
            /** Null cand premiul a fost "Mai da o data": nu incepe cooldown. */
            Instant nextSpinAvailableAt,
            int xpAwarded,
            boolean absenceForgiven,
            boolean grantsExtraSpin) {
    }

    // ---------------------------------------------------------- competitions
    public record CompetitionRequest(
            @NotBlank @Size(max = 180) String title,
            @NotBlank @Size(max = 180) String location,
            @NotNull LocalDate date,
            @Size(max = 1000) String description) {
    }

    public record CompetitionDto(
            Long id,
            String title,
            String location,
            LocalDate date,
            String description,
            String createdByName,
            List<String> participants) {

        public static CompetitionDto from(Competition c) {
            return new CompetitionDto(
                    c.getId(), c.getTitle(), c.getLocation(), c.getDate(), c.getDescription(),
                    c.getCreatedBy() != null ? c.getCreatedBy().getName() : "Academie",
                    c.getParticipants().stream().map(User::getName).toList());
        }
    }

    // --------------------------------------------------------------- contact
    public record ContactRequest(
            @NotBlank @Size(max = 120) String name,
            @NotBlank @Email String email,
            @NotBlank @Size(max = 30) String phone,
            @NotBlank String group,
            @Size(max = 2000) String message,
            @AssertTrue(message = "Acordul GDPR este obligatoriu") boolean gdpr,
            Map<String, String> utm) {
    }

    // ----------------------------------------------------------------- error
    public record ApiError(String timestamp, int status, String code, String message, Object details) {
    }
}

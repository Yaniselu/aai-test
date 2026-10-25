package ro.academiaionandrei.api.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_users_email", columnList = "email", unique = true),
        @Index(name = "idx_users_approved", columnList = "approved")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, unique = true, length = 180)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Column(length = 30)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.ROLE_USER;

    /**
     * Poarta de acces a intregii aplicatii. Cat timp este false, filtrul de
     * securitate respinge orice ruta protejata cu 403 PENDING_APPROVAL.
     */
    @Column(nullable = false)
    private boolean approved = false;

    @Column(name = "xp_points", nullable = false)
    private int xpPoints = 0;

    /** Absente in luna curenta. Se reseteaza de cron job la inceput de luna. */
    @Column(name = "absences_count", nullable = false)
    private int absencesCount = 0;

    @Column(name = "current_battlepass_level", nullable = false)
    private int currentBattlepassLevel = 0;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(length = 40)
    private String belt;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    /** Scurta prezentare scrisa de sportiv. Limitata la 500 de caractere. */
    @Column(length = 500)
    private String bio;

    @Column(name = "joined_at", nullable = false)
    private LocalDate joinedAt = LocalDate.now();

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    /** Sursa campaniei din care a venit inscrierea (UTM serializat). */
    @Column(name = "signup_source", length = 500)
    private String signupSource;

    // ---------------------------------------------------------------- getters
    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getPhone() { return phone; }
    public Role getRole() { return role; }
    public boolean isApproved() { return approved; }
    public int getXpPoints() { return xpPoints; }
    public int getAbsencesCount() { return absencesCount; }
    public int getCurrentBattlepassLevel() { return currentBattlepassLevel; }
    public String getAvatarUrl() { return avatarUrl; }
    public String getBelt() { return belt; }
    public LocalDate getBirthDate() { return birthDate; }
    public String getBio() { return bio; }
    public LocalDate getJoinedAt() { return joinedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public String getSignupSource() { return signupSource; }

    // ---------------------------------------------------------------- setters
    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setPhone(String phone) { this.phone = phone; }
    public void setRole(Role role) { this.role = role; }
    public void setApproved(boolean approved) { this.approved = approved; }
    public void setXpPoints(int xpPoints) { this.xpPoints = xpPoints; }
    public void setAbsencesCount(int absencesCount) { this.absencesCount = absencesCount; }
    public void setCurrentBattlepassLevel(int level) { this.currentBattlepassLevel = level; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public void setBelt(String belt) { this.belt = belt; }
    public void setBirthDate(LocalDate birthDate) { this.birthDate = birthDate; }
    public void setBio(String bio) { this.bio = bio; }
    public void setJoinedAt(LocalDate joinedAt) { this.joinedAt = joinedAt; }
    public void setSignupSource(String signupSource) { this.signupSource = signupSource; }

    // ---------------------------------------------------------------- helpers
    public void addXp(int amount) {
        this.xpPoints += amount;
    }
}

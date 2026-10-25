package ro.academiaionandrei.api.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "battlepass_rewards")
public class BattlePassReward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 280)
    private String description;

    @Column(name = "required_level", nullable = false)
    private int requiredLevel;

    /**
     * Pragul real de XP. Nivelurile nu mai sunt liniare: fiecare treapta cere
     * semnificativ mai mult decat precedenta, ca echipamentul sa insemne luni
     * de prezenta constanta, nu cateva antrenamente.
     */
    @Column(name = "required_xp", nullable = false)
    private int requiredXp;

    @Column(name = "icon_url", length = 500)
    private String iconUrl;

    /** Prag de absente lunare peste care recompensa ramane blocata. */
    @Column(name = "max_absences_allowed", nullable = false)
    private int maxAbsencesAllowed = 2;

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public int getRequiredLevel() { return requiredLevel; }
    public int getRequiredXp() { return requiredXp; }
    public String getIconUrl() { return iconUrl; }
    public int getMaxAbsencesAllowed() { return maxAbsencesAllowed; }

    public void setId(Long id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setDescription(String description) { this.description = description; }
    public void setRequiredLevel(int requiredLevel) { this.requiredLevel = requiredLevel; }
    public void setRequiredXp(int requiredXp) { this.requiredXp = requiredXp; }
    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }
    public void setMaxAbsencesAllowed(int maxAbsencesAllowed) { this.maxAbsencesAllowed = maxAbsencesAllowed; }
}

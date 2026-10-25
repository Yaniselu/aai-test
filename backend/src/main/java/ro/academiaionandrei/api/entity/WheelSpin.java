package ro.academiaionandrei.api.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "wheel_spins", indexes = @Index(name = "idx_wheel_user_date", columnList = "user_id, last_spin_date"))
public class WheelSpin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "reward_won", nullable = false, length = 120)
    private String rewardWon;

    @Column(name = "prize_id", nullable = false)
    private int prizeId;

    @Column(name = "last_spin_date", nullable = false)
    private Instant lastSpinDate = Instant.now();

    /**
     * Fals pentru premiul "Mai da o data": invartirea se inregistreaza in
     * istoric, dar nu porneste cooldown-ul saptamanal.
     */
    @Column(name = "counts_for_cooldown", nullable = false)
    private boolean countsForCooldown = true;

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getRewardWon() { return rewardWon; }
    public int getPrizeId() { return prizeId; }
    public Instant getLastSpinDate() { return lastSpinDate; }
    public boolean isCountsForCooldown() { return countsForCooldown; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setRewardWon(String rewardWon) { this.rewardWon = rewardWon; }
    public void setPrizeId(int prizeId) { this.prizeId = prizeId; }
    public void setLastSpinDate(Instant lastSpinDate) { this.lastSpinDate = lastSpinDate; }
    public void setCountsForCooldown(boolean countsForCooldown) { this.countsForCooldown = countsForCooldown; }
}

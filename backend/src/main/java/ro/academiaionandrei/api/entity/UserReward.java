package ro.academiaionandrei.api.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_rewards",
        uniqueConstraints = @UniqueConstraint(name = "uk_user_reward", columnNames = {"user_id", "reward_id"}))
public class UserReward {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reward_id", nullable = false)
    private BattlePassReward reward;

    @Column(name = "claimed_at", nullable = false)
    private Instant claimedAt = Instant.now();

    public Long getId() { return id; }
    public User getUser() { return user; }
    public BattlePassReward getReward() { return reward; }
    public Instant getClaimedAt() { return claimedAt; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setReward(BattlePassReward reward) { this.reward = reward; }
    public void setClaimedAt(Instant claimedAt) { this.claimedAt = claimedAt; }
}

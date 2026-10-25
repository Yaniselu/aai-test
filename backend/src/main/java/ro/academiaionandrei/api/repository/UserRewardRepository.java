package ro.academiaionandrei.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.academiaionandrei.api.entity.UserReward;

import java.util.List;

public interface UserRewardRepository extends JpaRepository<UserReward, Long> {

    List<UserReward> findByUserId(Long userId);

    boolean existsByUserIdAndRewardId(Long userId, Long rewardId);
}

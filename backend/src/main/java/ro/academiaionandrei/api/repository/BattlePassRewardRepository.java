package ro.academiaionandrei.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.academiaionandrei.api.entity.BattlePassReward;

import java.util.List;

public interface BattlePassRewardRepository extends JpaRepository<BattlePassReward, Long> {

    List<BattlePassReward> findAllByOrderByRequiredLevelAsc();
}

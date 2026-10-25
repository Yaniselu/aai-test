package ro.academiaionandrei.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.academiaionandrei.api.entity.WheelSpin;

import java.util.Optional;

public interface WheelSpinRepository extends JpaRepository<WheelSpin, Long> {

    Optional<WheelSpin> findTopByUserIdOrderByLastSpinDateDesc(Long userId);

    /** Ultima invartire care a pornit efectiv cooldown-ul saptamanal. */
    Optional<WheelSpin> findTopByUserIdAndCountsForCooldownTrueOrderByLastSpinDateDesc(Long userId);
}

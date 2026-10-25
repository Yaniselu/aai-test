package ro.academiaionandrei.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import ro.academiaionandrei.api.entity.Role;
import ro.academiaionandrei.api.entity.User;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByApprovedFalseOrderByCreatedAtAsc();

    List<User> findByApprovedTrueOrderByNameAsc();

    List<User> findByApprovedTrueAndRoleOrderByNameAsc(Role role);

    /** Resetare lunara a contorului de absente, intr-un singur UPDATE. */
    @Modifying
    @Query("update User u set u.absencesCount = 0")
    int resetAllAbsences();
}

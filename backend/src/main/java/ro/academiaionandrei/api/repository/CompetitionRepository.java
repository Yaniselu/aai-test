package ro.academiaionandrei.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import ro.academiaionandrei.api.entity.Competition;

import java.util.List;

public interface CompetitionRepository extends JpaRepository<Competition, Long> {

    /** Incarcam participantii si autorul odata cu lista, ca sa evitam N+1. */
    @Query("""
            select distinct c from Competition c
            left join fetch c.participants
            left join fetch c.createdBy
            order by c.date desc
            """)
    List<Competition> findAllWithDetails();
}

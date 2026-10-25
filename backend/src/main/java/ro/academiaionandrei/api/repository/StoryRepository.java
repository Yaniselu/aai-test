package ro.academiaionandrei.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.academiaionandrei.api.entity.Story;

import java.time.Instant;
import java.util.List;

public interface StoryRepository extends JpaRepository<Story, Long> {

    /** Story-urile inca valabile, cu autorul incarcat pentru a evita N+1. */
    @Query("select s from Story s join fetch s.user where s.expiresAt > :now order by s.createdAt desc")
    List<Story> findActive(@Param("now") Instant now);

    @Query("select s from Story s where s.expiresAt <= :now")
    List<Story> findExpired(@Param("now") Instant now);

    long countByExpiresAtLessThanEqual(Instant now);
}

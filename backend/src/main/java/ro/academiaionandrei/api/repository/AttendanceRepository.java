package ro.academiaionandrei.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import ro.academiaionandrei.api.entity.Attendance;
import ro.academiaionandrei.api.entity.AttendanceStatus;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByUserIdOrderByDateDesc(Long userId);

    List<Attendance> findByDate(LocalDate date);

    boolean existsByUserIdAndDate(Long userId, LocalDate date);

    @Query("""
            select count(a) from Attendance a
            where a.user.id = :userId
              and a.status = :status
              and a.date between :from and :to
            """)
    long countByUserAndStatusBetween(@Param("userId") Long userId,
                                     @Param("status") AttendanceStatus status,
                                     @Param("from") LocalDate from,
                                     @Param("to") LocalDate to);
}

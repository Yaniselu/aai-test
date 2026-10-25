package ro.academiaionandrei.api.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "attendance",
        uniqueConstraints = @UniqueConstraint(name = "uk_attendance_user_date", columnNames = {"user_id", "date"}),
        indexes = {
                @Index(name = "idx_attendance_user_date", columnList = "user_id, date"),
                @Index(name = "idx_attendance_date", columnList = "date")
        })
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private AttendanceStatus status;

    @Column(name = "marked_by_trainer_id")
    private Long markedByTrainerId;

    public Long getId() { return id; }
    public User getUser() { return user; }
    public LocalDate getDate() { return date; }
    public AttendanceStatus getStatus() { return status; }
    public Long getMarkedByTrainerId() { return markedByTrainerId; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setDate(LocalDate date) { this.date = date; }
    public void setStatus(AttendanceStatus status) { this.status = status; }
    public void setMarkedByTrainerId(Long markedByTrainerId) { this.markedByTrainerId = markedByTrainerId; }
}

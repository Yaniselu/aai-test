package ro.academiaionandrei.api.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "stories", indexes = {
        @Index(name = "idx_stories_expires", columnList = "expires_at"),
        @Index(name = "idx_stories_user", columnList = "user_id")
})
public class Story {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "media_url", nullable = false, length = 500)
    private String mediaUrl;

    /** Cheia din storage, necesara pentru stergerea fizica la expirare. */
    @Column(name = "storage_key", length = 500)
    private String storageKey;

    @Column(length = 280)
    private String caption;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getMediaUrl() { return mediaUrl; }
    public String getStorageKey() { return storageKey; }
    public String getCaption() { return caption; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getExpiresAt() { return expiresAt; }

    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }
    public void setStorageKey(String storageKey) { this.storageKey = storageKey; }
    public void setCaption(String caption) { this.caption = caption; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }
}

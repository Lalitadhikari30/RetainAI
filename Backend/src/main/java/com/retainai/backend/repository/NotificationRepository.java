package com.retainai.backend.repository;

import com.retainai.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findTop30ByOrderByCreatedAtDesc();

    long countByReadFalse();

    @Modifying
    @Transactional
    @Query("UPDATE Notification n SET n.read = true WHERE n.read = false")
    void markAllAsRead();
}

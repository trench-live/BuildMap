package com.buildmap.api.repos;

import com.buildmap.api.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByDeletedFalse();
    List<User> findByDeletedTrue();
    boolean existsByTelegramId(String telegramId);
}

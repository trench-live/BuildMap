package com.buildmap.api.repos;

import com.buildmap.api.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByDeletedFalse();
    List<User> findByDeletedTrue();
    boolean existsByTelegramId(String telegramId);
    Optional<User> findByTelegramId(String telegramId);

    boolean existsByTelegramIdAndDeletedFalse(String telegramId);
}

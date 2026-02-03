package com.buildmap.api.repos;

import com.buildmap.api.entities.user.User;
import com.buildmap.api.entities.user.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    List<User> findByDeletedFalse();
    List<User> findByDeletedTrue();
    boolean existsByTelegramId(String telegramId);
    Optional<User> findByTelegramId(String telegramId);
    Optional<User> findByIdAndDeletedFalseAndBlockedFalse(Long id);
    long countByRoleAndDeletedFalseAndBlockedFalse(Role role);
    long countByDeletedFalse();
    long countByDeletedTrue();
    long countByDeletedFalseAndBlockedTrue();

    @Query("""
            SELECT u.id as id,
                   u.name as name,
                   u.telegramId as telegramId,
                   u.role as role,
                   u.deleted as deleted,
                   u.blocked as blocked,
                   COUNT(ma.id) as areasCount
            FROM User u
            LEFT JOIN u.mappingAreas ma ON ma.deleted = false
            GROUP BY u.id, u.name, u.telegramId, u.role, u.deleted, u.blocked
            ORDER BY u.id DESC
            """)
    List<UserAdminListProjection> findAdminListWithActiveAreasCount();
}

package com.buildmap.api.services;

import com.buildmap.api.entities.user.Role;
import com.buildmap.api.entities.user.User;
import com.buildmap.api.repos.FloorRepository;
import com.buildmap.api.repos.MappingAreaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthorizationService {

    private final UserService userService;
    private final MappingAreaRepository mappingAreaRepository;
    private final FloorRepository floorRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required");
        }

        Object principal = authentication.getPrincipal();
        Long userId = extractUserId(principal);
        return userService.getById(userId);
    }

    public boolean isAdmin(User user) {
        return user.getRole() == Role.ADMIN;
    }

    public void requireAdmin(User user) {
        if (!isAdmin(user)) {
            throw new AccessDeniedException("Admin access required");
        }
    }

    public void requireSelfOrAdmin(User user, Long targetUserId) {
        if (isAdmin(user) || (targetUserId != null && user.getId() == targetUserId)) {
            return;
        }
        throw new AccessDeniedException("Access denied");
    }

    public void requireAreaOwnerOrAdmin(User user, Long areaId) {
        if (isAdmin(user)) {
            return;
        }
        if (!mappingAreaRepository.existsByIdAndUsersId(areaId, user.getId())) {
            throw new AccessDeniedException("Access denied for mapping area");
        }
    }

    public void requireFloorOwnerOrAdmin(User user, Long floorId) {
        if (isAdmin(user)) {
            return;
        }
        if (!floorRepository.existsByIdAndMappingAreaUsersId(floorId, user.getId())) {
            throw new AccessDeniedException("Access denied for floor");
        }
    }

    private Long extractUserId(Object principal) {
        if (principal instanceof Long userId) {
            return userId;
        }
        if (principal instanceof String principalText) {
            try {
                return Long.parseLong(principalText);
            } catch (NumberFormatException ex) {
                throw new AccessDeniedException("Invalid authentication principal");
            }
        }
        throw new AccessDeniedException("Invalid authentication principal");
    }
}

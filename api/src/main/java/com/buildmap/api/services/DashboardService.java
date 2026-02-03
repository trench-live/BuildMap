package com.buildmap.api.services;

import com.buildmap.api.dto.dashboard.AdminDashboardStatsDto;
import com.buildmap.api.dto.dashboard.UserDashboardStatsDto;
import com.buildmap.api.entities.user.Role;
import com.buildmap.api.repos.FloorRepository;
import com.buildmap.api.repos.FulcrumRepository;
import com.buildmap.api.repos.MappingAreaRepository;
import com.buildmap.api.repos.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final MappingAreaRepository mappingAreaRepository;
    private final FloorRepository floorRepository;
    private final FulcrumRepository fulcrumRepository;

    public AdminDashboardStatsDto getAdminStats() {
        return new AdminDashboardStatsDto(
                userRepository.countByDeletedFalse(),
                userRepository.countByDeletedFalseAndBlockedTrue(),
                userRepository.countByDeletedTrue(),
                userRepository.countByRoleAndDeletedFalseAndBlockedFalse(Role.ADMIN),
                mappingAreaRepository.countByDeletedFalse(),
                floorRepository.countActiveInActiveAreas(),
                fulcrumRepository.countActiveInActiveAreas()
        );
    }

    public UserDashboardStatsDto getUserStats(Long userId) {
        return new UserDashboardStatsDto(
                mappingAreaRepository.countByUserIdAndDeletedFalse(userId),
                floorRepository.countActiveByUserIdInActiveAreas(userId),
                fulcrumRepository.countActiveByUserIdInActiveAreas(userId)
        );
    }
}

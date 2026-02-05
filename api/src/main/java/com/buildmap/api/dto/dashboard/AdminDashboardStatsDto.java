package com.buildmap.api.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminDashboardStatsDto {
    private long activeUsers;
    private long blockedUsers;
    private long deletedUsers;
    private long activeAdmins;
    private long activeAreas;
    private long activeFloors;
    private long activeFulcrums;
}

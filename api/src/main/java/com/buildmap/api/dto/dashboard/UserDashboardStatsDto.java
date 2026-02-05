package com.buildmap.api.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserDashboardStatsDto {
    private long myActiveAreas;
    private long myActiveFloors;
    private long myActiveFulcrums;
}

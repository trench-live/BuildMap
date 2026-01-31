package com.buildmap.api.dto.floor;

import lombok.Data;

@Data
public class FloorDto {
    private Long id;
    private String name;
    private Integer level;
    private String description;
    private String svgPlan;
    private Long mappingAreaId;
    private boolean deleted;
}
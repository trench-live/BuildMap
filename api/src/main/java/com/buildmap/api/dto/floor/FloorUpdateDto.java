package com.buildmap.api.dto.floor;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FloorUpdateDto {
    @Size(max = 50)
    private String name;

    private Integer level;

    @Size(max = 200)
    private String description;

    private String svgPlan;
}
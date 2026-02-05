package com.buildmap.api.dto.route;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RouteRequestDto {
    @NotNull
    private Long startFulcrumId;

    @NotNull
    private Long endFulcrumId;
}
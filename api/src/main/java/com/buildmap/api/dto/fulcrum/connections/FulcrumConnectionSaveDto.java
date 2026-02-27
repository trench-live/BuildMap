package com.buildmap.api.dto.fulcrum.connections;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FulcrumConnectionSaveDto {
    @NotNull
    private Long connectedFulcrumId;

    @NotNull
    @DecimalMin(value = "0.1", inclusive = true)
    private Double distanceMeters;

    @NotNull
    @DecimalMin(value = "1.0", inclusive = true)
    private Double difficultyFactor = 1.0;
}

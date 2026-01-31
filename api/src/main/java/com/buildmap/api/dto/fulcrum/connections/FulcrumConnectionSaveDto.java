package com.buildmap.api.dto.fulcrum.connections;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class FulcrumConnectionSaveDto {
    @NotNull
    private Long connectedFulcrumId;

    @NotNull
    private Double weight = 1.0;
}

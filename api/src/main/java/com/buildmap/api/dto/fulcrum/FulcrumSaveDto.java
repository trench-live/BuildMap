package com.buildmap.api.dto.fulcrum;

import com.buildmap.api.entities.mapping_area.fulcrum.FulcrumType;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FulcrumSaveDto {
    @NotBlank
    @Size(max = 50)
    private String name;

    @Size(max = 200)
    private String description;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @DecimalMax(value = "1.0", inclusive = true)
    private Double x;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @DecimalMax(value = "1.0", inclusive = true)
    private Double y;

    @NotNull
    private FulcrumType type;

    @NotNull
    private Long floorId;
}

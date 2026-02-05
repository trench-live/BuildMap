package com.buildmap.api.dto.route;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteStepDto {
    private RouteStepType type;
    private String text;
    private Long fromFulcrumId;
    private Long toFulcrumId;
    private Long floorId;
}

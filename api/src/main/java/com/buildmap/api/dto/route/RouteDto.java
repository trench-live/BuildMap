package com.buildmap.api.dto.route;

import com.buildmap.api.dto.fulcrum.FulcrumDto;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteDto {
    private List<FulcrumDto> path;
    private Double totalDistance;
    private Long startFulcrumId;
    private Long endFulcrumId;
}
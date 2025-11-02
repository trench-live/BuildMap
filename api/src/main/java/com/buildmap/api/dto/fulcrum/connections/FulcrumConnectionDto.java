package com.buildmap.api.dto.fulcrum.connections;

import lombok.Data;

@Data
public class FulcrumConnectionDto {
    private Long connectedFulcrumId;
    private Double weight;
}

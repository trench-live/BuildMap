package com.buildmap.api.dto.fulcrum;

import com.buildmap.api.dto.fulcrum.connections.FulcrumConnectionDto;
import com.buildmap.api.entities.mapping_area.fulcrum.FacingDirection;
import com.buildmap.api.entities.mapping_area.fulcrum.FulcrumType;
import lombok.Data;

import java.util.List;

@Data
public class FulcrumDto {
    private Long id;
    private String name;
    private String description;
    private Double x;
    private Double y;
    private FulcrumType type;
    private FacingDirection facingDirection;
    private String qrCodeId;
    private Long mappingAreaId;
    private Long floorId;
    private boolean deleted;
    private List<FulcrumConnectionDto> connections;
}

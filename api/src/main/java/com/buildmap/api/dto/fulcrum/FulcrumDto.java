package com.buildmap.api.dto.fulcrum;

import com.buildmap.api.dto.mapping_area.MappingAreaDto;
import lombok.Data;

import java.util.List;

@Data
public class FulcrumDto {
    private Long id;
    private String name;
    private String description;
    private Double x;
    private Double y;
    private Double z;
    private String type;
    private String qrCodeId;
    private MappingAreaDto mappingArea;
    private List<FulcrumSimpleDto> connectedFulcrums;
    private List<Double> connectionWeights;
}
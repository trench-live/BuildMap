package com.buildmap.api.dto.fulcrum;

import lombok.Data;

@Data
public class FulcrumSimpleDto {
    private Long id;
    private String name;
    private String type;
    private Double x;
    private Double y;
    private Double z;
}

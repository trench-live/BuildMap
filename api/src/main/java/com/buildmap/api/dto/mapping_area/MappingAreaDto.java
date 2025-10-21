package com.buildmap.api.dto.mapping_area;

import lombok.Data;

@Data
public class MappingAreaDto {
    private Long id;
    private String name;
    private String description;
    private String image;
    private boolean deleted;
    private Long userId;
}
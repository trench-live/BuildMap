package com.buildmap.api.dto.mapping_area;

import lombok.Data;

import java.util.List;

@Data
public class MappingAreaDto {
    private Long id;
    private String name;
    private String description;
    private String image;
    private boolean deleted;
    private List<Long> userIds;
}
package com.buildmap.api.dto.route.mappers;

import com.buildmap.api.dto.fulcrum.mappers.FulcrumMapper;
import com.buildmap.api.dto.route.RouteDto;
import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {FulcrumMapper.class})
public interface RouteMapper {
    @Mapping(target = "totalDistanceMeters", ignore = true)
    @Mapping(target = "totalCost", ignore = true)
    @Mapping(target = "steps", ignore = true)
    RouteDto toRouteDto(List<Fulcrum> path, Long startFulcrumId, Long endFulcrumId);
}

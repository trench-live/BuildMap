package com.buildmap.api.dto.route.mappers;

import com.buildmap.api.dto.fulcrum.mappers.FulcrumMapper;
import com.buildmap.api.dto.route.RouteDto;
import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring", uses = {FulcrumMapper.class})
public interface RouteMapper {
    RouteDto toRouteDto(List<Fulcrum> path, Double totalDistance, Long startFulcrumId, Long endFulcrumId);
}
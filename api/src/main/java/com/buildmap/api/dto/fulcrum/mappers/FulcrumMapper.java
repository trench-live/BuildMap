package com.buildmap.api.dto.fulcrum.mappers;

import com.buildmap.api.dto.fulcrum.FulcrumDto;
import com.buildmap.api.dto.fulcrum.FulcrumSaveDto;
import com.buildmap.api.dto.fulcrum.connections.FulcrumConnectionDto;
import com.buildmap.api.entities.mapping_area.MappingArea;
import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import com.buildmap.api.entities.mapping_area.fulcrum.FulcrumConnection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface FulcrumMapper {

    @Mapping(target = "mappingAreaId", source = "mappingArea.id")
    @Mapping(target = "connections", source = "connections", qualifiedByName = "connectionsToDtos")
    @Mapping(target = "qrCodeId", expression = "java(generateQrCodeUrl(entity))")
    FulcrumDto toDto(Fulcrum entity);

    List<FulcrumDto> toDtoList(List<Fulcrum> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "qrCodeId", ignore = true)
    @Mapping(target = "mappingArea", expression = "java(createMappingAreaProxy(areaId))")
    @Mapping(target = "connections", ignore = true)
    Fulcrum toEntity(FulcrumSaveDto dto, Long areaId);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "qrCodeId", ignore = true)
    @Mapping(target = "mappingArea", ignore = true)
    @Mapping(target = "connections", ignore = true)
    void updateEntity(FulcrumSaveDto dto, @MappingTarget Fulcrum entity);

    default MappingArea createMappingAreaProxy(Long areaId) {
        if (areaId == null) return null;
        MappingArea mappingArea = new MappingArea();
        mappingArea.setId(areaId);
        return mappingArea;
    }

    @Named("connectionsToDtos")
    default List<FulcrumConnectionDto> connectionsToDtos(List<FulcrumConnection> connections) {
        if (connections == null) return null;
        return connections.stream()
                .map(conn -> {
                    FulcrumConnectionDto dto = new FulcrumConnectionDto();
                    dto.setConnectedFulcrumId(conn.getConnectedFulcrum().getId());
                    dto.setWeight(conn.getWeight());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Named("mappingAreaIdToMappingArea")
    default MappingArea mappingAreaIdToMappingArea(Long mappingAreaId) {
        if (mappingAreaId == null) return null;
        MappingArea mappingArea = new MappingArea();
        mappingArea.setId(mappingAreaId);
        return mappingArea;
    }

    default String generateQrCodeUrl(Fulcrum entity) {
        if (entity.getMappingArea() == null) return null;
        return String.format("area/%d/fulcrum/%d",
                entity.getMappingArea().getId(), entity.getId());
    }
}
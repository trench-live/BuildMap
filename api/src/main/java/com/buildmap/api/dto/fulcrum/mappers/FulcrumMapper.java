package com.buildmap.api.dto.fulcrum.mappers;

import com.buildmap.api.dto.fulcrum.FulcrumDto;
import com.buildmap.api.dto.fulcrum.FulcrumSaveDto;
import com.buildmap.api.dto.fulcrum.connections.FulcrumConnectionDto;
import com.buildmap.api.entities.mapping_area.Floor;
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

    @Mapping(target = "mappingAreaId", expression = "java(entity.getMappingArea() != null ? entity.getMappingArea().getId() : null)")
    @Mapping(target = "floorId", source = "floor.id")
    @Mapping(target = "connections", source = "connections", qualifiedByName = "connectionsToDtos")
    @Mapping(target = "qrCodeId", expression = "java(generateQrCodeUrl(entity))")
    FulcrumDto toDto(Fulcrum entity);

    List<FulcrumDto> toDtoList(List<Fulcrum> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "qrCodeId", ignore = true)
    @Mapping(target = "floor", source = "floorId", qualifiedByName = "floorIdToFloor")
    @Mapping(target = "connections", ignore = true)
    Fulcrum toEntity(FulcrumSaveDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "qrCodeId", ignore = true)
    @Mapping(target = "floor", ignore = true)
    @Mapping(target = "connections", ignore = true)
    void updateEntity(FulcrumSaveDto dto, @MappingTarget Fulcrum entity);

    @Named("floorIdToFloor")
    default Floor floorIdToFloor(Long floorId) {
        if (floorId == null) return null;
        Floor floor = new Floor();
        floor.setId(floorId);
        return floor;
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

    default String generateQrCodeUrl(Fulcrum entity) {
        if (!entity.isHasQr()) return null;
        if (entity.getFloor() == null) return null;
        return String.format("fulcrum/%d",
                entity.getId());
    }
}

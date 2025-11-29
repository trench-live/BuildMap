package com.buildmap.api.dto.floor.mappers;

import com.buildmap.api.dto.floor.FloorDto;
import com.buildmap.api.dto.floor.FloorSaveDto;
import com.buildmap.api.dto.floor.FloorUpdateDto;
import com.buildmap.api.entities.mapping_area.Floor;
import com.buildmap.api.entities.mapping_area.MappingArea;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface FloorMapper {

    @Mapping(target = "mappingAreaId", source = "mappingArea.id")
    FloorDto toDto(Floor entity);

    List<FloorDto> toDtoList(List<Floor> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "fulcrums", ignore = true)
    @Mapping(target = "mappingArea", source = "mappingAreaId", qualifiedByName = "mappingAreaIdToMappingArea")
    Floor toEntity(FloorSaveDto dto);

    // Этот метод вероятно не используется, можно удалить если не нужен
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "fulcrums", ignore = true)
    @Mapping(target = "mappingArea", ignore = true)
    void updateEntity(FloorSaveDto dto, @MappingTarget Floor entity);

    // ОСНОВНОЙ МЕТОД ДЛЯ ОБНОВЛЕНИЯ - ДОБАВЬТЕ ЭТОТ
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "fulcrums", ignore = true)
    @Mapping(target = "mappingArea", ignore = true)
    void updateEntityFromUpdateDto(FloorUpdateDto dto, @MappingTarget Floor entity);

    @Named("mappingAreaIdToMappingArea")
    default MappingArea mappingAreaIdToMappingArea(Long mappingAreaId) {
        if (mappingAreaId == null) return null;
        MappingArea mappingArea = new MappingArea();
        mappingArea.setId(mappingAreaId);
        return mappingArea;
    }
}
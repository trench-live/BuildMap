package com.buildmap.api.services;

import com.buildmap.api.dto.floor.FloorSaveDto;
import com.buildmap.api.dto.floor.mappers.FloorMapper;
import com.buildmap.api.entities.mapping_area.Floor;
import com.buildmap.api.entities.mapping_area.MappingArea;
import com.buildmap.api.exceptions.FloorNotFoundException;
import com.buildmap.api.repos.FloorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FloorService {

    private final FloorRepository floorRepository;
    private final FloorMapper floorMapper;
    private final MappingAreaService mappingAreaService;

    @Transactional
    public Floor create(FloorSaveDto floorDto) {
        // Проверяем существование MappingArea
        MappingArea mappingArea = mappingAreaService.getById(floorDto.getMappingAreaId());

        // Проверяем уникальность уровня в зоне
        if (floorRepository.existsByMappingAreaIdAndLevelAndDeletedFalse(
                floorDto.getMappingAreaId(), floorDto.getLevel())) {
            throw new IllegalArgumentException("Floor with level " + floorDto.getLevel() +
                    " already exists in this mapping area");
        }

        Floor floor = floorMapper.toEntity(floorDto);
        floor.setMappingArea(mappingArea);

        return floorRepository.save(floor);
    }

    public List<Floor> getAllByMappingAreaId(Long mappingAreaId, Boolean deleted) {
        if (deleted == null) return floorRepository.findByMappingAreaId(mappingAreaId);
        return deleted ?
                floorRepository.findByMappingAreaIdAndDeletedTrue(mappingAreaId) :
                floorRepository.findByMappingAreaIdAndDeletedFalse(mappingAreaId);
    }

    public Floor getById(Long id) {
        return floorRepository.findById(id)
                .orElseThrow(() -> new FloorNotFoundException(id));
    }

    @Transactional
    public Floor update(Long id, FloorSaveDto floorDto) {
        Floor existingFloor = getById(id);

        // Если меняется уровень, проверяем уникальность
        if (!existingFloor.getLevel().equals(floorDto.getLevel())) {
            if (floorRepository.existsByMappingAreaIdAndLevelAndDeletedFalse(
                    existingFloor.getMappingArea().getId(), floorDto.getLevel())) {
                throw new IllegalArgumentException("Floor with level " + floorDto.getLevel() +
                        " already exists in this mapping area");
            }
        }

        floorMapper.updateEntity(floorDto, existingFloor);
        return floorRepository.save(existingFloor);
    }

    @Transactional
    public void safeDelete(Long id) {
        Floor floor = getById(id);
        floor.setDeleted(true);
        floorRepository.save(floor);
    }

    @Transactional
    public void delete(Long id) {
        floorRepository.deleteById(id);
    }
}
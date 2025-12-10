package com.buildmap.api.services;

import com.buildmap.api.dto.floor.FloorSaveDto;
import com.buildmap.api.dto.floor.FloorUpdateDto;
import com.buildmap.api.dto.floor.mappers.FloorMapper;
import com.buildmap.api.entities.mapping_area.Floor;
import com.buildmap.api.entities.mapping_area.MappingArea;
import com.buildmap.api.exceptions.FloorAlreadyExistsException;
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
        MappingArea mappingArea = mappingAreaService.getById(floorDto.getMappingAreaId());

        if (floorRepository.existsByMappingAreaIdAndLevelAndDeletedFalse(
                floorDto.getMappingAreaId(), floorDto.getLevel())) {
            throw new FloorAlreadyExistsException(floorDto.getMappingAreaId(), floorDto.getLevel());
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

    public Floor getByFulcrumId(Long fulcrumId) {
        return floorRepository.findByFulcrumId(fulcrumId)
                .orElseThrow(() -> new FloorNotFoundException(
                        "Floor not found for fulcrum with id: " + fulcrumId));
    }

    @Transactional
    public Floor update(Long id, FloorUpdateDto floorUpdateDto) {
        Floor existingFloor = getById(id);

        if (floorUpdateDto.getLevel() != null && !existingFloor.getLevel().equals(floorUpdateDto.getLevel())) {
            if (floorRepository.existsByMappingAreaIdAndLevelAndDeletedFalse(
                    existingFloor.getMappingArea().getId(), floorUpdateDto.getLevel())) {
                throw new FloorAlreadyExistsException(existingFloor.getMappingArea().getId(), floorUpdateDto.getLevel());
            }
        }

        floorMapper.updateEntityFromUpdateDto(floorUpdateDto, existingFloor);
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
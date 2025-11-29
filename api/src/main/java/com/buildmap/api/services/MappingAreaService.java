package com.buildmap.api.services;

import com.buildmap.api.dto.mapping_area.MappingAreaSaveDto;
import com.buildmap.api.dto.mapping_area.MappingAreaUpdateDto;
import com.buildmap.api.dto.mapping_area.mappers.MappingAreaMapper;
import com.buildmap.api.entities.mapping_area.MappingArea;
import com.buildmap.api.exceptions.MappingAreaNotFoundException;
import com.buildmap.api.repos.MappingAreaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MappingAreaService {

    private final MappingAreaRepository mappingAreaRepository;
    private final MappingAreaMapper mappingAreaMapper;

    public MappingArea create(MappingArea mappingArea) {
        return mappingAreaRepository.save(mappingArea);
    }

    public MappingArea create(MappingAreaSaveDto mappingAreaDto) {
        MappingArea mappingArea = mappingAreaMapper.toEntity(mappingAreaDto);
        return mappingAreaRepository.save(mappingArea);
    }

    public List<MappingArea> getAll(Boolean deleted) {
        if (deleted == null) return mappingAreaRepository.findAll();
        return deleted ?
                mappingAreaRepository.findByDeletedTrue() :
                mappingAreaRepository.findByDeletedFalse();
    }

    public MappingArea getById(Long id) {
        return mappingAreaRepository.findById(id)
                .orElseThrow(() -> new MappingAreaNotFoundException(id));
    }

    public List<MappingArea> getByUserId(Long userId, Boolean deleted) {
        if (deleted == null) return mappingAreaRepository.findByUserId(userId);
        return deleted ?
                mappingAreaRepository.findByUserIdAndDeletedTrue(userId) :
                mappingAreaRepository.findByUserIdAndDeletedFalse(userId);
    }

    public MappingArea update(Long id, MappingAreaUpdateDto mappingAreaUpdateDto) {
        MappingArea existingArea = getById(id);
        mappingAreaMapper.updateEntityFromUpdateDto(mappingAreaUpdateDto, existingArea);
        return mappingAreaRepository.save(existingArea);
    }

    public void safeDelete(Long id) {
        MappingArea area = getById(id);
        area.setDeleted(true);
        mappingAreaRepository.save(area);
    }

    public void delete(Long id) {
        mappingAreaRepository.deleteById(id);
    }
}
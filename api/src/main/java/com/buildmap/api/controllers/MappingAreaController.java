package com.buildmap.api.controllers;

import com.buildmap.api.dto.mapping_area.MappingAreaDto;
import com.buildmap.api.dto.mapping_area.MappingAreaSaveDto;
import com.buildmap.api.dto.mapping_area.mappers.MappingAreaMapper;
import com.buildmap.api.entities.mapping_area.MappingArea;
import com.buildmap.api.services.MappingAreaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mapping-area")
@RequiredArgsConstructor
public class MappingAreaController {

    private final MappingAreaService mappingAreaService;

    private final MappingAreaMapper mappingAreaMapper;

    @PostMapping
    public ResponseEntity<MappingAreaDto> create(@Valid @RequestBody MappingAreaSaveDto mappingAreaDto) {
        MappingArea mappingArea = mappingAreaMapper.toEntity(mappingAreaDto);
        MappingArea created = mappingAreaService.create(mappingArea);
        return ResponseEntity.status(HttpStatus.CREATED).body(mappingAreaMapper.toDto(created));
    }

    @GetMapping
    public ResponseEntity<List<MappingAreaDto>> getAll(
            @RequestParam(name = "deleted", required = false) Boolean deleted) {
        List<MappingArea> mappingAreas = mappingAreaService.getAll(deleted);
        return ResponseEntity.ok(mappingAreaMapper.toDtoList(mappingAreas));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MappingAreaDto>> getByUser(
            @PathVariable Long userId,
            @RequestParam(name = "deleted", required = false) Boolean deleted) {
        List<MappingArea> mappingAreas = mappingAreaService.getByUserId(userId, deleted);
        return ResponseEntity.ok(mappingAreaMapper.toDtoList(mappingAreas));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MappingAreaDto> getById(@PathVariable Long id) {
        MappingArea mappingArea = mappingAreaService.getById(id);
        return ResponseEntity.ok(mappingAreaMapper.toDto(mappingArea));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MappingAreaDto> update(
            @PathVariable Long id,
            @Valid @RequestBody MappingAreaSaveDto mappingAreaDto) {
        MappingArea updated = mappingAreaService.update(id, mappingAreaDto);
        return ResponseEntity.ok(mappingAreaMapper.toDto(updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> safeDelete(@PathVariable Long id) {
        mappingAreaService.safeDelete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/force/{id}")
    public ResponseEntity<Void> forceDelete(@PathVariable Long id) {
        mappingAreaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
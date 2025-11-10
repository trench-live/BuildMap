package com.buildmap.api.controllers;

import com.buildmap.api.dto.floor.FloorDto;
import com.buildmap.api.dto.floor.FloorSaveDto;
import com.buildmap.api.dto.floor.FloorUpdateDto;
import com.buildmap.api.dto.floor.mappers.FloorMapper;
import com.buildmap.api.entities.mapping_area.Floor;
import com.buildmap.api.services.FloorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/floor")
@RequiredArgsConstructor
public class FloorController {

    private final FloorService floorService;
    private final FloorMapper floorMapper;

    @PostMapping
    public ResponseEntity<FloorDto> create(@Valid @RequestBody FloorSaveDto floorDto) {
        Floor created = floorService.create(floorDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(floorMapper.toDto(created));
    }

    @GetMapping("/area/{areaId}")
    public ResponseEntity<List<FloorDto>> getByAreaId(
            @PathVariable Long areaId,
            @RequestParam(name = "deleted", required = false) Boolean deleted) {
        List<Floor> floors = floorService.getAllByMappingAreaId(areaId, deleted);
        return ResponseEntity.ok(floorMapper.toDtoList(floors));
    }

    @GetMapping("/{floorId}")
    public ResponseEntity<FloorDto> getById(@PathVariable Long floorId) {
        Floor floor = floorService.getById(floorId);
        return ResponseEntity.ok(floorMapper.toDto(floor));
    }

    @PutMapping("/{floorId}")
    public ResponseEntity<FloorDto> update(
            @PathVariable Long floorId,
            @Valid @RequestBody FloorUpdateDto floorUpdateDto) {
        Floor updated = floorService.update(floorId, floorUpdateDto);
        return ResponseEntity.ok(floorMapper.toDto(updated));
    }

    @DeleteMapping("/{floorId}")
    public ResponseEntity<Void> safeDelete(@PathVariable Long floorId) {
        floorService.safeDelete(floorId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/force/{floorId}")
    public ResponseEntity<Void> forceDelete(@PathVariable Long floorId) {
        floorService.delete(floorId);
        return ResponseEntity.noContent().build();
    }
}
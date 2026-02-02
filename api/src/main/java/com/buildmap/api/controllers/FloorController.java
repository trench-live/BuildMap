package com.buildmap.api.controllers;

import com.buildmap.api.dto.floor.FloorDto;
import com.buildmap.api.dto.floor.FloorSaveDto;
import com.buildmap.api.dto.floor.FloorUpdateDto;
import com.buildmap.api.dto.floor.mappers.FloorMapper;
import com.buildmap.api.entities.mapping_area.Floor;
import com.buildmap.api.entities.user.User;
import com.buildmap.api.services.AuthorizationService;
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
    private final AuthorizationService authorizationService;

    @PostMapping
    public ResponseEntity<FloorDto> create(@Valid @RequestBody FloorSaveDto floorDto) {
        User currentUser = authorizationService.getCurrentUser();
        authorizationService.requireAreaOwnerOrAdmin(currentUser, floorDto.getMappingAreaId());
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

    @GetMapping("/fulcrum/{fulcrumId}")
    public ResponseEntity<FloorDto> getByFulcrumId(@PathVariable Long fulcrumId) {
        Floor floor = floorService.getByFulcrumId(fulcrumId);
        return ResponseEntity.ok(floorMapper.toDto(floor));
    }

    @GetMapping("/{floorId}")
    public ResponseEntity<FloorDto> getById(@PathVariable Long floorId) {
        User currentUser = authorizationService.getCurrentUser();
        authorizationService.requireFloorOwnerOrAdmin(currentUser, floorId);
        Floor floor = floorService.getById(floorId);
        return ResponseEntity.ok(floorMapper.toDto(floor));
    }

    @PutMapping("/{floorId}")
    public ResponseEntity<FloorDto> update(
            @PathVariable Long floorId,
            @Valid @RequestBody FloorUpdateDto floorUpdateDto) {
        User currentUser = authorizationService.getCurrentUser();
        authorizationService.requireFloorOwnerOrAdmin(currentUser, floorId);
        Floor updated = floorService.update(floorId, floorUpdateDto);
        return ResponseEntity.ok(floorMapper.toDto(updated));
    }

    @DeleteMapping("/{floorId}")
    public ResponseEntity<Void> safeDelete(@PathVariable Long floorId) {
        User currentUser = authorizationService.getCurrentUser();
        authorizationService.requireFloorOwnerOrAdmin(currentUser, floorId);
        floorService.safeDelete(floorId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/force/{floorId}")
    public ResponseEntity<Void> forceDelete(@PathVariable Long floorId) {
        User currentUser = authorizationService.getCurrentUser();
        authorizationService.requireAdmin(currentUser);
        floorService.delete(floorId);
        return ResponseEntity.noContent().build();
    }
}

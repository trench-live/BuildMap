package com.buildmap.api.controllers;

import com.buildmap.api.dto.fulcrum.FulcrumDto;
import com.buildmap.api.dto.fulcrum.FulcrumSaveDto;
import com.buildmap.api.dto.fulcrum.connections.FulcrumConnectionSaveDto;
import com.buildmap.api.dto.fulcrum.mappers.FulcrumMapper;
import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import com.buildmap.api.services.FulcrumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mapping-area/{areaId}/fulcrum")
@RequiredArgsConstructor
public class FulcrumController {

    private final FulcrumService fulcrumService;
    private final FulcrumMapper fulcrumMapper;

    @PostMapping
    public ResponseEntity<FulcrumDto> create(
            @PathVariable Long areaId,
            @Valid @RequestBody FulcrumSaveDto fulcrumDto) {
        Fulcrum created = fulcrumService.create(fulcrumDto, areaId);
        return ResponseEntity.status(HttpStatus.CREATED).body(fulcrumMapper.toDto(created));
    }

    @GetMapping
    public ResponseEntity<List<FulcrumDto>> getAll(
            @PathVariable Long areaId,
            @RequestParam(name = "deleted", required = false) Boolean deleted) {
        List<Fulcrum> fulcrums = fulcrumService.getAllByAreaId(areaId, deleted);
        return ResponseEntity.ok(fulcrumMapper.toDtoList(fulcrums));
    }

    @GetMapping("/{fulcrumId}")
    public ResponseEntity<FulcrumDto> getById(
            @PathVariable Long areaId,
            @PathVariable Long fulcrumId) {
        Fulcrum fulcrum = fulcrumService.getById(fulcrumId);
        // Проверяем принадлежность к зоне
        if (!fulcrum.getMappingArea().getId().equals(areaId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(fulcrumMapper.toDto(fulcrum));
    }

    @PutMapping("/{fulcrumId}")
    public ResponseEntity<FulcrumDto> update(
            @PathVariable Long areaId,
            @PathVariable Long fulcrumId,
            @Valid @RequestBody FulcrumSaveDto fulcrumDto) {
        Fulcrum updated = fulcrumService.update(fulcrumId, fulcrumDto);
        return ResponseEntity.ok(fulcrumMapper.toDto(updated));
    }

    @DeleteMapping("/{fulcrumId}")
    public ResponseEntity<Void> safeDelete(
            @PathVariable Long areaId,
            @PathVariable Long fulcrumId) {
        fulcrumService.safeDelete(fulcrumId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/force/{fulcrumId}")
    public ResponseEntity<Void> forceDelete(
            @PathVariable Long areaId,
            @PathVariable Long fulcrumId) {
        fulcrumService.delete(fulcrumId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("{fulcrumId}/connection")
    public ResponseEntity<Void> addConnection(
            @PathVariable String areaId,
            @PathVariable Long fulcrumId,
            @RequestBody @Valid FulcrumConnectionSaveDto connectionDto) {
        fulcrumService.addConnection(fulcrumId, connectionDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("{fulcrumId}/connection/{connectedFulcrumId}")
    public ResponseEntity<Void> removeConnection(
            @PathVariable String areaId,
            @PathVariable Long fulcrumId,
            @PathVariable Long connectedFulcrumId) {
        fulcrumService.removeConnection(fulcrumId, connectedFulcrumId);
        return ResponseEntity.noContent().build();
    }
}
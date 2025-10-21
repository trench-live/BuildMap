package com.buildmap.api.controllers;

import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import com.buildmap.api.services.FulcrumService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mapping-area/{areaId}/fulcrums")
@RequiredArgsConstructor
public class FulcrumController {

    private final FulcrumService fulcrumService;

    @GetMapping
    public ResponseEntity<List<Fulcrum>> getAll(
            @PathVariable Long areaId,
            @RequestParam(name = "includeDeleted", required = false) Boolean includeDeleted) {
        return ResponseEntity.ok(fulcrumService.getAllByAreaId(areaId, includeDeleted));
    }

    @GetMapping("/{fulcrumId}")
    public ResponseEntity<Fulcrum> getById(
            @PathVariable Long areaId,
            @PathVariable Long fulcrumId) {
        Fulcrum fulcrum = fulcrumService.getById(fulcrumId);
        // Проверяем принадлежность к зоне
        if (!fulcrum.getMappingArea().getId().equals(areaId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(fulcrum);
    }

    @PostMapping
    public ResponseEntity<Fulcrum> create(
            @PathVariable Long areaId,
            @Valid @RequestBody Fulcrum fulcrum) {
        return ResponseEntity.ok(fulcrumService.create(fulcrum));
    }

    @PutMapping("/{fulcrumId}")
    public ResponseEntity<Fulcrum> update(
            @PathVariable Long areaId,
            @PathVariable Long fulcrumId,
            @Valid @RequestBody Fulcrum fulcrum) {
        Fulcrum updated = fulcrumService.update(fulcrumId, fulcrum);
        return ResponseEntity.ok(updated);
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
}
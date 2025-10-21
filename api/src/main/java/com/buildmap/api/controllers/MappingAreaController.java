package com.buildmap.api.controllers;

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

    @PostMapping
    public ResponseEntity<MappingArea> create(@Valid @RequestBody MappingArea mappingArea) {
        MappingArea created = mappingAreaService.create(mappingArea);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<MappingArea>> getAll(
            @RequestParam(name = "deleted", required = false) Boolean deleted) {
        List<MappingArea> mappingAreas = mappingAreaService.getAll(deleted);
        return ResponseEntity.ok(mappingAreas);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MappingArea>> getByUser(
            @PathVariable Long userId,
            @RequestParam(name = "deleted", required = false) Boolean deleted) {
        return ResponseEntity.ok(mappingAreaService.getByUserId(userId, deleted));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MappingArea> getById(@PathVariable Long id) {
        return ResponseEntity.ok(mappingAreaService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MappingArea> update(
            @PathVariable Long id,
            @Valid @RequestBody MappingArea mappingArea) {
        return ResponseEntity.ok(mappingAreaService.update(id, mappingArea));
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
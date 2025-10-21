package com.buildmap.api.controllers;

import com.buildmap.api.dto.path.PathResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/mapping-area/{areaId}/navigation")
public class NavigationController {

    @GetMapping("/path")
    public ResponseEntity<PathResponse> findPath(
            @PathVariable Long areaId,
            @RequestParam Long from,
            @RequestParam Long to) {

        // Простая заглушка без логики
        return ResponseEntity.ok(PathResponse.createStub(from, to));
    }
}
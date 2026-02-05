package com.buildmap.api.controllers;

import com.buildmap.api.dto.route.RouteDto;
import com.buildmap.api.dto.route.RouteRequestDto;
import com.buildmap.api.services.navigation.NavigationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/navigation") // Упрощаем путь
@RequiredArgsConstructor
public class NavigationController {

    private final NavigationService navigationService;

    @PostMapping("/path")
    public ResponseEntity<RouteDto> findShortestPath(@Valid @RequestBody RouteRequestDto request) {
        RouteDto routeDto = navigationService.findShortestPath(request);
        return ResponseEntity.ok(routeDto);
    }

    // Endpoint для отладки
    @GetMapping("/debug/graph/{areaId}")
    public ResponseEntity<String> debugGraph(@PathVariable Long areaId) {
        navigationService.testGraphBuilding(areaId);
        return ResponseEntity.ok("Graph debug completed. Check console logs.");
    }
}
package com.buildmap.api.controllers;

import com.buildmap.api.dto.fulcrum.FulcrumDto;
import com.buildmap.api.dto.fulcrum.FulcrumSaveDto;
import com.buildmap.api.dto.fulcrum.connections.FulcrumConnectionSaveDto;
import com.buildmap.api.dto.fulcrum.mappers.FulcrumMapper;
import com.buildmap.api.entities.mapping_area.Floor;
import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import com.buildmap.api.services.FloorService;
import com.buildmap.api.services.FulcrumService;
import com.buildmap.api.services.QrPdfService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/fulcrum")
@RequiredArgsConstructor
public class FulcrumController {

    private final FulcrumService fulcrumService;
    private final FulcrumMapper fulcrumMapper;
    private final FloorService floorService;
    private final QrPdfService qrPdfService;

    @PostMapping
    public ResponseEntity<FulcrumDto> create(@Valid @RequestBody FulcrumSaveDto fulcrumDto) {
        // Проверяем существование этажа
        Floor floor = floorService.getById(fulcrumDto.getFloorId());

        Fulcrum created = fulcrumService.create(fulcrumDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(fulcrumMapper.toDto(created));
    }

    @GetMapping("/floor/{floorId}") // Точки конкретного этажа
    public ResponseEntity<List<FulcrumDto>> getByFloorId(
            @PathVariable Long floorId,
            @RequestParam(name = "deleted", required = false) Boolean deleted) {
        List<Fulcrum> fulcrums = fulcrumService.getAllByFloorId(floorId, deleted);
        return ResponseEntity.ok(fulcrumMapper.toDtoList(fulcrums));
    }

    @GetMapping("/area/{areaId}") // Все точки зоны (всех этажей)
    public ResponseEntity<List<FulcrumDto>> getByAreaId(
            @PathVariable Long areaId,
            @RequestParam(name = "deleted", required = false) Boolean deleted) {
        List<Fulcrum> fulcrums = fulcrumService.getAllByAreaId(areaId, deleted);
        return ResponseEntity.ok(fulcrumMapper.toDtoList(fulcrums));
    }

    @GetMapping("/area/{areaId}/qr.pdf")
    public ResponseEntity<byte[]> getAreaQrPdf(
            @PathVariable Long areaId,
            @RequestParam(name = "sizeMm", defaultValue = "140") int sizeMm) {
        List<Fulcrum> fulcrums = fulcrumService.getAllByAreaId(areaId, false)
                .stream()
                .filter(fulcrum -> !fulcrum.isDeleted())
                .filter(Fulcrum::isHasQr)
                .collect(Collectors.toList());

        if (fulcrums.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        byte[] pdf = qrPdfService.buildQrPdf(fulcrums, sizeMm);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=area-" + areaId + "-qr.pdf");
        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    @GetMapping("/{fulcrumId}")
    public ResponseEntity<FulcrumDto> getById(@PathVariable Long fulcrumId) {
        Fulcrum fulcrum = fulcrumService.getById(fulcrumId);
        return ResponseEntity.ok(fulcrumMapper.toDto(fulcrum));
    }

    @PutMapping("/{fulcrumId}")
    public ResponseEntity<FulcrumDto> update(
            @PathVariable Long fulcrumId,
            @Valid @RequestBody FulcrumSaveDto fulcrumDto) {
        Fulcrum updated = fulcrumService.update(fulcrumId, fulcrumDto);
        return ResponseEntity.ok(fulcrumMapper.toDto(updated));
    }

    @DeleteMapping("/{fulcrumId}")
    public ResponseEntity<Void> safeDelete(@PathVariable Long fulcrumId) {
        fulcrumService.safeDelete(fulcrumId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/force/{fulcrumId}")
    public ResponseEntity<Void> forceDelete(@PathVariable Long fulcrumId) {
        fulcrumService.delete(fulcrumId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{fulcrumId}/connection")
    public ResponseEntity<Void> addConnection(
            @PathVariable Long fulcrumId,
            @RequestBody @Valid FulcrumConnectionSaveDto connectionDto) {
        fulcrumService.addConnection(fulcrumId, connectionDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{fulcrumId}/connection/{connectedFulcrumId}")
    public ResponseEntity<Void> removeConnection(
            @PathVariable Long fulcrumId,
            @PathVariable Long connectedFulcrumId) {
        fulcrumService.removeConnection(fulcrumId, connectedFulcrumId);
        return ResponseEntity.noContent().build();
    }
}

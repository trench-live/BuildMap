package com.buildmap.api.services;

import com.buildmap.api.dto.fulcrum.FulcrumSaveDto;
import com.buildmap.api.dto.fulcrum.connections.FulcrumConnectionSaveDto;
import com.buildmap.api.dto.fulcrum.mappers.FulcrumMapper;
import com.buildmap.api.entities.mapping_area.Floor;
import com.buildmap.api.entities.mapping_area.MappingArea;
import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import com.buildmap.api.entities.mapping_area.fulcrum.FulcrumConnection;
import com.buildmap.api.exceptions.ConnectionAlreadyExistsException;
import com.buildmap.api.exceptions.FulcrumNotFoundException;
import com.buildmap.api.exceptions.ValidationException;
import com.buildmap.api.repos.FulcrumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FulcrumService {

    private final FulcrumRepository fulcrumRepository;
    private final FulcrumMapper fulcrumMapper;
    private final FloorService floorService;

    @Transactional
    public Fulcrum create(FulcrumSaveDto fulcrumDto) {
        validateQrSettings(fulcrumDto);
        floorService.getById(fulcrumDto.getFloorId());

        Fulcrum fulcrum = fulcrumMapper.toEntity(fulcrumDto);
        return fulcrumRepository.save(fulcrum);
    }

    public List<Fulcrum> getAllByAreaId(Long areaId, Boolean deleted) {
        if (deleted == null) return fulcrumRepository.findByFloorMappingAreaId(areaId);
        return deleted ?
                fulcrumRepository.findByFloorMappingAreaIdAndDeletedTrue(areaId) :
                fulcrumRepository.findByFloorMappingAreaIdAndDeletedFalse(areaId);
    }

    public List<Fulcrum> getAllByFloorId(Long floorId, Boolean deleted) {
        if (deleted == null) return fulcrumRepository.findByFloorId(floorId);
        return deleted ?
                fulcrumRepository.findByFloorIdAndDeletedTrue(floorId) :
                fulcrumRepository.findByFloorIdAndDeletedFalse(floorId);
    }

    public List<Long> getAreaIdsWithQr(List<Long> areaIds) {
        if (areaIds == null || areaIds.isEmpty()) {
            return Collections.emptyList();
        }
        return fulcrumRepository.findAreaIdsWithActiveQrFulcrums(areaIds);
    }

    public Fulcrum getById(Long id) {
        return fulcrumRepository.findById(id)
                .orElseThrow(() -> new FulcrumNotFoundException(id));
    }

    @Transactional
    public Fulcrum update(Long id, FulcrumSaveDto fulcrumDto) {
        validateQrSettings(fulcrumDto);
        floorService.getById(fulcrumDto.getFloorId());
        Fulcrum existingFulcrum = getById(id);
        fulcrumMapper.updateEntity(fulcrumDto, existingFulcrum);
        return fulcrumRepository.save(existingFulcrum);
    }

    @Transactional
    public void safeDelete(Long id) {
        Fulcrum fulcrum = getById(id);
        fulcrum.setDeleted(true);
        fulcrumRepository.save(fulcrum);
    }

    @Transactional
    public void delete(Long id) {
        fulcrumRepository.deleteById(id);
    }

    @Transactional
    public void addConnection(Long fulcrumId, FulcrumConnectionSaveDto connectionDto) {
        Fulcrum fulcrum = getById(fulcrumId);
        Fulcrum connectedFulcrum = getById(connectionDto.getConnectedFulcrumId());
        ensureSameMappingArea(fulcrum, connectedFulcrum);

        boolean connectionExists = fulcrum.getConnections().stream()
                .anyMatch(conn -> conn.getConnectedFulcrum().getId().equals(connectedFulcrum.getId()));

        if (connectionExists) {
            throw new ConnectionAlreadyExistsException(fulcrumId, connectedFulcrum.getId());
        }

        fulcrum.addConnection(connectedFulcrum, connectionDto.getWeight());
        fulcrumRepository.save(fulcrum);
    }

    @Transactional
    public void removeConnection(Long fulcrumId, Long connectedFulcrumId) {
        Fulcrum fulcrum = getById(fulcrumId);
        Fulcrum connectedFulcrum = getById(connectedFulcrumId);
        ensureSameMappingArea(fulcrum, connectedFulcrum);

        fulcrum.removeConnection(connectedFulcrum);
        fulcrumRepository.save(fulcrum);
    }

    @Transactional
    public void removeAllConnections(Long fulcrumId) {
        Fulcrum fulcrum = getById(fulcrumId);
        fulcrum.getConnections().clear();
        fulcrumRepository.save(fulcrum);
    }

    private void validateQrSettings(FulcrumSaveDto fulcrumDto) {
        if (Boolean.TRUE.equals(fulcrumDto.getHasQr()) && fulcrumDto.getFacingDirection() == null) {
            throw new IllegalArgumentException("Facing direction is required when QR is enabled");
        }
    }

    private void ensureSameMappingArea(Fulcrum left, Fulcrum right) {
        MappingArea leftArea = left != null ? left.getMappingArea() : null;
        MappingArea rightArea = right != null ? right.getMappingArea() : null;
        if (leftArea == null || rightArea == null || !leftArea.getId().equals(rightArea.getId())) {
            throw new ValidationException("Fulcrums must belong to the same mapping area");
        }
    }

}

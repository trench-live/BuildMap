package com.buildmap.api.services;

import com.buildmap.api.dto.fulcrum.FulcrumSaveDto;
import com.buildmap.api.dto.fulcrum.connections.FulcrumConnectionSaveDto;
import com.buildmap.api.dto.fulcrum.mappers.FulcrumMapper;
import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import com.buildmap.api.exceptions.FulcrumNotFoundException;
import com.buildmap.api.repos.FulcrumRepository;
import com.buildmap.api.repos.MappingAreaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FulcrumService {

    private final FulcrumRepository fulcrumRepository;
    private final FulcrumMapper fulcrumMapper;
    private final MappingAreaService mappingAreaService;

    @Deprecated
    public Fulcrum create(Fulcrum fulcrum) {
        return fulcrumRepository.save(fulcrum);
    }

    public Fulcrum create(FulcrumSaveDto fulcrumDto, Long areaId) {
        Fulcrum fulcrum = fulcrumMapper.toEntity(fulcrumDto, areaId);
        return fulcrumRepository.save(fulcrum);
    }

    public List<Fulcrum> getAllByAreaId(Long areaId, Boolean deleted) {
        if (deleted == null)
            return fulcrumRepository.findByMappingAreaId(areaId);

        return deleted ?
                fulcrumRepository.findByMappingAreaIdAndDeletedTrue(areaId) :
                fulcrumRepository.findByMappingAreaIdAndDeletedFalse(areaId);
    }

    public Fulcrum getById(Long id) {
        return fulcrumRepository.findById(id)
                .orElseThrow(() -> new FulcrumNotFoundException(id));
    }

    @Deprecated
    public Fulcrum update(Long id, Fulcrum fulcrum) {
        if (!fulcrumRepository.existsById(id)) {
            throw new FulcrumNotFoundException(id);
        }
        fulcrum.setId(id);
        return fulcrumRepository.save(fulcrum);
    }

    public Fulcrum update(Long id, FulcrumSaveDto fulcrumDto) {
        Fulcrum existingFulcrum = getById(id);
        fulcrumMapper.updateEntity(fulcrumDto, existingFulcrum);
        return fulcrumRepository.save(existingFulcrum);
    }

    public void safeDelete(Long id) {
        Fulcrum fulcrum = getById(id);
        fulcrum.setDeleted(true);
        fulcrumRepository.save(fulcrum);
    }

    public void delete(Long id) {
        if (!fulcrumRepository.existsById(id)) {
            throw new FulcrumNotFoundException(id);
        }
        fulcrumRepository.deleteById(id);
    }

    public void addConnection(Long fulcrumId, FulcrumConnectionSaveDto connectionDto) {
        Fulcrum fulcrum = getById(fulcrumId);
        Fulcrum connectedFulcrum = getById(connectionDto.getConnectedFulcrumId());

        fulcrum.addConnection(connectedFulcrum, connectionDto.getWeight());
        fulcrumRepository.save(fulcrum);
    }

    public void removeConnection(Long fulcrumId, Long connectedFulcrumId) {
        Fulcrum fulcrum = getById(fulcrumId);
        Fulcrum connectedFulcrum = getById(connectedFulcrumId);

        fulcrum.removeConnection(connectedFulcrum);
        fulcrumRepository.save(fulcrum);
    }
}
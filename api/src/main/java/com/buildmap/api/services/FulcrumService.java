package com.buildmap.api.services;

import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import com.buildmap.api.exceptions.FulcrumNotFoundException;
import com.buildmap.api.repos.FulcrumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FulcrumService {

    private final FulcrumRepository fulcrumRepository;

    public Fulcrum create(Fulcrum fulcrum) {
        return fulcrumRepository.save(fulcrum);
    }

    public List<Fulcrum> getAllByAreaId(Long areaId, Boolean includeDeleted) {
        if (includeDeleted == null)
            return fulcrumRepository.findByMappingAreaId(areaId);

        return includeDeleted ?
                fulcrumRepository.findByMappingAreaIdAndDeletedTrue(areaId) :
                fulcrumRepository.findByMappingAreaIdAndDeletedFalse(areaId);
    }

    public Fulcrum getById(Long id) {
        return fulcrumRepository.findById(id)
                .orElseThrow(() -> new FulcrumNotFoundException(id));
    }

    public Fulcrum update(Long id, Fulcrum fulcrum) {
        if (!fulcrumRepository.existsById(id)) {
            throw new FulcrumNotFoundException(id);
        }
        fulcrum.setId(id);
        return fulcrumRepository.save(fulcrum);
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
}
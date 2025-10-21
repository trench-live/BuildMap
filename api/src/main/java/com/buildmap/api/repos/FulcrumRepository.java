package com.buildmap.api.repos;

import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FulcrumRepository extends JpaRepository<Fulcrum, Long> {
    List<Fulcrum> findByMappingAreaId(Long mappingAreaId);
    List<Fulcrum> findByMappingAreaIdAndDeletedTrue(Long mappingAreaId);
    List<Fulcrum> findByMappingAreaIdAndDeletedFalse(Long mappingAreaId);
}
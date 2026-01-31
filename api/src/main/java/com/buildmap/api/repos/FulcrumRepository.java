package com.buildmap.api.repos;

import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FulcrumRepository extends JpaRepository<Fulcrum, Long> {

    // Заменяем mappingAreaId на floor.mappingArea.id
    List<Fulcrum> findByFloorMappingAreaId(Long mappingAreaId);
    List<Fulcrum> findByFloorMappingAreaIdAndDeletedTrue(Long mappingAreaId);
    List<Fulcrum> findByFloorMappingAreaIdAndDeletedFalse(Long mappingAreaId);

    List<Fulcrum> findByFloorId(Long floorId);
    List<Fulcrum> findByFloorIdAndDeletedTrue(Long floorId);
    List<Fulcrum> findByFloorIdAndDeletedFalse(Long floorId);
}
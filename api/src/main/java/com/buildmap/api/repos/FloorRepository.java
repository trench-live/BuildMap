package com.buildmap.api.repos;

import com.buildmap.api.entities.mapping_area.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FloorRepository extends JpaRepository<Floor, Long> {

    List<Floor> findByMappingAreaId(Long mappingAreaId);
    List<Floor> findByMappingAreaIdAndDeletedTrue(Long mappingAreaId);
    List<Floor> findByMappingAreaIdAndDeletedFalse(Long mappingAreaId);

    @Query("SELECT f FROM Floor f JOIN f.fulcrums ful WHERE ful.id = :fulcrumId")
    Optional<Floor> findByFulcrumId(@Param("fulcrumId") Long fulcrumId);

    boolean existsByMappingAreaIdAndLevelAndDeletedFalse(Long mappingAreaId, Integer level);
}
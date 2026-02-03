package com.buildmap.api.repos;

import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    boolean existsByIdAndFloorMappingAreaUsersId(Long id, Long userId);

    @Query("""
            SELECT COUNT(f) FROM Fulcrum f
            WHERE f.deleted = false
            AND f.floor.deleted = false
            AND f.floor.mappingArea.deleted = false
            """)
    long countActiveInActiveAreas();

    @Query("""
            SELECT COUNT(f) FROM Fulcrum f
            JOIN f.floor fl
            JOIN fl.mappingArea ma
            JOIN ma.users u
            WHERE u.id = :userId
            AND ma.deleted = false
            AND fl.deleted = false
            AND f.deleted = false
            """)
    long countActiveByUserIdInActiveAreas(@Param("userId") Long userId);
}

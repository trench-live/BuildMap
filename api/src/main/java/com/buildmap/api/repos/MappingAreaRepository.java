package com.buildmap.api.repos;

import com.buildmap.api.entities.mapping_area.MappingArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MappingAreaRepository extends JpaRepository<MappingArea, Long> {
    // Новые методы с @Query
    @Query("SELECT ma FROM MappingArea ma JOIN ma.users u WHERE u.id = :userId")
    List<MappingArea> findByUserId(@Param("userId") Long userId);

    @Query("SELECT ma FROM MappingArea ma JOIN ma.users u WHERE u.id = :userId AND ma.deleted = true")
    List<MappingArea> findByUserIdAndDeletedTrue(@Param("userId") Long userId);

    @Query("SELECT ma FROM MappingArea ma JOIN ma.users u WHERE u.id = :userId AND ma.deleted = false")
    List<MappingArea> findByUserIdAndDeletedFalse(@Param("userId") Long userId);

    // Оставляем существующие методы
    List<MappingArea> findByDeletedTrue();
    List<MappingArea> findByDeletedFalse();
}
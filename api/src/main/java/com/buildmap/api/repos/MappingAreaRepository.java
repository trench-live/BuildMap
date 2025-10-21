package com.buildmap.api.repos;

import com.buildmap.api.entities.mapping_area.MappingArea;
import com.buildmap.api.entities.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MappingAreaRepository extends JpaRepository<MappingArea, Long> {
    List<MappingArea> findByDeletedTrue();
    List<MappingArea> findByDeletedFalse();
    List<MappingArea> findByUserIdAndDeletedFalse(Long userId);
    List<MappingArea> findByUserIdAndDeletedTrue(Long userId);
    List<MappingArea> findByUserId(Long userId);
}
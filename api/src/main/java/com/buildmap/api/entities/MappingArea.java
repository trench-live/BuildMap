package com.buildmap.api.entities;

import com.buildmap.api.entities.user.User;
import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "mapping_areas")
public class MappingArea {
    @Id
    private long id;
    private String name;
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;
}

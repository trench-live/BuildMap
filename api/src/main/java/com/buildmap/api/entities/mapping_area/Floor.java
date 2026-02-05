package com.buildmap.api.entities.mapping_area;

import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "floors")
public class Floor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Floor name cannot be empty")
    @Size(max = 50, message = "Floor name must be less than 50 characters")
    @Column(nullable = false)
    private String name;

    @NotNull(message = "Floor level cannot be null")
    @Column(nullable = false)
    private Integer level;

    @Size(max = 200, message = "Description must be less than 200 characters")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String svgPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mapping_area_id", nullable = false)
    private MappingArea mappingArea;

    @OneToMany(mappedBy = "floor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Fulcrum> fulcrums = new ArrayList<>();

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    public void addFulcrum(Fulcrum fulcrum) {
        fulcrums.add(fulcrum);
        fulcrum.setFloor(this);
    }

    public void removeFulcrum(Fulcrum fulcrum) {
        fulcrums.remove(fulcrum);
        fulcrum.setFloor(null);
    }
}
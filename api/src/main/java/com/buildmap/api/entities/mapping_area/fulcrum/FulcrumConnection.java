package com.buildmap.api.entities.mapping_area.fulcrum;

import jakarta.persistence.*;
import lombok.Data;

@Embeddable
@Data
public class FulcrumConnection {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "connected_fulcrum_id",
            foreignKey = @ForeignKey(
                    name = "fk_connection_connected_fulcrum",
                    foreignKeyDefinition = "FOREIGN KEY (connected_fulcrum_id) REFERENCES fulcrums(id) ON DELETE CASCADE"
            )
    )
    private Fulcrum connectedFulcrum;

    @Column(name = "distance_meters", nullable = false)
    private Double distanceMeters = 1.0;

    @Column(name = "difficulty_factor", nullable = false)
    private Double difficultyFactor = 1.0;

    public Double getCost() {
        if (distanceMeters == null || difficultyFactor == null) {
            return null;
        }
        return distanceMeters * difficultyFactor;
    }
}

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

    @Column(name = "connection_weight")
    private Double weight = 1.0;
}
package com.buildmap.api.entities.mapping_area.fulcrum;

import com.buildmap.api.entities.mapping_area.Floor;
import com.buildmap.api.entities.mapping_area.MappingArea;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "fulcrums")
public class Fulcrum {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Fulcrum name cannot be empty")
    @Size(max = 50, message = "Fulcrum name must be less than 50 characters")
    @Column(nullable = false)
    private String name;

    @Size(max = 200, message = "Description must be less than 200 characters")
    private String description;

    @Column(nullable = false)
    private Double x;

    @Column(nullable = false)
    private Double y;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FulcrumType type;

    @Enumerated(EnumType.STRING)
    private FacingDirection facingDirection;

    @Column(unique = true)
    private String qrCodeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "floor_id", nullable = false)
    private Floor floor;

    @ElementCollection
    @CollectionTable(
            name = "fulcrum_connections",
            joinColumns = @JoinColumn(name = "fulcrum_id")
    )
    private List<FulcrumConnection> connections = new ArrayList<>();

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    public MappingArea getMappingArea() {
        return floor != null ? floor.getMappingArea() : null;
    }

    public Integer getLevel() {
        return floor != null ? floor.getLevel() : null;
    }

    public void addConnection(Fulcrum connectedFulcrum, Double weight) {
        FulcrumConnection connection = new FulcrumConnection();
        connection.setConnectedFulcrum(connectedFulcrum);
        connection.setWeight(weight != null ? weight : 1.0);
        this.connections.add(connection);
    }

    public void removeConnection(Fulcrum connectedFulcrum) {
        connections.removeIf(conn ->
                conn.getConnectedFulcrum().getId().equals(connectedFulcrum.getId()));
    }

    public Double getConnectionWeight(Fulcrum connectedFulcrum) {
        return connections.stream()
                .filter(conn -> conn.getConnectedFulcrum().getId().equals(connectedFulcrum.getId()))
                .findFirst()
                .map(FulcrumConnection::getWeight)
                .orElse(null);
    }
}

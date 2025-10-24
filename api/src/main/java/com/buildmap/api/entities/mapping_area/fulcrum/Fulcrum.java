package com.buildmap.api.entities.mapping_area.fulcrum;

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

    // Coordinates
    @Column(nullable = false)
    private Double X;

    @Column(nullable = false)
    private Double Y;

    @Column(nullable = false)
    private Double Z;

    // Тип точки (лестница, лифт, комната, холл и т.д.)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FulcrumType type;

    // Уникальный идентификатор для QR-кода
    @Column(unique = true)
    private String qrCodeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mapping_area_id", nullable = false)
    private MappingArea mappingArea;

    @ElementCollection
    @CollectionTable(
            name = "fulcrum_connections",
            joinColumns = @JoinColumn(name = "fulcrum_id")
    )
    private List<FulcrumConnection> connections = new ArrayList<>();

    // Веса соединений (расстояния или время перемещения)
    @ElementCollection
    @CollectionTable(name = "connection_weights", joinColumns = @JoinColumn(name = "fulcrum_id"))
    @Column(name = "weight")
    private List<Double> connectionWeights = new ArrayList<>();

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    // Методы для управления соединениями
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
}
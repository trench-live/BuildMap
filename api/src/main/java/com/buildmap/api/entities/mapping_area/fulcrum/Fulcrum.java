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

    // Координаты точки в системе координат здания
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

    // Связи с другими точками (ребра графа)
    @ManyToMany
    @JoinTable(
            name = "fulcrum_connections",
            joinColumns = @JoinColumn(name = "fulcrum_id"),
            inverseJoinColumns = @JoinColumn(name = "connected_fulcrum_id")
    )
    private List<Fulcrum> connectedFulcrums = new ArrayList<>();

    // Веса соединений (расстояния или время перемещения)
    @ElementCollection
    @CollectionTable(name = "connection_weights", joinColumns = @JoinColumn(name = "fulcrum_id"))
    @Column(name = "weight")
    private List<Double> connectionWeights = new ArrayList<>();

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    // Методы для управления соединениями
    public void addConnection(Fulcrum connectedFulcrum, Double weight) {
        this.connectedFulcrums.add(connectedFulcrum);
        this.connectionWeights.add(weight);
        connectedFulcrum.getConnectedFulcrums().add(this);
        connectedFulcrum.getConnectionWeights().add(weight);
    }

    public void removeConnection(Fulcrum connectedFulcrum) {
        int index = this.connectedFulcrums.indexOf(connectedFulcrum);
        if (index != -1) {
            this.connectedFulcrums.remove(index);
            this.connectionWeights.remove(index);

            int otherIndex = connectedFulcrum.getConnectedFulcrums().indexOf(this);
            if (otherIndex != -1) {
                connectedFulcrum.getConnectedFulcrums().remove(otherIndex);
                connectedFulcrum.getConnectionWeights().remove(otherIndex);
            }
        }
    }
}
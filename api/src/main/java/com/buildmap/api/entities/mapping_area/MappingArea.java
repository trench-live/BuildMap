package com.buildmap.api.entities.mapping_area;

import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import com.buildmap.api.entities.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "mapping_areas")
public class MappingArea {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Area name cannot be empty")
    @Size(max = 100, message = "Area name must be less than 100 characters")
    @Column(nullable = false)
    private String name;

    @Size(max = 500, message = "Description must be less than 500 characters")
    private String description;

    private String image; // SVG format image, maybe store link here and process on frontend

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "mapping_area_users",
            joinColumns = @JoinColumn(name = "mapping_area_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> users = new ArrayList<>();

    @OneToMany(mappedBy = "mappingArea", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Fulcrum> fulcrums = new ArrayList<>();

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    // Методы для управления пользователями
    public void addUser(User user) {
        users.add(user);
        user.getMappingAreas().add(this);
    }

    public void removeUser(User user) {
        users.remove(user);
        user.getMappingAreas().remove(this);
    }

    // Методы для управления точками опоры
    public void addFulcrum(Fulcrum fulcrum) {
        fulcrums.add(fulcrum);
        fulcrum.setMappingArea(this);
    }

    public void removeFulcrum(Fulcrum fulcrum) {
        fulcrums.remove(fulcrum);
        fulcrum.setMappingArea(null);
    }
}
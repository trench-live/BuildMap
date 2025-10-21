package com.buildmap.api.entities.user;

import com.buildmap.api.entities.mapping_area.MappingArea;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "Name cannot be empty")
    @Size(max = 30, message = "Name must be less than 30 characters")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Telegram ID cannot be empty")
    @Size(max = 30, message = "telegramId must be less than 30 characters")
    @Column(nullable = false, unique = true)
    private String telegramId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<MappingArea> mappingAreas;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;
}

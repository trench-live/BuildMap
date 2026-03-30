package com.buildmap.api.entities.user;

import com.buildmap.api.entities.mapping_area.MappingArea;
import jakarta.persistence.*;
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

    @jakarta.validation.constraints.NotBlank(message = "Name cannot be empty")
    @Size(max = 30, message = "Name must be less than 30 characters")
    @Column(nullable = false)
    private String name;

    @Size(max = 30, message = "telegramId must be less than 30 characters")
    @Column(unique = true)
    private String telegramId;

    @Size(max = 30, message = "Login must be less than 30 characters")
    @Column(unique = true)
    private String login;

    @Column(length = 100)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role = Role.USER;

    @ManyToMany(mappedBy = "users", fetch = FetchType.LAZY)
    private List<MappingArea> mappingAreas;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "is_blocked", nullable = false)
    private boolean blocked = false;
}

package com.buildmap.api.dto.user;

import com.buildmap.api.entities.user.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserSaveDto {
    @NotBlank(message = "Name cannot be empty")
    @Size(max = 30, message = "Name must be less than 30 characters")
    private String name;

    @NotBlank(message = "Telegram ID cannot be empty")
    @Size(max = 30, message = "Telegram ID must be less than 30 characters")
    private String telegramId;

    private Role role = Role.USER;
}
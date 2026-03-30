package com.buildmap.api.dto.user;

import com.buildmap.api.entities.user.Role;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserSaveDto {
    @jakarta.validation.constraints.NotBlank(message = "Name cannot be empty")
    @Size(max = 30, message = "Name must be less than 30 characters")
    private String name;

    @Size(max = 30, message = "Telegram ID must be less than 30 characters")
    private String telegramId;

    @Size(max = 30, message = "Login must be less than 30 characters")
    private String login;

    @Size(max = 72, message = "Password must be less than 72 characters")
    private String password;

    private Role role = Role.USER;
}

package com.buildmap.api.dto.auth.password;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDto {
    @NotBlank(message = "Name cannot be empty")
    @Size(max = 30, message = "Name must be less than 30 characters")
    private String name;

    @NotBlank(message = "Login cannot be empty")
    @Size(max = 30, message = "Login must be less than 30 characters")
    private String login;

    @NotBlank(message = "Password cannot be empty")
    @Size(min = 6, max = 72, message = "Password must be between 6 and 72 characters")
    private String password;
}

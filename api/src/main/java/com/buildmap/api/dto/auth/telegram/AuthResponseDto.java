package com.buildmap.api.dto.auth.telegram;

import com.buildmap.api.dto.user.UserDto;
import lombok.Data;

@Data
public class AuthResponseDto {
    private String token;
    private UserDto user;

    public AuthResponseDto(String token, UserDto user) {
        this.token = token;
        this.user = user;
    }
}
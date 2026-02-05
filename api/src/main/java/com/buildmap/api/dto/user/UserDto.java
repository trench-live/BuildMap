package com.buildmap.api.dto.user;

import com.buildmap.api.entities.user.Role;
import lombok.Data;

@Data
public class UserDto {
    private long id;
    private String name;
    private String telegramId;
    private boolean deleted;
    private boolean blocked;
    private Role role;
}

package com.buildmap.api.repos;

import com.buildmap.api.entities.user.Role;

public interface UserAdminListProjection {
    Long getId();
    String getName();
    String getTelegramId();
    Role getRole();
    boolean isDeleted();
    boolean isBlocked();
    long getAreasCount();
}

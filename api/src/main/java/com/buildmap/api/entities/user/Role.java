package com.buildmap.api.entities.user;

import com.buildmap.api.exceptions.InvalidRoleException;

import java.util.Arrays;
import java.util.stream.Collectors;

public enum Role {
    ADMIN("ADMIN"),     // can CRUD users and mapping areas
    USER("USER");       // can CRUD his mapping areas

    private final String value;

    Role(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static String getValidRoleValues() {
        return Arrays.stream(com.buildmap.api.entities.user.Role.values())
                .map(role -> "'" + role.getValue() + "'")
                .collect(Collectors.joining(", "));
    }

    public static Role fromString(String value) {
        for (Role role : Role.values()) {
            if (role.value.equals(value)) {
                return role;
            }
        }
        throw new InvalidRoleException(value);
    }
}
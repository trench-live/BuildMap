package com.buildmap.api.exceptions;

public class InvalidRoleException extends RuntimeException {
    public InvalidRoleException(String role) {
        super("Invalid role: " + role + ". Must be one of: USER, ADMIN");
    }
}
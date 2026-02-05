package com.buildmap.api.exceptions;

public class FloorNotFoundException extends RuntimeException {
    public FloorNotFoundException(Long id) {
        super("Floor not found with id: " + id);
    }

    public FloorNotFoundException(String message) {
        super(message);
    }
}
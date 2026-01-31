package com.buildmap.api.exceptions;

public class FulcrumNotFoundException extends RuntimeException {
    public FulcrumNotFoundException(Long id) {
        super("Fulcrum not found with id: " + id);
    }
}
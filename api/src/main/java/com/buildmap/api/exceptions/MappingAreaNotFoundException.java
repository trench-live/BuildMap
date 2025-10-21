package com.buildmap.api.exceptions;

public class MappingAreaNotFoundException extends RuntimeException {
    public MappingAreaNotFoundException(Long id) {
        super("Mapping area not found with id: " + id);
    }
}
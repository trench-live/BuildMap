package com.buildmap.api.exceptions;

public class FloorAlreadyExistsException extends RuntimeException {
    public FloorAlreadyExistsException(Long mappingAreaId, Integer level) {
        super("Floor with level " + level + " already exists in mapping area with id: " + mappingAreaId);
    }
}
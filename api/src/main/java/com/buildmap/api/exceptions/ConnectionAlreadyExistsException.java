package com.buildmap.api.exceptions;

public class ConnectionAlreadyExistsException extends RuntimeException {
    public ConnectionAlreadyExistsException(Long fulcrumId, Long connectedFulcrumId) {
        super("Connection already exists between fulcrum " + fulcrumId + " and " + connectedFulcrumId);
    }
}
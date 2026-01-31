package com.buildmap.api.exceptions;

public class FulcrumAlreadyExistsException extends RuntimeException {
    public FulcrumAlreadyExistsException(String message) {
        super(message);
    }
}
package com.buildmap.api.exceptions;

public class InvalidTelegramDataException extends RuntimeException {
    public InvalidTelegramDataException(String message) {
        super(message);
    }
}
package com.buildmap.api.exceptions;

public class TelegramIdExistsException extends RuntimeException {
    public TelegramIdExistsException(String telegramId) {
        super("Telegram ID already exists: " + telegramId);
    }
}
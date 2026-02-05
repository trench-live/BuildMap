package com.buildmap.api.services;

import com.buildmap.api.dto.auth.telegram.TelegramAuthDto;
import com.buildmap.api.entities.user.User;
import com.buildmap.api.exceptions.InvalidTelegramDataException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class TelegramAuthService {

    @Value("${telegram.bot.token:}")
    private String botToken;

    @Value("${auth.dev.enabled:false}")
    private boolean devAuthEnabled;
    private void ensureBotTokenConfigured() {
        if (botToken == null || botToken.isBlank()) {
            throw new IllegalStateException("Telegram bot token is not configured (telegram.bot.token)");
        }
    }

    public boolean validateTelegramAuth(TelegramAuthDto authData) {
        ensureBotTokenConfigured();
        // Разрешаем тестовые данные для разработки
        if (isDevelopmentData(authData)) {
            System.out.println("⚠️ Development data detected, skipping validation");
            return true;
        }

        long currentTime = Instant.now().getEpochSecond();
        if (currentTime - authData.getAuth_date() > 86400) {
            throw new InvalidTelegramDataException("Auth data is too old");
        }

        String dataCheckString = buildDataCheckString(authData);
        byte[] secretKey = getSha256(botToken);
        String computedHash = calculateHmacSha256(dataCheckString, secretKey);

        boolean isValid = computedHash.equals(authData.getHash());
        System.out.println("🔐 Validation result: " + isValid);

        if (!isValid) {
            throw new InvalidTelegramDataException("Invalid Telegram authentication hash");
        }

        return true;
    }

    private boolean isDevelopmentData(TelegramAuthDto authData) {
        if (!devAuthEnabled) {
            return false;
        }
        // Разрешаем данные с development хешами
        return authData.getHash() != null &&
                (authData.getHash().startsWith("dev_hash_") ||
                        authData.getHash().startsWith("test_hash_"));
    }

    private String buildDataCheckString(TelegramAuthDto authData) {
        List<String> fields = new ArrayList<>();

        if (authData.getAuth_date() != null) {
            fields.add("auth_date=" + authData.getAuth_date());
        }
        if (authData.getFirst_name() != null) {
            fields.add("first_name=" + authData.getFirst_name());
        }
        if (authData.getId() != null) {
            fields.add("id=" + authData.getId());
        }
        if (authData.getLast_name() != null) {
            fields.add("last_name=" + authData.getLast_name());
        }
        if (authData.getPhoto_url() != null) {
            fields.add("photo_url=" + authData.getPhoto_url());
        }
        if (authData.getUsername() != null) {
            fields.add("username=" + authData.getUsername());
        }

        // Сортируем поля в алфавитном порядке
        fields.sort(Comparator.naturalOrder());

        return String.join("\n", fields);
    }

    private byte[] getSha256(String input) {
        try {
            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            return digest.digest(input.getBytes());
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
    }

    private String calculateHmacSha256(String data, byte[] key) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(key, "HmacSHA256");
            hmac.init(secretKeySpec);
            byte[] hash = hmac.doFinal(data.getBytes());
            return bytesToHex(hash);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new RuntimeException("Error calculating HMAC-SHA256", e);
        }
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }

    public User createUserFromTelegramData(TelegramAuthDto authData) {
        User user = new User();
        user.setTelegramId(authData.getId().toString());

        // Формируем имя пользователя
        String name = authData.getFirst_name();
        if (authData.getLast_name() != null) {
            name += " " + authData.getLast_name();
        }
        user.setName(name);

        // По умолчанию все пользователи получают роль USER
        user.setRole(com.buildmap.api.entities.user.Role.USER);

        return user;
    }
}

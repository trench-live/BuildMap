package com.buildmap.api.controllers;

import com.buildmap.api.dto.auth.telegram.AuthResponseDto;
import com.buildmap.api.dto.auth.telegram.TelegramAuthDto;
import com.buildmap.api.dto.user.UserDto;
import com.buildmap.api.dto.user.mappers.UserMapper;
import com.buildmap.api.entities.user.Role;
import com.buildmap.api.entities.user.User;
import com.buildmap.api.exceptions.UserNotFoundException;
import com.buildmap.api.exceptions.ValidationException;
import com.buildmap.api.repos.UserRepository;
import com.buildmap.api.services.JwtService;
import com.buildmap.api.services.TelegramAuthService;
import com.buildmap.api.services.UserService;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private TelegramAuthService telegramAuthService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private JwtService jwtService;

    @Value("${auth.dev.enabled:false}")
    private boolean devAuthEnabled;

    @Value("${auth.dev.secret:dev}")
    private String devAuthSecret;

    @GetMapping("/test-connection")
    public ResponseEntity<String> testConnection() {
        System.out.println("=== CONNECTION TEST ENDPOINT CALLED ===");
        return ResponseEntity.ok("Backend is reachable! Current time: " + new Date());
    }

    @PostMapping("/test-login")
    public ResponseEntity<AuthResponseDto> testLogin(@RequestBody TestLoginRequest request) {
        System.out.println("=== TEST LOGIN ===");
        System.out.println("Request: " + request);

        try {
            // Создаем или находим пользователя
            User user;
            String telegramId = "test_" + request.getUserId();

            if (userRepository.existsByTelegramId(telegramId)) {
                user = userRepository.findByTelegramId(telegramId)
                        .orElseThrow(() -> new ValidationException("Test user not found"));
            } else {
                user = new User();
                user.setName(request.getName());
                user.setTelegramId(telegramId);
                user.setRole(Role.USER);
                user = userService.create(user);
            }

            // Генерируем JWT токен
            String token = jwtService.generateToken(user.getId());
            UserDto userDto = userMapper.toDto(user);

            System.out.println("✅ Test login successful for: " + user.getName());
            return ResponseEntity.ok(new AuthResponseDto(token, userDto));

        } catch (Exception e) {
            System.out.println("❌ Test login failed: " + e.getMessage());
            throw e;
        }
    }

    @PostMapping("/dev-login")
    public ResponseEntity<AuthResponseDto> devLogin(@RequestBody DevLoginRequest request) {
        if (!devAuthEnabled) {
            return ResponseEntity.status(403).build();
        }
        if (request.getSecret() == null || !request.getSecret().equals(devAuthSecret)) {
            return ResponseEntity.status(401).build();
        }

        User user;
        if (request.getUserId() != null) {
            try {
                user = userService.getById(request.getUserId());
            } catch (UserNotFoundException ex) {
                user = createDevUser(request, "user_" + request.getUserId());
            }
        } else if (request.getTelegramId() != null && !request.getTelegramId().isBlank()) {
            user = userRepository.findByTelegramId(request.getTelegramId())
                    .orElseGet(() -> createDevUser(request, request.getTelegramId()));
        } else {
            throw new ValidationException("userId or telegramId is required");
        }

        String token = jwtService.generateToken(user.getId());
        UserDto userDto = userMapper.toDto(user);
        return ResponseEntity.ok(new AuthResponseDto(token, userDto));
    }

    private User createDevUser(DevLoginRequest request, String fallbackKey) {
        String telegramId = request.getTelegramId();
        if (telegramId == null || telegramId.isBlank()) {
            telegramId = "dev_" + fallbackKey;
        }
        if (userRepository.existsByTelegramIdAndDeletedFalse(telegramId)) {
            telegramId = telegramId + "_" + System.currentTimeMillis();
        }

        User user = new User();
        String name = request.getName();
        if (name == null || name.isBlank()) {
            name = "Dev User " + fallbackKey;
        }
        user.setName(name);
        user.setTelegramId(telegramId);
        user.setRole(Role.USER);
        return userService.create(user);
    }

    @Data
    static class TestLoginRequest {
        private Long userId;
        private String name;
    }

    @Data
    static class DevLoginRequest {
        private Long userId;
        private String telegramId;
        private String secret;
        private String name;
    }

    @PostMapping("/telegram")
    public ResponseEntity<AuthResponseDto> telegramAuth(@RequestBody TelegramAuthDto authData) {
        System.out.println("=== TELEGRAM AUTH STARTED ===");
        System.out.println("Received Telegram data: " + authData);

        try {
            // Валидируем данные от Telegram
            if (!telegramAuthService.validateTelegramAuth(authData)) {
                System.out.println("❌ Telegram validation failed!");
                throw new ValidationException("Invalid Telegram authentication data");
            }

            System.out.println("✅ Telegram validation passed");

            String telegramId = authData.getId().toString();
            User user;

            // Проверяем, существует ли пользователь
            if (userRepository.existsByTelegramId(telegramId)) {
                System.out.println("🔍 User exists, logging in...");
                user = userRepository.findByTelegramId(telegramId)
                        .orElseThrow(() -> new ValidationException("User not found"));
            } else {
                System.out.println("👤 Creating new user...");
                user = telegramAuthService.createUserFromTelegramData(authData);
                user = userService.create(user);
            }

            System.out.println("🆔 User ID: " + user.getId());

            // Генерируем JWT токен
            String token = jwtService.generateToken(user.getId());
            System.out.println("🔑 Token generated: " + token.substring(0, 20) + "...");

            // Преобразуем в DTO
            UserDto userDto = userMapper.toDto(user);

            System.out.println("✅ Auth successful for user: " + userDto.getName());
            System.out.println("=== TELEGRAM AUTH COMPLETED ===");

            return ResponseEntity.ok(new AuthResponseDto(token, userDto));

        } catch (Exception e) {
            System.out.println("❌ Auth failed: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // В будущем можно добавить blacklist токенов
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(401).build();
        }

        String token = authHeader.substring(7);
        if (!jwtService.validateToken(token)) {
            return ResponseEntity.status(401).build();
        }

        Long userId = jwtService.getUserIdFromToken(token);
        User user = userService.getById(userId);

        return ResponseEntity.ok(userMapper.toDto(user));
    }
}

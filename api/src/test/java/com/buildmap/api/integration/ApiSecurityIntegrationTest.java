package com.buildmap.api.integration;

import com.buildmap.api.entities.user.Role;
import com.buildmap.api.entities.user.User;
import com.buildmap.api.repos.UserRepository;
import com.buildmap.api.services.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.security.crypto.password.PasswordEncoder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.file.Path;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiSecurityIntegrationTest {

    private static final String TEST_DB_URL = "jdbc:sqlite:" + Path.of(
            "target",
            "buildmap-integration-" + UUID.randomUUID() + ".db"
    ).toString().replace("\\", "/");

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> TEST_DB_URL);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
        registry.add("auth.dev.enabled", () -> "true");
        registry.add("auth.dev.secret", () -> "dev-secret");
        registry.add("telegram.bot.token", () -> "test-bot-token");
        registry.add("jwt.secret", () -> "012345678901234567890123456789012345678901234567890123456789");
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void cleanup() {
        userRepository.deleteAll();
    }

    @Test
    void devLoginReturnsTokenForValidSecret() throws Exception {
        String body = """
                {
                  "userId": 1,
                  "secret": "dev-secret",
                  "name": "Dev Admin"
                }
                """;

        mockMvc.perform(post("/api/auth/dev-login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.id").exists());
    }

    @Test
    void tc002_telegramLoginWithValidData() throws Exception {
        long authDate = System.currentTimeMillis() / 1000;
        long telegramId = 222000111L;
        String firstName = "Test";
        String username = "tc002_user";
        String hash = buildTelegramHash(authDate, telegramId, firstName, username);

        String body = """
                {
                  "id": %d,
                  "first_name": "%s",
                  "username": "%s",
                  "auth_date": %d,
                  "hash": "%s"
                }
                """.formatted(telegramId, firstName, username, authDate, hash);

        mockMvc.perform(post("/api/auth/telegram")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.telegramId").value(String.valueOf(telegramId)));
    }

    @Test
    void passwordLoginReturnsTokenForValidCredentials() throws Exception {
        User user = saveUser("Login User", "tg_login_user", Role.USER, false, false);
        user.setLogin("login_user");
        user.setPasswordHash(passwordEncoder.encode("secret123"));
        userRepository.save(user);

        String body = """
                {
                  "login": "login_user",
                  "password": "secret123"
                }
                """;

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.login").value("login_user"));
    }

    @Test
    void registerCreatesUserAndReturnsToken() throws Exception {
        String body = """
                {
                  "name": "Registered User",
                  "login": "registered_user",
                  "password": "secret123"
                }
                """;

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.login").value("registered_user"))
                .andExpect(jsonPath("$.user.role").value("USER"));
    }

    @Test
    void protectedEndpointWithoutTokenIsForbidden() throws Exception {
        mockMvc.perform(get("/api/user"))
                .andExpect(status().isForbidden());
    }

    @Test
    void userListIsAllowedForAdmin() throws Exception {
        User admin = saveUser("Admin", "tg_admin_1", Role.ADMIN, false, false);
        String token = jwtService.generateToken(admin.getId());

        mockMvc.perform(get("/api/user")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void userListIsForbiddenForRegularUser() throws Exception {
        User regularUser = saveUser("User", "tg_user_1", Role.USER, false, false);
        String token = jwtService.generateToken(regularUser.getId());

        mockMvc.perform(get("/api/user")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    void userListWithInvalidJwtIsForbidden() throws Exception {
        mockMvc.perform(get("/api/user")
                        .header("Authorization", "Bearer invalid.jwt.token"))
                .andExpect(status().isForbidden());
    }

    private User saveUser(String name, String telegramId, Role role, boolean deleted, boolean blocked) {
        User user = new User();
        user.setName(name);
        user.setTelegramId(telegramId);
        user.setRole(role);
        user.setDeleted(deleted);
        user.setBlocked(blocked);
        return userRepository.save(user);
    }

    private String buildTelegramHash(long authDate, long telegramId, String firstName, String username) throws Exception {
        List<String> fields = new ArrayList<>();
        fields.add("auth_date=" + authDate);
        fields.add("first_name=" + firstName);
        fields.add("id=" + telegramId);
        fields.add("username=" + username);
        fields.sort(String::compareTo);
        String dataCheckString = String.join("\n", fields);

        byte[] secretKey = MessageDigest.getInstance("SHA-256")
                .digest("test-bot-token".getBytes(StandardCharsets.UTF_8));

        Mac hmac = Mac.getInstance("HmacSHA256");
        hmac.init(new SecretKeySpec(secretKey, "HmacSHA256"));
        byte[] hashBytes = hmac.doFinal(dataCheckString.getBytes(StandardCharsets.UTF_8));
        return bytesToHex(hashBytes);
    }

    private String bytesToHex(byte[] bytes) {
        StringBuilder result = new StringBuilder();
        for (byte b : bytes) {
            result.append(String.format("%02x", b));
        }
        return result.toString();
    }
}

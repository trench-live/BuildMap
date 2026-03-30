package com.buildmap.api.integration;

import com.buildmap.api.entities.user.Role;
import com.buildmap.api.entities.user.User;
import com.buildmap.api.repos.FloorRepository;
import com.buildmap.api.repos.FulcrumRepository;
import com.buildmap.api.repos.MappingAreaRepository;
import com.buildmap.api.repos.UserRepository;
import com.buildmap.api.services.JwtService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.file.Path;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTimeoutPreemptively;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiDomainIntegrationTest {

    private static final String TEST_DB_URL = "jdbc:sqlite:" + Path.of(
            "target",
            "buildmap-domain-integration-" + UUID.randomUUID() + ".db"
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
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MappingAreaRepository mappingAreaRepository;

    @Autowired
    private FloorRepository floorRepository;

    @Autowired
    private FulcrumRepository fulcrumRepository;

    @Autowired
    private JwtService jwtService;

    @BeforeEach
    void cleanup() {
        fulcrumRepository.deleteAll();
        floorRepository.deleteAll();
        mappingAreaRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void tc004_userCreatesOwnMappingArea() throws Exception {
        User user = saveUser("Case User", "tg_tc004", Role.USER, false, false);
        String token = jwtService.generateToken(user.getId());

        MvcResult result = mockMvc.perform(post("/api/mapping-area")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "TC004 Area",
                                "description", "Owned by USER",
                                "userIds", List.of(999L)
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("TC004 Area"))
                .andExpect(jsonPath("$.userIds", hasItem((int) user.getId())))
                .andReturn();

        Long areaId = readId(result);
        org.junit.jupiter.api.Assertions.assertTrue(mappingAreaRepository.existsByIdAndUsersId(areaId, user.getId()));
    }

    @Test
    void tc005_createFloorWithUniqueLevel() throws Exception {
        User user = saveUser("Case User", "tg_tc005", Role.USER, false, false);
        String token = jwtService.generateToken(user.getId());
        Long areaId = createArea(token, "TC005 Area");

        mockMvc.perform(post("/api/floor")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "L1",
                                "level", 1,
                                "description", "Floor 1",
                                "mappingAreaId", areaId
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.level").value(1))
                .andExpect(jsonPath("$.mappingAreaId").value(areaId));
    }

    @Test
    void tc012_duplicateFloorLevelIsRejected() throws Exception {
        User user = saveUser("Case User", "tg_tc012", Role.USER, false, false);
        String token = jwtService.generateToken(user.getId());
        Long areaId = createArea(token, "TC012 Area");

        createFloor(token, areaId, "L1", 1);

        mockMvc.perform(post("/api/floor")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "L1 duplicate",
                                "level", 1,
                                "description", "Duplicate level",
                                "mappingAreaId", areaId
                        ))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void tc006_createFulcrumWithQrAndFacingDirection() throws Exception {
        User user = saveUser("Case User", "tg_tc006", Role.USER, false, false);
        String token = jwtService.generateToken(user.getId());
        Long areaId = createArea(token, "TC006 Area");
        Long floorId = createFloor(token, areaId, "L1", 1);

        mockMvc.perform(post("/api/fulcrum")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "TC006 Point",
                                "description", "QR point",
                                "x", 0.2,
                                "y", 0.3,
                                "type", "ROOM",
                                "facingDirection", "UP",
                                "hasQr", true,
                                "floorId", floorId
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.hasQr").value(true))
                .andExpect(jsonPath("$.facingDirection").value("UP"));
    }

    @Test
    void tc013_fulcrumWithQrWithoutFacingDirectionIsRejected() throws Exception {
        User user = saveUser("Case User", "tg_tc013", Role.USER, false, false);
        String token = jwtService.generateToken(user.getId());
        Long areaId = createArea(token, "TC013 Area");
        Long floorId = createFloor(token, areaId, "L1", 1);

        mockMvc.perform(post("/api/fulcrum")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", "TC013 Point",
                                "description", "Invalid QR point",
                                "x", 0.4,
                                "y", 0.5,
                                "type", "ROOM",
                                "hasQr", true,
                                "floorId", floorId
                        ))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void tc007_addConnectionBetweenFulcrumsInSameArea() throws Exception {
        User user = saveUser("Case User", "tg_tc007", Role.USER, false, false);
        String token = jwtService.generateToken(user.getId());
        Long areaId = createArea(token, "TC007 Area");
        Long floorId = createFloor(token, areaId, "L1", 1);
        Long fromId = createFulcrum(token, floorId, "From", 0.1, 0.1);
        Long toId = createFulcrum(token, floorId, "To", 0.8, 0.8);

        mockMvc.perform(post("/api/fulcrum/" + fromId + "/connection")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "connectedFulcrumId", toId,
                                "distanceMeters", 5.0,
                                "difficultyFactor", 1.2
                        ))))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/fulcrum/" + fromId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.connections[0].connectedFulcrumId").value(toId))
                .andExpect(jsonPath("$.connections[0].distanceMeters").value(5.0))
                .andExpect(jsonPath("$.connections[0].difficultyFactor").value(1.2));
    }

    @Test
    void tc014_connectionAcrossAreasIsRejected() throws Exception {
        User user = saveUser("Case User", "tg_tc014", Role.USER, false, false);
        String token = jwtService.generateToken(user.getId());

        Long areaA = createArea(token, "TC014 Area A");
        Long areaB = createArea(token, "TC014 Area B");
        Long floorA = createFloor(token, areaA, "A1", 1);
        Long floorB = createFloor(token, areaB, "B1", 1);
        Long fromId = createFulcrum(token, floorA, "A-Point", 0.2, 0.2);
        Long toId = createFulcrum(token, floorB, "B-Point", 0.7, 0.7);

        mockMvc.perform(post("/api/fulcrum/" + fromId + "/connection")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "connectedFulcrumId", toId,
                                "distanceMeters", 6.0,
                                "difficultyFactor", 1.0
                        ))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void tc015_routeAcrossAreasIsRejected() throws Exception {
        User user = saveUser("Case User", "tg_tc015", Role.USER, false, false);
        String token = jwtService.generateToken(user.getId());

        Long areaA = createArea(token, "TC015 Area A");
        Long areaB = createArea(token, "TC015 Area B");
        Long floorA = createFloor(token, areaA, "A1", 1);
        Long floorB = createFloor(token, areaB, "B1", 1);
        Long startId = createFulcrum(token, floorA, "Start", 0.1, 0.2);
        Long endId = createFulcrum(token, floorB, "End", 0.9, 0.8);

        mockMvc.perform(post("/api/navigation/path")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "startFulcrumId", startId,
                                "endFulcrumId", endId
                        ))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void tc016_blockedUserCannotLogin() throws Exception {
        User blockedUser = saveUser("Blocked User", "tg_tc016", Role.USER, false, true);

        mockMvc.perform(post("/api/auth/dev-login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "userId", blockedUser.getId(),
                                "secret", "dev-secret"
                        ))))
                .andExpect(status().isForbidden());
    }

    @Test
    void tc008_routeBuildsBetweenConnectedFulcrumsInSameArea() throws Exception {
        User user = saveUser("Case User", "tg_tc008", Role.USER, false, false);
        String token = jwtService.generateToken(user.getId());
        Long areaId = createArea(token, "TC008 Area");
        Long floorId = createFloor(token, areaId, "L1", 1);
        Long startId = createFulcrum(token, floorId, "Start", 0.1, 0.1);
        Long endId = createFulcrum(token, floorId, "End", 0.9, 0.9);
        addConnection(token, startId, endId, 4.0, 1.0);

        mockMvc.perform(post("/api/navigation/path")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "startFulcrumId", startId,
                                "endFulcrumId", endId
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.startFulcrumId").value(startId))
                .andExpect(jsonPath("$.endFulcrumId").value(endId))
                .andExpect(jsonPath("$.path[0].id").value(startId))
                .andExpect(jsonPath("$.path[1].id").value(endId))
                .andExpect(jsonPath("$.totalCost").value(4.0));
    }

    @Test
    void tc017_connectionWithDifficultyFactorOneIsAccepted() throws Exception {
        User user = saveUser("Case User", "tg_tc017", Role.USER, false, false);
        String token = jwtService.generateToken(user.getId());
        Long areaId = createArea(token, "TC017 Area");
        Long floorId = createFloor(token, areaId, "L1", 1);
        Long fromId = createFulcrum(token, floorId, "From", 0.2, 0.2);
        Long toId = createFulcrum(token, floorId, "To", 0.8, 0.8);

        addConnection(token, fromId, toId, 3.0, 1.0);

        mockMvc.perform(get("/api/fulcrum/" + fromId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.connections[0].connectedFulcrumId").value(toId))
                .andExpect(jsonPath("$.connections[0].difficultyFactor").value(1.0));
    }

    @Test
    void tc018_connectionWithDistancePointOneIsAccepted() throws Exception {
        User user = saveUser("Case User", "tg_tc018", Role.USER, false, false);
        String token = jwtService.generateToken(user.getId());
        Long areaId = createArea(token, "TC018 Area");
        Long floorId = createFloor(token, areaId, "L1", 1);
        Long startId = createFulcrum(token, floorId, "Start", 0.3, 0.3);
        Long endId = createFulcrum(token, floorId, "End", 0.4, 0.4);

        addConnection(token, startId, endId, 0.1, 1.0);

        mockMvc.perform(post("/api/navigation/path")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "startFulcrumId", startId,
                                "endFulcrumId", endId
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalDistanceMeters").value(0.1))
                .andExpect(jsonPath("$.totalCost").value(0.1));
    }

    @Test
    void tc019_userNameLengthBoundary() throws Exception {
        User admin = saveUser("Admin", "tg_tc019_admin", Role.ADMIN, false, false);
        String adminToken = jwtService.generateToken(admin.getId());
        String name30 = "A".repeat(30);
        String name31 = "B".repeat(31);

        mockMvc.perform(post("/api/user")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", name30,
                                "telegramId", "tg_tc019_u30",
                                "role", "USER"
                        ))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(name30));

        mockMvc.perform(post("/api/user")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", name31,
                                "telegramId", "tg_tc019_u31",
                                "role", "USER"
                        ))))
                .andExpect(status().isBadRequest());
    }

    @Test
    void tc020_routeOnLargeGraphReturnsWithinReasonableTime() throws Exception {
        User user = saveUser("Case User", "tg_tc020", Role.USER, false, false);
        String token = jwtService.generateToken(user.getId());
        Long areaId = createArea(token, "TC020 Area");
        Long floorId = createFloor(token, areaId, "L1", 1);

        List<Long> nodeIds = new ArrayList<>();
        for (int i = 0; i < 20; i += 1) {
            double x = (double) i / 19.0;
            nodeIds.add(createFulcrum(token, floorId, "N" + i, x, 0.5));
        }
        for (int i = 0; i < nodeIds.size() - 1; i += 1) {
            addConnection(token, nodeIds.get(i), nodeIds.get(i + 1), 1.0, 1.0);
        }

        Long startId = nodeIds.get(0);
        Long endId = nodeIds.get(nodeIds.size() - 1);

        assertTimeoutPreemptively(Duration.ofSeconds(5), () ->
                mockMvc.perform(post("/api/navigation/path")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(Map.of(
                                        "startFulcrumId", startId,
                                        "endFulcrumId", endId
                                ))))
                        .andExpect(status().isOk())
                        .andExpect(jsonPath("$.startFulcrumId").value(startId))
                        .andExpect(jsonPath("$.endFulcrumId").value(endId))
        );
    }

    private Long createArea(String token, String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/mapping-area")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", name,
                                "description", "Integration area",
                                "userIds", List.of(1L)
                        ))))
                .andExpect(status().isCreated())
                .andReturn();
        return readId(result);
    }

    private void addConnection(String token, Long fromId, Long toId, double distanceMeters, double difficultyFactor)
            throws Exception {
        mockMvc.perform(post("/api/fulcrum/" + fromId + "/connection")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "connectedFulcrumId", toId,
                                "distanceMeters", distanceMeters,
                                "difficultyFactor", difficultyFactor
                        ))))
                .andExpect(status().isOk());
    }

    private Long createFloor(String token, Long areaId, String floorName, int level) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/floor")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", floorName,
                                "level", level,
                                "description", "Integration floor",
                                "mappingAreaId", areaId
                        ))))
                .andExpect(status().isCreated())
                .andReturn();
        return readId(result);
    }

    private Long createFulcrum(String token, Long floorId, String name, double x, double y) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/fulcrum")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of(
                                "name", name,
                                "description", "Integration fulcrum",
                                "x", x,
                                "y", y,
                                "type", "ROOM",
                                "hasQr", false,
                                "floorId", floorId
                        ))))
                .andExpect(status().isCreated())
                .andReturn();
        return readId(result);
    }

    private Long readId(MvcResult result) throws Exception {
        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        return root.get("id").asLong();
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
}

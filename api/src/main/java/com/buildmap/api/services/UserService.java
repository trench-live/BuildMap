package com.buildmap.api.services;

import com.buildmap.api.dto.user.UserAdminListDto;
import com.buildmap.api.dto.user.UserSaveDto;
import com.buildmap.api.dto.user.mappers.UserMapper;
import com.buildmap.api.entities.user.Role;
import com.buildmap.api.entities.user.User;
import com.buildmap.api.exceptions.UserNotFoundException;
import com.buildmap.api.exceptions.ValidationException;
import com.buildmap.api.repos.UserAdminListProjection;
import com.buildmap.api.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Service
@Validated
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private MappingAreaService mappingAreaService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> getAll(Boolean deleted) {
        if (deleted == null) return userRepository.findAll();
        return deleted ?
                userRepository.findByDeletedTrue() :
                userRepository.findByDeletedFalse();
    }

    public List<UserAdminListDto> getAdminList() {
        return userRepository.findAdminListWithActiveAreasCount()
                .stream()
                .map(this::toAdminListDto)
                .toList();
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    public User getActiveById(Long id) {
        return userRepository.findByIdAndDeletedFalseAndBlockedFalse(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    public User restore(Long id) {
        User user = getById(id);
        user.setDeleted(false);
        return userRepository.save(user);
    }

    public User setBlocked(Long id, boolean blocked) {
        User user = getById(id);
        if (blocked) {
            ensureNotLastActiveAdmin(user);
        }
        user.setBlocked(blocked);
        return userRepository.save(user);
    }

    public User create(User user) {
        normalizeUser(user);
        validateIdentifiers(user, null);
        return userRepository.save(user);
    }

    public User create(UserSaveDto userDto) {
        User user = userMapper.toEntity(userDto);
        applyCredentials(user, userDto);
        return create(user);
    }

    public User register(String name, String login, String rawPassword) {
        User user = new User();
        user.setName(name);
        user.setLogin(login);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user.setRole(Role.USER);
        return create(user);
    }

    public User update(Long id, User user) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        if (existingUser.getRole() == Role.ADMIN && user.getRole() != Role.ADMIN) {
            ensureNotLastActiveAdmin(existingUser);
        }

        user.setId(id);
        normalizeUser(user);
        validateIdentifiers(user, existingUser.getId());
        return userRepository.save(user);
    }

    public User update(Long id, UserSaveDto userDto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        if (existingUser.getRole() == Role.ADMIN && userDto.getRole() != Role.ADMIN) {
            ensureNotLastActiveAdmin(existingUser);
        }

        userMapper.updateEntity(userDto, existingUser);
        applyCredentials(existingUser, userDto);
        normalizeUser(existingUser);
        validateIdentifiers(existingUser, existingUser.getId());
        return userRepository.save(existingUser);
    }

    public User getActiveByLogin(String login) {
        String normalizedLogin = trimToNull(login);
        return userRepository.findByLogin(normalizedLogin)
                .filter(user -> !user.isDeleted() && !user.isBlocked())
                .orElseThrow(() -> new ValidationException("Invalid login or password"));
    }

    public boolean matchesPassword(User user, String rawPassword) {
        if (user == null || rawPassword == null || rawPassword.isBlank()) {
            return false;
        }
        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            return false;
        }
        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }

    @Transactional
    public void safeDelete(Long id) {
        User user = getById(id);
        ensureNotLastActiveAdmin(user);
        user.setDeleted(true);
        user.setBlocked(false);
        userRepository.save(user);

        if (user.getMappingAreas() != null) {
            user.getMappingAreas().forEach(area -> mappingAreaService.safeDelete(area.getId()));
        }
    }

    @Transactional
    public void delete(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        ensureNotLastActiveAdmin(user);

        if (user.getMappingAreas() != null) {
            List<Long> areaIds = new ArrayList<>(user.getMappingAreas())
                    .stream()
                    .map(area -> area.getId())
                    .toList();
            areaIds.forEach(mappingAreaService::delete);
        }

        userRepository.deleteById(id);
    }

    private void ensureNotLastActiveAdmin(User user) {
        if (user.getRole() != Role.ADMIN || user.isDeleted() || user.isBlocked()) {
            return;
        }
        long activeAdmins = userRepository.countByRoleAndDeletedFalseAndBlockedFalse(Role.ADMIN);
        if (activeAdmins <= 1) {
            throw new ValidationException("Cannot modify the last active admin");
        }
    }

    private UserAdminListDto toAdminListDto(UserAdminListProjection projection) {
        UserAdminListDto dto = new UserAdminListDto();
        dto.setId(projection.getId());
        dto.setName(projection.getName());
        dto.setTelegramId(projection.getTelegramId());
        dto.setLogin(projection.getLogin());
        dto.setRole(projection.getRole());
        dto.setDeleted(projection.isDeleted());
        dto.setBlocked(projection.isBlocked());
        dto.setAreasCount(projection.getAreasCount());
        return dto;
    }

    private void applyCredentials(User user, UserSaveDto userDto) {
        if (user == null || userDto == null) {
            return;
        }
        if (userDto.getPassword() != null && !userDto.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(userDto.getPassword()));
        }
    }

    private void validateIdentifiers(User user, Long currentUserId) {
        if (user == null) {
            throw new ValidationException("User is required");
        }

        boolean hasTelegram = user.getTelegramId() != null && !user.getTelegramId().isBlank();
        boolean hasLogin = user.getLogin() != null && !user.getLogin().isBlank();

        if (!hasTelegram && !hasLogin) {
            throw new ValidationException("At least one authentication method is required");
        }

        if (hasTelegram) {
            User userWithSameTelegramId = userRepository.findByTelegramId(user.getTelegramId()).orElse(null);
            if (userWithSameTelegramId != null && !Objects.equals(userWithSameTelegramId.getId(), currentUserId)) {
                throw new ValidationException("Telegram ID already exists");
            }
        }

        if (hasLogin) {
            User userWithSameLogin = userRepository.findByLogin(user.getLogin()).orElse(null);
            if (userWithSameLogin != null && !Objects.equals(userWithSameLogin.getId(), currentUserId)) {
                throw new ValidationException("Login already exists");
            }
            if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
                throw new ValidationException("Password is required for login-based authentication");
            }
        }
    }

    private void normalizeUser(User user) {
        if (user == null) {
            return;
        }
        user.setName(trimToNull(user.getName()));
        user.setTelegramId(trimToNull(user.getTelegramId()));
        user.setLogin(trimToNull(user.getLogin()));
        user.setPasswordHash(trimToNull(user.getPasswordHash()));
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}

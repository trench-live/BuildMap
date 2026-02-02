package com.buildmap.api.services;

import com.buildmap.api.dto.user.UserSaveDto;
import com.buildmap.api.dto.user.mappers.UserMapper;
import com.buildmap.api.entities.user.Role;
import com.buildmap.api.entities.user.User;
import com.buildmap.api.exceptions.TelegramIdExistsException;
import com.buildmap.api.exceptions.UserNotFoundException;
import com.buildmap.api.exceptions.ValidationException;
import com.buildmap.api.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Service
@Validated
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private MappingAreaService mappingAreaService;

    public List<User> getAll(Boolean deleted) {
        if (deleted == null) return userRepository.findAll();
        return deleted ?
                userRepository.findByDeletedTrue() :
                userRepository.findByDeletedFalse();
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
        if (user.getTelegramId() != null &&
                userRepository.existsByTelegramId(user.getTelegramId())) {
            throw new TelegramIdExistsException(user.getTelegramId());
        }
        return userRepository.save(user);
    }

    public User update(Long id, User user) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        if (existingUser.getRole() == Role.ADMIN && user.getRole() != Role.ADMIN) {
            ensureNotLastActiveAdmin(existingUser);
        }

        user.setId(id);
        return userRepository.save(user);
    }

    public User update(Long id, UserSaveDto userDto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        if (existingUser.getRole() == Role.ADMIN && userDto.getRole() != Role.ADMIN) {
            ensureNotLastActiveAdmin(existingUser);
        }

        userMapper.updateEntity(userDto, existingUser);
        return userRepository.save(existingUser);
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

    public void delete(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
        ensureNotLastActiveAdmin(user);

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
}

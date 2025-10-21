package com.buildmap.api.services;

import com.buildmap.api.dto.user.UserSaveDto;
import com.buildmap.api.dto.user.mappers.UserMapper;
import com.buildmap.api.entities.user.Role;
import com.buildmap.api.entities.user.User;
import com.buildmap.api.exceptions.UserNotFoundException;
import com.buildmap.api.repos.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.List;

@Service
@Validated
public class UserService {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserMapper userMapper;

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

    public User create(User user) {
        return userRepository.save(user);
    }

    public User update(Long id, User user) {
        if (!userRepository.existsById(id))
            throw new UserNotFoundException(id);

        user.setId(id);
        return userRepository.save(user);
    }

    public User update(Long id, UserSaveDto userDto) {
        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        userMapper.updateEntity(userDto, existingUser);
        return userRepository.save(existingUser);
    }

    public void safeDelete(Long id) {
        User user = getById(id);
        user.setDeleted(true);
        userRepository.save(user);
    }

    public void delete(Long id) {
        userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));


        userRepository.deleteById(id);
    }
}

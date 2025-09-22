package com.buildmap.api.services;

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

    public List<User> getAll(Boolean includeDeleted) {
        if (includeDeleted == null)
            return userRepository.findAll();
        return includeDeleted ? userRepository.findByDeletedTrue() : userRepository.findByDeletedFalse();
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

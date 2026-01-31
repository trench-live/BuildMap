package com.buildmap.api.controllers;

import com.buildmap.api.dto.user.UserDto;
import com.buildmap.api.dto.user.UserSaveDto;
import com.buildmap.api.dto.user.mappers.UserMapper;
import com.buildmap.api.entities.user.User;
import com.buildmap.api.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private UserMapper userMapper;

    @PostMapping
    public ResponseEntity<UserDto> create(@Valid @RequestBody UserSaveDto userDto) {
        User user = userMapper.toEntity(userDto);
        User created = userService.create(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(userMapper.toDto(created));
    }

    @GetMapping
    public ResponseEntity<List<UserDto>> getAll(
            @RequestParam(name = "deleted", required = false) Boolean deleted) {
        List<User> users = userService.getAll(deleted);
        return ResponseEntity.ok(userMapper.toDtoList(users));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getById(@PathVariable long id) {
        User user = userService.getById(id);
        return user != null ?
                ResponseEntity.ok(userMapper.toDto(user)) :
                ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDto> update(@PathVariable Long id, @Valid @RequestBody UserSaveDto userDto) {
        User updatedUser = userService.update(id, userDto);
        return ResponseEntity.ok(userMapper.toDto(updatedUser));
    }

    @DeleteMapping("/force/{id}")
    public ResponseEntity<User> forceDelete(@PathVariable long id) {
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping({"/{id}"})
    public ResponseEntity<User> delete(@PathVariable long id) {
        userService.safeDelete(id);
        return ResponseEntity.noContent().build();
    }

}

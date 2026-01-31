package com.buildmap.api.dto.user.mappers;

import com.buildmap.api.dto.user.UserDto;
import com.buildmap.api.dto.user.UserSaveDto;
import com.buildmap.api.entities.user.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDto toDto(User entity);
    List<UserDto> toDtoList(List<User> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "mappingAreas", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    User toEntity(UserSaveDto dto);

    // Для обновления
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "mappingAreas", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    void updateEntity(UserSaveDto dto, @MappingTarget User user);
}
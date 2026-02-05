package com.buildmap.api.dto.mapping_area.mappers;

import com.buildmap.api.dto.mapping_area.MappingAreaDto;
import com.buildmap.api.dto.mapping_area.MappingAreaSaveDto;
import com.buildmap.api.dto.mapping_area.MappingAreaUpdateDto;
import com.buildmap.api.entities.mapping_area.MappingArea;
import com.buildmap.api.entities.user.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface MappingAreaMapper {

    @Mapping(target = "userIds", source = "users", qualifiedByName = "usersToUserIds")
        // Убираем маппинг fulcrums - его больше нет в MappingArea
    MappingAreaDto toDto(MappingArea entity);

    List<MappingAreaDto> toDtoList(List<MappingArea> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "floors", ignore = true) // Добавляем игнор floors
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "users", source = "userIds", qualifiedByName = "userIdsToUsers")
    MappingArea toEntity(MappingAreaSaveDto dto);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "floors", ignore = true) // Добавляем игнор floors
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "users", source = "userIds", qualifiedByName = "userIdsToUsers")
    void updateEntity(MappingAreaSaveDto dto, @MappingTarget MappingArea entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "floors", ignore = true)
    @Mapping(target = "deleted", ignore = true)
    @Mapping(target = "users", ignore = true)
    void updateEntityFromUpdateDto(MappingAreaUpdateDto dto, @MappingTarget MappingArea entity);

    @Named("userIdsToUsers")
    default List<User> userIdsToUsers(List<Long> userIds) {
        if (userIds == null) return null;
        return userIds.stream()
                .map(userId -> {
                    User user = new User();
                    user.setId(userId);
                    return user;
                })
                .collect(Collectors.toList());
    }

    @Named("usersToUserIds")
    default List<Long> usersToUserIds(List<User> users) {
        if (users == null) return null;
        return users.stream()
                .map(User::getId)
                .collect(Collectors.toList());
    }
}
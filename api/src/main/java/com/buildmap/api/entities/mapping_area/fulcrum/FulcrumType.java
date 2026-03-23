package com.buildmap.api.entities.mapping_area.fulcrum;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.util.Locale;

public enum FulcrumType {
    WAYPOINT,
    ROOM,
    STAIRS,
    ELEVATOR,
    ENTRANCE,
    HALL,
    RESTROOM,
    KITCHEN,
    RECEPTION,
    EMERGENCY_EXIT,
    LANDMARK;

    @JsonValue
    public String toJsonValue() {
        return name();
    }

    public String toDatabaseValue() {
        return name();
    }

    @JsonCreator
    public static FulcrumType fromValue(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return switch (value.trim().toUpperCase(Locale.ROOT)) {
            case "WAYPOINT", "CORRIDOR" -> WAYPOINT;
            case "ROOM" -> ROOM;
            case "STAIRS" -> STAIRS;
            case "ELEVATOR" -> ELEVATOR;
            case "ENTRANCE" -> ENTRANCE;
            case "HALL" -> HALL;
            case "RESTROOM" -> RESTROOM;
            case "KITCHEN" -> KITCHEN;
            case "RECEPTION" -> RECEPTION;
            case "EMERGENCY_EXIT" -> EMERGENCY_EXIT;
            case "LANDMARK" -> LANDMARK;
            default -> throw new IllegalArgumentException("Unknown fulcrum type: " + value);
        };
    }

    public static FulcrumType fromDatabaseValue(String value) {
        return fromValue(value);
    }
}

package com.buildmap.api.entities.mapping_area.fulcrum;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class FulcrumTypeTest {

    @Test
    void shouldReadLegacyCorridorValueAsWaypoint() {
        assertEquals(FulcrumType.WAYPOINT, FulcrumType.fromValue("CORRIDOR"));
    }

    @Test
    void shouldReadWaypointValueAsWaypoint() {
        assertEquals(FulcrumType.WAYPOINT, FulcrumType.fromValue("WAYPOINT"));
    }

    @Test
    void converterShouldWriteWaypointValue() {
        FulcrumTypeConverter converter = new FulcrumTypeConverter();
        assertEquals("WAYPOINT", converter.convertToDatabaseColumn(FulcrumType.WAYPOINT));
    }

    @Test
    void converterShouldReadLegacyCorridorValue() {
        FulcrumTypeConverter converter = new FulcrumTypeConverter();
        assertEquals(FulcrumType.WAYPOINT, converter.convertToEntityAttribute("CORRIDOR"));
    }
}

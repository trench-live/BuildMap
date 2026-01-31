package com.buildmap.api.services.navigation;

import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class PathBuilder {

    public static List<Fulcrum> buildPath(Map<Long, Long> previous,
                                          Graph graph, Long endId) {
        List<Fulcrum> path = new ArrayList<>();
        Long current = endId;

        // Восстанавливаем путь от конца к началу
        while (current != null) {
            path.add(0, graph.getNode(current));
            current = previous.get(current);
        }

        return path;
    }

    public static boolean isPathFound(List<Fulcrum> path, Long startId, Long endId) {
        return !path.isEmpty() &&
                path.get(0).getId().equals(startId) &&
                path.get(path.size() - 1).getId().equals(endId);
    }
}
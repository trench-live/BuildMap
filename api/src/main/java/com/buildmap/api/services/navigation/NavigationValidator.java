package com.buildmap.api.services.navigation;

public class NavigationValidator {

    public static void validateRequest(Graph graph, Long startId, Long endId) {
        if (!graph.containsNode(startId)) {
            throw new IllegalArgumentException("Start fulcrum not found: " + startId);
        }
        if (!graph.containsNode(endId)) {
            throw new IllegalArgumentException("End fulcrum not found: " + endId);
        }
        if (startId.equals(endId)) {
            throw new IllegalArgumentException("Start and end fulcrums are the same");
        }
    }
}
package com.buildmap.api.services.navigation;

import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import com.buildmap.api.entities.mapping_area.fulcrum.FulcrumConnection;
import lombok.Getter;

import java.util.*;
import java.util.stream.Collectors;

@Getter
public class Graph {
    private final Map<Long, Fulcrum> nodes;
    private final Map<Long, List<Edge>> adjacencyList;

    public Graph(List<Fulcrum> fulcrums) {
        if (fulcrums == null) {
            throw new IllegalArgumentException("Fulcrums list cannot be null");
        }
        this.nodes = fulcrums.stream()
                .collect(Collectors.toMap(Fulcrum::getId, f -> f));
        this.adjacencyList = buildAdjacencyList(fulcrums);
    }

    private Map<Long, List<Edge>> buildAdjacencyList(List<Fulcrum> fulcrums) {
        Map<Long, List<Edge>> list = new HashMap<>();

        for (Fulcrum fulcrum : fulcrums) {
            if (fulcrum.isDeleted()) continue;

            List<Edge> edges = fulcrum.getConnections().stream()
                    .filter(conn -> {
                        Fulcrum connected = conn.getConnectedFulcrum();
                        return connected != null &&
                                !connected.isDeleted() &&
                                nodes.containsKey(connected.getId());
                    })
                    .map(conn -> toEdge(fulcrum.getId(), conn))
                    .collect(Collectors.toList());

            list.put(fulcrum.getId(), edges);
        }

        return list;
    }

    public boolean containsNode(Long nodeId) {
        return nodes.containsKey(nodeId);
    }

    public Fulcrum getNode(Long nodeId) {
        return nodes.get(nodeId);
    }

    public List<Edge> getEdges(Long nodeId) {
        return adjacencyList.getOrDefault(nodeId, Collections.emptyList());
    }

    private Edge toEdge(Long sourceId, FulcrumConnection connection) {
        Double distanceMeters = connection.getDistanceMeters();
        Double difficultyFactor = connection.getDifficultyFactor();
        if (distanceMeters == null || distanceMeters <= 0) {
            throw new IllegalStateException(
                    "Invalid connection distanceMeters for fulcrum " + sourceId + " -> "
                            + connection.getConnectedFulcrum().getId()
            );
        }
        if (difficultyFactor == null || difficultyFactor < 1) {
            throw new IllegalStateException(
                    "Invalid connection difficultyFactor for fulcrum " + sourceId + " -> "
                            + connection.getConnectedFulcrum().getId()
            );
        }
        return new Edge(
                connection.getConnectedFulcrum().getId(),
                distanceMeters * difficultyFactor,
                distanceMeters,
                difficultyFactor
        );
    }

    public record Edge(Long targetId, Double cost, Double distanceMeters, Double difficultyFactor) {}
}

package com.buildmap.api.services.navigation.dijkstra_algorithm;

import com.buildmap.api.services.navigation.Graph;

import java.util.*;

public class DijkstraAlgorithm {

    public DijkstraResult findShortestPath(Graph graph, Long startId, Long endId) {
        Map<Long, Double> distances = initializeDistances(graph, startId);
        Map<Long, Long> previous = new HashMap<>();
        PriorityQueue<NodeDistance> queue = initializeQueue(startId, distances, graph);

        while (!queue.isEmpty()) {
            NodeDistance current = queue.poll();
            if (current.nodeId().equals(endId)) {
                break;
            }
            processNeighbors(current, graph, distances, previous, queue);
        }

        if (distances.get(endId) == Double.MAX_VALUE) {
            throw new IllegalArgumentException("No path exists from " + startId + " to " + endId);
        }

        return new DijkstraResult(distances, previous);
    }

    private Map<Long, Double> initializeDistances(Graph graph, Long startId) {
        Map<Long, Double> distances = new HashMap<>();
        graph.getNodes().keySet().forEach(nodeId ->
                distances.put(nodeId, Double.MAX_VALUE)
        );
        distances.put(startId, 0.0);
        return distances;
    }

    private PriorityQueue<NodeDistance> initializeQueue(Long startId,
                                                        Map<Long, Double> distances,
                                                        Graph graph) {
        PriorityQueue<NodeDistance> queue = new PriorityQueue<>();
        queue.offer(new NodeDistance(startId, distances.get(startId)));
        return queue;
    }

    private void processNeighbors(NodeDistance current, Graph graph,
                                  Map<Long, Double> distances,
                                  Map<Long, Long> previous,
                                  PriorityQueue<NodeDistance> queue) {
        for (Graph.Edge edge : graph.getEdges(current.nodeId())) {
            double newDistance = distances.get(current.nodeId()) + edge.weight();

            if (newDistance < distances.get(edge.targetId())) {
                distances.put(edge.targetId(), newDistance);
                previous.put(edge.targetId(), current.nodeId());
                queue.offer(new NodeDistance(edge.targetId(), newDistance));
            }
        }
    }

    public record NodeDistance(Long nodeId, Double distance) implements Comparable<NodeDistance> {
        @Override
        public int compareTo(NodeDistance other) {
            return Double.compare(this.distance, other.distance);
        }
    }

    public record DijkstraResult(Map<Long, Double> distances, Map<Long, Long> previous) {}
}
package com.buildmap.api.services.navigation.dijkstra_algorithm;

import com.buildmap.api.entities.mapping_area.fulcrum.Fulcrum;
import com.buildmap.api.services.navigation.Graph;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

class DijkstraAlgorithmTest {

    private final DijkstraAlgorithm algorithm = new DijkstraAlgorithm();

    @Test
    void tc008_findsLowestCostPathThroughIntermediateNode() {
        Graph graph = Mockito.mock(Graph.class);

        when(graph.getNodes()).thenReturn(Map.of(
                1L, fulcrum(1L),
                2L, fulcrum(2L),
                3L, fulcrum(3L)
        ));
        when(graph.getEdges(1L)).thenReturn(List.of(
                new Graph.Edge(2L, 10.0, 10.0, 1.0),
                new Graph.Edge(3L, 2.0, 2.0, 1.0)
        ));
        when(graph.getEdges(3L)).thenReturn(List.of(
                new Graph.Edge(2L, 3.0, 3.0, 1.0)
        ));
        when(graph.getEdges(2L)).thenReturn(List.of());

        DijkstraAlgorithm.DijkstraResult result = algorithm.findShortestPath(graph, 1L, 2L);

        assertEquals(5.0, result.distances().get(2L));
        assertEquals(3L, result.previous().get(2L));
        assertEquals(1L, result.previous().get(3L));
    }

    private Fulcrum fulcrum(Long id) {
        Fulcrum fulcrum = new Fulcrum();
        fulcrum.setId(id);
        return fulcrum;
    }
}
